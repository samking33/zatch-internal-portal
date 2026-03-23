# Codex Prompt — Zatch Admin Portal

## How to use

Paste everything below the horizontal rule into Codex. Attach `zatch-architecture.md` as context. Build phase by phase — complete and verify each phase before starting the next.

---

You are building **Zatch Admin Portal** — a production-ready internal admin system for reviewing and approving seller onboarding requests submitted via a mobile app. The full architecture, schemas, routes, and component design are in `zatch-architecture.md`. Read it fully before writing a single line of code.

## Your role

Senior full-stack TypeScript engineer. Write complete, production-quality code. No placeholders, no `// TODO`, no `any` types. Every file must be runnable as written.

## Non-negotiable rules

1. **`zatch-architecture.md` is the source of truth.** Folder names, file names, field names, route paths, middleware order — all defined there. Do not deviate.
2. **TypeScript strict mode everywhere.** No `any`. All types come from `packages/shared`.
3. **Zod validates all inputs.** Both the intake endpoint (mobile app) and admin API routes. Use the shared schemas.
4. **Two completely separate auth systems:**
   - Mobile app → `X-API-Key` header → `requireApiKey` middleware → `/intake/*` routes only
   - Admin users → JWT Bearer token → `auth.middleware` → `/api/*` routes only
   - These must never be mixed. The intake endpoint does NOT use JWT. The admin API does NOT accept API keys.
5. **Mongoose session (transaction) on approve/reject.** Status update + audit log must be atomic. Both succeed or both roll back.
6. **`audit_logs` is insert-only.** Pre-hooks on `findOneAndUpdate`, `updateOne`, `updateMany` must throw. No edit or delete routes ever.
7. **`statusHistory` is append-only.** Always `$push`, never `$set` or `$pull`.
8. **Never expose `passwordHash` or `refreshTokenHash`.** Strip in Mongoose `toJSON` transform. Never log them. Never return them in any API response.
9. **Refresh token in httpOnly cookie only.** Access token returned in response body. Neither token ever goes in localStorage or sessionStorage.
10. **Access token in Zustand memory store only** on the frontend — not localStorage, not sessionStorage.
11. **Server Components fetch data.** Client Components handle interaction only. Never useEffect-fetch in a Client Component unless triggered by user action.
12. **Every mutation in AdminJS must call AuditService.log().** Audit trail must be complete regardless of whether the action came via the REST API or AdminJS.
13. **Intake endpoint is isolated in `modules/intake/`.** It shares the Seller model but has no coupling to the admin-facing seller routes.

## Build order

Build in this exact sequence. Complete and manually verify each phase before moving on.

### Phase 1 — Monorepo foundation
1. Root `package.json` — npm workspaces: `["apps/*", "packages/*"]`
2. `turbo.json` — pipeline: build, dev, lint, typecheck
3. `packages/shared` — all types, Zod schemas, date utils, package.json, tsconfig
4. Confirm `packages/shared` builds and exports correctly

### Phase 2 — API core infrastructure
5. `apps/api` scaffold — `package.json`, `tsconfig.json`, `app.ts`
6. `config/env.ts` — Zod-parsed typed env (include `MOBILE_API_KEY`)
7. `config/db.ts` — Mongoose connect with retry and connection event logging
8. `middleware/logger.middleware.ts` — Winston: method, path, status, duration per request
9. `middleware/auth.middleware.ts` — JWT verify, attach `req.user`, 401 on failure
10. `middleware/apiKey.middleware.ts` — X-API-Key verify against env, 401 on failure
11. `middleware/rbac.middleware.ts` — `requireRole(...roles)` factory, 403 on failure
12. `middleware/validate.middleware.ts` — Zod schema validation, 400 with field errors

### Phase 3 — Auth module
13. `modules/auth/auth.model.ts` — admin_users Mongoose schema with toJSON transform
14. `modules/auth/auth.service.ts` — login, refresh, logout, bcrypt, JWT sign/verify
15. `modules/auth/auth.routes.ts` — POST /login, /refresh, /logout, GET /me
16. Mount auth routes in `app.ts`, test all four endpoints

### Phase 4 — Audit module (foundation for everything else)
17. `modules/audit/audit.model.ts` — immutable schema with pre-hooks
18. `modules/audit/audit.repository.ts` — insertLog() only, no update/delete methods
19. `modules/audit/audit.service.ts` — `log({ action, adminUserId, adminUserEmail, targetId, targetCollection, note, metadata })` — callable with null adminUserId for system actions

### Phase 5 — Sellers module (admin-facing)
20. `modules/sellers/seller.model.ts` — full schema including documents sub-schema, statusHistory, source field
21. `modules/sellers/seller.repository.ts` — findPending(), findById(), updateStatus()
22. `modules/sellers/seller.service.ts` — updateStatus() with Mongoose session transaction
23. `modules/sellers/seller.routes.ts` — GET /sellers, GET /sellers/:id, PATCH /sellers/:id/status

