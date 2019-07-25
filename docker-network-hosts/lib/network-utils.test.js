jest.mock("./docker/get-container-inspections");

const getContainerInspections = require("./docker/get-container-inspections");
const {
  findNetworkName,
  generateHosts,
  getContainerInfos
} = require("./network-utils");

test("getHosts should generate the correct hosts file", async () => {
  const ownIpAddress = "172.19.0.2";

  const containerInspections = await getContainerInspections();
  const containerInfos = getContainerInfos(containerInspections);
  const networkName = findNetworkName(containerInfos, ownIpAddress);

  const hostsLines = generateHosts(
    ownIpAddress,
    containerInfos,
    networkName
  ).split("\n");
  expect(hostsLines).toHaveLength(6);
});
