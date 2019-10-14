const pacote = require("pacote");

const carve = async (packageList, logger) => {
  const packages = {};
  const unresolvedPackages = [...packageList];

  while (unresolvedPackages.length > 0) {
    currentPackage = unresolvedPackages.pop();

    try {
      const { dependencies, _id: id, _resolved: url } = await pacote.manifest(
        currentPackage
      );

      logger.log(id);

      if (id in packages) {
        continue;
      }

      packages[id] = url;

      unresolvedPackages.push(
        ...Object.entries(dependencies).map(
          ([name, version]) => `${name}@${version}`
        )
      );
    } catch (e) {
      const msg = `Unable to resolve package ${currentPackage}`;
      logger.error(msg);
      throw new Error(e);
    }
  }
  return Object.values(packages);
};

module.exports = carve;
