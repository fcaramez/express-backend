const router = require("express").Router();
const authRoutes = require("./auth.routes");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const fileUploader = require("../config/cloudinary.config");

router.get("/ping", (req, res, next) => {
  res.json("Server up and running");
});

router.post(
  "/upload",
  isAuthenticated,
  fileUploader.single("image"),
  (req, res, next) => {
    try {
      if (!req.file) {
        next(new Error("No file uploaded!"));
        return;
      }

      res.json({ fileUrl: req.file.path });
    } catch (error) {}
  }
);

router.use("/auth", authRoutes);

module.exports = router;
