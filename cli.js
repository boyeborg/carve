#!/usr/bin/env node

const fs = require("fs");
const https = require("https");
const meow = require("meow");
const Listr = require("listr");
const carve = require("./index.js");
const { noop } = require("./utils");

const cli = meow(
  `
	Usage
	  $ carve <package-name>... [options]

  Options
    --output, -o    Output directory (default: packages)
    --registry, -r  NPM registry to use (default: https://registry.npmjs.org)
    --help          Displays this help text
    --version       Displays the version number

	Examples
	  $ carve meow@5.0.0 react "moment@1||2||3" --output=dump
`,
  {
    flags: {
      output: {
        type: "string",
        alias: "o",
        default: "packages"
      },
      registry: {
        type: "string",
        alias: "r",
        default: "https://registry.npmjs.org"
      }
    }
  }
);

if (!cli.input.length === 0) {
  cli.showHelp(1);
}

const tasks = new Listr([
  {
    title: "Resolving packages",
    task: () =>
      new Listr([
        {
          title: "",
          task: async (ctx, task) => {
            const logger = {
              log: message => (task.title = message),
              warn: noop,
              error: noop
            };

            ctx.packages = Object.values(
              await carve(cli.input, {
                logger,
                registry: cli.flags["registry"]
              })
            );
          }
        }
      ])
  },
  {
    title: "Downloading packages",
    task: () =>
      new Listr([
        {
          title: "",
          task: (ctx, task) => {
            const dir = cli.flags["output"];

            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir);
            }

            ctx.packages.forEach(packageUrl => {
              const fileName = new URL(packageUrl).pathname
                .slice(1)
                .replace("/-/", "/")
                .replace("@", "")
                .split("/")
                .join("-");

              const file = fs.createWriteStream(`${dir}/${fileName}`);

              task.title = fileName;

              https.get(packageUrl, response => {
                response.pipe(file);
              });
            });
          }
        }
      ])
  }
]);

tasks.run().catch(err => {
  console.error(`Error: ${err.message || "Unable to carve packages"}`);
  process.exit(2);
});
