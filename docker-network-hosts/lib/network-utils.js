const extractNetworkInfo = networks =>
  Object.keys(networks).reduce((acc, key) => {
    const network = networks[key];
    return [
      ...acc,
      {
        name: key,
        aliases: network["Aliases"],
        ipAddress: network["IPAddress"]
      }
    ];
  }, []);

const getContainerInfos = containerInspections =>
  containerInspections.map(inspection => ({
    id: inspection["Id"],
    name: inspection["Name"],
    networkSettings: extractNetworkInfo(
      inspection["NetworkSettings"]["Networks"]
    )
  }));

const findNetworkName = (containerInfos, ipAddress) =>
  containerInfos
    .map(containerInfo => containerInfo.networkSettings)
    .reduce((acc, networkSetting) => [...acc, ...networkSetting], [])
    .filter(networkSetting => networkSetting.ipAddress === ipAddress)
    .map(networkSetting => networkSetting.name)[0];

const getNetworkIpNameMappings = (networkName, containerInfo) => {
  const networkSettings = containerInfo.networkSettings.filter(
    networkSetting => networkSetting.name === networkName
  );

  const ips = networkSettings.map(networkSetting => networkSetting.ipAddress);
  const aliases = networkSettings
    .map(networkSetting => networkSetting.aliases)
    .reduce((acc, aliases) => [...acc, ...aliases], []);

  return ips.map(ipAddress => ({
    ipAddress,
    names: [containerInfo.name.slice(1), ...aliases]
  }));
};

const generateHosts = (ownIpAddress, containerInfos, networkName) => {
  const toIpNameMappings = containerInfos =>
    getNetworkIpNameMappings(networkName, containerInfos);

  const groupedIpNameMappings = containerInfos
    .map(toIpNameMappings)
    .reduce((acc, mapping) => [...acc, ...mapping], [])
    .reduce(
      (acc, mapping) => ({
        ...acc,
        [mapping.ipAddress]: (acc[mapping.ipAddress] || []).concat(
          mapping.names
        )
      }),
      {}
    );

  return Object.keys(groupedIpNameMappings)
    .map(ip => groupedIpNameMappings[ip].map(name => [ip, name]))
    .reduce((acc, pairs) => [...acc, ...pairs], [])
    .map(pair => pair.join("\t"))
    .join("\n");
};

module.exports = {
  generateHosts,
  getContainerInfos,
  findNetworkName
};
