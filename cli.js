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
    --output, -o  Output directory (default: packages)
    --help        Displays this help text
    --version     Displays the version number

	Examples
	  $ carve meow@5.0.0 react "moment@1||2||3" --output=dump
`,
  {
    flags: {
      output: {
        type: "string",
        alias: "o",
        default: "packages"
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

            ctx.packages = await carve(cli.input, logger);
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
              const fileName = packageUrl.split("/").slice(-1)[0];
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
  console.error(err);
  process.exit(2);
});
