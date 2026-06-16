# minitask

Доска задач с регистрацией по email/паролю и аккуратным интерфейсом в стиле
Asana. Перетаскивайте задачи между колонками, добавляйте их прямо в колонке,
группируйте по проектам и переключайтесь между видами «Доска / Сегодня /
Календарь / Архив». Сессия живёт в httpOnly-cookie, поэтому вход — разовое
действие.

```
              ┌─────────────────────────────┐
              │            web              │
              │   React + Vite + Tailwind   │
              │     отдаётся nginx (5173)   │
              └─────────────┬───────────────┘
                            │ httpOnly cookie
                            ▼
              ┌─────────────────────────────┐
              │            api              │
              │   FastAPI + SQLAlchemy 2    │
              │       async (8000)          │
              └─────────────┬───────────────┘
                            │ asyncpg
                            ▼
              ┌─────────────────────────────┐
              │         postgres 16         │
              └─────────────────────────────┘
```

## Запуск (одной командой)

Нужен Docker. Из корня проекта:

```bash
cp .env.example .env
docker compose up --build
```

Или скрипт-обёртка — он сам скопирует `.env` и поднимет весь стек:

```bash
./run.sh        # macOS / Linux / Git Bash
./run.ps1       # Windows PowerShell
```

Затем открыть:

- **веб** → <http://localhost:5173>
- **api** → <http://localhost:8000> (Swagger на `/docs`)
- postgres проброшен на `5433`, чтобы не конфликтовать с локальным Postgres.

Миграции (`alembic upgrade head`) применяются автоматически при старте контейнера
api, поэтому схема готова раньше, чем веб обратится к api.

### Подтверждение аккаунта в локальной разработке

Регистрация отправляет письмо с подтверждением. В локальной разработке **SMTP не
настроен**, поэтому вместо отправки api **пишет ссылку подтверждения в свой лог**.
Возьмите её оттуда:

```bash
docker compose logs api | grep -i verify
```

Откройте эту ссылку в браузере (она ведёт на `http://localhost:5173/verify?...`),
подтвердите аккаунт и войдите. Чтобы слать настоящие письма, заполните значения
`SMTP_*` в `.env` (подойдёт бесплатный пароль приложения Gmail).

## Возможности

| Область | Что есть |
|---------|----------|
| Аутентификация | Регистрация, вход, выход, подтверждение email, сброс пароля — всё через httpOnly-cookie |
| Доска | Три колонки (todo / in progress / done) с перетаскиванием задач между ними |
| Задачи | Название, описание, приоритет, дедлайн, статус; быстрое добавление в колонке или полная форма |
| Виды | Доска, Сегодня (просрочено + на сегодня), Календарь (сетка месяца), Архив (завершённые) |
| Проекты | Лёгкая группировка-фильтр (Личное / Работа / Учёба), назначается в форме задачи |
| Адаптивность | На мобильном сайдбар сворачивается в выезжающую панель; диалог подстраивается под экран |

## Локальная разработка (без Docker)

```bash
# api
cd api
python -m venv .venv && source .venv/bin/activate   # .venv/Scripts/Activate.ps1 на Windows
pip install -r requirements-dev.txt
export DATABASE_URL=postgresql+asyncpg://minitask:minitask@localhost:5432/minitask
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# веб (в отдельном терминале)
cd web
npm install
npm run dev
```

Vite напечатает локальный адрес, который выбрал, — откройте его в браузере.

## Архитектура

Два сервиса с тонким контрактом между ними.

- **api** — FastAPI, разбит на `routers/` (форма HTTP), `schemas/` (pydantic
  запрос/ответ), `models.py` (ORM SQLAlchemy), `security.py` (bcrypt + JWT),
  `deps.py` (зависимость аутентификации). Настройки типизированы через
  `pydantic-settings` и читаются из окружения при старте. Асинхронная сессия
  SQLAlchemy выдаётся на каждый запрос через `get_db`.
- **web** — Vite + React 18 (JSX, без TypeScript). Небольшой zustand-стор
  закрывает приложение за аутентификацией и проверяет cookie при монтировании;
  серверное состояние живёт в хуке `useTasks` поверх тонкого fetch-клиента.
  Проекты — клиентский слой группировки в `localStorage`, сама модель задачи
  остаётся минимальной. Анимации — на `motion/react`.

