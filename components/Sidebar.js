"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

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
  const [loading, setLoading] = useState(false);
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
  const handleResultClick = (schoolCode) => {
    setSearchInput("");
    setShowResults(false);
    router.push("/school-info");
    
    // 延遲一下確保頁面載入完成後再設定搜尋框
    setTimeout(() => {
      const input = document.querySelector("input[type='search'][placeholder*='搜尋']");
      if (input) {
        input.value = schoolCode;
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
              position: "absolute",
              top: "100%",
              left: "12px",
              right: "12px",
              marginTop: "4px",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              maxHeight: "300px",
              overflowY: "auto",
              zIndex: 1000,
            }}
          >
            {searchResults.slice(0, 8).map((school, idx) => (
              <button
                key={idx}
                onClick={() => handleResultClick(school["行政區合併學校名稱"])}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: "100%",
                  padding: "8px 10px",
                  borderBottom: idx < Math.min(7, searchResults.length - 1) ? "1px solid var(--border)" : "none",
                  background: "transparent",
                  border: "none",
                  borderRadius: "0",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--accent-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                  {school["行政區合併學校名稱"]}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {school["負責老師"] && `老師：${school["負責老師"]}`}
                </span>
              </button>
            ))}
            {searchResults.length > 8 && (
              <div style={{ padding: "8px 10px", fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>
                還有 {searchResults.length - 8} 筆結果，請到學校資訊頁籤查看
              </div>
            )}
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
