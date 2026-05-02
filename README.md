# 新闻资讯平台

全栈新闻资讯应用：**FastAPI 后端**、**Vue 3 移动端（Vant）**与 **Vue 3 桌面端（Element Plus + Tailwind）**，支持用户体系、收藏与历史、Redis 缓存、**外部新闻采集入库**，以及基于 **LangChain + 兼容 OpenAI 的 API** 的 **AI 资讯助手**（SSE 流式输出）。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Python 3.9+、FastAPI、Uvicorn、SQLAlchemy（异步）+ aiomysql、Pydantic、Redis、HTTPX |
| AI | LangChain、LangChain-OpenAI（`OPENAI_API_KEY` / `OPENAI_BASE_URL`，可用 DeepSeek 等兼容端点） |
| 采集 | 可配置外部新闻 API（见环境变量 `NEWS_API_*`），脚本：`toutiao/tasks/fetch_news.py` |
| 移动端 | Vue 3、Vite、Pinia、Vue Router、Vant、vue-i18n、Marked、DOMPurify |
| 桌面端 | Vue 3、Vite、Pinia、Vue Router、Element Plus、Tailwind CSS 4、vue-i18n |

## 功能概览

| 模块 | 说明 |
|------|------|
| 新闻 | 分类、列表分页、详情、相关推荐、浏览量；列表/分类可走 Redis 缓存 |
| 用户 | 注册、登录、Token、资料与密码 |
| 收藏 / 历史 | 增删查、清空 |
| AI 问答 | 后端聚合大模型 + **站内新闻工具调用**，SSE 流式返回；前端 Markdown 安全渲染 |
| 新闻采集 | 从配置的第三方源拉取并规范化写入数据库（CLI 任务） |
| 国际化 | 中 / 英（两端前端均支持） |

## 仓库结构

```
├── toutiao/                      # 后端（FastAPI）
│   ├── main.py                   # 应用入口、CORS、路由挂载
│   ├── config/                   # 数据库等配置
│   ├── models/                   # ORM 模型
│   ├── schemas/                  # 请求/响应模型（含 aichat）
│   ├── crud/                     # 数据访问与缓存
│   ├── routers/                  # news, user, favorite, history, aichat
│   ├── services/news_ingest/     # 采集：providers、normalizer、service
│   ├── tasks/fetch_news.py       # 采集入口脚本
│   ├── utils/                    # 认证、异常、aiserver（LLM + 工具）
│   ├── requirements.txt
│   └── .env.example              # 环境变量模板
├── xwzx-news/                    # 移动端（Vant）
│   └── src/config/api.js         # 后端 baseURL
└── xwzx-news-pc/                 # 桌面端（Element Plus）
    └── src/config/api.js         # 后端 baseURL
```

## 环境要求

- Python **3.9+**
- Node.js **18+**（推荐；Vite 8 桌面端需较新运行时）
- **MySQL 8**（或与你当前 `aiomysql` 配置兼容的版本）
- **Redis**

## 快速开始

### 1. 后端

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

### 2. 移动端前端

```bash
cd xwzx-news
npm install
npm run dev
```

将 `src/config/api.js` 中的 `baseURL` 改为你的后端地址（默认 `http://127.0.0.1:8000`）。

### 3. 桌面端前端

```bash
cd xwzx-news-pc
npm install
npm run dev
```

同样修改 `src/config/api.js` 的 `baseURL`。

生产构建：`npm run build`，静态资源在各自项目的 `dist/`。

## 主要 API 前缀

| 前缀 | 说明 |
|------|------|
| `/api/news` | 新闻与分类 |
| `/api/user` | 用户 |
| `/api/favorite` | 收藏 |
| `/api/history` | 浏览历史 |
| `/api/ai` | AI 对话（流式等，见 Swagger） |

完整路径与请求体以 **Swagger** 为准。

## 配置与安全建议

1. **勿将** `toutiao/.env` 提交到 Git；仅维护 `.env.example`。
2. **生产环境**请将 `main.py` 中 CORS 的 `allow_origins` 从 `["*"]` 改为实际前端域名。
3. 第三方 **AI Key**、**新闻 API Key** 只放在后端环境变量，前端仅配置自有后端 `baseURL`。

## 许可证

若需开源许可证，请在仓库中自行补充 `LICENSE` 文件。
