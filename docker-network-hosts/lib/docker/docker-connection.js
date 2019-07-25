const Docker = require("dockerode");

module.exports = new Docker({ socketPath: "/var/run/docker.sock" });
