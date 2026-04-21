# Hackathon Tracker

A web app for tracking food, drinks, and swag distribution at hackathons. Participants register, receive a personal QR code via email, and volunteers scan QRs at each station to mark items as claimed.

---

## Stack

- **React + Vite + Tailwind CSS**
- **Supabase** (database)
- **EmailJS** (transactional email, no backend needed)
- **react-qr-code** (QR generation)
- **html5-qrcode** (webcam QR scanner)

---

## Routes

| Route | Description | Access |
|---|---|---|
| `/` | Registration form | Public |
| `/qr/:id` | Personal QR code page | Public (link in email) |
| `/admin` | Admin login | Public |
| `/admin/scanner` | QR scanner + check-in | Admin only |
| `/admin/dashboard` | Participants overview table | Admin only |

---

## Tracked Items

Breakfast, Lunch, Dinner, Evening Snacks, Red Bull, Quenzy, Xtasy, Swag

---

## Setup

### 1. Supabase — Create the table

Run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE participants (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  phone          TEXT NOT NULL,
  entry_code     TEXT NOT NULL UNIQUE,
  registered_at  TIMESTAMPTZ DEFAULT NOW(),
  breakfast      BOOLEAN DEFAULT FALSE,
  lunch          BOOLEAN DEFAULT FALSE,
  dinner         BOOLEAN DEFAULT FALSE,
  evening_snacks BOOLEAN DEFAULT FALSE,
  red_bull       BOOLEAN DEFAULT FALSE,
  quenzy         BOOLEAN DEFAULT FALSE,
  xtasy          BOOLEAN DEFAULT FALSE,
  swag           BOOLEAN DEFAULT FALSE
);
```

Also enable Row Level Security and add a public insert + select policy if needed.

If you already have participant rows, backfill `entry_code` manually in Supabase before using manual scanner fallback.

### 2. EmailJS — Create a template

1. Go to https://www.emailjs.com and sign up (free tier: 200 emails/month)
2. Add an **Email Service** (Gmail, Outlook, etc.)
3. Create an **Email Template** with variables:
   - `{{to_name}}` — participant name
   - `{{to_email}}` — participant email (set as **To Email** field)
   - `{{qr_link}}` — link to their QR page
   - `{{participant_code}}` — 4-character manual fallback code

   Example template body:
   ```
   Hi {{to_name}},

   You are registered for the hackathon! 🎉

   Participant code: {{participant_code}}

   Your personal QR code pass is here:
   👉 {{qr_link}}

   Open this link and screenshot your QR code. Show it at every food/drink/swag station.

   See you there!
   ```

### 3. Environment variables

Copy `.env.local` and fill in your values:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ADMIN_PASSWORD=your_admin_password
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_APP_URL=http://localhost:5173   # change to deployed URL in production
```

### 4. Run locally

```bash
npm install
npm run dev
```

---

## Volunteer workflow

1. Open `/admin` and enter the admin password
2. Go to `/admin/scanner`
3. Select the active station item (Breakfast, Lunch, etc.) once
4. Click **Start Scanner** — allow camera access
5. Scan participant QR (or enter 4-char fallback code manually)
6. App marks the selected item as claimed, or shows if already claimed
7. Continue scanning next participant without re-selecting item each time

