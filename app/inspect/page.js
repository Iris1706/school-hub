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

  // 搜尋結果 - 搜尋所有欄位
  const searchResults = useMemo(() => {
    if (!search) return [];
    const lowerSearch = search.toLowerCase();
    return allData.filter((row) => {
      return Object.values(row).some((val) =>
        String(val || "").toLowerCase().includes(lowerSearch)
      );
    });
  }, [allData, search]);

  // 過濾空欄位
  const visibleHeaders = useMemo(() => {
    if (headers.length === 0) return [];
    // 移除完全空的欄位
    return headers.filter((header, idx) => {
      if (!header || header.trim() === "") return false;
      // 檢查是否至少有一行在這列有資料
      return allData.some((row) => {
        const values = Object.values(row);
        return values[idx] && String(values[idx]).trim() !== "";
      });
    });
  }, [headers, allData]);

  const getFieldIndex = (fieldName) => {
    return headers.indexOf(fieldName);
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
          margin-bottom: 16px;
        }

        input[type="search"]:focus {
          outline: none;
          border-color: #4F46E5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          background: white;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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

        tbody tr:nth-child(even) {
          background: rgba(79, 70, 229, 0.02);
        }

        .empty-state {
          color: #6B7280;
          text-align: center;
          padding: 32px;
          font-size: 14px;
        }
      `}</style>

      <h1 className="page-title">巡檢管理</h1>

      {/* 搜尋區塊 */}
      <div style={{ marginBottom: 40 }}>
        <div className="section-title">搜尋</div>
        <input
          type="search"
          placeholder="搜尋任何欄位內容..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        {search && searchResults.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  {visibleHeaders.map((header, idx) => (
                    <th key={idx}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {searchResults.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {visibleHeaders.map((header, colIdx) => {
                      const headerIdx = getFieldIndex(header);
                      const values = Object.values(row);
                      return <td key={colIdx}>{values[headerIdx] || "-"}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {search && searchResults.length === 0 && (
          <p className="empty-state">查詢「{search}」沒有符合的資料。</p>
        )}
      </div>

      {/* 完整資料表格 */}
      {!search && allData.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div className="section-title">完整資料</div>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  {visibleHeaders.map((header, idx) => (
                    <th key={idx}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allData.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {visibleHeaders.map((header, colIdx) => {
                      const headerIdx = getFieldIndex(header);
                      const values = Object.values(row);
                      return <td key={colIdx}>{values[headerIdx] || "-"}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && <p style={{ color: "#6B7280" }}>讀取中...</p>}
      {error && (
        <p style={{ color: "#DC2626" }}>
          讀取失敗：{error}（請確認環境變數與試算表分享權限）
        </p>
      )}

      {!loading && !error && allData.length === 0 && (
        <p className="empty-state">尚未載入任何資料。</p>
      )}
    </div>
  );
}
