# Attendance App — Run Instructions

Minimal steps to run the backend API and the Expo frontend.

## Backend (Node.js)

- Prerequisites: Node.js 18+, MongoDB connection string
- Setup env:

```bash
cd backend
cp .env.sample .env    # On Windows PowerShell: Copy-Item .env.sample .env
# Edit .env and set PORT, MONGODB_URI, CORS_ORIGIN, token secrets, Cloudinary keys
```

- Install and run:

```bash
npm install
npm run dev    # hot reload with nodemon

```

API base will be `http://<your-host>:<PORT>/api`.

## Frontend (Expo + React Native)

- Point app to backend API:
Point the url in config.ts to ur backend api and enjoy
 
- Install and run:

```bash
cd frontend
npm install
npx expo start

```
You will get a qr code , scan the qr with Expo Go and it will build the app in your phone without download.
