import { BigNumber, ethers, Wallet } from "ethers";

import Setup from "../artifacts/contracts/Setup.sol/Setup.json";
import Challenge from "../artifacts/contracts/Challenge.sol/Challenge.json";
import fetch from "node-fetch";

async function main() {
  if (process.argv.length < 3) {
    console.error("attack.ts SETUP");
    return;
  }

  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545",
  );

  if (!process.env.ETH_KEY) {
    console.error("No private key provided");
    return;
  }

  let attacker = new Wallet(process.env.ETH_KEY);
  attacker = attacker.connect(provider);

  const setup = new ethers.Contract(process.argv[2], Setup.abi).connect(
    attacker,
  );

  const challengeAddr = await setup.callStatic.challenge();
  const challenge = new ethers.Contract(challengeAddr, Challenge.abi).connect(
    attacker,
  );

  const msg = "22";
  const sigReq = await fetch("http://127.0.0.1:8080/sign?msg=" + msg);
  const signature = JSON.parse(await sigReq.text());
  console.log(signature)
  const splitted = ethers.utils.splitSignature(signature.signature);
  console.log(splitted);
  const newS = BigNumber.from(
    "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141",
  ).sub(BigNumber.from(splitted.s)).toHexString();
  const newSignature = `${splitted.r}${newS.replace('0x', '')}${splitted.v == 28 ? "1b" : "1c"}`;
  console.log(
    newSignature,
  );

  await challenge.solve(
    "0x0000000000000000000000000000000000000001",
    newSignature,
    ethers.utils.concat([
      ethers.utils.toUtf8Bytes("\x19Ethereum Signed Message:\n"),
      ethers.utils.toUtf8Bytes(String(signature.msg.length)),
      ethers.utils.toUtf8Bytes(signature.msg),
    ]),
  );
  
  const solved = await challenge.solved();

  console.log(`is solved: ${solved}`);
}

main();
