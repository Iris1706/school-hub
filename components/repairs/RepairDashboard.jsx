'use client';

import { useState, useEffect } from 'react';

export default function RepairDashboard({ sheetName }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [sheetName]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/repairs/stats?sheetName=${encodeURIComponent(sheetName)}`
      );

      if (!response.ok) {
        throw new Error('讀取統計資料失敗');
      }

      const result = await response.json();
      setStats(result.stats);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('讀取統計資料錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>載入中...</div>;
  }

  if (error || !stats) {
    return (
      <div style={{ padding: '20px', color: '#dc2626', textAlign: 'center' }}>
        錯誤: {error || '無資料'}
      </div>
    );
  }

  const total = stats.completedCount + stats.inProgressCount;
  const completedPercent = total > 0 ? Math.round((stats.completedCount / total) * 100) : 0;
  const inProgressPercent = 100 - completedPercent;

  return (
    <div>
      {/* 1. 統計卡片 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {/* 本月完修 */}
        <div
          style={{
            backgroundColor: 'var(--background, white)',
            padding: '20px',
            borderRadius: '8px',
            borderLeft: '4px solid #10b981',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            📅 本月完修
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
            {stats.thisMonthCompleted}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            件
          </div>
        </div>

        {/* 本週完修 */}
        <div
          style={{
            backgroundColor: 'var(--background, white)',
            padding: '20px',
            borderRadius: '8px',
            borderLeft: '4px solid #3b82f6',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            📆 本週完修
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>
            {stats.thisWeekCompleted}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            件
          </div>
        </div>

        {/* 平均維修天數 */}
        <div
          style={{
            backgroundColor: 'var(--background, white)',
            padding: '20px',
            borderRadius: '8px',
            borderLeft: '4px solid #f59e0b',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            ⏱️ 平均維修天數
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
            {stats.averageRepairDays}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            天
          </div>
        </div>
      </div>

      {/* 2. 圓形圖表 + 統計 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          marginBottom: '32px',
          alignItems: 'center',
        }}
      >
        {/* 圓形圖表 */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>案件狀態分布</h3>
          <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
            <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
              {/* 已完修 */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#10b981"
                strokeWidth="20"
                strokeDasharray={`${(completedPercent / 100) * 502.65} 502.65`}
              />
              {/* 處理中 */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="20"
                strokeDasharray={`${(inProgressPercent / 100) * 502.65} 502.65`}
                strokeDashoffset={-((completedPercent / 100) * 502.65)}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{total}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>總案件數</div>
            </div>
          </div>
        </div>

        {/* 統計數據 */}
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>狀態詳情</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 已完修 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: 'var(--background-secondary, #f9f9f9)',
                borderRadius: '6px',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>已完修</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {completedPercent}%
                </div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                {stats.completedCount}
              </div>
            </div>

            {/* 處理中 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: 'var(--background-secondary, #f9f9f9)',
                borderRadius: '6px',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>處理中</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {inProgressPercent}%
                </div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6' }}>
                {stats.inProgressCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 排行榜 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
        }}
      >
        {/* 送修前 5 名學校 */}
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>🏫 送修前 5 名學校</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.topSchools.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>暫無資料</div>
            ) : (
              stats.topSchools.map((school, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'var(--background-secondary, #f9f9f9)',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${'#3b82f6'}`,
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{school.name}</div>
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#3b82f6',
                    }}
                  >
                    {school.count}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 問題分類前 5 名 */}
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>🔧 問題分類排行</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.topCategories.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>暫無資料</div>
            ) : (
              stats.topCategories.map((category, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'var(--background-secondary, #f9f9f9)',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${'#f59e0b'}`,
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{category.name}</div>
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#f59e0b',
                    }}
                  >
                    {category.count}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
