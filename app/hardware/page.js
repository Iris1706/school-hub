'use client';

import { useState } from 'react';
import RepairDashboard from '@/components/repairs/RepairDashboard-v2';
import CompletedTable from '@/components/repairs/CompletedTable-v2';
import InProgressTable from '@/components/repairs/InProgressTable-v2';
import CompleteModal from '@/components/repairs/CompleteModal';
import EditModal from '@/components/repairs/EditModal';
import AddModal from '@/components/repairs/AddModal';

export default function HardwarePage() {
  const [sheetName, setSheetName] = useState('Pawn');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [completeModal, setCompleteModal] = useState({
    isOpen: false,
    rowData: null,
    rowIndex: null,
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    rowData: null,
    rowIndex: null,
  });
  const [addModal, setAddModal] = useState({
    isOpen: false,
  });

  const handleShowCompleteModal = (rowIndex, rowData) => {
    setCompleteModal({
      isOpen: true,
      rowData,
      rowIndex,
    });
  };

  const handleShowEditModal = (rowIndex, rowData) => {
    setEditModal({
      isOpen: true,
      rowData,
      rowIndex,
    });
  };

  const handleCloseCompleteModal = () => {
    setCompleteModal({
      isOpen: false,
      rowData: null,
      rowIndex: null,
    });
  };

  const handleCloseEditModal = () => {
    setEditModal({
      isOpen: false,
      rowData: null,
      rowIndex: null,
    });
  };

  const handleShowAddModal = () => {
    setAddModal({
      isOpen: true,
    });
  };

  const handleCloseAddModal = () => {
    setAddModal({
      isOpen: false,
    });
  };

  const handleCompleteSuccess = () => {
    // Refresh data by triggering a refetch
    setSheetName((prev) => prev);
  };

  const handleEditSuccess = () => {
    // Refresh data by triggering a refetch
    setSheetName((prev) => prev);
  };

  return (
    <div style={{ width: '100%', padding: '24px' }}>
      {/* Sheet Selector */}
      <div style={{ marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <label style={{ fontWeight: '600', fontSize: '14px' }}>選擇標案:</label>
        <select
          value={sheetName}
          onChange={(e) => setSheetName(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          <option value="Pawn">一期生生平板維修</option>
          <option value="二期生生平板維修">二期生生平板維修</option>
        </select>
      </div>

      {/* Tab Buttons */}
      <div style={{ marginBottom: '32px', display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            background: activeTab === 'dashboard' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'dashboard' ? 'white' : '#374151',
            transition: 'all 0.2s',
          }}
        >
          儀表板
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            background: activeTab === 'completed' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'completed' ? 'white' : '#374151',
            transition: 'all 0.2s',
          }}
        >
          ✅ 已完修
        </button>
        <button
          onClick={() => setActiveTab('inProgress')}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            background: activeTab === 'inProgress' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'inProgress' ? 'white' : '#374151',
            transition: 'all 0.2s',
          }}
        >
          ⚙️ 處理中
        </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleShowAddModal}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              background: '#10b981',
              color: 'white',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#059669';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#10b981';
            }}
          >
            ➕ 新增維修
          </button>
          <button
            onClick={() => setSheetName((prev) => prev)}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              background: 'white',
              color: '#374151',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
            }}
          >
            🔄 重新整理
          </button>
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div style={{ marginBottom: '40px' }}>
          <RepairDashboard sheetName={sheetName} />
        </div>
      )}

      {/* Completed Repairs Tab */}
      {activeTab === 'completed' && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0' }}>✅ 已完修</h2>
          </div>
          <div
            style={{
              background: 'var(--background, white)',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: '24px',
              border: '1px solid var(--border-color, #e5e7eb)',
            }}
          >
            <CompletedTable sheetName={sheetName} />
          </div>
        </div>
      )}

      {/* In Progress Repairs Tab */}
      {activeTab === 'inProgress' && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0' }}>⚙️ 處理中</h2>
          </div>
          <div
            style={{
              background: 'var(--background, white)',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: '24px',
              border: '1px solid var(--border-color, #e5e7eb)',
            }}
          >
            <InProgressTable
              sheetName={sheetName}
              onShowCompleteModal={handleShowCompleteModal}
              onShowEditModal={handleShowEditModal}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <CompleteModal
        isOpen={completeModal.isOpen}
        rowData={completeModal.rowData}
        rowIndex={completeModal.rowIndex}
        sheetName={sheetName}
        onClose={handleCloseCompleteModal}
        onSuccess={handleCompleteSuccess}
      />

      <EditModal
        isOpen={editModal.isOpen}
        rowData={editModal.rowData}
        rowIndex={editModal.rowIndex}
        sheetName={sheetName}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />

      <AddModal
        isOpen={addModal.isOpen}
        sheetName={sheetName}
        onClose={handleCloseAddModal}
        onSuccess={() => {
          setSheetName((prev) => prev);
          handleCloseAddModal();
        }}
      />
    </div>
  );
}
