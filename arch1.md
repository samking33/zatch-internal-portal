# Zatch Admin Portal — Full Architecture Specification

## Project Overview

An internal admin portal for Zatch to review and approve/reject seller onboarding requests. Built to be scalable — the seller boarding panel is the first dashboard; the architecture must support adding more dashboards (orders, disputes, etc.) with zero rework.

Sellers apply via a **mobile app** built by a separate team. That mobile app posts seller data directly to a dedicated intake endpoint on this API, authenticated with an API key. No shared database, no shared codebase — clean separation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) — deployed on Render (Static Site / Web Service) |
| Backend API | Node.js + Express — deployed on Render (Web Service) |
| Database | MongoDB Atlas (Mongoose ODM) |
| Super Admin UI | AdminJS (mounted on Express at `/admin`) |
| Monorepo | Turborepo with npm workspaces |
| Validation | Zod (shared between API and web) |
| Auth (admin) | Custom JWT (access token 15m + httpOnly refresh token 7d) |
| Auth (mobile app) | API key / shared secret in `X-API-Key` request header |
| File storage | Cloudinary (mobile app uploads docs directly; sends URLs here) |
| Logging | Winston (structured JSON) |
| Error tracking | Sentry |
| Password hashing | bcrypt |

---

## Monorepo Structure

```
zatch-admin/
├── apps/
│   ├── api/          # Node.js/Express — Render Web Service
│   └── web/          # Next.js 14 — Render Web Service
├── packages/
│   └── shared/       # Types, Zod schemas, utils — imported by both apps
├── package.json      # workspaces: ["apps/*", "packages/*"]
└── turbo.json        # Turborepo pipeline
```

---

## packages/shared

Shared between `apps/api` and `apps/web`. Never contains runtime logic — only types, schemas, and pure utilities.

```
packages/shared/src/
├── types/
│   ├── seller.types.ts      # ISeller, SellerStatus enum, ISellerDocument
│   ├── audit.types.ts       # IAuditLog, AuditAction enum
│   └── user.types.ts        # IAdminUser, Role enum
├── schemas/
│   ├── seller.schema.ts     # Zod: intake payload + approve/reject payload
│   └── auth.schema.ts       # Zod: login request, token shape
└── utils/
    └── date.utils.ts        # Date formatting helpers, IST timezone
```

### Types

```typescript
// seller.types.ts
export enum SellerStatus {
  PENDING  = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface IStatusHistoryEntry {
  status:    SellerStatus;
  changedBy: string | null; // admin_users ObjectId ref — null for system actions
  changedAt: Date;
  note?:     string;
}

export interface ISellerDocument {
  type:       'pan' | 'aadhaar' | 'gst_certificate' | 'other';
  url:        string;      // Cloudinary URL — uploaded by mobile app before calling intake
  publicId:   string;      // Cloudinary public_id — for deletion if needed
  uploadedAt: Date;
}

export interface ISeller {
  _id:               string;
  sellerName:        string;
  businessName:      string;
  email:             string;
  phone:             string;
  gstOrEnrollmentId: string;
  documents:         ISellerDocument[];
  status:            SellerStatus;
  source:            'mobile_app' | 'manual';
  statusHistory:     IStatusHistoryEntry[];
  receivedAt:        Date;
  updatedAt:         Date;
  metadata?:         Record<string, unknown>;
}

// audit.types.ts
export enum AuditAction {
  SELLER_SUBMITTED = 'seller.submitted',  // intake from mobile app
  SELLER_APPROVED  = 'seller.approved',
  SELLER_REJECTED  = 'seller.rejected',
  USER_LOGIN       = 'user.login',
  USER_LOGOUT      = 'user.logout',
  ADMIN_OVERRIDE   = 'admin.override',
}

export interface IAuditLog {
  _id:              string;
  adminUserId?:     string;        // null/undefined for system-generated logs
  adminUserEmail?:  string;        // denormalized — 'system' for intake logs
  action:           AuditAction | string;
  targetId:         string;
  targetCollection: string;
  note?:            string;
  ipAddress?:       string;
  metadata?:        Record<string, unknown>;
  createdAt:        Date;
}

// user.types.ts
export enum Role {
  SUPER_ADMIN = 'super_admin',
  OPS_ADMIN   = 'ops_admin',
  VIEWER      = 'viewer',
}

export interface IAdminUser {
  _id:         string;
  email:       string;
  name:        string;
  role:        Role;
  isActive:    boolean;
  lastLoginAt?: Date;
  createdAt:   Date;
  updatedAt:   Date;
}
```

