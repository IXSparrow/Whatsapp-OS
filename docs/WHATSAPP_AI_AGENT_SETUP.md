# WhatsApp AI Agent System - Setup & Deployment Guide

## 1. How to Install
Ensure you have Node.js v18+ installed.
```bash
npm install
```

## 2. Environment Setup
Copy the `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the `OPENAI_API_KEY`, `DATABASE_URL`, and `REDIS_URL`.

## 3. Database Migration
The system uses Prisma ORM. Run the following to setup the database schema:
```bash
npx prisma generate
npx prisma db push
```
Seed the database with default AI agents:
```bash
npm run seed
```

## 4. Running Locally
Start Redis using Docker (required for campaign background jobs):
```bash
docker-compose up -d redis
```
Start the application:
```bash
npm run dev
```

## 5. How to Connect WhatsApp
1. Open the application dashboard.
2. Go to the **System Config** tab.
3. Click "Connect WhatsApp" and scan the generated QR code with your WhatsApp app.
*(Note: By default, the system runs with a Mock Provider for testing. Set `USE_REAL_WHATSAPP=true` in your `.env` to enable real WhatsApp Web.js connection).*

## 6. How to Import Leads
1. Navigate to **Lead Intel**.
2. Click **Import CSV**.
3. Select a CSV file with at least a `phone` column. Additional columns like `name`, `businessName`, and `email` are automatically parsed.

## 7. How to Create & Launch a Campaign
1. Go to **Campaigns**.
2. Click **New Campaign**.
3. Fill in the objective, tone, and select a predefined AI Agent.
4. Add leads to the campaign and press **Start**. The system will queue the messages and send them securely using BullMQ background workers with built-in anti-spam delays.

## 8. Safety & Compliance
- **Consent:** Always ensure you have consent before messaging users.
- **Opt-outs:** The AI automatically detects keywords like `STOP`, `UNSUBSCRIBE`, or `NO` and will immediately halt further messages to that lead, marking them as `opted_out`.
- **Rate Limits:** The system caps outbound messages to 50 per hour by default to prevent bans.

## 9. Common Errors and Fixes
- **Redis Connection Error:** Ensure your Redis server is running. Run `docker-compose up -d redis`.
- **Prisma Client not found:** Run `npx prisma generate`.
- **WhatsApp Web Not Starting:** Ensure your system has the required Puppeteer dependencies installed (e.g., `libnss3` on Linux).
