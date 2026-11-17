/**
 * Phase 0 Dirty Dozen Security Test Expectations for SIPELKA Firestore Rules
 * Verifies all 12 adversarial payloads against the Eight Pillars policy.
 */
export interface AdversarialPayloadCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: AdversarialPayloadCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Write to settings/google_sheet',
    operation: 'create',
    path: '/settings/google_sheet',
    auth: null,
    payload: {
      sheetUrl: 'https://docs.google.com/spreadsheets/d/abc/edit',
      webhookUrl: 'https://script.google.com/macros/s/abc/exec',
      autoSync: true,
      updatedByUid: 'anon'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 2,
    name: 'Unverified Email Admin Spoof',
    operation: 'create',
    path: '/settings/google_sheet',
    auth: { uid: 'uid-spoof', email: 'bidangpppanagekeo@gmail.com', email_verified: false },
    payload: {
      sheetUrl: 'https://docs.google.com/spreadsheets/d/abc/edit',
      webhookUrl: 'https://script.google.com/macros/s/abc/exec',
      autoSync: true,
      updatedByUid: 'uid-spoof'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 3,
    name: 'Non-Admin Verified User Write',
    operation: 'update',
    path: '/settings/google_sheet',
    auth: { uid: 'uid-attacker', email: 'attacker@gmail.com', email_verified: true },
    payload: {
      webhookUrl: 'https://evil.example.com/hook'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 4,
    name: 'Settings Collection List Enumeration',
    operation: 'list',
    path: '/settings',
    auth: { uid: 'uid-admin', email: 'bidangpppanagekeo@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 5,
    name: 'Arbitrary Setting Document ID Poisoning',
    operation: 'create',
    path: '/settings/arbitrary_doc_id',
    auth: { uid: 'uid-admin', email: 'bidangpppanagekeo@gmail.com', email_verified: true },
    payload: {
      sheetUrl: '',
      webhookUrl: 'https://script.google.com/macros/s/abc/exec',
      autoSync: true,
      updatedByUid: 'uid-admin'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 6,
    name: 'Shadow / Ghost Field Injection',
    operation: 'create',
    path: '/settings/google_sheet',
    auth: { uid: 'uid-admin', email: 'bidangpppanagekeo@gmail.com', email_verified: true },
    payload: {
      sheetUrl: '',
      webhookUrl: 'https://script.google.com/macros/s/abc/exec',
      autoSync: true,
      updatedByUid: 'uid-admin',
      ghostAdminFlag: true
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 7,
    name: 'Author UID Spoofing on Write',
    operation: 'create',
    path: '/settings/google_sheet',
    auth: { uid: 'uid-admin', email: 'bidangpppanagekeo@gmail.com', email_verified: true },
    payload: {
      sheetUrl: '',
      webhookUrl: 'https://script.google.com/macros/s/abc/exec',
      autoSync: true,
      updatedByUid: 'different-uid'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 8,
    name: 'Client Timestamp Forgery',
    operation: 'create',
    path: '/settings/google_sheet',
    auth: { uid: 'uid-admin', email: 'bidangpppanagekeo@gmail.com', email_verified: true },
    payload: {
      sheetUrl: '',
      webhookUrl: 'https://script.google.com/macros/s/abc/exec',
      autoSync: true,
      updatedByUid: 'uid-admin',
      createdAt: '2020-01-01T00:00:00Z',
      updatedAt: '2020-01-01T00:00:00Z'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 9,
    name: 'Immortal createdAt Field Mutation on Update',
    operation: 'update',
    path: '/settings/google_sheet',
    auth: { uid: 'uid-admin', email: 'bidangpppanagekeo@gmail.com', email_verified: true },
    payload: {
      createdAt: 'altered-timestamp'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 10,
    name: 'Javascript Protocol Injection in webhookUrl',
    operation: 'update',
    path: '/settings/google_sheet',
    auth: { uid: 'uid-admin', email: 'bidangpppanagekeo@gmail.com', email_verified: true },
    payload: {
      webhookUrl: 'javascript:alert(1)'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 11,
    name: 'Oversized String Denial-of-Wallet Payload',
    operation: 'update',
    path: '/settings/google_sheet',
    auth: { uid: 'uid-admin', email: 'bidangpppanagekeo@gmail.com', email_verified: true },
    payload: {
      webhookUrl: 'https://script.google.com/' + 'a'.repeat(1200)
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 12,
    name: 'Self-Assigned Admin Escalation',
    operation: 'create',
    path: '/admins/uid-attacker',
    auth: { uid: 'uid-attacker', email: 'attacker@gmail.com', email_verified: true },
    payload: {
      email: 'attacker@gmail.com',
      role: 'admin'
    },
    expected: 'PERMISSION_DENIED'
  }
];
