import sharp from 'sharp';

const ANALYSIS_SIZE = 192;
const MIN_ANALYSIS_PIXELS = 500;

const TARGET_MEDIAN_LUMINANCE = 128;
const MIN_BRIGHTNESS = 0.94;
const MAX_BRIGHTNESS = 1.08;

const MIN_WHITE_BALANCE_GAIN = 0.97;
const MAX_WHITE_BALANCE_GAIN = 1.03;

const MILD_CONTRAST = 1.02;

type ColorAnalysis = {
  brightness: number;
  redGain: number;
  greenGain: number;
  blueGain: number;
  contrast: number;
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function percentile(values: number[], ratio: number): number {
  if (values.length === 0) {
    return TARGET_MEDIAN_LUMINANCE;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.round((sorted.length - 1) * ratio))
  );

  return sorted[index];
}

function isLikelyWhiteBackground(red: number, green: number, blue: number): boolean {
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);

  return minimum >= 235 && maximum - minimum <= 12;
}

function isUsefulWhiteBalancePixel(
  red: number,
  green: number,
  blue: number,
  luminance: number
): boolean {
  if (luminance < 45 || luminance > 225) {
    return false;
  }

  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);

  return maximum - minimum <= 85;
}

async function analyzeColor(input: Buffer): Promise<ColorAnalysis> {
  const { data, info } = await sharp(input)
    .rotate()
    .resize({
      width: ANALYSIS_SIZE,
      height: ANALYSIS_SIZE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const luminanceValues: number[] = [];

  let redTotal = 0;
  let greenTotal = 0;
  let blueTotal = 0;
  let whiteBalancePixelCount = 0;

  for (let index = 0; index < data.length; index += info.channels) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const alpha = data[index + 3];

    if (alpha < 128 || isLikelyWhiteBackground(red, green, blue)) {
      continue;
    }

    const luminance =
      0.2126 * red +
      0.7152 * green +
      0.0722 * blue;

    luminanceValues.push(luminance);

    if (isUsefulWhiteBalancePixel(red, green, blue, luminance)) {
      redTotal += red;
      greenTotal += green;
      blueTotal += blue;
      whiteBalancePixelCount += 1;
    }
  }

  if (luminanceValues.length < MIN_ANALYSIS_PIXELS) {
    return {
      brightness: 1,
      redGain: 1,
      greenGain: 1,
      blueGain: 1,
      contrast: MILD_CONTRAST,
    };
  }

  const medianLuminance = percentile(luminanceValues, 0.5);
  const lowLuminance = percentile(luminanceValues, 0.1);
  const highLuminance = percentile(luminanceValues, 0.9);

  let brightness = 1;

  if (medianLuminance < 116) {
    brightness = clamp(
      TARGET_MEDIAN_LUMINANCE / Math.max(medianLuminance, 1),
      1,
      MAX_BRIGHTNESS
    );
  } else if (medianLuminance > 148) {
    brightness = clamp(
      TARGET_MEDIAN_LUMINANCE / medianLuminance,
      MIN_BRIGHTNESS,
      1
    );
  }

  let redGain = 1;
  let greenGain = 1;
  let blueGain = 1;

  if (whiteBalancePixelCount >= MIN_ANALYSIS_PIXELS / 2) {
    const redAverage = redTotal / whiteBalancePixelCount;
    const greenAverage = greenTotal / whiteBalancePixelCount;
    const blueAverage = blueTotal / whiteBalancePixelCount;
    const neutralAverage = (redAverage + greenAverage + blueAverage) / 3;

    redGain = clamp(
      neutralAverage / Math.max(redAverage, 1),
      MIN_WHITE_BALANCE_GAIN,
      MAX_WHITE_BALANCE_GAIN
    );
    greenGain = clamp(
      neutralAverage / Math.max(greenAverage, 1),
      MIN_WHITE_BALANCE_GAIN,
      MAX_WHITE_BALANCE_GAIN
    );
    blueGain = clamp(
      neutralAverage / Math.max(blueAverage, 1),
      MIN_WHITE_BALANCE_GAIN,
      MAX_WHITE_BALANCE_GAIN
    );
  }

  const dynamicRange = highLuminance - lowLuminance;

  return {
    brightness,
    redGain,
    greenGain,
    blueGain,
    contrast: dynamicRange < 115 ? MILD_CONTRAST : 1,
  };
}

/**
 * Restrained global correction for the Basic plan.
 *
 * It does not change facial geometry, skin texture, sharpness, saturation,
 * or individual facial features. White background pixels are excluded from
 * analysis so they do not distort exposure and white-balance decisions.
 */
export async function applyBasicColorEngine(input: Buffer): Promise<Buffer> {
  const analysis = await analyzeColor(input);
  const contrastOffset = 128 * (1 - analysis.contrast);

  return sharp(input)
    .rotate()
    .modulate({ brightness: analysis.brightness })
    .recomb([
      [analysis.redGain, 0, 0],
      [0, analysis.greenGain, 0],
      [0, 0, analysis.blueGain],
    ])
    .linear(analysis.contrast, contrastOffset)
    .toBuffer();
}
