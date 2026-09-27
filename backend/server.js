const express = require("express");
const cors = require("cors");
const path = require("path");

const paymentRoutes = require("./routes/paymentRoutes");
const otpRoutes = require("./routes/otpRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const fraudRoutes = require("./routes/fraudRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");


const app = express();


/* Middleware */

app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, "..")));


/* Home route */

app.get("/", (req, res) => {

    res.send("CardShield Backend is running");

});


/* API Routes */

app.use("/api", paymentRoutes);

app.use("/api", otpRoutes);

app.use("/api", transactionRoutes);

app.use("/api", fraudRoutes);

app.use("/api", dashboardRoutes);


/* Start Server */

app.listen(5000, () => {

    console.log("CardShield Backend running on port 5000");

});