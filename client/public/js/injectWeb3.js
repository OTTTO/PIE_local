const KYC = require('../../../build/contracts/KYC.json');
const Web3 = require('web3');

getWeb3 = async () =>
  new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      if (window.ethereum) {
        web3 = new Web3(ethereum);
        console.log("Thanks for using MetaMask!");
        try {
          await ethereum.enable();
        } catch (error) {
          console.log(error);
        }
        resolve(web3);
      } else {
        const provider = new Web3.providers.HttpProvider("http://127.0.0.1:30305");
        const web3 = new Web3(provider);
        console.log("No web3 injected, using localhost");
        resolve(web3);
      }
    });
  });

initWeb3 = async () => {
  try {
    window.web3 = await getWeb3();

    console.log("Selected Address:", ethereum.selectedAddress);

    const networkId = await window.web3.eth.net.getId();
    const deployedNetwork = KYC.networks[networkId];
    console.log("kyc address:", deployedNetwork.address);

    window.KYCinstance = new window.web3.eth.Contract(
      KYC.abi, 
      deployedNetwork.address);

  } catch (err) {
    alert('Failed to load web3, accounts, or contract');
    console.error(err);
  }
}


module.exports = { initWeb3 }