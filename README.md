# 💰 Wealth Growth

### AI-Powered Personal Financial Intelligence Platform

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Green?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-In%20Development-orange)

---

## 📖 About

**Wealth Growth** is a modern full-stack personal finance management platform that helps users manage every aspect of their finances from one centralized dashboard.

Unlike traditional expense trackers, Wealth Growth provides **AI-powered financial intelligence**, helping users understand their financial health instead of simply recording transactions.

The platform combines budgeting, net worth tracking, financial goals, investment portfolio management, analytics, and personalized AI recommendations into one seamless experience.

---

# ✨ Features

## 🔐 User Authentication

- User Registration
- Secure Login
- Profile Management
- Protected Routes

---

## 🏠 Smart Financial Dashboard

- 📊 Net Worth Overview
- ❤️ Financial Health Score
- 💰 Financial Summary
- 📈 Recent Activities
- 🔔 Smart Notifications
- ⚡ Quick Financial Snapshot

---

## 💵 Budget Management

- Record Income
- Record Expenses
- Category Management
- Monthly Budget Planning
- Budget Monitoring
- Remaining Budget Calculation

---

## 💰 Net Worth Management

- Assets Management
- Liabilities Management
- Automatic Net Worth Calculation
- Financial Summary

---

## 🎯 Financial Goals

- Create Financial Goals
- Track Goal Progress
- Contribution Management
- Goal Completion Tracking

---

## 📈 Investment Portfolio

Supported Investments

- 📊 Stocks
- 📈 Mutual Funds
- 🪙 Gold
- 🏦 Fixed Deposits (FD)

Features

- Portfolio Performance
- Profit/Loss Tracking
- Investment Summary

---

## 📊 Analytics & Reports

- Expense Analysis
- Savings Analysis
- Net Worth Growth
- Monthly Reports
- Interactive Charts
- PDF Report Generation

---

## 🔔 Smart Notifications

- Budget Limit Alerts
- Budget Exceeded Alerts
- Bill Payment Reminders
- Goal Progress Notifications
- Financial Health Alerts
- Monthly Budget Reminder
- Monthly Report Reminder
- Investment Maturity Reminder

---

## 🤖 AI Wealth Assistant

Unlike a general chatbot, the AI assistant only understands **your financial data**.

### Capabilities

- Personalized Financial Insights
- Budget Suggestions
- Investment Suggestions
- Financial Summary
- Goal Recommendations
- Context-Aware Question Answering

---

# 🛠 Tech Stack

| Category | Technology |
|-----------|------------|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, Node.js |
| Database | MongoDB, MongoDB Atlas |
| Authentication | NextAuth.js / JWT |
| AI | OpenAI API |
| Stock API | Alpha Vantage |
| Mutual Fund API | MFAPI |
| Charts | Recharts, Chart.js |
| PDF | jsPDF |
| Forms | React Hook Form |
| Validation | Zod |
| Database ORM | Mongoose |

---

# 📂 Project Structure

```text
wealth-growth/
│
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── models/
│   ├── services/
│   ├── types/
│   └── utils/
│
├── .env.local
├── package.json
└── README.md
```

---

# 🚀 Future Enhancements

- 📱 Progressive Web App (PWA)
- 📧 Email Notifications
- 🌙 Dark Mode
- ☁ Cloud Backup
- 📊 Advanced Portfolio Analytics
- 🔄 Recurring Transactions
- 💳 Bank Account Integration
- 📈 Investment Performance Prediction

---

# 🎯 Project Goals

- Improve financial awareness
- Encourage disciplined budgeting
- Track investments efficiently
- Visualize financial growth
- Provide AI-powered financial assistance
- Simplify personal finance management

---

# 📷 Screenshots

Project screenshots will be added after development.

---

# ⚙️ Installation

## Clone the Repository

```bash
git clone https://github.com/KaranMagham/wealth-growth.git
```

## Navigate to the Project

```bash
cd wealth-growth
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create a `.env.local` file and add the required API keys.

```env
MONGODB_URI=

BETTER_AUTH_URL=http://localhost:3000

BETTER_AUTH_SECRET=

ADMIN_USER_ID=

OPENAI_API_KEY=

ALPHA_VANTAGE_API_KEY=
```

For a deployed environment, set `BETTER_AUTH_URL` to the exact public URL of the deployment and set `ADMIN_USER_ID` to the MongoDB user `_id` of the account that should access `/admin`. These values must be configured in the hosting provider's server-side environment variables before redeploying. `ADMIN_USER_ID` is compared to the authenticated user's ID, not their email address.

If `/admin` redirects to `/login`, the session cookie is missing or invalid. If it shows an access-denied page, verify that `ADMIN_USER_ID` exactly matches the signed-in user's ID. For API-backed admin panes, `/api/admin/*` returns `401` for a missing session and `403` for a missing or mismatched `ADMIN_USER_ID`.

## Start the Development Server

```bash
npm run dev
```

Open your browser and visit:

```
http://localhost:3000
```

---

# 📅 Development Status

| Module | Status |
|---------|:------:|
| Project Planning | ✅ |
| UI/UX Design | ✅ |
| Synopsis | ✅ |
| Project Setup | 🟡 |
| Authentication | ⏳ |
| Dashboard | ⏳ |
| Budget Management | ⏳ |
| Net Worth Management | ⏳ |
| Goal Management | ⏳ |
| Investment Module | ⏳ |
| Analytics | ⏳ |
| Notifications | ⏳ |
| AI Wealth Assistant | ⏳ |
| Testing | ⏳ |
| Deployment | ⏳ |

Legend:

- ✅ Completed
- 🟡 In Progress
- ⏳ Planned

---

# 🤝 Contributing

This project is currently being developed as a **Final Year B.Sc. Computer Science Project**.

Suggestions, ideas, and feedback are always welcome.

---

# 👨‍💻 Developer

**Karan Santosh Magham**

Final Year B.Sc. Computer Science Student

---

# 📄 License

This project is licensed under the **MIT License**.

---

## ⭐ Support

If you found this project interesting, please consider giving it a **Star ⭐** on GitHub.

It helps support the project and motivates future development.
