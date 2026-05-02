import os
from dotenv import load_dotenv
from  sqlalchemy.ext.asyncio import  async_sessionmaker,AsyncSession,create_async_engine

load_dotenv()

DB_USER=os.getenv("DB_USER","root")
DB_PASSWORD=os.getenv("DB_PASSWORD","zh123456")
DB_HOST=os.getenv("DB_HOST","localhost")
DB_PORT=os.getenv("DB_PORT","3306")
DB_NAME=os.getenv("DB_NAME","news_app")
DB_ECHO=os.getenv("DB_ECHO","false").lower()=="true"
ASYNC_DATABASE_URL=f"mysql+aiomysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

async_engine=create_async_engine(
    url=ASYNC_DATABASE_URL,
    echo=DB_ECHO,
    pool_size=10,
    max_overflow=20
)

AsyncSessionLocal=async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


