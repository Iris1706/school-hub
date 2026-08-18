'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EditModal({ isOpen, data, onClose, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (data && data.rowData) {
      setFormData({
        date: data.rowData[0] || '',
        repairNumber: data.rowData[1] || '',
        school: data.rowData[2] || '',
        category: data.rowData[3] || '',
        serialNumber: data.rowData[4] || '',
        progress: data.rowData[5] || '0%',
        asmAccount: data.rowData[6] || '',
      });
    }
  }, [data]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const values = [
      formData.date,
      formData.repairNumber,
      formData.school,
      formData.category,
      formData.serialNumber,
      formData.progress,
      formData.asmAccount,
    ];

    onSave({
      ...data,
      rowData: values,
    });
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--background, white)',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            編輯維修單
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 日期 */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              日期
            </label>
            <input
              type="text"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color, #ccc)',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          {/* 維修單號 */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              維修單號
            </label>
            <input
              type="text"
              name="repairNumber"
              value={formData.repairNumber}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color, #ccc)',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          {/* 學校 */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              學校
            </label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color, #ccc)',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          {/* 類別 */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              類別
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color, #ccc)',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          {/* 序號 */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              序號
            </label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color, #ccc)',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          {/* 進度 */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              進度 (例如: 50%)
            </label>
            <input
              type="text"
              name="progress"
              value={formData.progress}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color, #ccc)',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          {/* ASM 帳號 */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              ASM 帳號
            </label>
            <input
              type="text"
              name="asmAccount"
              value={formData.asmAccount}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-color, #ccc)',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>
        </div>

        {/* 按鈕 */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '24px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
