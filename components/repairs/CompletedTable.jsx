'use client';

import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export default function CompletedTable({ sheetName }) {
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
        `/api/repairs/read?sheetName=${encodeURIComponent(sheetName)}&type=completed`
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

  const handleDelete = async (rowIndex) => {
    if (!confirm('確認要刪除此筆資料嗎？')) {
      return;
    }

    try {
      const response = await fetch('/api/repairs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetName,
          rowIndex: rowIndex + 2, // 加 2 是因為標題在第 2 行，資料從第 3 行開始
        }),
      });

      if (!response.ok) {
        throw new Error('刪除失敗');
      }

      // 重新加載資料
      fetchData();
    } catch (err) {
      alert(`刪除失敗: ${err.message}`);
    }
  };

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

  const headers = [
    '建單日期',
    '維修單號',
    '學校名稱',
    '問題分類',
    '機器舊序號',
    '機器新序號',
    '狀態',
    '完成日期(寄回)',
    '操作',
  ];

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
                  ':hover': { backgroundColor: 'var(--accent-light, #f9f9f9)' },
                }}
              >
                {headers.slice(0, -1).map((_, colIndex) => (
                  <td
                    key={colIndex}
                    style={{
                      padding: '12px',
                      fontSize: '14px',
                      color: 'var(--text-primary, black)',
                    }}
                  >
                    {row[colIndex] || ''}
                  </td>
                ))}
                <td
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                  }}
                >
                  <button
                    onClick={() => handleDelete(rowIndex)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = '#dc2626')
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = '#ef4444')
                    }
                  >
                    <Trash2 size={14} />
                    刪除
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
