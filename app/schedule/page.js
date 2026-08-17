"use client";

import { useEffect, useState } from "react";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [dayLabels, setDayLabels] = useState([]);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
    loadWeeklyStatus();
  }, []);

  async function loadWeeklyStatus() {
    setStatusLoading(true);
    try {
      const res = await fetch("/api/weekly-status");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setEmployees(json.data || []);
      setDayLabels(json.dayLabels || []);
    } catch (err) {
      console.error("讀取員工狀態失敗：", err.message);
    } finally {
      setStatusLoading(false);
    }
  }

  async function loadSchedules() {
    setLoading(true);
    try {
      const res = await fetch("/api/daily-schedule");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setSchedules(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 取得月份的日期
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  // 判斷是否為當週
  const isCurrentWeek = (date) => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return date >= weekStart && date <= weekEnd;
  };

  // 格式化日期（使用本地時區，不轉換為 UTC）
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 根據選定日期篩選行程
  const filteredSchedules = selectedDate
    ? schedules.filter((s) => s.date && formatDate(new Date(s.date)) === formatDate(selectedDate))
    : schedules;

  const days = getDaysInMonth(currentDate);
  const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
  const monthName = `${currentDate.getFullYear()} 年 ${currentDate.getMonth() + 1} 月`;

  return (
    <div>
      <h1 className="page-title">每日行程</h1>

      {/* 本週員工狀態表 */}
      {!statusLoading && employees.length > 0 && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)",
            borderLeft: "3px solid var(--accent)",
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
            overflowX: "auto",
          }}
        >
          <h3
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            📊 本週人員狀態
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--accent)" }}>
                <th style={{ textAlign: "left", padding: 8, fontWeight: 600, color: "var(--text-primary)" }}>
                  人員
                </th>
                {dayLabels.map((day) => (
                  <th
                    key={day}
                    style={{
                      textAlign: "center",
                      padding: 8,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      minWidth: 60,
                    }}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.name} style={{ borderBottom: "1px solid rgba(99, 102, 241, 0.1)" }}>
                  <td style={{ padding: 8, color: "var(--text-primary)", fontWeight: 500 }}>
                    {emp.name}
                  </td>
                  {emp.status.map((status, idx) => (
                    <td
                      key={idx}
                      style={{
                        textAlign: "center",
                        padding: 8,
                        color: status === "駐點" ? "var(--success, #10b981)" : status === "外出" ? "var(--warning, #f59e0b)" : "var(--text-muted)",
                      }}
                    >
                      {status}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20 }}>
        {/* 月曆 */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)",
            borderLeft: "3px solid var(--accent)",
            padding: 16,
            borderRadius: 8,
          }}
        >
          <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{monthName}</h3>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="secondary"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                style={{ padding: "4px 8px", fontSize: 12 }}
              >
                ←
              </button>
              <button
                className="secondary"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                style={{ padding: "4px 8px", fontSize: 12 }}
              >
                →
              </button>
            </div>
          </div>

          {/* 星期頭 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
            {dayNames.map((day) => (
              <div
                key={day}
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "var(--text-muted)",
                  fontWeight: 500,
                  padding: 6,
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日期網格 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {days.map((date, index) => {
              const isThisMonth = date !== null;
              const isToday = isThisMonth && formatDate(date) === formatDate(new Date());
              const isThisWeek = isThisMonth && isCurrentWeek(date);
              const isSelected = isThisMonth && selectedDate && formatDate(date) === formatDate(selectedDate);
              const hasSchedule =
                isThisMonth &&
                schedules.some((s) => s.date && formatDate(new Date(s.date)) === formatDate(date));

              return (
                <div
                  key={index}
                  onClick={() => isThisMonth && setSelectedDate(date)}
                  style={{
                    padding: 8,
                    textAlign: "center",
                    borderRadius: 6,
                    fontSize: 12,
                    background: isSelected
                      ? "var(--accent)"
                      : isToday
                        ? "rgba(99, 102, 241, 0.3)"
                        : isThisWeek
                          ? "rgba(99, 102, 241, 0.1)"
                          : "transparent",
                    color: isSelected || isToday
                      ? isSelected ? "white" : "var(--text-primary)"
                      : isThisMonth
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                    fontWeight: isSelected || isToday ? 600 : 400,
                    border: hasSchedule ? "1px solid var(--accent)" : "1px solid transparent",
                    cursor: isThisMonth ? "pointer" : "default",
                  }}
                >
                  {isThisMonth ? date.getDate() : ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* 本週行程清單 */}
        <div>
          <h3
            style={{
              margin: "0 0 12px",
              fontSize: 16,
              fontWeight: 600,
              paddingBottom: 10,
              borderBottom: "2px solid var(--accent)",
            }}
          >
            📋 {selectedDate ? `${formatDate(selectedDate)} 的行程` : "本週行程"}
          </h3>

          {loading && <p style={{ color: "var(--text-muted)" }}>讀取中...</p>}
          {error && <p style={{ color: "var(--danger)" }}>讀取失敗：{error}</p>}

          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              style={{
                marginBottom: 12,
                padding: "6px 12px",
                fontSize: 12,
                background: "transparent",
                color: "var(--text-muted)",
                border: "1px solid var(--accent)",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              ← 回到本週行程
            </button>
          )}

          {!loading && filteredSchedules.length === 0 && (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 20 }}>
              {selectedDate ? "這天沒有行程安排" : "本週沒有行程安排"}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredSchedules.map((schedule, index) => (
              <div
                key={index}
                style={{
                  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)",
                  borderLeft: "3px solid var(--accent)",
                  padding: 12,
                  borderRadius: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      margin: 0,
                      color: "var(--text-primary)",
                    }}
                  >
                    {schedule.date}
                  </p>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{schedule.time}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                  {schedule.event && (
                    <div>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>事件：</span>
                      {schedule.event}
                    </div>
                  )}
                  {schedule.person && (
                    <div>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>人員：</span>
                      {schedule.person}
                    </div>
                  )}
                  {schedule.location && (
                    <div>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>地點：</span>
                      {schedule.location}
                    </div>
                  )}
                  {schedule.note && (
                    <div>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>備註：</span>
                      {schedule.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
