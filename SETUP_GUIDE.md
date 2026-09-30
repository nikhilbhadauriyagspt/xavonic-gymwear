# 🚀 Guidelya / Xavonic Activewear - Multi-Device & Deployment Guide

This guide explains how to pull and run the complete project on any laptop/computer, restore the database with one click, and connect it with GitHub and Netlify.

---

## 💻 1. Ghar Ke Laptop Me Setup Karne Ka Tarika (Step-by-Step)

### Step 1: Clone or Pull the Repository
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd guidelya.com
```

### Step 2: Install Dependencies
```bash
# Root / Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### Step 3: MySQL & Database Setup (1-Step Automatic)
1. **XAMPP / phpMyAdmin** start karein (Apache & MySQL start karein).
2. Root folder me command run karein:
```bash
npm run db:setup
```
*(Yeh script automatically `guidelya_db` database create karega aur saare 14+ real photoshoot products, categories hierarchy, admins, settings restore kar dega!)*

### Step 4: Start Frontend & Backend
Open 2 terminals:

**Terminal 1 (Backend Server):**
```bash
npm run server
# Server running at http://localhost:5000
```

**Terminal 2 (Frontend Vite Dev):**
```bash
npm run dev
# Frontend running at http://localhost:5173
```

---

## 🔄 2. Ghar/Office Me Kaam Karke GitHub Par Push & Pull Karna

### Jab aap kaam complete karein (Push to GitHub):
```bash
# 1. (Optional) Database dump update karein agar naya product/category add kiya ho
npm run db:export

# 2. Git commit aur push
git add .
git commit -m "Updated features and database dump"
git push origin main
```

### Dusre laptop me latest changes lena (Pull from GitHub):
```bash
git pull origin main

# Agar database me new products/categories add huye the:
npm run db:setup
```

---

## 🌐 3. Netlify Par Frontend Host Kaise Hoga?

Is repository me `netlify.toml` already configure kar diya gaya hai.

1. **Netlify Dashboard** ([https://app.netlify.com](https://app.netlify.com)) par login karein.
2. **Add new site** -> **Import an existing project** -> **GitHub** select karein.
3. Apna repository (`guidelya.com`) select karein.
4. Netlify automatically settings detect karega:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. **Deploy Site** par click karein!

**Continuous Deployment (CI/CD):**
Jab bhi aap GitHub par `git push origin main` karenge, Netlify automatically latest code build karke website live update kar dega!
