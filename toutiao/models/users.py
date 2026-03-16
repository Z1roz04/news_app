from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, func, Integer, String, Index, Text, ForeignKey, Enum
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
   pass




class User(Base):
    __tablename__ = "user"
    __table_args__ = (
        Index('username_UNIQUE', 'username'),
        Index('phone_UNIQUE', 'phone')
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, comment="用户ID")
    username: Mapped[str] = mapped_column(String(50), nullable=False, comment="用户名")
    password: Mapped[str] = mapped_column(String(255), comment="密码(加密存储)")
    nickname: Mapped[Optional[str]] = mapped_column(String(50), comment="昵称")
    avatar: Mapped[Optional[str]] = mapped_column(String(255), comment="头像URL")
    gender: Mapped[Optional[str]] = mapped_column(Enum('male','female','unknown'), comment="性别",default='male')
    bio: Mapped[Optional[str]] = mapped_column(String(500), comment="个人简介",default="无")
    phone: Mapped[Optional[str]] = mapped_column(String(20), unique=True, comment="手机号")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, comment="创建时间")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now,onupdate=datetime.now, comment="更新时间")

class UserToken(Base):
    __tablename__ = "user_token"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True,comment="令牌ID")
    user_id: Mapped[str] = mapped_column(Integer, ForeignKey(User.id), nullable=False, comment="用户ID")
    token:Mapped[str]=mapped_column(String(255),unique=True,nullable=False,comment="令牌值")
    expires_at: Mapped[datetime] = mapped_column(DateTime,nullable=False,comment="过期时间")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.now,comment="创建时间")

    def __repr__(self):
        return f"<UserToken(id={self.id},user_id={self.user_id},token={self.token})>"