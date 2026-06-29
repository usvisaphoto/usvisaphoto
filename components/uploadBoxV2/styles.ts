export const uploadBoxStyles = String.raw`
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;background:#f8fafc;font-family:system-ui}
.wrap{width:100%;height:100%;padding:0}
.upload-zone{
  position:relative;width:100%;height:320px;border:2px dashed #bfdbfe;border-radius:16px;
  background:#f8fafc;overflow:hidden;display:flex;align-items:center;justify-content:center;cursor:pointer;
}
.upload-zone input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;z-index:5}
.upload-zone input.disabled-upload{
  pointer-events:none;
  z-index:0;
}
.upload-zone input.disabled-upload{pointer-events:none}
.placeholder{text-align:center;color:#475569;pointer-events:none}
.icon{width:80px;height:80px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 12px}
.placeholder p{font-size:14px;font-weight:700}
.placeholder small{display:block;margin-top:4px;font-size:12px;color:#94a3b8}
#preview-img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:none;background:#f8fafc;z-index:2}

.guide-line{
  position:absolute;
  left:0;
  right:0;

  height:2px;

  display:none;
  z-index:50;

  cursor:ns-resize;
  touch-action:none;
}
.guide-line::before{
  content:'';
  position:absolute;
  left:0;
  right:0;
  top:-12px;
  bottom:-12px;
}

.guide-line span{position:absolute;left:8px;top:-18px;font-size:11px;font-weight:800;padding:2px 7px;border-radius:999px;color:white; pointer-events:none;}
#crown-line{top:80px;background:#ef4444}
#crown-line span{background:#ef4444}
#chin-line{top:210px;background:#2563eb}
#chin-line span{background:#2563eb}
.actions{display:flex;gap:8px;margin-top:12px}
button{flex:1;border:0;border-radius:14px;padding:13px 10px;font-size:14px;font-weight:800;cursor:pointer}
#detect-btn{background:#0f766e;color:white}
#create-btn{background:#1e3a8a;color:white}
#download-btn{width:100%;margin-top:8px;background:#eff6ff;color:#1e3a8a;border:1px solid #bfdbfe;display:none}
#result-canvas{display:none;width:100%;height:auto;max-height:360px;object-fit:contain;border-radius:16px;background:white;border:1px solid #dbeafe}
.new-photo-btn{
  width:100%;
  margin-top:8px;
  background:#f8fafc;
  color:#1e3a8a;
  border:1px solid #bfdbfe;
}
.status{font-size:12px;color:#64748b;text-align:center;margin-top:8px;min-height:18px;line-height:1.5}
.notice{
  margin-top:10px;
  padding:10px;
  border-radius:12px;
  background:#eff6ff;
  color:#1e3a8a;
  font-size:11px;
  line-height:1.5;
  text-align:left;
}
.notice a{
    color:#1d4ed8;
    font-weight:800;
    text-decoration:underline;
}

/* ===== Result Panel ===== */

.result-panel{
    display:none;
    margin-top:16px;
    padding:14px;
    border:1px solid #bfdbfe;
    border-radius:18px;
    background:#eff6ff;
}

.result-title{
    font-weight:800;
    color:#0b2a6f;
    font-size:15px;
    margin-bottom:4px;
}

.result-subtitle{
    font-size:12px;
    color:#475569;
    margin-bottom:12px;
}

.result-canvas-wrap{
    width:100%;
    border-radius:16px;
    overflow:hidden;
    background:#fff;
}

.result-help{
    margin-top:12px;
    font-size:12px;
    color:#475569;
}

.result-help a{
    color:#2563eb;
    font-weight:700;
}

/* ===== Validation Card ===== */

.validation-card{
  display:none;
  margin-top:14px;
  margin-bottom:14px;
  padding:14px;
  border-radius:16px;
  background:#ecfdf5;
  border:1px solid #86efac;
  color:#064e3b;
  text-align:left;
  font-size:12px;
  line-height:1.7;
}

.validation-title{
  font-size:14px;
  font-weight:800;
  margin-bottom:8px;
  color:#065f46;
}

.validation-row{
  padding:3px 0;
}

.validation-final{
  margin-top:10px;
  padding-top:10px;
  border-top:1px solid #bbf7d0;
  font-weight:800;
}

.validation-error{
  background:#fef2f2;
  border-color:#fecaca;
  color:#7f1d1d;
}

.validation-warning{
  background:#fffbeb;
  border-color:#fde68a;
  color:#78350f;
}

`;
