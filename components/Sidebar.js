"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "儀表板" },
  { href: "/schedule", label: "每日行程" },
  { href: "/repair", label: "報修紀錄" },
  { href: "/school-info", label: "學校資訊" },
  { href: "/weekly-report", label: "週報產生器" },
  { href: "/training", label: "教育訓練" },
  { href: "/hardware", label: "硬體維修" },
  { href: "/todo", label: "待辦事項" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="sidebar">
      <div className="sidebar-title">工作彙整</div>
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
