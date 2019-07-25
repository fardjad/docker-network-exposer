const fs = require("fs");
const arg = require("arg");
const ip = require("ip");

const writeHosts = require("./write-hosts");

const showUsage = () => {
  console.log(
    [
      "Usage: docker-network-hosts [options] [ip_address]",
      "",
      "Options:",
      "  -h, --help\t\tShow usage",
      "  -o, --output=...\tWrite the hosts file to the specified directory",
      "                  \t(default: cwd)",
      "  -w, --watch\t\tKeep the hosts file updated",
      "  -c, --cleanup\t\tDelete the hosts file on exit (only in watch mode)"
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
        "--cleanup": Boolean,
        // aliases
        "-h": "--help",
        "-o": "--output",
        "-w": "--watch",
        "-c": "--cleanup"
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

  if (
    options["--output"] != null &&
    (!fs.existsSync(options["--output"]) ||
      !fs.statSync(options["--output"]).isDirectory())
  ) {
    console.error("Error: output must be a directory");
    process.exit(-1);
  }

  return options;
};

const cli = async argv => {
  const options = parseAndValidateArgs(argv);

  const ownIpAddress = options._[0] || ip.address();
  const outputDirectory = options["--output"] || process.cwd();
  const shouldWatch = options["--watch"];
  const shouldCleanup = options["--cleanup"];

  await writeHosts(outputDirectory, ownIpAddress, shouldWatch, shouldCleanup);
};

module.exports = cli;
