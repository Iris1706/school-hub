"use client";

import { useEffect, useMemo, useState } from "react";

// 欄位對應
const FIELDS = {
  CODE: "學校代碼",
  NAME: "學校名稱",
  ADMIN_AREA: "行政區",
  SCHOOL_TYPE: "學制",
  DEVICES_TOTAL: "載具目前總數",
  CHARGER_TYPE: "充電車",
  CHARGER_COUNT: "車數",
  RESPONSIBLE: "負責人",
  WEEK: "週次",
  BOOKING_TIME: "實際預約日期",
  REMARKS: "備註",
  JAMF: "jamf",
  THSD: "THSD",

  // 生生用平板欄位
  UPLOAD_CHECK: "巡檢單上傳",
  EMAIL_CHECK: "巡檢單email給老師",

  // THSD 欄位
  THSD_COMPLETE: "是否完成",
  THSD_SCHOOL: "THSD學校",
  THSD_DEVICES: "載具數量",

  // 人員進度欄位
  STAFF: "人員",
  RESPONSIBLE_SCHOOL: "負責學校",
  AFFILIATE_COUNT: "附屬學校間數",
  AFFILIATE_DEDUCT: "扣除附屬",
  COMPLETED_COUNT: "已完成數量",
  CURRENT_PROGRESS: "目前進度%",
  SHOULD_COMPLETE: "應完成間數",
  SHOULD_PROGRESS: "應完成進度%",
};

const STAFF_PROGRESS_FIELDS = [
  FIELDS.STAFF,
  FIELDS.RESPONSIBLE_SCHOOL,
  FIELDS.AFFILIATE_COUNT,
  FIELDS.AFFILIATE_DEDUCT,
  FIELDS.COMPLETED_COUNT,
  FIELDS.CURRENT_PROGRESS,
  FIELDS.SHOULD_COMPLETE,
  FIELDS.SHOULD_PROGRESS,
];

const SEARCH_FIELDS = [
  FIELDS.CODE,
  FIELDS.SCHOOL_TYPE,
  FIELDS.ADMIN_AREA,
  FIELDS.NAME,
  FIELDS.JAMF,
  FIELDS.THSD,
  FIELDS.DEVICES_TOTAL,
  FIELDS.CHARGER_TYPE,
  FIELDS.CHARGER_COUNT,
  FIELDS.RESPONSIBLE,
  FIELDS.WEEK,
  FIELDS.BOOKING_TIME,
  FIELDS.REMARKS,
];

