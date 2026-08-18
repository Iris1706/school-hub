'use client';

import { useState, useEffect } from 'react';

const STATUS_ORDER = {
  '急': 1,
  '不急': 2,
  '可等待': 3,
};

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 從 API 載入待辦事項
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/todos');
        if (!res.ok) throw new Error('Failed to fetch todos');
        const { data } = await res.json();
        setTodos(data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setTodos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  // 分組和排序
  const pendingTodos = todos
    .filter((t) => !t.完成日期)
    .sort((a, b) => {
      const orderA = STATUS_ORDER[a.狀態] || 999;
      const orderB = STATUS_ORDER[b.狀態] || 999;
      return orderA - orderB;
    });

  const completedTodos = todos
    .filter((t) => t.完成日期)
    .sort((a, b) => {
      const orderA = STATUS_ORDER[a.狀態] || 999;
      const orderB = STATUS_ORDER[b.狀態] || 999;
      return orderA - orderB;
    });

  // 狀態標籤樣式
  const getStatusStyle = (status) => {
    const styles = {
      '急': { backgroundColor: '#ef4444', color: 'white' },
      '不急': { backgroundColor: '#f59e0b', color: 'white' },
      '可等待': { backgroundColor: '#6b7280', color: 'white' },
    };
    return styles[status] || { backgroundColor: '#d1d5db', color: 'white' };
  };

  // 待辦清單項目
  const TodoItem = ({ item, isCompleted = false }) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 16px',
        backgroundColor: isCompleted
          ? 'var(--background-secondary, #f9f9f9)'
          : 'var(--background, white)',
        borderRadius: '6px',
        border: '1px solid var(--border-color, #ccc)',
        gap: '8px',
        opacity: isCompleted ? 0.7 : 1,
      }}
    >
      {/* 第一列：事件 + 狀態標籤 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--text-primary, black)',
            textDecoration: isCompleted ? 'line-through' : 'none',
            flex: 1,
            wordBreak: 'break-word',
          }}
        >
          {item.事件}
        </div>
        {item.狀態 && (
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              padding: '4px 10px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              ...getStatusStyle(item.狀態),
            }}
          >
            {item.狀態}
          </span>
        )}
      </div>

      {/* 第二列：日期、學校等資訊 */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {item.日期 && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>
            <span style={{ fontWeight: '600' }}>日期：</span>{item.日期}
          </div>
        )}
        {item.學校 && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>
            <span style={{ fontWeight: '600' }}>學校：</span>{item.學校}
          </div>
        )}
        {isCompleted && item.完成日期 && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>
            <span style={{ fontWeight: '600' }}>完成日期：</span>{item.完成日期}
          </div>
        )}
      </div>

      {/* 備註 */}
      {item.備註 && (
        <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666)', fontStyle: 'italic' }}>
          {item.備註}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="page-title">待辦事項</h1>

      {loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-secondary)',
          }}
        >
          <p style={{ fontSize: '14px', margin: 0 }}>載入中...</p>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '6px',
            marginBottom: '24px',
            fontSize: '14px',
          }}
        >
          錯誤：{error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* 待處理事項 */}
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '12px',
                color: 'var(--text-primary, black)',
              }}
            >
              待處理事項 ({pendingTodos.length})
            </h2>
            {pendingTodos.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '32px 20px',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--background-secondary, #f9f9f9)',
                  borderRadius: '6px',
                }}
              >
                <p style={{ fontSize: '14px', margin: 0 }}>✨ 沒有待處理事項</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingTodos.map((todo, idx) => (
                  <TodoItem key={idx} item={todo} isCompleted={false} />
                ))}
              </div>
            )}
          </div>

          {/* 已完成事項 */}
          {completedTodos.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: 'var(--text-primary, black)',
                }}
              >
                已完成事項 ({completedTodos.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {completedTodos.map((todo, idx) => (
                  <TodoItem key={idx} item={todo} isCompleted={true} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
