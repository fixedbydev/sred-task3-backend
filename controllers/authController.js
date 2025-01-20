const AirTableIntegration = require("../models/AirtableIntegration");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  airtableUrl,
  airtableClientId,
  airtableRedirectUrl,
  airtableScope,
} = require("./../config");
const { getAccessToken } = require("../helpers/airtableApiHelper");
const authorizationCache = {};

exports.oauth2 = async (req, res) => {
  const state = crypto.randomBytes(100).toString("base64url");
  const codeVerifier = crypto.randomBytes(96).toString("base64url");
  const codeChallengeMethod = "S256";
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier) // hash the code verifier with the sha256 algorithm
    .digest("base64") // base64 encode, needs to be transformed to base64url
    .replace(/=/g, "") // remove =
    .replace(/\+/g, "-") // replace + with -
    .replace(/\//g, "_"); // replace / with _ now base64url encoded

  authorizationCache[state] = {
    codeVerifier,
  };

  const authorizationUrl = `${airtableUrl}/oauth2/v1/authorize?client_id=${airtableClientId}&redirect_uri=${airtableRedirectUrl}&response_type=code&scope=${airtableScope}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}`;

  // redirect the user and request authorization
  res.redirect(authorizationUrl);
};

exports.airtableCallback = async (req, res) => {
  try {
    const state = req.query.state;
    const cached = authorizationCache[state];

    // validate request, you can include other custom checks here as well
    if (cached === undefined) {
      res.send("This request was not from Airtable!");
      return;
    }
    // clear the cache
    delete authorizationCache[state];

    if (req.query.error) {
      const error = req.query.error;
      const errorDescription = req.query.error_description;
      return res.send({
        error,
        errorDescription,
      });
    }

    const code = req.query.code;
    const codeVerifier = cached.codeVerifier;
    const response = await getAccessToken(code, codeVerifier);

    const { user, cookies } = response;

    let userRecord = await AirTableIntegration.findOne({
      integrationId: user.id,
    });

    if (!userRecord) {
      userRecord = new AirTableIntegration({
        integrationId: user.id,
        email: user.email,
      });
    }

    userRecord.accessToken = response.access_token;
    userRecord.refreshToken = response.refresh_token;

    await userRecord.save();

    const token = jwt.sign(
      { _id: userRecord._id, integrationId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    console.log(cookies);
    res.redirect(`${process.env.FRONTEND_URL}?accessToken=${token}`);
  } catch (error) {
    console.log("[Airtable Callback]", error);
    res.status(500).json({ message: "Something Went Wrong!" });
  }
};

exports.disconnect = async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await AirTableIntegration.findById(_id);

    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    delete user.accessToken;

    await user.save();

    res.json({ message: "Disconnected Successfully!" });
  } catch (error) {
    console.log("[Disconnect]", error);
    res.status(500).json({ message: "Something Went Wrong!" });
  }
};
