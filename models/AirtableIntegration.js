const mongoose = require("mongoose");

const AirTableIntegrationSchema = new mongoose.Schema({
  integrationId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  cookies: { type: String },
  cookiesExpiresAt: { type: Date },
  lastSync: { type: Date },
  syncStatus: { type: String }
});

module.exports = mongoose.model("airtable-integrations", AirTableIntegrationSchema);
