const IDOImpl = artifacts.require("IDOImpl");
const IDOUpgradeProxy = artifacts.require("IDOUpgradeProxy");

const Web3 = require("web3");
const { numToHex, getBlockFromTime, formatDecimals } = require("../utils");
const web3 = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org")
);

const CURRENT_BLOCK_NUMBER = 548824;
const CURRENT_BLOCK_TIME = "May-19-2021 13:59:02";

module.exports = async function(deployer, a) {
  let beginTime = "2021-05-19T14:10:00+08:00";
  let endTime = "2021-05-19T14:20:00+08:00";

  let offeringAmount = 320000;
  let raisingUSD = 40000;
  let raisingTokenPrice = 1;
  let raisingAmount = formatDecimals(raisingUSD / raisingTokenPrice, 10);
  let minAmount = 1;
  // CONFIG: token usdt
  const token = '0xD16bAbe52980554520F6Da505dF4d1b124c815a7';
  // CONFIG: offeringToken xxx
  const offeringToken = "0xD16bAbe52980554520F6Da505dF4d1b124c815a7";

  const proxyAdmin = "0x5cae3a434C9501fbe0a2E0b739A45F54fCF3Daf7";
  const ifoAdmin = "0x5cae3a434C9501fbe0a2E0b739A45F54fCF3Daf7";
  const userProfileAddress = "0xC9866C73518e4696fa7Fc50f68462ADa0EEEDC0f"

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
      token,
      offeringToken,
      startBlock,
      endBlock,
      offeringAmount,
      raisingAmount,
      minAmount,
      userProfileAddress,
      adminAddress
    ]
  );

  await deployer.deploy(
    IDOUpgradeProxy,
    proxyAdmin,
    ido.address,
    abiEncodeData
  );
};
