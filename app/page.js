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
          // 過濾出尚未完成的待辦事項（狀態不是「已完成」）
          const filtered = json.data.filter((todo) => {
            const status = (todo.狀態 || "").trim().toLowerCase();
            return status !== "已完成" && status !== "completed";
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

      {/* 行程區塊 */}
      {!loadingSchedules && todaySchedules.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>行程</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {todaySchedules.map((schedule, idx) => (
              <div
                key={idx}
                style={{
                  background: "linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.08) 100%)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.1)",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 100 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>時間</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                        {schedule.time || "未設定"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>日期</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                        {schedule.date || "未設定"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>地點</div>
                      <div style={{ fontSize: 14, color: "var(--text-primary)" }}>
                        {schedule.location || "未設定"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>事件</div>
                      <div style={{ fontSize: 14, color: "var(--text-primary)" }}>
                        {schedule.event || "未設定"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 待辦事項區塊 */}
      {!loadingTodos && todos.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>待辦事項</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {todos.map((todo, idx) => (
              <div
                key={idx}
                style={{
                  background: "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.08) 100%)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                      {todo.事件 || "未命名事件"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {todo.學校 && `${todo.學校} • `}{todo.聯絡人 && `聯絡人: ${todo.聯絡人}`}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 80, textAlign: "right" }}>
                    {todo.狀態 && (
                      <div style={{
                        display: "inline-block",
                        background: "rgba(239, 68, 68, 0.2)",
                        color: "#dc2626",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                      }}>
                        {todo.狀態}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
                  <div>
                    <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>日期</div>
                    <div style={{ color: "var(--text-primary)" }}>{todo.日期 || "未設定"}</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>預計處理日期</div>
                    <div style={{ color: "var(--text-primary)" }}>{todo.預計處理日期 || "未設定"}</div>
                  </div>
                </div>
              </div>
            ))}
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
