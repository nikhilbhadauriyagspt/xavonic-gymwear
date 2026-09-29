# React + Vite + Tailwind CSS Starter Project

A production-ready React starter boilerplate configured with **Vite**, **Tailwind CSS**, **React Router**, **Lucide Icons**, and **Sonner / Framer Motion Popups & Notifications**.

## 🚀 Features Included

- ⚡ **Vite** - Lightning fast dev server & build tool
- 🎨 **Tailwind CSS** - Modern utility-first styling with dark theme support
- 🧭 **React Router** (`react-router-dom`) - Client-side page routing
- ✨ **Lucide Icons** (`lucide-react`) - 1000+ clean SVG icons
- 💬 **Sonner** - Smooth, responsive toast notifications
- 🪟 **Animated Modal/Popup** (`framer-motion`) - Smooth dialog popup with ESC and backdrop support
- 🛠️ **Utility Helpers** (`clsx`, `tailwind-merge`) - Seamless conditional class merging

---

## 📂 Project Structure

```text
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       # Responsive navigation bar
│   │   ├── Modal.jsx        # Animated popup dialog modal
│   │   └── Footer.jsx       # Footer component
│   ├── pages/
│   │   ├── Home.jsx         # Home page (with modal & toast triggers)
│   │   ├── Features.jsx     # Features showcase page
│   │   ├── About.jsx        # About project page
│   │   └── NotFound.jsx     # 404 handler page
│   ├── lib/
│   │   └── utils.js         # cn() helper function
│   ├── App.jsx              # Routes & Layout configuration
│   ├── index.css            # Tailwind CSS entrypoint
│   └── main.jsx             # React DOM root entrypoint
├── index.html
├── vite.config.js
└── package.json
```

---

## 🛠️ How to Run

### 1. Start Development Server
```bash
npm run dev
```

### 2. Build for Production
```bash
npm run build
```

### 3. Preview Production Build
```bash
npm run preview
```
