import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer, client1, freelancer1, client2, freelancer2] =
    await hre.ethers.getSigners();

  console.log("====================================================");
  console.log("🌱 Seeding PayTrust Protocol with Demo Data");
  console.log("====================================================");

  // Deploy Contract
  const PayTrustFactory = await hre.ethers.getContractFactory("PayTrust");
  const payTrust = await PayTrustFactory.deploy();
  await payTrust.waitForDeployment();
  const contractAddress = await payTrust.getAddress();
  console.log("📍 PayTrust Deployed at:", contractAddress);

  // Project 1: Full-Stack Web3 DApp (Active & Funded with 1 Milestone Paid, 1 Submitted, 1 Pending)
  console.log("\n📦 Creating Project 1: 'DeFi Liquidity Dashboard'");
  const tx1 = await payTrust
    .connect(client1)
    .createProject(
      "DeFi Liquidity Dashboard",
      freelancer1.address,
      [
        "UI Design & Wireframing in Figma",
        "Smart Contract Integration & Web3 Hooks",
        "Testnet Deployment & User Feedback Testing",
      ],
      [
        hre.ethers.parseEther("0.1"),
        hre.ethers.parseEther("0.2"),
        hre.ethers.parseEther("0.1"),
      ]
    );
  await tx1.wait();

  // Fund Project 1
  console.log("💰 Funding Project 1 with 0.4 ETH escrow...");
  const fundTx1 = await payTrust
    .connect(client1)
    .fundProject(1, { value: hre.ethers.parseEther("0.4") });
  await fundTx1.wait();

  // Milestone 0: Submit & Approve (Paid)
  console.log("🚀 Freelancer submits Milestone 0...");
  const subTx1 = await payTrust.connect(freelancer1).submitMilestone(1, 0);
  await subTx1.wait();

  console.log("✅ Client approves Milestone 0 (0.05% fee collected)...");
  const appTx1 = await payTrust.connect(client1).approveMilestone(1, 0);
  await appTx1.wait();

  // Milestone 1: Submit (Awaiting approval)
  console.log("🚀 Freelancer submits Milestone 1...");
  const subTx2 = await payTrust.connect(freelancer1).submitMilestone(1, 1);
  await subTx2.wait();

  // Project 2: Smart Contract Audit (Created, Unfunded)
  console.log("\n📦 Creating Project 2: 'ERC-20 Staking Protocol Audit'");
  const tx2 = await payTrust
    .connect(client2)
    .createProject(
      "ERC-20 Staking Protocol Audit",
      freelancer2.address,
      [
        "Static Analysis & Fuzzing",
        "Comprehensive Vulnerability Audit Report",
      ],
      [
        hre.ethers.parseEther("0.5"),
        hre.ethers.parseEther("0.5"),
      ]
    );
  await tx2.wait();

  // Project 3: Completed Project (Both milestones paid)
  console.log("\n📦 Creating Project 3: 'NFT Marketplace Landing Page'");
  const tx3 = await payTrust
    .connect(client1)
    .createProject(
      "NFT Marketplace Landing Page",
      freelancer2.address,
      ["Tailwind CSS UI Implementation", "WalletConnect & Minting Integration"],
      [hre.ethers.parseEther("0.15"), hre.ethers.parseEther("0.25")]
    );
  await tx3.wait();
  await (
    await payTrust
      .connect(client1)
      .fundProject(3, { value: hre.ethers.parseEther("0.40") })
  ).wait();
  await (await payTrust.connect(freelancer2).submitMilestone(3, 0)).wait();
  await (await payTrust.connect(client1).approveMilestone(3, 0)).wait();
  await (await payTrust.connect(freelancer2).submitMilestone(3, 1)).wait();
  await (await payTrust.connect(client1).approveMilestone(3, 1)).wait();

  // Save Config
  const network = await hre.ethers.provider.getNetwork();
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/PayTrust.sol/PayTrust.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const config = {
    address: contractAddress,
    network: network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    feeBps: 5,
    feePercent: "0.05%",
    abi: artifact.abi,
  };

  const frontendContractsDir = path.join(
    __dirname,
    "../frontend/src/contracts"
  );
  fs.writeFileSync(
    path.join(frontendContractsDir, "contractConfig.json"),
    JSON.stringify(config, null, 2)
  );

  console.log("\n====================================================");
  console.log("✨ Seeding Complete!");
  console.log("📍 Deployed Address:", contractAddress);
  const stats = await payTrust.getProtocolStats();
  console.log("📊 Total Projects   :", stats[0].toString());
  console.log("💰 Escrow Volume    :", hre.ethers.formatEther(stats[1]), "ETH");
  console.log("🏦 Total Fees       :", hre.ethers.formatEther(stats[2]), "ETH");
  console.log("🏦 Treasury Balance :", hre.ethers.formatEther(stats[3]), "ETH");
  console.log("====================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });