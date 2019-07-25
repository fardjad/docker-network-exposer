const fs = require("fs");
const path = require("path");
const exitHook = require("exit-hook");

const docker = require("./docker/docker-connection.js");
const getContainerInspections = require("./docker/get-container-inspections");
const {
  getContainerInfos,
  findNetworkName,
  generateHosts
} = require("./network-utils");
const LifeCycleEventEmitter = require("./docker/lifecycle-event-emitter");

const writeHostsOnce = (
  ownIpAddress,
  containerInfos,
  networkName,
  outputPath
) => {
  const hostsContents = generateHosts(
    ownIpAddress,
    containerInfos,
    networkName
  );

  return fs.promises.writeFile(outputPath, hostsContents);
};

const writeHosts = async (
  outputDirectory,
  ownIpAddress,
  shouldWatch,
  shouldCleanup
) => {
  try {
    const containerInspections = await getContainerInspections(docker);
    const containerInfos = getContainerInfos(containerInspections);
    const networkName = findNetworkName(containerInfos, ownIpAddress) || "";
    const outputPath = path.join(outputDirectory, networkName);

    await writeHostsOnce(ownIpAddress, containerInfos, networkName, outputPath);

    if (shouldWatch) {
      if (shouldCleanup) {
        exitHook(() => {
          fs.unlinkSync(outputPath);
        });
      }

      const lifeCycleEventEmitter = new LifeCycleEventEmitter(docker);
      lifeCycleEventEmitter.on("change", async () => {
        await writeHostsOnce(
          ownIpAddress,
          containerInfos,
          networkName,
          outputPath
        );
      });
      lifeCycleEventEmitter.start();
    }
  } catch (ex) {
    console.error(ex.message);
    process.exit(-1);
  }
};

module.exports = writeHosts;
