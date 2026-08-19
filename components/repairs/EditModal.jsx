'use client';

import { useState } from 'react';
import { X, Edit2 } from 'lucide-react';

export default function EditModal({ isOpen, rowData, rowIndex, sheetName, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    createdDate: rowData?.[0] || '',
    repairNumber: rowData?.[1] || '',
    school: rowData?.[2] || '',
    category: rowData?.[3] || '',
    originalSerial: rowData?.[4] || '',
    progress: rowData?.[5] || '',
    asmAccount: rowData?.[6] || '',
    asmCancel: rowData?.[7] || '',
    preStage: rowData?.[8] || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validate = () => {
    // 編輯時不強制填寫欄位
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      // 轉換日期格式 yyyy-mm-dd -> yyyy/mm/dd
      const formattedDate = formData.createdDate
        ? formData.createdDate.replace(/-/g, '/')
        : (rowData?.[0] || '');

      // 只更新有值的欄位，其他保持原值
      const values = [
        formattedDate,
        formData.repairNumber || rowData?.[1] || '',
        formData.school || rowData?.[2] || '',
        formData.category || rowData?.[3] || '',
        formData.originalSerial || rowData?.[4] || '',
        formData.progress || rowData?.[5] || '',
        formData.asmAccount || rowData?.[6] || '',
        formData.asmCancel || rowData?.[7] || '',
        formData.preStage || rowData?.[8] || '',
        rowData?.[9] || '', // 其他欄位（保持不變）
      ];

      const response = await fetch('/api/repairs/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetName,
          rowIndex: rowIndex + 3, // 轉換為實際行號（API返回的是0-based，實際行號從3開始）
          values,
          type: 'inProgress',
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '編輯失敗');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
      console.error('編輯錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      {/* 3D Modal Card */}
      <div
        style={{
          background: 'var(--background, white)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.15)',
          maxWidth: '500px',
          width: '90%',
          padding: '32px',
          position: 'relative',
          transform: 'translateZ(20px)',
          animation: 'slideUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f3f4f6';
            e.target.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = '#6b7280';
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Edit2 size={24} color="#3b82f6" />
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>編輯維修項目</h2>
        </div>

        {/* Form Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '16px', textTransform: 'uppercase' }}>
            維修資訊
          </div>

          {/* Created Date and Repair Number - Side by side */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {/* Created Date */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                建立日期
              </label>
              <input
                type="date"
                name="createdDate"
                value={formData.createdDate}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Repair Number */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                維修單號
              </label>
              <input
                type="text"
                name="repairNumber"
                placeholder="輸入維修單號"
                value={formData.repairNumber}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* School and Category - Side by side */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {/* School */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                學校
              </label>
              <input
                type="text"
                name="school"
                placeholder="輸入學校名稱"
                value={formData.school}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                問題分類
              </label>
              <input
                type="text"
                name="category"
                placeholder="輸入問題分類"
                value={formData.category}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Original Serial - Full Width */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              原序號
            </label>
            <input
              type="text"
              name="originalSerial"
              placeholder="輸入原序號"
              value={formData.originalSerial}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Progress - Button Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              進度
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['已開單', '維修待處理', '維修中', '報價中', '已完成'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, progress: status }));
                    setError('');
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: formData.progress === status ? '2px solid #3b82f6' : '1px solid #d1d5db',
                    background: formData.progress === status ? '#FFFBEB' : 'white',
                    color: formData.progress === status ? '#1f2937' : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: formData.progress === status ? '600' : '500',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (formData.progress !== status) {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.background = '#f0f9ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.progress !== status) {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.background = 'white';
                    }
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* ASM Account and Cancel - Side by side */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {/* ASM Account */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                ASM帳號
              </label>
              <input
                type="text"
                name="asmAccount"
                placeholder="輸入ASM帳號"
                value={formData.asmAccount}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* ASM Cancel */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                ASM取消指派
              </label>
              <select
                name="asmCancel"
                value={formData.asmCancel}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">請選擇</option>
                <option value="是">是</option>
                <option value="否">否</option>
              </select>
            </div>
          </div>

          {/* PreStage - Full Width */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              PreStage註冊
            </label>
            <input
              type="text"
              name="preStage"
              placeholder="輸入PreStage註冊"
              value={formData.preStage}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '16px',
              borderLeft: '4px solid #dc2626',
            }}
          >
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: 'white',
              color: '#374151',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '13px',
              transition: 'all 0.2s',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
            }}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              background: '#3b82f6',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '13px',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1,
              transform: loading ? 'scale(0.98)' : 'scale(1)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = '#2563eb';
                e.target.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = '#3b82f6';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            {loading ? '編輯中...' : '保存編輯'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
