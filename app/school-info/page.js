"use client";

import { useEffect, useMemo, useState } from "react";

const FIELDS = [
  { key: "學校名稱", label: "學校名稱" },
  { key: "學校代碼", label: "學校代碼" },
  { key: "地址", label: "地址", full: true },
  { key: "Jamf ID", label: "Jamf ID" },
  { key: "Jamf 密碼", label: "Jamf 密碼" },
  { key: "負責老師", label: "負責老師" },
  { key: "電話", label: "電話" },
  { key: "Mail", label: "Mail", full: true },
  { key: "第二聯絡人姓名", label: "第二聯絡人姓名" },
  { key: "第二聯絡人分機", label: "第二聯絡人分機" },
  { key: "第二聯絡人手機", label: "第二聯絡人手機" },
  { key: "第二聯絡人Email", label: "第二聯絡人Email" },
];

export default function SchoolInfoPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // school object being edited
  const [historyFor, setHistoryFor] = useState(null); // school code being viewed
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
      FIELDS.forEach((f) => {
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
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--text-secondary)" }}>
              <div>地址：{s["地址"]}</div>
              <div>Jamf ID：{s["Jamf ID"]}</div>
              <div>Jamf 密碼：{s["Jamf 密碼"]}</div>
              <div>負責老師：{s["負責老師"]}</div>
              <div>電話：{s["電話"]}</div>
              <div>Mail：{s["Mail"]}</div>
              {s["第二聯絡人姓名"] && (
                <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid var(--border)" }}>
                  第二聯絡人：{s["第二聯絡人姓名"]}・{s["第二聯絡人分機"]}・
                  {s["第二聯絡人手機"]}・{s["第二聯絡人Email"]}
                </div>
              )}
            </div>
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
        <EditModal
          school={editing}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={saveEdits}
        />
      )}

      {historyFor && (
        <HistoryModal
          code={historyFor}
          entries={historyEntries}
          onClose={() => setHistoryFor(null)}
        />
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
      <div className="card" style={{ width: 440, maxHeight: "80vh", overflow: "auto", background: "var(--surface-1)" }}>
        <p style={{ fontWeight: 500, fontSize: 14, margin: "0 0 12px" }}>編輯學校資訊</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", fontSize: 12 }}>
          {FIELDS.map((f) => (
            <label key={f.key} style={{ gridColumn: f.full ? "1 / 3" : "auto" }}>
              {f.label}
              <input
                type="text"
                value={form[f.key] || ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                style={{ width: "100%", marginTop: 2 }}
              />
            </label>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
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