### Zod Schemas

```typescript
// seller.schema.ts

// Used by the mobile app intake endpoint — POST /intake/seller
export const sellerIntakeSchema = z.object({
  sellerName:        z.string().min(1).max(200).trim(),
  businessName:      z.string().min(1).max(200).trim(),
  email:             z.string().email().toLowerCase(),
  phone:             z.string().min(10).max(15),
  gstOrEnrollmentId: z.string().min(1).max(50).trim(),
  documents: z.array(z.object({
    type:     z.enum(['pan', 'aadhaar', 'gst_certificate', 'other']),
    url:      z.string().url(),
    publicId: z.string().min(1),
  })).min(1, 'At least one document is required'),
  metadata: z.record(z.unknown()).optional(),
});

// Used by admin PATCH /api/sellers/:id/status
export const updateSellerStatusSchema = z.object({
  action: z.enum(['approve', 'reject']),
  note:   z.string().max(500).optional(),
});

// auth.schema.ts
export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
});
```

---

## apps/api — Node.js/Express

### Folder Structure

```
apps/api/src/
├── config/
│   ├── db.ts                    # Mongoose connect with retry logic
│   └── env.ts                   # Typed env vars parsed with Zod
├── middleware/
│   ├── auth.middleware.ts        # Verify JWT, attach req.user
│   ├── apiKey.middleware.ts      # Verify X-API-Key for mobile app intake routes
│   ├── rbac.middleware.ts        # Role guard factory: requireRole(Role.OPS_ADMIN)
│   ├── validate.middleware.ts    # Zod schema → 400 errors
│   └── logger.middleware.ts      # Winston request logging
├── modules/
│   ├── intake/                   # Mobile app entry point — separate from admin API
│   │   └── intake.routes.ts      # POST /intake/seller
│   ├── sellers/
│   │   ├── seller.model.ts
│   │   ├── seller.repository.ts
│   │   ├── seller.service.ts
│   │   └── seller.routes.ts
│   ├── audit/
│   │   ├── audit.model.ts
│   │   ├── audit.repository.ts
│   │   └── audit.service.ts
│   ├── auth/
│   │   ├── auth.model.ts
│   │   ├── auth.service.ts
│   │   └── auth.routes.ts
│   └── admin-users/
│       ├── admin-users.service.ts
│       └── admin-users.routes.ts
├── adminjs/
│   ├── setup.ts
│   └── resources.ts
└── app.ts                        # Express setup, mount all routers
```

### Environment Variables (apps/api)

```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET=<secret>
CORS_ORIGIN=https://admin.zatch.in
SENTRY_DSN=<dsn>

# Shared with mobile app developer — keep secret
MOBILE_API_KEY=<long-random-hex-string>

# Cloudinary — for URL domain validation only (mobile app handles uploads)
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
```

---

## Mobile App Intake — Full Design

### How it works

```
Seller fills form in mobile app
        ↓
Mobile app uploads each document to Cloudinary directly
(gets back { url, public_id } per file)
        ↓
Mobile app POSTs to POST /intake/seller
with form fields + document URLs
        ↓
Admin API verifies X-API-Key header
        ↓
Zod validates full payload
        ↓
Duplicate email / GST check → 409 if exists
        ↓
Seller document created: status = "pending", source = "mobile_app"
        ↓
Audit log written: action = "seller.submitted"
        ↓
201 response with { sellerId, status, receivedAt }
        ↓
Seller appears in admin portal pending list immediately
```

### Why Cloudinary URLs, not binary uploads

