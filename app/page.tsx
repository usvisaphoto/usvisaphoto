"use client";

import { useState } from "react";

export default function Page() {
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("아직 선택 안 됨");

  return (
    <main style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>Upload Test</h1>
<button
  onClick={() => {
    alert("버튼 클릭됨");
    setName("버튼은 작동함");
  }}
  style={{
    display: "block",
    margin: "20px 0",
    padding: "12px 20px",
    background: "black",
    color: "white",
    borderRadius: 8,
  }}
>
  React Button Test
</button>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (!file) return;

          setName(file.name);
          setPreview(URL.createObjectURL(file));
        }}
      />

      <p style={{ marginTop: 20 }}>선택한 파일: {name}</p>

      {preview && (
        <img
          src={preview}
          alt="preview"
          style={{
            marginTop: 20,
            width: "100%",
            maxWidth: 400,
            border: "3px solid red",
            borderRadius: 12,
          }}
        />
      )}
    </main>
  );
}
