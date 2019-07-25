const path = require("path");
const arg = require("arg");
const ip = require("ip");

const writeHosts = require("./write-hosts");

const showUsage = () => {
  console.log(
    [
      "Usage: docker-network-hosts [options] -o path [ip_address]",
      "",
      "Options:",
      "  -h, --help\t\tShow usage",
      "  -o, --output=...\tWrite the hosts file to the specified location",
      "  -w, --watch\t\tKeep the hosts file updated"
    ].join("\n")
  );
};

const parseAndValidateArgs = argv => {
  let options;

  try {
    options = arg(
      {
        "--help": Boolean,
        "--output": String,
        "--watch": Boolean,
        // aliases
        "-h": "--help",
        "-o": "--output",
        "-w": "--watch"
      },
      {
        argv: argv.slice(2)
      }
    );
  } catch (ex) {
    showUsage();
    process.exit(-1);
  }

  if (options["--help"]) {
    showUsage();
    process.exit(0);
  }

  if (!options["--output"]) {
    showUsage();
    process.exit(-1);
  }

  return options;
};

const cli = async argv => {
  const options = parseAndValidateArgs(argv);

  const ownIpAddress = options._[0] || ip.address();
  const outputPath = path.resolve(options["--output"]);
  const shouldWatch = options["--watch"];

  await writeHosts(outputPath, ownIpAddress, shouldWatch);
};

module.exports = cli;
