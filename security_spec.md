# SIPELKA Nagekeo Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Default-Deny Baseline**: Every path under `/databases/{database}/documents` is denied unless explicitly matched and authorized.
2. **Non-PII Shared Config (`settings/google_sheet`)**:
   - Only the singleton document ID `google_sheet` under `/settings/{settingId}` is accessible (`settingId == 'google_sheet'`).
   - `allow list` on `/settings` is strictly `false` so no collection enumeration is possible.
   - `allow get` on `/settings/google_sheet` is permitted so any authenticated SIPELKA user (Admin or Pimpinan) loading the static Shared App URL immediately resolves the active Google Spreadsheet & Apps Script Web App URL without needing a Google account for read-only Pimpinan access.
   - `settings/google_sheet` contains **no PII** (no names, emails, NIK, phones, or case data).
3. **Admin-Only Verified Writes**:
   - Creating, updating, or deleting `/settings/google_sheet` requires:
     1. Authenticated Firebase user (`request.auth != null`)
     2. Verified Google email (`request.auth.token.email_verified == true`)
     3. Trusted Admin privilege (`isAdmin()`: bootstrapped email `bidangpppanagekeo@gmail.com` or existing `/admins/$(request.auth.uid)` document)
     4. Strict key/type/size/pattern validation (`isValidSheetConfig`)
     5. Author UID binding (`updatedByUid == request.auth.uid`) and server timestamp enforcement (`request.time`).
4. **Admin Collection Protection (`/admins/{adminId}`)**:
   - Only readable by the owner (`request.auth.uid == adminId`) or bootstrapped super-admin.
   - Only writable by the bootstrapped super-admin (`bidangpppanagekeo@gmail.com` with `email_verified == true`) — prevents self-escalation.

## 2. Dirty Dozen Adversarial Payloads (Must All Return PERMISSION_DENIED)
1. **Unauthenticated Write**: Anonymous/unauthenticated `setDoc('/settings/google_sheet', ...)` -> Denied.
2. **Unverified Email Admin Spoof**: `auth.token.email == 'bidangpppanagekeo@gmail.com'` with `email_verified == false` writing `/settings/google_sheet` -> Denied.
3. **Non-Admin User Write**: Verified Google user `attacker@gmail.com` writing `/settings/google_sheet` -> Denied.
4. **Collection Enumeration**: Unauthenticated or authenticated `getDocs('/settings')` (`list`) -> Denied.
5. **Arbitrary Doc ID Poisoning**: Admin writing `/settings/other_doc_12345` or 1.5KB ID -> Denied (`settingId == 'google_sheet'`).
6. **Shadow / Ghost Field Injection**: Admin creating `/settings/google_sheet` with extra key `isAdmin: true` -> Denied (`hasOnly`).
7. **Author UID Spoofing**: Admin creating `/settings/google_sheet` with `updatedByUid: 'someone-else'` -> Denied (`updatedByUid == request.auth.uid`).
8. **Client Timestamp Forgery**: Admin writing `createdAt` or `updatedAt` != `request.time` -> Denied.
9. **Immortal Field Tampering**: Admin updating `/settings/google_sheet` while altering `createdAt` -> Denied (`incoming().createdAt == existing().createdAt`).
10. **URL / XSS Protocol Injection**: Admin setting `webhookUrl: 'javascript:alert(1)'` -> Denied (regex `^https?://.+`).
11. **Denial-of-Wallet Oversized String**: Admin setting `webhookUrl` > 1000 chars -> Denied (`.size() <= 1000`).
12. **Self-Assigned Admin Escalation**: Non-admin user creating `/admins/<ownUid>` with `role: 'admin'` -> Denied.
