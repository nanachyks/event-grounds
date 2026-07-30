# EventGrounds MVP

A robust event grounds booking platform built for the Ghanaian market. Users can browse venues, check availability, submit booking inquiries, and pay via Paystack. Venues can be booked as a single unit (daily and/or hourly) or broken into individually-priced sub-spaces (e.g. separate rooms in a studio complex). Vendors self-register, manage their own venues, and approve their own bookings via a self-service portal. Admins have oversight across all vendors and can approve or cancel any booking as a fallback. Customers can track a booking's status, leave a review after a completed stay, and message the vendor directly on WhatsApp.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | Auth.js (NextAuth v5) — JWT sessions, Credentials providers for admin + vendor |
| UI | Tailwind CSS (custom components) |
| Deployment | Vercel |
| Payments | Paystack (GHS) |
| Images | Cloudinary |
| Email | Resend |
| SMS | AfricasTalking *(optional)* |

---

## Project Structure

```
event-grounds/
├── .env.example                 # Environment variables template
├── prisma/
│   ├── schema.prisma            # Database models
│   └── seed.ts                  # Sample data (grounds, sub-spaces, 2 vendors)
├── src/
│   ├── auth.config.ts           # Edge-safe Auth.js config (used by middleware)
│   ├── auth.ts                  # Full Auth.js config: admin + vendor Credentials providers
│   ├── middleware.ts            # Role-based route protection (/admin/*, /vendor/*)
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   ├── layout.tsx           # Root layout (navbar + footer)
│   │   ├── grounds/
│   │   │   ├── page.tsx         # Browse + search grounds
│   │   │   └── [id]/page.tsx    # Ground detail + sub-space picker + booking + reviews
│   │   ├── booking/
│   │   │   ├── confirm/page.tsx # Post-inquiry confirmation
│   │   │   └── [id]/page.tsx    # Public booking status page + review form
│   │   ├── admin/
│   │   │   ├── login/page.tsx        # Admin login
│   │   │   └── (protected)/
│   │   │       ├── layout.tsx        # Admin dashboard shell + stats (all vendors)
│   │   │       ├── page.tsx          # Dashboard home
│   │   │       ├── grounds/          # CRUD grounds + sub-spaces for any vendor
│   │   │       └── bookings/         # Manage/approve/cancel bookings for any vendor
│   │   ├── vendor/
│   │   │   ├── signup/page.tsx       # Self-service vendor registration
│   │   │   ├── login/page.tsx        # Vendor login
│   │   │   └── (protected)/
│   │   │       ├── layout.tsx        # Vendor dashboard shell + stats (own grounds only)
│   │   │       ├── page.tsx          # Dashboard home
│   │   │       ├── grounds/          # CRUD own grounds + sub-spaces (auto-publish on create)
│   │   │       └── bookings/         # View/approve/cancel own bookings
│   │   └── api/                 # REST API routes + /api/auth/[...nextauth]
│   ├── components/
│   │   ├── ui/                  # Reusable (button, card, input, badge)
│   │   ├── grounds/
│   │   │   ├── ground-form.tsx     # Shared create/edit form (admin + vendor)
│   │   │   ├── space-manager.tsx   # Sub-space CRUD, embedded in ground edit pages
│   │   │   ├── booking-form.tsx    # Space picker + daily/hourly booking + live price preview
│   │   │   └── review-form.tsx     # Star rating + comment, posted from the booking status page
│   │   ├── booking-approve-button.tsx  # Shared approve action (admin + vendor)
│   │   ├── booking-cancel-button.tsx   # Shared cancel action (admin + vendor)
│   │   ├── logout-button.tsx
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   └── availability-calendar.tsx
│   ├── lib/                     # prisma, paystack (+refund), email, cloudinary, auth-helpers,
│   │                             # pricing.ts (daily/hourly amount calc), opening-hours.ts,
│   │                             # whatsapp.ts (wa.me link builder)
│   └── types/
│       ├── index.ts             # TypeScript interfaces
│       └── next-auth.d.ts       # Session/JWT type augmentation (role, vendorId)
└── package.json
```

