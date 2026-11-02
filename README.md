# OpenDoor — Peer-to-Peer Mentoring Platform (MVP)

> **Your Next Opportunity Starts With a Conversation.**

OpenDoor connects students who want guidance with peers who have already excelled — in academics, SAT/college prep,
entrepreneurship, leadership, sports, music, competitions, and personal growth. This MVP is built for a pilot at
**The Village School (Houston, TX)**.

The app runs in **demo mode**: no accounts, keys, or database setup needed. Everything is saved in your web browser.
**All people and data in the demo are fictional.**

---

## 1. What you need

| Tool | Version | How to check |
| --- | --- | --- |
| **Node.js** | **22 LTS** (recommended). 20 LTS also works. | `node -v` → should print `v22.x.x` or `v20.x.x` |
| npm | Comes with Node.js | `npm -v` |
| A web browser | Chrome, Edge, Safari, or Firefox | — |

**Don't have Node.js?** Go to <https://nodejs.org>, download the **LTS** version, and install it with the default options.
Then close and reopen your terminal.

> 💡 "Terminal" means: **Terminal** app on Mac, or **PowerShell** on Windows. In VS Code, use *View → Terminal*.

---

## 2. Run it on your computer (step by step)

**Step 1 — Get the code.** If you haven't already:

```bash
git clone https://github.com/mns0eo/opendoor.git
```

(Or on GitHub click **Code → Download ZIP** and unzip it.)

**Step 2 — Go into the project folder:**

```bash
cd opendoor
```

**Step 3 — Install the dependencies** (only needed the first time; takes about a minute):

```bash
npm install
```

**Step 4 — Start the app:**

```bash
npm run dev
```

**Step 5 — Open it.** Visit **<http://localhost:3000>** in your browser. 🎉

To stop the app, click in the terminal and press **Ctrl + C**.

### Optional: production build (faster, what a real server would run)

```bash
npm run build
npm start
```

---

## 3. Demo accounts

Click the **"Switch demo user"** button (bottom-right corner of every page) to jump between accounts instantly —
perfect for live presentations. You can also log in on the **Log in** page.

| Role | Email | Password | What to show |
| --- | --- | --- | --- |
| **Mentee** | `riley@demo.opendoor` | `demo1234` | Browse mentors, send a request, see statuses, leave feedback |
| **Mentor** | `alex@demo.opendoor` | `demo1234` | Accept/decline requests, mark sessions completed, hours |
| **Admin** | `admin@demo.opendoor` | `demo1234` | Approve mentor applications, users, requests, feedback, stats |

You can also create your own account on the **Get started** page.

**Reset everything:** open *Switch demo user → Reset demo data* (click twice to confirm). This restores the original
fictional data.

### Suggested 3-minute presentation script

1. **Home page** → click **Find a Mentor**.
2. Filter by **Music** or search "SAT" → open **Alex Kim's** profile (show reviews + intro video area) → **Request Mentoring**.
   Pick one of Alex's open times from the calendar and submit.
3. **Switch demo user → Mentor** (Alex). Show the **Calendar** tab. Accept the new request, open **Chat**, then
   **Mark completed** (45 minutes). On **Volunteer hours**, send it to the school.
4. **Switch demo user → Mentee** (Riley). The session is completed → **Leave review** (tick "show on profile").
5. **Switch demo user → Mentor** → **Reviews** → reply. The reply shows on Alex's public profile.
6. **Switch demo user → Admin**. Approve the volunteer hours and a pending mentor application.

> Tip: Open two browser windows side by side (one as mentee, one as mentor). They stay in sync automatically.

---

## 4. Features

**Implemented in this MVP**

- ✅ Landing page: hero, how it works, categories, featured mentors, mentor benefits, footer
- ✅ Sign up / log in / log out, initial role choice, editable profile (demo mode)
- ✅ Mentor directory: keyword search, 8 category filters, "accepting requests" filter, availability indicators
- ✅ Mentor profile pages: bio, achievements, experience, skills, topics, formats, availability, media placeholders
- ✅ **Mentor calendar:** mentors click/drag to open 1-hour times (with "repeat for next 3 weeks")
- ✅ Mentoring requests: mentees **pick one of the mentor's open times** (past times can't be booked), confirmation screen
- ✅ **Session chat:** opens when the mentor accepts, closes 5 days after the session ends
- ✅ Statuses: Pending → Accepted / Declined → Completed, or Canceled
- ✅ Mentee dashboard: requests by status, upcoming sessions, past sessions, feedback prompts, profile settings
- ✅ Mentor dashboard: accept/decline (with optional note), mark completed + duration, total hours, availability toggle, profile editor, plus Calendar / Volunteer hours / Reviews tabs
- ✅ **Volunteer hours:** mentors send completed sessions to the school; a school admin approves or returns them. Only approved hours show as "Verified by school". Printable activity report
- ✅ **Reviews:** after a session, mentees rate + review the mentor; mentors can reply. Reviews appear on the public profile only if the mentee opts in. Private feedback (what you learned / could improve) is admin-only
- ✅ Become a Mentor: application with "Other" mentoring area, achievements **with the grade they were earned in**, Online / In person / **Both**, and an optional **intro video upload** → **Pending Review** → admin approves/rejects
- ✅ Intro video plays on the mentor's public profile (mentors can replace it in Profile settings)
- ✅ Only approved mentors appear in the directory, and only approved mentors can switch to the mentor role
- ✅ Admin console (admin-only): overview stats, applications, **volunteer-hour approvals**, users, requests, feedback, show/hide mentors
- ✅ "Switch demo user" button, reset demo data, 11 fictional mentors clearly labeled
- ✅ Loading, empty, success, and error states; responsive on mobile; keyboard and screen-reader friendly

