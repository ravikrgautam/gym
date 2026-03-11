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

## Change 5 — Rename Dashboard Welcome Message
**File:** `app/src/pages/Dashboard.jsx`

Find:
```
<h2 className="fw-bold mb-2 tracking-tight">Welcome back, {gymData?.name || 'Admin'}! 👋</h2>
```
Replace with:
```
<h2 className="fw-bold mb-2 tracking-tight">Welcome back, Alpha Fitness Gym! 👋</h2>
```

---

## Change 6 — Add Dummy Members Data
**File:** `app/src/pages/Members.jsx`

In the `Members` component, find the line:
```
const [members, setMembers] = useState([]);
```
Replace with:
```
const [members, setMembers] = useState([
  { id: 1, name: 'Rohit Sharma', phone: '9876543210', status: 'ACTIVE', shift: 'Morning', current_plan_name: 'Monthly Plan', current_plan_fee: 1500, fee_status: 'Paid', plan_expiry_date: '2025-07-15', join_date: '2025-01-15' },
  { id: 2, name: 'Priya Mehta', phone: '9823456781', status: 'ACTIVE', shift: 'Evening', current_plan_name: 'Quarterly Plan', current_plan_fee: 3500, fee_status: 'Paid', plan_expiry_date: '2025-08-01', join_date: '2025-02-01' },
  { id: 3, name: 'Arjun Verma', phone: '9812345670', status: 'ACTIVE', shift: 'Morning', current_plan_name: 'Monthly Plan', current_plan_fee: 1500, fee_status: 'Paid', plan_expiry_date: '2025-06-20', join_date: '2025-03-20' },
  { id: 4, name: 'Sneha Patil', phone: '9898765432', status: 'INACTIVE', shift: 'Evening', current_plan_name: 'Monthly Plan', current_plan_fee: 1500, fee_status: 'Overdue', plan_expiry_date: '2025-05-10', join_date: '2024-12-10' },
  { id: 5, name: 'Karan Singh', phone: '9845671230', status: 'ACTIVE', shift: 'Both', current_plan_name: 'Annual Plan', current_plan_fee: 12000, fee_status: 'Paid', plan_expiry_date: '2026-01-01', join_date: '2025-01-01' },
  { id: 6, name: 'Deepika Nair', phone: '9867453210', status: 'ACTIVE', shift: 'Morning', current_plan_name: 'Quarterly Plan', current_plan_fee: 3500, fee_status: 'Paid', plan_expiry_date: '2025-09-15', join_date: '2025-03-15' },
  { id: 7, name: 'Amit Joshi', phone: '9834512678', status: 'INACTIVE', shift: 'Evening', current_plan_name: 'Monthly Plan', current_plan_fee: 1500, fee_status: 'Overdue', plan_expiry_date: '2025-04-30', join_date: '2025-01-30' },
  { id: 8, name: 'Meena Kapoor', phone: '9811234560', status: 'ACTIVE', shift: 'Morning', current_plan_name: 'Annual Plan', current_plan_fee: 12000, fee_status: 'Paid', plan_expiry_date: '2026-03-01', join_date: '2025-03-01' },
]);
```

Also find:
```
const [loading, setLoading] = useState(true);
```
(in Members.jsx only)
Replace with:
```
const [loading, setLoading] = useState(false);
```

---

## Change 7 — Add Dummy Classes Data
**File:** `app/src/pages/Classes.jsx`

Find:
```
const [classes, setClasses] = useState([]);
```
Replace with:
```
const [classes, setClasses] = useState([
  { id: 1, name: 'HIIT Training', trainer_name: 'Vikram Rao', start_time: '06:00', end_time: '07:00', capacity: 20, enrolled_count: 14 },
  { id: 2, name: 'Yoga Flow', trainer_name: 'Pooja Sharma', start_time: '07:15', end_time: '08:15', capacity: 15, enrolled_count: 15 },
  { id: 3, name: 'Zumba Dance', trainer_name: 'Neha Kulkarni', start_time: '08:30', end_time: '09:30', capacity: 25, enrolled_count: 18 },
  { id: 4, name: 'Strength & Conditioning', trainer_name: 'Vikram Rao', start_time: '17:00', end_time: '18:00', capacity: 12, enrolled_count: 8 },
  { id: 5, name: 'CrossFit Basics', trainer_name: 'Rahul Desai', start_time: '18:15', end_time: '19:15', capacity: 15, enrolled_count: 11 },
  { id: 6, name: 'Pilates Core', trainer_name: 'Pooja Sharma', start_time: '19:30', end_time: '20:30', capacity: 10, enrolled_count: 6 },
]);
```

Also find:
```
const [loading, setLoading] = useState(true);
```
(in Classes.jsx only)
Replace with:
```
const [loading, setLoading] = useState(false);
```

