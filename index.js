const pacote = require("pacote");
const { noop } = require("./utils");

const noopLogger = { log: noop, error: noop, warn: noop };

const carve = async (
  packageList,
  { logger = noopLogger, ...pacoteOptions }
) => {
  const packages = {};
  const unresolvedPackages = [...packageList];

  while (unresolvedPackages.length > 0) {
    currentPackage = unresolvedPackages.pop();

    try {
      const {
        dependencies,
        _resolved: url,
        name,
        version
      } = await pacote.manifest(currentPackage, pacoteOptions);

      const id = `${name}@${version}`;

      logger.log(id);

      if (id in packages) {
        continue;
      }

      packages[id] = url;

      unresolvedPackages.push(
        ...Object.entries(dependencies || []).map(
          ([name, version]) => `${name}@${version}`
        )
      );
    } catch (e) {
      const msg = `Unable to resolve package ${currentPackage}`;
      logger.error(msg);
      throw e;
    }
  }
  return packages;
};

module.exports = carve;
