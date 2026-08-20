"use client";

import { useEffect, useMemo, useState } from "react";

// 欄位對應 - 使用 Google Sheet 中的確切欄位名稱
const FIELDS = {
  CODE: "學校代碼\n(藍色代表已完成)",
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

// 搜尋欄位（已刪除 jamf、THSD、實際預約日期、備註）
const SEARCH_FIELDS_KEYS = [
  FIELDS.CODE,
  FIELDS.SCHOOL_TYPE,
  FIELDS.ADMIN_AREA,
  FIELDS.NAME,
  FIELDS.DEVICES_TOTAL,
  FIELDS.CHARGER_TYPE,
  FIELDS.CHARGER_COUNT,
  FIELDS.WEEK,
];

// 搜尋欄位顯示名稱
const SEARCH_FIELDS_DISPLAY = [
  "[學校代碼]",
  "學制",
  "行政區",
  "學校名稱",
  "載具目前總數",
  "充電車",
  "車數",
  "週次",
];

// 未完成按鈕欄位（負責人放最後）
const INCOMPLETE_FIELDS_KEYS = [
  FIELDS.CODE,
  FIELDS.SCHOOL_TYPE,
  FIELDS.ADMIN_AREA,
  FIELDS.NAME,
  FIELDS.DEVICES_TOTAL,
  FIELDS.CHARGER_TYPE,
  FIELDS.CHARGER_COUNT,
  FIELDS.WEEK,
  FIELDS.RESPONSIBLE,
];

const INCOMPLETE_FIELDS_DISPLAY = [
  "[學校代碼]",
  "學制",
  "行政區",
  "學校名稱",
  "載具目前總數",
  "充電車",
  "車數",
  "週次",
  "負責人",
];

// 下拉選項 - 負責人列表
const RESPONSIBLE_OPTIONS = [
  "全部",
  "Pawn",
  "Esther",
  "Iris",
  "Hongkun",
  "May",
  "Zephyr",
  "Jimmy",
  "Andy",
  "Jenna",
];

export default function InspectPage() {
  const [allData, setAllData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("incomplete"); // 預設 incomplete
  const [selectedResponsible, setSelectedResponsible] = useState("全部");

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
      setHeaders(json.headers || []);
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

  // 取得欄位值 - 容錯處理（尋找相似欄位名稱）
  const getFieldValue = (obj, fieldName) => {
    if (!obj) return "";

    // 首先嘗試直接匹配
    if (obj[fieldName] !== undefined) {
      return obj[fieldName] || "";
    }

    // 如果直接匹配失敗，尋找相似的欄位名稱（去除空格和換行符）
    const normalizedFieldName = fieldName.replace(/\s+/g, "").toLowerCase();
    for (const key in obj) {
      const normalizedKey = key.replace(/\s+/g, "").toLowerCase();
      if (normalizedKey === normalizedFieldName) {
        return obj[key] || "";
      }
    }

    return "";
  };

  // 計算統計數據
  const stats = useMemo(() => {
    // 生生用平板統計
    const tabletCompleted = allData.filter(
      (d) => isChecked(getFieldValue(d, FIELDS.UPLOAD_CHECK)) && isChecked(getFieldValue(d, FIELDS.EMAIL_CHECK))
    ).length;
    const tabletIncomplete = allData.filter(
      (d) => !isChecked(getFieldValue(d, FIELDS.UPLOAD_CHECK)) && !isChecked(getFieldValue(d, FIELDS.EMAIL_CHECK))
    ).length;

    // THSD 統計 - 修改邏輯
    // 只計算有 THSD 數據的行
    const thsdDataRows = allData.filter((d) => {
      const hasThsdData =
        getFieldValue(d, FIELDS.THSD_SCHOOL) ||
        getFieldValue(d, FIELDS.THSD_DEVICES) ||
        getFieldValue(d, FIELDS.THSD_COMPLETE);
      return hasThsdData;
    });

    // 未完成數 = THSD 數據中 AJ 未打勾的數量
    const thsdIncomplete = thsdDataRows.filter((d) => !isChecked(getFieldValue(d, FIELDS.THSD_COMPLETE))).length;
    // 完成數 = THSD 數據中 AJ 打勾的數量
    const thsdCompleted = thsdDataRows.filter((d) => isChecked(getFieldValue(d, FIELDS.THSD_COMPLETE))).length;
    // 總計 = 所有有 THSD 數據的行數
    const thsdTotal = thsdDataRows.length;

    return {
      tablet: {
        completed: tabletCompleted,
        incomplete: tabletIncomplete,
        total: allData.length,
      },
      thsd: {
        completed: thsdCompleted,
        incomplete: thsdIncomplete,
        total: thsdTotal,
      },
    };
  }, [allData]);

  // 人員進度數據
  const staffProgress = useMemo(() => {
    if (!allData.length) return [];

    // 按人員分組
    const staffMap = {};
    allData.forEach((d) => {
      const staff = getFieldValue(d, FIELDS.STAFF) || "未指定";
      if (!staffMap[staff]) {
        staffMap[staff] = d;
      }
    });

    return Object.entries(staffMap).map(([name, data]) => ({
      人員: name,
      負責學校: getFieldValue(data, FIELDS.RESPONSIBLE_SCHOOL) || "",
      附屬學校間數: getFieldValue(data, FIELDS.AFFILIATE_COUNT) || "",
      扣除附屬: getFieldValue(data, FIELDS.AFFILIATE_DEDUCT) || "",
      已完成數量: getFieldValue(data, FIELDS.COMPLETED_COUNT) || "",
      "目前進度%": getFieldValue(data, FIELDS.CURRENT_PROGRESS) || "",
      應完成間數: getFieldValue(data, FIELDS.SHOULD_COMPLETE) || "",
      "應完成進度%": getFieldValue(data, FIELDS.SHOULD_PROGRESS) || "",
    }));
  }, [allData]);

  // 搜尋結果
  const searchResults = useMemo(() => {
    if (!search) return [];
    const lowerSearch = search.toLowerCase();
    return allData.filter(
      (d) =>
        (getFieldValue(d, FIELDS.CODE) || "").toLowerCase().includes(lowerSearch) ||
        (getFieldValue(d, FIELDS.NAME) || "").toLowerCase().includes(lowerSearch)
    );
  }, [allData, search]);

  // 未完成的學校（U 和 V 都未打勾）+ 負責人篩選
  const incompleteSchools = useMemo(() => {
    let filtered = allData.filter(
      (d) => !isChecked(getFieldValue(d, FIELDS.UPLOAD_CHECK)) && !isChecked(getFieldValue(d, FIELDS.EMAIL_CHECK))
    );

    // 根據負責人篩選
    if (selectedResponsible !== "全部") {
      filtered = filtered.filter((d) => {
        const responsible = getFieldValue(d, FIELDS.RESPONSIBLE) || "";
        return responsible === selectedResponsible;
      });
    }

    return filtered;
  }, [allData, selectedResponsible]);

  // THSD 數據（只顯示 AF:AJ 有資料的行）
  const thsdDataRaw = useMemo(() => {
    return allData.filter((d) => {
      // 只顯示有 THSD 相關數據的行
      const hasThsdData =
        getFieldValue(d, FIELDS.THSD_SCHOOL) ||
        getFieldValue(d, FIELDS.THSD_DEVICES) ||
        getFieldValue(d, FIELDS.THSD_COMPLETE);
      return hasThsdData;
    });
  }, [allData]);

  // THSD 數據（根據負責人篩選）
  const filteredThsdData = useMemo(() => {
    let filtered = thsdDataRaw.map((d) => ({
      學校代碼: getFieldValue(d, FIELDS.CODE) || "",
      THSD學校: getFieldValue(d, FIELDS.THSD_SCHOOL) || "",
      載具數量: getFieldValue(d, FIELDS.THSD_DEVICES) || "",
      負責人: getFieldValue(d, FIELDS.RESPONSIBLE) || "",
      是否完成: isChecked(getFieldValue(d, FIELDS.THSD_COMPLETE)) ? "✓" : "x",
      是否完成狀態: isChecked(getFieldValue(d, FIELDS.THSD_COMPLETE)) ? "completed" : "incomplete",
    }));

    if (selectedResponsible !== "全部") {
      filtered = filtered.filter((d) => d.負責人 === selectedResponsible);
    }

    return filtered;
  }, [thsdDataRaw, selectedResponsible]);

  const getProgressPercent = (completed, total) => {
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  };

  // 商業風格統計區塊組件
  const StatBlock = ({ title, completed, incomplete, total, variant }) => {
    const isTablet = variant === "tablet";
    // 商業風格配色方案
    const bgGradient = isTablet
      ? "linear-gradient(135deg, #f8f9fc 0%, #f0f4ff 100%)"
      : "linear-gradient(135deg, #f8f9fc 0%, #fff5f0 100%)";
    const borderColor = isTablet ? "#d0d9ff" : "#ffd9cc";
    const accentColor = isTablet ? "#4F46E5" : "#DC2626";
    const shadowColor = isTablet ? "rgba(79, 70, 229, 0.08)" : "rgba(220, 38, 38, 0.08)";

    return (
      <div
        style={{
          background: bgGradient,
          border: `1.5px solid ${borderColor}`,
          borderRadius: 8,
          padding: "20px 24px",
          boxShadow: `0 2px 8px ${shadowColor}`,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "#6B7280",
            fontWeight: 700,
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          {title}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#059669", marginBottom: 4 }}>
              {completed}
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>已完成</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#DC2626", marginBottom: 4 }}>
              {incomplete}
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>未完成</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: accentColor, marginBottom: 4 }}>
              {total}
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>總計</div>
          </div>
        </div>

        <div style={{ height: 4, background: "#E5E7EB", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
          <div
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${accentColor} 0%, ${isTablet ? "#8B5CF6" : "#F97316"} 100%)`,
              width: `${getProgressPercent(completed, total)}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <div style={{ fontSize: 12, color: "#6B7280", textAlign: "right", fontWeight: 500 }}>
          {getProgressPercent(completed, total)}% 完成
        </div>
      </div>
    );
  };

  // 表格組件 - 商業風格
  const DataTable = ({ data, columnKeys, columnDisplay, variant = "default" }) => {
    const accentColor = variant === "incomplete" ? "#DC2626" : "#4F46E5";
    const bgColor = variant === "incomplete" ? "rgba(220, 38, 38, 0.02)" : "rgba(79, 70, 229, 0.02)";
    const headerBg = variant === "incomplete" ? "#FEF2F2" : "#F0F4FF";
    const borderColor = variant === "incomplete" ? "#FED7D7" : "#D0D9FF";

    return (
      <div
        style={{
          overflowX: "auto",
          background: "white",
          border: `1px solid ${borderColor}`,
          borderRadius: 6,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
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
            <tr style={{ background: headerBg, borderBottom: `1px solid ${borderColor}` }}>
              {columnDisplay.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#1F2937",
                    whiteSpace: "nowrap",
                    fontSize: 12,
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
                  borderBottom: `1px solid #E5E7EB`,
                  background: idx % 2 === 0 ? "white" : bgColor,
                }}
              >
                {columnKeys.map((colKey, colIdx) => {
                  let cellContent = "-";
                  let cellColor = "#6B7280";

                  if (variant === "thsd" || variant === "search" || variant === "incomplete") {
                    cellContent = row[colKey] || "-";
                  }

                  // THSD 按鈕的是否完成欄位著色
                  if (colKey === "是否完成" && variant === "thsd") {
                    cellColor = row.是否完成狀態 === "completed" ? "#059669" : "#DC2626";
                  }

                  return (
                    <td
                      key={`${idx}-${colIdx}`}
                      style={{
                        padding: "12px 16px",
                        color: cellColor,
                        fontWeight: colKey === "是否完成" ? 700 : 500,
                        fontSize: 13,
                      }}
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ background: "#F9FAFB", minHeight: "100vh", padding: "32px" }}>
      <style>{`
        .page-title {
          font-size: 28px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 32px;
          letter-spacing: -0.5px;
        }

        .section-title {
          font-size: 12px;
          color: #6B7280;
          fontWeight: 700;
          marginBottom: 16px;
          textTransform: uppercase;
          letterSpacing: 0.8px;
        }

        input[type="search"] {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #D1D5DB;
          borderRadius: 6px;
          fontSize: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
          color: #111827;
        }

        input[type="search"]:focus {
          outline: none;
          border-color: #4F46E5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        select {
          padding: 8px 12px;
          borderRadius: 6px;
          border: 1px solid #D1D5DB;
          background: white;
          color: #111827;
          cursor: pointer;
          fontWeight: 500;
          fontSize: 13px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
        }

        select:focus {
          outline: none;
          border-color: #4F46E5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        button {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
        }
      `}</style>

      <h1 className="page-title">巡檢管理</h1>

      {/* 統計區塊 - 並排 */}
      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>
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
        <div style={{ marginBottom: 40 }}>
          <div className="section-title">人員進度</div>

          <div
            style={{
              overflowX: "auto",
              background: "white",
              border: "1px solid #D1D5DB",
              borderRadius: 6,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
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
                <tr style={{ background: "#F0F4FF", borderBottom: "1px solid #D0D9FF" }}>
                  {STAFF_PROGRESS_FIELDS.map((field) => (
                    <th
                      key={field}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#1F2937",
                        whiteSpace: "nowrap",
                        fontSize: 12,
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
                      borderBottom: "1px solid #E5E7EB",
                      background: idx % 2 === 0 ? "white" : "rgba(79, 70, 229, 0.02)",
                    }}
                  >
                    {STAFF_PROGRESS_FIELDS.map((field) => (
                      <td
                        key={`${idx}-${field}`}
                        style={{
                          padding: "12px 16px",
                          color: "#374151",
                          fontWeight: 500,
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
      <div style={{ marginBottom: 40 }}>
        <div className="section-title">學校搜尋</div>

        <input
          type="search"
          placeholder="搜尋學校代碼或學校名稱..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            marginBottom: 16,
          }}
        />

        {search && searchResults.length > 0 && (
          <DataTable
            data={searchResults.map((d) => {
              const row = {};
              SEARCH_FIELDS_KEYS.forEach((key) => {
                row[key] = getFieldValue(d, key);
              });
              return row;
            })}
            columnKeys={SEARCH_FIELDS_KEYS}
            columnDisplay={SEARCH_FIELDS_DISPLAY}
            variant="default"
          />
        )}

        {search && searchResults.length === 0 && (
          <p style={{ color: "#6B7280", textAlign: "center", fontSize: 14 }}>
            查詢「{search}」沒有符合的學校。
          </p>
        )}
      </div>

      {/* 切換按鈕和數據表格 */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setActiveTab("incomplete")}
              style={{
                padding: "8px 18px",
                borderRadius: 6,
                border: activeTab === "incomplete" ? "1px solid #DC2626" : "1px solid #D1D5DB",
                background: activeTab === "incomplete" ? "#DC2626" : "white",
                color: activeTab === "incomplete" ? "white" : "#374151",
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
                padding: "8px 18px",
                borderRadius: 6,
                border: activeTab === "thsd" ? "1px solid #4F46E5" : "1px solid #D1D5DB",
                background: activeTab === "thsd" ? "#4F46E5" : "white",
                color: activeTab === "thsd" ? "white" : "#374151",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                transition: "all 0.2s ease",
              }}
            >
              THSD
            </button>
          </div>

          {/* 負責人下拉選項 */}
          <select
            value={selectedResponsible}
            onChange={(e) => setSelectedResponsible(e.target.value)}
          >
            {RESPONSIBLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* 未完成列表 */}
        {activeTab === "incomplete" && (
          <>
            {incompleteSchools.length > 0 ? (
              <DataTable
                data={incompleteSchools.map((d) => {
                  const row = {};
                  INCOMPLETE_FIELDS_KEYS.forEach((key) => {
                    row[key] = getFieldValue(d, key);
                  });
                  return row;
                })}
                columnKeys={INCOMPLETE_FIELDS_KEYS}
                columnDisplay={INCOMPLETE_FIELDS_DISPLAY}
                variant="incomplete"
              />
            ) : (
              <p style={{ color: "#6B7280", textAlign: "center", fontSize: 14 }}>
                {selectedResponsible === "全部"
                  ? "暫無未完成的學校。"
                  : `${selectedResponsible} 沒有未完成的學校。`}
              </p>
            )}
          </>
        )}

        {/* THSD 列表 */}
        {activeTab === "thsd" && (
          <>
            {filteredThsdData.length > 0 ? (
              <DataTable
                data={filteredThsdData}
                columnKeys={["學校代碼", "THSD學校", "載具數量", "負責人", "是否完成"]}
                columnDisplay={["學校代碼", "THSD學校", "載具數量", "負責人", "是否完成"]}
                variant="thsd"
              />
            ) : (
              <p style={{ color: "#6B7280", textAlign: "center", fontSize: 14 }}>
                {selectedResponsible === "全部"
                  ? "暫無 THSD 資料。"
                  : `${selectedResponsible} 沒有 THSD 資料。`}
              </p>
            )}
          </>
        )}
      </div>

      {loading && <p style={{ color: "#6B7280" }}>讀取中...</p>}
      {error && (
        <p style={{ color: "#DC2626" }}>
          讀取失敗：{error}（請確認環境變數與試算表分享權限）
        </p>
      )}
    </div>
  );
}
