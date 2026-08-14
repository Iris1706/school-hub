import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "工作彙整",
  description: "個人常用網址、行程與工作紀錄彙整站",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>
        <div className="layout">
          <Sidebar />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
