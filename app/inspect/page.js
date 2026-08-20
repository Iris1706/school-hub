"use client";

import { useEffect, useMemo, useState } from "react";

const TITLE_FIELD = "學校名稱";
const CODE_FIELD = "學校代碼";

const FIELD_GROUPS = [
  {
    title: "基本資訊",
    fields: [
      { key: "學校代碼", label: "學校代碼" },
      { key: "學校名稱", label: "學校名稱", full: true },
    ],
  },
  {
    title: "載具資訊",
    fields: [
      { key: "jamf", label: "Jamf" },
      { key: "載具目前總數", label: "載具目前總數" },
      { key: "充電車", label: "充電車" },
      { key: "車數", label: "車數" },
    ],
  },
  {
    title: "負責人",
    fields: [
      { key: "負責人", label: "負責人", full: true },
    ],
  },
];

const ALL_FIELDS = FIELD_GROUPS.flatMap((g) => g.fields);
const HEADER_FIELDS = new Set([CODE_FIELD, TITLE_FIELD]);

export default function InspectPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);

  // 防抖搜尋
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // 載入巡檢數據
  async function loadSchools() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/inspect");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setSchools(json.data || []);
    } catch (err) {
      setError(err.message);
      console.error("載入巡檢數據失敗:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchools();
  }, []);

  // 過濾搜尋結果（按學校代碼或學校名稱）
  const filtered = useMemo(() => {
    if (!search) return schools;
    const lowerSearch = search.toLowerCase();
    return schools.filter(
      (s) =>
        (s[CODE_FIELD] || "").toLowerCase().includes(lowerSearch) ||
        (s[TITLE_FIELD] || "").toLowerCase().includes(lowerSearch)
    );
  }, [schools, search]);

  // 計算統計資料
  const stats = useMemo(() => {
    const total = schools.length;
    const withData = schools.filter(
      (s) => (s.jamf || "").trim() !== "" || (s.負責人 || "").trim() !== ""
    ).length;
    const incomplete = schools.filter(
      (s) => (s.jamf || "").trim() === "" || (s.負責人 || "").trim() === ""
    ).length;

    return { total, withData, incomplete };
  }, [schools]);

  return (
    <div>
      <h1 className="page-title">巡檢管理</h1>

      {/* 統計區塊 */}
      {!loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 32,
          }}
        >
          {/* 生生用平板 */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.1)",
            }}
          >
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
              生生用平板
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "baseline" }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#10b981" }}>
                  {stats.withData}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>已完成</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>
                  {stats.incomplete}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>未完成</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#6b7280" }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>總計</div>
              </div>
            </div>
            <div
              style={{
                height: 8,
                background: "#e5e7eb",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #10b981 0%, #3b82f6 100%)",
                  width: `${stats.total > 0 ? (stats.withData / stats.total) * 100 : 0}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginTop: 8,
                textAlign: "right",
              }}
            >
              {stats.total > 0
                ? `${Math.round((stats.withData / stats.total) * 100)}% 完成`
                : "暫無數據"}
            </div>
          </div>

          {/* 待巡檢學校 */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(249, 115, 22, 0.12) 100%)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)",
            }}
          >
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
              待巡檢學校
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>
                  {stats.incomplete}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>未完成</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    lineHeight: 1.6,
                  }}
                >
                  <div>
                    完成率：
                    <span
                      style={{
                        fontWeight: 700,
                        color: stats.total > 0 && stats.withData / stats.total > 0.7 ? "#10b981" : "#ef4444",
                      }}
                    >
                      {stats.total > 0 ? Math.round((stats.withData / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 搜尋區塊 */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="search"
          placeholder="搜尋學校代碼或學校名稱..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            borderRadius: 8,
            fontSize: 14,
            boxShadow: "0 2px 8px rgba(99, 102, 241, 0.08)",
          }}
        />
      </div>

      {/* 載入狀態 */}
      {loading && <p style={{ color: "var(--text-muted)" }}>讀取中...</p>}
      {error && (
        <p style={{ color: "var(--danger)" }}>
          讀取失敗：{error}（請確認環境變數與試算表分享權限）
        </p>
      )}

      {/* 搜尋結果 - 卡片檢視 */}
      {search && !loading && (
        <>
          {filtered.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {filtered.map((s) => {
                const isIncomplete =
                  (s.jamf || "").trim() === "" || (s.負責人 || "").trim() === "";

                return (
                  <div
                    key={s.__row}
                    className="card"
                    style={{
                      background: isIncomplete
                        ? "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(249, 115, 22, 0.08) 100%)"
                        : "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)",
                      border: isIncomplete
                        ? "1px solid rgba(239, 68, 68, 0.2)"
                        : "1px solid rgba(16, 185, 129, 0.2)",
                      borderLeft: isIncomplete ? "4px solid #ef4444" : "4px solid #10b981",
                      borderRadius: 12,
                      boxShadow: isIncomplete
                        ? "0 4px 12px rgba(239, 68, 68, 0.1)"
                        : "0 4px 12px rgba(16, 185, 129, 0.1)",
                    }}
                  >
                    {/* 學校名稱和代碼 */}
                    <div style={{ marginBottom: 14 }}>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: 16,
                          margin: "0 0 4px",
                          color: "var(--text-primary)",
                        }}
                      >
                        {s[TITLE_FIELD] || "未命名"}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {s[CODE_FIELD]}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: isIncomplete ? "#ef4444" : "#10b981",
                            background: isIncomplete
                              ? "rgba(239, 68, 68, 0.1)"
                              : "rgba(16, 185, 129, 0.1)",
                            padding: "2px 8px",
                            borderRadius: 4,
                          }}
                        >
                          {isIncomplete ? "未完成" : "已完成"}
                        </span>
                      </div>
                    </div>

                    {/* 詳細資訊 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {FIELD_GROUPS.map((group) => {
                        const visible = group.fields.filter(
                          (f) =>
                            !HEADER_FIELDS.has(f.key) && (s[f.key] || "").trim() !== ""
                        );
                        if (visible.length === 0) return null;

                        return (
                          <div key={group.title}>
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--text-muted)",
                                fontWeight: 500,
                                marginBottom: 6,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              {group.title}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                                fontSize: 13,
                                color: "var(--text-secondary)",
                              }}
                            >
                              {visible.map((f) => (
                                <div
                                  key={f.key}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    paddingBottom: 6,
                                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                                  }}
                                >
                                  <span style={{ color: "var(--text-muted)" }}>
                                    {f.label}
                                  </span>
                                  <span
                                    style={{
                                      fontWeight: 500,
                                      color: "var(--text-primary)",
                                    }}
                                  >
                                    {s[f.key] || "-"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)" }}>
              查詢「{search}」沒有符合的學校。
            </p>
          )}
        </>
      )}

      {!search && !loading && schools.length > 0 && (
        <p style={{ color: "var(--text-muted)", textAlign: "center", marginTop: 32 }}>
          💡 輸入學校代碼或名稱開始搜尋
        </p>
      )}
    </div>
  );
}
