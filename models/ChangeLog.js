const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const changeLogSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tables",
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tickets",
    },
  },
  { timestamps: true, strict: false }
);

changeLogSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("changelogs", changeLogSchema);
