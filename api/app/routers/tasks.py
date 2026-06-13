from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import get_current_user
from app.models import Task, User
from app.schemas import TaskCreate, TaskOut, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


async def _get_owned_task(task_id: UUID, owner: User, db: AsyncSession) -> Task:
    # Always filter by owner_id alongside the id. If somebody guesses another
    # user's task id we return 404, not 403 — the existence of the id stays
    # hidden.
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.owner_id == owner.id)
    )
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.get("", response_model=list[TaskOut])
async def list_tasks(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Task]:
    result = await db.execute(
        select(Task).where(Task.owner_id == user.id).order_by(Task.created_at.desc())
    )
    return list(result.scalars().all())


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Task:
    task = Task(owner_id=user.id, **payload.model_dump())
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(
    task_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Task:
    return await _get_owned_task(task_id, user, db)


@router.patch("/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: UUID,
    payload: TaskUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Task:
    task = await _get_owned_task(task_id, user, db)

    # Apply only the fields the client actually sent. exclude_unset keeps the
    # endpoint a true PATCH — sending {"status": "done"} doesn't wipe the
    # description.
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    task = await _get_owned_task(task_id, user, db)
    await db.delete(task)
    await db.commit()
