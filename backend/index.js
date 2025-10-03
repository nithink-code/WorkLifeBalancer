require("dotenv").config();
require("./config/passport");
const express = require("express");
const app = express();

app.use(express.json());

const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authenticateJWT = require("./middleware/authenticateJWT");

// Routes
const authRoutes = require("./routes/auth");
const userPreferences = require("./routes/userPreference");
const tasks = require("./routes/tasks");
const pomodoro = require("./routes/pomodoro");
const moodCheckIn = require("./routes/mood");
const breakActivity = require("./routes/breakActivity");
const dashboard = require("./routes/dashboard");
const userRoutes = require("./routes/user");

// Error Handling
const errorHandler = require("./middleware/errorhandler");


const PORT = 8080;
const MONGOURL = process.env.MONGO_URL;

main()
 .then(()=>{
    console.log('Connected!')
 })
 .catch((err)=>{
    console.log("Error connecting DB!",err);
 });

async function main(){
    await mongoose.connect(MONGOURL);
}

app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true, // Allow frontend to access cookies
}));

app.use(
    session({
       secret:"mysecret",
       resave:false,
       saveUninitialized:true,
}));

app.use(passport.initialize());
app.use(passport.session());


// Routes Middleware
console.log("Registering routes...");

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

app.use("/auth",authRoutes);
app.use("/user",userPreferences);
app.use("/tasks",tasks);
app.use("/pomodoro",pomodoro);
app.use("/mood",moodCheckIn);
app.use("/break",breakActivity);
app.use("/dashboard",dashboard);
// app.use("/users",userRoutes); // Temporarily disabled
console.log("Routes registered successfully");

app.get('/api/verify', authenticateJWT, (req, res) => {
  res.json({ registered: true, user: req.user });
});

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("/*splat", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
});



// Error Middlware
app.use(errorHandler);

app.listen(PORT,()=>{
    console.log(`Listening to port ${PORT}.`);
});