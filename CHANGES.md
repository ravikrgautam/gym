# GymSuite Pro — Pending UI Changes

> These changes are NOT yet applied to the code.
> Apply them manually or paste into Antigravity when ready.

---

## Change 1 — Rename App Brand Name in Sidebar
**File:** `app/src/App.jsx`

Find:
```
<span className="fs-4 fw-bold tracking-tight">GymSuite Pro</span>
```
Replace with:
```
<span className="fs-4 fw-bold tracking-tight">Alpha Fitness Gym</span>
```

---

## Change 2 — Rename Sidebar Nav Label "Member Base" → "Members"
**File:** `app/src/App.jsx`

Find:
```
{ path: '/members', label: 'Member Base', icon: Users },
```
Replace with:
```
{ path: '/members', label: 'Members', icon: Users },
```

---

## Change 3 — Rename Default Gym Name in App State
**File:** `app/src/App.jsx`

Find:
```
name: 'Demo Gym Workspace',
```
Replace with:
```
name: 'Alpha Fitness Gym',
```

---

## Change 4 — Rename Members Page Heading
**File:** `app/src/pages/Members.jsx`

Find:
```
<Users className="text-primary" /> Member Base
```
Replace with:
```
<Users className="text-primary" /> Members
```

---

## Status Checklist
- [ ] Change 1 — Brand name in sidebar (App.jsx)
- [ ] Change 2 — Nav label Member Base → Members (App.jsx)
- [ ] Change 3 — Default gym name (App.jsx)
- [ ] Change 4 — Members page heading (Members.jsx)
