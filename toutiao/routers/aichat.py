from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from config.db_conf import get_db
from models.users import User
from schemas.aichat import AiChatRequest
from utils.auth import get_current_user
from utils.response import success_response
from utils import aiserver

router = APIRouter(prefix="/api/ai", tags=["aichat"])


@router.post("/chat")
async def chat(req: AiChatRequest,user: User = Depends(get_current_user),db: AsyncSession = Depends(get_db),):
    reply = await aiserver.chat(db, req.message, req.history)
    return success_response(message="成功", data={"reply": reply})
