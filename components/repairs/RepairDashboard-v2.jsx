'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Clock, Zap } from 'lucide-react';

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
      {/* 1. 統計卡片 - 改進設計 */}
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
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
            <CheckCircle size={80} />
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>
            📅 本月完修
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '4px' }}>
            {stats.thisMonthCompleted}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>件</div>
        </div>

        {/* 本週完修 */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
            <Zap size={80} />
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>
            📆 本週完修
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '4px' }}>
            {stats.thisWeekCompleted}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>件</div>
        </div>

        {/* 平均維修天數 */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            padding: '24px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 8px 16px rgba(245, 158, 11, 0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
            <Clock size={80} />
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>
            ⏱️ 平均維修天數
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', marginBottom: '4px' }}>
            {stats.averageRepairDays || 0}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>天</div>
        </div>
      </div>

      {/* 2. 案件狀態分布 - 卡片化設計 */}
      <div
        style={{
          background: 'var(--background, white)',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '32px',
          border: '1px solid var(--border-color, #e5e7eb)',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} />
          案件狀態分布
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            alignItems: 'center',
          }}
        >
          {/* 圓形圖表 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto' }}>
              <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
                {/* 已完修 */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="18"
                  strokeDasharray={`${(completedPercent / 100) * 439.82} 439.82`}
                  strokeLinecap="round"
                />
                {/* 處理中 */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="18"
                  strokeDasharray={`${(inProgressPercent / 100) * 439.82} 439.82`}
                  strokeDashoffset={-((completedPercent / 100) * 439.82)}
                  strokeLinecap="round"
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
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{total}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>總案件</div>
              </div>
            </div>
          </div>

          {/* 統計詳情 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 已完修 */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%)',
                padding: '16px',
                borderRadius: '8px',
                borderLeft: '4px solid #10b981',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                  }}
                />
                <span style={{ fontWeight: '600', fontSize: '14px' }}>已完修</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                  {stats.completedCount}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {completedPercent}%
                </div>
              </div>
            </div>

            {/* 處理中 */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%)',
                padding: '16px',
                borderRadius: '8px',
                borderLeft: '4px solid #3b82f6',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                  }}
                />
                <span style={{ fontWeight: '600', fontSize: '14px' }}>處理中</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                  {stats.inProgressCount}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {inProgressPercent}%
                </div>
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
          gap: '24px',
        }}
      >
        {/* 送修前 5 名學校 */}
        <div
          style={{
            background: 'var(--background, white)',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid var(--border-color, #e5e7eb)',
          }}
        >
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
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>{school.name}</div>
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#3b82f6',
                      minWidth: '28px',
                      textAlign: 'right',
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
        <div
          style={{
            background: 'var(--background, white)',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid var(--border-color, #e5e7eb)',
          }}
        >
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
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>{category.name}</div>
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#f59e0b',
                      minWidth: '28px',
                      textAlign: 'right',
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
