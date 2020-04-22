const mongoose = require("mongoose");

const prefixesSchema = mongoose.Schema({
  guild: String,
  prefix: String,
});

module.exports = mongoose.model("Prefixes", prefixesSchema)