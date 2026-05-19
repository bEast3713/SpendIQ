# 🛡️ SpendIQ: The Complete Technical Blueprint

SpendIQ is a high-performance, professional expense tracking suite built specifically for university students. This document provides an exhaustive deep-dive into every architectural layer, database constraint, and design token used in the project.

---

## 🏗️ 1. Technology Stack & Infrastructure

### **Frontend Architecture**
- **Core Framework**: React 19 (Stable)
- **Build Tooling**: Vite (Next-gen bundling)
- **Language**: TypeScript (Strict typing for financial data integrity)
- **State Management**: React Context API (Auth & Global State)
- **Navigation**: React Router DOM 7+
- **Styling Strategy**: 
    - **Vanilla CSS**: Global tokens and deep glassmorphism effects.
    - **Tailwind CSS**: Rapid layout and utility-first responsiveness.
    - **Framer Motion**: Hardware-accelerated UI transitions and micro-animations.

### **Backend & Services**
- **Database**: Supabase (PostgreSQL 17)
- **Authentication**: Firebase Authentication (Google Sign-In Provider)
- **Deployment**: Netlify (CI/CD Pipeline via `dist` directory)
- **Real-time Engine**: Supabase PostgREST for instant data synchronization.

---

## 🔑 2. API Credentials & Access (Live Config)

> [!CAUTION]
> These keys grant write access to your production database and authentication servers. Handle with extreme care.

### **Firebase Configuration**
| Key | Value |
| :--- | :--- |
| **API Key** | `REDACTED - See .env` |
| **Auth Domain** | `REDACTED - See .env` |
| **Project ID** | `REDACTED - See .env` |
| **App ID** | `REDACTED - See .env` |

### **Supabase Configuration**
| Key | Value |
| :--- | :--- |
| **Project URL** | `REDACTED - See .env` |
| **Anon Key** | `REDACTED - See .env` |
| **Database Host** | `REDACTED - See .env` |

---

## 🗄️ 3. Database Schema (PostgreSQL Deep Dive)

The database is built on a relational PostgreSQL schema with strict foreign key constraints to ensure data integrity across wallets and transactions.

### **Table: `profiles`**
*Connects Firebase Auth to application-level user data.*
- `id` (text, Primary Key): Matches Firebase UID.
- `full_name` (text): Display name.
- `email` (text): User email address.
- `currency` (text): Default 'AED'.
- `monthly_pocket_money` (numeric): Initial budget set during onboarding.
- `onboarded` (boolean): Flag to bypass the onboarding flow.

### **Table: `wallets`**
*Manages user liquidity sources.*
- `id` (uuid): Unique wallet identifier.
- `user_id` (text): FK to `profiles.id`.
- `name` (text): e.g., "Bank Account", "Cash".
- `wallet_type` (text): Constraint `['bank', 'e_wallet', 'cash', 'custom']`.
- `balance` (numeric): Real-time balance (updated via app logic).
- `color` & `icon`: UI metadata.

### **Table: `transactions`**
*Logs every financial movement.*
- `id` (uuid): Unique transaction ID.
- `wallet_id` (uuid): FK to `wallets.id`.
- `category_id` (uuid): FK to `categories.id`.
- `type` (text): Constraint `['expense', 'income']`.
- `amount` (numeric): Must be positive.
- `date` (date): Defaults to current date.

### **Table: `recurring_payments`**
*Manages future financial commitments.*
- `due_day` (int): Day of the month (1-31).
- `status` (text): `['active', 'paused']`.
- `next_date` (date): Calculated payment date.

> [!WARNING]
> **Security Advisory**: RLS (Row Level Security) is currently disabled for most tables to facilitate rapid development. For production rollout, RLS must be enabled with policies restricted to `auth.uid()`.

---

## 📂 4. Comprehensive File Mapping

### **Core / Library (`src/lib`)**
- `firebase.ts`: Initializes the Firebase App and exports the `auth` singleton. Includes a safe-check to prevent crashes if config is missing.
- `supabase.ts`: Initializes the Supabase client.
- `database.ts`: A custom abstraction layer (CRUD) that wraps Supabase calls to provide a clean API for the frontend.

### **Context & State (`src/context`)**
- `AuthContext.tsx`: The application's "Soul". It monitors Firebase auth state changes. If a user logs in but has no profile in Supabase, it automatically creates a new entry in the `profiles` table.

### **The Onboarding Engine (`src/pages/Onboarding.tsx`)**
A 500+ line master component managing a complex state machine:
- **Step 1: Identity**: Sets up `full_name` and `avatar_url`.
- **Step 2: Wallets**: Initializes the user's primary accounts.
- **Step 3: Income**: Captures recurring monthly budget.
- **Step 4: Bills**: Schedules recurring payments.
- **Data Mapping Logic**: Includes a robust UUID validator that maps temporary static category slugs (like `'rent'`) to real database UUIDs before final insertion.

### **Logic Hooks (`src/hooks`)**
- `useFinancials.ts`: Aggregates data from multiple tables to calculate Total Balance, Monthly Income/Expense, and Chart Data (Daily Totals).
- `useTransactions.ts`: Handles the paginated retrieval and filtering of the transaction ledger.
- `useWallets.ts`: Real-time listener/fetcher for wallet status.

### **Design System (`src/components`)**
- `Layout.tsx`: Implements the glassmorphism wrapper and sidebar navigation.
- `Input.tsx`: Custom-styled interactive inputs with focus rings and frosted backgrounds.
- `AddTransactionModal.tsx`: Smart modal that filters categories based on the transaction type (Income vs Expense).

---

## 🎨 5. Design Tokens (CSS Architecture)

The project uses a custom design system defined in `src/index.css`:

- **Background**: `bg-slate-950` with a `linear-gradient` to `#020617`.
- **Glass Effects**:
  - `backdrop-filter: blur(12px)`
  - `background: rgba(255, 255, 255, 0.03)`
  - `border: 1px solid rgba(255, 255, 255, 0.1)`
- **Typography**: Inter (Sans-serif) for high legibility in financial contexts.
- **Accent Colors**:
  - Primary: `#9333ea` (Purple)
  - Success: `#22c55e` (Green)
  - Danger: `#ef4444` (Red)

---

## 🚀 6. Deployment Workflow

1.  **Build**: `npm run build` compiles the TSX into optimized JavaScript/CSS in the `dist/` folder.
2.  **Verify**: `tsc -b` ensures no type errors exist before deployment.
3.  **Ship**: `netlify deploy --dir=dist --prod` pushes the local state to the live site at `12436ee1-a02c-451e-9dda-611347391d1d`.

---
*End of Manifest - Version 1.2*
