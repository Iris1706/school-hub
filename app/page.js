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
                fontSize: 13,
                color: "var(--text-muted)",
                margin: "0 0 10px",
                paddingBottom: 6,
                borderBottom: "1px solid var(--border)",
              }}
            >
              {groupName}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="card"
                  style={{ textDecoration: "none", fontSize: 14 }}
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
