const router = require("express").Router();
const authRoutes = require("./auth");
const airtableRoutes = require("./airtable");

router.use("/auth", authRoutes);
router.use("/airtable", airtableRoutes);

module.exports = router;
