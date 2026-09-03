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
  const [loading, setLoading] = useState(false);
  const searchContainerRef = useRef(null);
  const resultsRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load all schools
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

  // Filter schools by search
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

  // Close results when clicking outside
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
      </nav>

      {search && filtered.length > 0 && (
        <div
          ref={resultsRef}
          style={{
            position: "fixed",
            left: 12,
            top: 110,
            width: filtered.length === 1 ? 360 : "calc(100% - 24px)",
            maxHeight: "calc(100vh - 140px)",
            overflow: "auto",
            zIndex: 1000,
            display: "grid",
            gridTemplateColumns: filtered.length === 1 ? "1fr" : "1fr 1fr",
            gap: 8,
          }}
        >
          {filtered.map((s) => (
            <div
              key={s.__row}
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
                  {s[TITLE_FIELD]}
                </p>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {s["學校代碼"]}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {FIELD_GROUPS.map((group) => {
                  const visible = group.fields.filter(
                    (f) => !HEADER_FIELDS.has(f.key) && (s[f.key] || "").trim() !== ""
                  );
                  if (visible.length === 0) return null;
                  return (
                    <div key={group.title}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          fontSize: 11,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {visible.map((f) => {
                          const Icon = f.icon ? ICONS[f.icon] : null;
                          const isBold =
                            f.key === "負責老師" || f.key === "負責老師2";
                          const isUrl =
                            f.key === "Jamf Pro URL" ||
                            f.key === "Jamf Pro URL2";
                          return (
                            <div
                              key={f.key}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 6,
                              }}
                            >
                              {Icon ? (
                                <Icon
                                  size={12}
                                  style={{
                                    color: "var(--accent)",
                                    flexShrink: 0,
                                    marginTop: 1,
                                  }}
                                />
                              ) : (
                                <span
                                  style={{
                                    color: "var(--text-muted)",
                                    minWidth: "50px",
                                    fontSize: 10,
                                  }}
                                >
                                  {f.label}
                                </span>
                              )}
                              {isUrl ? (
                                <a
                                  href={s[f.key]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    flex: 1,
                                    color: "var(--accent)",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    fontSize: 11,
                                  }}
                                >
                                  {s[f.key]}
                                </a>
                              ) : (
                                <span
                                  style={{
                                    flex: 1,
                                    fontWeight: isBold ? 500 : 400,
                                    fontSize: 11,
                                  }}
                                >
                                  {s[f.key]}
                                </span>
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
