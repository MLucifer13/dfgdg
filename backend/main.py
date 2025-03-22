from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import models
import schemas
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React app's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Todo routes
@app.get("/todos", response_model=List[schemas.Todo])
def get_todos(db: Session = Depends(get_db)):
    return db.query(models.Todo).all()

@app.post("/todos", response_model=schemas.Todo)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    db_todo = models.Todo(**todo.model_dump())
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@app.get("/todos/{todo_id}", response_model=schemas.Todo)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@app.put("/todos/{todo_id}", response_model=schemas.Todo)
def update_todo(todo_id: int, todo_update: schemas.TodoUpdate, db: Session = Depends(get_db)):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    for field, value in todo_update.model_dump(exclude_unset=True).items():
        setattr(todo, field, value)
    
    db.commit()
    db.refresh(todo)
    return todo

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    db.delete(todo)
    db.commit()
    return {"message": "Todo deleted"}

# Planner routes
@app.get("/planner/events", response_model=List[schemas.PlannerEvent])
def get_events(start_date: datetime, end_date: datetime, db: Session = Depends(get_db)):
    return db.query(models.PlannerEvent).filter(
        models.PlannerEvent.start_time >= start_date,
        models.PlannerEvent.end_time <= end_date
    ).all()

@app.post("/planner/events", response_model=schemas.PlannerEvent)
def create_event(event: schemas.PlannerEventCreate, db: Session = Depends(get_db)):
    db_event = models.PlannerEvent(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.get("/planner/events/{event_id}", response_model=schemas.PlannerEvent)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.PlannerEvent).filter(models.PlannerEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@app.put("/planner/events/{event_id}", response_model=schemas.PlannerEvent)
def update_event(event_id: int, event_update: schemas.PlannerEventUpdate, db: Session = Depends(get_db)):
    event = db.query(models.PlannerEvent).filter(models.PlannerEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    for field, value in event_update.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    
    db.commit()
    db.refresh(event)
    return event

@app.delete("/planner/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.PlannerEvent).filter(models.PlannerEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(event)
    db.commit()
    return {"message": "Event deleted"}

# Pomodoro routes
@app.get("/pomodoro/sessions", response_model=List[schemas.PomodoroSession])
def get_sessions(db: Session = Depends(get_db)):
    return db.query(models.PomodoroSession).order_by(models.PomodoroSession.start_time.desc()).all()

@app.post("/pomodoro/sessions", response_model=schemas.PomodoroSession)
def create_session(session: schemas.PomodoroSessionCreate, db: Session = Depends(get_db)):
    db_session = models.PomodoroSession(**session.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@app.put("/pomodoro/sessions/{session_id}", response_model=schemas.PomodoroSession)
def update_session(session_id: int, session_update: schemas.PomodoroSessionUpdate, db: Session = Depends(get_db)):
    session = db.query(models.PomodoroSession).filter(models.PomodoroSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    for field, value in session_update.model_dump().items():
        setattr(session, field, value)
    
    db.commit()
    db.refresh(session)
    return session

@app.get("/pomodoro/stats")
def get_stats(start_date: datetime, end_date: datetime, db: Session = Depends(get_db)):
    sessions = db.query(models.PomodoroSession).filter(
        models.PomodoroSession.start_time >= start_date,
        models.PomodoroSession.start_time <= end_date,
        models.PomodoroSession.completed == True
    ).all()

    total_focus_time = sum(s.duration for s in sessions if s.type == "focus")
    total_break_time = sum(s.duration for s in sessions if s.type == "break")
    completed_sessions = len([s for s in sessions if s.type == "focus"])

    return {
        "total_focus_minutes": total_focus_time,
        "total_break_minutes": total_break_time,
        "completed_sessions": completed_sessions
    }

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)