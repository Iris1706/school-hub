"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Phone, Smartphone, Mail } from "lucide-react";

const ICONS = { phone: Phone, mobile: Smartphone, mail: Mail };

const TITLE_FIELD = "行政區合併學校名稱";

const FIELD_GROUPS = [
  {
    title: "基本資料",
    fields: [
      { key: "學校代碼", label: "學校代碼" },
      { key: "行政區合併學校名稱", label: "行政區合併學校名稱", full: true },
      { key: "地址", label: "地址", full: true },
    ],
  },
  {
    title: "主要負責老師",
    fields: [
      { key: "負責老師", label: "負責老師" },
      { key: "老師分機電話", icon: "phone" },
      { key: "老師手機電話", icon: "mobile" },
      { key: "老師Email", icon: "mail", full: true },
    ],
  },
  {
    title: "系統資訊",
    fields: [
      { key: "學校ASM", label: "學校ASM" },
      { key: "管理員權限", label: "管理員權限" },
      { key: "Jamf Pro URL", label: "Jamf Pro URL", full: true },
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
      { key: "Jamf Pro URL2", label: "Jamf Pro URL2", full: true },
    ],
  },
];

const ALL_FIELDS = FIELD_GROUPS.flatMap((g) => g.fields);
const HEADER_FIELDS = new Set(["學校代碼", TITLE_FIELD]);

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
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [schools, setSchools] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // 從 API 載入學校資料
  useEffect(() => {
    async function loadSchools() {
      try {
        const res = await fetch("/api/school-info");
        const json = await res.json();
        if (json.data) {
          setSchools(json.data);
        }
      } catch (err) {
        console.error("載入學校資料失敗：", err);
      }
    }
    loadSchools();
  }, []);

  // 搜尋功能
  useEffect(() => {
    if (!searchInput.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const query = searchInput.toLowerCase();
    const filtered = schools.filter((school) => {
      const name = (school["行政區合併學校名稱"] || "").toLowerCase();
      const address = (school["地址"] || "").toLowerCase();
      const teacher = (school["負責老師"] || "").toLowerCase();
      const teacher2 = (school["負責老師2"] || "").toLowerCase();
      const phone = (school["老師分機電話"] || "").toLowerCase();
      const phone2 = (school["老師手機電話"] || "").toLowerCase();
      const phone3 = (school["老師分機電話2"] || "").toLowerCase();
      const phone4 = (school["老師手機電話2"] || "").toLowerCase();

      return (
        name.includes(query) ||
        address.includes(query) ||
        teacher.includes(query) ||
        teacher2.includes(query) ||
        phone.includes(query) ||
        phone2.includes(query) ||
        phone3.includes(query) ||
        phone4.includes(query)
      );
    });

    setSearchResults(filtered);
    setShowResults(filtered.length > 0);
  }, [searchInput, schools]);

  // 點擊搜尋結果，跳轉到學校資訊頁籤
  const handleResultClick = (schoolName) => {
    setSearchInput("");
    setShowResults(false);
    router.push("/school-info");
    
    // 延遲一下確保頁面載入完成後再設定搜尋框
    setTimeout(() => {
      const input = document.querySelector("input[type='search'][placeholder*='搜尋']");
      if (input) {
        input.value = schoolName;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, 100);
  };

  // 點擊外部關閉搜尋結果
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sidebar">
      <div ref={searchRef} style={{ position: "relative", padding: "0 12px", marginBottom: "14px" }}>
        <input
          type="search"
          placeholder="搜尋學校..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onFocus={() => searchInput && setShowResults(searchResults.length > 0)}
          style={{
            width: "100%",
            padding: "8px 10px",
            fontSize: "12px",
            borderRadius: "6px",
          }}
        />
        
        {showResults && searchResults.length > 0 && (
          <div
            style={{
              position: "fixed",
              top: "60px",
              left: "190px",
              right: "20px",
              maxHeight: "calc(100vh - 100px)",
              overflowY: "auto",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              zIndex: 999,
              padding: "12px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "12px",
            }}
          >
            {searchResults.map((school) => (
              <div
                key={school.__row}
                onClick={() => handleResultClick(school[TITLE_FIELD])}
                style={{
                  background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderLeft: "4px solid var(--accent)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  boxShadow: "0 12px 32px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 16px 40px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)";
                }}
              >
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontWeight: 600, fontSize: 16, margin: "0 0 4px", color: "var(--text-primary)" }}>
                    {school[TITLE_FIELD]}
                  </p>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {school["學校代碼"]}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {FIELD_GROUPS.map((group) => {
                    const visible = group.fields.filter(
                      (f) => !HEADER_FIELDS.has(f.key) && (school[f.key] || "").trim() !== ""
                    );
                    if (visible.length === 0) return null;
                    return (
                      <div key={group.title}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                          {visible.map((f) => {
                            const Icon = f.icon ? ICONS[f.icon] : null;
                            const isBold = f.key === "負責老師" || f.key === "負責老師2";
                            const isUrl = f.key === "Jamf Pro URL" || f.key === "Jamf Pro URL2";
                            return (
                              <div key={f.key} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                {Icon ? (
                                  <Icon size={14} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
                                ) : (
                                  <span style={{ color: "var(--text-muted)", minWidth: "60px" }}>{f.label}</span>
                                )}
                                {isUrl ? (
                                  <a href={school[f.key]} target="_blank" rel="noopener noreferrer" style={{ flex: 1, color: "var(--accent)", textDecoration: "underline", cursor: "pointer", fontSize: "12px" }}>
                                    {school[f.key]}
                                  </a>
                                ) : (
                                  <span style={{ flex: 1, fontWeight: isBold ? 600 : 400, fontSize: "12px" }}>{school[f.key]}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
