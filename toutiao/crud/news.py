from datetime import datetime
from typing import Dict, Any, Literal

from fastapi.encoders import jsonable_encoder
from sqlalchemy import select, func, update,or_
from sqlalchemy.ext.asyncio import AsyncSession
from models.news import Category,News



async def get_categories(db:AsyncSession,skip:int=0,limit:int=100):
    stmt=select(Category).offset(skip).limit(limit)
    result=await db.execute(stmt)
    return result.scalars().all()

async def get_news_list(db:AsyncSession,category_id:int,skip:int=0,limit:int=10):
    stmt=select(News).where(News.category_id==category_id).offset(skip).limit(limit)
    result=await db.execute(stmt)
    return result.scalars().all()

async def get_news_count(db:AsyncSession,category_id:int):
    stmt=select(func.count(News.id)).where(News.category_id==category_id)
    result=await db.execute(stmt)
    return result.scalar_one()

async def get_news_detail(db:AsyncSession,news_id:int):
    stmt=select(News).where(News.id==news_id)
    result=await db.execute(stmt)
    return result.scalar_one_or_none()

async def increase_news_views(db:AsyncSession,news_id:int):
    stmt=update(News).where(News.id==news_id).values(views=News.views+1)
    result=await db.execute(stmt)
    await db.commit()
    return result.rowcount>0

async def get_related_news(db:AsyncSession,news_id:int,category_id:int,limit:int=5):
    stmt=select(News).where(
        News.category_id==category_id,
        News.id!=news_id
    ).order_by(
        News.views.desc(),
        News.publish_time.desc()
    ).limit(limit)
    result=await db.execute(stmt)
    related_news=result.scalars().all()
    return [{
        "id": news_detail.id,
        "title": news_detail.title,
        "content": news_detail.content,
        "image": news_detail.image,
        "author": news_detail.author,
        "publishTime": news_detail.publish_time,
        "categoryId": news_detail.category_id,
        "views": news_detail.views,
    }for news_detail in related_news]

def _news_keyword_filter(keyword: str):
    if not keyword or not keyword.strip():
        return None
    pattern = f"%{keyword.strip()}%"
    return or_(News.title.like(pattern), News.description.like(pattern))


async def count_news_query(db: AsyncSession, keyword: str = "") -> int:
    stmt = select(func.count(News.id))
    kw_filter = _news_keyword_filter(keyword)
    if kw_filter is not None:
        stmt = stmt.where(kw_filter)
    result = await db.execute(stmt)
    return int(result.scalar_one() or 0)


async def get_news_query(db:AsyncSession,keyword:str="",skip:int=0,limit:int=10):
    stmt=select(News)
    kw_filter = _news_keyword_filter(keyword)
    if kw_filter is not None:
        stmt = stmt.where(kw_filter)
    stmt=stmt.order_by(News.views.desc(),News.publish_time.desc()).offset(skip).limit(limit)
    result=await db.execute(stmt)
    return result.scalars().all()
async def get_category_map(db: AsyncSession) -> Dict[str, int]:
    stmt = select(Category)
    result = await db.execute(stmt)
    categories = result.scalars().all()
    return {item.name: item.id for item in categories}


async def upsert_news_item(db: AsyncSession,item: Dict[str, Any]) -> Literal["created", "updated", "skipped"]:
    stmt = select(News).where(
        News.title == item["title"],
        News.category_id == item["category_id"],
        News.publish_time == item["publish_time"],
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing is None:
        db.add(News(**item))
        await db.flush()
        return "created"

    has_updates = False
    update_fields = ("description", "content", "image", "author")
    for field in update_fields:
        old_value = getattr(existing, field)
        new_value = item.get(field)
        if new_value is not None and old_value != new_value:
            setattr(existing, field, new_value)
            has_updates = True

    publish_time = item.get("publish_time")
    if isinstance(publish_time, datetime) and existing.publish_time != publish_time:
        existing.publish_time = publish_time
        has_updates = True

    if not has_updates:
        return "skipped"

    await db.flush()
    return "updated"
