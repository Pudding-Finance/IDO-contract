const MockORC20 = artifacts.require("MockORC20");
const IDOImpl = artifacts.require("IDOImpl");
const IDOUpgradeProxy = artifacts.require("IDOUpgradeProxy");

const Web3 = require("web3");
const { numToHex, getBlockFromTime, formatDecimals } = require("../utils");
const web3 = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org")
);

const CURRENT_BLOCK_NUMBER = 693758;
const CURRENT_BLOCK_TIME = "May-19-2021 14:30:37";

module.exports = async function(deployer, a) {
  await deployer.deploy(
    MockORC20,
    "Bunny Token",
    "Bunny",
    numToHex(200 * 1e18)
  );
  const bunnyToken = await MockORC20.deployed();

  await deployer.deploy(MockORC20, "Cat Token", "Cat", numToHex(200 * 1e18));
  const catToken = await MockORC20.deployed();

  let beginTime = "2021-05-19T14:10:00+08:00";
  let endTime = "2021-05-19T14:20:00+08:00";
  let offeringAmount = 200;
  let raisingUSD = 40;
  let raisingTokenPrice = 1;
  let raisingAmount = formatDecimals(raisingUSD / raisingTokenPrice, 10);
  let minAmount = 1;
  const lpToken = bunnyToken.address;
  const offeringToken = catToken.address;

  // let offeringAmount = 200;
  // let raisingUSD = 40;
  // let raisingTokenPrice = 1;
  // let raisingAmount = formatDecimals(raisingUSD / raisingTokenPrice, 10);
  // let minAmount = 1;
  // // CONFIG: lpToken  pud-hoo
  // const lpToken = "0x593de6673ad09b69103f5b95175cddd05f6880b3";
  // // CONFIG: offeringToken xxx
  // const offeringToken = "0xD16bAbe52980554520F6Da505dF4d1b124c815a7";

  const proxyAdmin = "0x5cae3a434C9501fbe0a2E0b739A45F54fCF3Daf7";
  const ifoAdmin = "0x5cae3a434C9501fbe0a2E0b739A45F54fCF3Daf7";
  const startBlock = getBlockFromTime(
    beginTime,
    CURRENT_BLOCK_NUMBER,
    CURRENT_BLOCK_TIME
  );
  const endBlock = getBlockFromTime(
    endTime,
    CURRENT_BLOCK_NUMBER,
    CURRENT_BLOCK_TIME
  );

  offeringAmount = numToHex(offeringAmount * Math.pow(10, 18));
  raisingAmount = numToHex(raisingAmount * Math.pow(10, 18));
  minAmount = numToHex(minAmount * Math.pow(10, 18));
  const adminAddress = ifoAdmin;

  console.log("startBlock:", startBlock);
  console.log("endBlock:", endBlock);

  await deployer.deploy(IDOImpl);
  const ido = await IDOImpl.deployed();

  const abiEncodeData = web3.eth.abi.encodeFunctionCall(
    {
      inputs: [
        {
          internalType: "contract IORC20",
          name: "_lpToken",
          type: "address"
        },
        {
          internalType: "contract IORC20",
          name: "_offeringToken",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "_startBlock",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "_endBlock",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "_offeringAmount",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "_raisingAmount",
          type: "uint256"
        },
        {
          internalType: "uint256",
          name: "_minAmount",
          type: "uint256"
        },
        {
          internalType: "address",
          name: "_adminAddress",
          type: "address"
        }
      ],
      name: "initialize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    [
      lpToken,
      offeringToken,
      startBlock,
      endBlock,
      offeringAmount,
      raisingAmount,
      minAmount,
      adminAddress
    ]
  );

  await deployer.deploy(
    IDOUpgradeProxy,
    proxyAdmin,
    ido.address,
    abiEncodeData
  );

  await bunnyToken.transfer(
    "0xE5A2432e9623B47FF27CbB0271bFB63fBEf26319",
    numToHex(200 * 1e18)
  );
  await catToken.transfer(IDOUpgradeProxy.address, numToHex(200 * 1e18));
};
