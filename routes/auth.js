const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middlewares/auth");

router.get(
  "/airtable",
  authController.oauth2
);
router.get("/airtable/callback", authController.airtableCallback);
router.get("/logout", auth, authController.disconnect);

module.exports = router;
