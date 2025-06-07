from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    picture: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserInDB(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Database table definitions
USERS_TABLE = """
create table if not exists public.users (
    id uuid default gen_random_uuid() primary key,
    email text unique not null,
    name text,
    picture text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
"""

# RLS Policies
ENABLE_RLS = """
alter table public.users enable row level security;
"""

ALLOW_ALL_OPERATIONS = """
create policy "Allow all operations" on public.users
for all using (true);
"""