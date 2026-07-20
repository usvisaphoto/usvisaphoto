"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type DeliveryMethod = "email" | "whatsapp";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export default function ExpertOrderPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paypalOrderId, setPaypalOrderId] = useState("");
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("email");

  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [instructions, setInstructions] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const orderId =
      params.get("orderId") ||
      params.get("paypalOrderId") ||
      params.get("paypal_order_id") ||
      "";

    setPaypalOrderId(orderId);
  }, []);

  useEffect(() => {
    if (!photoFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [photoFile]);

  const contactValue = useMemo(() => {
    return deliveryMethod === "email" ? email.trim() : whatsapp.trim();
  }, [deliveryMethod, email, whatsapp]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    setErrorMessage("");
    setSuccessMessage("");

    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setPhotoFile(null);
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type.toLowerCase())) {
      setPhotoFile(null);
      event.target.value = "";
      setErrorMessage(
        "Please upload a JPG, JPEG, PNG, or WEBP image."
      );
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setPhotoFile(null);
      event.target.value = "";
      setErrorMessage("The image must be 15 MB or smaller.");
      return;
    }

    setPhotoFile(selectedFile);
  }

  function removePhoto() {
    setPhotoFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function validateForm() {
    if (!paypalOrderId) {
      return "We could not verify the PayPal order. Please return to the payment page and try again.";
    }

    if (!photoFile) {
      return "Please upload the photo you want professionally edited.";
    }

    if (!customerName.trim()) {
      return "Please enter your name.";
    }

    if (deliveryMethod === "email") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email.trim())) {
        return "Please enter a valid email address.";
      }
    }

    if (deliveryMethod === "whatsapp") {
      const cleanedNumber = whatsapp.replace(/[^\d+]/g, "");

      if (cleanedNumber.length < 8) {
        return "Please enter a valid WhatsApp number, including the country code.";
      }
    }

    if (!agreed) {
      return "Please confirm the Expert Manual Editing terms.";
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!photoFile) {
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      formData.append("paypalOrderId", paypalOrderId);
      formData.append("customerName", customerName.trim());
      formData.append("deliveryMethod", deliveryMethod);
      formData.append("contactValue", contactValue);
      formData.append("email", email.trim());
      formData.append("whatsapp", whatsapp.trim());
      formData.append("instructions", instructions.trim());
      formData.append("photo", photoFile);

      const response = await fetch("/api/expert-order", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "We could not submit your Expert Manual Editing order."
        );
      }

      setSuccessMessage(
        "Your Expert Manual Editing order has been submitted successfully."
      );
    } catch (error) {
      console.error("Expert order submission failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while submitting your order."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />

      <section style={styles.container}>
        <header style={styles.header}>
          <a href="/" style={styles.brandLink}>
            <span style={styles.logoMark}>US</span>

            <span style={styles.brandName}>
              USVisa<span style={styles.brandAccent}>Photo</span>
            </span>
          </a>

          <div style={styles.secureBadge}>
            <span aria-hidden="true">🔒</span>
            Secure Expert Order
          </div>
        </header>

        <div style={styles.intro}>
          <div style={styles.eyebrow}>EXPERT MANUAL EDITING</div>

          <h1 style={styles.title}>
            Submit Your Photo for
            <span style={styles.titleAccent}> Expert Editing</span>
          </h1>

          <p style={styles.description}>
            A photo specialist will manually review and edit your image
            according to U.S. visa and passport photo standards.
          </p>
        </div>

        <div style={styles.contentGrid}>
          <form onSubmit={handleSubmit} style={styles.formCard}>
            <div style={styles.section}>
              <div style={styles.sectionHeading}>
                <span style={styles.stepNumber}>1</span>

                <div>
                  <h2 style={styles.sectionTitle}>Upload your photo</h2>

                  <p style={styles.sectionDescription}>
                    Upload the original, highest-quality image available.
                  </p>
                </div>
              </div>

              {!previewUrl ? (
                <button
                  type="button"
                  style={styles.uploadBox}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span style={styles.uploadIcon}>＋</span>
                  <strong style={styles.uploadTitle}>
                    Choose your original photo
                  </strong>
                  <span style={styles.uploadDescription}>
                    JPG, PNG or WEBP · Maximum 15 MB
                  </span>
                </button>
              ) : (
                <div style={styles.previewBox}>
                  <img
                    src={previewUrl}
                    alt="Selected expert editing photo"
                    style={styles.previewImage}
                  />

                  <div style={styles.previewActions}>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Replace Photo
                    </button>

                    <button
                      type="button"
                      style={styles.removeButton}
                      onClick={removePhoto}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
            </div>

            <div style={styles.divider} />

            <div style={styles.section}>
              <div style={styles.sectionHeading}>
                <span style={styles.stepNumber}>2</span>

                <div>
                  <h2 style={styles.sectionTitle}>Delivery information</h2>

                  <p style={styles.sectionDescription}>
                    Choose how you want to receive the completed photo.
                  </p>
                </div>
              </div>

              <label style={styles.fieldLabel}>
                Your name
                <input
                  type="text"
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  style={styles.input}
                />
              </label>

              <div>
                <div style={styles.fieldTitle}>Delivery method</div>

                <div style={styles.deliveryGrid}>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("email")}
                    style={{
                      ...styles.deliveryOption,
                      ...(deliveryMethod === "email"
                        ? styles.deliveryOptionActive
                        : {}),
                    }}
                  >
                    <span style={styles.deliveryIcon}>✉</span>

                    <span>
                      <strong style={styles.deliveryTitle}>Email</strong>
                      <small style={styles.deliverySubtitle}>
                        Receive your completed photo by email
                      </small>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("whatsapp")}
                    style={{
                      ...styles.deliveryOption,
                      ...(deliveryMethod === "whatsapp"
                        ? styles.deliveryOptionActive
                        : {}),
                    }}
                  >
                    <span style={styles.deliveryIcon}>◉</span>

                    <span>
                      <strong style={styles.deliveryTitle}>WhatsApp</strong>
                      <small style={styles.deliverySubtitle}>
                        Receive your completed photo in WhatsApp
                      </small>
                    </span>
                  </button>
                </div>
              </div>

              {deliveryMethod === "email" ? (
                <label style={styles.fieldLabel}>
                  Email address
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    style={styles.input}
                  />
                </label>
              ) : (
                <label style={styles.fieldLabel}>
                  WhatsApp number
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(event) =>
                      setWhatsapp(event.target.value)
                    }
                    placeholder="+1 555 123 4567"
                    autoComplete="tel"
                    style={styles.input}
                  />

                  <span style={styles.fieldHint}>
                    Include your country code, such as +1 or +82.
                  </span>
                </label>
              )}
            </div>

            <div style={styles.divider} />

            <div style={styles.section}>
              <div style={styles.sectionHeading}>
                <span style={styles.stepNumber}>3</span>

                <div>
                  <h2 style={styles.sectionTitle}>Editing notes</h2>

                  <p style={styles.sectionDescription}>
                    Add any special request for the photo specialist.
                  </p>
                </div>
              </div>

              <label style={styles.fieldLabel}>
                Special instructions
                <textarea
                  value={instructions}
                  onChange={(event) =>
                    setInstructions(event.target.value)
                  }
                  placeholder="Example: Please keep my natural facial features and skin texture. Remove only stray hair and correct the background."
                  rows={5}
                  maxLength={1000}
                  style={styles.textarea}
                />

                <span style={styles.characterCount}>
                  {instructions.length}/1000
                </span>
              </label>
            </div>

            <label style={styles.agreementRow}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                style={styles.checkbox}
              />

              <span>
                I confirm that the uploaded image belongs to me or that I
                have permission to submit it. I understand that this is a
                manual editing service.
              </span>
            </label>

            {paypalOrderId && (
              <div style={styles.orderReference}>
                PayPal order verified
                <span style={styles.orderId}>
                  {paypalOrderId.slice(0, 8)}…
                </span>
              </div>
            )}

            {errorMessage && (
              <div role="alert" style={styles.errorBox}>
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div role="status" style={styles.successBox}>
                <strong>Order received</strong>
                <span>{successMessage}</span>
                <span>
                  Your completed photo will be delivered through{" "}
                  {deliveryMethod === "email" ? "email" : "WhatsApp"}.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || Boolean(successMessage)}
              style={{
                ...styles.submitButton,
                ...(isSubmitting || successMessage
                  ? styles.submitButtonDisabled
                  : {}),
              }}
            >
              {isSubmitting
                ? "Submitting Expert Order..."
                : successMessage
                  ? "Expert Order Submitted"
                  : "Submit Expert Order"}
            </button>

            <p style={styles.supportText}>
              Need assistance? Contact{" "}
              <a
                href="mailto:usvisaphoto1@gmail.com"
                style={styles.supportLink}
              >
                usvisaphoto1@gmail.com
              </a>
            </p>
          </form>

          <aside style={styles.summaryCard}>
            <div style={styles.summaryBadge}>PAID SERVICE</div>

            <h2 style={styles.summaryTitle}>
              Expert Manual Editing
            </h2>

            <div style={styles.priceRow}>
              <span style={styles.currency}>$</span>
              <span style={styles.price}>19.99</span>
            </div>

            <p style={styles.summaryDescription}>
              Your image is reviewed and edited manually by a photo
              specialist.
            </p>

            <div style={styles.summaryDivider} />

            <ul style={styles.featureList}>
              <li style={styles.featureItem}>
                <span style={styles.check}>✓</span>
                Manual photo inspection
              </li>

              <li style={styles.featureItem}>
                <span style={styles.check}>✓</span>
                Facial alignment and positioning
              </li>

              <li style={styles.featureItem}>
                <span style={styles.check}>✓</span>
                Professional background correction
              </li>

              <li style={styles.featureItem}>
                <span style={styles.check}>✓</span>
                Natural lighting and exposure correction
              </li>

              <li style={styles.featureItem}>
                <span style={styles.check}>✓</span>
                Delivery by email or WhatsApp
              </li>
            </ul>

            <div style={styles.noticeBox}>
              <strong style={styles.noticeTitle}>
                Natural appearance protected
              </strong>

              <p style={styles.noticeText}>
                Facial identity and natural skin texture are preserved.
                The service does not redesign or replace your face.
              </p>
            </div>
          </aside>
        </div>

        <footer style={styles.footer}>
          © {new Date().getFullYear()} USVisaPhoto. Secure photo
          processing.
        </footer>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
    background:
      "linear-gradient(180deg, #f7faff 0%, #eef5ff 55%, #ffffff 100%)",
    color: "#10233f",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  backgroundGlowOne: {
    position: "absolute",
    top: "-180px",
    right: "-100px",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "rgba(35, 112, 255, 0.12)",
    filter: "blur(30px)",
    pointerEvents: "none",
  },

  backgroundGlowTwo: {
    position: "absolute",
    bottom: "-250px",
    left: "-150px",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "rgba(93, 157, 255, 0.1)",
    filter: "blur(40px)",
    pointerEvents: "none",
  },

  container: {
    position: "relative",
    zIndex: 1,
    width: "min(1180px, calc(100% - 32px))",
    margin: "0 auto",
    paddingBottom: "40px",
  },

  header: {
    minHeight: "82px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    borderBottom: "1px solid rgba(36, 88, 160, 0.12)",
  },

  brandLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "11px",
    color: "#10233f",
    textDecoration: "none",
  },

  logoMark: {
    display: "grid",
    placeItems: "center",
    width: "43px",
    height: "43px",
    borderRadius: "13px",
    color: "#ffffff",
    background: "linear-gradient(145deg, #0b4fc6, #1974ff)",
    boxShadow: "0 9px 22px rgba(14, 90, 220, 0.25)",
    fontWeight: 900,
    fontSize: "15px",
    letterSpacing: "-0.5px",
  },

  brandName: {
    fontSize: "21px",
    fontWeight: 850,
    letterSpacing: "-0.7px",
  },

  brandAccent: {
    color: "#1667e8",
  },

  secureBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 13px",
    border: "1px solid #d7e4f8",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.8)",
    color: "#44617f",
    fontSize: "12px",
    fontWeight: 700,
  },

  intro: {
    maxWidth: "760px",
    margin: "58px auto 38px",
    textAlign: "center",
  },

  eyebrow: {
    display: "inline-flex",
    padding: "7px 12px",
    border: "1px solid #cddffd",
    borderRadius: "999px",
    background: "#edf4ff",
    color: "#155fcf",
    fontSize: "11px",
    fontWeight: 850,
    letterSpacing: "1.3px",
  },

  title: {
    margin: "18px 0 12px",
    fontSize: "clamp(34px, 5vw, 54px)",
    lineHeight: 1.08,
    letterSpacing: "-2.2px",
    color: "#10233f",
  },

  titleAccent: {
    color: "#1769e8",
  },

  description: {
    maxWidth: "660px",
    margin: "0 auto",
    color: "#61738b",
    fontSize: "16px",
    lineHeight: 1.7,
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 330px",
    gap: "24px",
    alignItems: "start",
  },

  formCard: {
    padding: "clamp(22px, 4vw, 38px)",
    border: "1px solid #dce7f6",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.96)",
    boxShadow: "0 24px 70px rgba(34, 77, 132, 0.12)",
  },

  section: {
    display: "grid",
    gap: "20px",
  },

  sectionHeading: {
    display: "flex",
    alignItems: "flex-start",
    gap: "13px",
  },

  stepNumber: {
    flex: "0 0 auto",
    display: "grid",
    placeItems: "center",
    width: "31px",
    height: "31px",
    borderRadius: "10px",
    background: "#1267e8",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 850,
    boxShadow: "0 7px 16px rgba(18, 103, 232, 0.23)",
  },

  sectionTitle: {
    margin: 0,
    color: "#172d49",
    fontSize: "19px",
    letterSpacing: "-0.35px",
  },

  sectionDescription: {
    margin: "5px 0 0",
    color: "#73849a",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  uploadBox: {
    width: "100%",
    minHeight: "210px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    border: "2px dashed #b9cff1",
    borderRadius: "18px",
    background: "#f8fbff",
    color: "#17385f",
    cursor: "pointer",
  },

  uploadIcon: {
    display: "grid",
    placeItems: "center",
    width: "48px",
    height: "48px",
    marginBottom: "3px",
    borderRadius: "15px",
    background: "#e4efff",
    color: "#1267e8",
    fontSize: "27px",
    fontWeight: 300,
  },

  uploadTitle: {
    fontSize: "15px",
  },

  uploadDescription: {
    color: "#7589a4",
    fontSize: "12px",
  },

  previewBox: {
    padding: "14px",
    border: "1px solid #d9e5f4",
    borderRadius: "18px",
    background: "#f7faff",
  },

  previewImage: {
    display: "block",
    width: "100%",
    maxHeight: "430px",
    objectFit: "contain",
    borderRadius: "13px",
    background: "#eaf0f7",
  },

  previewActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "9px",
    marginTop: "12px",
  },

  secondaryButton: {
    padding: "10px 14px",
    border: "1px solid #bcd0ea",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#24527f",
    fontWeight: 750,
    cursor: "pointer",
  },

  removeButton: {
    padding: "10px 14px",
    border: "1px solid #f2c6cc",
    borderRadius: "10px",
    background: "#fff7f8",
    color: "#b73545",
    fontWeight: 750,
    cursor: "pointer",
  },

  divider: {
    height: "1px",
    margin: "31px 0",
    background: "#e4ebf4",
  },

  fieldLabel: {
    position: "relative",
    display: "grid",
    gap: "8px",
    color: "#334d6b",
    fontSize: "13px",
    fontWeight: 750,
  },

  fieldTitle: {
    marginBottom: "9px",
    color: "#334d6b",
    fontSize: "13px",
    fontWeight: 750,
  },

  input: {
    width: "100%",
    minHeight: "48px",
    boxSizing: "border-box",
    padding: "0 14px",
    border: "1px solid #ccd9e9",
    borderRadius: "12px",
    outline: "none",
    background: "#ffffff",
    color: "#142b47",
    fontSize: "15px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    padding: "13px 14px 30px",
    border: "1px solid #ccd9e9",
    borderRadius: "12px",
    outline: "none",
    background: "#ffffff",
    color: "#142b47",
    fontFamily: "inherit",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  characterCount: {
    position: "absolute",
    right: "11px",
    bottom: "10px",
    color: "#8a99ac",
    fontSize: "11px",
    fontWeight: 500,
  },

  fieldHint: {
    color: "#788aa0",
    fontSize: "11px",
    fontWeight: 500,
  },

  deliveryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "11px",
  },

  deliveryOption: {
    minHeight: "92px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    border: "1px solid #d1deec",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#294667",
    textAlign: "left",
    cursor: "pointer",
  },

  deliveryOptionActive: {
    border: "2px solid #1769e8",
    background: "#f2f7ff",
    boxShadow: "0 8px 20px rgba(23, 105, 232, 0.1)",
  },

  deliveryIcon: {
    flex: "0 0 auto",
    display: "grid",
    placeItems: "center",
    width: "37px",
    height: "37px",
    borderRadius: "11px",
    background: "#e7f0ff",
    color: "#1769e8",
    fontSize: "19px",
    fontWeight: 800,
  },

  deliveryTitle: {
    display: "block",
    marginBottom: "4px",
    fontSize: "14px",
  },

  deliverySubtitle: {
    display: "block",
    color: "#74879d",
    fontSize: "10px",
    lineHeight: 1.45,
  },

  agreementRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    marginTop: "28px",
    padding: "14px",
    borderRadius: "13px",
    background: "#f5f8fc",
    color: "#5e7189",
    fontSize: "11px",
    lineHeight: 1.55,
    cursor: "pointer",
  },

  checkbox: {
    flex: "0 0 auto",
    width: "17px",
    height: "17px",
    marginTop: "1px",
    accentColor: "#1468e8",
  },

  orderReference: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "15px",
    padding: "11px 13px",
    border: "1px solid #d6e4f6",
    borderRadius: "11px",
    background: "#f8fbff",
    color: "#54708f",
    fontSize: "11px",
    fontWeight: 700,
  },

  orderId: {
    color: "#1d5ba5",
    fontFamily: "monospace",
  },

  errorBox: {
    marginTop: "15px",
    padding: "13px 14px",
    border: "1px solid #f0c4ca",
    borderRadius: "12px",
    background: "#fff5f6",
    color: "#b22e40",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  successBox: {
    display: "grid",
    gap: "5px",
    marginTop: "15px",
    padding: "15px",
    border: "1px solid #bfe3ce",
    borderRadius: "12px",
    background: "#f1fbf5",
    color: "#267047",
    fontSize: "13px",
    lineHeight: 1.45,
  },

  submitButton: {
    width: "100%",
    minHeight: "55px",
    marginTop: "18px",
    border: 0,
    borderRadius: "14px",
    background: "linear-gradient(135deg, #0c57ce, #1976ff)",
    color: "#ffffff",
    boxShadow: "0 13px 28px rgba(18, 103, 232, 0.28)",
    fontSize: "15px",
    fontWeight: 850,
    cursor: "pointer",
  },

  submitButtonDisabled: {
    opacity: 0.62,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  supportText: {
    margin: "14px 0 0",
    color: "#7d8da1",
    fontSize: "11px",
    textAlign: "center",
  },

  supportLink: {
    color: "#1769e8",
    fontWeight: 750,
    textDecoration: "none",
  },

  summaryCard: {
    position: "sticky",
    top: "24px",
    padding: "28px",
    border: "1px solid #cfe0f6",
    borderRadius: "24px",
    background:
      "linear-gradient(160deg, rgba(255,255,255,0.98), rgba(240,247,255,0.98))",
    boxShadow: "0 24px 65px rgba(34, 77, 132, 0.12)",
  },

  summaryBadge: {
    display: "inline-flex",
    padding: "6px 9px",
    borderRadius: "999px",
    background: "#e7f0ff",
    color: "#1764d8",
    fontSize: "10px",
    fontWeight: 850,
    letterSpacing: "0.9px",
  },

  summaryTitle: {
    margin: "15px 0 9px",
    color: "#17314f",
    fontSize: "25px",
    lineHeight: 1.15,
    letterSpacing: "-0.8px",
  },

  priceRow: {
    display: "flex",
    alignItems: "flex-start",
    color: "#0e5fd8",
  },

  currency: {
    paddingTop: "8px",
    fontSize: "19px",
    fontWeight: 850,
  },

  price: {
    fontSize: "47px",
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: "-2px",
  },

  summaryDescription: {
    margin: "13px 0 0",
    color: "#667b94",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  summaryDivider: {
    height: "1px",
    margin: "22px 0",
    background: "#dce7f4",
  },

  featureList: {
    display: "grid",
    gap: "14px",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },

  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    color: "#425c78",
    fontSize: "12px",
    lineHeight: 1.45,
  },

  check: {
    flex: "0 0 auto",
    display: "grid",
    placeItems: "center",
    width: "19px",
    height: "19px",
    borderRadius: "50%",
    background: "#dff5e8",
    color: "#238451",
    fontSize: "11px",
    fontWeight: 900,
  },

  noticeBox: {
    marginTop: "24px",
    padding: "15px",
    border: "1px solid #d4e3f7",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.8)",
  },

  noticeTitle: {
    color: "#274d78",
    fontSize: "12px",
  },

  noticeText: {
    margin: "6px 0 0",
    color: "#71849b",
    fontSize: "11px",
    lineHeight: 1.55,
  },

  footer: {
    padding: "34px 0 10px",
    color: "#8997a8",
    fontSize: "11px",
    textAlign: "center",
  },
};