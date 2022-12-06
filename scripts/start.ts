import { JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber, Contract, ethers, Wallet } from "ethers";
import Ganache from "ganache";
import express from "express";
import path from "path";
import fs from "fs/promises";

import Setup from "../artifacts/contracts/Setup.sol/Setup.json";

async function main() {
  const { attackerWallet, setup, randomWallet } = await ganache();
  expressServer(attackerWallet, setup, randomWallet);
}

async function expressServer(
  attackerWallet: Wallet,
  setup: Contract,
  randomWallet: Wallet,
) {
  const app = express();
  const indexPage = await fs.readFile(
    path.join(__dirname, "../public/index.html"),
  );
  const finalIndexPage = indexPage
    .toString()
    .replace("##SETUP-ADDR##", setup.address)
    .replace("##PRIVATE-KEY##", attackerWallet.privateKey);

  app.get("/", (req, res) => {
    res.send(finalIndexPage);
  });
  app.get("/index.html", (req, res) => {
    res.send(finalIndexPage);
  });
  app.get("/solved", async (req, res) => {
    const solved = await setup.isSolved();
    if (solved) {
      res.send(`Well done! <br> Here is your flag: HV22{H1dd3N_1n_V4n1Ty}`);
      return;
    } else {
      res.send("Nope!");
    }
  });

  app.get("/sign", async (req, res) => {
    let msg = req.query.msg as string;
    while (true) {
      const signature = await randomWallet.signMessage(msg);
      const splitted = ethers.utils.splitSignature(signature);
      if (splitted.v === 27) {
        res.send({
          msg,
          signature,
        });
        break;
      } else {
        msg += "_"
      }
    }
  });
  app.use(express.static(path.join(__dirname, "../public/")));

  app.listen("8080", () => {
    console.log("Express listening on 8080");
  });
}

async function ganache(): Promise<{
  attackerWallet: Wallet;
  setup: Contract;
  randomWallet: Wallet;
}> {
  return new Promise(async (resolve, reject) => {
    const server = Ganache.server({
      wallet: {
        totalAccounts: 1,
      },
      logging: {
        quiet: true,
      },
    });
    server.listen(8545, async (err) => {
      if (err) throw err;

      console.log(`ganache listening on port 8545...`);
      const ethersProvider = new JsonRpcProvider("http://127.0.0.1:8545");

      let randomWallet = Wallet.createRandom();
      randomWallet = randomWallet.connect(ethersProvider);
      console.log(`Random wallet: ${randomWallet.address}`);

      const initialAccounts = server.provider.getInitialAccounts();
      console.log(
        `Initial Accounts: ${Object.keys(initialAccounts).join(",")}`,
      );

      console.log("Draining all initial accounts");
      for (const key in initialAccounts) {
        let initialAccount = new Wallet(initialAccounts[key].secretKey);
        await initialAccount.connect(ethersProvider).sendTransaction({
          to: randomWallet.address,
          value: BigNumber.from(initialAccounts[key].balance).sub(
            BigNumber.from(21000).mul(3500000000),
          ),
        });
      }
      console.log(
        `Drained: ${randomWallet.address} = ${
          ethers.utils.formatEther(
            await ethersProvider.getBalance(randomWallet.address),
          )
        } ETH`,
      );

      const setup = await deploy(randomWallet);
      const attackerWallet = await fundAttacker(randomWallet);

      console.log(`==== Attacker ====`);
      console.log(`Address: ${attackerWallet.address}`);
      console.log(`Private Key: ${attackerWallet.privateKey}`);
      console.log(
        `Funds: ${
          ethers.utils.formatEther(
            await ethersProvider.getBalance(attackerWallet.address),
          )
        } ETH`,
      );
      console.log("Ready!");
      resolve({
        attackerWallet,
        setup,
        randomWallet,
      });
    });
  });
}

async function deploy(wallet: Wallet) {
  console.log("Deploying contracts");
  const setupFactory = new ethers.ContractFactory(
    Setup.abi,
    Setup.bytecode,
  ).connect(wallet);

  const setup = await setupFactory.connect(wallet).deploy();
  console.log(`Deployed Setup: ${setup.address}`);

  return setup;
}

async function fundAttacker(wallet: Wallet) {
  const randomWallet = Wallet.createRandom();
  await wallet.sendTransaction({
    to: randomWallet.address,
    value: ethers.utils.parseEther("1.5"),
  });
  return randomWallet;
}

main();
