from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional

class UserRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50, description="用户名")
    password: str = Field(..., min_length=6, max_length=128, description="密码")

    @field_validator("username", "password", mode="before")
    @classmethod
    def strip_spaces(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v



class UserInfoBase(BaseModel):
    nickname:Optional[str]=Field(None,max_length=50,description="昵称")
    avatar: Optional[str] = Field(None, max_length=255, description="头像URL")
    gender: Optional[str] = Field(None, max_length=10, description="性别")
    bio: Optional[str] = Field(None, max_length=500, description="个人简洁")

class UserInfoResponse(UserInfoBase):
    id:int
    username:str
    model_config = ConfigDict(
        from_attributes=True,  # 允许从ORM对象属性中取值
    )


class UserAuthResponse(BaseModel):
    token:str
    user_info:UserInfoResponse=Field(...,alias="userInfo")

    model_config=ConfigDict(
        populate_by_name=True, #alias和字段名兼容
        from_attributes=True, #允许从ORM对象属性中取值
    )


class UserUpdateRequest(BaseModel):
    nickname:str=None
    avatar:str=None
    gender:str=None
    bio:str=None
    phone:str=None

class UserChangePasswordRequest(BaseModel):
    old_password: str = Field(..., alias="oldPassword", description="旧密码", min_length=1, max_length=128)
    new_password: str = Field(..., alias="newPassword", description="新密码", min_length=6, max_length=128)

    @field_validator("old_password", "new_password", mode="before")
    @classmethod
    def strip_passwords(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v