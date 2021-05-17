const SECONDS_PER_BLOCK = 3;

function numToHex(num) {
  return `0x${num.toString(16)}`;
}

function getBlockFromTime(time, knownBlock, knownBlockTime) {
  time = typeof time === "string" ? new Date(time) : time;
  knownBlockTime =
    typeof knownBlockTime === "string"
      ? new Date(knownBlockTime)
      : knownBlockTime;
  const seconds = Math.ceil((time.getTime() - knownBlockTime.getTime()) / 1000);

  return knownBlock + Math.floor(seconds / SECONDS_PER_BLOCK);
}

function formatDecimals(num, precision = 2) {
  const magicNum = Math.pow(10, precision);
  return Math.floor(num * magicNum) / magicNum;
}

module.exports = {
  numToHex,
  getBlockFromTime,
  formatDecimals
};
