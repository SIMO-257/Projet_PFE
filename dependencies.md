# Project Dependencies Guide

This document tracks the core technologies and libraries required for the **Projet PFE** (Digital Ticketing & Wallet System).

## 🛠 Tech Stack Overview
- **Frontend:** React 19 (Vite) + Ionic React + Redux Toolkit
- **State Management:** React Query (Server State) + Redux (UI/Auth State)
- **Animations:** Framer Motion
- **Backend:** Laravel 11+ REST API
- **Styling:** Tailwind CSS + Ionic UI Components

---

## 📦 Frontend Dependencies (React)

### 1. Existing Core
These are already installed in the project:
- `react` / `react-dom`: Core library.
- `axios`: API client.
- `react-router-dom`: Navigation.
- `@reduxjs/toolkit` & `react-redux`: Global state.
- `lucide-react`: Icon set.

### 2. Missing Dependencies (To be installed)
Run the following command in the `frontend/` directory:

```bash
npm install @ionic/react @ionic/react-router @tanstack/react-query framer-motion
```

#### Optional (Dev Tools)
```bash
npm install -D @tanstack/react-query-devtools
```

---

## 🐘 Backend Dependencies (Laravel)

The backend relies on Composer for PHP dependencies and NPM for Vite/Asset compilation.

### 1. PHP Dependencies
Run in the `backend/` directory:
```bash
composer install
```
*Core packages expected:*
- `laravel/framework`
- `laravel/sanctum` (for API Token Auth)
- `fruitcake/laravel-cors`

### 2. Node Dependencies (For Vite/Laravel)
Run in the `backend/` directory:
```bash
npm install
```

---

## 🚀 Setup Instructions

### Frontend Setup
1. `cd frontend`
2. `npm install` (Install existing)
3. `npm install @ionic/react @ionic/react-router @tanstack/react-query framer-motion` (Install new)

### Backend Setup
1. `cd backend`
2. `cp .env.example .env`
3. `php artisan key:generate`
4. `php artisan migrate --seed`