The mobile app uploads files directly to Cloudinary using a signed upload preset (configured separately by the mobile team). It receives `{ url, public_id }` back from Cloudinary and includes those in the intake payload. The admin API never handles binary file data — it stores URLs only. This keeps the API stateless and fast.

### apiKey.middleware.ts

```typescript
export const requireApiKey = (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers['x-api-key'];
  if (!key || key !== env.MOBILE_API_KEY) {
    return res.status(401).json({ success: false, error: 'Invalid or missing API key' });
  }
  next();
};
```

### Intake route (intake.routes.ts)

```
POST /intake/seller
Auth:         X-API-Key: <MOBILE_API_KEY>
Rate limit:   20 requests / minute per IP
Content-Type: application/json
```

**Request body:**
```json
{
  "sellerName":        "Ravi Kumar",
  "businessName":      "Ravi Traders",
  "email":             "ravi@example.com",
  "phone":             "9876543210",
  "gstOrEnrollmentId": "29ABCDE1234F1Z5",
  "documents": [
    {
      "type":     "pan",
      "url":      "https://res.cloudinary.com/zatch/image/upload/v1/pan_ravi.jpg",
      "publicId": "pan_ravi"
    },
    {
      "type":     "aadhaar",
      "url":      "https://res.cloudinary.com/zatch/image/upload/v1/aadhaar_ravi.jpg",
      "publicId": "aadhaar_ravi"
    }
  ]
}
```

