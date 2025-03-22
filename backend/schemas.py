from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models import TaskStatus

class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    due_date: Optional[datetime] = None

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None

class Todo(TodoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PlannerEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    color: Optional[str] = None

class PlannerEventCreate(PlannerEventBase):
    pass

class PlannerEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    color: Optional[str] = None

class PlannerEvent(PlannerEventBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PomodoroSessionBase(BaseModel):
    duration: int
    type: str

class PomodoroSessionCreate(PomodoroSessionBase):
    pass

class PomodoroSessionUpdate(BaseModel):
    end_time: datetime
    completed: bool

class PomodoroSession(PomodoroSessionBase):
    id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    completed: bool

    class Config:
        from_attributes = True
