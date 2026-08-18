'use client';

import { useState } from 'react';
import RepairDashboard from '@/components/repairs/RepairDashboard-v2';
import CompletedTable from '@/components/repairs/CompletedTable-v2';
import InProgressTable from '@/components/repairs/InProgressTable-v2';
import CompleteModal from '@/components/repairs/CompleteModal';
import EditModal from '@/components/repairs/EditModal';

export default function HardwarePage() {
  const [sheetDisplayName, setSheetDisplayName] = useState('一期生生平板維修');
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

  // Map display name to actual sheet name
  const sheetName = sheetDisplayName === '一期生生平板維修' ? 'Pawn' : '二期生生平板維修';

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

  const handleCompleteSuccess = () => {
    // Refresh data by triggering a refetch
    setSheetDisplayName((prev) => prev);
  };

  const handleEditSuccess = () => {
    // Refresh data by triggering a refetch
    setSheetDisplayName((prev) => prev);
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Sheet Selector */}
      <div style={{ marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <label style={{ fontWeight: '600', fontSize: '14px' }}>選擇維修分頁:</label>
        <select
          value={sheetDisplayName}
          onChange={(e) => setSheetDisplayName(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          <option value="一期生生平板維修">一期生生平板維修</option>
          <option value="二期生生平板維修">二期生生平板維修</option>
        </select>
      </div>

      {/* Dashboard */}
      <div style={{ marginBottom: '40px' }}>
        <RepairDashboard sheetName={sheetName} />
      </div>

      {/* Completed Repairs Section */}
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

      {/* In Progress Repairs Section */}
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
    </div>
  );
}