**Success (201):**
```json
{
  "success": true,
  "data": {
    "sellerId":   "64f1a2b3c4d5e6f7a8b9c0d1",
    "status":     "pending",
    "receivedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
| Status | When |
|---|---|
| 400 | Zod validation failure — missing fields, bad email, etc. |
| 401 | Missing or invalid X-API-Key |
| 409 | Duplicate email or gstOrEnrollmentId already exists |
| 429 | Rate limit exceeded |

### SellerService.createFromIntake() logic

1. Zod validate body with `sellerIntakeSchema` → 400 if invalid
2. Check `Seller.exists({ email })` → 409 with message "Email already registered"
3. Check `Seller.exists({ gstOrEnrollmentId })` → 409 with message "GST/Enrollment ID already registered"
4. Create seller: `status: 'pending'`, `source: 'mobile_app'`, `receivedAt: new Date()`
5. Push initial statusHistory entry: `{ status: 'pending', changedBy: null, changedAt: new Date() }`
6. Save to MongoDB
7. Call `AuditService.log({ action: 'seller.submitted', adminUserId: null, adminUserEmail: 'system', targetId: seller._id, targetCollection: 'sellers', metadata: { source: 'mobile_app', ip: req.ip } })`
8. Return `{ sellerId: seller._id, status: 'pending', receivedAt: seller.receivedAt }`

---

## MongoDB Schemas

### sellers collection

```typescript
const sellerDocumentSubSchema = new Schema({
  type:       { type: String, enum: ['pan', 'aadhaar', 'gst_certificate', 'other'], required: true },
  url:        { type: String, required: true },
  publicId:   { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const sellerSchema = new Schema({
  sellerName:         { type: String, required: true, trim: true },
  businessName:       { type: String, required: true, trim: true },
  email:              { type: String, required: true, unique: true, lowercase: true },
  phone:              { type: String, required: true },
  gstOrEnrollmentId:  { type: String, required: true, unique: true, sparse: true },
  documents:          [sellerDocumentSubSchema],
  status:             { type: String, enum: Object.values(SellerStatus), default: SellerStatus.PENDING },
  source:             { type: String, enum: ['mobile_app', 'manual'], default: 'mobile_app' },
  statusHistory: [{
    status:    { type: String, enum: Object.values(SellerStatus) },
    changedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser', default: null },
    changedAt: { type: Date, default: Date.now },
    note:      { type: String },
  }],
  receivedAt: { type: Date, required: true, default: Date.now },
  metadata:   { type: Schema.Types.Mixed },
}, { timestamps: true });

// Primary query index — pending sellers sorted by date received
sellerSchema.index({ status: 1, receivedAt: -1 });
sellerSchema.index({ email: 1 }, { unique: true });
sellerSchema.index({ gstOrEnrollmentId: 1 }, { unique: true, sparse: true });
```

### audit_logs collection

```typescript
const auditLogSchema = new Schema({
  adminUserId:       { type: Schema.Types.ObjectId, ref: 'AdminUser', default: null },
  adminUserEmail:    { type: String, default: 'system' },
  action:            { type: String, required: true },
  targetId:          { type: Schema.Types.ObjectId, required: true },
  targetCollection:  { type: String, required: true },
  note:              { type: String },
  ipAddress:         { type: String },
  metadata:          { type: Schema.Types.Mixed },
}, { timestamps: true });

// Immutability enforced at model level
auditLogSchema.pre('findOneAndUpdate', function() { throw new Error('audit_logs are immutable'); });
auditLogSchema.pre('updateOne',        function() { throw new Error('audit_logs are immutable'); });
auditLogSchema.pre('updateMany',       function() { throw new Error('audit_logs are immutable'); });

auditLogSchema.index({ targetId: 1 });
auditLogSchema.index({ targetCollection: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ adminUserId: 1 });
auditLogSchema.index({ createdAt: -1 });
```

### admin_users collection

```typescript
const adminUserSchema = new Schema({
  email:            { type: String, required: true, unique: true, lowercase: true },
  name:             { type: String, required: true },
  passwordHash:     { type: String, required: true },
  refreshTokenHash: { type: String, default: null },
  role:             { type: String, enum: Object.values(Role), default: Role.OPS_ADMIN },
  isActive:         { type: Boolean, default: true },
  lastLoginAt:      { type: Date },
}, { timestamps: true });

adminUserSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.passwordHash;
    delete ret.refreshTokenHash;
    return ret;
  }
});
```

---

## All API Routes

### Intake (mobile app only — API key auth)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /intake/seller | X-API-Key header | Mobile app submits seller form + Cloudinary doc URLs |

### Auth (admin users — JWT)

| Method | Path | Role | Description |
|---|---|---|---|
| POST | /api/auth/login | public | Email + password → accessToken + httpOnly cookie |
| POST | /api/auth/refresh | public | Cookie → new accessToken |
| POST | /api/auth/logout | any-auth | Null refreshTokenHash + clear cookie |
| GET | /api/auth/me | any-auth | Current user info |

### Sellers (admin UI)

| Method | Path | Role | Description |
|---|---|---|---|
| GET | /api/sellers | ops_admin+ | Pending sellers list. Query: page, limit, sortBy |
| GET | /api/sellers/:id | ops_admin+ | Single seller + documents + statusHistory |
| PATCH | /api/sellers/:id/status | ops_admin+ | Approve or reject. Atomic + audit log |

### Audit

| Method | Path | Role | Description |
|---|---|---|---|
| GET | /api/audit | ops_admin+ | Filter by collection, user, date range |
| GET | /api/audit/:targetId | ops_admin+ | All logs for one entity |

### Admin Users

| Method | Path | Role | Description |
|---|---|---|---|
| GET | /api/admin-users | super_admin | List all accounts |
| POST | /api/admin-users | super_admin | Create ops account |
| PATCH | /api/admin-users/:id | super_admin | Update role / isActive |

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/health | public | { status: "ok", db: "connected" } |

---

## Auth Flow Details

### Login (POST /api/auth/login)

1. Zod validate → 400
2. Find user by email → 401 if not found
3. bcrypt.compare password → 401 if mismatch
4. isActive check → 403 if deactivated
5. Sign accessToken (JWT 15m, payload: { userId, email, role })
6. Sign refreshToken (JWT 7d)
7. Hash refreshToken, save to user.refreshTokenHash
8. Set refreshToken in httpOnly + sameSite=strict cookie
9. Return { accessToken, user } in body
10. AuditService.log USER_LOGIN
11. Update lastLoginAt

### Token Refresh (POST /api/auth/refresh)

1. Read cookie → 401 if missing
2. Verify JWT → 401 if expired/invalid
3. bcrypt.compare against stored hash → 401 if mismatch
4. Issue new accessToken (15m)
5. Return { accessToken }

### Approve/Reject (PATCH /api/sellers/:id/status)

1. auth.middleware — verify JWT → 401
2. rbac.middleware — ops_admin+ → 403
3. validate.middleware — Zod body → 400
4. SellerService.updateStatus():
   - Fetch seller → 404 if not found
   - status === 'pending' check → 409 if already actioned
   - Open Mongoose session (transaction)
   - Update seller.status
   - $push to seller.statusHistory (changedBy = req.user._id)
   - Commit → 500 + rollback on failure
5. AuditService.log SELLER_APPROVED or SELLER_REJECTED
6. Return { success: true, seller }

### Middleware chains

```
Intake:       POST /intake/seller → requireApiKey → validate(sellerIntakeSchema) → handler
Admin routes: /api/* → auth.middleware → rbac.middleware → validate → handler
```

---

## What to hand to the mobile app developer

```
=== Zatch Seller Intake API — Integration Guide ===

Endpoint:     POST https://api.zatch.in/intake/seller
Header:       X-API-Key: <value of MOBILE_API_KEY from env>
Content-Type: application/json

Step 1 — Upload documents to Cloudinary first
  Upload each document file to Cloudinary using your upload preset.
  Store the returned { secure_url, public_id } for each file.
  Do NOT send binary files to this endpoint.

Step 2 — POST the seller payload

Required fields:
  sellerName          string   (1–200 chars)
  businessName        string   (1–200 chars)
  email               string   (valid email — must be unique)
  phone               string   (10–15 digits)
  gstOrEnrollmentId   string   (must be unique)
  documents           array    (min 1 item)
    type              "pan" | "aadhaar" | "gst_certificate" | "other"
    url               string   (Cloudinary secure_url)
    publicId          string   (Cloudinary public_id)

Responses:
  201  { success: true, data: { sellerId, status: "pending", receivedAt } }
  400  { success: false, error: "...", details: [...] }   ← validation error
  401  { success: false, error: "Invalid or missing API key" }
  409  { success: false, error: "Email already registered" }
  409  { success: false, error: "GST/Enrollment ID already registered" }
  429  { success: false, error: "Too many requests" }
```

---

## apps/web — Next.js 14

### Folder Structure

```
apps/web/
├── app/
│   ├── (auth)/login/page.tsx
│   └── (admin)/
│       ├── layout.tsx
│       ├── sellers/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       └── audit/page.tsx
├── components/
│   ├── DataTable.tsx
│   ├── ConfirmModal.tsx
│   ├── StatusBadge.tsx
│   ├── PageHeader.tsx
│   ├── EmptyState.tsx
│   └── ErrorBoundary.tsx
├── features/
│   └── sellers/
│       ├── SellerTable.tsx
│       ├── SellerActionModal.tsx
│       ├── SellerDetail.tsx
│       ├── DocumentsPanel.tsx     # Renders Cloudinary doc thumbnails, read-only
│       └── StatusTimeline.tsx
├── lib/
│   ├── api-client.ts             # Typed fetch + auto 401→refresh→retry
│   ├── server-fetch.ts
│   ├── nav-config.ts
│   └── hooks/useSession.ts
├── store/auth.store.ts            # Zustand — accessToken in memory only
└── middleware.ts                  # Edge auth guard
```

### DocumentsPanel.tsx (new component)

Client component. Receives `documents: ISellerDocument[]` as prop.
- Renders each doc as a card: type label + thumbnail image
- Clicking a thumbnail opens the Cloudinary URL in a new tab
- No upload or delete functionality — admin is read-only
- Shows upload date under each thumbnail

### Server vs Client Component rules

- `page.tsx` → always SC, fetch data server-side
- Forms, modals, onClick, useState → CC with `"use client"`
- Wrap tables in `<Suspense fallback={<TableSkeleton />}>` for streaming

---

## AdminJS Integration

### Role

Super_admin escape hatch — raw DB access, emergency corrections, user management. Ops team never uses this. Mounted at `/admin` on the API server.

### Packages

```
adminjs  @adminjs/express  @adminjs/mongoose  express-session  connect-mongo
```

### authenticate() — reuses admin_users collection

```typescript
authenticate: async (email, password) => {
  const user = await AdminUser.findOne({ email, isActive: true });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  if (![Role.SUPER_ADMIN, Role.OPS_ADMIN].includes(user.role)) return null;
  return { email: user.email, role: user.role, id: user._id.toString() };
}
```

### Resources

**sellers** — super_admin: full CRUD. ops_admin: list + show only. Documents field shown as clickable URLs. Custom action "Force status change" (super_admin only) → writes `admin.override` audit log.

**audit_logs** — both roles: list + show + filter only. `{ new: false, edit: false, delete: false, bulkDelete: false }`. Bulk "Export CSV" for super_admin.

**admin_users** — super_admin only. Hidden: passwordHash, refreshTokenHash. Custom "Deactivate" action → isActive: false, nulls refreshTokenHash (kills sessions immediately).

---

## Deployment

Both services deploy on **Render** from the same monorepo. Create two separate Render services pointing at different root directories.

### Render — Web Service: apps/api (Node.js API)

| Setting | Value |
|---|---|
| Service type | Web Service |
| Root directory | `apps/api` |
| Build command | `npm install && npm run build` |
| Start command | `npm run start` |
| Health check path | `/api/health` |
| Auto-deploy | Yes — on push to main |

Environment variables: all vars listed in the `apps/api` env section above.

Add a Render health check on `/api/health` — Render will restart the service automatically if it goes down.

### Render — Web Service: apps/web (Next.js)

| Setting | Value |
|---|---|
| Service type | Web Service |
| Root directory | `apps/web` |
| Build command | `npm install && npm run build` |
| Start command | `npm run start` |
| Auto-deploy | Yes — on push to main |

Environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-api-service.onrender.com
```

Note: Next.js on Render runs as a Node.js Web Service (not a static site) because it uses server components and server-side rendering. Do not deploy as a Static Site.

### Render — Free tier warning

Render free tier services spin down after 15 minutes of inactivity. For production, use at minimum the **Starter** plan ($7/month per service) to keep both services always-on.

### MongoDB Atlas
- M10+ replica set (required for Mongoose transactions)
- IP allowlist: add Render's outbound IP ranges, or set to 0.0.0.0/0 for initial setup then tighten
- Collections: sellers, audit_logs, admin_users

---

## Scalability Rules

1. New dashboard = one module in `modules/` + one page in `app/(admin)/` — nothing else changes
2. `audit_logs` insert-only — Mongoose pre-hooks block all mutations
3. `statusHistory` append-only — always `$push`, never `$set`
4. `metadata: Mixed` absorbs future fields with zero migration
5. RBAC is a factory — `requireRole(Role.OPS_ADMIN)` one line per route
6. `nav-config.ts` drives sidebar — one array push per new dashboard
7. `DataTable` column-config driven — every table reuses it
8. `AuditService.log()` stateless — callable from any service or AdminJS action
9. Intake endpoint is isolated in its own module — mobile app integration never touches admin API internals

---

## MVP Acceptance Criteria

- [ ] Mobile app POSTs to `/intake/seller` with API key → seller appears in pending list immediately
- [ ] Duplicate email returns 409 "Email already registered"
- [ ] Duplicate GST/Enrollment ID returns 409 "GST/Enrollment ID already registered"
- [ ] Pending list shows: Name, Business, GST/Enrollment ID, Phone, Email, Date Received, Time Received, Status, Actions
- [ ] Seller detail page shows all fields + document thumbnails (Cloudinary URLs, click to open)
- [ ] Approved/Rejected sellers do NOT appear in pending list
- [ ] Approve requires confirmation → seller removed from list → audit log written
- [ ] Reject requires confirmation + optional note → removed from list → audit log written
- [ ] Each seller actioned only once — 409 on second attempt
- [ ] Every action logged with actor + timestamp in audit_logs
- [ ] AdminJS at `/admin` — super_admin login only
- [ ] `/api/health` returns 200
