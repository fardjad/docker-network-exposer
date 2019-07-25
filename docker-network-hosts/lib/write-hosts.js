const fs = require("fs").promises;

const docker = require("./docker/docker-connection.js");
const getContainerInspections = require("./docker/get-container-inspections");
const getHosts = require("./get-hosts");
const LifeCycleEventEmitter = require("./docker/lifecycle-event-emitter");

const writeHostsOnce = async (outputPath, ownIpAddress) => {
  const containerInspections = await getContainerInspections(docker);
  const hostsContents = getHosts(ownIpAddress, containerInspections);

  return fs.writeFile(outputPath, hostsContents);
};

const writeHosts = async (outputPath, ownIpAddress, shouldWatch) => {
  try {
    await writeHostsOnce(outputPath, ownIpAddress);

    if (shouldWatch) {
      const lifeCycleEventEmitter = new LifeCycleEventEmitter(docker);
      lifeCycleEventEmitter.on("change", async () => {
        await writeHostsOnce(outputPath, ownIpAddress);
      });
      lifeCycleEventEmitter.start();
    }
  } catch (ex) {
    console.error(ex.message);
    process.exit(-1);
  }
};

module.exports = writeHosts;
