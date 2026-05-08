import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import createError from "http-errors";
import apiRoutes from "./routes/apiRoutes.js";
import { isAllowedOrigin } from "./utils/origin.js";

const app = express();
app.set("trust proxy", 1);

/* -------------------- Logger (first) -------------------- */
// app.use(
//   pinoHttp({
//     level: process.env.LOG_LEVEL || "info",
//     transport:
//       process.env.NODE_ENV !== "production"
//         ? { target: "pino-pretty", options: { colorize: true } }
//         : undefined,
//   }),
// );
/* -------------------- Security -------------------------- */
app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests without an Origin header.
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);

      return callback(new Error("CORS blocked (invalid origin)"));
    },
    credentials: true,
  }),
);


app.get("/test-cookie", (req, res) => {
  res.cookie("test", "hello", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  res.send("cookie set");
});

app.get("/check-cookie", (req, res) => {
  res.json(req.cookies);
});
/* -------------------- Parsers --------------------------- */
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* -------------------- Routes ---------------------------- */
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from Express" });
});

app.use("/api/v1", apiRoutes);


/* -------------------- 404 ------------------------------- */
app.use((req, res, next) => next(createError(404, "Route not found")));

/* -------------------- Global Error Handler -------------- */
app.use((err, req, res, next) => {
  req.log?.error({ err }, "Unhandled error");

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
