"use client";

import { useEffect, useMemo, useState } from "react";
import { Phone, Smartphone, Mail } from "lucide-react";

const ICONS = { phone: Phone, mobile: Smartphone, mail: Mail };

const FIELD_GROUPS = [
  {
    title: "基本資料",
    fields: [
      { key: "學校代碼", label: "學校代碼" },
      { key: "學校名稱", label: "學校名稱" },
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
const HEADER_FIELDS = new Set(["學校代碼", "學校名稱"]);

export default function SchoolInfoPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [historyFor, setHistoryFor] = useState(null);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  async function loadSchools() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/school-info");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setSchools(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchools();
  }, []);

  const filtered = useMemo(
    () => schools.filter((s) => (s["學校名稱"] || "").includes(search)),
    [schools, search]
  );

  async function openHistory(code) {
    setHistoryFor(code);
    setHistoryEntries([]);
    const res = await fetch(`/api/school-info/history?code=${encodeURIComponent(code)}`);
    const json = await res.json();
    if (Array.isArray(json)) setHistoryEntries(json);
  }

  async function saveEdits(form) {
    setSaving(true);
    try {
      const updates = {};
      ALL_FIELDS.forEach((f) => {
        if (form[f.key] !== editing[f.key]) updates[f.key] = form[f.key];
      });
      const res = await fetch("/api/school-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row: editing.__row, updates }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setEditing(null);
      await loadSchools();
    } catch (err) {
      alert("儲存失敗：" + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">學校資訊</h1>

      <input
        type="search"
        placeholder="搜尋學校名稱..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        style={{ width: "100%", marginBottom: 18 }}
      />

      {loading && <p style={{ color: "var(--text-muted)" }}>讀取中...</p>}
      {error && (
        <p style={{ color: "var(--danger)" }}>
          讀取失敗：{error}（請確認環境變數與試算表分享權限）
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((s) => (
          <div className="card" key={s.__row}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
              <p style={{ fontWeight: 500, fontSize: 15, margin: 0 }}>{s["學校名稱"]}</p>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s["學校代碼"]}</span>
            </div>

            {FIELD_GROUPS.map((group) => {
              const visible = group.fields.filter(
                (f) => !HEADER_FIELDS.has(f.key) && (s[f.key] || "").trim() !== ""
              );
              if (visible.length === 0) return null;
              return (
                <div
                  key={group.title}
                  style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}
                >
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 4px" }}>
                    {group.title}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 13, color: "var(--text-secondary)" }}>
                    {visible.map((f) => {
                      const Icon = f.icon ? ICONS[f.icon] : null;
                      return (
                        <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {Icon ? (
                            <Icon size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                          ) : (
                            <span>{f.label}：</span>
                          )}
                          <span>{s[f.key]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => setEditing(s)}>編輯</button>
              <button className="secondary" onClick={() => openHistory(s["學校代碼"])}>
                修改歷程
              </button>
            </div>
          </div>
        ))}
        {!loading && !error && filtered.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>沒有符合的學校。</p>
        )}
      </div>

      {editing && (
        <EditModal school={editing} saving={saving} onClose={() => setEditing(null)} onSave={saveEdits} />
      )}

      {historyFor && (
        <HistoryModal code={historyFor} entries={historyEntries} onClose={() => setHistoryFor(null)} />
      )}
    </div>
  );
}

function EditModal({ school, saving, onClose, onSave }) {
  const [form, setForm] = useState(() => ({ ...school }));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="card" style={{ width: 480, maxHeight: "80vh", overflow: "auto", background: "var(--surface-1)" }}>
        <p style={{ fontWeight: 500, fontSize: 14, margin: "0 0 12px" }}>編輯學校資訊</p>

        {FIELD_GROUPS.map((group) => (
          <div key={group.title} style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 6px" }}>{group.title}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", fontSize: 12 }}>
              {group.fields.map((f) => (
                <label key={f.key} style={{ gridColumn: f.full ? "1 / 3" : "auto" }}>
                  {f.label || f.key}
                  <input
                    type="text"
                    value={form[f.key] || ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    style={{ width: "100%", marginTop: 2 }}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 8, marginTop: 4, justifyContent: "flex-end" }}>
          <button disabled={saving} onClick={() => onSave(form)}>
            {saving ? "儲存中..." : "儲存"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryModal({ code, entries, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="card" style={{ width: 420, maxHeight: "80vh", overflow: "auto", background: "var(--surface-1)" }}>
        <p style={{ fontWeight: 500, fontSize: 14, margin: "0 0 12px" }}>修改歷程 — {code}</p>
        {entries.length === 0 && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>目前沒有異動紀錄。</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map((e, i) => (
            <div key={i} style={{ fontSize: 12, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
              <div style={{ color: "var(--text-muted)" }}>{new Date(e.time).toLocaleString("zh-TW")}</div>
              <div>
                {e.field}：{e.oldValue || "（空）"} → {e.newValue || "（空）"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
