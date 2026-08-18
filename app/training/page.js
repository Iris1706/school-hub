'use client';
import { useState } from 'react';

export default function TrainingPage() {
  const [expandedSections, setExpandedSections] = useState({
    password: false,
    mdm: false,
  });

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  return (
    <div>
      <h1 className="page-title">教育訓練</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
        SOP 文件、操作手冊與教學資源
      </p>

      {/* 帳戶管理區塊 */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>
          帳戶管理
        </h2>

        {/* 密碼 - 可折疊 */}
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            marginBottom: 12,
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => toggleSection('password')}
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--surface-1)',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            <span>🔐 密碼</span>
            <span>{expandedSections.password ? '▼' : '▶'}</span>
          </button>
          {expandedSections.password && (
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
              {/* 內容待補充 */}
              <p style={{ margin: '0 0 8px 0' }}>內容準備中...</p>
            </div>
          )}
        </div>

        {/* MDM標準回覆SOP - 可折疊 */}
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            marginBottom: 12,
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => toggleSection('mdm')}
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--surface-1)',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            <span>📋 MDM標準回覆SOP</span>
            <span>{expandedSections.mdm ? '▼' : '▶'}</span>
          </button>
          {expandedSections.mdm && (
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
              {/* 內容待補充 */}
              <p style={{ margin: '0 0 8px 0' }}>內容準備中...</p>
            </div>
          )}
        </div>
      </div>

      {/* 其他區塊可在此新增 */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
          borderLeft: '3px solid var(--accent)',
          padding: 20,
          borderRadius: 8,
          marginTop: 24,
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          ℹ️ 其他教學資源區塊準備中...
        </p>
      </div>
    </div>
  );
}
