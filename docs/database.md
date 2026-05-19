# 🗄️ SpendIQ Database Documentation

SpendIQ is powered by **PostgreSQL 17** hosted on Supabase. The schema is designed with strict relational integrity, utilizing foreign keys and automatic triggers for financial calculations.

## 1. Table Definitions

### **`profiles`**
Stores user metadata and global settings.
- **`id`** (`text`, PK): The unique ID from Firebase Auth.
- **`full_name`** (`text`): User's display name.
- **`email`** (`text`): Unique email address.
- **`avatar_url`** (`text`): URL to the selected avatar image.
- **`monthly_pocket_money`** (`numeric`): Total monthly allowance.
- **`currency`** (`text`): Default is `'AED'`.
- **`onboarded`** (`boolean`): Tracks if the user has completed the onboarding flow.

### **`wallets`**
Represents a source of funds (e.g., Bank, Cash).
- **`id`** (`uuid`, PK): Unique identifier.
- **`user_id`** (`text`, FK): Reference to `profiles.id`.
- **`name`** (`text`): Friendly name of the wallet.
- **`wallet_type`** (`text`): One of `bank`, `e_wallet`, `cash`, `custom`.
- **`balance`** (`numeric`): The current calculated balance.
- **`icon`** / **`color`** (`text`): UI customization fields.

### **`transactions`**
The ledger of all income and expenses.
- **`id`** (`uuid`, PK).
- **`user_id`** (`text`, FK).
- **`wallet_id`** (`uuid`, FK): The wallet affected by this transaction.
- **`category_id`** (`uuid`, FK): Link to the expense/income category.
- **`type`** (`text`): `income` or `expense`.
- **`amount`** (`numeric`): Value (must be > 0).
- **`date`** (`date`): When the transaction occurred.

### **`recurring_payments`**
Future financial commitments.
- **`due_day`** (`int`): Day of the month for the recurring bill.
- **`frequency`** (`text`): Default is `'monthly'`.
- **`status`** (`text`): `active` or `paused`.

---

## 2. SQL Triggers & Business Logic

Financial accuracy is enforced at the database level using PL/pgSQL functions.

### **New Transaction Logic**
When a transaction is inserted, the following logic runs:
```sql
CREATE FUNCTION handle_new_transaction() RETURNS trigger AS $$
BEGIN
  IF (new.type = 'income') THEN
    UPDATE wallets SET balance = balance + new.amount WHERE id = new.wallet_id;
  ELSE
    UPDATE wallets SET balance = balance - new.amount WHERE id = new.wallet_id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql;
```

### **Deleted Transaction Logic**
When a transaction is removed, the balance is automatically reversed:
```sql
CREATE FUNCTION handle_delete_transaction() RETURNS trigger AS $$
BEGIN
  IF (old.type = 'income') THEN
    UPDATE wallets SET balance = balance - old.amount WHERE id = old.wallet_id;
  ELSE
    UPDATE wallets SET balance = balance + old.amount WHERE id = old.wallet_id;
  END IF;
  RETURN old;
END;
$$ LANGUAGE plpgsql;
```

---

## 3. Security & Row Level Security (RLS)

> [!IMPORTANT]
> Currently, the database is in **Development Mode**. RLS is disabled for rapid testing.

**Before Production Release, the following SQL must be applied:**
```sql
-- Example RLS Policy for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only view their own profile" 
ON profiles FOR SELECT USING (auth.uid()::text = id);
```

---
[Return to Index](./README.md)