---

## Data Models

### Vendor
Stores ground owners with configurable commission rate (default 2%) and a bcrypt-hashed `password` for self-service login. Vendors sign up at `/vendor/signup` and manage only their own grounds/bookings.

### Ground
| Field | Type | Description |
|---|---|---|
| name | String | Venue name |
| description | String | Full description |
| location | String | City/area in Ghana |
| capacity | Int | Max guests |
| price | Float | Daily rate in GHS (used when `pricingType` is `daily`/`both`) |
| pricingType | String | `daily` / `hourly` / `both` |
| hourlyRate | Float? | Hourly rate in GHS (used when `pricingType` is `hourly`/`both`) |
| openingHours | Json? | Per-weekday hours, e.g. `[{day:1, open:"08:00", close:"20:00", closed:false}]` — enforced server-side for hourly bookings |
| cancellationPolicy | String | `flexible` / `moderate` / `strict` (label shown to customers) |
| cancellationNoticeHours | Int | Hours before the event within which a `paid` booking is refundable (default 48) |
| images | String[] | Cloudinary URLs |
| amenities | String[] | e.g., Parking, Stage, Sound System |
| status | String | active / draft / archived |

A ground with no `Space` rows is booked directly at its own rate. A ground with one or more `Space` rows requires the customer to pick a specific space; the ground's own price fields are then unused.

### Space
Optional sub-space (room) within a `Ground` — e.g. "Podcast Room" inside a larger studio complex. Has its own `name`, `capacity`, `pricingType`, `dailyRate`, `hourlyRate`, `images`, and `status`, managed independently by the vendor/admin from the ground's edit page.

