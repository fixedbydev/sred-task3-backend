const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const userSchema = new mongoose.Schema({}, { timestamps: true, strict: false });

userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("users", userSchema);
