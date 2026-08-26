"use client";

import { useEffect, useState } from "react";
import { Copy, CheckCircle } from "lucide-react";
import links from "../data/links.json";

export default function DashboardPage() {
  const [verificationCodes, setVerificationCodes] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [todos, setTodos] = useState([]);
  const [loadingTodos, setLoadingTodos] = useState(true);
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

    async function loadSchedules() {
      try {
        const res = await fetch("/api/daily-schedule");
        const json = await res.json();
        if (json.data) {
          // 取得今天的日期
          const today = new Date();
          const todayStr = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

          // 過濾出今天的行程
          const filtered = json.data.filter((schedule) => {
            if (!schedule.date) return false;
            // 簡單比對日期（考慮多種格式）
            const dateStr = schedule.date.trim();
            return dateStr.includes(`${today.getMonth() + 1}/${today.getDate()}`) ||
                   dateStr === todayStr ||
                   dateStr.startsWith(todayStr);
          });
          setTodaySchedules(filtered);
        }
      } catch (err) {
        console.error("讀取行程失敗：", err);
      } finally {
        setLoadingSchedules(false);
      }
    }

    async function loadTodos() {
      try {
        const res = await fetch("/api/todos");
        const json = await res.json();
        if (json.data) {
          // 過濾出尚未完成的待辦事項（完成欄位不是 'true'）
          const filtered = json.data.filter((todo) => {
            return !todo.完成 || todo.完成 !== 'true';
          });
          setTodos(filtered);
        }
      } catch (err) {
        console.error("讀取待辦事項失敗：", err);
      } finally {
        setLoadingTodos(false);
      }
    }

    loadCodes();
    loadSchedules();
    loadTodos();

    // 每 30 秒自動刷新
    const interval = setInterval(() => {
      loadCodes();
      loadSchedules();
      loadTodos();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div>
      <h1 className="page-title">常用網址</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 32 }}>
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

      {/* 當日行程區塊 */}
      {!loadingSchedules && todaySchedules.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>當日行程</h2>
          <div style={{
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            alignItems: "stretch"
          }}>
            {todaySchedules.map((schedule, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "stretch", gap: 4 }}>
                <div style={{
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: 15,
                  padding: 16,
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.14), 0 3px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.6)",
                  minWidth: 180,
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>日期</span>
                      <div style={{ fontSize: 13, color: "#1f2937", fontWeight: 600, marginTop: 4 }}>
                        {schedule.date || "未設定"}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>時間</span>
                      <div style={{ fontSize: 13, color: "#1f2937", fontWeight: 600, marginTop: 4 }}>
                        {schedule.time || "未設定"}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>地點</span>
                      <div style={{ fontSize: 13, color: "#1f2937", fontWeight: 600, marginTop: 4 }}>
                        {schedule.location || "未設定"}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>事件</span>
                      <div style={{ fontSize: 13, color: "#3b82f6", fontWeight: 600, marginTop: 4 }}>
                        {schedule.event || "未設定"}
                      </div>
                    </div>
                  </div>
                </div>
                {idx < todaySchedules.length - 1 && (
                  <div style={{
                    fontSize: 24,
                    color: "#d1d5db",
                    fontWeight: 200,
                    userSelect: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 2px",
                    height: "100%",
                    minHeight: "auto"
                  }}>|</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 待辦事項區塊 */}
      {!loadingTodos && todos.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>待辦事項</h2>
          <div style={{
            background: "#ffffff",
            border: "1px solid #d1d5db",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
            overflow: "hidden"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {todos.map((todo, idx) => {
                const status = (todo.狀態 || "一般").trim();
                let statusStyles = { background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" };

                if (status.includes("急")) {
                  statusStyles = { background: "#fce4e4", color: "#dc2626", border: "1px solid #f5c5c5" };
                } else if (status.includes("不急")) {
                  statusStyles = { background: "#fde8d0", color: "#d97706", border: "1px solid #f5d4a8" };
                }

                return (
                  <div
                    key={idx}
                    style={{
                      padding: "12px 16px",
                      borderBottom: idx < todos.length - 1 ? "1px solid #e5e7eb" : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                      fontSize: 13,
                      color: "#1f2937",
                    }}
                  >
                    <span style={{
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 6,
                      whiteSpace: "nowrap",
                      ...statusStyles
                    }}>
                      {todo.狀態 || "一般"}
                    </span>
                    <span style={{ color: "#d1d5db" }}>|</span>
                    <span style={{ color: "#1f2937", whiteSpace: "nowrap" }}>
                      {todo.預計處理日期 || "未設定"}
                    </span>
                    <span style={{ color: "#d1d5db" }}>|</span>
                    <span style={{ color: "#1f2937", whiteSpace: "nowrap" }}>
                      {todo.學校 || "未設定"}
                    </span>
                    <span style={{ color: "#d1d5db" }}>|</span>
                    <span style={{ fontWeight: 600, color: "#3b82f6", whiteSpace: "nowrap" }}>
                      {todo.事件 || "未命名事件"}
                    </span>
                    <span style={{ color: "#d1d5db" }}>|</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, whiteSpace: "nowrap" }}>
                      <span style={{ color: "#1f2937", fontWeight: 500 }}>
                        {todo.聯絡人 || "未設定"}
                      </span>
                      {(todo.電話 || todo.郵件) && (
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>
                          {[todo.電話, todo.郵件].filter(Boolean).join(" • ")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 驗證碼區塊 */}
      {!loadingCodes && verificationCodes.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>驗證碼</h2>
          <div className="verification-codes-grid">
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
                  手機末2碼：<strong style={{ color: "var(--text-primary)", fontSize: 14 }}>{item.phone}</strong>
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

      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 20 }}>
        要新增或修改網址，編輯 <code>data/links.json</code> 即可，不需要改程式碼。
      </p>
    </div>
  );
}
