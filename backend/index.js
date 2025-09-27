require("dotenv").config();
require("./config/passport");
const express = require("express");
const app = express();
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
const userRoutes = require("./models/userModel");

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

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
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
app.use("/auth",authRoutes);
app.use("/user",userPreferences);
app.use("/tasks",tasks);
app.use("/pomodoro",pomodoro);
app.use("/mood",moodCheckIn);
app.use("/break",breakActivity);
app.use("/dashboard",dashboard);
app.use("/users",userRoutes);

app.get('/api/verify', authenticateJWT, (req, res) => {
  res.json({ registered: true, user: req.user });
});

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});



// Error Middlware
app.use(errorHandler);

app.listen(PORT,()=>{
    console.log(`Listening to port ${PORT}.`);
});