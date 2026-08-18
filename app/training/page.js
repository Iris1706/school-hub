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

  const sectionStyle = {
    marginBottom: 24,
  };

  const titleStyle = {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12,
    color: 'var(--text-primary)',
  };

  const contentBoxStyle = {
    background: 'var(--surface-1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px',
    marginBottom: 12,
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

      {/* 打卡及請假規範 */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>📅 打卡及請假規範</h2>
        <p style={{ ...contentBoxStyle, marginBottom: 12, padding: 0 }}>
          出勤打卡流程、外出規範、請假說明
        </p>

        <div style={contentBoxStyle}>
          <strong style={{ color: 'var(--text-primary)' }}>一、正常上下班（無外出）</strong>
          <div style={{ marginTop: 8, marginLeft: 16 }}>
            <p style={{ margin: '6px 0' }}>08:00 前 打「上班」卡（需定位於辦公室）</p>
            <p style={{ margin: '6px 0' }}>17:00 後 打「下班」卡（需定位於辦公室）</p>
          </div>
        </div>

        <div style={contentBoxStyle}>
          <strong style={{ color: 'var(--text-primary)' }}>請假規範</strong>
          <div style={{ marginTop: 8, marginLeft: 16 }}>
            <p style={{ margin: '6px 0' }}>病假、事假：可當日申請</p>
            <p style={{ margin: '6px 0' }}>特休：須提前申請，不可當日提出</p>
            <p style={{ margin: '6px 0' }}>外出前至少 30 分鐘送出請假單，假別選「外出」</p>
          </div>
        </div>

        <div style={contentBoxStyle}>
          <strong style={{ color: 'var(--text-primary)' }}>忘記打卡提醒</strong>
          <div style={{ marginTop: 8, marginLeft: 16 }}>
            <p style={{ margin: '6px 0' }}>每月享有 2 次忘記打卡補簽額度</p>
            <p style={{ margin: '6px 0' }}>超過 2 次將依公司規定扣款</p>
            <p style={{ margin: '6px 0' }}>請務必記打卡，以免影響出勤紀錄及薪資</p>
          </div>
        </div>

        <div style={contentBoxStyle}>
          <strong style={{ color: 'var(--text-primary)' }}>（一）當日簽天外出</strong>
          <div style={{ marginTop: 8, marginLeft: 16 }}>
            <p style={{ margin: '6px 0' }}>08:00 前 不論入在哪裡，先打「上班」卡</p>
            <p style={{ margin: '6px 0' }}>外出地點 每到一個地點臨時打「外出」卡</p>
            <p style={{ margin: '6px 0' }}>17:00 後 不論入在哪裡，打「下班」卡</p>
          </div>
        </div>

        <div style={contentBoxStyle}>
          <strong style={{ color: 'var(--text-primary)' }}>（二）上午外出，之後返回辦公室</strong>
          <div style={{ marginTop: 8, marginLeft: 16 }}>
            <p style={{ margin: '6px 0' }}>08:00 前 不論入在哪裡，先打「上班」卡</p>
            <p style={{ margin: '6px 0' }}>外出地點 打「外出」卡</p>
            <p style={{ margin: '6px 0' }}>返回辦公室 打「返回」卡</p>
            <p style={{ margin: '6px 0' }}>17:00 後 打「下班」卡</p>
          </div>
        </div>

        <div style={contentBoxStyle}>
          <strong style={{ color: 'var(--text-primary)' }}>（三）下午外出，不再返回辦公室</strong>
          <div style={{ marginTop: 8, marginLeft: 16 }}>
            <p style={{ margin: '6px 0' }}>08:00 前 於辦公室打「上班」卡</p>
            <p style={{ margin: '6px 0' }}>出發外出 打「外出」卡</p>
            <p style={{ margin: '6px 0' }}>17:00 後 不論入在哪裡，打「下班」卡</p>
          </div>
        </div>
      </div>

      {/* 外出規定 */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>🚗 外出規定</h2>
        <p style={{ ...contentBoxStyle, marginBottom: 12, padding: 0 }}>
          外出任務時間安排、巡檢標準、地區分類
        </p>

        <div style={contentBoxStyle}>
          <strong style={{ color: 'var(--text-primary)' }}>一般外出任務</strong>
          <div style={{ marginTop: 8, marginLeft: 16 }}>
            <p style={{ margin: '8px 0 6px 0', fontWeight: 500, color: 'var(--text-primary)' }}>快速任務（夾異物換線、回收/送返平板）</p>
            <div style={{ marginLeft: 16 }}>
              <p style={{ margin: '4px 0' }}>單一學校：統一約 16:00 之後</p>
              <p style={{ margin: '4px 0' }}>怕邊放學：可約 16:20 之後</p>
              <p style={{ margin: '4px 0' }}>警衛室基本到 18:00</p>
            </div>
            <p style={{ margin: '8px 0 6px 0', fontWeight: 500, color: 'var(--text-primary)' }}>託時任務（DFU、重置平板、技術支援）</p>
            <div style={{ marginLeft: 16 }}>
              <p style={{ margin: '4px 0' }}>請備妥處理內容或台數</p>
            </div>
            <p style={{ margin: '8px 0 6px 0' }}>廠商自行評估合理出時間</p>
          </div>
        </div>

        <div style={contentBoxStyle}>
          <strong style={{ color: 'var(--text-primary)' }}>巡檢外出標準（兩週未連線台數）</strong>
          <div style={{ marginTop: 8, marginLeft: 16 }}>
            <p style={{ margin: '4px 0' }}>250 台以上：2 人/半天</p>
            <p style={{ margin: '4px 0' }}>180-249 台：1 人/整天</p>
            <p style={{ margin: '4px 0' }}>61-179 台：1 人/半天</p>
            <p style={{ margin: '4px 0' }}>20-60 台（彈性）：市區整天 ≥ 3 間、非市區整天 ≥ 3 間或半天 2+1</p>
            <p style={{ margin: '4px 0' }}>0-19 台（彈性）：市區整天 ≥ 4 間 3+1、非市區整天 ≥ 3 間</p>
          </div>
        </div>

        <div style={contentBoxStyle}>
          <strong style={{ color: 'var(--text-primary)' }}>地區分類（數辦課程 30 分鐘為界）</strong>
          <div style={{ marginTop: 8, marginLeft: 16 }}>
            <p style={{ margin: '6px 0', fontWeight: 500 }}>市區</p>
            <p style={{ margin: '4px 0 8px 0' }}>鳳山、大寮、三民、新興、前金、烏松、鼓山、蓋埤、左營、仁武、小港、苦雄、大樹</p>
            <p style={{ margin: '6px 0', fontWeight: 500 }}>非市區</p>
            <p style={{ margin: '4px 0' }}>旗津、路竹、岡山、大社、林園、橋頭、蒸蒂、燕巢、六龜、永安、茂林、桃源</p>
          </div>
        </div>
      </div>

      {/* 黑貓派車規定 */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>📦 黑貓派車規定</h2>
        <p style={{ ...contentBoxStyle, marginBottom: 12, padding: 0 }}>
          營網派車、收件資料、常見問題
        </p>

        <div style={contentBoxStyle}>
          <strong style={{ color: 'var(--text-primary)' }}>一、營網派車（優先使用）</strong>
          <div style={{ marginTop: 8, marginLeft: 16 }}>
            <p style={{ margin: '4px 0' }}>✓ 只能選離天收件</p>
            <p style={{ margin: '4px 0' }}>✓ 產生正確無誤單號（可正常查詢）</p>
            <p style={{ margin: '4px 0' }}>🔗 黑貓宅急便網路派車</p>
          </div>
        </div>

        <div style={contentBoxStyle}>
          <strong style={{ color: 'var(--text-primary)' }}>二、統一收件資料</strong>
          <div style={{ marginTop: 8, marginLeft: 16 }}>
            <p style={{ margin: '6px 0', fontWeight: 500 }}>地址</p>
            <p style={{ margin: '4px 0 8px 0' }}>830 高雄市鳳山區文苑 75 號（對面又山國小後）Ubike 旁，快到前務必電聯</p>
            <p style={{ margin: '6px 0', fontWeight: 500 }}>收件人</p>
            <p style={{ margin: '4px 0 8px 0' }}>盖盖科技文山國小點點</p>
            <p style={{ margin: '6px 0', fontWeight: 500 }}>電話</p>
            <p style={{ margin: '4px 0' }}>07-7260089 #161-167</p>
            <p style={{ margin: '4px 0 8px 0' }}>0910165191（公務機）</p>
            <p style={{ margin: '6px 0', color: '#a8631a', fontWeight: 500 }}>⚠️ 注意</p>
            <p style={{ margin: '4px 0' }}>公務機勿勿靜音，需專門接黑貓電話</p>
          </div>
        </div>

        <div style={contentBoxStyle}>
          <strong style={{ color: 'var(--text-primary)' }}>常見問題</strong>
          <div style={{ marginTop: 8, marginLeft: 16 }}>
            <p style={{ margin: '6px 0', fontWeight: 500 }}>Q：電話後四碼？</p>
            <div style={{ marginLeft: 16 }}>
              <p style={{ margin: '4px 0' }}>台南 → 8838（絕公電話）</p>
              <p style={{ margin: '4px 0' }}>高雄 → 8332（三多電話）</p>
            </div>
            <p style={{ margin: '8px 0 6px 0', fontWeight: 500 }}>Q：誰付費怎麼選？</p>
            <div style={{ marginLeft: 16 }}>
              <p style={{ margin: '4px 0' }}>A1 收回我們 → 選「收件者付費」</p>
              <p style={{ margin: '4px 0' }}>A2 派車去 B 收件，寄回我（C）→ 選「第三方收費」</p>
            </div>
          </div>
        </div>

        <div style={contentBoxStyle}>
          <strong style={{ color: 'var(--text-primary)' }}>四、文字客服派車（急件）</strong>
          <div style={{ marginTop: 8, marginLeft: 16 }}>
            <p style={{ margin: '4px 0' }}>✓ 中午前申請，有機會當天收件</p>
            <p style={{ margin: '4px 0' }}>✗ 客服詢問事項較多</p>
            <p style={{ margin: '4px 0' }}>非急件不建議使用</p>
            <p style={{ margin: '8px 0 0 0' }}>🔗 文字客服入口</p>
          </div>
        </div>
      </div>

      {/* 帳戶管理 */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}>🔑 帳戶管理</h2>
        <p style={{ ...contentBoxStyle, marginBottom: 12, padding: 0 }}>
          各系統帳號密碼、限制點 A 員使用
        </p>

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
              borderRadius: 'var(--radius)',
            }}
            onMouseOver={(e) => (e.target.style.background = 'var(--accent-bg)')}
            onMouseOut={(e) => (e.target.style.background = 'var(--surface-1)')}
          >
            <span>🔐 密碼</span>
            <span style={{ fontSize: 12 }}>{expandedSections.password ? '▼' : '▶'}</span>
          </button>
          {expandedSections.password && (
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
              <p style={{ margin: '0 0 8px 0', color: 'var(--warning)', fontWeight: 500 }}>內容待補充...</p>
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
              borderRadius: 'var(--radius)',
            }}
            onMouseOver={(e) => (e.target.style.background = 'var(--accent-bg)')}
            onMouseOut={(e) => (e.target.style.background = 'var(--surface-1)')}
          >
            <span>📋 MDM標準回覆SOP</span>
            <span style={{ fontSize: 12 }}>{expandedSections.mdm ? '▼' : '▶'}</span>
          </button>
          {expandedSections.mdm && (
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
              <p style={{ margin: '0 0 8px 0', color: 'var(--warning)', fontWeight: 500 }}>v1.0 - 內容待補充...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
