import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();


app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
))
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

import userRoutes from "./routes/user.routes.js";
import studentRoutes from "./routes/student.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import classRoutes from "./routes/class.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import faceDataRoutes from "./routes/faceData.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";

app.use("/api/attendance", attendanceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/classes", classRoutes);   
app.use("/api/sessions", sessionRoutes);
app.use("/api/face-data", faceDataRoutes);


export {app};