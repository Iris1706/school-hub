'use client';

import { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';

export default function InProgressTable({ sheetName, onEdit }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [sheetName]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/repairs/read?sheetName=${encodeURIComponent(sheetName)}&type=inProgress`
      );

      if (!response.ok) {
        throw new Error('讀取資料失敗');
      }

      const result = await response.json();
      setData(result.rows || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('讀取資料錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  // 將進度欄位解析為百分比（假設格式為 "50%" 或 "50"）
  const parseProgress = (progressStr) => {
    if (!progressStr) return 0;
    const num = parseInt(progressStr.toString().replace('%', ''));
    return isNaN(num) ? 0 : Math.min(100, Math.max(0, num));
  };

  const headers = ['日期', '維修單號', '學校', '類別', '序號', '進度', 'ASM帳號', '操作'];

  // 顯示欄位映射：J、K、L、M、N、O、P
  const columnMap = [0, 1, 2, 3, 4, 5, 6]; // J、K、L、M、N、O 的索引

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>載入中...</div>;
  }

  if (error) {
    return (
      <div
        style={{
          padding: '20px',
          color: 'var(--text-error, #dc2626)',
          textAlign: 'center',
        }}
      >
        錯誤: {error}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', marginTop: '16px' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'var(--background, white)',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: 'var(--accent-light, #f0f0f0)' }}>
            {headers.map((header) => (
              <th
                key={header}
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: '2px solid var(--border-color, #ccc)',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: 'var(--text-secondary, #666)',
                }}
              >
                暫無資料
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  borderBottom: '1px solid var(--border-color, #ccc)',
                }}
              >
                {/* 日期 - J 欄 */}
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  {row[0] || ''}
                </td>

                {/* 維修單號 - K 欄 */}
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  {row[1] || ''}
                </td>

                {/* 學校 - L 欄 */}
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  {row[2] || ''}
                </td>

                {/* 類別 - M 欄 */}
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  {row[3] || ''}
                </td>

                {/* 序號 - N 欄 */}
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  {row[4] || ''}
                </td>

                {/* 進度 - O 欄（進度條） */}
                <td style={{ padding: '12px' }}>
                  <div
                    style={{
                      width: '120px',
                      height: '20px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: `${parseProgress(row[5])}%`,
                        height: '100%',
                        backgroundColor: '#10b981',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#374151',
                      }}
                    >
                      {row[5] || '0%'}
                    </div>
                  </div>
                </td>

                {/* ASM帳號 - P 欄 */}
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  {row[6] || ''}
                </td>

                {/* 操作 */}
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button
                    onClick={() =>
                      onEdit({
                        rowIndex: rowIndex + 2, // 加 2 是因為標題在第 2 行
                        rowData: row,
                        sheetName,
                      })
                    }
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = '#2563eb')
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = '#3b82f6')
                    }
                  >
                    <Edit2 size={14} />
                    編輯
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
