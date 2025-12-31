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

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/admin", adminRoutes);

export {app};