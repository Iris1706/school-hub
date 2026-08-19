'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function AddModal({ isOpen, sheetName, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    date: '',
    repairNumber: '',
    school: '',
    category: '',
    serialNumber: '',
    asmAccount: '',
    asmCancel: '',
    preStage: '',
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
    if (!formData.date) {
      setError('請選擇日期');
      return false;
    }
    if (!formData.school.trim()) {
      setError('請輸入學校');
      return false;
    }
    if (!formData.category || formData.category === '') {
      setError('請選擇類別');
      return false;
    }
    if (!formData.asmCancel || formData.asmCancel === '') {
      setError('請選擇 ASM 取消碼');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const values = [
        formData.date,
        formData.repairNumber,
        formData.school,
        formData.category,
        formData.serialNumber,
        '', // 維修序號（空白）
        '已開單', // 進度預設值
        formData.asmAccount,
        formData.asmCancel,
        formData.preStage,
      ];

      const response = await fetch('/api/repairs/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetName,
          values,
          type: 'inProgress',
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '新增失敗');
      }

      // Reset form
      setFormData({
        date: '',
        repairNumber: '',
        school: '',
        category: '',
        serialNumber: '',
        asmAccount: '',
        asmCancel: '',
        preStage: '',
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
      console.error('新增錯誤:', err);
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
      {/* Modal Card */}
      <div
        style={{
          background: 'var(--background, white)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.15)',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          padding: '32px',
          position: 'relative',
          transform: 'translateZ(20px)',
          animation: 'slideUp 0.3s ease-out',
          overflowY: 'auto',
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
          <Plus size={24} color="#10b981" />
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>新增維修</h2>
        </div>

        {/* Form Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '16px', textTransform: 'uppercase' }}>
            維修資訊
          </div>

          {/* Date and Repair Number - Side by side */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {/* Date */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#dc2626' }}>
                日期 *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
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
                SA 維修單號
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#dc2626' }}>
                學校 *
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#dc2626' }}>
                類別 *
              </label>
              <select
                name="category"
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
                <option value="螢幕破裂">螢幕破裂</option>
                <option value="電池問題">電池問題</option>
                <option value="無法開機">無法開機</option>
                <option value="連接埠損壞">連接埠損壞</option>
                <option value="按鈕損壞">按鈕損壞</option>
                <option value="殼損壞">殼損壞</option>
                <option value="其他硬體">其他硬體</option>
                <option value="軟體問題">軟體問題</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          {/* Serial Number - Full Width */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              序號
            </label>
            <input
              type="text"
              name="serialNumber"
              placeholder="輸入機器序號"
              value={formData.serialNumber}
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

          {/* ASM Account and ASM Cancel - Side by side */}
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
                ASM 帳號
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

            {/* ASM Cancel Code */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#dc2626' }}>
                ASM 取消碼 *
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
              Prestage
            </label>
            <input
              type="text"
              name="preStage"
              placeholder="輸入Prestage"
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
            {loading ? '新增中...' : '新增維修'}
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
