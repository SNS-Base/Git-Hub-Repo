## Daily Progress Log

### Day 1: January 28, 2026
** Goal:** Environment Setup & Feature Architecture

** Technical Setup Completed:**
- **Frontend Environment:**
  - Set up **Vite + React + TypeScript** for  development for making UI interactive.
  - Installed **Tailwind CSS** for styling.

** Feature Roadmap Defined:**
Today, we finalized the core modules to be built:
1.  **Authentication :**
    - Login/Sign-Up flows with JWT handling.
    - Protected Routes with Middlewares.
2.  **Dashboard ("Command Center"):**
    - Performance Indicators (Total Spend, Pending Invoices, Total Ivoices, Rejected).
    - Visual Charts using PiCharts.
3.  **Core Processing:**
    - **Upload Zone:** Drag-and-drop a "invoice" and "Purchase Order Receipt"as a pdf format.
    - **Verification Page (Split-Screen):** Side-by-side view of PDF vs. Extracted Data for human review in Excel.
4.  **Reconciliation Process:**
    - Logic to match Invoices against Purchase Orders.
    - Status indicators (Match, Discrepancy).
5.  **More Features for better UI:**
    - **Audit Logs:** Data of who changed what data.
    - **Notification Center:** Real-time alerts for approvals or errors.


### Day 2: January 29, 2026
** Goal:** Develop Authentication Interface (Login/Sign-Up Page)

** Completed Tasks:**

- **Frontend Logic (React + TypeScript):**
  - Implemented `useState` to handle form inputs (email/password) and loading states (`isLoading`).
  - Integrated **./login** Router to handle navigation logic og Login  route.
  - Added login feedback wheter logged in or not.

- **Styling & Assets:**
  - Used **Tailwind CSS** for styling.
