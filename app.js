const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const path = require("path");
const AppError = require("./backend/utils/appError");
const {
  extractJWTCookieToHeader,
} = require("./backend/utils/customMiddleware");
const globalErrorHandler = require("./backend/controllers/errorController");

const userRouter = require("./backend/routes/userRoutes");
const courseRouter = require("./backend/routes/courseRoutes");
const professorRouter = require("./backend/routes/professorRoutes");
const reviewRouter = require("./backend/routes/reviewRoutes");

const app = express();

// middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.options("*", cors());
app.use(helmet()); // Set security HTTP headers

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // middleware for logging
}

const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter); // Rate limiter
app.use(express.json({ limit: "10kb" })); // Body parser
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
app.use(xss()); // Data sanitization against XSS

app.use(hpp()); // Prevent parameter pollution
app.use(extractJWTCookieToHeader()); // extract jwt cookie and set authorization header
app.use(compression());

// routes
app.use("/api/v1/users", userRouter); // connects user/auth routes
app.use("/api/v1/courses", courseRouter); // connects course routes
app.use("/api/v1/professors", professorRouter); // connects professor routes
app.use("/api/v1/reviews", reviewRouter); // connects professor routes

// Serving static files
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "frontend", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}

// handles unknown routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// connects error handler
app.use(globalErrorHandler);

module.exports = app;
