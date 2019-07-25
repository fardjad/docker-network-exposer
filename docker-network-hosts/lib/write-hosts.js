const fs = require("fs");
const path = require("path");
const nodeCleanup = require("node-cleanup");

const docker = require("./docker/docker-connection.js");
const getContainerInspections = require("./docker/get-container-inspections");
const {
  getContainerInfos,
  findNetworkName,
  generateHosts
} = require("./network-utils");
const LifeCycleEventEmitter = require("./docker/lifecycle-event-emitter");
const die = require("./die");

const writtenFiles = new Set();

const writeHostsOnce = async (ownIpAddress, outputDirectory) => {
  const containerInspections = await getContainerInspections(docker);
  const containerInfos = getContainerInfos(containerInspections);
  const networkName =
    findNetworkName(containerInfos, ownIpAddress) || "unknown";
  const outputPath = path.join(path.resolve(outputDirectory), networkName);
  const hostsContents = generateHosts(
    ownIpAddress,
    containerInfos,
    networkName
  );

  return new Promise((resolve, reject) => {
    fs.writeFile(outputPath, hostsContents, err => {
      if (err) {
        reject(err);
      } else {
        writtenFiles.add(outputPath);
        resolve();
      }
    });
  });
};

const watch = (ownIpAddress, outputDirectory, shouldCleanup) => {
  const lifeCycleEventEmitter = new LifeCycleEventEmitter(docker);

  lifeCycleEventEmitter.on("change", async () => {
    try {
      await writeHostsOnce(ownIpAddress, outputDirectory);
    } catch (ex) {
      die(ex);
    }
  });

  nodeCleanup(() => {
    lifeCycleEventEmitter.removeAllListeners();
    lifeCycleEventEmitter.stop();

    if (shouldCleanup) {
      console.log("Cleaning up...");
      writtenFiles.forEach(writtenFile => {
        console.log(`Removing ${writtenFile}...`);
        fs.unlinkSync(writtenFile);
      });

      writtenFiles.clear();
    }
  });

  lifeCycleEventEmitter.start();
};

const writeHosts = async (
  outputDirectory,
  ownIpAddress,
  shouldWatch,
  shouldCleanup
) => {
  try {
    await writeHostsOnce(ownIpAddress, outputDirectory);
  } catch (ex) {
    die(ex);
  }

  if (shouldWatch) {
    watch(ownIpAddress, outputDirectory, shouldCleanup);
  }
};

module.exports = writeHosts;
