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
#download-btn{
  width:100%;
  margin-top:12px;
  min-height:58px;
  background:linear-gradient(135deg,#16a34a,#15803d);
  color:#ffffff;
  border:0;
  border-radius:16px;
  display:none;
  font-size:16px;
  font-weight:900;
  box-shadow:0 12px 24px rgba(22,163,74,0.28); 
}
#result-canvas{
  display:none;
  position:relative;
  z-index:1;
  width:100%;
  height:auto;
  max-height:600px;
  object-fit:contain;
  border-radius:16px;
  background:white;
  border:1px solid #dbeafe;
}


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
  padding:14px 14px 44px;
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
  position:relative;
  width:100%;
  max-width:600px;
  margin:0 auto;
  border-radius:16px;
  overflow:hidden;
  background:#fff;
}
#overlay-canvas{
  display:none;
  position:absolute;
  inset:0;
  z-index:20;
  width:100%;
  height:100%;
  border-radius:16px;
  pointer-events:none;
}

.result-badge{

    position:absolute;

    top:14px;

    left:14px;

    z-index:100;

    padding:10px 14px;

    border-radius:14px;

    background:rgba(15,118,110,.94);

    color:white;

    box-shadow:0 10px 28px rgba(0,0,0,.18);

    backdrop-filter:blur(8px);

}

.badge-title{

    font-size:13px;

    font-weight:800;

}

