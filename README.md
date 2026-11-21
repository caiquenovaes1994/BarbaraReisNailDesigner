<!-- markdownlint-disable MD033 MD041 -->

<div align="center">

🇺🇸 English | [🇧🇷 Português (PT-BR)](./README.pt-BR.md)

# 💅 Bárbara Reis — Nail Designer

> Internal management system for a nail design studio
>
> [Schedule](#️-schedule) · [Clients](#-clients) · [Procedures](#-procedures) · [Finance](#-finance) · [Reports](#-pdf-reports)

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat&logo=jsonwebtokens&logoColor=white)

---

## About the Project

**Full-stack** application custom-built for the **Bárbara Reis Nail Designer** studio. It centralizes appointment scheduling, client history, procedure catalog, and financial summaries in a modern glassmorphism interface, fully responsive and installable as a **PWA**.

> **Current version:** ![Version](https://img.shields.io/badge/version-v1.5.0-d946ef?style=flat&logo=semver&logoColor=white) - See the [Changelog](./CHANGELOG.md) for details.

</div>

---

## Features

### 🗓️ Schedule

- Multiple dynamic views: Day, Week, Month, and Continuous List with visual appointment volume indicators
- **Quick Click-to-Schedule**: Click directly on time slots to open a pre-filled form
- **Multiple Procedures**: Add multiple procedures to the same appointment with automatic price and duration summation (while preserving manual editing)
- Create, edit, and delete appointments
- **Integrated Address**: View the client's address on the appointment, quick inline editing with Google Places, and a "Save Address" button
- **GPS Navigation ("Go")**: Quick route access via Google Maps (desktop) or app selector (Uber, Waze, and Maps on mobile)
- Status updates via context menu: **Scheduled → Completed → Cancelled** (`Agendado → Atendido → Cancelado`)
- Week-to-week navigation with quick return to the current day
- Client search by name (with accent/diacritic support)
- **Custom Components**: Calendars (`CustomDatePicker`) and time pickers (`CustomTimePicker`) in the official lilac and diagonal black gradient design, supporting direct manual typing and overflow protection

### 👥 Clients

- Registration with international phone number (country code + mask), birth date, and address
- **Google Places Autocomplete**: Smart suggestions and automatic filling of street, number, neighborhood, city, and ZIP code restricted to Brazil
- Visual required-field indicators (red asterisk with tooltip)
- "Go" button for GPS navigation (Google Maps on desktop; Uber, Waze, and Maps on mobile)
- Search by name or phone with configurable pagination
- Complete appointment history per client
- Direct WhatsApp link from the registered phone number
- Soft delete with toggle to display inactive clients

### 🎂 Monthly Birthdays

- Report with dynamic filtering by month and year
- Automatic cross-referencing with the monthly schedule (clients served/scheduled vs. unscheduled)
- Quick WhatsApp send button with a personalized message (first name, line breaks, and emojis)
- Official tabular PDF export

### 💅 Procedures

- Registration with name, price, and duration (HH:mm)
- Search and pagination
- Automatic inactivation for procedures already used in appointments
- Toggle to show/hide inactive procedures

### 🏠 Dashboard

- Daily metrics for expected and served clients
- Personalized dynamic greeting
- Interactive date navigator to explore past or future days
- Integrated Scheduled and Completed Appointments tables
- Edit and update status without leaving the home screen

### 💰 Finance

- Period filter (date range)
- **Actual Revenue**: sum of appointments with `Atendido` (Completed) status
- **Scheduled Revenue**: sum of upcoming appointments with `Agendado` (Scheduled) status
- **Potential Revenue**: actual + scheduled
- Comparative bar chart (Recharts)

### 📄 PDF Reports

- Client-side generation via jsPDF (zero server load)
- Official **Space Mono** typography (Regular & Bold) across 100% of reports (Appointments, Statistics, and Birthdays)
- Statistics and revenue panel precisely anchored to the page footer
- Issue date and time structured in 2 lines aligned to the top right

### 🔔 Notifications (Follow-ups & Birthdays)

- **Appointment Follow-up**: Automatic alert when a client is ≤ 5 days from their expected return date, showing remaining days or overdue status
- **Birthdays**: Automatic notification 7 days in advance (early scheduling reminder) and priority highlight on the birthday itself with a celebratory badge
- **Quick Panel Actions**:
  - Direct WhatsApp greeting or invitation with a personalized message containing the client's first name
  - One-click scheduling with a pre-filled form
  - Option to individually dismiss notifications with local storage persistence

### 📱 PWA & User Experience

- Login screen with visual feedback animations (Lock/Unlock), motivational message carousel, and slideshow featuring real photos of the client's work
- Cache support and dynamic proxy offline mode for responsive access
- Glassmorphism layout with smooth animations
- Collapsible sidebar with UI transitions
- Styled toasts via `react-hot-toast` (replaces native popups)
- Installable as a mobile home screen app

---

## Architecture

```text
BarbaraReisNailDesigner/
├── backend/                    REST API — Node.js · Express · Prisma
│   ├── src/
│   │   ├── controllers/        Business logic per entity
│   │   ├── middleware/         JWT authentication via HTTP-Only Cookie
│   │   ├── scripts/            Encryption migration and security validation
│   │   ├── utils/              AES-256-CBC encryption for sensitive data
│   │   ├── routes.js           Centralized route definitions
│   │   └── index.js            Server entry point
│   └── prisma/
│       ├── schema.prisma       Data model (PostgreSQL)
│       └── migrations/         Migration history
│
└── frontend/                   SPA — React · Vite · Tailwind CSS
    └── src/
        ├── assets/             Logos, fonts, and slideshow photographs
        ├── components/         Header, Sidebar, Modals
        ├── pages/              Dashboard, Clients, Procedures, Schedule, Finance, Login, Changelog
        └── utils/              Axios (withCredentials), helpers
```

---

## Tech Stack

### Backend

| Technology | Usage |
| --- | --- |
| **Node.js** >= 18 | JavaScript Runtime |
| **Express** 5 | HTTP Framework |
| **Prisma** 7 | ORM and schema migrations |
| **PostgreSQL** | Relational database |
| **bcryptjs** | Password hashing |
| **jsonwebtoken** | JWT authentication |
| **cookie-parser** | HTTP-Only cookies |
| **helmet** | HTTP security headers |
| **express-rate-limit** | Brute-force protection |
| **node-cron** | Scheduled tasks |

### Frontend

| Technology | Usage |
| --- | --- |
| **React** 19 | UI Framework |
| **Vite** 8 | Build tool and dev server |
| **Tailwind CSS** 3 | Utility-first styling |
| **React Router** 7 | SPA routing |
| **Axios** | HTTP client with credentials |
| **Recharts** | Financial charts |
| **Lucide React** | Icon library |
| **jsPDF** | PDF report generation |
| **react-hot-toast** | Visual notifications (toasts) |
| **Google Places API** | Address autocomplete |

---

## Production Infrastructure

The application runs in a distributed cloud environment:

| Layer | Provider | Type |
| --- | --- | --- |
| **Database** | [Supabase](https://supabase.com/) | Managed PostgreSQL |
| **Backend (API)** | [Render](https://render.com/) | Web Service |
| **Frontend (SPA)** | [Render](https://render.com/) | Static Site |

---

## Security & Reliability

| Measure | Details |
| --- | --- |
| **Authentication** | JWT stored in an HTTP-Only Cookie (`sameSite: lax` in dev / `none` in prod, `secure: true`, 24h expiration) |
| **XSS Protection** | No tokens in `localStorage`/`sessionStorage`; cookies inaccessible via JavaScript |
| **Data Encryption** | AES-256-CBC with `scrypt`-derived key and configurable salt; phone and address encrypted at rest with fatal abort on failure |
| **Password Hashing** | bcrypt with default salt rounds (10); 128-character limit against DoS; documented seed utility |
| **Rate Limiting** | 20 requests / 15 min on `/api/login` and global limit of 300 requests / 15 min on `/api` |
| **Schema Validation** | Dedicated middleware (`validator.js`) to validate `:id` numeric parameters and input payloads |
| **CORS** | Strict whitelist for production domain and localhost; local IP bypass restricted to development environment |
| **CSP & HTTP Headers** | Content Security Policy and defensive headers configured via Helmet (backend) and meta tags (frontend) |
| **Centralized Error Handling** | Global JSON middleware catching 404/500 with strict stack trace omission in production |
| **Logging & Auditing** | Structured logger with ISO timestamps, automatic secret sanitization (`[REDACTED]`), console streaming, and local persistence (`backend/logs/`) with 5MB rotation |
| **Automated Backups** | Logical PostgreSQL backup via Prisma retaining the last 10 JSON snapshots with daily cron at 03:00 |
| **Database Optimization** | Strategic indexes created on `data_atendimento`, `status`, `ativo`, and `nome` in PostgreSQL; queries projected via explicit `select` |
| **Sourcemaps** | Explicitly disabled in production build (`sourcemap: false`) |
| **Sensitive Variables** | Isolated in `.env`, protected in `.gitignore` at every level of the repository |

---

## Data Model

```text
users        →  System authentication
customers    →  Studio clients
procedures   →  Services offered (name, price, duration)
appointments →  Appointments (client × procedure × date × status × value)
```

- **Naming Convention:** Tables mapped to `snake_case` via `@@map` (Prisma), ensuring full PostgreSQL compatibility.
- **Status:** `Agendado` (Scheduled) · `Atendido` (Completed) · `Cancelado` (Cancelled)
- **Soft Delete:** Clients and procedures with existing links are **inactivated** (`ativo = false`) instead of deleted, preserving referential integrity and history.

---

<div align="center">

## License

This project is **proprietary software**. © 2026 Caique Novaes — All rights reserved.  
See the [LICENSE](./LICENSE) file for full terms.

---

## Contact

[![GitHub](https://img.shields.io/badge/GitHub-caiquenovaes1994-181717?style=flat&logo=github&logoColor=white)](https://github.com/caiquenovaes1994)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-caiquenovaes-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/caiquenovaes/)
[![Telegram](https://img.shields.io/badge/Telegram-caiquenovaes1994-26A5E4?style=flat&logo=telegram&logoColor=white)](https://t.me/caiquenovaes1994)
[![Gmail](https://img.shields.io/badge/Gmail-caiquenovaes1994%40gmail.com-EA4335?style=flat&logo=gmail&logoColor=white)](mailto:caiquenovaes1994@gmail.com)

---

> *"Turning nail care artistry into a unique experience of beauty,<br> sophistication, and self-esteem."* ✨💅

</div>