## Модель безопасности

- **Пароли** — bcrypt через passlib, cost 12. Схема требует 8–72 символа (72 —
  жёсткий байтовый лимит bcrypt).
- **Сессия** — JWT в `httpOnly`-cookie с `SameSite=Lax`. Веб-бандл никогда не
  касается токена — это убирает целый класс утечек через XSS. В продакшене cookie
  переключается на `Secure` через env.
- **Паритет ошибок входа** — неверный пароль и неизвестный email дают одинаковый
  401 с одинаковым телом, так что аккаунты нельзя перебрать.
- **Конфликт регистрации** — повторный email возвращает 409 с общим сообщением.
- **Подтверждение email** — аккаунт заблокирован, пока не подтверждена ссылка;
  вход в неподтверждённый аккаунт возвращает 403.
- **Авторизация** — каждый эндпоинт `/tasks` определяет пользователя из cookie и
  фильтрует по `owner_id`. Запрос чужой задачи возвращает 404, а не 403 — чтобы по
  ответу нельзя было выяснить, какие id существуют.
- **Лимиты** — slowapi ограничивает `/auth/register` до 5/мин и `/auth/login` до
  10/мин на адрес.
- **Валидация входа** — pydantic v2 с `EmailStr`, ограничения длины на каждую
  строку, enum для статуса и приоритета; некорректные данные — это 422 ещё до
  обработчика.
- **SQL-инъекции** — всё параметризовано через SQLAlchemy, сырого SQL в коде нет.
- **CORS** — ограничен списком origin'ов с включёнными credentials; явные методы и
  заголовки, без wildcard.
- **Заголовки безопасности** — `X-Content-Type-Options: nosniff`, `X-Frame-Options:
  DENY`, `Referrer-Policy: strict-origin-when-cross-origin` и на уровне middleware
  API, и на nginx.

## Тесты

```bash
cd api
TEST_DATABASE_URL=postgresql+asyncpg://minitask:minitask@localhost:5433/minitask_test \
  pytest -q
```

Покрыто: поток register/login/me/logout, одинаковый 401 для неизвестного email и
неверного пароля, частичный PATCH (смена статуса сохраняет описание),
cross-user 404 на чужой id задачи.

## Структура проекта

```
.
├── api/
│   ├── alembic/                миграции
│   ├── app/
│   │   ├── routers/            auth.py, tasks.py
│   │   ├── schemas/            pydantic запрос/ответ
│   │   ├── config.py           типизированные настройки из env
│   │   ├── db.py               async-движок + сессия
│   │   ├── deps.py             get_current_user
│   │   ├── email.py            письма подтверждения / сброса (SMTP + dev-консоль)
│   │   ├── limiter.py          инстанс slowapi
│   │   ├── main.py             фабрика приложения, CORS, заголовки
│   │   ├── models.py           User, Task
│   │   └── security.py         bcrypt + JWT
│   ├── tests/                  pytest + httpx async client
│   ├── Dockerfile
│   └── requirements*.txt
├── web/
│   ├── src/
│   │   ├── api/client.js       fetch-обёртка с credentials
│   │   ├── components/
│   │   │   ├── board/          StatusColumn, TaskCard, TaskRow, TaskDialog
│   │   │   ├── views/          TodayView, CalendarView, ArchiveView
│   │   │   ├── layout/         Sidebar, TopBar
│   │   │   └── ui/             Button, Input, Avatar, …
│   │   ├── hooks/              useTasks, useDismiss
│   │   ├── lib/                format.js, projects.js
│   │   ├── stores/auth.js      состояние аутентификации (zustand)
│   │   └── views/              AuthView, BoardView
│   ├── Dockerfile              multi-stage сборка → nginx
│   └── nginx.conf
├── .env.example
├── docker-compose.yml
├── run.sh
└── run.ps1
```

## Заметки для продакшена

- Разделить одну 30-дневную cookie на короткий access-токен и refresh-токен.
- Вынести лимиты и кэш в Redis для нескольких реплик.
- Задать `PUBLIC_WEB_URL` на реальный домен, чтобы ссылки в письмах открывались вне
  локальной машины, и настроить реальный SMTP.
