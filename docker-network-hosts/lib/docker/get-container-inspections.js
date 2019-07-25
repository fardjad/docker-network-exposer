const getContainerInspections = docker =>
  docker
    .listContainers()
    .then(containerInfos =>
      Promise.all(
        containerInfos
          .map(containerInfo => containerInfo.Id)
          .map(id => docker.getContainer(id))
      )
    )
    .then(containers =>
      Promise.all(containers.map(container => container.inspect()))
    );

module.exports = getContainerInspections;
