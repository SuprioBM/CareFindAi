import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
dotenv.config();

const app = express();
const PORT = 5000;
import connectDB from "./config/db.js";

connectDB();

app.use(cookieParser());
app.use(helmet());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use(json());

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from Express" });
});

app.use("/api/auth", authRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
