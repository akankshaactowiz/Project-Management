import crypto from "crypto";

export const generateFeedId = () => {
  const buffer = crypto.randomBytes(2); // 2 bytes = 16 bits
  const randomNum = buffer.readUInt16BE(0) % 9000 + 1000; // 1000–9999
  return randomNum;
};
