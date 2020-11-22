App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545/');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("UGameTokenSale.json", function(ugameTokenSale) {
      App.contracts.UGameTokenSale = TruffleContract(ugameTokenSale);
      App.contracts.UGameTokenSale.setProvider(App.web3Provider);
      App.contracts.UGameTokenSale.deployed().then(function(ugameTokenSale) {
        console.log("UGame Token Sale Address:", ugameTokenSale.address);
      });
    }).done(function() {
      $.getJSON("UGameToken.json", function(ugameToken) {
        App.contracts.UGameToken = TruffleContract(ugameToken);
        App.contracts.UGameToken.setProvider(App.web3Provider);
        App.contracts.UGameToken.deployed().then(function(ugameToken) {
          console.log("Ugame Token Address:", ugameToken.address);
        });
      });
    }).done(function() {
      $.getJSON("Oracle.json", function(oracle) {
        App.contracts.Oracle = TruffleContract(oracle);
        App.contracts.Oracle.setProvider(App.web3Provider);
        App.contracts.Oracle.deployed().then(function(oracle) {
          console.log("Oracle Address:", oracle.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.UGameTokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    })

    // Load token sale contract
    App.contracts.UGameTokenSale.deployed().then(function(instance) {
      ugameTokenSaleInstance = instance;
      return ugameTokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return ugameTokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load token contract
      App.contracts.UGameToken.deployed().then(function(instance) {
        ugameTokenInstance = instance;
        return ugameTokenInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.dapp-balance').html(balance.toNumber());
      
        //Load
      App.contracts.Oracle.deployed().then(function (instance){
        OracleInstance = instance;
        return OracleInstance.getMatches();
      }).then(function (matches){
        $('.matches').html(matches);
        console.log(matches);
      })

        App.loading = false;
        loader.hide();
        content.show();
      })
    });
  },

  getAccounts: function(){
    $('#content').hide();
    $('#loader').show();
    var num
  },


  addMatch: function() {
    // $('#content').hide();
    // $('#loader').show();
    App.UGameToken.
    App.contracts.Oracle.deployed().then(function(instance) {
      return instance.addMatchByid("1", "0xD6595A06D267EF88C3E32886e0Eb6149118a80B5", "0xD6595A06D267EF88C3E32886e0Eb6149118a80B5", 23).then(function(result) {
        console.log('OK');
      });
    });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  })
});
