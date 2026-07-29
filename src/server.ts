/// <reference path="./types/express.d.ts" />
import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.routes";
import expenseRoutes from "./routes/expense.routes";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/health", (req, res) => {
    res.send({ status: "OK", version: 1 });
});

app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
