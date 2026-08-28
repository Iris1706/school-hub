"use client";

import { useEffect, useState, useMemo } from "react";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [dates, setDates] = useState([]);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
    loadWeeklyStatus();
    // 預設選中今天（僅首次加載）
    if (selectedDate === null) {
      setSelectedDate(new Date());
    }
  }, [currentDate]);

  async function loadWeeklyStatus() {
    setStatusLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const res = await fetch(`/api/weekly-status?year=${year}&month=${month}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setEmployees(json.data || []);
      setDates(json.dates || []);
    } catch (err) {
      console.error("讀取員工狀態失敗：", err.message);
    } finally {
      setStatusLoading(false);
    }
  }

  async function loadSchedules() {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const res = await fetch(`/api/daily-schedule?year=${year}&month=${month}`);
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
  const filteredSchedules = useMemo(() => {
    if (selectedDate) {
      // 如果選定了日期，只顯示該日期的行程
      return schedules.filter((s) => s.date && formatDate(new Date(s.date)) === formatDate(selectedDate));
    } else {
      // 沒有選定日期時，只顯示當週行程
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      return schedules.filter((s) => {
        if (!s.date) return false;
        try {
          const scheduleDate = new Date(s.date);
          return scheduleDate >= weekStart && scheduleDate <= weekEnd && s.date.trim() !== "";
        } catch {
          return false;
        }
      });
    }
  }, [schedules, selectedDate]);

  const days = getDaysInMonth(currentDate);
  const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
  const monthName = `${currentDate.getFullYear()} 年 ${currentDate.getMonth() + 1} 月`;

  return (
    <div>
      <h1 className="page-title">每日行程</h1>

      {/* 本月員工排班表 */}
      {employees.length > 0 && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
            overflowX: "auto",
            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                本月員工排班表
              </h3>
              <button
                className="secondary"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                style={{ padding: "4px 8px", fontSize: 12 }}
              >
                ←
              </button>
              <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "4px 8px", minWidth: 60, textAlign: "center" }}>
                {currentDate.getFullYear()}/{String(currentDate.getMonth() + 1).padStart(2, "0")}
              </div>
              <button
                className="secondary"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                style={{ padding: "4px 8px", fontSize: 12 }}
              >
                →
              </button>
            </div>
          </div>
          <table
            style={{
              borderCollapse: "collapse",
              fontSize: 11,
              border: "1px solid rgba(200, 200, 200, 0.3)",
            }}
          >
            <thead>
              <tr style={{ background: "rgba(248, 247, 245, 1)", borderBottom: "1px solid rgba(200, 200, 200, 0.3)" }}>
                <th style={{ padding: 8, fontWeight: 600, color: "var(--text-primary)", borderRight: "1px solid rgba(200, 200, 200, 0.3)", minWidth: 70, textAlign: "center", fontSize: 12 }}>
                  員工編號
                </th>
                <th style={{ padding: 8, fontWeight: 600, color: "var(--text-primary)", borderRight: "1px solid rgba(200, 200, 200, 0.3)", minWidth: 120, textAlign: "center", fontSize: 12 }}>
                  姓名
                </th>
                {dates.map((date) => {
                  const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), date).getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  return (
                    <th
                      key={date}
                      style={{
                        padding: 8,
                        fontWeight: 600,
                        color: isWeekend ? "#c41e3a" : "var(--text-primary)",
                        borderRight: "1px solid rgba(200, 200, 200, 0.3)",
                        background: isWeekend ? "rgba(196, 30, 58, 0.08)" : "transparent",
                        minWidth: 75,
                        textAlign: "center",
                        fontSize: 12,
                      }}
                    >
                      {date}
                    </th>
                  );
                })}
              </tr>
              <tr style={{ background: "rgba(248, 247, 245, 0.5)", borderBottom: "1px solid rgba(200, 200, 200, 0.3)" }}>
                <th style={{ padding: 6, fontWeight: 500, color: "rgba(100, 100, 100, 0.6)", borderRight: "1px solid rgba(200, 200, 200, 0.3)", minWidth: 70 }}></th>
                <th style={{ padding: 6, fontWeight: 500, color: "rgba(100, 100, 100, 0.6)", borderRight: "1px solid rgba(200, 200, 200, 0.3)", minWidth: 120 }}></th>
                {dates.map((date) => {
                  const dayName = ["日", "一", "二", "三", "四", "五", "六"][(new Date(currentDate.getFullYear(), currentDate.getMonth(), date).getDay())];
                  const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), date).getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  return (
                    <th
                      key={`day-${date}`}
                      style={{
                        padding: 4,
                        fontWeight: 500,
                        color: isWeekend ? "#c41e3a" : "rgba(100, 100, 100, 0.6)",
                        borderRight: "1px solid rgba(200, 200, 200, 0.3)",
                        background: isWeekend ? "rgba(196, 30, 58, 0.08)" : "transparent",
                        minWidth: 75,
                        textAlign: "center",
                        fontSize: 10,
                      }}
                    >
                      {dayName}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.employeeId} style={{ borderBottom: "1px solid rgba(200, 200, 200, 0.3)" }}>
                  <td style={{ padding: 8, borderRight: "1px solid rgba(200, 200, 200, 0.3)", borderBottom: "1px solid rgba(200, 200, 200, 0.3)", color: "var(--text-primary)", fontWeight: 600, textAlign: "center", whiteSpace: "nowrap" }}>
                    {emp.employeeId}
                  </td>
                  <td style={{ padding: 8, borderRight: "1px solid rgba(200, 200, 200, 0.3)", borderBottom: "1px solid rgba(200, 200, 200, 0.3)", color: "var(--text-primary)", fontWeight: 500, textAlign: "center" }}>
                    {emp.employeeName}
                  </td>
                  {dates.map((date, idx) => {
                    const status = emp.dailyStatus[idx] || "";
                    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), date).getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const getBgColor = () => {
                      if (!status) return "#7a7a7a"; // 深灰色 - 沒有排班內容
                      if (status.includes("三多")) return "#d4edbb";
                      if (status.includes("外出")) return "#e6cff3";
                      if (status.includes("上午(外)")) return "#c6dbe1";
                      if (status.includes("下午(外)")) return "#ffcfc8";
                      if (status.includes("特休")) return "#ca3750";
                      if (status.includes("排休")) return "#ffe59f";
                      if (status.includes("巡檢")) return "#bfe1f6";
                      if (status.includes("上午(巡)")) return "#5a3286";
                      if (status.includes("下午(巡)")) return "#5a3286";
                      if (status.includes("上午(特)")) return "#b10202";
                      if (status.includes("下午(特)")) return "#b10202";
                      if (status.includes("國定假日")) return "#d81b91";
                      if (status.includes("彈性假")) return "#a7adb6";
                      if (status.includes("病假")) return "#7e9ac4";
                      if (status.includes("事假")) return "#e6e6e6";
                      if (status.includes("駐點")) return "#e28d38";
                      return "#7a7a7a"; // 深灰色 - 預設
                    };

                    const getTextColor = () => {
                      if (!status) return "var(--text-primary)";
                      if (status.includes("上午(巡)") || status.includes("下午(巡)")) return "white";
                      if (status.includes("上午(特)") || status.includes("下午(特)")) return "white";
                      if (status.includes("事假")) return "white";
                      return "var(--text-primary)";
                    };

                    return (
                      <td
                        key={idx}
                        style={{
                          padding: 8,
                          borderRight: "1px solid rgba(200, 200, 200, 0.3)",
                          borderBottom: "1px solid rgba(200, 200, 200, 0.3)",
                          backgroundColor: getBgColor(),
                          textAlign: "center",
                          color: isWeekend && !status ? "rgba(100, 100, 100, 0.3)" : getTextColor(),
                          fontSize: 10,
                        }}
                      >
                        {status}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "start" }}>
        {/* 月曆 */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)",
            border: "1px solid var(--accent)",
            padding: 8,
            borderRadius: 8,
            width: "fit-content",
            height: "fit-content",
          }}
        >
          <div style={{ marginBottom: 6 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{monthName}</h3>
          </div>

          {/* 星期頭 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
            {dayNames.map((day) => (
              <div
                key={day}
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  fontWeight: 500,
                  padding: 4,
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日期網格 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
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
                    padding: 6,
                    textAlign: "center",
                    borderRadius: 4,
                    fontSize: 11,
                    minHeight: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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

          {!loading && filteredSchedules.length > 0 && (
            <table style={{
              width: "auto",
              borderCollapse: "collapse",
              fontSize: 14,
              border: "1px solid var(--accent)",
            }}>
              <thead>
                <tr style={{ background: "rgba(99, 102, 241, 0.1)", borderBottom: "1px solid var(--accent)" }}>
                  <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600, borderRight: "1px solid var(--accent)", whiteSpace: "nowrap" }}>日期</th>
                  <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600, borderRight: "1px solid var(--accent)", whiteSpace: "nowrap" }}>時間</th>
                  <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600, borderRight: "1px solid var(--accent)", whiteSpace: "nowrap" }}>負責人</th>
                  <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600, borderRight: "1px solid var(--accent)", whiteSpace: "nowrap" }}>地點</th>
                  <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600, borderRight: "1px solid var(--accent)", whiteSpace: "nowrap" }}>事件</th>
                  <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600, borderRight: "1px solid var(--accent)", whiteSpace: "nowrap" }}>備註</th>
                  <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600, whiteSpace: "nowrap" }}>台數</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((schedule, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid var(--accent)" }}>
                    <td style={{ padding: "10px 14px", borderRight: "1px solid var(--accent)", color: "var(--text-primary)", textAlign: "center", whiteSpace: "nowrap" }}>
                      {schedule.date}
                    </td>
                    <td style={{ padding: "10px 14px", borderRight: "1px solid var(--accent)", color: "var(--text-secondary)", textAlign: "center", whiteSpace: "nowrap" }}>
                      {schedule.time}
                    </td>
                    <td style={{ padding: "10px 14px", borderRight: "1px solid var(--accent)", color: "var(--text-secondary)", textAlign: "center", whiteSpace: "nowrap" }}>
                      {schedule.person}
                    </td>
                    <td style={{ padding: "10px 14px", borderRight: "1px solid var(--accent)", color: "var(--text-secondary)", textAlign: "center", whiteSpace: "nowrap" }}>
                      {schedule.location}
                    </td>
                    <td style={{ padding: "10px 14px", borderRight: "1px solid var(--accent)", color: "var(--text-secondary)", textAlign: "center", whiteSpace: "nowrap" }}>
                      {schedule.event}
                    </td>
                    <td style={{ padding: "10px 14px", borderRight: "1px solid var(--accent)", color: "var(--text-secondary)", textAlign: "center", whiteSpace: "nowrap" }}>
                      {schedule.note}
                    </td>
                    <td style={{ padding: "10px 14px", color: "var(--text-secondary)", textAlign: "center", whiteSpace: "nowrap" }}>
                      {schedule.devices || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
