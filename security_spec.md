# Security Specification: Colégio Estadual José Carneiro de Brito - Multimídia

## 1. Data Invariants
- `bookingId` must be a valid alphanumeric identifier with length <= 128 (`^[a-zA-Z0-9_\\-]+$`).
- Every booking document must include: `id`, `teacherName`, `subject`, `classGroup`, `date`, `shift`, `periods`, `equipments`, `location`, `purpose`, `status`, and `createdAt`.
- `shift` must be strictly `'Matutino'` or `'Vespertino'`.
- `location` must be strictly `'Biblioteca'`, `'Laboratório'`, `'Sala de Aula'`, or `'Auditório/Pátio'`.
- `status` must be strictly `'CONFIRMADO'`, `'EM_USO'`, `'CONCLUIDO'`, or `'CANCELADO'`.
- `periods` and `equipments` must be lists with at least 1 item and maximum 20 items.
- Strings must have bounded maximum sizes to prevent Denial-of-Wallet payload bloat.

## 2. The "Dirty Dozen" Payloads (Must Be Rejected)
1. Missing required field `teacherName`.
2. Oversized `purpose` field (> 500 characters).
3. Invalid `shift` value (e.g., `'Noturno'`).
4. Invalid `status` value (e.g., `'PENDING'`).
5. Empty `periods` list.
6. Empty `equipments` list.
7. Injection of malicious script in `id`.
8. Unallowed arbitrary extra keys (Ghost fields like `isAdmin: true` or `dropTable: true`).
9. Unauthenticated read/write when authentication is active, or unverified writes.
10. Malformed date string (not matching `^\d{4}-\d{2}-\d{2}$`).
11. Negative or non-array `periods`.
12. Attempt to tamper with immutable creation metadata.

## 3. Rules Implementation
- Default-deny catch-all at root.
- Standalone `isValidBooking(data)` helper enforcing exact keys and property bounds.
- Allow read for school timetable viewers.
- Allow create and update when payload satisfies strict validation.
