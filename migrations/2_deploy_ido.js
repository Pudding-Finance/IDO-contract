const IDOImpl = artifacts.require("IDOImpl");
const IDOUpgradeProxy = artifacts.require("IDOUpgradeProxy");

const Web3 = require("web3");
const { numToHex, getBlockFromTime, formatDecimals } = require("../utils");
const web3 = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org")
);

const CURRENT_BLOCK_NUMBER = 835495;
const CURRENT_BLOCK_TIME = "May-29-2021 12:52:40";

module.exports = async function(deployer, a) {
  let startTime ='2021-05-29T18:00:00+08:00';
  let endTime =  '2021-05-29T20:00:00+08:00';

  // let offeringAmount = 4;
  // let raisingUSD = 4;
  let offeringAmount = 320000;
  let raisingUSD = 40000;
  let ticketTokenPrice = 1;
  let tickeTokenDecimals = 6;
  let minAmount = 1;
  let raisingAmount = formatDecimals(raisingUSD / ticketTokenPrice, 10);
  // CONFIG: tickerToken usdt
  const ticketToken = '0xD16bAbe52980554520F6Da505dF4d1b124c815a7';
  // CONFIG: offeringToken YUNGE
  const offeringToken = "0x07f823D3d011f7C612084f04D025F4a026F76afd";

  const proxyAdmin = "0x5cae3a434C9501fbe0a2E0b739A45F54fCF3Daf7";
  const ifoAdmin = "0x223Ad4931d272e1f9Fec562A47e34bC387e85c9F";
  const userProfileAddress = "0xC9866C73518e4696fa7Fc50f68462ADa0EEEDC0f"

  const startBlock = getBlockFromTime(
    startTime,
    CURRENT_BLOCK_NUMBER,
    CURRENT_BLOCK_TIME
  );
  const endBlock = getBlockFromTime(
    endTime,
    CURRENT_BLOCK_NUMBER,
    CURRENT_BLOCK_TIME
  );

  offeringAmount = numToHex(offeringAmount * Math.pow(10, 18));
  raisingAmount = numToHex(raisingAmount * Math.pow(10, tickeTokenDecimals));
  minAmount = numToHex(minAmount * Math.pow(10, tickeTokenDecimals));

  console.log("startBlock:", startBlock);
  console.log("endBlock:", endBlock);

  await deployer.deploy(IDOImpl);
  const ido = await IDOImpl.deployed();

  const abiEncodeData = web3.eth.abi.encodeFunctionCall(
    {
      inputs: [
        {
          internalType: "contract IORC20",
          name: "_token",
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
          internalType: "contract UserProfile",
          name: "_userProfile",
          type: "address"
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
      ticketToken,
      offeringToken,
      startBlock,
      endBlock,
      offeringAmount,
      raisingAmount,
      minAmount,
      userProfileAddress,
      ifoAdmin
    ]
  );

  await deployer.deploy(
    IDOUpgradeProxy,
    proxyAdmin,
    ido.address,
    abiEncodeData
  );
};
