"use client";

import { useEffect, useState, useMemo } from "react";

export default function InspectPage() {
  const [allData, setAllData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

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

  // 搜尋結果
  const searchResults = useMemo(() => {
    if (!search || !allData.length) return [];
    const lowerSearch = search.toLowerCase();
    return allData.filter((row) => {
      return headers.some(header =>
        String(row[header] || "").toLowerCase().includes(lowerSearch)
      );
    });
  }, [allData, headers, search]);

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

        input[type="search"] {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
          color: #111827;
          margin-bottom: 16px;
          box-sizing: border-box;
        }

        input[type="search"]:focus {
          outline: none;
          border-color: #4F46E5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
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
          {/* 搜尋區塊 */}
          <div style={{ marginBottom: 40 }}>
            <div className="section-title">搜尋</div>
            <input
              type="search"
              placeholder="搜尋任何欄位內容..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />

            {search && (
              <>
                {searchResults.length > 0 && (
                  <>
                    <p className="data-count">找到 {searchResults.length} 筆結果</p>
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
                          {searchResults.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                              {headers.map((header, colIdx) => (
                                <td key={colIdx}>{row[header] || "-"}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {searchResults.length === 0 && (
                  <p className="empty-state">查詢「{search}」沒有符合的資料。</p>
                )}
              </>
            )}
          </div>

          {/* 完整資料表格 */}
          {!search && (
            <div>
              <div className="section-title">完整資料</div>
              <p className="data-count">共 {allData.length} 筆資料</p>

              {allData.length > 0 ? (
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
                      {allData.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {headers.map((header, colIdx) => (
                            <td key={colIdx}>{row[header] || "-"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="empty-state">尚未載入任何資料。</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
