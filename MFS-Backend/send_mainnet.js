const { Web3 } = require('web3');
const web3 = new Web3('https://mainnet.base.org');
const privateKey = '0x299f869b14dc37f9bf36a253f4df64f48670a8443fb4cd728a8ff4dd6c5f348b';
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
const toAddress = '0x49F4AED7512120fC0690bCb4786810Ffe28c3236';

async function send() {
  try {
    const balance = await web3.eth.getBalance(account.address);
    console.log("Mainnet Balance:", web3.utils.fromWei(balance, 'ether'), "ETH");
    if (balance === 0n) {
        console.log("No balance to send on Mainnet.");
        return;
    }
    
    // Hardcode gas limit for standard ETH transfer
    const gasLimit = 21000n;
    
    // Get current gas price
    const gasPrice = await web3.eth.getGasPrice();
    console.log("Current Gas Price:", web3.utils.fromWei(gasPrice, 'gwei'), "gwei");
    
    const cost = BigInt(gasPrice) * gasLimit;
    const sendAmount = BigInt(balance) - cost;
    
    if (sendAmount <= 0n) throw new Error(`Insufficient funds to cover gas. Balance: ${balance}, Cost: ${cost}`);
    
    const tx = {
      from: account.address,
      to: toAddress,
      value: sendAmount.toString(),
      gas: gasLimit.toString(),
      gasPrice: gasPrice.toString()
    };
    
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    console.log("Sending tx on Ethereum Mainnet...");
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log("Mainnet Tx Hash:", receipt.transactionHash);
  } catch(e) {
    console.error("Mainnet Send Error:", e.message);
  }
}
send();