export default function InspectPage() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview, incomplete, thsd

  // 防抖搜尋
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // 載入數據
  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/inspect");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setAllData(json.data || []);
    } catch (err) {
      setError(err.message);
      console.error("載入巡檢數據失敗:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // 檢查是否打勾
  const isChecked = (value) => {
    if (!value) return false;
    const str = String(value).toLowerCase().trim();
    return str === "true" || str === "✓" || str === "☑" || str === "✔";
  };

  // 計算統計數據
  const stats = useMemo(() => {
    // 生生用平板統計
    const tabletCompleted = allData.filter(
      (d) => isChecked(d[FIELDS.UPLOAD_CHECK]) && isChecked(d[FIELDS.EMAIL_CHECK])
    ).length;
    const tabletIncomplete = allData.filter(
      (d) => !isChecked(d[FIELDS.UPLOAD_CHECK]) && !isChecked(d[FIELDS.EMAIL_CHECK])
    ).length;

    // THSD 統計
    const thsdCompleted = allData.filter((d) => isChecked(d[FIELDS.THSD_COMPLETE]))
      .length;
    const thsdIncomplete = allData.filter((d) => !isChecked(d[FIELDS.THSD_COMPLETE]))
      .length;

    return {
      tablet: {
        completed: tabletCompleted,
        incomplete: tabletIncomplete,
        total: allData.length,
      },
      thsd: {
        completed: thsdCompleted,
        incomplete: thsdIncomplete,
        total: allData.length,
      },
    };
  }, [allData]);

  // 人員進度數據
  const staffProgress = useMemo(() => {
    if (!allData.length) return [];

    // 按人員分組
    const staffMap = {};
    allData.forEach((d) => {
      const staff = d[FIELDS.STAFF] || "未指定";
      if (!staffMap[staff]) {
        staffMap[staff] = d;
      }
    });

    return Object.entries(staffMap).map(([name, data]) => ({
      人員: name,
      負責學校: data[FIELDS.RESPONSIBLE_SCHOOL] || "",
      附屬學校間數: data[FIELDS.AFFILIATE_COUNT] || "",
      扣除附屬: data[FIELDS.AFFILIATE_DEDUCT] || "",
      已完成數量: data[FIELDS.COMPLETED_COUNT] || "",
      "目前進度%": data[FIELDS.CURRENT_PROGRESS] || "",
      應完成間數: data[FIELDS.SHOULD_COMPLETE] || "",
      "應完成進度%": data[FIELDS.SHOULD_PROGRESS] || "",
    }));
  }, [allData]);

  // 搜尋結果
  const searchResults = useMemo(() => {
    if (!search) return [];
    const lowerSearch = search.toLowerCase();
    return allData.filter(
      (d) =>
        (d[FIELDS.CODE] || "").toLowerCase().includes(lowerSearch) ||
        (d[FIELDS.NAME] || "").toLowerCase().includes(lowerSearch)
    );
  }, [allData, search]);

  // 未完成的學校（U 和 V 都未打勾）
  const incompleteSchools = useMemo(() => {
    return allData.filter(
      (d) => !isChecked(d[FIELDS.UPLOAD_CHECK]) && !isChecked(d[FIELDS.EMAIL_CHECK])
    );
  }, [allData]);

  // THSD 數據（固定 AF2:AJ11，即第 1-10 行）
  const thsdData = useMemo(() => {
    return allData.slice(0, 10).map((d) => ({
      學校代碼: d[FIELDS.CODE] || "",
      THSD學校: d[FIELDS.THSD_SCHOOL] || "",
      載具數量: d[FIELDS.THSD_DEVICES] || "",
      負責人: d[FIELDS.RESPONSIBLE] || "",
      是否完成: isChecked(d[FIELDS.THSD_COMPLETE]) ? "✓" : "",
    }));
  }, [allData]);

  const getProgressPercent = (completed, total) => {
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  };

  // 統計區塊組件
  const StatBlock = ({ title, completed, incomplete, total, variant }) => {
    const isTablet = variant === "tablet";
    const bgGradient = isTablet
      ? "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)"
      : "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(249, 115, 22, 0.12) 100%)";
    const borderColor = isTablet
      ? "rgba(99, 102, 241, 0.3)"
      : "rgba(239, 68, 68, 0.3)";
    const shadowColor = isTablet
      ? "rgba(99, 102, 241, 0.1)"
      : "rgba(239, 68, 68, 0.1)";

    return (
      <div
        style={{
          background: bgGradient,
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
          padding: 24,
          boxShadow: `0 4px 12px ${shadowColor}`,
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: "var(--text-muted)",
            fontWeight: 600,
            marginBottom: 20,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#10b981", marginBottom: 4 }}>
              {completed}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>已完成</div>
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#ef4444", marginBottom: 4 }}>
              {incomplete}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>未完成</div>
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>
              {total}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>總計</div>
          </div>
        </div>

        <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #10b981 0%, #3b82f6 100%)",
              width: `${getProgressPercent(completed, total)}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "right" }}>
          {getProgressPercent(completed, total)}% 完成
        </div>
      </div>
    );
  };

  // 表格組件
  const DataTable = ({ data, columns, variant = "default" }) => {
    const bgColor = variant === "incomplete" ? "rgba(239, 68, 68, 0.05)" : "rgba(99, 102, 241, 0.05)";
    const headerBg = variant === "incomplete" ? "rgba(239, 68, 68, 0.1)" : "rgba(99, 102, 241, 0.1)";
    const borderColor = variant === "incomplete" ? "rgba(239, 68, 68, 0.2)" : "rgba(99, 102, 241, 0.2)";
    const borderStyle = variant === "incomplete" ? "rgba(239, 68, 68, 0.1)" : "rgba(99, 102, 241, 0.1)";

    return (
      <div
        style={{
          overflowX: "auto",
          background: "white",
          border: `1px solid ${borderColor}`,
          borderRadius: 8,
          boxShadow: `0 2px 8px ${variant === "incomplete" ? "rgba(239, 68, 68, 0.08)" : "rgba(99, 102, 241, 0.08)"}`,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
          }}
        >
          <thead>
            <tr style={{ background: headerBg, borderBottom: `2px solid ${borderColor}` }}>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: `1px solid ${borderStyle}`,
                  background: idx % 2 === 0 ? "transparent" : bgColor,
                }}
              >
                {columns.map((col) => (
                  <td
                    key={`${idx}-${col}`}
                    style={{
                      padding: "12px 16px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {row[col] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <h1 className="page-title">巡檢管理</h1>

      {/* 統計區塊 - 並排 */}
      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          <StatBlock
            title="生生用平板"
            completed={stats.tablet.completed}
            incomplete={stats.tablet.incomplete}
            total={stats.tablet.total}
            variant="tablet"
          />
          <StatBlock
            title="THSD"
            completed={stats.thsd.completed}
            incomplete={stats.thsd.incomplete}
            total={stats.thsd.total}
            variant="thsd"
          />
        </div>
      )}

      {/* 人員進度表格 */}
      {!loading && !error && staffProgress.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
              fontWeight: 600,
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            人員進度
          </div>

          <div
            style={{
              overflowX: "auto",
              background: "white",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(99, 102, 241, 0.08)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: "rgba(99, 102, 241, 0.1)", borderBottom: "2px solid rgba(99, 102, 241, 0.2)" }}>
                  {STAFF_PROGRESS_FIELDS.map((field) => (
                    <th
                      key={field}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffProgress.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid rgba(99, 102, 241, 0.1)",
                      background: idx % 2 === 0 ? "transparent" : "rgba(99, 102, 241, 0.05)",
                    }}
                  >
                    {STAFF_PROGRESS_FIELDS.map((field) => (
                      <td
                        key={`${idx}-${field}`}
                        style={{
                          padding: "12px 16px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {row[field] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 學校搜尋區塊 */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 14,
            color: "var(--text-muted)",
            fontWeight: 600,
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          學校搜尋
        </div>

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
            marginBottom: 16,
          }}
        />

        {search && searchResults.length > 0 && (
          <DataTable data={searchResults} columns={SEARCH_FIELDS} variant="default" />
        )}

        {search && searchResults.length === 0 && (
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
            查詢「{search}」沒有符合的學校。
          </p>
        )}
      </div>

      {/* 切換按鈕和數據表格 */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => setActiveTab("incomplete")}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid rgba(99, 102, 241, 0.3)",
              background: activeTab === "incomplete" ? "var(--accent)" : "transparent",
              color: activeTab === "incomplete" ? "white" : "var(--text-primary)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              transition: "all 0.2s ease",
            }}
          >
            未完成
          </button>
          <button
            onClick={() => setActiveTab("thsd")}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid rgba(99, 102, 241, 0.3)",
              background: activeTab === "thsd" ? "var(--accent)" : "transparent",
              color: activeTab === "thsd" ? "white" : "var(--text-primary)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              transition: "all 0.2s ease",
            }}
          >
            THSD
          </button>
        </div>

        {/* 未完成列表 */}
        {activeTab === "incomplete" && (
          <DataTable data={incompleteSchools} columns={SEARCH_FIELDS} variant="incomplete" />
        )}

        {/* THSD 列表（固定 AF2:AJ11，10 行） */}
        {activeTab === "thsd" && (
          <DataTable
            data={thsdData}
            columns={["學校代碼", "THSD學校", "載具數量", "負責人", "是否完成"]}
            variant="default"
          />
        )}
      </div>

      {loading && <p style={{ color: "var(--text-muted)" }}>讀取中...</p>}
      {error && (
        <p style={{ color: "var(--danger)" }}>
          讀取失敗：{error}（請確認環境變數與試算表分享權限）
        </p>
      )}
    </div>
  );
}
