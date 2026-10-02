# 🏠 Home Laptop Quick Setup Guide (Guidelya / Xavonic)

Is guide ko follow karke aap ghar ke laptop par 2 minute me poori website (Frontend + Backend + Database with all Products) chala sakte hain.

---

## ⚡ Step-by-Step Setup:

### 1️⃣ Repo Pull Karein
Ghar ke laptop par terminal me project folder me jaayein aur latest code pull karein:
```bash
git pull origin main
```

---

### 2️⃣ Dependencies Install Karein (First Time Only)
```bash
npm install
```

---

### 3️⃣ MySQL Start Karein
- **XAMPP / WAMP** open karein aur **MySQL** start kar lein.

---

### 4️⃣ Database & All Products Import (1 Click)
Yeh command run karte hi saare products, categories, banners, settings aur admin account import ho jayenge:
```bash
npm run db:import
```
> *(Jab office me naya data add karein aur ghar le jana ho toh office me `npm run db:export` karke push kar dein).*

---

### 5️⃣ Project Start Karein

**Terminal 1 (Backend Server):**
```bash
npm run server
```
*Backend URL:* `http://localhost:5000`

**Terminal 2 (Frontend React App):**
```bash
npm run dev
```
*Frontend URL:* `http://localhost:5173`
*Admin URL:* `http://localhost:5173/admin`

---

## 🔑 Default Admin Login Credentials:
- **Email:** `admin@xavonic.com`
- **Password:** `Admin@1234`
