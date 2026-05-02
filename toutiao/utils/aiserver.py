import os
from typing import Dict, List, Optional, Sequence

import dotenv
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_core.tools import BaseTool
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from crud import news_cache
from models.news import Category, News
from schemas.aichat import ChatMessage

dotenv.load_dotenv()

SYSTEM_PROMPT = """
你是一个专业、中立、客观的新闻资讯智能助手。
你的任务是帮助用户获取新闻、解读事件、梳理资讯要点、查询热点与分类内容。
规则：
1. 只围绕新闻、时事、资讯类问题回答，不闲聊无关内容。
2. 回答简洁、准确、客观，不编造信息，不发表主观立场。
3. 遇到不清楚或不确定的内容，直接说明，不虚构。
4. 涉及多方面观点的事件，尽量中立呈现各方信息。
5. 必须优先使用工具获取站内真实新闻数据，不依赖自身记忆回答新闻类内容。
6. 工具返回结果后，用通顺自然的语言整理回答，不直接罗列原始数据。
7. 语气专业、正式、友好，适合资讯阅读场景。
""".strip()


def _get_llm() -> ChatOpenAI:
    api_key = os.getenv("OPENAI_API_KEY") or None
    base_url = os.getenv("OPENAI_BASE_URL") or None
    return ChatOpenAI(
        model="gpt-4o-mini",
        api_key=api_key,
        base_url=base_url,
    )


def _news_row_line(n: News) -> str:
    desc = (n.description or "")[:120]
    return f"- ID:{n.id} | {n.title} | 简介:{desc}"


def _format_detail(n: News) -> str:
    pt = n.publish_time.isoformat() if getattr(n, "publish_time", None) else ""
    body = n.content or ""
    if len(body) > 8000:
        body = body[:8000] + "\n…（正文已截断）"
    return (
        f"标题：{n.title}\n"
        f"作者：{n.author or '未知'}\n"
        f"发布时间：{pt}\n"
        f"阅读量：{n.views}\n\n"
        f"正文：\n{body}"
    )


async def _resolve_category_id(db: AsyncSession, category_name: str) -> Optional[int]:
    name = (category_name or "").strip()
    if not name:
        return None
    stmt = select(Category).where(Category.name == name)
    r = await db.execute(stmt)
    c = r.scalar_one_or_none()
    if c:
        return c.id
    stmt = select(Category).where(Category.name.contains(name)).limit(1)
    r = await db.execute(stmt)
    c = r.scalar_one_or_none()
    return c.id if c else None


def build_tools(db: AsyncSession) -> List[BaseTool]:
    @tool
    async def get_news_by_category(category_name: str, limit: int = 5) -> str:
        """按分类名称从站内数据库获取该分类下最新若干条新闻（含 ID、标题、简介）。"""
        cid = await _resolve_category_id(db, category_name)
        if cid is None:
            return f"未找到名为「{category_name}」的分类，请用户确认分类名称。"
        lim = max(1, min(int(limit), 20))
        rows = await news_cache.get_news_list(db, cid, 0, lim)
        if not rows:
            return f"分类「{category_name}」下暂无新闻。"
        lines = [_news_row_line(n) for n in rows]
        return "站内新闻列表：\n" + "\n".join(lines)

    @tool
    async def get_news_detail(news_id: int) -> str:
        """根据新闻 ID 从数据库读取标题、作者、发布时间、正文等完整信息。"""
        n = await news_cache.get_news_detail(db, news_id)
        if not n:
            return f"未找到 ID 为 {news_id} 的新闻。"
        return _format_detail(n)

    @tool
    async def summarize_news(news_content: str) -> str:
        """对给定新闻正文片段做客观摘抄式摘要，不编造事实；适合在拿到正文后提炼要点。"""
        text = (news_content or "").strip()
        if not text:
            return "内容为空，无法摘要。"
        if len(text) > 4000:
            text = text[:4000] + "…（已截断）"
        chunks = [p.strip() for p in text.replace("\r", "").split("\n\n") if p.strip()]
        head = " ".join(chunks[:3])[:900]
        return f"基于原文节选的客观摘抄：\n{head}"

    return [get_news_by_category, get_news_detail, summarize_news]


def _history_messages(history: Optional[Sequence[ChatMessage]]) -> List:
    out: List = []
    if not history:
        return out
    for m in history[-30:]:
        if m.role == "user":
            out.append(HumanMessage(content=m.content))
        elif m.role == "assistant":
            out.append(AIMessage(content=m.content))
    return out


def _tool_call_parts(tc) -> tuple:
    if isinstance(tc, dict):
        return tc.get("name") or "", tc.get("args") or {}, tc.get("id") or ""
    return getattr(tc, "name", "") or "", getattr(tc, "args", {}) or {}, getattr(tc, "id", "") or ""


async def chat(
    db: AsyncSession,
    message: str,
    history: Optional[List[ChatMessage]] = None,
) -> str:
    tools = build_tools(db)
    llm_with_tools = _get_llm().bind_tools(tools)
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        *_history_messages(history),
        HumanMessage(content=message),
    ]
    by_name: Dict[str, BaseTool] = {t.name: t for t in tools}

    for _ in range(8):
        ai_msg: AIMessage = await llm_with_tools.ainvoke(messages)
        messages.append(ai_msg)
        tool_calls = getattr(ai_msg, "tool_calls", None) or []
        if not tool_calls:
            return (ai_msg.content or "").strip() or "（无文本回复）"
        for tc in tool_calls:
            name, args, tid = _tool_call_parts(tc)
            tool_fn = by_name.get(name)
            if not tool_fn:
                messages.append(ToolMessage(content="未知工具", tool_call_id=tid))
                continue
            try:
                out = await tool_fn.ainvoke(args)
            except Exception as e:
                out = f"工具执行出错: {e}"
            messages.append(ToolMessage(content=str(out), tool_call_id=tid))

    return "对话轮次过多，请简化问题后重试。"
