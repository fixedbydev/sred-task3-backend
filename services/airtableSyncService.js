const AirtableAPI = require("../helpers/airtableApiHelper");
const cheerio = require("cheerio");
const {
  AirTableIntegration,
  Project,
  Table,
  Ticket,
  User,
  ChangeLog,
} = require("../models");

async function syncAirtableData(userId) {
  try {
    // Step 1: Fetch Airtable integration details
    const userObj = await AirTableIntegration.findById(userId);
    if (!userObj) {
      throw new Error("Airtable integration not found");
    }

    const accessToken = userObj.accessToken;

    // Step 2: Fetch Project data from Airtable
    const projects = await AirtableAPI.fetchProjects(accessToken);

    for (const project of projects.bases) {
      await Project.findOneAndUpdate(
        { id: project.id },
        { ...project, integrationId: userObj._id },
        { upsert: true }
      );

      // Step 3: Fetch Tables data from Airtable
      const tables = await AirtableAPI.fetchTables(accessToken, project.id);

      for (const table of tables.tables) {
        const projectObj = await Project.findOne({ id: project.id });
        await Table.findOneAndUpdate(
          { id: table.id },
          { ...table, projectId: projectObj._id },
          { upsert: true }
        );

        // Step 4: Fetch Table records from Airtable
        const tickets = await AirtableAPI.fetchTableRecords(
          accessToken,
          project.id,
          table.id
        );

        for (const ticket of tickets.records) {
          const tableObj = await Table.findOne({ id: table.id });
          const fields = ticket.fields;

          delete ticket.fields;
          await Ticket.findOneAndUpdate(
            { id: ticket.id },
            {
              ...ticket,
              ...fields,
              projectId: projectObj._id,
              tableId: tableObj._id,
            },
            { upsert: true }
          );

          // Step 5: Fetch Change Logs from Airtable
          const ticketObj = await Ticket.findOne({ id: ticket.id });
          const changesLogs = await AirtableAPI.getRowActivities({
            cookies: userObj.cookies,
            ticketId: ticket.id,
            projectId: project.id,
          });

          // Extract the required objects
          const activities = changesLogs.data.rowActivityInfoById;
          const users = changesLogs.data.rowActivityOrCommentUserObjById;

          // Parse and transform the data
          const result = Object.entries(activities).map(([uuid, activity]) => {
            const { createdTime, originatingUserId, diffRowHtml } = activity;

            // Parse the diffRowHtml
            const { columnType, oldValue, newValue } =
              parseRowActivitiesHtml(diffRowHtml);

            // Map user details
            const authoredBy = users[originatingUserId]?.name || null;

            return {
              uuid,
              issueId: ticket.id,
              columnType,
              oldValue,
              newValue,
              createdDate: createdTime,
              authoredBy,
              projectId: projectObj._id,
              tableId: tableObj._id,
              ticketId: ticketObj._id,
            };
          });

          // Save the change logs
          for (const activity of result) {
            await ChangeLog.findOneAndUpdate(
              { uuid: activity.uuid },
              { ...activity },
              { upsert: true }
            );
          }
        }
      }
    }

    // Step 5: Fetch User data from Airtable
    // const users = await AirtableAPI.fetchUsers(accessToken);

    // for (const user of users.records) {
    //   await User.findOneAndUpdate(
    //     { id: user.id },
    //     { ...user },
    //     { upsert: true }
    //   );
    // }

    console.log("Airtable data synchronization complete.");
  } catch (error) {
    console.error("Error syncing Airtable data:", error.message);
    throw error;
  }
}

function parseRowActivitiesHtml(htmlString) {
  const $ = cheerio.load(htmlString);

  const columnName = $("[columnId]").text().trim() || null;
  const columnType = $(".historicalCellValue").data("columntype") || null;
  const oldValue = $(".redLight2").text().trim() || "null";
  const newValue = $(".greenLight2").text().trim() || null;

  return { columnName, columnType, oldValue, newValue };
}

module.exports = {
  syncAirtableData,
};
