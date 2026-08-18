'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit2, CheckCircle } from 'lucide-react';

export default function InProgressTable({ sheetName, onShowCompleteModal, onShowEditModal }) {
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
        `/api/repairs/read?sheetName=${encodeURIComponent(sheetName)}&type=inProgress`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error('讀取處理中資料失敗');
      }

      const result = await response.json();
      setData(result.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('讀取處理中資料錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rowIndex) => {
    if (!confirm('確定要刪除此筆資料嗎？')) return;

    try {
      const response = await fetch('/api/repairs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetName,
          rowIndex,
          type: 'inProgress',
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '刪除失敗');
      }

      setData(data.filter((_, idx) => idx !== rowIndex));
    } catch (err) {
      alert(`刪除失敗: ${err.message}`);
      console.error('刪除錯誤:', err);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>載入中...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#dc2626', textAlign: 'center' }}>
        錯誤: {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#6b7280', textAlign: 'center' }}>
        暫無處理中資料
      </div>
    );
  }

  return (
    <div>
      {/* Centered Title and Count */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          ⚙️ 處理中
        </h3>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
          共 <span style={{ fontWeight: '700', color: '#3b82f6' }}>{data.length}</span> 筆
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {data.map((row, index) => (
          <div
            key={index}
            style={{
              background: 'var(--background, white)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              alignItems: 'start',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>建單日期</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{row[0] || '-'}</div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>維修單號</div>
              <div style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'monospace' }}>{row[1] || '-'}</div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>學校名稱</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{row[2] || '-'}</div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>問題分類</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{row[3] || '-'}</div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>機器舊序號</div>
              <div style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'monospace' }}>{row[4] || '-'}</div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>進度</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{row[5] || '-'}</div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>ASM帳號</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{row[7] || '-'}</div>
            </div>

            <div style={{ gridColumn: 'span 1', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Complete Button */}
                <button
                  onClick={() => onShowCompleteModal(index, row)}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#059669';
                    e.target.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#10b981';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <CheckCircle size={14} />
                  完成
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => onShowEditModal(index, row)}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#2563eb';
                    e.target.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#3b82f6';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <Edit2 size={14} />
                  編輯
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(index)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#dc2626';
                    e.target.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#ef4444';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <Trash2 size={14} />
                  刪除
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
