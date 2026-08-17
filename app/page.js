"use client";

import links from "../data/links.json";

export default function DashboardPage() {
  const groups = Object.entries(links);

  return (
    <div>
      <h1 className="page-title">常用網址</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        {groups.map(([groupName, items]) => (
          <div key={groupName}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: "0 0 12px",
                paddingBottom: 8,
                borderBottom: "2px solid var(--accent)",
              }}
            >
              {groupName}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
                    borderLeft: "3px solid var(--accent)",
                    textDecoration: "none",
                    fontSize: 14,
                    padding: 12,
                    borderRadius: 6,
                    color: "var(--text-primary)",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(4px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 20 }}>
        要新增或修改網址，編輯 <code>data/links.json</code> 即可，不需要改程式碼。
      </p>
    </div>
  );
}
