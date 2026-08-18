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
    padding: '12px',
  });

  const contentStyle = {
    fontSize: 14,
    lineHeight: 1.6,
    color: 'var(--text-secondary)',
  };

  return (
    <div>
      <h1 className="page-title">教育訓練</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
        SOP 文件、操作手冊與教學資源
      </p>

      {/* 打卡及請假規範 - 大卡片 */}
      <div style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderLeft: '4px solid #3b82f6',
        borderRadius: 'var(--radius)',
        padding: '16px',
        marginBottom: 20
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#3b82f6', marginTop: 0 }}>📅 打卡及請假規範</h2>
        <p style={{ margin: '0 0 16px 0', fontSize: 12, color: 'var(--text-muted)' }}>出勤打卡流程・外出規範・請假說明</p>

        {/* 上面部分 - 左右並排三個項目 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>一、正常上下班（無外出）</h4>
            <p style={{ margin: '3px 0', fontSize: 13 }}>08:00 前打「上班」卡（需定位於辦公室）</p>
            <p style={{ margin: '3px 0', fontSize: 13 }}>17:00 後打「下班」卡（需定位於辦公室）</p>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>請假規範</h4>
            <p style={{ margin: '3px 0', fontSize: 13 }}>・病假、事假：可當日申請</p>
            <p style={{ margin: '3px 0', fontSize: 13 }}>・特休：須提前申請，不可當日提出</p>
            <p style={{ margin: '3px 0', fontSize: 13 }}>外出前至少 30 分鐘送出請假單，假別選「外出」</p>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>忘記打卡提醒</h4>
            <p style={{ margin: '3px 0', fontSize: 13 }}>・每月享有 2 次忘記打卡補登額度</p>
            <p style={{ margin: '3px 0', fontSize: 13 }}>・超過 2 次將依公司規定扣款</p>
            <p style={{ margin: '3px 0', fontSize: 13 }}>請務必記得打卡，以免影響出勤紀錄及薪資</p>
          </div>
        </div>

        {/* 下面部分 - 左到右並排三個項目 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>（一）當日整天外出</h4>
            <p style={{ margin: '3px 0', fontSize: 13 }}>08:00 前不論人在哪裡，先打「上班」卡</p>
            <p style={{ margin: '3px 0', fontSize: 13 }}>外出地點每到一個地點皆需打「外出」卡</p>
            <p style={{ margin: '3px 0', fontSize: 13 }}>17:00 後不論人在哪裡，打「下班」卡</p>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>（二）上午外出，之後返回辦公室</h4>
            <p style={{ margin: '3px 0', fontSize: 13 }}>08:00 前不論人在哪裡，先打「上班」卡</p>
            <p style={{ margin: '3px 0', fontSize: 13 }}>外出地點打「外出」卡</p>
            <p style={{ margin: '3px 0', fontSize: 13 }}>返回辦公室打「返回」卡</p>
            <p style={{ margin: '3px 0', fontSize: 13 }}>17:00 後打「下班」卡</p>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>（三）下午外出，不再返回辦公室</h4>
            <p style={{ margin: '3px 0', fontSize: 13 }}>08:00 前於辦公室打「上班」卡</p>
            <p style={{ margin: '3px 0', fontSize: 13 }}>出發外出打「外出」卡</p>
            <p style={{ margin: '3px 0', fontSize: 13 }}>17:00 後不論人在哪裡，打「下班」卡</p>
          </div>
        </div>
      </div>

      {/* 外出規定 + 打卡App下載 - 並排顯示 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* 外出規定 - 大卡片 */}
        <div style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderLeft: '4px solid #f59e0b',
          borderRadius: 'var(--radius)',
          padding: '16px',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#f59e0b', marginTop: 0 }}>🚗 外出規定</h2>

          {/* 一般外出任務 */}
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>一般外出任務</h4>
          <div style={{ background: '#FFFFAA', padding: '10px 12px', borderRadius: '6px', marginBottom: 16 }}>
            <p style={{ margin: '4px 0', fontWeight: 600, fontSize: 13 }}>快速任務</p>
            <p style={{ margin: '2px 0 8px 0', fontSize: 13 }}>單一學校：約 16:00 之後</p>
            <p style={{ margin: '4px 0', fontWeight: 600, fontSize: 13 }}>耗時任務</p>
            <p style={{ margin: '2px 0', fontSize: 13 }}>請備妥處理內容或台數</p>
          </div>

          {/* 巡檢外出標準 */}
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>巡檢外出標準（兩週未連線台數）</h4>
          <div style={{ background: '#FFFFAA', padding: '10px 12px', borderRadius: '6px', marginBottom: 8 }}>
            <p style={{ margin: '0', fontSize: 13 }}>250 台以上　2 人 / 半天</p>
          </div>
          <div style={{ background: '#FFFFAA', padding: '10px 12px', borderRadius: '6px', marginBottom: 8 }}>
            <p style={{ margin: '0', fontSize: 13 }}>180–249 台　1 人 / 整天</p>
          </div>
          <div style={{ background: '#FFFFAA', padding: '10px 12px', borderRadius: '6px', marginBottom: 8 }}>
            <p style={{ margin: '0', fontSize: 13 }}>61–179 台　1 人 / 半天</p>
          </div>
          <div style={{ background: '#FFFFAA', padding: '10px 12px', borderRadius: '6px', marginBottom: 8 }}>
            <p style={{ margin: '3px 0', fontWeight: 600, fontSize: 13 }}>20–60 台（彈性）</p>
            <p style={{ margin: '2px 0', fontSize: 13 }}>・市區整天：≥ 3 間　非市區整天：≥ 3 間或 2+1</p>
            <p style={{ margin: '2px 0', fontSize: 13 }}>・半天：≥ 2 間或 1+1</p>
          </div>
          <div style={{ background: '#FFFFAA', padding: '10px 12px', borderRadius: '6px', marginBottom: 16 }}>
            <p style={{ margin: '3px 0', fontWeight: 600, fontSize: 13 }}>0–19 台（彈性）</p>
            <p style={{ margin: '2px 0', fontSize: 13 }}>・市區整天：≥ 4 間或 3+1　非市區整天：≥ 3 間</p>
            <p style={{ margin: '2px 0', fontSize: 13 }}>・半天：≥ 2 間或 1+1</p>
          </div>

          {/* 地區分類 */}
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>地區分類</h4>
          <div style={{ background: '#FFFFAA', padding: '10px 12px', borderRadius: '6px', marginBottom: 16 }}>
            <p style={{ margin: '4px 0', fontWeight: 700, fontSize: 13 }}>市區</p>
            <p style={{ margin: '3px 0 8px 0', fontSize: 13 }}>鳳山、大寮、三民、新興、前金、烏松、鼓山、蓋埤、左營、仁武、小港、苦雄、大樹</p>
            <p style={{ margin: '4px 0', fontWeight: 700, fontSize: 13 }}>非市區</p>
            <p style={{ margin: '3px 0', fontSize: 13 }}>旗津、路竹、岡山、大社、林園、橋頭、蒸蒂、燕巢、六龜、永安、茂林、桃源</p>
          </div>

          {/* 注意事項 */}
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>注意事項</h4>
          <div style={{ background: '#FFFFAA', padding: '10px 12px', borderRadius: '6px' }}>
            <p style={{ margin: '3px 0', fontSize: 13 }}>外出時務必使用外出打卡功能，記錄準確位置</p>
            <p style={{ margin: '3px 0', fontSize: 13 }}>回辦公室後需及時打「返回」卡，確保出勤紀錄正確</p>
          </div>
        </div>

        {/* 打卡系統 App 下載 - 大卡片 */}
        <div style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderLeft: '4px solid #8b5cf6',
          borderRadius: 'var(--radius)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 16
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 0, color: '#8b5cf6', marginTop: 0 }}>📱 打卡系統 App 下載</h2>

          <div>
            <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--text-secondary)' }}>MHR 打卡 App，iOS 版本</p>
          </div>

          {/* QR Code */}
          <img
            src="https://qrserver.com/api/render/qr-code/?size=200x200&data=https://download.winton.com.tw/AppCenter/App/Download/Index2?appName=MHR&platform=ios&version=25.00.83.250630&webversion=25.20"
            alt="MHR 打卡 App QR Code"
            style={{ width: 200, height: 200, borderRadius: '6px' }}
          />

          {/* 下載連結 */}
          <a
            href="https://download.winton.com.tw/AppCenter/App/Download/Index2?appName=MHR&platform=ios&version=25.00.83.250630&webversion=25.20"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '10px 16px',
              background: '#8b5cf6',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: 13,
              fontWeight: 600,
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#7c3aed'}
            onMouseLeave={(e) => e.target.style.background = '#8b5cf6'}
          >
            🔗 立即下載
          </a>
        </div>
      </div>

      {/* 黑貓派車規定 - 大卡片 */}
      <div style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderLeft: '4px solid #10b981',
        borderRadius: 'var(--radius)',
        padding: '16px',
        marginBottom: 20
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#10b981', marginTop: 0 }}>📦 黑貓派車規定</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 16 }}>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>一、官網派車（優先使用）</h4>
            <p style={{ margin: '4px 0', fontSize: 13 }}>✅ 只能選隔天收件</p>
            <p style={{ margin: '4px 0', fontSize: 13 }}>✅ 產生正確黑貓單號</p>
            <p style={{ margin: '8px 0 0 0' }}>
              <a href="https://www.takkyubin.com.tw/YMTContract/aspx/Login.aspx" target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 500, fontSize: 13 }}>🔗 官網派車</a>
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>台南／嘉義 帳密</h4>
            <p style={{ margin: '4px 0', fontWeight: 600, fontSize: 13 }}>帳號</p>
            <p style={{ margin: '2px 0 8px 0', fontSize: 13, fontFamily: 'monospace' }}>2848061309</p>
            <p style={{ margin: '4px 0', fontWeight: 600, fontSize: 13 }}>密碼</p>
            <p style={{ margin: '2px 0', fontSize: 13, fontFamily: 'monospace' }}>SA28480613</p>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>高雄 帳密</h4>
            <p style={{ margin: '4px 0', fontWeight: 600, fontSize: 13 }}>帳號</p>
            <p style={{ margin: '2px 0 8px 0', fontSize: 13, fontFamily: 'monospace' }}>2848061341</p>
            <p style={{ margin: '4px 0', fontWeight: 600, fontSize: 13 }}>密碼</p>
            <p style={{ margin: '2px 0 8px 0', fontSize: 13, fontFamily: 'monospace' }}>Sa28480613@@</p>
            <p style={{ margin: '0', fontSize: 12, color: '#a8631a' }}>⚠️ 請勿擅自變更</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 16 }}>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>二、統一收件資料</h4>
            <p style={{ margin: '4px 0', fontWeight: 600, fontSize: 13 }}>地址</p>
            <p style={{ margin: '2px 0 8px 0', fontSize: 13 }}>830 高雄市鳳山區文苑街 75 號</p>
            <p style={{ margin: '4px 0', fontWeight: 600, fontSize: 13 }}>收件人</p>
            <p style={{ margin: '2px 0 8px 0', fontSize: 13 }}>晶盛科技文山國小駐點單位</p>
            <p style={{ margin: '4px 0', fontWeight: 600, fontSize: 13 }}>電話</p>
            <p style={{ margin: '2px 0 2px 0', fontSize: 13 }}>07-7260089 #161–167</p>
            <p style={{ margin: '2px 0', fontSize: 13 }}>0910165191（公務機）</p>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#a8631a' }}>⚠️ 注意</h4>
            <p style={{ margin: '4px 0', fontSize: 13, color: '#a8631a', fontWeight: 500 }}>公務機請勿靜音，需專門接黑貓電話</p>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>三、文字客服派車（急件）</h4>
            <p style={{ margin: '4px 0', fontSize: 13 }}>✅ 中午前申請，有機會當天收件</p>
            <p style={{ margin: '4px 0', fontSize: 13 }}>❌ 客服詢問事項較多</p>
            <p style={{ margin: '8px 0 8px 0', fontSize: 13 }}>非急件不建議使用</p>
            <p style={{ margin: '0' }}>
              <a href="https://neko.t-cat.com.tw/webchat/index.html" target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 500, fontSize: 13 }}>🔗 文字客服入口</a>
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>常見問題</h4>
            <p style={{ margin: '4px 0', fontWeight: 600, fontSize: 13 }}>Q：電話後四碼？</p>
            <p style={{ margin: '2px 0 8px 0', fontSize: 13 }}>• 台南 → 8838（總公司電話）</p>
            <p style={{ margin: '2px 0 8px 0', fontSize: 13 }}>• 高雄 → 8332（三多電話）</p>
            <p style={{ margin: '4px 0', fontWeight: 600, fontSize: 13 }}>Q：誰付費怎麼選？</p>
            <p style={{ margin: '2px 0 2px 0', fontSize: 13 }}>A1 收回我們這 → 選「收件者付費」</p>
            <p style={{ margin: '2px 0', fontSize: 13 }}>A2 派車去B → 選「第三方收費」</p>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>嘉義數辦地址</h4>
            <p style={{ margin: '4px 0', fontWeight: 600, fontSize: 13 }}>地址</p>
            <p style={{ margin: '2px 0 8px 0', fontSize: 13 }}>嘉義市西區四維路 25 號（嘉義市智慧教育中心）</p>
            <p style={{ margin: '4px 0', fontWeight: 600, fontSize: 13 }}>聯絡人</p>
            <p style={{ margin: '2px 0 8px 0', fontSize: 13 }}>蕭博元 Wayne</p>
            <p style={{ margin: '4px 0', fontWeight: 600, fontSize: 13 }}>電話</p>
            <p style={{ margin: '2px 0', fontSize: 13, fontFamily: 'monospace' }}>0955170523</p>
          </div>
        </div>
      </div>

      {/* 帳戶管理區塊 */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>🔑 帳戶管理</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {/* 密碼 - 可折疊 */}
          <div
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderLeft: '4px solid #8b5cf6',
              borderRadius: 'var(--radius)',
              padding: '12px',
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
                fontSize: 14,
                fontWeight: 600,
                color: '#8b5cf6',
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span>🔐 密碼</span>
              <span style={{ fontSize: 14 }}>{expandedSections.password ? '▼' : '▶'}</span>
            </button>
            {expandedSections.password && (
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                <p style={{ margin: '4px 0', color: 'var(--warning)', fontWeight: 500 }}>內容待補充...</p>
              </div>
            )}
            {!expandedSections.password && (
              <p style={{ fontSize: 14, margin: 0, color: 'var(--text-muted)' }}>點擊展開詳細內容</p>
            )}
          </div>

          {/* MDM標準回覆SOP - 可折疊 */}
          <div
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderLeft: '4px solid #ec4899',
              borderRadius: 'var(--radius)',
              padding: '12px',
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
                fontSize: 14,
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
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                <p style={{ margin: '4px 0', color: 'var(--warning)', fontWeight: 500 }}>v1.0 - 內容待補充...</p>
              </div>
            )}
            {!expandedSections.mdm && (
              <p style={{ fontSize: 14, margin: 0, color: 'var(--text-muted)' }}>點擊展開詳細內容</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
