"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Smartphone, Mail } from "lucide-react";

const ICONS = { phone: Phone, mobile: Smartphone, mail: Mail };
const TITLE_FIELD = "行政區合併學校名稱";

const FIELD_GROUPS = [
  {
    title: "基本資料",
    fields: [
      { key: "學校代碼", label: "學校代碼" },
      { key: "行政區合併學校名稱", label: "行政區合併學校名稱" },
      { key: "地址", label: "地址" },
    ],
  },
  {
    title: "主要負責老師",
    fields: [
      { key: "負責老師", label: "負責老師" },
      { key: "老師分機電話", icon: "phone" },
      { key: "老師手機電話", icon: "mobile" },
      { key: "老師Email", icon: "mail" },
    ],
  },
  {
    title: "系統資訊",
    fields: [
      { key: "學校ASM", label: "學校ASM" },
      { key: "管理員權限", label: "管理員權限" },
      { key: "Jamf Pro URL", label: "Jamf Pro URL" },
    ],
  },
  {
    title: "專案",
    fields: [
      { key: "專案1", label: "專案1" },
      { key: "專案2", label: "專案2" },
      { key: "專案3", label: "專案3" },
      { key: "專案4", label: "專案4" },
      { key: "專案5", label: "專案5" },
      { key: "專案6", label: "專案6" },
    ],
  },
  {
    title: "第二負責老師",
    fields: [
      { key: "負責老師2", label: "負責老師2" },
      { key: "老師分機電話2", icon: "phone" },
      { key: "老師手機電話2", icon: "mobile" },
      { key: "老師Email2", icon: "mail" },
      { key: "Jamf Pro URL2", label: "Jamf Pro URL2" },
    ],
  },
];

const HEADER_FIELDS = new Set(["學校代碼", TITLE_FIELD]);
const ALL_FIELDS = FIELD_GROUPS.flatMap((g) => g.fields);

