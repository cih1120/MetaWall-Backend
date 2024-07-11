# MetaWall Backend

這是MetaWall專案的後端部分，該專案為參加六角學院2024春季Node.js直播班完成的專案。

此專案使用Node.js、Express和Mongoose構建。

## 專案描述

MetaWall是一個社交媒體平台，提供用戶發佈動態、評論和點讚等功能。本專案負責後端API的開發與管理。

## 功能清單

- 用戶註冊與登入
- 個人資料修改
- 發佈動態
- 留言功能
- 追蹤清單
- 點讚功能
- 圖片上傳
- JWT 權限驗證

## 安裝指南

### 1. Clone

```bash
git clone https://github.com/your-repo/metawall-backend.git
cd metawall-backend
```

### 2. 安裝依賴 
```bash
npm install
```

### 3. 配置環境變數
參考[.env_example](https://github.com/cih1120/HexSchool_2024node_nodeExpress/blob/master/.env_example) 進行環境配置。

### 4. 啟動專案
開發環境:
``` bash
npm run start:dev
``` 
生產環境:
``` bash
npm run start:production
``` 

## 使用方法
此專案提供RESTful API，以下是主要EndPoint：
（更多EndPoint請參考[Node.js_Final_local.postman_collection.json](https://github.com/cih1120/HexSchool_2024node_nodeExpress/blob/master/Node.js_Final_local.postman_collection.json)文件）
* `POST /api/users/register` - 用戶註冊
* `POST /api/users/login` - 用戶登入
* `POST /api/posts` - 發佈動態
* `GET /api/posts` - 獲取所有動態
* `POST /api/posts/:id/comments` - 發佈評論
* `POST /api/posts/:id/like` - 點讚

### JWT 驗證
本專案使用JWT（JSON Web Token）進行用戶驗證。JWT有效期限設置為7天。用戶在註冊或登入成功後，會收到一個JWT，該JWT需要在每次API請求中通過HTTP標頭Authorization攜帶。

## 前端專案
前端專案位於 [MetaWall Frontend Repository](https://github.com/cih1120/MetaWall-Frontend)。
請參考該Repo以了解更多前端實現細節。


## 聯絡方式
開發者：念慈 (Hannah)
Email: a22483268@gmail.com
