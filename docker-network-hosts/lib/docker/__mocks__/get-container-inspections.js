const path = require("path");
const fs = require("fs").promises;

const getContainerInspections = () =>
  fs
    .readFile(path.join(__dirname, "./data.json"))
    .then(data => JSON.parse(data.toString("utf-8")));

module.exports = getContainerInspections;
