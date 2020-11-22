const UGameToken = artifacts.require("UGameToken");
const UGameTokenSale = artifacts.require("UGameTokenSale");
const Oracle = artifacts.require('Oracle');

module.exports = function (deployer) {
  deployer.deploy(UGameToken, 4000000, 10)
    .then(() => {
      return deployer.deploy(UGameTokenSale, UGameToken.address, 1000000000000000)
    })
    .then(() => {
      return deployer.deploy(Oracle, UGameToken.address)
    })
};
