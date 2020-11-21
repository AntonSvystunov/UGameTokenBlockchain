const _deploy_contracts = require("../migrations/2_deploy_contracts")

const UGameToken = artifacts.require('./UGameToken.sol')

contract('UGameToken', accounts => {
    it('sets the total supply after deployed', () => {
        return UGameToken.deployed()
            .then(instance => instance.totalSupply())
            .then(totalSupply => {
                assert.equal(totalSupply, 4000000, 'total supply is set to 4,000,000')
            });
    });
});