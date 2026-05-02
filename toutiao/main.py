from fastapi import FastAPI
from routers import news,users,favorite,history,aichat
from fastapi.middleware.cors import CORSMiddleware

from utils.exception_handler import register_exception_handler

app=FastAPI()

register_exception_handler(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #允许的源，生产环境记得指定源
    allow_credentials=True, #允许携带的Cookie
    allow_methods=["*"], #允许的请求方式
    allow_headers=["*"], #允许的请求头
)

@app.get("/")
async def root():
    return {"message":"Hello World"}

# 挂载路由
app.include_router(news.router)
app.include_router(users.router)
app.include_router(favorite.router)
app.include_router(history.router)
app.include_router(aichat.router)