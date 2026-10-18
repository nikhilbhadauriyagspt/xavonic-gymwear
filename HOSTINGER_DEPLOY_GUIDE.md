# 🚀 Hostinger Full-Stack Deployment Guide (Frontend + Backend + MySQL on `rage-x.com`)

Yeh project ab **Unified Full-Stack Mode** ke liye configure kar diya gaya hai — yaani ek hi Node.js server (`backend/server.js`) aapka **React/Vite Frontend (`dist/`)** aur **Express Backend API (`/api/*`)** dono `https://rage-x.com` par chala sakta hai, ya aap चाहें toh 2 Web Apps (Frontend + Backend) bhi chala sakte hain.

---

## ✅ Pre-Configured Database Credentials (in `backend/config/db.js`)
Linux/Hostinger server par run hote hi backend automatically in credentials se connect ho jayega:
- **DB_HOST:** `127.0.0.1` (localhost)
- **DB_NAME:** `u972191545_ragex_db`
- **DB_USER:** `u972191545_ragex_user`
- **DB_PASSWORD:** `dG~iLqh6#H`
- **DB_PORT:** `3306`

---

## 🛠️ Step 1: Code GitHub Par Push Karein
Apne laptop ke terminal mein yeh commands run karein taaki latest changes GitHub (`xavonic-gymwear` -> `main`) par chale jayein:
```bash
git add .
git commit -m "feat: configure RageX brand, clean DB, and Hostinger full-stack deployment"
git push origin main
```

---

## 🗄️ Step 2: Hostinger Database (`u972191545_ragex_db`) Setup
1. Hostinger hPanel mein **Databases → phpMyAdmin** par jayein.
2. Apne database **`u972191545_ragex_db`** ke samne **Enter phpMyAdmin** par click karein.
3. Top menu mein **Import** tab par click karein.
4. Project ke andar maujood file **`backend/database/hostinger_u972191545_ragex_db.sql`** select karein aur **Import / Go** dabayein.
   *(Note: Jab Node.js backend start hoga, toh `backend/config/db.js` khud bhi automatically saare tables create/verify kar dega!)*

---

## 🌐 Step 3: Hostinger Web App Settings (`rage-x.com`)

Aapke Hostinger Dashboard mein jahan **`rage-x.com`** dikh raha hai:

### Option A (Recommended): Ek Hi Web App Mein Frontend + Backend Dono Chalayein
Hostinger ne abhi aapke repo ko **Framework: Vite** (Static Frontend) detect kiya hai. Agar aap chahte hain ki Node.js Backend (`backend/server.js`) aur Vite Frontend dono ek saath `rage-x.com` par chalein:

1. Hostinger dashboard mein **`rage-x.com` → Build and output settings** (ya Web App settings) open karein:
   - **Framework Preset:** `Express` ya `Other / Node.js` select karein (agar `Vite` rehta hai toh Hostinger sirf static HTML serve karta hai aur `node backend/server.js` start nahi karta).
   - **Root directory:** `./`
   - **Build command:** `npm run build` *(Yeh command automatically `backend` ke packages install karegi aur Vite frontend `dist/` mein build karegi)*.
   - **Start command / Entry file:** `npm start` ya `backend/server.js`
   - **Node version:** `22.x`
2. **Environment Variables** section mein yeh add kar dein (Safety ke liye):
   ```env
   DB_HOST=127.0.0.1
   DB_USER=u972191545_ragex_user
   DB_PASSWORD=dG~iLqh6#H
   DB_NAME=u972191545_ragex_db
   DB_PORT=3306
   JWT_SECRET=ragex_super_secret_jwt_2026
   ```
3. **Essentials → Database → Connect a database** par click karke `u972191545_ragex_db` select karke **Connect** kar dein.
4. Upar **Redeploy** button par click karein!

---

### Option B: Agar Hostinger Par 2 Alag Web Apps Banana Chahein (Plan: 2/5 Web Apps)
Agar Hostinger `rage-x.com` ko static `Vite` mode mein hi rakhta hai, toh aap Backend ke liye doosra Web App (e.g., `api.rage-x.com`) bana sakte hain:
1. **Frontend Web App (`rage-x.com`):**
   - Root directory: `./`
   - Framework: `Vite`
   - Environment Variable add karein: `VITE_API_BASE_URL=https://api.rage-x.com`
2. **Backend Web App (`api.rage-x.com`):**
   - Subdomain `api.rage-x.com` banayein → **Add Web App** → GitHub repo `xavonic-gymwear` connect karein.
   - **Root directory:** `backend`
   - **Framework:** `Express`
   - **Start command:** `node server.js`
   - **Database Connect:** `u972191545_ragex_db` connect karein.

---

## 🔍 Step 4: Verify Kaise Karein
Deployment complete hone ke baad:
1. **Website Check:** `https://rage-x.com` open karein.
2. **Backend API Health Check:** `https://rage-x.com/api/health` open karein — agar `{ "status": "ok" }` aata hai toh Backend + MySQL 100% live hai!
3. **Admin Panel Login:** `https://rage-x.com/admin`
   - **Email:** `admin@xavonic.com`
   - **Password:** `Admin@1234` (agar SQL import kiya hai) ya `admin123` (agar auto-seed hua hai).
