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

  const itemCardStyle = (borderColor) => ({
    background: 'var(--surface-1)',
    border: '1px solid var(--border)',
    borderLeft: `4px solid ${borderColor}`,
    borderRadius: 'var(--radius)',
    padding: '16px',
  });

  const contentStyle = {
    fontSize: 13,
    lineHeight: 1.6,
    color: 'var(--text-secondary)',
  };

  return (
    <div>
      <h1 className="page-title">教育訓練</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
        SOP 文件、操作手冊與教學資源
      </p>

      {/* 打卡及請假規範區塊 */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#3b82f6' }}>📅 打卡及請假規範</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {/* 項目 1 */}
          <div style={itemCardStyle('#3b82f6')}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>一、正常上下班（無外出）</h3>
            <div style={contentStyle}>
              <p style={{ margin: '6px 0' }}>08:00 前 打「上班」卡（需定位於辦公室）</p>
              <p style={{ margin: '6px 0' }}>17:00 後 打「下班」卡（需定位於辦公室）</p>
            </div>
          </div>

          {/* 項目 2 */}
          <div style={itemCardStyle('#3b82f6')}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>請假規範</h3>
            <div style={contentStyle}>
              <p style={{ margin: '6px 0' }}>病假、事假：可當日申請</p>
              <p style={{ margin: '6px 0' }}>特休：須提前申請，不可當日提出</p>
              <p style={{ margin: '6px 0' }}>外出前至少 30 分鐘送出請假單</p>
            </div>
          </div>

          {/* 項目 3 */}
          <div style={itemCardStyle('#3b82f6')}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>忘記打卡提醒</h3>
            <div style={contentStyle}>
              <p style={{ margin: '6px 0' }}>每月享有 2 次補簽額度</p>
              <p style={{ margin: '6px 0' }}>超過 2 次將依公司規定扣款</p>
              <p style={{ margin: '6px 0' }}>請務必記打卡，以免影響薪資</p>
            </div>
          </div>

          {/* 項目 4 */}
          <div style={itemCardStyle('#3b82f6')}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>（一）當日簽天外出</h3>
            <div style={contentStyle}>
              <p style={{ margin: '6px 0' }}>08:00 前 先打「上班」卡</p>
              <p style={{ margin: '6px 0' }}>各地點 臨時打「外出」卡</p>
              <p style={{ margin: '6px 0' }}>17:00 後 打「下班」卡</p>
            </div>
          </div>

          {/* 項目 5 */}
          <div style={itemCardStyle('#3b82f6')}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>（二）上午外出，之後返回</h3>
            <div style={contentStyle}>
              <p style={{ margin: '6px 0' }}>08:00 前 先打「上班」卡</p>
              <p style={{ margin: '6px 0' }}>外出地點 打「外出」卡</p>
              <p style={{ margin: '6px 0' }}>返回辦公室 打「返回」卡</p>
              <p style={{ margin: '6px 0' }}>17:00 後 打「下班」卡</p>
            </div>
          </div>

          {/* 項目 6 */}
          <div style={itemCardStyle('#3b82f6')}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>（三）下午外出，不再返回</h3>
            <div style={contentStyle}>
              <p style={{ margin: '6px 0' }}>08:00 前 於辦公室打「上班」卡</p>
              <p style={{ margin: '6px 0' }}>出發外出 打「外出」卡</p>
              <p style={{ margin: '6px 0' }}>17:00 後 打「下班」卡</p>
            </div>
          </div>
        </div>
      </div>

      {/* 外出規定區塊 */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#f59e0b' }}>🚗 外出規定</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {/* 項目 1 */}
          <div style={itemCardStyle('#f59e0b')}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>一般外出任務</h3>
            <div style={contentStyle}>
              <p style={{ margin: '4px 0', fontWeight: 500 }}>快速任務</p>
              <p style={{ margin: '2px 0 8px 0', fontSize: 12 }}>單一學校：約 16:00 之後</p>
              <p style={{ margin: '4px 0', fontWeight: 500 }}>託時任務</p>
              <p style={{ margin: '2px 0', fontSize: 12 }}>請備妥處理內容或台數</p>
            </div>
          </div>

          {/* 項目 2 */}
          <div style={itemCardStyle('#f59e0b')}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>巡檢標準（兩週未連線台數）</h3>
            <div style={contentStyle}>
              <p style={{ margin: '4px 0', fontSize: 12 }}>250+ 台：2 人/半天</p>
              <p style={{ margin: '4px 0', fontSize: 12 }}>180-249 台：1 人/整天</p>
              <p style={{ margin: '4px 0', fontSize: 12 }}>61-179 台：1 人/半天</p>
              <p style={{ margin: '4px 0', fontSize: 12 }}>20-60 台：彈性</p>
              <p style={{ margin: '4px 0', fontSize: 12 }}>0-19 台：彈性</p>
            </div>
          </div>

          {/* 項目 3 */}
          <div style={itemCardStyle('#f59e0b')}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>地區分類</h3>
            <div style={contentStyle}>
              <p style={{ margin: '4px 0', fontWeight: 500, fontSize: 12 }}>市區</p>
              <p style={{ margin: '2px 0 8px 0', fontSize: 11 }}>鳳山、大寮、三民、新興、前金、烏松、鼓山、蓋埤、左營、仁武、小港、苦雄、大樹</p>
              <p style={{ margin: '4px 0', fontWeight: 500, fontSize: 12 }}>非市區</p>
              <p style={{ margin: '2px 0', fontSize: 11 }}>旗津、路竹、岡山、大社、林園、橋頭、蒸蒂、燕巢、六龜、永安、茂林、桃源</p>
            </div>
          </div>
        </div>
      </div>

      {/* 黑貓派車規定區塊 */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#10b981' }}>📦 黑貓派車規定</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {/* 項目 1 */}
          <div style={itemCardStyle('#10b981')}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>一、營網派車（優先使用）</h3>
            <div style={contentStyle}>
              <p style={{ margin: '6px 0', fontSize: 12 }}>✓ 只能選離天收件</p>
              <p style={{ margin: '6px 0', fontSize: 12 }}>✓ 產生正確無誤單號</p>
              <p style={{ margin: '6px 0', fontSize: 12 }}>（可正常查詢）</p>
            </div>
          </div>

          {/* 項目 2 */}
          <div style={itemCardStyle('#10b981')}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>二、統一收件資料</h3>
            <div style={contentStyle}>
              <p style={{ margin: '4px 0', fontWeight: 500, fontSize: 12 }}>地址</p>
              <p style={{ margin: '2px 0 6px 0', fontSize: 11 }}>830 高雄市鳳山區文苑 75 號</p>
              <p style={{ margin: '4px 0', fontWeight: 500, fontSize: 12 }}>收件人</p>
              <p style={{ margin: '2px 0 6px 0', fontSize: 11 }}>盖盖科技文山國小點點</p>
              <p style={{ margin: '4px 0', fontWeight: 500, fontSize: 12 }}>電話</p>
              <p style={{ margin: '2px 0', fontSize: 11 }}>07-7260089 #161-167</p>
            </div>
          </div>

          {/* 項目 3 */}
          <div style={itemCardStyle('#10b981')}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>常見問題</h3>
            <div style={contentStyle}>
              <p style={{ margin: '4px 0', fontWeight: 500, fontSize: 12 }}>電話後四碼</p>
              <p style={{ margin: '2px 0 6px 0', fontSize: 11 }}>台南→8838 / 高雄→8332</p>
              <p style={{ margin: '4px 0', fontWeight: 500, fontSize: 12 }}>費用選擇</p>
              <p style={{ margin: '2px 0', fontSize: 11 }}>收回我們→「收件者付費」</p>
              <p style={{ margin: '2px 0', fontSize: 11 }}>派車去B→「第三方收費」</p>
            </div>
          </div>

          {/* 項目 4 */}
          <div style={itemCardStyle('#10b981')}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>四、文字客服派車（急件）</h3>
            <div style={contentStyle}>
              <p style={{ margin: '6px 0', fontSize: 12 }}>✓ 中午前申請，有機會當天收件</p>
              <p style={{ margin: '6px 0', fontSize: 12 }}>✗ 客服詢問事項較多</p>
              <p style={{ margin: '6px 0', fontSize: 12 }}>非急件不建議使用</p>
            </div>
          </div>
        </div>
      </div>

      {/* 帳戶管理區塊 */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>🔑 帳戶管理</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {/* 密碼 - 可折疊 */}
          <div
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderLeft: '4px solid #8b5cf6',
              borderRadius: 'var(--radius)',
              padding: '16px',
            }}
          >
            <button
              onClick={() => toggleSection('password')}
              style={{
                width: '100%',
                padding: 0,
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: '#8b5cf6',
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span>🔐 密碼</span>
              <span style={{ fontSize: 12 }}>{expandedSections.password ? '▼' : '▶'}</span>
            </button>
            {expandedSections.password && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                <p style={{ margin: '4px 0', color: 'var(--warning)', fontWeight: 500 }}>內容待補充...</p>
              </div>
            )}
            {!expandedSections.password && (
              <p style={{ fontSize: 12, margin: 0, color: 'var(--text-muted)' }}>點擊展開詳細內容</p>
            )}
          </div>

          {/* MDM標準回覆SOP - 可折疊 */}
          <div
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderLeft: '4px solid #ec4899',
              borderRadius: 'var(--radius)',
              padding: '16px',
            }}
          >
            <button
              onClick={() => toggleSection('mdm')}
              style={{
                width: '100%',
                padding: 0,
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: '#ec4899',
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span>📋 MDM標準回覆SOP</span>
              <span style={{ fontSize: 12 }}>{expandedSections.mdm ? '▼' : '▶'}</span>
            </button>
            {expandedSections.mdm && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                <p style={{ margin: '4px 0', color: 'var(--warning)', fontWeight: 500 }}>v1.0 - 內容待補充...</p>
              </div>
            )}
            {!expandedSections.mdm && (
              <p style={{ fontSize: 12, margin: 0, color: 'var(--text-muted)' }}>點擊展開詳細內容</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
