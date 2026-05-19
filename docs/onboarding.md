# 🚀 SpendIQ Onboarding & Data Integrity

The Onboarding process is the most complex logic block in SpendIQ. It handles user initialization, data sanitization, and UUID resolution.

## 1. Step-by-Step Flow

SpendIQ uses a controlled 4-step state machine implemented in `Onboarding.tsx`.

1.  **Identity (Step 1)**: User selects an avatar and confirms their display name.
    - *Logic*: Pre-fills from Firebase Google Profile if available.
2.  **Wallets (Step 2)**: Initial account setup.
    - *Logic*: Defaults to "Bank Account" and "Cash" to reduce friction.
3.  **Pocket Money (Step 3)**: Defines the primary monthly income source.
    - *Logic*: Creates a recurring income record in the database.
4.  **Commitments (Step 4)**: Schedules recurring bills (Rent, Subs).
    - *Logic*: Filters categories to show only expense-related options.

---

## 2. The UUID Safety System

One of the major technical hurdles was mapping "Human-readable slugs" (like `'rent'`) used in the UI to "Database UUIDs" (like `'89139031-64d1...'`) required by the Postgres schema.

### **The Sanitization Logic**
During the final `handleComplete` call, the app runs a multi-stage validation:
1.  **Format Check**: Uses a regex to check if the `category_id` is already a valid UUID.
2.  **Database Lookup**: If it's a slug (e.g., `'rent'`), it attempts to find the matching category name in the `categories` table.
3.  **Static Fallback**: If the DB lookup fails (e.g., network latency or missing data), it uses a pre-defined static UUID mapping from `src/data/categories.ts`.
4.  **Emergency Null**: If all else fails, it sets the ID to `null` instead of sending a string that would cause a database crash.

### **Code Implementation**
```tsx
const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}...$/.test(str);

let realCategoryId = p.category_id;
if (!isUUID(realCategoryId)) {
  const dbCat = categories.find(c => c.name === p.name);
  realCategoryId = dbCat?.id || staticMapping[p.category_id] || null;
}
```

---

## 3. Post-Onboarding Transition

Once the user clicks "Finish Setup":
1.  **Bulk Insertion**: The app performs a batched insert into `wallets`, `recurring_payments`, and `profiles` (updating the `onboarded` flag).
2.  **Confetti Trigger**: `canvas-confetti` is triggered on success.
3.  **Navigation**: The user is redirected to `/dashboard`, which triggers a fresh data pull from `useFinancials`.

---
[Return to Index](./README.md)
