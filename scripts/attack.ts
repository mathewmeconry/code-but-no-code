import {Wallet, ethers} from "ethers";

import Setup from "../artifacts/contracts/Setup.sol/Setup.json";
import Challenge from "../artifacts/contracts/Challenge.sol/Challenge.json";

async function main() {
  if (process.argv.length < 4) {
    console.error("attack.ts SETUP TARGET DATA");
    return;
  }
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  if (!process.env.ETH_KEY) {
    console.error("No private key provided");
    return;
  }

  let attacker = new Wallet(process.env.ETH_KEY);
  attacker = attacker.connect(provider);

  const setup = new ethers.Contract(process.argv[2], Setup.abi).connect(
    attacker
  );

  const challengeAddr = await setup.callStatic.challenge();
  const challenge = new ethers.Contract(challengeAddr, Challenge.abi).connect(
    attacker
  );

  await challenge.solve(process.argv[3], process.argv[4]);
  const solved = await setup.isSolved();

  console.log(`is solved: ${solved}`);
}

main();
