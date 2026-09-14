"use client";

import { useEffect, useState, useMemo } from "react";

export default function InspectPage() {
  const [allData, setAllData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("unchecked"); // 'all', 'unchecked'

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
    return str === "true" || str === "✓" || str === "☑" || str === "✔" || str === "v";
  };

  // 篩選邏輯
  const filteredData = useMemo(() => {
    let filtered = allData;

    // 根據篩選類型篩選
    if (filterType === "unchecked") {
      // U 和 V 都沒有打勾
      filtered = filtered.filter(row => {
        const uChecked = isChecked(row["巡檢單上傳"]);
        const vChecked = isChecked(row["巡檢單email給老師"]);
        return !uChecked && !vChecked;
      });
    }

    // 搜尋篩選
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter((row) => {
        return headers.some(header =>
          String(row[header] || "").toLowerCase().includes(lowerSearch)
        );
      });
    }

    return filtered;
  }, [allData, headers, search, filterType]);

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
          font-weight: 700;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .controls {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          align-items: center;
          flex-wrap: wrap;
        }

        input[type="search"] {
          flex: 1;
          min-width: 200px;
          padding: 10px 14px;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
          color: #111827;
          box-sizing: border-box;
        }

        input[type="search"]:focus {
          outline: none;
          border-color: #4F46E5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .button-group {
          display: flex;
          gap: 8px;
        }

        button {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid #D1D5DB;
          background: white;
          color: #374151;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        button:hover {
          background: #F3F4F6;
        }

        button.active {
          background: #DC2626;
          color: white;
          border-color: #DC2626;
        }

        .table-wrapper {
          overflow-x: auto;
          background: white;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        thead {
          background: #F0F4FF;
          border-bottom: 1px solid #D0D9FF;
          position: sticky;
          top: 0;
        }

        th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #1F2937;
          white-space: nowrap;
          font-size: 12px;
        }

        td {
          padding: 12px 16px;
          color: #374151;
          font-weight: 500;
          border-bottom: 1px solid #E5E7EB;
        }

        tbody tr:hover {
          background: rgba(79, 70, 229, 0.03);
        }

        tbody tr:nth-child(even) {
          background: rgba(79, 70, 229, 0.02);
        }

        .empty-state {
          color: #6B7280;
          text-align: center;
          padding: 32px;
          font-size: 14px;
        }

        .data-count {
          color: #6B7280;
          font-size: 12px;
          margin-bottom: 12px;
        }

        .error-box {
          background: #FEF2F2;
          border: 1px solid #FED7D7;
          border-radius: 6px;
          padding: 16px;
          color: #DC2626;
          margin-bottom: 24px;
        }

        .loading-box {
          color: #6B7280;
          padding: 24px;
          text-align: center;
        }

        .checkbox-cell {
          text-align: center;
          font-weight: 600;
          color: #059669;
        }

        .checkbox-cell.unchecked {
          color: #DC2626;
        }
      `}</style>

      <h1 className="page-title">巡檢管理</h1>

      {loading && <div className="loading-box">讀取中...</div>}

      {error && (
        <div className="error-box">
          讀取失敗：{error}（請確認環境變數與試算表分享權限）
        </div>
      )}

      {!loading && !error && headers.length === 0 && (
        <p className="empty-state">無法取得表頭資訊，請檢查 Google Sheet 設定。</p>
      )}

      {!loading && !error && headers.length > 0 && (
        <>
          {/* 控制區塊 */}
          <div style={{ marginBottom: 40 }}>
            <div className="section-title">篩選與搜尋</div>

            <div className="controls">
              <div className="button-group">
                <button
                  className={filterType === "unchecked" ? "active" : ""}
                  onClick={() => setFilterType("unchecked")}
                >
                  未完成 (U&V都未勾)
                </button>
                <button
                  className={filterType === "all" ? "active" : ""}
                  onClick={() => setFilterType("all")}
                >
                  全部資料
                </button>
              </div>

              <input
                type="search"
                placeholder="搜尋任何欄位內容..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>

          {/* 資料表格 */}
          {filteredData.length > 0 ? (
            <>
              <p className="data-count">
                {filterType === "unchecked"
                  ? `未完成的巡檢：${filteredData.length} 筆`
                  : `全部資料：${filteredData.length} 筆`
                }
              </p>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      {headers.map((header, idx) => (
                        <th key={idx}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {headers.map((header, colIdx) => {
                          const value = row[header] || "-";
                          const isCheckColumn = header === "巡檢單上傳" || header === "巡檢單email給老師";
                          const checked = isChecked(value);

                          return (
                            <td
                              key={colIdx}
                              className={isCheckColumn ? (checked ? "checkbox-cell" : "checkbox-cell unchecked") : ""}
                            >
                              {isCheckColumn ? (checked ? "✓" : "✗") : value}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="empty-state">
              {filterType === "unchecked"
                ? "所有巡檢都已完成！"
                : "尚未載入任何資料。"
              }
            </p>
          )}
        </>
      )}
    </div>
  );
}
