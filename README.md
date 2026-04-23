# OqyrmanWEB

Фронтенд цифровой библиотечной платформы Oqyrman. Соединяет читателей с библиотеками Казахстана.

## Стек

- **Vite 5** + **React 18** + **TypeScript**
- **Tailwind CSS 3** + **shadcn/ui** (Radix)
- **React Router 6**, **TanStack Query 5**, **Framer Motion**
- Читалка: **epub.js** + **react-pdf**
- Аутентификация: JWT (access + refresh) + Google OAuth

## Быстрый старт

```bash
bun install
cp .env.example .env   # или создай .env вручную (см. ниже)
bun run dev
```

## Переменные окружения

| Переменная | Описание |
|---|---|
| `VITE_API_BASE_URL` | Базовый URL бэкенда, например `https://api.oqyrman.app/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID |

## Сборка и деплой

```bash
bun run build    # создаёт dist/
bun run preview  # превью продакшен-сборки локально
```

Продакшен-деплой: push в `main` → SSH-пайплайн → `docker compose up --build frontend`.

## Структура

```
src/
  components/   # переиспользуемые компоненты (UI, reader, AI-виджет)
  contexts/     # AuthContext
  hooks/        # TanStack Query хуки, useNotifications
  lib/api/      # клиент API (auth, books, ai, reservations и др.)
  pages/        # страницы по роутам
```

## Связанный проект

Бэкенд (Go): [OqyrmanAPI](https://github.com/shadowpr1est/OqyrmanAPI)
