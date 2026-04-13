# 💸 Fynero — Smart Budgeting & Financial Dashboard

Fynero is a modern, full-stack personal finance application that helps users track spending, analyze financial habits, and connect real bank accounts for accurate, real-time data.

Built with scalability and real-world fintech architecture in mind, Fynero combines bank API integration, custom categorization logic, and dynamic data visualization into a clean and intuitive dashboard experience.

---

## 🚀 Features

### 🔗 Bank Account Integration (Plaid)
- Securely connect real bank accounts
- Sync transactions automatically
- Support for US and Canada

---

### 📊 Smart Transaction Categorization
- Custom category engine (food, bills, subscriptions, etc.)
- Nested categories (e.g. `expenses → bills → subscriptions`)
- Override system for better accuracy

---

### 📅 Time-Based Analytics

View data by:
- Day
- Month
- Year
- All-time

---

### 💰 Financial Aggregation Engine

Real-time totals for:
- Income
- Expenses
- Savings
- Debt

Dynamic queries:
```
data.expenses.bills.subscriptions
```

---

### 📈 Dashboard Ready

Designed for:
- Pie charts
- Spending breakdowns
- Budget tracking
- Net worth calculations

---

### 🔐 Authentication System
- Secure login/signup via **Supabase Auth**
- Password reset & email flow

---

## 🛠️ Tech Stack

### Frontend
- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**

### Backend
- **Next.js API Routes**
- Server-side logic for:
  - Plaid token exchange
  - Transaction syncing
  - Balance fetching

### Database & Auth
- **Supabase**
  - PostgreSQL database
  - Row Level Security (RLS)
  - User authentication

### APIs
- **Plaid API**
  - Transactions API (`/transactions/sync`)
  - Accounts API (`/accounts/balance/get`)
  - Link API (bank connection)

---

## 🧠 Example Usage

```tsx
const { get } = useFinance();

<p>{get("expenses.food", "month")}</p>
<p>{get("expenses.bills.subscriptions", "month")}</p>
<p>{get("income", "year")}</p>
```

---

## 💡 Summary

Fynero is designed to function as a scalable financial platform, providing users with powerful insights into their spending and financial habits while maintaining a clean, developer-friendly architecture.