.badge-subtitle{

    margin-top:2px;

    font-size:11px;

    opacity:.92;

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


.photo-options{
  display:flex;
  flex-direction:column;
  gap:10px;
  margin-top:10px;
}

.photo-option{
  position:relative;
  display:flex;
  align-items:flex-start;
  gap:10px;
  width:100%;
  padding:13px 12px;
  border:1px solid #c9d8f1;
  border-radius:14px;
  background:#ffffff;
  cursor:pointer;
  transition:
    border-color .18s ease,
    background .18s ease,
    box-shadow .18s ease,
    transform .18s ease;
}

.photo-option:hover{
  border-color:#7fa7ea;
  background:#f8fbff;
  transform:translateY(-1px);
}

.photo-option:has(input:checked){
  border:2px solid #1d5fd1;
  padding:12px 11px;
  background:linear-gradient(145deg,#f6faff 0%,#eaf2ff 100%);
  box-shadow:0 8px 20px rgba(29,95,209,.14);
}

.photo-option input{
  flex:0 0 auto;
  width:17px;
  height:17px;
  margin:2px 0 0;
  accent-color:#1d5fd1;
  cursor:pointer;
}

.photo-option-content{
  display:flex;
  flex-direction:column;
  gap:4px;
  min-width:0;
}

.photo-option-content strong{
  color:#102d63;
  font-size:13px;
  line-height:1.35;
  font-weight:900;
}

.photo-option-content small{
  color:#64748b;
  font-size:11px;
  line-height:1.35;
  font-weight:600;
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
.detect-auto{
    background:#1d4ed8 !important;
    color:#fff !important;
}


.detect-success{
    background:#10b981 !important;
    color:#fff !important;
}

.detect-manual{
    background:#f59e0b !important;
    color:#fff !important;
}

.temp-download-btn{
  width:100%;
  margin-top:8px;
  padding:10px;
  border-radius:12px;
  border:1px dashed #64748b;
  background:#f8fafc;
  color:#334155;
  font-weight:800;
  cursor:pointer;
}

/* ===== Professional Retouch ===== */ 

.professional-retouch-card{
  display:none;  
  margin-top:14px;
  padding:16px;
  border-radius:18px;
  background:linear-gradient(180deg,#fffdf4 0%,#fff7d6 100%);
  border:1px solid #f5c542;
  box-shadow:0 10px 24px rgba(180,130,20,.18);
  color:#1f2937;
}

.professional-title{
  font-size:17px;
  font-weight:900;
  color:#92400e;
  margin-bottom:6px;
}

.professional-subtitle{
  font-size:12px;
  line-height:1.5;
  color:#78350f;
  margin-bottom:10px;
}

.professional-features{
  font-size:12px;
  line-height:1.7;
  color:#374151;
  margin-bottom:12px;
}

.professional-retouch-btn{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  width:100%;
  min-height:64px;
  margin-top:16px;
  padding:12px 14px;
  border:0;
  border-radius:14px;
  background:linear-gradient(135deg,#f59e0b 0%,#f97316 100%);
  color:#ffffff;
  box-shadow:0 10px 22px rgba(245,158,11,.25);
  cursor:pointer;
}

.professional-preview-button-title{
  display:block;
  font-size:14px;
  line-height:1.25;
  font-weight:900;
}

.professional-preview-button-note{
  display:block;
  margin-top:4px;
  font-size:10px;
  line-height:1.3;
  font-weight:700;
  opacity:.9;
}

.professional-retouch-btn:hover{
  background:linear-gradient(135deg,#e58b08 0%,#e76412 100%);
  transform:translateY(-1px);
}

.professional-retouch-btn:disabled{
  opacity:.65;
  cursor:not-allowed;
}

/* ===== AI Retouch Preview ===== */

.retouch-preview{
  display:none;
  margin-top:16px;
  padding:12px;
  border-radius:16px;
  border:1px solid #facc15;
  background:#fffdf5;
}

.retouch-title{
  font-size:15px;
  font-weight:800;
  margin-bottom:10px;
  color:#92400e;
}

#retouch-image{
  display:block;
  width:100%;
  max-width:100%;
  height:auto;
  margin:0 auto;
  border-radius:16px;
  border:1px solid #dbeafe;
  background:white;
  object-fit:contain;
  user-select:none;
  -webkit-user-drag:none;
}

#premium-create-btn{
  width:100%;
  background:#f59e0b;
  color:#fff;
  border:0;
  border-radius:12px;
  padding:14px;
  font-size:15px;
  font-weight:800;
  cursor:pointer;
}

#premium-create-btn:hover{
  background:#d97706;
}

.expert-manual-card{
  display:none;
  position:relative;
  margin-top:20px;
  margin-bottom:12px;
  padding:20px 18px 22px;
  border:1px solid #e5c16f;
  border-radius:20px;
  background:
    linear-gradient(180deg,#fffef9 0%,#fff7e8 100%);
  box-shadow:
    0 16px 34px rgba(126,88,20,.16),
    inset 0 1px 0 rgba(255,255,255,.95);
  color:#38270e;
  overflow:hidden;
}

.expert-manual-card::before{
  content:"";
  position:absolute;
  top:-55px;
  right:-45px;
  width:145px;
  height:145px;
  border-radius:50%;
  background:rgba(213,166,57,.10);
  pointer-events:none;
}

.expert-service-badge{
  position:relative;
  display:inline-flex;
  align-items:center;
  margin-bottom:12px;
  padding:6px 10px;
  border:1px solid #e5c16f;
  border-radius:999px;
  background:#fff4cf;
  color:#8a5a00;
  font-size:9px;
  line-height:1;
  font-weight:900;
  letter-spacing:.8px;
}

.expert-title{
  position:relative;
  margin:0 0 9px;
  color:#5a3900;
  font-size:19px;
  line-height:1.3;
  font-weight:900;
  letter-spacing:-.3px;
}

.expert-subtitle{
  position:relative;
  margin:0;
  color:#66543a;
  font-size:12px;
  line-height:1.6;
  font-weight:700;
}

.expert-highlight{
  position:relative;
  margin-top:13px;
  padding:12px;
  border:1px solid #ecd9a8;
  border-radius:13px;
  background:rgba(255,255,255,.76);
  color:#604d30;
  font-size:11px;
  line-height:1.55;
  font-weight:700;
}

.expert-features{
  position:relative;
  display:flex;
  flex-direction:column;
  gap:8px;
  margin-top:16px;
  color:#4e3c22;
  font-size:11px;
  line-height:1.45;
}

#expert-edit-btn{
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  width:100%;
  min-height:72px;
  margin-top:18px;
  padding:14px 12px 16px;
  border:0;
  border-radius:15px;
  background:
    linear-gradient(135deg,#103f9b 0%,#1769e8 100%);
  color:#fff;
  box-shadow:
    0 12px 24px rgba(23,83,190,.30);
  cursor:pointer;
  overflow:visible;
}

.expert-button-title{
  display:block;
  font-size:15px;
  line-height:1.2;
  font-weight:900;
}

.expert-button-price{
  display:block;
  margin-top:4px;
  font-size:18px;
  line-height:1.1;
  font-weight:900;
}

#expert-edit-btn:hover{
  background:
    linear-gradient(135deg,#0c3485 0%,#105cd3 100%);
  transform:translateY(-1px);
}

#expert-edit-btn:disabled{
  opacity:.65;
  cursor:not-allowed;
  transform:none;
}

`;