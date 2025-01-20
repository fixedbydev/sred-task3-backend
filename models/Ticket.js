const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ticketSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tables",
    },
  },
  { timestamps: true, strict: false }
);

ticketSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("tickets", ticketSchema);
