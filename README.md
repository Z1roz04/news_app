# 新闻资讯平台

全栈新闻资讯应用：**FastAPI 后端**、**Vue 3 移动端（Vant）**与 **Vue 3 桌面端（Element Plus + Tailwind）**，支持用户体系、收藏与历史、Redis 缓存、**外部新闻采集入库**，以及基于 **LangChain + 兼容 OpenAI 的 API** 的 **AI 资讯助手**（SSE 流式输出）。

## 🆕 重大架构更新 - PC端 + 移动端双视图分离架构

> **2026-05-02 更新**：已完成 Monorepo 架构改造，实现 PC 端和移动端视图完全独立、公共逻辑完全互通的双视图架构。

### 架构特点

| 特性 | 说明 |
|------|------|
| **视图完全独立** | PC 端 (`apps/pc/`) 和移动端 (`apps/mobile/`) 各自保留原有布局、样式、排版，不做响应式强制合并 |
| **设备自动识别** | Nginx 层根据 User-Agent 自动分发到对应视图，也可前端检测跳转 |
| **公共逻辑互通** | 登录 Token、用户信息、接口请求、状态管理、工具方法、全局样式统一共用 |
| **后端接口共用** | 双端使用同一套后端 API (`toutiao/`) |
| **最小改动原则** | 原有业务代码完全保留，仅通过共享层 (`packages/shared/`) 复用逻辑 |
| **后续开发友好** | 新增功能时，数据逻辑只写一份（在 `shared/`），视图各自开发 |

### 目录结构

```
news-platform/
├── apps/
│   ├── mobile/                    # 移动端（原 xwzx-news，完全保留）
│   │   ├── src/
│   │   ├── package.json           # 依赖 @news-platform/shared
│   │   └── vite.config.js
│   └── pc/                        # PC端（原 xwzx-news-pc，完全保留）
│       ├── src/
│       ├── package.json           # 依赖 @news-platform/shared
│       └── vite.config.js
├── packages/
│   └── shared/                    # 共享层（新增）
│       ├── src/
│       │   ├── api/               # 接口请求（axios、API 方法）
│       │   ├── stores/            # Pinia 状态管理（user、news、favorite、history）
│       │   ├── utils/             # 工具方法（设备检测、本地存储等）
│       │   ├── i18n/              # 国际化配置（中/英文）
│       │   └── config/            # 全局配置（API 地址、端点枚举）
│       └── package.json
├── toutiao/                       # FastAPI 后端（完全保留）
├── nginx.conf                     # 设备识别 + 路由分发配置
├── package.json                   # Workspace 根配置
├── pnpm-workspace.yaml            # pnpm monorepo 配置
└── README.md                      # 本文件
```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Python 3.9+、FastAPI、Uvicorn、SQLAlchemy（异步）+ aiomysql、Pydantic、Redis、HTTPX |
| AI | LangChain、LangChain-OpenAI（`OPENAI_API_KEY` / `OPENAI_BASE_URL`，可用 DeepSeek 等兼容端点） |
| 采集 | 可配置外部新闻 API（见环境变量 `NEWS_API_*`），脚本：`toutiao/tasks/fetch_news.py` |
| 移动端 | Vue 3、Vite、Pinia、Vue Router、Vant、vue-i18n、Marked、DOMPurify |
| 桌面端 | Vue 3、Vite、Pinia、Vue Router、Element Plus、Tailwind CSS 4、vue-i18n |

---

## 功能概览

| 模块 | 说明 |
|------|------|
| 新闻 | 分类、列表分页、详情、相关推荐、浏览量；列表/分类可走 Redis 缓存 |
| 用户 | 注册、登录、Token、资料与密码 |
| 收藏 / 历史 | 增删查、清空 |
| AI 问答 | 后端聚合大模型 + **站内新闻工具调用**，SSE 流式返回；前端 Markdown 安全渲染 |
| 新闻采集 | 从配置的第三方源拉取并规范化写入数据库（CLI 任务） |
| 国际化 | 中 / 英（两端前端均支持） |
| 双视图分离 | PC 端和移动端 UI 完全独立，自动设备识别 |

---

## 环境要求

- Python **3.9+**
- Node.js **18+**（推荐；Vite 8 桌面端需较新运行时）
- **MySQL 8**（或与你当前 `aiomysql` 配置兼容的版本）
- **Redis**
- **npm** 或 **yarn**（Node.js 自带 npm）

---

## 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖（会自动安装 workspace 内所有包的依赖）
npm install

# 或使用 yarn
yarn install
```

### 2. 后端

```bash
cd toutiao
python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
copy .env.example .env
# 编辑 .env：数据库、Redis、（可选）新闻 API 与 AI
```

启动 API：

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- 交互式文档：<http://127.0.0.1:8000/docs>
- 根路径：`GET /` 健康探测

**AI 相关（写入 `toutiao/.env`）**

- `OPENAI_API_KEY`：API Key（若使用 DeepSeek 等，按其文档填写）
- `OPENAI_BASE_URL`：可选；使用兼容 OpenAI 的第三方网关时设置（如 `https://api.deepseek.com`）

**新闻采集（可选）**

在 `.env` 中配置 `NEWS_API_URL`、`NEWS_API_KEY` 等（参见 `.env.example` 内注释）。在项目根下执行：

