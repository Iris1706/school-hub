'use client';

import { useState } from 'react';
import styles from '@/app/page.module.css';

export default function ReportGenerator() {
  const [dateRange, setDateRange] = useState('week'); // 'week' 或 'month'
  const [selectedReports, setSelectedReports] = useState({
    weekHighlight: true,
    weekSchedule: true,
    yearlyStats: true,
    personalCaseCount: true,
    dailyStats: true,
    weeklyRepairs: true,
    southAreaRepairs: true,
    inspectionProgress: true,
    personalInspectionProgress: true,
    kaohsiungInspectionReport: true,
  });

  const reportList = [
    { id: 'weekHighlight', label: '本週重點', visible: true },
    { id: 'weekSchedule', label: '本週班表', visible: true },
    { id: 'yearlyStats', label: '年度統計', visible: true },
    { id: 'personalCaseCount', label: '個人處理案件數（本週）', visible: true },
    { id: 'dailyStats', label: '每日統計與問題分類', visible: true },
    { id: 'weeklyRepairs', label: '本週報修明細', visible: true },
    { id: 'southAreaRepairs', label: '南區維修情況', visible: true },
    { id: 'inspectionProgress', label: '巡檢進度', visible: true },
    { id: 'personalInspectionProgress', label: '巡檢個人進度（學期）', visible: true },
    { id: 'kaohsiungInspectionReport', label: '高雄巡檢報告（週別）', visible: true },
  ];

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleExport = (format) => {
    console.log(`匯出為 ${format}`);
    // 待實作匯出功能
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* 標題 */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
          報表產生器
        </h1>
      </div>

      {/* 篩選區域 + 匯出功能 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
        }}
      >
        {/* 左側：日期範圍篩選 */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '10px' }}>
              日期範圍：
            </label>
            <button
              onClick={() => handleDateRangeChange('week')}
              style={{
                padding: '8px 16px',
                marginRight: '10px',
                backgroundColor: dateRange === 'week' ? '#2563eb' : '#e5e7eb',
                color: dateRange === 'week' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              每週
            </button>
            <button
              onClick={() => handleDateRangeChange('month')}
              style={{
                padding: '8px 16px',
                backgroundColor: dateRange === 'month' ? '#2563eb' : '#e5e7eb',
                color: dateRange === 'month' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              每月
            </button>
          </div>
        </div>

        {/* 右側：匯出功能 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleExport('PDF')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            📄 PDF
          </button>
          <button
            onClick={() => handleExport('PNG')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffa500',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            🖼️ PNG
          </button>
          <button
            onClick={() => handleExport('HTML')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            🌐 HTML
          </button>
        </div>
      </div>

      {/* 預覽區域 */}
      <div
        style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          minHeight: '600px',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
          報表預覽
        </h2>

        {/* 報表內容將在此顯示 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {reportList.map((report) => (
            <div
              key={report.id}
              style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                {report.label}
              </h3>
              <p style={{ color: '#666', fontSize: '14px' }}>
                [此處將顯示 {report.label} 的報表內容]
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
