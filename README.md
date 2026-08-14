# 工作彙整網站

## 目前完成的頁面
- 儀表板（常用網址）：讀取 `data/links.json`，直接編輯這個檔案就能新增/修改網址，不用改程式碼。
- 學校資訊：讀取/寫入 Google 試算表（卡片式、搜尋、編輯、修改歷程）。
- 每日行程／報修紀錄／週報產生器／教育訓練／硬體維修：先建立頁籤，內容之後再加。

## 學校資訊試算表格式

**分頁 1：`學校資訊`**，第一列是欄位標題，必須完全符合這些名稱（順序不拘）：

```
學校名稱 / 學校代碼 / 地址 / Jamf ID / Jamf 密碼 / 負責老師 / 電話 / Mail /
第二聯絡人姓名 / 第二聯絡人分機 / 第二聯絡人手機 / 第二聯絡人Email
```

**分頁 2：`修改歷程`**，用來自動記錄每次編輯，欄位（不用手動填，系統會自動寫入）：

```
時間 / 學校代碼 / 欄位名稱 / 舊值 / 新值
```

## 設定步驟

1. **建立 Google 服務帳戶**：到 Google Cloud Console 建一個專案 → 啟用 Google Sheets API → 建立服務帳戶並下載金鑰（JSON）。
2. **把服務帳戶加入試算表的共用名單**：金鑰 JSON 裡的 `client_email`，用「編輯者」權限加到你的學校資訊試算表分享名單（不是「知道連結者」，因為要能寫入）。
3. **設定環境變數**：複製 `.env.example` 為 `.env.local`（本機測試）或直接在 Vercel 專案設定裡填入：
   - `GOOGLE_SHEET_ID`：試算表網址中 `/d/` 和 `/edit` 之間那段
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`：金鑰 JSON 裡的 `client_email`
   - `GOOGLE_PRIVATE_KEY`：金鑰 JSON 裡的 `private_key`（整段貼上）

## 本機測試

```bash
npm install
npm run dev
```

打開 http://localhost:3000

## 部署到 Vercel

1. 把這個資料夾推上你自己的 GitHub repo。
2. 到 vercel.com → Import Project → 選這個 repo。
3. 在 Vercel 專案的 Settings → Environment Variables，貼上上面三個環境變數。
4. Deploy，之後每次 push 到 GitHub 會自動重新部署。

## 之後要修改常用網址

直接編輯 `data/links.json`，存檔後 push 上 GitHub，Vercel 會自動重新部署。
