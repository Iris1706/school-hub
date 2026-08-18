'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, CheckCircle2, Circle } from 'lucide-react';

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  // 從 localStorage 載入待辦事項
  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      setTodos(JSON.parse(saved));
    }
  }, []);

  // 保存到 localStorage
  const saveTodos = (newTodos) => {
    setTodos(newTodos);
    localStorage.setItem('todos', JSON.stringify(newTodos));
  };

  // 新增待辦事項
  const addTodo = () => {
    if (newTodo.trim()) {
      const newItem = {
        id: Date.now(),
        text: newTodo,
        completed: false,
        createdAt: new Date().toLocaleString('zh-TW'),
      };
      saveTodos([...todos, newItem]);
      setNewTodo('');
    }
  };

  // 切換完成狀態
  const toggleComplete = (id) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(updated);
  };

  // 刪除待辦事項
  const deleteTodo = (id) => {
    saveTodos(todos.filter((todo) => todo.id !== id));
  };

  // 計算統計數據
  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div>
      <h1 className="page-title">待辦事項</h1>

      {/* 統計卡片 */}
      {totalCount > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--background-secondary, #f9f9f9)',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              borderLeft: '3px solid #10b981',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#10b981' }}>
              {completedCount}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              已完成
            </div>
          </div>
          <div
            style={{
              backgroundColor: 'var(--background-secondary, #f9f9f9)',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              borderLeft: '3px solid #3b82f6',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#3b82f6' }}>
              {totalCount - completedCount}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              待進行
            </div>
          </div>
          <div
            style={{
              backgroundColor: 'var(--background-secondary, #f9f9f9)',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              borderLeft: '3px solid #8b5cf6',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#8b5cf6' }}>
              {percentage}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              完成度
            </div>
          </div>
        </div>
      )}

      {/* 新增待辦事項 */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
        }}
      >
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="輸入新的待辦事項..."
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid var(--border-color, #ccc)',
            fontSize: '14px',
            backgroundColor: 'var(--background, white)',
            color: 'var(--text-primary, black)',
          }}
        />
        <button
          onClick={addTodo}
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'opacity 0.2s',
          }}
          onMouseOver={(e) => (e.target.style.opacity = '0.9')}
          onMouseOut={(e) => (e.target.style.opacity = '1')}
        >
          <Plus size={18} />
          新增
        </button>
      </div>

      {/* 待辦事項清單 */}
      {todos.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-secondary)',
          }}
        >
          <p style={{ fontSize: '14px', margin: 0 }}>
            📋 暫無待辦事項。開始新增您的第一項任務吧！
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {todos.map((todo) => (
            <div
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: todo.completed
                  ? 'var(--background-secondary, #f9f9f9)'
                  : 'var(--background, white)',
                borderRadius: '6px',
                border: '1px solid var(--border-color, #ccc)',
                transition: 'all 0.2s',
                opacity: todo.completed ? 0.7 : 1,
              }}
            >
              {/* 完成按鈕 */}
              <button
                onClick={() => toggleComplete(todo.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: todo.completed ? '#10b981' : 'var(--border-color, #ccc)',
                  transition: 'color 0.2s',
                }}
                title={todo.completed ? '標記為未完成' : '標記為完成'}
              >
                {todo.completed ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Circle size={20} />
                )}
              </button>

              {/* 文字內容 */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-primary, black)',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    wordBreak: 'break-word',
                  }}
                >
                  {todo.text}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary, #666)',
                    marginTop: '4px',
                  }}
                >
                  {todo.createdAt}
                </div>
              </div>

              {/* 刪除按鈕 */}
              <button
                onClick={() => deleteTodo(todo.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = '#dc2626')
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = '#ef4444')
                }
              >
                <Trash2 size={14} />
                刪除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
