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

  const sectionCardStyle = (borderColor) => ({
    background: 'var(--surface-1)',
    border: '1px solid var(--border)',
    borderLeft: `4px solid ${borderColor}`,
    borderRadius: 'var(--radius)',
    padding: '16px',
    height: '100%',
  });

  const subTitleStyle = {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 12,
    color: 'var(--text-primary)',
    paddingBottom: 8,
    borderBottom: '1px solid var(--border)',
  };

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

      {/* 三大區塊並排 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* 打卡及請假規範 - 藍色 */}
        <div style={sectionCardStyle('#3b82f6')}>
          <h2 style={{ ...subTitleStyle, color: '#3b82f6' }}>📅 打卡及請假規範</h2>

          <div style={{ marginBottom: 14 }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>正常上下班</strong>
            <div style={{ ...contentStyle, marginTop: 6, marginLeft: 12 }}>
              <p style={{ margin: '4px 0' }}>08:00 前打「上班」卡</p>
              <p style={{ margin: '4px 0' }}>17:00 後打「下班」卡</p>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>請假規範</strong>
            <div style={{ ...contentStyle, marginTop: 6, marginLeft: 12 }}>
              <p style={{ margin: '4px 0' }}>病假、事假：可當日申請</p>
              <p style={{ margin: '4px 0' }}>特休：須提前申請</p>
            </div>
          </div>

          <div style={{ marginBottom: 0 }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>忘記打卡</strong>
            <div style={{ ...contentStyle, marginTop: 6, marginLeft: 12 }}>
              <p style={{ margin: '4px 0' }}>每月享有 2 次補簽額度</p>
              <p style={{ margin: '4px 0' }}>超過將依公司規定扣款</p>
            </div>
          </div>
        </div>

        {/* 外出規定 - 橙色 */}
        <div style={sectionCardStyle('#f59e0b')}>
          <h2 style={{ ...subTitleStyle, color: '#f59e0b' }}>🚗 外出規定</h2>

          <div style={{ marginBottom: 14 }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>一般外出任務</strong>
            <div style={{ ...contentStyle, marginTop: 6, marginLeft: 12 }}>
              <p style={{ margin: '4px 0', fontWeight: 500 }}>快速任務</p>
              <p style={{ margin: '2px 0 6px 0', fontSize: 12 }}>單一學校：約 16:00 之後</p>
              <p style={{ margin: '4px 0', fontWeight: 500 }}>託時任務</p>
              <p style={{ margin: '2px 0', fontSize: 12 }}>請備妥處理內容或台數</p>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>巡檢標準</strong>
            <div style={{ ...contentStyle, marginTop: 6, marginLeft: 12, fontSize: 12 }}>
              <p style={{ margin: '3px 0' }}>250+ 台：2 人/半天</p>
              <p style={{ margin: '3px 0' }}>180-249 台：1 人/整天</p>
              <p style={{ margin: '3px 0' }}>61-179 台：1 人/半天</p>
            </div>
          </div>

          <div style={{ marginBottom: 0 }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>地區分類</strong>
            <div style={{ ...contentStyle, marginTop: 6, marginLeft: 12, fontSize: 12 }}>
              <p style={{ margin: '3px 0', fontWeight: 500 }}>市區</p>
              <p style={{ margin: '2px 0 6px 0' }}>鳳山、大寮、三民、新興...</p>
            </div>
          </div>
        </div>

        {/* 黑貓派車規定 - 綠色 */}
        <div style={sectionCardStyle('#10b981')}>
          <h2 style={{ ...subTitleStyle, color: '#10b981' }}>📦 黑貓派車規定</h2>

          <div style={{ marginBottom: 14 }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>營網派車</strong>
            <div style={{ ...contentStyle, marginTop: 6, marginLeft: 12, fontSize: 12 }}>
              <p style={{ margin: '3px 0' }}>✓ 只能選離天收件</p>
              <p style={{ margin: '3px 0' }}>✓ 產生正確無誤單號</p>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>收件資料</strong>
            <div style={{ ...contentStyle, marginTop: 6, marginLeft: 12, fontSize: 12 }}>
              <p style={{ margin: '3px 0' }}>📍 高雄市鳳山區文苑 75 號</p>
              <p style={{ margin: '3px 0' }}>☎️ 07-7260089 #161-167</p>
            </div>
          </div>

          <div style={{ marginBottom: 0 }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>常見問題</strong>
            <div style={{ ...contentStyle, marginTop: 6, marginLeft: 12, fontSize: 12 }}>
              <p style={{ margin: '3px 0' }}>高雄電話：8332</p>
              <p style={{ margin: '3px 0' }}>台南電話：8838</p>
            </div>
          </div>
        </div>
      </div>

      {/* 詳細內容區塊 */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>📋 詳細規範</h2>

        {/* 打卡流程詳細版 */}
        <div style={{ ...sectionCardStyle('#3b82f6'), marginBottom: 16 }}>
          <h3 style={{ ...subTitleStyle, color: '#3b82f6' }}>打卡流程詳解</h3>

          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>（一）當日簽天外出</strong>
            <div style={{ ...contentStyle, marginTop: 6, marginLeft: 12, fontSize: 12 }}>
              <p style={{ margin: '4px 0' }}>08:00 前 先打「上班」卡</p>
              <p style={{ margin: '4px 0' }}>到各地點 臨時打「外出」卡</p>
              <p style={{ margin: '4px 0' }}>17:00 後 打「下班」卡</p>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>（二）上午外出，之後返回</strong>
            <div style={{ ...contentStyle, marginTop: 6, marginLeft: 12, fontSize: 12 }}>
              <p style={{ margin: '4px 0' }}>08:00 前 打「上班」卡</p>
              <p style={{ margin: '4px 0' }}>外出地點 打「外出」卡</p>
              <p style={{ margin: '4px 0' }}>返回辦公室 打「返回」卡</p>
              <p style={{ margin: '4px 0' }}>17:00 後 打「下班」卡</p>
            </div>
          </div>

          <div>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>（三）下午外出，不再返回</strong>
            <div style={{ ...contentStyle, marginTop: 6, marginLeft: 12, fontSize: 12 }}>
              <p style={{ margin: '4px 0' }}>08:00 前 於辦公室打「上班」卡</p>
              <p style={{ margin: '4px 0' }}>出發外出 打「外出」卡</p>
              <p style={{ margin: '4px 0' }}>17:00 後 打「下班」卡</p>
            </div>
          </div>
        </div>

        {/* 外出規定詳細版 */}
        <div style={{ ...sectionCardStyle('#f59e0b'), marginBottom: 16 }}>
          <h3 style={{ ...subTitleStyle, color: '#f59e0b' }}>外出規定詳解</h3>

          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>地區分類完整</strong>
            <div style={{ ...contentStyle, marginTop: 6, marginLeft: 12, fontSize: 12 }}>
              <p style={{ margin: '4px 0', fontWeight: 500 }}>市區</p>
              <p style={{ margin: '2px 0 8px 0' }}>鳳山、大寮、三民、新興、前金、烏松、鼓山、蓋埤、左營、仁武、小港、苦雄、大樹</p>
              <p style={{ margin: '4px 0', fontWeight: 500 }}>非市區</p>
              <p style={{ margin: '2px 0' }}>旗津、路竹、岡山、大社、林園、橋頭、蒸蒂、燕巢、六龜、永安、茂林、桃源</p>
            </div>
          </div>
        </div>

        {/* 黑貓派車詳細版 */}
        <div style={sectionCardStyle('#10b981')}>
          <h3 style={{ ...subTitleStyle, color: '#10b981' }}>黑貓派車詳解</h3>

          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>收件資料完整</strong>
            <div style={{ ...contentStyle, marginTop: 6, marginLeft: 12, fontSize: 12 }}>
              <p style={{ margin: '4px 0', fontWeight: 500 }}>地址</p>
              <p style={{ margin: '2px 0 6px 0' }}>830 高雄市鳳山區文苑 75 號（對面又山國小後）Ubike 旁，快到前務必電聯</p>
              <p style={{ margin: '4px 0', fontWeight: 500 }}>收件人</p>
              <p style={{ margin: '2px 0 6px 0' }}>盖盖科技文山國小點點</p>
              <p style={{ margin: '4px 0', fontWeight: 500 }}>電話</p>
              <p style={{ margin: '2px 0' }}>07-7260089 #161-167</p>
              <p style={{ margin: '2px 0 6px 0' }}>0910165191（公務機）</p>
              <p style={{ margin: '4px 0', color: '#a8631a' }}>⚠️ 公務機勿靜音，需專門接黑貓電話</p>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>常見問題詳細</strong>
            <div style={{ ...contentStyle, marginTop: 6, marginLeft: 12, fontSize: 12 }}>
              <p style={{ margin: '4px 0', fontWeight: 500 }}>Q：誰付費怎麼選？</p>
              <div style={{ marginLeft: 12 }}>
                <p style={{ margin: '2px 0' }}>A1 收回我們 → 「收件者付費」</p>
                <p style={{ margin: '2px 0' }}>A2 派車去B收件，寄回我(C) → 「第三方收費」</p>
              </div>
            </div>
          </div>

          <div>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>文字客服派車（急件）</strong>
            <div style={{ ...contentStyle, marginTop: 6, marginLeft: 12, fontSize: 12 }}>
              <p style={{ margin: '3px 0' }}>✓ 中午前申請，有機會當天收件</p>
              <p style={{ margin: '3px 0' }}>✗ 客服詢問事項較多</p>
              <p style={{ margin: '3px 0' }}>非急件不建議使用</p>
            </div>
          </div>
        </div>
      </div>

      {/* 帳戶管理 - 可折疊 */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>🔑 帳戶管理</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {/* 密碼 - 可折疊 */}
          <div style={sectionCardStyle('#8b5cf6')}>
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
              <div style={{ ...contentStyle, fontSize: 12 }}>
                <p style={{ margin: '4px 0', color: 'var(--warning)', fontWeight: 500 }}>內容待補充...</p>
              </div>
            )}
            {!expandedSections.password && (
              <p style={{ ...contentStyle, fontSize: 12, margin: 0, color: 'var(--text-muted)' }}>點擊展開詳細內容</p>
            )}
          </div>

          {/* MDM標準回覆SOP - 可折疊 */}
          <div style={sectionCardStyle('#ec4899')}>
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
              <div style={{ ...contentStyle, fontSize: 12 }}>
                <p style={{ margin: '4px 0', color: 'var(--warning)', fontWeight: 500 }}>v1.0 - 內容待補充...</p>
              </div>
            )}
            {!expandedSections.mdm && (
              <p style={{ ...contentStyle, fontSize: 12, margin: 0, color: 'var(--text-muted)' }}>點擊展開詳細內容</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
