jest.mock("./docker/get-container-inspections");

const getContainerInspections = require("./docker/get-container-inspections");
const getHosts = require("./get-hosts");

test("getHosts should generate the correct hosts file", async () => {
  const ownIpAddress = "172.19.0.2";

  const containerInspections = await getContainerInspections();
  const hostsLines = getHosts(ownIpAddress, containerInspections).split("\n");
  expect(hostsLines).toHaveLength(6);
});
