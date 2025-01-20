const express = require("express");
const router = express.Router();
const airtableController = require("../controllers/airtableController");
const auth = require("../middlewares/auth");


router.get("/profile", auth, airtableController.getProfile);
router.post("/sync", auth, airtableController.syncAirTableData);
router.get("/collections", auth, airtableController.listCollections);
router.get("/raw-data", auth, airtableController.rawData);
router.post("/fetch-cookie", auth, airtableController.fetchCookies);
router.get("/validate-cookie", auth, airtableController.validateUserCookies);


module.exports = router;
