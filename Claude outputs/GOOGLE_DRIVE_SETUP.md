# Google Drive Maintenance Upload - 設定指南

## 概述
此設定將允許 Next.js 應用程式直接上傳維護紀錄到 Google Drive。

## 步驟 1: 建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案（或選擇現有專案）
3. 記下專案 ID

## 步驟 2: 啟用 Google Drive API

1. 在 Google Cloud Console 中，搜尋 "Google Drive API"
2. 點擊「啟用」按鈕
3. 等待 API 啟用完成

## 步驟 3: 建立服務帳戶

1. 在 Google Cloud Console 左側菜單，點擊「服務帳戶」
2. 點擊「建立服務帳戶」
3. 填寫服務帳戶名稱（例如：school-hub-maintenance）
4. 點擊「建立」
5. 跳過選擇角色和授予使用者存取權的部分，點擊「繼續」

## 步驟 4: 建立金鑰

1. 在服務帳戶頁面，點擊您新建的服務帳戶
2. 點擊「金鑰」標籤
3. 點擊「新增金鑰」→「建立新金鑰」
4. 選擇 JSON 格式
5. 點擊「建立」
6. 下載的 JSON 檔案會自動保存

## 步驟 5: 提取環境變數

打開下載的 JSON 檔案，您會看到類似這樣的內容：

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/...",
  "universe_domain": "googleapis.com"
}
```

## 步驟 6: 在 Vercel 中設定環境變數

1. 前往 [Vercel 儀表板](https://vercel.com)
2. 選擇您的 school-hub 專案
3. 點擊「Settings」→「Environment Variables」
4. 為每個變數新增以下環境變數：

| 變數名稱 | 值 |
|---------|-----|
| `GOOGLE_PROJECT_ID` | 來自 JSON 的 `project_id` |
| `GOOGLE_PRIVATE_KEY_ID` | 來自 JSON 的 `private_key_id` |
| `GOOGLE_PRIVATE_KEY` | 來自 JSON 的 `private_key` |
| `GOOGLE_CLIENT_EMAIL` | 來自 JSON 的 `client_email` |
| `GOOGLE_CLIENT_ID` | 來自 JSON 的 `client_id` |
| `GOOGLE_AUTH_URI` | 來自 JSON 的 `auth_uri` |
| `GOOGLE_TOKEN_URI` | 來自 JSON 的 `token_uri` |
| `GOOGLE_AUTH_PROVIDER_X509_CERT_URL` | 來自 JSON 的 `auth_provider_x509_cert_url` |
| `GOOGLE_CLIENT_X509_CERT_URL` | 來自 JSON 的 `client_x509_cert_url` |
| `GOOGLE_DRIVE_FOLDER_ID` | `1VuQbSzxl5mrmP521hVeHmhfzVqHAM-Eo` |

## 步驟 7: 分享 Google Drive 資料夾給服務帳戶

1. 打開 [Google Drive 資料夾](https://drive.google.com/drive/u/2/folders/1VuQbSzxl5mrmP521hVeHmhfzVqHAM-Eo)
2. 右鍵點擊資料夾，選擇「分享」
3. 在「分享對象」欄位中，貼上服務帳戶的電子郵件地址（`GOOGLE_CLIENT_EMAIL` 的值）
4. 選擇「編輯」權限
5. 點擊「分享」

## 步驟 8: 部署 API 路由

1. 將 `maintenance-upload.js` 檔案放在您的 Next.js 專案中：
   ```
   app/api/maintenance-upload/route.js
   ```

2. 確保您已安裝 Google API 用戶端庫：
   ```bash
   npm install googleapis
   ```

3. 將檔案內容替換為提供的模板

4. 提交變更並推送到 Git：
   ```bash
   git add app/api/maintenance-upload/route.js
   git commit -m "Add Google Drive maintenance upload API"
   git push
   ```

5. Vercel 會自動重新部署

## 步驟 9: 修改前端程式碼（如果需要）

前端程式碼已經配置好與此 API 通訊。驗證 `MaintenanceModal` 中的以下程式碼：

```javascript
const res = await fetch("/api/maintenance-upload", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    file: fileData, // Base64 編碼的檔案
    schoolName: school["行政區合併學校名稱"],
    date: date, // YYYY-MM-DD 格式
    handler: handler,
  }),
});
```

## 檔名格式

系統會自動將檔案名稱格式化為：
```
{ROC年份}{月份}{日期}_{學校名稱}_{負責人}
```

範例：
- 日期：2026-01-15
- 學校名稱：旗津區旗津國小
- 負責人：Iris
- 結果：1150115_旗津區旗津國小_Iris.png

## 故障排除

### 錯誤：「無法驗證」
- 確保 `GOOGLE_PRIVATE_KEY` 正確包含所有換行符（`\n`）

### 錯誤：「權限被拒絕」
- 確保已將 Google Drive 資料夾分享給服務帳戶電子郵件

### 錯誤：「404 Not Found」
- 檢查 `GOOGLE_DRIVE_FOLDER_ID` 是否正確

### 上傳速度慢
- 檢查檔案大小，確保不超過 25MB

## 安全注意事項

- ✅ 服務帳戶金鑰存儲在 Vercel 的環境變數中（加密）
- ✅ 金鑰不會暴露給前端程式碼
- ✅ 所有上傳都通過您自己的伺服器進行
- ✅ 金鑰永遠不應提交到 Git
