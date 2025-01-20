const mongoose = require("mongoose");
const { syncAirtableData } = require("../services/airtableSyncService");
const {
  AirTableIntegration,
  Project,
  Table,
  Ticket,
  ChangeLog,
} = require("../models");
const {
  loginAndScrapeCookies,
  validateCookie,
} = require("../helpers/airtableApiHelper");
const { fetchCookiesFromAirTableLogin } = require("../helpers/puppeteerHelper");
const ObjectId = mongoose.Types.ObjectId;

exports.getProfile = async (req, res) => {
  try {
    return res.json(req.user);
  } catch (error) {
    console.error("[getProfile]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.syncAirTableData = async (req, res) => {
  const user = await AirTableIntegration.findById(req.user._id);
  try {
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.lastSync = Date.now();
    user.syncStatus = "in-progress";
    await user.save();

    await syncAirtableData(req.user._id, user.cookies);

    user.syncStatus = "completed";
    await user.save();

    res.send({
      message: "Airtable data synchronization complete.",
    });
  } catch (error) {
    console.error("[syncAirTableData]", error);
    user.syncStatus = "failed";
    await user.save();
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.listCollections = async (req, res) => {
  try {
    res.json({
      collections: ["projects", "tables", "tickets", "changelogs"],
    });
  } catch (error) {
    console.error("[listCollections]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.rawData = async (req, res) => {
  try {
    const { page = 1, limit = 10, collection } = req.query;

    const models = {
      projects: Project,
      tables: Table,
      tickets: Ticket,
      changelogs: ChangeLog,
    };

    if (!models[collection]) {
      return res.status(400).json({ message: "Invalid collection" });
    }

    const model = models[collection];
    const projects = await model.paginate(
      {},
      {
        page: page || 1,
        limit: limit || 10,
      }
    );
    res.send(projects);
  } catch (error) {
    console.error("[rawData]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.fetchCookies = async (req, res) => {
  try {
    const { password } = req.body;

    const cookies = await fetchCookiesFromAirTableLogin({
      email: req.user.email,
      password,
    });

    const user = await AirTableIntegration.findById(req.user._id);
    user.cookies = cookies;
    await user.save();

    res.json({
      message: "Cookies fetched successfully",
    });
  } catch (error) {
    console.error("[loginAndScrapeCookies]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.validateUserCookies = async (req, res) => {
  try {
    const user = await AirTableIntegration.findById(req.user._id);
    const cookies = user.cookies;

    if (!cookies) {
      return res.json({ flag: false });
    }
    const isValid = await validateCookie(user.integrationId, cookies);

    res.json({
      flag: isValid,
    });
  } catch (error) {
    console.error("[validateUserCookies]", error);
    return res.json({ flag: false });
  }
};
