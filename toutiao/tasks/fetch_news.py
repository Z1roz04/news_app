import argparse
import asyncio
import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from config.db_conf import AsyncSessionLocal, async_engine
from services.news_ingest.service import ingest_news_from_source


async def _run(source: str, limit: int) -> None:
    try:
        async with AsyncSessionLocal() as db:
            stats = await ingest_news_from_source(db=db, source=source, limit=limit)
            print("[ingest] 采集完成:", stats)
    finally:
        # 避免脚本退出时连接对象析构触发 Event loop is closed
        await async_engine.dispose()


def main() -> None:
    parser = argparse.ArgumentParser(description="新闻采集任务")
    parser.add_argument(
        "--source",
        type=str,
        default="example_api",
        help="采集源标识，默认 example_api",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=20,
        help="单次最大抓取条数，默认 20",
    )
    args = parser.parse_args()

    asyncio.run(_run(source=args.source, limit=args.limit))


if __name__ == "__main__":
    main()
