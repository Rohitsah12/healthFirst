import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

const app = express();
import { config } from "./config/index.js";
import router from './routes/index.js'

app.use(cors({
    origin: config.frontend_url,
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api',router);

import { errorHandler } from "./middlewares/error.middleware.js";


app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
    res.status(200).json({success: true, message: "Server running!!!"});
});

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});


app.use(errorHandler);