**Still needs production configuration** (not required for the demo)

| Feature | What's needed |
| --- | --- |
| Real accounts & email verification | A Supabase project + Supabase Auth (school email domain only) |
| Shared database (everyone sees the same data) | Supabase Postgres — run `supabase/schema.sql`, then re-implement `lib/store.tsx` actions with Supabase calls |
| Server-enforced permissions | The Row Level Security policies in `supabase/schema.sql` (demo checks run in the browser only) |
| Hosting | Import this repository into Vercel (no extra settings needed) |
| Intro videos for everyone | Supabase Storage bucket (demo videos are saved only in the browser that uploaded them) |
| Real-time chat across devices | Supabase Realtime on the `messages` table (demo chat syncs between tabs of one browser) |
| Email notifications | An email provider (e.g. Resend) |
| Future roadmap | Payments, verified volunteer hours/certificates, video intros, résumés, messaging, video calls, AI matching |

---

## 5. How the app is built (architecture)

- **Next.js 15** (React framework, App Router) + **TypeScript** + **Tailwind CSS**.
- **Demo data layer:** `lib/store.tsx` keeps all data in `localStorage` and exposes one set of *actions*
  (`createRequest`, `respondToRequest`, `completeRequest`, `submitFeedback`, `reviewApplication`, …).
  Every action checks who is logged in and what they're allowed to do. **To go to production, only this file changes** —
  swap each action for a Supabase call with the same name and shape; the pages stay the same.
- **Types:** `lib/types.ts` defines Users, Mentor profiles, Requests, Feedback, and Applications — the same shape as
  `supabase/schema.sql`.

```
opendoor/
├─ app/                      Pages (each folder = a URL)
│  ├─ page.tsx               /                   Landing page
│  ├─ mentors/               /mentors            Directory, /mentors/[id] profile, /mentors/[id]/request form
│  ├─ dashboard/             /dashboard          Mentee or mentor dashboard, /dashboard/profile settings
│  ├─ requests/[id]/feedback Feedback form
│  ├─ become-a-mentor/       Mentor application
│  ├─ admin/                 Admin console (admins only)
│  ├─ login/, signup/, guidelines/
├─ components/               Reusable UI (ui.tsx = design system: buttons, cards, inputs, badges…)
│  ├─ dashboard/             Mentee + mentor dashboards
│  └─ admin/                 Admin console
├─ lib/
│  ├─ types.ts               Data model
│  ├─ store.tsx              Data layer + permission checks (demo: localStorage)
│  ├─ seed.ts                Fictional demo data + demo accounts
│  ├─ validation.ts          Form validation rules (shared by forms and store)
│  └─ categories.ts          The 8 mentoring categories
└─ supabase/schema.sql       Production database + security rules (for later)
```

**Design system:** colors live in `tailwind.config.ts` — navy `#14213D`, warm white `#FAFAF8`, soft blue `#E8F0FE`,
teal `#4A9D9A`, charcoal `#242424`. Font: Geist (bundled, works offline).

---

## 6. Troubleshooting

| Problem | Fix |
| --- | --- |
| `npm: command not found` | Node.js isn't installed — see step 1, then reopen the terminal. |
| `npm install` errors about the Node version | Run `node -v`. Install Node 22 LTS from nodejs.org. |
| "Port 3000 is already in use" | Another app is running. Use `npm run dev -- -p 3001` and open <http://localhost:3001>. |
| Data looks strange or old | Switch demo user → **Reset demo data**. |
| Data disappeared | Demo data is per browser. A different browser, private window, or cleared site data starts fresh. |

---

## 7. Privacy & honesty notes

- All profiles, names, and achievements are **fictional** and labeled as demo data. No real student information is used.
- In demo mode, data never leaves your browser.
- Passwords in demo mode are only lightly scrambled — **don't use a real password**. Production uses Supabase Auth.
- Mentoring hours are recorded from mentor-entered durations. They count as volunteer hours **only after a school administrator approves them**.
- Reviews appear on a mentor's public profile only if the mentee opts in (first name + last initial only). Private feedback is admin-only.
- Session chats may be read by school administrators for safety, and close 5 days after the session.
