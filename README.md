<div align="center">
  <img src="./marketing_assets/desktop_landing.png" alt="SpendIQ Dashboard" width="800" />

  # 💸 SpendIQ
  **The Ultimate Financial Companion for College Students**

  [![Deploy Status](https://img.shields.io/badge/Deployed_on-Netlify-00C7B7?style=for-the-badge&logo=netlify)](https://spend-iq.netlify.app)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Firebase](https://img.shields.io/badge/firebase-a08021?style=for-the-badge&logo=firebase&logoColor=ffcd34)](https://firebase.google.com/)

  [**View Live Demo**](https://spend-iq.netlify.app) • [**Report Bug**](#) • [**Request Feature**](#)
</div>

---

## 🚀 Overview

**SpendIQ** is a premium, high-performance personal finance tracker engineered specifically for the modern college student. Built with a sleek, futuristic **"Deep Midnight" glassmorphism aesthetic**, it moves beyond basic spreadsheets to offer a highly immersive, automated financial ecosystem.

Whether you're tracking tuition payments, managing a tight grocery budget, or splitting pizza on the weekend, SpendIQ gives you crystal-clear visibility into your cash flow with real-time analytics and automated wallet management.

---

## ✨ Key Features

- 🔮 **Stunning Glassmorphism UI:** An immersive dark theme featuring frosted glass containers, dynamic gradients, and smooth micro-animations.
- 🏦 **Unified Smart Wallets:** Track multiple payment methods independently (Bank Accounts, Credit Cards, Cash, Digital Wallets like PayPal/Venmo).
- 🔄 **Automated Ledger:** Powered by advanced PostgreSQL database triggers, every transaction automatically recalculates your wallet balances instantly—zero desyncs, zero manual math.
- 📊 **Real-time Analytics:** Beautiful, interactive charts powered by Recharts that visualize your cash flow and categorize your spending habits (Tuition, Groceries, Social, etc.).
- 📅 **Recurring Payments:** Schedule and track subscriptions and upcoming bills (Netflix, Spotify, Rent) so you never miss a payment.
- 🔐 **Enterprise-Grade Security:** Firebase Authentication ensures your data is locked down, supporting both seamless Google OAuth and encrypted Email/Password logins.

---

## 🏗️ Architecture & Tech Stack

SpendIQ is built on a modern, robust, and highly scalable stack:

### Frontend
* **Core:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS, Custom Glassmorphism Token System
* **Icons & Data Viz:** Lucide React, Recharts
* **State Management:** React Context API

### Backend & Infrastructure
* **Database & API:** Supabase (PostgreSQL) with Row-Level Security and active DB Triggers
* **Authentication:** Firebase Auth
* **Hosting/CD:** Netlify (Continuous Deployment)

---

## 📸 Interface Showcase

<div align="center">
  <img src="./marketing_assets/desktop_login.png" alt="Login Screen" width="400" />
  <img src="./marketing_assets/mobile_landing.png" alt="Mobile Dashboard" width="400" />
</div>

---

## 🛠️ Setup & Installation

To run SpendIQ locally, follow these steps to hook up your own backend environments:

### 1. Clone the Repository
```bash
git clone https://github.com/bEast3713/SpendIQ.git
cd SpendIQ
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and securely add your backend credentials:
```env
# Firebase Authentication Keys
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Supabase Database Keys
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Initialize Database
Ensure your Supabase project is active. SpendIQ relies on several SQL tables (`profiles`, `wallets`, `transactions`, `recurring_payments`) and crucially requires the `handle_new_transaction` SQL Trigger to be active for automated balance deductions.

### 4. Run the Development Server
```bash
npm run dev
```
Visit `http://localhost:5173` in your browser.

---

## 👨‍💻 Developer

**Built by [bEast3713](https://github.com/bEast3713)** over a rigorous 3-month development cycle.
Designed to push the boundaries of student-focused financial software.

<div align="center">
  <sub>Built with ❤️ and a lot of coffee.</sub>
</div>
