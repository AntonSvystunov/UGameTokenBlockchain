const UGameToken = artifacts.require("UGameToken");

module.exports = function (deployer) {
  deployer.deploy(UGameToken);
};