```bash
cd toutiao
python -m tasks.fetch_news --source example_api --limit 20
```

当前支持的 `--source`：`example_api`、`aliyun`（与 `.env` 中 `NEWS_API_*` 及 `providers` 实现一致）。采集前请保证数据库中已有新闻分类数据。

### 3. 前端（Monorepo 方式）

#### 开发模式

```bash
# 同时启动 PC 端和移动端（并行）
npm run dev

# 或分别启动
npm run dev:pc     # PC 端，端口 5174
npm run dev:mobile # 移动端，端口 5173
```

#### 生产构建

```bash
# 构建所有前端应用
npm run build

# 或分别构建
npm run build:pc     # 输出到 apps/pc/dist/
npm run build:mobile # 输出到 apps/mobile/dist/
```

> **注意**：如果使用 Yarn，命令为 `yarn dev:pc`、`yarn build` 等

### 4. 部署（Nginx 设备识别）

将构建产物部署到服务器，并配置 Nginx：

```bash
# 复制 Nginx 配置
sudo cp nginx.conf /etc/nginx/conf.d/news-platform.conf

# 修改配置中的路径为实际路径
# 重启 Nginx
sudo nginx -s reload
```

Nginx 配置会自动根据 User-Agent 分发：
- **PC 设备** (`/`) → 自动重定向到 `/pc`
- **移动设备** (`/`) → 自动重定向到 `/mobile`
- **API 请求** (`/api/*`) → 转发到后端 `localhost:8000`

---

## 主要 API 前缀

| 前缀 | 说明 |
|------|------|
| `/api/news` | 新闻与分类 |
| `/api/user` | 用户 |
| `/api/favorite` | 收藏 |
| `/api/history` | 浏览历史 |
| `/api/ai` | AI 对话（流式等，见 Swagger） |

完整路径与请求体以 **Swagger** 为准。

---

## 共享层使用说明

`packages/shared/` 提供以下模块，PC 端和移动端均可直接导入使用：

```javascript
// 1. API 模块
import { userApi, newsApi, favoriteApi, historyApi, aiApi } from '@news-platform/shared'

// 2. 状态管理
import { useUserStore, useNewsStore, useFavoriteStore, useHistoryStore } from '@news-platform/shared'

// 3. 工具函数
import { isMobile, isPC, getDeviceType } from '@news-platform/shared'
import { setLocalStorage, getLocalStorage } from '@news-platform/shared'

// 4. 国际化
import { createSharedI18n, setLocale, supportedLocales } from '@news-platform/shared'

// 5. 配置
import { apiConfig, API_ENDPOINTS } from '@news-platform/shared'
```

### 状态管理共享示例

```javascript
// apps/mobile/src/store/user.js
// 从共享层重新导出，保持兼容性
export { useUserStore } from '@news-platform/shared'

// 在组件中使用
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
await userStore.login({ username, password })
```

两端使用同一套 `userStore`，登录状态在 PC 和移动端完全同步（通过 localStorage）。

---

## 配置与安全建议

1. **勿将** `toutiao/.env` 提交到 Git；仅维护 `.env.example`。
2. **生产环境**请将 `main.py` 中 CORS 的 `allow_origins` 从 `["*"]` 改为实际前端域名。
3. 第三方 **AI Key**、**新闻 API Key** 只放在后端环境变量，前端仅配置自有后端 `baseURL`。
4. **Monorepo 安全**：`packages/shared/` 中的配置（如 API 地址）建议通过环境变量注入，避免硬编码。

---

## 设备识别方案

### 方案 1：Nginx 层识别（推荐用于生产）

已在 `nginx.conf` 中配置，通过 User-Agent 自动识别并分发。

### 方案 2：前端检测 + 自动跳转

已在 `apps/mobile/index.html` 和 `apps/pc/index.html` 中添加检测脚本，可启用自动跳转：

```javascript
// 取消注释 index.html 中的以下行：
window.location.href = pcUrl;      // 移动端检测到 PC 设备
window.location.href = mobileUrl;  // PC 端检测到移动设备
```

### 方案 3：子域名分发（可选）

```
m.news.example.com  → 移动端
www.news.example.com → PC 端
```

参见 `nginx.conf` 中的注释部分。

---

## 后续开发指南

### 新增功能的标准流程

1. **数据逻辑**（接口、状态管理）→ 写在 `packages/shared/`
2. **移动端视图** → 写在 `apps/mobile/src/views/`
3. **PC 端视图** → 写在 `apps/pc/src/pages/`

### 示例：新增"消息通知"功能

```javascript
// 1. packages/shared/src/api/notification.js
export const notificationApi = {
  getList: () => axios.get('/api/notifications'),
  markRead: (id) => axios.post(`/api/notifications/${id}/read`),
}

// 2. packages/shared/src/stores/notification.js
export const useNotificationStore = defineStore('notification', {
  // 状态、actions...
})

// 3. apps/mobile/src/views/Notifications.vue
// 移动端专属视图，使用 useNotificationStore

// 4. apps/pc/src/pages/Notifications.vue
// PC 端专属视图，使用 useNotificationStore
```

---

## 许可证

若需开源许可证，请在仓库中自行补充 `LICENSE` 文件。

---

## 支持与反馈

如有问题或建议，欢迎提交 Issue 或联系开发团队。