### Booking
| Field | Type | Description |
|---|---|---|
| customerName / customerEmail / customerPhone | String | |
| spaceId | String? | Set when the customer booked a specific sub-space rather than the ground directly |
| startDate / endDate | DateTime | Full date+time — same-day with distinct times for hourly bookings, date-only range for daily bookings |
| amount | Float? | Price locked in at inquiry time (see `src/lib/pricing.ts`); approval/commission use this instead of re-deriving the ground's current price |
| status | String | pending → approved → paid, or → cancelled at any point before/after payment (see [Cancellations & Refunds](#cancellations--refunds)) |

### Review
One review per `Booking` (unique constraint), only submittable once `status === "paid"`. Has `rating` (1-5), optional `comment`, `customerName`, tied to both the `Booking` and the `Ground`.

### Payment
| Field | Type | Description |
|---|---|---|
| paystackRef | String | Unique Paystack reference |
| amount | Float | Total charged (GHS) |
| commission | Float | Platform cut (vendor's `commissionRate`) |
| vendorNet | Float | Vendor payout amount |
| status | String | pending → success, or → refunded on an in-window cancellation |

---

## User Flow

```
[BROWSE] → [GROUND DETAIL + AVAILABILITY CALENDAR] → [BOOKING FORM]
                                                           ↓
                                              [INQUIRY SUBMITTED (pending)]
                                                           ↓
                                              [ADMIN REVIEWS & APPROVES]
                                                           ↓
                                          [PAYMENT LINK GENERATED (Paystack)]
                                                           ↓
                                              [CUSTOMER PAYS ONLINE]
                                                           ↓
                                  [PLATFORM DEDUCTS COMMISSION → VENDOR NOTIFIED]
```

---

## Customer Booking Lookup

`/booking/[id]` is a public status page (linked from the post-inquiry confirmation screen as "Track your booking") showing live status, the locked-in amount, a WhatsApp link to the vendor, and — once the booking reaches `paid` — a review form. There is still no full account system; a booking is only reachable by knowing its ID, and self-service actions (like customer-initiated cancellation) that need stronger identity proof are deferred — see below.

---

## Cancellations & Refunds

`POST /api/bookings/[id]/cancel` is vendor/admin-triggered (via a "Cancel Booking" action on the booking detail page): it rejects an already-cancelled booking, and for a `paid` booking within the ground's `cancellationNoticeHours` window it calls Paystack's refund API and marks the `Payment` as `refunded`; outside the window (or if never paid) it just marks the `Booking` as `cancelled` with no refund. Cancelling frees the slot immediately — a new booking for the same space/time will succeed once the previous one is cancelled.

**Deferred:** genuine customer-initiated self-service cancellation (as opposed to vendor/admin cancelling on the customer's behalf) — would need a stronger identity check than a booking ID alone, likely the same email-match pattern used by reviews.

---

## API Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/grounds` | List active grounds. Query params: `location`, `capacity` (min), `minPrice`, `maxPrice`, `query` (name/description search) |
| POST | `/api/grounds` | Create a ground. Vendor session → forced to own `vendorId`, auto-published `active`. Admin session → requires `vendorId` in body |
| GET | `/api/grounds/[id]` | Single ground detail + bookings |
| PUT | `/api/grounds/[id]` | Update a ground. Requires ownership (vendor) or admin session |
| DELETE | `/api/grounds/[id]` | Delete a ground. Requires ownership (vendor) or admin session |
| GET | `/api/grounds/[id]/availability` | Blocked dates for date range. Optional `?spaceId=` scopes conflict-checking to a specific sub-space |
| POST | `/api/grounds/[id]/spaces` | Add a sub-space. Requires ownership (vendor) or admin session |
| PUT / DELETE | `/api/grounds/[id]/spaces/[spaceId]` | Update/remove a sub-space. Requires ownership (vendor) or admin session |
| POST | `/api/bookings` | Submit booking inquiry. Validates opening hours (hourly bookings) and slot conflicts server-side; computes and locks in `amount` |
| GET | `/api/bookings` | List all bookings (admin) |
| GET | `/api/bookings/[id]` | Booking detail |
| PATCH | `/api/bookings/[id]` | Update booking |
| POST | `/api/bookings/[id]/approve` | Approve → generate Paystack link. Requires ownership (vendor) or admin session |
| POST | `/api/bookings/[id]/cancel` | Cancel a booking, refunding via Paystack if `paid` and within the cancellation window. Requires ownership (vendor) or admin session |
| POST | `/api/payments/verify` | Paystack webhook handler |
| POST | `/api/reviews` | Submit a review for a `paid` booking (customer email must match the booking) |
| POST | `/api/vendor/signup` | Self-service vendor registration |
| * | `/api/auth/[...nextauth]` | Auth.js route handler — admin login (`signIn("admin", ...)`) and vendor login (`signIn("vendor", ...)`) |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Paystack merchant account (Ghana)
- Cloudinary account (free tier)
- Resend account (free tier, for emails)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/event-grounds"
PAYSTACK_SECRET_KEY="sk_live_..."
PAYSTACK_PUBLIC_KEY="pk_live_..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
RESEND_API_KEY="re_..."
COMMISSION_RATE="0.02"
AUTH_SECRET="generate-with-npx-auth-secret"
ADMIN_EMAIL="admin@eventgrounds.com"
ADMIN_PASSWORD_HASH="bcrypt-hash-of-your-password"
```
Generate `AUTH_SECRET` with `npx auth secret`. Generate `ADMIN_PASSWORD_HASH` with:
```bash
node -e "console.log(require('bcryptjs').hashSync('yourpassword',10))"
```
**Important:** Next.js's `.env` loader expands `$name` as a variable reference. Bcrypt hashes are full of `$`-delimited segments (e.g. `$2b$10$...`), so the hash gets silently truncated unless every `$` is escaped as `\$` — e.g. `$2b$10$abc` becomes `\$2b\$10\$abc` in `.env`.

### 3. Database Setup
```bash
npx prisma db push        # Create tables
npm run db:seed           # Seed sample data
npx prisma studio         # (optional) Browse data
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Access
- **Public site:** `http://localhost:3000`
- **Admin panel:** `http://localhost:3000/admin/login` (credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` in `.env`)
- **Vendor portal:** `http://localhost:3000/vendor/login` — sign up at `/vendor/signup`, or use a seeded vendor account (email + password printed to the console by `npm run db:seed`)

---

## Commission Model

The platform charges **2% commission** on each booking (configurable via `COMMISSION_RATE` in `.env`).

Flow:
1. Customer pays **full amount** via Paystack
2. Platform records: `amount`, `commission (2%)`, `vendorNet (98%)`
3. Vendor payout is tracked — pay out manually or integrate automated payouts later

---

## Admin Actions

| Action | Where | Effect |
|---|---|---|
| Create/Edit Ground (any vendor) | `/admin/grounds` | Add venues with images, pricing (daily/hourly/both), opening hours, cancellation policy, amenities; picks the owning vendor from a dropdown |
| Manage Sub-Spaces | `/admin/grounds/[id]/edit` | Add/edit/remove individually-priced rooms within a venue |
| View Bookings (all vendors) | `/admin/bookings` | Filterable table, search |
| Approve Booking (any vendor's) | `/admin/bookings/[id]` | Generates Paystack payment link — oversight/fallback alongside vendor self-approval |
| Cancel Booking (any vendor's) | `/admin/bookings/[id]` | Cancels, refunding via Paystack if already paid and within the notice window |
| Message Customer | `/admin/bookings/[id]` | WhatsApp click-to-chat link prefilled with booking context |
| Mark Paid | Webhook auto | Payment verified → status updates |
| View Stats | `/admin` | Grounds count, bookings, total revenue across all vendors |

## Vendor Actions

| Action | Where | Effect |
|---|---|---|
| Sign up | `/vendor/signup` | Self-service account creation, auto-logged in |
| Create/Edit Ground | `/vendor/grounds` | Scoped to own grounds only; new grounds auto-publish (`status: active`) immediately; set daily/hourly pricing, opening hours, cancellation policy |
| Manage Sub-Spaces | `/vendor/grounds/[id]/edit` | Add/edit/remove individually-priced rooms within their venue |
| View Bookings | `/vendor/bookings` | Scoped to bookings on own grounds only |
| Approve Booking | `/vendor/bookings/[id]` | Generates Paystack payment link for own booking; uses their `commissionRate` against the booking's locked-in `amount` |
| Cancel Booking | `/vendor/bookings/[id]` | Cancels their own booking, refunding via Paystack if already paid and within the notice window |
| Message Customer | `/vendor/bookings/[id]` | WhatsApp click-to-chat link prefilled with booking context |
| View Stats | `/vendor` | Own grounds count, bookings, net revenue |

---

## Deployment (Vercel)

```bash
npm run build
```
1. Push to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

Ensure your PostgreSQL database is accessible from Vercel (use a cloud provider like Supabase, Neon, or Railway).

---

## Future Enhancements (Post-MVP)

**High priority for a public consumer site:**
- [ ] Customer-initiated self-service cancellation (currently vendor/admin-triggered only — see [Cancellations & Refunds](#cancellations--refunds))
- [ ] Seasonal/date-range pricing overrides on top of the daily/hourly rate

**Lower priority / operational scaling:**
- [ ] Automated payouts via Paystack Transfers
- [ ] SMS notifications via AfricasTalking
- [ ] Payment partial deposits
- [ ] Mobile app (React Native)
- [ ] Admin-facing vendor management page (list/deactivate vendor accounts — currently admin only sees vendors indirectly via the grounds vendor picker)
- [ ] Per-space availability calendar on the ground detail page (currently shows ground-wide approved/paid bookings; actual conflict-checking is correctly scoped per-space server-side, but the visual calendar isn't yet)
