'use client';

import { useState } from 'react';

export default function PeriodSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <label style={{ fontSize: '14px', fontWeight: '500' }}>選擇標案：</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid var(--border-color, #ccc)',
          backgroundColor: 'var(--background, white)',
          color: 'var(--text-primary, black)',
          fontSize: '14px',
          cursor: 'pointer',
          minWidth: '200px',
        }}
      >
        <option value="Pawn">一期生生平板維修</option>
        <option value="二期生生平板維修">二期生生平板維修</option>
      </select>
    </div>
  );
}
