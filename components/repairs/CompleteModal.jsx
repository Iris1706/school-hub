'use client';

import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

export default function CompleteModal({ isOpen, rowData, rowIndex, sheetName, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    completionDate: '',
    newSerialNumber: '',
    status: '已完修',
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
    if (!formData.completionDate) {
      setError('請選擇完修日期');
      return false;
    }
    if (!formData.newSerialNumber.trim()) {
      setError('請輸入維修後序號');
      return false;
    }
    if (!formData.status) {
      setError('請選擇狀態');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/repairs/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetName,
          rowIndex,
          completeData: {
            newSerialNumber: formData.newSerialNumber,
            status: formData.status,
            completionDate: formData.completionDate,
          },
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '完修失敗');
      }

      setFormData({ completionDate: '', newSerialNumber: '', status: '已完修' });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
      console.error('完修錯誤:', err);
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
          <CheckCircle size={24} color="#10b981" />
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>完修維修項目</h2>
        </div>

        {/* Original Data Preview */}
        {rowData && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.05) 0%, rgba(107, 114, 128, 0.02) 100%)',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              borderLeft: '4px solid #9ca3af',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase' }}>
              原始資料
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                fontSize: '13px',
              }}
            >
              <div>
                <div style={{ color: '#6b7280', marginBottom: '4px' }}>學校</div>
                <div style={{ fontWeight: '500' }}>{rowData[2] || '-'}</div>
              </div>
              <div>
                <div style={{ color: '#6b7280', marginBottom: '4px' }}>問題分類</div>
                <div style={{ fontWeight: '500' }}>{rowData[3] || '-'}</div>
              </div>
              <div>
                <div style={{ color: '#6b7280', marginBottom: '4px' }}>原序號</div>
                <div style={{ fontWeight: '500', fontFamily: 'monospace' }}>{rowData[4] || '-'}</div>
              </div>
              <div>
                <div style={{ color: '#6b7280', marginBottom: '4px' }}>維修序號</div>
                <div style={{ fontWeight: '500', fontFamily: 'monospace' }}>{rowData[5] || '-'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Form Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '16px', textTransform: 'uppercase' }}>
            完修資訊
          </div>

          {/* Side-by-side Input Fields */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {/* Completion Date */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                完修日期
              </label>
              <input
                type="date"
                name="completionDate"
                value={formData.completionDate}
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

            {/* New Serial Number */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                維修後序號
              </label>
              <input
                type="text"
                name="newSerialNumber"
                placeholder="輸入維修後序號"
                value={formData.newSerialNumber}
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
          </div>

          {/* Status Dropdown - Full Width */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              狀態
            </label>
            <select
              name="status"
              value={formData.status}
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
              <option value="已完修">已完修</option>
              <option value="原機返還">原機返還</option>
              <option value="報價不修（原機返還）">報價不修（原機返還）</option>
            </select>
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
              background: '#10b981',
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
                e.target.style.background = '#059669';
                e.target.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = '#10b981';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            {loading ? '提交中...' : '完成'}
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
