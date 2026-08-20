'use client';

import { useState, useEffect } from 'react';

const STATUS_OPTIONS = ['急', '不急', '一般'];

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // 表單狀態
  const [formData, setFormData] = useState({
    日期: '',
    學校: '',
    事件: '',
    聯絡人: '',
    電話: '',
    郵件: '',
    預計處理日期: '',
    備註: '',
    狀態: '一般',
    完成: '',
  });

  // 載入待辦事項
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/todos');
      if (!res.ok) throw new Error('無法載入待辦事項');
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

  // 新增待辦事項
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!formData.事件.trim()) {
      alert('請輸入事件');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('新增失敗');

      // 重設表單並重新載入
      setFormData({
        日期: '',
        學校: '',
        事件: '',
        聯絡人: '',
        電話: '',
        郵件: '',
        預計處理日期: '',
        備註: '',
        狀態: '一般',
        完成: '',
      });
      await fetchTodos();
    } catch (err) {
      alert('錯誤: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 更新待辦事項（特別是完成狀態）
  const handleToggleComplete = async (todo) => {
    try {
      const updatedTodo = {
        ...todo,
        完成: todo.完成 === 'true' ? '' : 'true',
      };

      const res = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo),
      });

      if (!res.ok) throw new Error('更新失敗');
      await fetchTodos();
    } catch (err) {
      alert('錯誤: ' + err.message);
    }
  };

  // 分組和排序
  const pendingTodos = todos
    .filter((t) => !t.完成 || t.完成 !== 'true')
    .sort((a, b) => {
      const statusOrder = { '急': 1, '不急': 2, '一般': 3 };
      const orderA = statusOrder[a.狀態] || 999;
      const orderB = statusOrder[b.狀態] || 999;
      return orderA - orderB;
    });

  const completedTodos = todos
    .filter((t) => t.完成 === 'true')
    .sort((a, b) => {
      const statusOrder = { '急': 1, '不急': 2, '一般': 3 };
      const orderA = statusOrder[a.狀態] || 999;
      const orderB = statusOrder[b.狀態] || 999;
      return orderA - orderB;
    });

  // 狀態樣式
  const getStatusStyle = (status) => {
    const styles = {
      '急': { backgroundColor: '#dc2626', color: 'white' },
      '不急': { backgroundColor: '#f59e0b', color: 'white' },
      '一般': { backgroundColor: '#6b7280', color: 'white' },
    };
    return styles[status] || { backgroundColor: '#d1d5db', color: 'white' };
  };

  // 表格行組件
  const TodoTableRow = ({ todo, isCompleted }) => (
    <tr style={{
      opacity: isCompleted ? 0.6 : 1,
      borderBottom: '1px solid var(--border, #e1e3e8)',
    }}>
      <td style={{ padding: '12px 8px' }}>
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => handleToggleComplete(todo)}
          style={{ cursor: 'pointer', width: '18px', height: '18px' }}
        />
      </td>
      <td style={{ padding: '12px 8px', fontSize: '13px' }}>{todo.日期}</td>
      <td style={{ padding: '12px 8px', fontSize: '13px' }}>{todo.學校}</td>
      <td style={{
        padding: '12px 8px',
        fontSize: '13px',
        fontWeight: '500',
        color: isCompleted ? 'var(--text-secondary, #666)' : 'var(--text-primary, black)',
        textDecoration: isCompleted ? 'line-through' : 'none',
      }}>
        {todo.事件}
      </td>
      <td style={{ padding: '12px 8px', fontSize: '13px' }}>
        {todo.聯絡人}
        {todo.電話 && <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>{todo.電話}</div>}
        {todo.郵件 && <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>{todo.郵件}</div>}
      </td>
      <td style={{ padding: '12px 8px', fontSize: '13px' }}>{todo.預計處理日期}</td>
      <td style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--text-secondary, #666)' }}>
        {todo.備註}
      </td>
      <td style={{ padding: '12px 8px' }}>
        {todo.狀態 && (
          <span
            style={{
              fontSize: '12px',
              fontWeight: '600',
              padding: '4px 8px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              ...getStatusStyle(todo.狀態),
            }}
          >
            {todo.狀態}
          </span>
        )}
      </td>
    </tr>
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h1 className="page-title">待辦事項</h1>

      {/* 新增表單 */}
      <div style={{
        backgroundColor: 'var(--surface-1, white)',
        border: '1px solid var(--border, #e1e3e8)',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '32px',
      }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: '600',
          marginTop: 0,
          marginBottom: '16px',
          color: 'var(--text-primary, black)',
        }}>
          ➕ 新增待辦事項
        </h2>

        <form onSubmit={handleAddTodo} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          <input
            type="date"
            value={formData.日期}
            onChange={(e) => setFormData({ ...formData, 日期: e.target.value })}
            placeholder="日期"
            style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
          />

          <input
            type="text"
            value={formData.學校}
            onChange={(e) => setFormData({ ...formData, 學校: e.target.value })}
            placeholder="學校"
            style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
          />

          <input
            type="text"
            value={formData.事件}
            onChange={(e) => setFormData({ ...formData, 事件: e.target.value })}
            placeholder="事件（必填）"
            required
            style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
          />

          <input
            type="text"
            value={formData.聯絡人}
            onChange={(e) => setFormData({ ...formData, 聯絡人: e.target.value })}
            placeholder="聯絡人"
            style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
          />

          <input
            type="tel"
            value={formData.電話}
            onChange={(e) => setFormData({ ...formData, 電話: e.target.value })}
            placeholder="電話"
            style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
          />

          <input
            type="email"
            value={formData.郵件}
            onChange={(e) => setFormData({ ...formData, 郵件: e.target.value })}
            placeholder="郵件"
            style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
          />

          <input
            type="date"
            value={formData.預計處理日期}
            onChange={(e) => setFormData({ ...formData, 預計處理日期: e.target.value })}
            placeholder="預計處理日期"
            style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
          />

          <input
            type="text"
            value={formData.備註}
            onChange={(e) => setFormData({ ...formData, 備註: e.target.value })}
            placeholder="備註"
            style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
          />

          <select
            value={formData.狀態}
            onChange={(e) => setFormData({ ...formData, 狀態: e.target.value })}
            style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={submitting}
            style={{
              backgroundColor: 'var(--accent, #2f6f63)',
              color: 'white',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? '新增中...' : '新增'}
          </button>
        </form>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
          <p>載入中...</p>
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          borderRadius: '6px',
          marginBottom: '24px',
          fontSize: '14px',
        }}>
          錯誤：{error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* 待辦事項表格 */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              color: 'var(--text-primary, black)',
            }}>
              📋 待辦事項 ({pendingTodos.length})
            </h2>

            {pendingTodos.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '32px 20px',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--background-secondary, #f9f9f9)',
                borderRadius: '6px',
              }}>
                <p>✨ 沒有待辦事項</p>
              </div>
            ) : (
              <div style={{
                overflowX: 'auto',
                borderRadius: '10px',
                border: '1px solid var(--border, #e1e3e8)',
                backgroundColor: 'var(--surface-1, white)',
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: 'var(--background-secondary, #f9f9f9)',
                      borderBottom: '2px solid var(--border, #e1e3e8)',
                    }}>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>完成</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>日期</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>學校</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>事件</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>聯絡人</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>預計處理日期</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>備註</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTodos.map((todo, idx) => (
                      <TodoTableRow key={idx} todo={todo} isCompleted={false} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 已完成事項表格 */}
          {completedTodos.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '12px',
                color: 'var(--text-primary, black)',
              }}>
                ✅ 已完成 ({completedTodos.length})
              </h2>

              <div style={{
                overflowX: 'auto',
                borderRadius: '10px',
                border: '1px solid var(--border, #e1e3e8)',
                backgroundColor: 'var(--surface-1, white)',
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: 'var(--background-secondary, #f9f9f9)',
                      borderBottom: '2px solid var(--border, #e1e3e8)',
                    }}>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>取消</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>日期</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>學校</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>事件</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>聯絡人</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>預計處理日期</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>備註</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedTodos.map((todo, idx) => (
                      <TodoTableRow key={idx} todo={todo} isCompleted={true} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
