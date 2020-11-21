const _deploy_contracts = require("../migrations/2_deploy_contracts")

const UGameToken = artifacts.require('./UGameToken.sol')

const testInitial = 4000000;

contract('UGameToken', accounts => {
    let tokenInstance;
    it('sets correct names to currency', () => {
        return UGameToken.deployed()
            .then(instance => {
                tokenInstance = instance;
                return tokenInstance.name();
            })
            .then(name => {
                assert.equal(name, 'UGame Token', 'name is assigned correctly');
                return tokenInstance.symbol();
            })
            .then(symbol => {
                assert.equal(symbol, 'UGT', 'symbol is assigned correctly');
                return tokenInstance.decimals();
            })
            .then(decimals => {
                assert.equal(decimals, 8, 'decimals is assigned correctly')
            });
    });

    it('sets the total supply after deployed', () => {
        return UGameToken.deployed()
            .then(instance => {
                tokenInstance = instance;
                return instance.totalSupply();
            })
            .then(totalSupply => {
                assert.equal(totalSupply.toNumber(), testInitial, 'total supply is set to 4,000,000')
                return tokenInstance.balanceOf(accounts[0])
            })
            .then(adminBalance => {
                assert.equal(adminBalance.toNumber(), testInitial, 'Admin balance is set to 4,000,000')
            });
    });

    it('transfers token ownership', function () {
        return UGameToken.deployed()
            .then((instance) => {
                tokenInstance = instance;
                // Test `require` statement first by transferring something larger than the sender's balance
                return tokenInstance.transfer.call(accounts[1], 99999999999999999999999);
            })
            .then(assert.fail).catch(function (error) {
                assert(error.message.length > 0, 'error message must contain revert');
                return tokenInstance.transfer.call(accounts[1], 250000, {
                    from: accounts[0]
                });
            })
            .then(function (success) {
                assert.equal(success, true, 'it returns true');
                return tokenInstance.transfer(accounts[1], 250000, {
                    from: accounts[0]
                });
            })
            .then(function (receipt) {
                assert.equal(receipt.logs.length, 1, 'triggers one event');
                assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
                assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
                assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
                assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
                return tokenInstance.balanceOf(accounts[1]);
            })
            .then(function (balance) {
                assert.equal(balance.toNumber(), 250000, 'adds the amount to the receiving account');
                return tokenInstance.balanceOf(accounts[0]);
            })
            .then(function (balance) {
                assert.equal(balance.toNumber(), testInitial - 250000, 'deducts the amount from the sending account');
            });
    });

    it('handles delegated token transfers', function () {
        return UGameToken.deployed()
            .then(function (instance) {
                tokenInstance = instance;
                fromAccount = accounts[2];
                toAccount = accounts[3];
                spendingAccount = accounts[4];
                // Transfer some tokens to fromAccount
                return tokenInstance.transfer(fromAccount, 100, {
                    from: accounts[0]
                });
            })
            .then(function (receipt) {
                // Approve spendingAccount to spend 10 tokens form fromAccount
                return tokenInstance.approve(spendingAccount, 10, {
                    from: fromAccount
                });
            })
            .then(function (receipt) {
                // Try transferring something larger than the sender's balance
                return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {
                    from: spendingAccount
                });
            })
            .then(assert.fail)
            .catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
                // Try transferring something larger than the approved amount
                return tokenInstance.transferFrom(fromAccount, toAccount, 20, {
                    from: spendingAccount
                });
            })
            .then(assert.fail)
            .catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
                return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {
                    from: spendingAccount
                });
            })
            .then(function (success) {
                assert.equal(success, true);
                return tokenInstance.transferFrom(fromAccount, toAccount, 10, {
                    from: spendingAccount
                });
            })
            .then(function (receipt) {
                assert.equal(receipt.logs.length, 1, 'triggers one event');
                assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
                assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
                assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
                assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
                return tokenInstance.balanceOf(fromAccount);
            })
            .then(function (balance) {
                assert.equal(balance.toNumber(), 90, 'deducts the amount from the sending account');
                return tokenInstance.balanceOf(toAccount);
            })
            .then(function (balance) {
                assert.equal(balance.toNumber(), 10, 'adds the amount from the receiving account');
                return tokenInstance.allowance(fromAccount, spendingAccount);
            })
            .then(function (allowance) {
                assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
            });
    });

    it('computes commision', () => {
        let c;
        return UGameToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.commission();
        }).then(commission => {
            c = commission;
            assert.equal(commission, 10, 'Commision is 10%');
            return tokenInstance.calculateCommision(100);
        }).then(deducted => {
            assert.equal(deducted, 10);
        });
    });

    it('approves tokens for delegated transfer', function () {
        return UGameToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function (success) {
            assert.equal(success, true, 'it returns true');
            return tokenInstance.approve(accounts[1], 100, {
                from: accounts[0]
            });
        }).then(function (receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
            assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function (allowance) {
            assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated trasnfer');
        });
    });
});