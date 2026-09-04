"use client";

import { useState, useEffect, useRef } from "react";

const HANDLERS = ["Iris", "Esther"];

export default function MaintenanceModal({ school, onClose }) {
  if (!school) return null;
  const schoolName = school["行政區合併學校名稱"];
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [file, setFile] = useState(null);
  const [handler, setHandler] = useState("Iris");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !date || !handler) {
      setStatus({ type: "error", message: "請填寫所有欄位" });
      return;
    }

    if (!isAuthorized) {
      setStatus({ type: "error", message: "請先授權" });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("schoolName", schoolName);
      formData.append("date", date);
      formData.append("handler", handler);

      const response = await fetch("/api/maintenance-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "UNAUTHORIZED") {
          setIsAuthorized(false);
          setStatus({
            type: "error",
            message: "授權已過期，請重新授權",
          });
        } else {
          setStatus({ type: "error", message: data.error || "上傳失敗" });
        }
        return;
      }

      setStatus({
        type: "success",
        message: `✓ 上傳成功！檔案：${data.filename}`,
      });
      setFile(null);
      setDate(new Date().toISOString().split("T")[0]);

      setTimeout(() => {
        onClose();
        setStatus(null);
      }, 1500);
    } catch (error) {
      console.error("Upload error:", error);
      setStatus({ type: "error", message: "上傳失敗，請重試" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      {/* 背景遮罩 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      {/* Modal 卡片 */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(to bottom, #ffffff 0%, #f8f9ff 100%)",
          borderRadius: 16,
          boxShadow:
            "0 20px 60px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
          padding: 32,
          width: 400,
          maxWidth: "90vw",
          border: "1px solid rgba(99, 102, 241, 0.1)",
        }}
      >
        {/* 標題 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            📸 維護紀錄
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            ✕
          </button>
        </div>

        {/* 表單 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 學校名稱（唯讀） */}
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>
              學校名稱
            </label>
            <div
              style={{
                padding: "10px 12px",
                background: "#f3f4f6",
                borderRadius: 8,
                fontSize: 13,
                color: "var(--text-secondary)",
                marginTop: 6,
              }}
            >
              {schoolName}
            </div>
          </div>

          {/* 日期選擇 */}
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>
              日期 *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(99, 102, 241, 0.2)",
                fontSize: 13,
                marginTop: 6,
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* 檔案上傳 */}
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>
              相片 *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px dashed rgba(99, 102, 241, 0.3)",
                background: "rgba(99, 102, 241, 0.05)",
                fontSize: 13,
                cursor: "pointer",
                marginTop: 6,
                color: file ? "var(--accent)" : "var(--text-secondary)",
                fontWeight: file ? 500 : 400,
              }}
            >
              {file ? `✓ ${file.name}` : "選擇檔案"}
            </button>
          </div>

          {/* 處理人選擇 */}
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>
              處理人 *
            </label>
            <select
              value={handler}
              onChange={(e) => setHandler(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(99, 102, 241, 0.2)",
                fontSize: 13,
                marginTop: 6,
                fontFamily: "inherit",
              }}
            >
              {HANDLERS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* 狀態訊息 */}
          {status && (
            <div
              style={{
                padding: 10,
                borderRadius: 8,
                fontSize: 12,
                background:
                  status.type === "success"
                    ? "rgba(34, 197, 94, 0.08)"
                    : "rgba(239, 68, 68, 0.08)",
                border:
                  status.type === "success"
                    ? "1px solid rgba(34, 197, 94, 0.2)"
                    : "1px solid rgba(239, 68, 68, 0.2)",
                color:
                  status.type === "success"
                    ? "#166534"
                    : "#b91c1c",
              }}
            >
              {status.message}
            </div>
          )}

          {/* 按鈕 */}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              onClick={handleUpload}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "10px 16px",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? "上傳中..." : "📤 上傳"}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "10px 16px",
                background: "#f3f4f6",
                color: "var(--text-secondary)",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
