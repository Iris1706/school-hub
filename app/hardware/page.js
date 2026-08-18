'use client';

import { useState } from 'react';
import PeriodSelector from '@/components/repairs/PeriodSelector';
import CompletedTable from '@/components/repairs/CompletedTable';
import InProgressTable from '@/components/repairs/InProgressTable';
import EditModal from '@/components/repairs/EditModal';

export default function HardwarePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('Pawn');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editData, setEditData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = (data) => {
    setEditData(data);
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (data) => {
    try {
      const response = await fetch('/api/repairs/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetName: data.sheetName,
          rowIndex: data.rowIndex,
          values: data.rowData,
          type: 'inProgress',
        }),
      });

      if (!response.ok) {
        throw new Error('保存失敗');
      }

      alert('保存成功');
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (error) {
      alert(`保存失敗: ${error.message}`);
    }
  };

  const tabButtonStyle = (isActive) => ({
    padding: '8px 16px',
    border: 'none',
    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
    color: isActive ? 'white' : 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    borderRadius: '4px',
    transition: 'all 0.2s',
  });

  return (
    <div>
      <h1 className="page-title">硬體維修</h1>

      {/* 頁籤選擇器 */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: 'var(--background-secondary, #f9f9f9)',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
        </div>
      </div>

      {/* 標籤按鈕 */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setActiveTab('dashboard')}
          style={tabButtonStyle(activeTab === 'dashboard')}
        >
          📊 儀表板
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          style={tabButtonStyle(activeTab === 'completed')}
        >
          ✅ 已完修
        </button>
        <button
          onClick={() => setActiveTab('inProgress')}
          style={tabButtonStyle(activeTab === 'inProgress')}
        >
          🔄 處理中
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          style={tabButtonStyle(activeTab === 'logs')}
        >
          📋 操作日誌
        </button>
      </div>

      {/* 儀表板 */}
      {activeTab === 'dashboard' && (
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
            borderLeft: '3px solid var(--accent)',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
            📊 儀表板 - 內容待定
          </p>
        </div>
      )}

      {/* 已完修 */}
      {activeTab === 'completed' && (
        <div>
          <h3 style={{ marginTop: 0 }}>已完修的維修單</h3>
          <CompletedTable sheetName={selectedPeriod} />
        </div>
      )}

      {/* 處理中 */}
      {activeTab === 'inProgress' && (
        <div>
          <h3 style={{ marginTop: 0 }}>處理中的維修單</h3>
          <InProgressTable
            sheetName={selectedPeriod}
            onEdit={handleEditClick}
          />
        </div>
      )}

      {/* 操作日誌 */}
      {activeTab === 'logs' && (
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%)',
            borderLeft: '3px solid #22c55e',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
            📋 操作日誌 - 記錄所有 {selectedPeriod === 'Pawn' ? '一期' : '二期'}
            生生平板維修的變更紀錄
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>
            日誌分頁名稱：
            {selectedPeriod === 'Pawn' ? '操作日誌1' : '操作日誌2'}
          </p>
        </div>
      )}

      {/* 編輯視窗 */}
      <EditModal
        isOpen={isEditModalOpen}
        data={editData}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
      />
    </div>
  );
}
