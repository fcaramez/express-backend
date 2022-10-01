const router = require("express").Router();
const authRoutes = require("./auth.routes");

router.get("/ping", (req, res, next) => {
  res.json("Server up and running");
});

router.use("/auth", authRoutes);

module.exports = router;
