const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const tableSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
  },
  { timestamps: true, strict: false }
);

tableSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("tables", tableSchema);
