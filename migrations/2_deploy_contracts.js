const UGameToken = artifacts.require("UGameToken");
const UGameTokenSale = artifacts.require("UGameTokenSale");

module.exports = function (deployer) {
  deployer.deploy(UGameToken, 4000000, 10)
    .then(() => {
      return deployer.deploy(UGameTokenSale, UGameToken.address, 1000000000000000)
    })
};
