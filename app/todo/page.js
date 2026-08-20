'use client';

import { useState, useEffect } from 'react';

const STATUS_OPTIONS = ['急', '不急', '一般'];

// 日期格式化函數
const formatDate = (dateString) => {
  if (!dateString) return '';
  // 如果是 YYYY-MM-DD 格式，轉換為 YYYY/MM/DD
  if (dateString.includes('-')) {
    return dateString.replace(/-/g, '/');
  }
  return dateString;
};

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // 模態框狀態
  const [editingTodo, setEditingTodo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // 新增表單狀態
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

  // 編輯表單狀態
  const [editFormData, setEditFormData] = useState({
    日期: '',
    學校: '',
    事件: '',
    聯絡人: '',
    電話: '',
    郵件: '',
    預計處理日期: '',
    備註: '',
    狀態: '一般',
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

  // 打開編輯模態框
  const handleOpenEdit = (todo) => {
    setEditingTodo(todo);
    setEditFormData({
      日期: todo.日期,
      學校: todo.學校,
      事件: todo.事件,
      聯絡人: todo.聯絡人,
      電話: todo.電話,
      郵件: todo.郵件,
      預計處理日期: todo.預計處理日期,
      備註: todo.備註,
      狀態: todo.狀態,
    });
    setShowEditModal(true);
  };

  // 保存編輯
  const handleSaveEdit = async () => {
    try {
      const updatedTodo = {
        ...editingTodo,
        ...editFormData,
      };

      const res = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo),
      });

      if (!res.ok) throw new Error('更新失敗');

      setShowEditModal(false);
      setEditingTodo(null);
      await fetchTodos();
    } catch (err) {
      alert('錯誤: ' + err.message);
    }
  };

  // 刪除待辦事項
  const handleDeleteTodo = async (todo) => {
    try {
      const res = await fetch('/api/todos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ __row: todo.__row }),
      });

      if (!res.ok) throw new Error('刪除失敗');

      setDeleteConfirm(null);
      await fetchTodos();
    } catch (err) {
      alert('錯誤: ' + err.message);
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
      <td style={{ padding: '12px 8px', fontSize: '13px' }}>{formatDate(todo.日期)}</td>
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
        <div>{todo.聯絡人}</div>
        {todo.電話 && <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>{todo.電話}</div>}
        {todo.郵件 && <div style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>{todo.郵件}</div>}
      </td>
      <td style={{ padding: '12px 8px', fontSize: '13px' }}>{formatDate(todo.預計處理日期)}</td>
      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <button
            onClick={() => handleOpenEdit(todo)}
            style={{
              backgroundColor: 'var(--accent, #2f6f63)',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            編輯
          </button>
          <button
            onClick={() => setDeleteConfirm(todo)}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            刪除
          </button>
        </div>
      </td>
      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => handleToggleComplete(todo)}
          style={{ cursor: 'pointer', width: '18px', height: '18px' }}
        />
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          alignItems: 'flex-end',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>日期</label>
            <input
              type="date"
              value={formData.日期}
              onChange={(e) => setFormData({ ...formData, 日期: e.target.value })}
              style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>學校</label>
            <input
              type="text"
              value={formData.學校}
              onChange={(e) => setFormData({ ...formData, 學校: e.target.value })}
              placeholder="學校"
              style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>事件 *</label>
            <input
              type="text"
              value={formData.事件}
              onChange={(e) => setFormData({ ...formData, 事件: e.target.value })}
              placeholder="事件（必填）"
              required
              style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>聯絡人</label>
            <input
              type="text"
              value={formData.聯絡人}
              onChange={(e) => setFormData({ ...formData, 聯絡人: e.target.value })}
              placeholder="聯絡人"
              style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>電話</label>
            <input
              type="tel"
              value={formData.電話}
              onChange={(e) => setFormData({ ...formData, 電話: e.target.value })}
              placeholder="電話"
              style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>郵件</label>
            <input
              type="email"
              value={formData.郵件}
              onChange={(e) => setFormData({ ...formData, 郵件: e.target.value })}
              placeholder="郵件"
              style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>預計處理日期</label>
            <input
              type="date"
              value={formData.預計處理日期}
              onChange={(e) => setFormData({ ...formData, 預計處理日期: e.target.value })}
              style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>備註</label>
            <input
              type="text"
              value={formData.備註}
              onChange={(e) => setFormData({ ...formData, 備註: e.target.value })}
              placeholder="備註"
              style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>狀態</label>
            <select
              value={formData.狀態}
              onChange={(e) => setFormData({ ...formData, 狀態: e.target.value })}
              style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              backgroundColor: 'var(--accent, #2f6f63)',
              color: 'white',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
              whiteSpace: 'nowrap',
              height: 'fit-content',
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
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>狀態</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>日期</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>學校</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>事件</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>聯絡人</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>預計處理日期</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>操作</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>完成</th>
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
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>狀態</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>日期</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>學校</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>事件</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>聯絡人</th>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>預計處理日期</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>操作</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>取消</th>
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

      {/* 編輯模態框 */}
      {showEditModal && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: 'var(--surface-1, white)',
            borderRadius: '10px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginTop: 0,
              marginBottom: '16px',
              color: 'var(--text-primary, black)',
            }}>
              編輯待辦事項
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>日期</label>
                <input
                  type="date"
                  value={editFormData.日期}
                  onChange={(e) => setEditFormData({ ...editFormData, 日期: e.target.value })}
                  style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>學校</label>
                <input
                  type="text"
                  value={editFormData.學校}
                  onChange={(e) => setEditFormData({ ...editFormData, 學校: e.target.value })}
                  style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>事件</label>
                <input
                  type="text"
                  value={editFormData.事件}
                  onChange={(e) => setEditFormData({ ...editFormData, 事件: e.target.value })}
                  style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>聯絡人</label>
                <input
                  type="text"
                  value={editFormData.聯絡人}
                  onChange={(e) => setEditFormData({ ...editFormData, 聯絡人: e.target.value })}
                  style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>電話</label>
                <input
                  type="tel"
                  value={editFormData.電話}
                  onChange={(e) => setEditFormData({ ...editFormData, 電話: e.target.value })}
                  style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>郵件</label>
                <input
                  type="email"
                  value={editFormData.郵件}
                  onChange={(e) => setEditFormData({ ...editFormData, 郵件: e.target.value })}
                  style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>預計處理日期</label>
                <input
                  type="date"
                  value={editFormData.預計處理日期}
                  onChange={(e) => setEditFormData({ ...editFormData, 預計處理日期: e.target.value })}
                  style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>狀態</label>
                <select
                  value={editFormData.狀態}
                  onChange={(e) => setEditFormData({ ...editFormData, 狀態: e.target.value })}
                  style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>備註</label>
                <input
                  type="text"
                  value={editFormData.備註}
                  onChange={(e) => setEditFormData({ ...editFormData, 備註: e.target.value })}
                  style={{ padding: '8px 10px', fontSize: '13px', border: '1px solid var(--border, #e1e3e8)', borderRadius: '8px' }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
              marginTop: '20px',
            }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border, #e1e3e8)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  backgroundColor: 'var(--accent, #2f6f63)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 刪除確認對話框 */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
        }}>
          <div style={{
            backgroundColor: 'var(--surface-1, white)',
            borderRadius: '10px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginTop: 0,
              marginBottom: '16px',
              color: 'var(--text-primary, black)',
            }}>
              確認刪除
            </h2>

            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '20px',
            }}>
              確定要刪除這筆待辦事項嗎？此操作無法恢復。
            </p>

            <div style={{
              backgroundColor: 'var(--background-secondary, #f9f9f9)',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              fontWeight: '500',
            }}>
              {deleteConfirm.事件}
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border, #e1e3e8)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteTodo(deleteConfirm)}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
