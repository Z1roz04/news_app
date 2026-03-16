from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from utils.response import success_response
from fastapi import APIRouter, Depends, Query, HTTPException
from models.users import User
from utils.auth import get_current_user
from config.db_conf import get_db
from schemas.history import HistoryAddRequest
from crud import history
from schemas.history import HistoryListResponse

router=APIRouter(prefix="/api/history",tags=["history"])

@router.post("/add")
async def add_history(data:HistoryAddRequest,user:User=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    result=await history.add_news_history(db,user.id,data.news_id)
    return success_response(message="添加成功",data=result)

@router.get("/list")
async def get_history_list(page:int=Query(1,ge=1),page_size:int=Query(10,ge=1,le=100,alias="pagesize"),user:User=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    rows,total=await history.get_history_list(db,user.id,page,page_size)
    history_list=[{**news.__dict__,"view_time":view_time,"history_id":history_id}for news,view_time,history_id in rows]
    has_more=total>page*page_size
    data = HistoryListResponse(list=history_list, total=total, hasMore=has_more)
    return success_response(message="获取浏览历史列表成功",data=data)

@router.delete("/delete/{news_id}")
async def remove_History(news_id:int,user:User=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    result=await history.remove_news_history(db,user.id,news_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="浏览记录不存在")
    return success_response(message="删除浏览记录成功")

@router.delete("/clear")
async def clear_History(user:User=Depends(get_current_user),db:AsyncSession=Depends(get_db)):
    result=await history.remove_all_history(db,user.id)
    return success_response(message=f"清除了{result}条浏览记录")
