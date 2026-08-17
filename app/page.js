"use client";

import { useEffect, useState } from "react";
import { Copy, CheckCircle } from "lucide-react";
import links from "../data/links.json";

export default function DashboardPage() {
  const [verificationCodes, setVerificationCodes] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const groups = Object.entries(links);

  useEffect(() => {
    async function loadCodes() {
      try {
        const res = await fetch("/api/verification-codes");
        const json = await res.json();
        if (json.data) {
          setVerificationCodes(json.data);
        }
      } catch (err) {
        console.error("讀取驗證碼失敗：", err);
      } finally {
        setLoadingCodes(false);
      }
    }
    loadCodes();
  }, []);

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div>
      {/* 驗證碼區塊 */}
      {!loadingCodes && verificationCodes.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>驗證碼</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {verificationCodes.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                }}
              >
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
                  收到時間：{item.time}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
                  手機末2碼：<strong style={{ color: "var(--text-primary)" }}>{item.phone}</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)", flex: 1 }}>
                    {item.code}
                  </div>
                  <button
                    onClick={() => handleCopy(item.code, idx)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                      borderRadius: 6,
                      padding: "6px 8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {copiedIndex === idx ? (
                      <CheckCircle size={16} color="var(--accent)" />
                    ) : (
                      <Copy size={16} color="var(--text-muted)" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h1 className="page-title">常用網址</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        {groups.map(([groupName, items]) => (
          <div key={groupName}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: "0 0 12px",
                paddingBottom: 8,
                borderBottom: "2px solid var(--accent)",
              }}
            >
              {groupName}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
                    borderLeft: "3px solid var(--accent)",
                    textDecoration: "none",
                    fontSize: 14,
                    padding: 12,
                    borderRadius: 6,
                    color: "var(--text-primary)",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(4px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 20 }}>
        要新增或修改網址，編輯 <code>data/links.json</code> 即可，不需要改程式碼。
      </p>
    </div>
  );
}
