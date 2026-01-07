# Attendance App — Run & Usage Guide

This project is a **mobile-first attendance system** built with an **Expo (React Native) frontend** and a **Node.js + Express backend**.  
Attendance is recorded during **time-bound class sessions**, with **face-based verification** and **geofencing** support.

---

## 🧩 High-Level Concept

- **Admins** create users, classes, and attendance sessions.
- **Students** enroll their face once and mark attendance **only during active sessions**.
- Attendance is valid **only if**:
  - The session is active
  - The student belongs to the class
  - Face enrollment is completed
  - The student is within the geofence (if enabled)

---

## Backend (Node.js + Express)

### Prerequisites
- Node.js **18+**
- MongoDB (local or cloud, e.g. MongoDB Atlas)

---

### Setup

```bash
cd backend
cp .env.sample .env
# On Windows PowerShell:
# Copy-Item .env.sample .env
```

Edit `.env` and configure:
- `PORT`
- `MONGODB_URI`
- `CORS_ORIGIN`
- JWT/token secrets
- (Optional) Cloudinary keys if enabled

---

### Install & Run

```bash
npm install
npm run dev
```

- Uses **nodemon** for hot reload
- API base URL:
  ```
  http://<your-host>:<PORT>/api
  ```

---

### Default Admin (Important)

- On **first backend startup**, a **default admin account is auto-created** (if no admin exists).
- **email: "testadmin@test.com", password: "admin123"**. use these to login as admin. 
- Use this admin account to:
  1. Create student users
  2. Create classes
  3. Add students to classes
  4. Create attendance sessions

> ⚠️ Students cannot function independently without admin setup.

---

## Frontend (Expo + React Native)

### Prerequisites
- Node.js installed
- **Expo Go** app installed on your Android / iOS device

---

### Configure Backend URL

Edit `config.ts` (or equivalent config file) and point it to your backend:

```ts
export const API_BASE_URL = "http://<your-host>:<PORT>/api";
```

> 💡 When testing on a phone, use your **PC’s local IP address**, not `localhost`.

---

### Install & Run

```bash
cd frontend
npm install
npx expo start
```

- A **QR code** will appear in the terminal or browser
- Scan it using the **Expo Go** app
- The app will load on your phone **without installing an APK**

---

## 📱 How to Use the App (First-Time Flow)

### 👨‍🏫 Admin Flow (Required First)

1. Log in with the **default admin account**
2. Create **Student users**
3. Create a **Class**
4. Add students to the class
5. Create a **Session**:
   - Set start & end time
   - Optionally enable **geofence** (location + radius)

> A session is considered **active only during its time window**.

---

### 👨‍🎓 Student Flow

1. Log in with student credentials (created by admin)
2. **Enroll face** (one-time requirement)
3. Wait for an **active session**
4. Mark attendance during the session:
   - Camera permission required
   - Must be within geofence (if enabled)

> ⚠️ If face enrollment is not completed, attendance cannot be marked.

---

## 🔐 Important Notes & Constraints

- Face enrollment is **mandatory before attendance**
- Attendance can be marked **only once per session**
- Attendance outside an active session window is rejected
- Geofence violations will reject attendance
- Face images are **not stored** — only verification results / embeddings

---



## 🛠 Tech Stack

- **Frontend**: Expo (React Native)
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **Attendance Logic**: Session-based + geofence-aware
- **Face Verification**: Backend-driven (no images stored)

---

## 📌 Summary

This app demonstrates:
- Role-based workflows (Admin vs Student)
- Time-bound attendance sessions
- Privacy-conscious face verification
- Real-world constraints like geofencing and permissions
- Mobile-first UX suitable for classrooms and institutions
