const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const projectSchema = new mongoose.Schema(
  {
    integrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "airtable-integrations",
      required: true,
    }
  },
  { timestamps: true, strict: false }
);

projectSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("projects", projectSchema);
