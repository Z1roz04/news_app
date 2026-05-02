from typing import Any, Dict

from sqlalchemy.ext.asyncio import AsyncSession

from crud.news import get_category_map, upsert_news_item
from services.news_ingest.normalizer import normalize_news_item
from services.news_ingest.providers import ExampleNewsApiProvider


async def ingest_news_from_source(db: AsyncSession,source: str = "example_api",limit: int = 20,) -> Dict[str, Any]:
    stats = {
        "source": source,
        "fetched": 0,
        "normalized": 0,
        "created": 0,
        "updated": 0,
        "skipped": 0,
        "failed": 0,
    }
    if source not in ("example_api", "aliyun"):
        raise ValueError(f"暂不支持的数据源: {source}")

    provider = ExampleNewsApiProvider()
    raw_items = await provider.fetch(limit=limit)
    stats["fetched"] = len(raw_items)

    category_map = await get_category_map(db)
    if not category_map:
        raise ValueError("新闻分类为空，请先初始化 news_category 表")

    default_category_id = next(iter(category_map.values()))

    for raw in raw_items:
        normalized = normalize_news_item(
            item=raw,
            category_map=category_map,
            default_category_id=default_category_id,
        )
        if normalized is None:
            stats["failed"] += 1
            continue

        stats["normalized"] += 1

        try:
            action = await upsert_news_item(db, normalized)
            await db.commit()
        except Exception as exc:
            await db.rollback()
            stats["failed"] += 1
            print(f"[ingest] 入库失败: {exc}")
            continue

        stats[action] += 1

    return stats