---

## Change 8 — Add Dummy Membership Plans Data
**File:** `app/src/pages/Plans.jsx`

Find:
```
const [plans, setPlans] = useState([]);
```
Replace with:
```
const [plans, setPlans] = useState([
  { id: 1, name: 'Monthly Plan', duration_months: 1, price: 1500 },
  { id: 2, name: 'Quarterly Plan', duration_months: 3, price: 3500 },
  { id: 3, name: 'Half-Yearly Plan', duration_months: 6, price: 6000 },
  { id: 4, name: 'Annual Plan', duration_months: 12, price: 12000 },
  { id: 5, name: 'Student Plan', duration_months: 1, price: 999 },
  { id: 6, name: 'Couple Plan', duration_months: 3, price: 5500 },
]);
```

Also find:
```
const [loading, setLoading] = useState(true);
```
(in Plans.jsx only)
Replace with:
```
const [loading, setLoading] = useState(false);
```

---

## Change 9 — Add Dummy Trainers Data
**File:** `app/src/pages/Trainers.jsx`

Find:
```
const [trainers, setTrainers] = useState([]);
```
Replace with:
```
const [trainers, setTrainers] = useState([
  { id: 1, name: 'Vikram Rao', phone: '9871234560', specialty: 'Strength & HIIT' },
  { id: 2, name: 'Pooja Sharma', phone: '9845678901', specialty: 'Yoga & Pilates' },
  { id: 3, name: 'Rahul Desai', phone: '9823456780', specialty: 'CrossFit & Cardio' },
  { id: 4, name: 'Neha Kulkarni', phone: '9867890123', specialty: 'Zumba & Dance Fitness' },
]);
```

Also find:
```
const [loading, setLoading] = useState(true);
```
(in Trainers.jsx only)
Replace with:
```
const [loading, setLoading] = useState(false);
```

---

## Change 10 — Add Dummy Attendance Data
**File:** `app/src/pages/Attendance.jsx`

Find:
```
const [attendanceList, setAttendanceList] = useState([]);
```
Replace with:
```
const [attendanceList, setAttendanceList] = useState([
  { id: 1, member_id: 1, member_name: 'Rohit Sharma', date: '2025-06-12', check_in_time: '06:05', shift: 'Morning', method: 'MANUAL' },
  { id: 2, member_id: 2, member_name: 'Priya Mehta', date: '2025-06-12', check_in_time: '17:10', shift: 'Evening', method: 'MANUAL' },
  { id: 3, member_id: 3, member_name: 'Arjun Verma', date: '2025-06-12', check_in_time: '06:30', shift: 'Morning', method: 'QR' },
  { id: 4, member_id: 5, member_name: 'Karan Singh', date: '2025-06-12', check_in_time: '07:00', shift: 'Morning', method: 'MANUAL' },
  { id: 5, member_id: 6, member_name: 'Deepika Nair', date: '2025-06-12', check_in_time: '06:15', shift: 'Morning', method: 'QR' },
  { id: 6, member_id: 8, member_name: 'Meena Kapoor', date: '2025-06-12', check_in_time: '17:45', shift: 'Evening', method: 'MANUAL' },
  { id: 7, member_id: 1, member_name: 'Rohit Sharma', date: '2025-06-11', check_in_time: '06:10', shift: 'Morning', method: 'MANUAL' },
  { id: 8, member_id: 3, member_name: 'Arjun Verma', date: '2025-06-11', check_in_time: '06:45', shift: 'Morning', method: 'MANUAL' },
  { id: 9, member_id: 2, member_name: 'Priya Mehta', date: '2025-06-11', check_in_time: '17:20', shift: 'Evening', method: 'QR' },
  { id: 10, member_id: 5, member_name: 'Karan Singh', date: '2025-06-11', check_in_time: '18:00', shift: 'Evening', method: 'MANUAL' },
]);
```

Also find:
```
const [loading, setLoading] = useState(true);
```
(in Attendance.jsx only)
Replace with:
```
const [loading, setLoading] = useState(false);
```

---

## Status Checklist
- [ ] Change 1 — Brand name in sidebar (App.jsx)
- [ ] Change 2 — Nav label Member Base → Members (App.jsx)
- [ ] Change 3 — Default gym name (App.jsx)
- [ ] Change 4 — Members page heading (Members.jsx)
- [ ] Change 5 — Dashboard welcome message (Dashboard.jsx)
- [ ] Change 6 — Dummy Members data (Members.jsx)
- [ ] Change 7 — Dummy Classes data (Classes.jsx)
- [ ] Change 8 — Dummy Membership Plans data (Plans.jsx)
- [ ] Change 9 — Dummy Trainers data (Trainers.jsx)
- [ ] Change 10 — Dummy Attendance data (Attendance.jsx)
