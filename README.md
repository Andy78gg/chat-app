# 💬 豆包聊天室

一个简单的多人实时聊天室。前端是纯 HTML/CSS/JS，托管在 GitHub Pages；消息存储用 Firebase Firestore，图片存储用 Firebase Storage，无需自己写服务器。

## 功能

- 进入时输入昵称（下次访问自动记住）
- 多人实时收发消息（Firebase 实时同步）
- **发送图片**（自动压缩后上传到 Firebase Storage，点击可查看大图）
- 手机 / 电脑都能用，响应式布局

## 目录结构

```
chat-app/
├── index.html    # 页面结构
├── style.css     # 样式
├── app.js        # 逻辑 + Firebase 接入
├── firestore.rules  # Firestore 安全规则（部署用）
└── storage.rules    # Storage 安全规则（部署用）
```

## 运行前必做：配置 Firebase

1. 打开 <https://console.firebase.google.com>，用 Google 账号登录
2. 点「添加项目」→ 输入项目名（如 `my-chat-room`）→ 创建（Analytics 可跳过）
3. 项目创建后，点左侧「构建」→「Firestore Database」→「创建数据库」
   - 选择生产模式（或测试模式均可，后面用规则文件锁定）
   - 区域选离你近的（如 `us-central` / `asia-east1`）
4. 回到项目概览 → 点网页 `</>` 图标「添加应用」→ 注册网页应用
5. 把显示的配置（`apiKey`、`projectId`、`appId` 等）复制
6. 打开本项目的 `app.js`，替换文件顶部的 `firebaseConfig` 占位符

### 部署 Firestore 安全规则（重要）

把项目里的 `firestore.rules` 部署到 Firebase：

- 方法一（控制台）：Firestore → 规则 → 粘贴 `firestore.rules` 内容 → 发布
- 方法二（命令行，需要安装 Firebase CLI）：

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # 选择本项目
firebase deploy --only firestore
```

### 部署 Storage 安全规则（发图片需要）

1. 控制台左侧「构建」→「Storage」→「开始使用」→ 生产模式 → 完成
2. Storage → 规则 → 粘贴 `storage.rules` 内容 → 发布

> ⚠️ 注意：公开聊天室任何人（知道链接的人）都可以读写。`firestore.rules` 和 `storage.rules` 已加了基础校验（昵称/内容长度限制、图片大小限制），但如果你想更严格，建议后续加个简单的房间口令或匿名认证。

## 本地预览

直接用浏览器打开 `index.html` 即可（无需服务器，Firebase 走 CDN）。

## 部署到 GitHub Pages

1. 把仓库 Settings → Pages 的 Source 设为 `main` 分支根目录
2. 访问 `https://你的用户名.github.io/仓库名/` 即可打开聊天室