### Phase 6 — Intake module (mobile app-facing)
24. `modules/intake/intake.routes.ts` — POST /intake/seller
    - Auth: `requireApiKey` middleware
    - Rate limit: 20 req/min per IP (use `express-rate-limit`)
    - Validate: `sellerIntakeSchema`
    - Duplicate check: email → 409, gstOrEnrollmentId → 409
    - Create seller: status=pending, source=mobile_app
    - AuditService.log with adminUserId=null, adminUserEmail='system'
    - Return 201 { success: true, data: { sellerId, status, receivedAt } }

### Phase 7 — Remaining admin modules
25. `modules/audit/audit.routes.ts` — GET /api/audit, GET /api/audit/:targetId (with filters)
26. `modules/admin-users/admin-users.service.ts` + `admin-users.routes.ts`
27. `GET /api/health` route — { status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }
28. Mount all routers in `app.ts` in correct order:
    - `/intake` routes FIRST (uses requireApiKey, NOT auth.middleware)
    - `/api/auth` routes (public)
    - `/api/*` routes (all use auth.middleware)
    - AdminJS LAST

### Phase 8 — AdminJS
29. Install: `adminjs @adminjs/express @adminjs/mongoose express-session connect-mongo`
30. `adminjs/resources.ts` — sellers, audit_logs, admin_users with correct role-based permissions
31. `adminjs/setup.ts` — AdminJS init, session with connect-mongo, authenticate() reusing admin_users
32. Mount AdminJS router in `app.ts`
33. Verify `/admin` login works

### Phase 9 — Next.js web
34. `apps/web` scaffold — `next.config.js`, `tsconfig.json`, `package.json`
35. `middleware.ts` — Edge: protect `/(admin)/*`, redirect to /login if no cookie
36. `store/auth.store.ts` — Zustand: accessToken in memory only
37. `lib/api-client.ts` — typed fetch + 401→refresh→retry cycle
38. `lib/server-fetch.ts` — server-side fetch with cookie forwarding
39. `lib/nav-config.ts` — nav array
40. `lib/hooks/useSession.ts` — reads SessionProvider context
41. Shared components: `DataTable`, `ConfirmModal`, `StatusBadge`, `PageHeader`, `EmptyState`, `ErrorBoundary`
42. `(auth)/login/page.tsx` + `LoginForm.tsx`
43. `(admin)/layout.tsx` + `Sidebar.tsx` + `Topbar.tsx` + `SessionProvider.tsx`
44. `(admin)/sellers/page.tsx` — SC, server fetch pending sellers, Suspense wrapper
45. `features/sellers/SellerTable.tsx` + `SellerActionModal.tsx`
46. `(admin)/sellers/[id]/page.tsx` — SC, fetch single seller
47. `features/sellers/SellerDetail.tsx` + `DocumentsPanel.tsx` + `StatusTimeline.tsx`
48. `(admin)/audit/page.tsx` + `AuditTable.tsx`

### Phase 10 — End-to-end verification
49. Simulate mobile app: POST /intake/seller with valid API key + payload → verify 201 + seller in DB
50. Try duplicate email → verify 409
51. Try missing API key → verify 401
52. Login as ops_admin → view pending sellers list → seller from step 49 appears
53. Open seller detail → documents panel shows thumbnails
54. Approve seller → confirm modal → seller disappears from list → audit log entry created
55. Try to approve same seller again → verify 409
56. Reject a different seller with a note → verify statusHistory has note
57. Check audit log page → both actions appear
58. Login to /admin as super_admin → view sellers and audit logs
59. Verify /api/health returns 200

## Code quality standards

- All async route handlers: `try/catch` → `next(error)`. Never `res.json()` inside catch.
- Global error handler in `app.ts` — catches all `next(error)` calls, returns consistent `{ success: false, error: string }` shape
- Winston logs every request and every error with stack trace
- Sentry captures all unhandled exceptions
- Read-only Mongoose queries use `.lean()` for performance
- All list endpoints paginated: default `page=1`, `limit=20`, max `limit=100`
- Consistent response shape: `{ success: true, data: {...} }` or `{ success: false, error: "message", details?: any }`

## What NOT to do

- Do not use `any` type
- Do not use `console.log` — use Winston logger
- Do not put business logic in route handlers
- Do not put DB queries in service files — use repository layer
- Do not mix API key auth and JWT auth on the same route
- Do not store tokens in localStorage or sessionStorage
- Do not make ops team use AdminJS — it is super_admin only
- Do not build a second user system for AdminJS — reuse admin_users
- Do not skip the Mongoose transaction on approve/reject
- Do not add update/delete routes for audit_logs
- Do not return passwordHash or refreshTokenHash in any response or log

## Reference

Full spec: `zatch-architecture.md`. If something is not covered, choose the most conservative, explicit, and type-safe option.
