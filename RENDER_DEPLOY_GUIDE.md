# 🚀 Render Par Backend Host Karne Ka Complete Guide (100% Free)

Render par Node.js + Express backend deploy karne ke liye 2 simple steps follow karein:

---

## 🗄️ Step 1: Free Cloud MySQL Database Setup (1 Minute)

Render web servers stateless hote hain, isliye 24/7 active online database ke liye:

1. [Aiven.io](https://aiven.io/) ya [Railway.app](https://railway.app/) ya [Clever Cloud](https://www.clever-cloud.com/) par free account banayein.
2. **Create New Service** ➔ **MySQL** (Free Tier).
3. Service create hote hi aapko connection details milengi:
   * **Host:** `mysql-xxxx.aivencloud.com`
   * **Port:** `12345` (or `3306`)
   * **User:** `avnadmin` (or `root`)
   * **Password:** `your_password`
   * **Database:** `defaultdb` (or `guidelya_db`)
4. **Database restore karein:**
   * Apne laptop par terminal me:
   ```bash
   # Ek baar dump ko cloud database me run karein ya phpMyAdmin / DBeaver me guidelya_db.sql run karein
   ```

---

## ⚙️ Step 2: Render.com Par Backend Deploy Karein

1. [https://dashboard.render.com](https://dashboard.render.com) par login karein.
2. Click **New +** ➔ **Web Service**.
3. **Connect GitHub** karein aur apna repo **`nikhilbhadauriyagspt/xavonic-gymwear`** select karein.
4. Render Settings fill karein:
   * **Name:** `xavonic-backend`
   * **Root Directory:** `backend`  *(⚠️ Important)*
   * **Environment:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
   * **Instance Type:** `Free`

5. **Environment Variables** add karein:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | `xavonic_super_secret_key_2026` |
   | `DB_HOST` | *(Aapka Cloud MySQL Host)* |
   | `DB_PORT` | *(Aapka Cloud MySQL Port, jaise 3306 ya Aiven port)* |
   | `DB_USER` | *(Aapka Cloud MySQL User)* |
   | `DB_PASSWORD` | *(Aapka Cloud MySQL Password)* |
   | `DB_NAME` | *(Aapka Database Name)* |
   | `DB_SSL` | `true` |
   | `FRONTEND_URL` | `*` |

6. Click **Create Web Service**!
   * 1-2 minutes me aapka backend live ho jayega aur Render aapko public URL de dega (e.g. `https://xavonic-backend.onrender.com`).

---

## 🔗 Step 3: Netlify Frontend Me Backend URL Add Karein

Netlify Dashboard me:
* Site Settings ➔ **Environment variables** ➔ Add:
  * Key: `VITE_API_BASE_URL`
  * Value: `https://xavonic-backend.onrender.com` *(Aapka Render URL)*
* Netlify site ko **Trigger Deploy** karein.

Aapka Frontend + Backend dono globally live ho jayenge!
