# 🔧 Tool Rental Platform

A full-stack **peer-to-peer tool rental web application** built with **Next.js 15**, featuring multi-role dashboards, real-time rental management, delivery tracking, and admin controls.

---

## 📸 Overview

This platform connects **tool owners (Lenders)** with **tool renters (Borrowers)**, supported by **Delivery agents**, **Inspectors**, and an **Admin panel** — all in one seamless web app.

---

## 🚀 Features

### 🏪 Lender Portal
- List tools with photos and pricing
- Approve or reject rental requests
- Track earnings and manage listings
- View rental history

### 👷 Borrower Dashboard
- Browse and search available tools
- Book & pay online
- Track rental and delivery status
- Raise disputes

### 🚚 Delivery Agent Panel
- View assigned deliveries
- Update delivery/pickup status
- Navigation support

### 🔍 Inspector Panel
- Inspect tools before and after rental
- Log condition reports and damage assessments

### 🛡️ Admin Panel
- Full platform oversight
- User management
- Dispute resolution
- Analytics and reporting

### 📊 System Diagrams
- Built-in UML activity diagrams showing platform workflows

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 15](https://nextjs.org) | Full-stack React framework |
| TypeScript | Type-safe development |
| CSS Modules / Global CSS | Styling |
| React Context | State management |

---

## 📁 Project Structure

```
activity-diagram-app/
├── app/
│   ├── admin/          # Admin dashboard pages
│   ├── auth/           # Authentication pages
│   ├── borrower/       # Borrower dashboard pages
│   ├── delivery/       # Delivery agent pages
│   ├── inspector/      # Inspector pages
│   ├── lender/         # Lender portal pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing / role selector page
├── components/
│   ├── AdminPanel.tsx
│   ├── DashboardShell.tsx
│   ├── Footer.tsx
│   ├── GigWorkerPanel.tsx
│   ├── Hero.tsx
│   ├── HowItWorks.tsx
│   ├── InspectorPanel.tsx
│   ├── LenderPortal.tsx
│   ├── NavBar.tsx
│   ├── Providers.tsx
│   ├── RentModal.tsx
│   ├── RentalDashboard.tsx
│   ├── RolePortal.tsx
│   ├── SystemDiagrams.tsx
│   └── ToolCatalog.tsx
├── lib/                # Utility functions and helpers
├── public/             # Static assets
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/activity-diagram-app.git

# Navigate to the project directory
cd activity-diagram-app

# Install dependencies
npm install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

### Building for Production

```bash
npm run build
npm start
```

---

## 🎭 User Roles

| Role | Description | Access |
|---|---|---|
| **Lender** | Tool owner | List, approve, earn |
| **Borrower** | Tool renter | Browse, book, track |
| **Delivery** | Gig worker | Pickup & deliver tools |
| **Inspector** | Quality checker | Inspect tool condition |
| **Admin** | Platform manager | Full control |

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

> Built with ❤️ using Next.js
