# 新闻资讯平台

一个移动端新闻资讯应用，前后端分离架构，集成 AI 问答功能。

## 技术栈

**后端**
- FastAPI + Uvicorn
- SQLAlchemy（异步ORM）+ aiomysql
- MySQL 数据库
- Redis 缓存
- Pydantic 数据校验
- Token 认证

**前端**
- Vue 3 + Vite
- Pinia 状态管理
- Vue Router
- Vant 移动端 UI 组件库
- vue-i18n 国际化
- DeepSeek AI 问答（SSE 流式传输）

## 功能模块

| 模块 | 说明 |
|------|------|
| 新闻浏览 | 分类筛选、列表分页、详情展示、相关推荐、浏览量统计 |
| 用户系统 | 注册、登录、Token 认证、个人信息管理、密码修改 |
| 收藏功能 | 添加/取消收藏、收藏列表、清空收藏 |
| 浏览历史 | 自动记录、历史列表、删除单条、清空历史 |
| AI 问答 | 基于 DeepSeek 大模型，SSE 流式响应，支持 Markdown 渲染 |
| 国际化 | 中文/英文切换 |
| 缓存机制 | Redis 缓存新闻分类和列表，降低数据库压力 |

## 项目结构

```
├── toutiao/                # 后端（FastAPI）
│   ├── main.py             # 应用入口
│   ├── config/             # 配置（数据库、缓存）
│   ├── models/             # 数据模型
│   ├── schemas/            # 请求/响应模型
│   ├── crud/               # 数据库操作
│   ├── cache/              # 缓存操作
│   ├── routers/            # API 路由
│   ├── utils/              # 工具（认证、加密、异常处理）
│   ├── requirements.txt    # Python 依赖
│   └── .env.example        # 环境变量示例
│
└── xwzx-news/              # 前端（Vue 3）
    ├── src/
    │   ├── views/          # 页面组件
    │   ├── components/     # 公共组件
    │   ├── store/          # Pinia 状态管理
    │   ├── router/         # 路由配置
    │   ├── i18n/           # 国际化
    │   └── config/         # API 配置
    ├── package.json
    └── vite.config.js
```

## 快速开始

### 环境要求

- Python 3.9+
- Node.js 16+
- MySQL 8.0+
- Redis

### 后端启动

```bash
cd toutiao

# 安装依赖
pip install -r requirements.txt

# 复制环境变量配置并填写实际值
cp .env.example .env

# 启动服务
uvicorn main:app --reload
```

### 前端启动

```bash
cd xwzx-news

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 配置说明

1. 后端：复制 `toutiao/.env.example` 为 `toutiao/.env`，填写数据库和 Redis 连接信息
2. 前端：在 `xwzx-news/src/config/api.js` 中配置后端地址和 AI API Key

## API 接口

启动后端后访问 `http://127.0.0.1:8000/docs` 查看完整的 Swagger API 文档。
