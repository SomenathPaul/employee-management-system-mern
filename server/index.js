require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();
connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" }));
app.use('/uploads', express.static('uploads'));

// routes
app.use("/api", require("./routes/auth"));

app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/settings", settingsRoutes);


app.use("/api/manager/tasks", require("./routes/manager/taskRoutes"));


const managerNotifications = require("./routes/manager/notificationRoutes");
const publicNotifications = require("./routes/notificationPublicRoutes");

app.use("/api/manager/notifications", managerNotifications);
app.use("/api/notifications", publicNotifications); // authenticated public view for employees


// notification uploads
const path = require("path");
// serve notification uploads
app.use("/notification_uploads", express.static(path.join(__dirname, "notification_uploads")));




const managerUserRoutes = require("./routes/manager/userRoutes");
// for user management for manager
app.use("/api/manager", managerUserRoutes);

// server/app.js (or server.js)
const managerLeaveRoutes = require("./routes/manager/leaveRoutes");
app.use("/api/manager/", managerLeaveRoutes);
app.use("/api/manager/leaves", managerLeaveRoutes);



// Protected user routes
app.use("/api/user", require("./routes/user"));

const authMiddleware = require("./middleware/authMiddleware");
app.get("/api/me", authMiddleware, async (req, res) => {
  res.json({ userId: req.user.userId, role: req.user.role });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
