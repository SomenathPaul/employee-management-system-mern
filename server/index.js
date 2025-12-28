// // server/index.js
// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const connectDB = require("./config/db");
// const attendanceRoutes = require("./routes/attendanceRoutes");
// const leaveRoutes = require("./routes/leaveRoutes");
// const settingsRoutes = require("./routes/settingsRoutes");

// const app = express();
// connectDB();

// app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
// app.use(express.json({ limit: "10mb" }));
// app.use('/uploads', express.static('uploads'));

// // routes
// app.use("/api", require("./routes/auth"));

// app.use("/api/attendance", attendanceRoutes);
// app.use("/api/leaves", leaveRoutes);
// app.use("/api/settings", settingsRoutes);


// app.use("/api/manager/tasks", require("./routes/manager/taskRoutes"));
// app.use("/api/employee", require("./routes/employee/taskRoutes"));
// app.use("/task-files", express.static("task-files"));


// const http = require("http");
// // for messages routes
// app.use("/api/users", require("./routes/user.routes"));
// app.use("/api/messages", require("./routes/message.routes"));

// // socket
// require("./socket")(server);



// const managerNotifications = require("./routes/manager/notificationRoutes");
// const publicNotifications = require("./routes/notificationPublicRoutes");

// app.use("/api/manager/notifications", managerNotifications);
// app.use("/api/notifications", publicNotifications); // authenticated public view for employees


// // notification uploads
// const path = require("path");
// // serve notification uploads
// app.use("/notification_uploads", express.static(path.join(__dirname, "notification_uploads")));




// const managerUserRoutes = require("./routes/manager/userRoutes");
// // for user management for manager
// app.use("/api/manager", managerUserRoutes);

// // server/app.js (or server.js)
// const managerLeaveRoutes = require("./routes/manager/leaveRoutes");
// app.use("/api/manager/", managerLeaveRoutes);
// app.use("/api/manager/leaves", managerLeaveRoutes);



// // Protected user routes
// app.use("/api/user", require("./routes/user"));

// const authMiddleware = require("./middleware/authMiddleware");
// app.get("/api/me", authMiddleware, async (req, res) => {
//   res.json({ userId: req.user.userId, role: req.user.role });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");

const connectDB = require("./config/db");

const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const managerNotifications = require("./routes/manager/notificationRoutes");
const publicNotifications = require("./routes/notificationPublicRoutes");

const managerUserRoutes = require("./routes/manager/userRoutes");
const managerLeaveRoutes = require("./routes/manager/leaveRoutes");

const authMiddleware = require("./middleware/authMiddleware");

const app = express();

/* ================= DB ================= */
connectDB();


app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));


// ================= EMAIL OTP ROUTES =================
// const emailRoutes = require("./routes/emailRoutes");
// app.use("/api/email", emailRoutes);
 const authRoute = require("./routes/auth");
 app.use("/api/auth", authRoute);


/* ================= MIDDLEWARE ================= */
// app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));


app.use(express.json({ limit: "10mb" }));

app.use("/uploads", express.static("uploads"));
app.use("/task-files", express.static("task-files"));
app.use(
  "/notification_uploads",
  express.static(path.join(__dirname, "notification_uploads"))
);

/* ================= ROUTES ================= */
app.use("/api", require("./routes/auth"));

// for attendance
app.use("/api/attendance", require("./routes/attendanceRoutes"));


// manager attendance routes
app.use("/api/manager/attendance", require("./routes/manager/attendanceRoutes"));

app.use(
  "/api/manager/analytics",
  require("./routes/manager/analyticsRoutes")
);

app.use("/api/leaves", leaveRoutes);
app.use("/api/settings", settingsRoutes);

app.use("/api/manager/tasks", require("./routes/manager/taskRoutes"));
app.use("/api/employee", require("./routes/employee/taskRoutes"));

/* 🔹 Chat routes */
app.use("/api/users/", require("./routes/messages/user.routes"));
app.use("/api/messages", require("./routes/messages/message.routes"));

/* 🔹 Notifications */
app.use("/api/manager/notifications", managerNotifications);
app.use("/api/notifications", publicNotifications);

/* 🔹 Manager user & leave management */
app.use("/api/manager", managerUserRoutes);
app.use("/api/manager/leaves", managerLeaveRoutes);

/* 🔹 Auth check */
app.get("/api/me", authMiddleware, async (req, res) => {
  res.json({ userId: req.user.userId, role: req.user.role });
});

/* ================= SERVER + SOCKET ================= */
const server = http.createServer(app);

// Socket.IO bootstrapping
require("./socket")(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