const NAV_ITEMS = [
  { href: "/", label: "總覽" },
  { href: "/schedule", label: "每日行程" },
  { href: "/repair", label: "報修紀錄" },
  { href: "/school-info", label: "學校資訊" },
  { href: "/inspect", label: "巡檢管理" },
  { href: "/hardware", label: "硬體維修" },
  { href: "/serial-management", label: "序號管理" },
  { href: "/todo", label: "待辦事項" },
  { href: "/weekly-report", label: "週報/月報" },
  { href: "/training", label: "教育訓練" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [schools, setSchools] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const navScrollRef = useRef(null);
  const searchContainerRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      const res = await fetch("/api/check-auth");
      const data = await res.json();
      setIsAuthorized(data.authorized);
      if (data.authorized && data.email) {
        setUserEmail(data.email);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    }
  }

  function handleLogin() {
    // 登入成功後會重新導向回來，設置計時器檢查授權狀態
    const checkInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/check-auth");
        const data = await res.json();
        if (data.authorized && data.email) {
          clearInterval(checkInterval);
          // 登入成功，重新整理頁面
          window.location.reload();
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    }, 500);

    setTimeout(() => clearInterval(checkInterval), 30000); // 30秒後停止檢查

    window.location.href = "/api/auth/google";
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthorized(false);
      setUserEmail(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    async function loadSchools() {
      try {
        const res = await fetch("/api/school-info");
        const json = await res.json();
        if (json.data) setSchools(json.data);
      } catch (err) {
        console.error("Failed to load schools:", err);
      }
    }
    loadSchools();
  }, []);

  const filtered = useMemo(
    () => {
      if (!search) return [];
      const lower = search.toLowerCase();
      return schools.filter((s) => {
        const schoolName = (s[TITLE_FIELD] || "").toLowerCase();
        const teacher = (s["負責老師"] || "").toLowerCase();
        const teacher2 = (s["負責老師2"] || "").toLowerCase();
        const address = (s["地址"] || "").toLowerCase();
        const phone = (s["老師分機電話"] || "").toLowerCase();
        const phone2 = (s["老師手機電話"] || "").toLowerCase();
        const phone3 = (s["老師分機電話2"] || "").toLowerCase();
        const phone4 = (s["老師手機電話2"] || "").toLowerCase();

        return (
          schoolName.includes(lower) ||
          teacher.includes(lower) ||
          teacher2.includes(lower) ||
          address.includes(lower) ||
          phone.includes(lower) ||
          phone2.includes(lower) ||
          phone3.includes(lower) ||
          phone4.includes(lower)
        );
      });
    },
    [schools, search]
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(e.target)
      ) {
        setSearch("");
        setSearchInput("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isMobile) {
    return (
      <>
        <nav className="sidebar">
          <div
            ref={searchContainerRef}
            style={{
              padding: "12px 8px",
              borderBottom: "1px solid var(--border)",
              marginBottom: 12,
            }}
          >
            <input
              type="search"
              placeholder="搜尋學校..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                borderRadius: 6,
                fontSize: 13,
                boxShadow: "0 2px 8px rgba(99, 102, 241, 0.08)",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div className="sidebar-title">導覽</div>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}

          {isAuthorized && userEmail && (
            <>
              <div style={{ fontSize: 12, color: "var(--text-muted)", paddingLeft: 18, marginTop: "auto", paddingTop: 12 }}>已登入：</div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--accent)",
                  paddingLeft: 18,
                  paddingRight: 18,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={userEmail}
              >
                {userEmail}
              </div>
            </>
          )}

          <button
            onClick={isAuthorized ? handleLogout : handleLogin}
            style={{
              width: "calc(100% - 36px)",
              padding: "11px 12px",
              marginTop: isAuthorized && userEmail ? 8 : "auto",
              marginLeft: 18,
              marginRight: 18,
              marginBottom: 12,
              background: isAuthorized ? "transparent" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              border: isAuthorized ? "1px solid var(--border)" : "none",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              color: isAuthorized ? "var(--text-secondary)" : "#ffffff",
            }}
          >
            {isAuthorized ? "登出" : "🔐 Google Drive 登入"}
          </button>
        </nav>

        {search && filtered.length > 0 && (
          <div
            ref={resultsRef}
            style={{
              position: "fixed",
              left: 12,
              top: 110,
              width: 320,
              maxHeight: "calc(100vh - 140px)",
              overflow: "auto",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {filtered.map((s) => (
              <SchoolCard key={s.__row} school={s} />
            ))}
          </div>
        )}

        {search && filtered.length === 0 && (
          <div
            ref={resultsRef}
            style={{
              position: "fixed",
              left: 12,
              top: 110,
              width: "auto",
              padding: "8px 12px",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              fontSize: 12,
              color: "var(--text-muted)",
              zIndex: 1000,
            }}
          >
            沒有符合的學校
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div
        ref={searchContainerRef}
        style={{
          padding: "12px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-1)",
        }}
      >
        <input
          type="search"
          placeholder="搜尋學校..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            borderRadius: 6,
            fontSize: 14,
            boxShadow: "0 2px 8px rgba(99, 102, 241, 0.08)",
            fontFamily: "inherit",
          }}
        />
      </div>

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: "var(--surface-1)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          zIndex: 100,
          padding: "0 12px",
          gap: 8,
        }}
      >
        <div
          ref={navScrollRef}
          style={{
            display: "flex",
            gap: 4,
            overflow: "auto",
            flex: 1,
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* 登入/登出區域 - 放在導覽項目前面 */}
          {isAuthorized && userEmail ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px",
                background: "transparent",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>
                {userEmail.split("@")[0]}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: "4px 8px",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  fontSize: 11,
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  whiteSpace: "nowrap",
                }}
              >
                登出
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              style={{
                padding: "6px 10px",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                color: "#ffffff",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              🔐 登入
            </button>
          )}

          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                fontSize: 12,
                cursor: "pointer",
                whiteSpace: "nowrap",
                background: pathname === item.href ? "var(--accent)" : "transparent",
                color: pathname === item.href ? "#ffffff" : "var(--text-secondary)",
                border: pathname === item.href ? "none" : "1px solid var(--border)",
                textDecoration: "none",
                flexShrink: 0,
                transition: "all 0.2s",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {search && filtered.length > 0 && (
        <div
          ref={resultsRef}
          style={{
            padding: "12px",
            marginBottom: 80,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {filtered.map((s) => (
            <SchoolCard key={s.__row} school={s} />
          ))}
        </div>
      )}

      {search && filtered.length === 0 && (
        <div
          ref={resultsRef}
          style={{
            padding: "12px",
            marginBottom: 80,
            textAlign: "center",
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          沒有符合的學校
        </div>
      )}
    </>
  );
}

function SchoolCard({ school }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid rgba(99, 102, 241, 0.2)",
        borderLeft: "3px solid var(--accent)",
        borderRadius: 8,
        padding: 8,
        boxShadow: "0 2px 8px rgba(99, 102, 241, 0.1)",
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <p
          style={{
            fontWeight: 500,
            fontSize: 13,
            margin: "0 0 2px",
            color: "var(--text-primary)",
          }}
        >
          {school["行政區合併學校名稱"]}
        </p>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {school["學校代碼"]}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11 }}>
        {school["負責老師"] && (
          <div style={{ color: "var(--text-secondary)" }}>
            👤 {school["負責老師"]}
          </div>
        )}
        {school["老師手機電話"] && (
          <div style={{ color: "var(--text-secondary)" }}>
            📱 {school["老師手機電話"]}
          </div>
        )}
        {school["地址"] && (
          <div style={{ color: "var(--text-secondary)" }}>
            📍 {school["地址"]}
          </div>
        )}
      </div>
    </div>
  );
}
