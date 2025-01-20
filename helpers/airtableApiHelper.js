const axios = require("axios");
axios.defaults.withCredentials = true;
const qs = require("qs");
const {
  airtableUrl,
  airtableClientId,
  airtableClientSecret,
  airtableRedirectUrl,
} = require("../config");
const { fetchCookiesFromAirTableLogin } = require("./puppeteerHelper");

const encodedCredentials = Buffer.from(
  `${airtableClientId}:${airtableClientSecret}`
).toString("base64");
const authorizationHeader = `Basic ${encodedCredentials}`;
const headers = {
  "Content-Type": "application/x-www-form-urlencoded",
};
if (airtableClientSecret !== "") {
  headers.Authorization = authorizationHeader;
}

const getAccessToken = async (code, codeVerifier) => {
  const response = await axios({
    method: "post",
    url: `${airtableUrl}/oauth2/v1/token`,
    headers,
    data: qs.stringify({
      client_id: airtableClientId,
      code_verifier: codeVerifier,
      redirect_uri: airtableRedirectUrl,
      code,
      grant_type: "authorization_code",
    }),
  });

  const user = await fetchWhoAmI(response.data.access_token);

  return {
    ...response.data,
    user,
  };
};

async function fetchWhoAmI(apiToken) {
  try {
    const response = await axios.get(
      "https://api.airtable.com/v0/meta/whoami",
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching whoami:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function fetchProjects(apiToken) {
  try {
    const response = await axios.get("https://api.airtable.com/v0/meta/bases", {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching bases:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function fetchTables(apiToken, baseId) {
  try {
    const response = await axios.get(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching tables:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function fetchTableRecords(apiToken, baseId, tableId) {
  try {
    const response = await axios.get(
      `https://api.airtable.com/v0/${baseId}/${tableId}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching table records:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function fetchUsers(apiToken) {
  try {
    const response = await axios.get("https://airtable.com/v2/Users", {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching users:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function loginAndScrapeCookies(credentials) {
  try {
    const cookies = await fetchCookiesFromAirTableLogin(credentials);

    console.log("Cookies:", cookies);

    return cookies;
  } catch (error) {
    console.log("Error fetching cookies:", error);
    throw error;
  }
}

async function getRowActivities({ cookies, ticketId, projectId }) {
  try {
    const response = await axios.get(
      `https://airtable.com/v0.3/row/${ticketId}/readRowActivitiesAndComments`,
      {
        headers: {
          "x-airtable-application-id": projectId,
          "x-requested-with": "XMLHttpRequest",
          "x-time-zone": "Asia/Kolkata",
          Cookie: cookies,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching row activities:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function validateCookie(userId, cookies) {
  try {
    await axios.get(`https://airtable.com/v0.3/user/${userId}/getFavorites`, {
      headers: {
        "x-requested-with": "XMLHttpRequest",
        "x-time-zone": "Asia/Calcutta",
        Cookie: cookies,
      },
    });
    return true;
  } catch (error) {
    console.error(
      "Error validating cookie:",
      error.response?.data || error.message
    );
    return false;
  }
}

module.exports = {
  getAccessToken,
  fetchProjects,
  fetchTables,
  fetchTableRecords,
  fetchUsers,
  getRowActivities,
  loginAndScrapeCookies,
  validateCookie,
};
