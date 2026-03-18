# Image Background Remover

一键去除图片背景，基于 [remove.bg API](https://www.remove.bg/api)，部署在 Cloudflare 上。

## 技术栈

- **前端**：纯 HTML/CSS/JS → Cloudflare Pages
- **后端**：Cloudflare Workers（代理 remove.bg API）
- **存储**：无（纯内存流转）

## 项目结构

```
├── frontend/
│   └── index.html        # 前端单页应用
└── worker/
    ├── index.js          # Cloudflare Worker
    └── wrangler.toml     # Worker 配置
```

## 部署步骤

### 1. 部署 Worker

```bash
cd worker
npm install -g wrangler
wrangler login
# 设置 API Key（不要写在代码里）
wrangler secret put REMOVE_BG_API_KEY
wrangler deploy
```

部署后记录 Worker URL，格式为：
`https://image-bg-remover-worker.<your-subdomain>.workers.dev`

### 2. 更新前端 Worker URL

编辑 `frontend/index.html`，找到：
```js
const WORKER_URL = 'https://image-bg-remover-worker.<your-subdomain>.workers.dev/api/remove-bg';
```
替换为你的实际 Worker URL。

### 3. 部署前端到 Cloudflare Pages

在 [Cloudflare Dashboard](https://dash.cloudflare.com) 创建 Pages 项目，上传 `frontend/` 目录即可。

## 本地开发

```bash
cd worker
wrangler dev
```

## 环境变量

| 变量名 | 说明 |
|--------|------|
| `REMOVE_BG_API_KEY` | remove.bg API Key，在 [此处获取](https://www.remove.bg/api) |
