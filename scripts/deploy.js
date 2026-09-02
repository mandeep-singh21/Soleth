import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log("====================================================");
  console.log("🚀 Deploying PayTrust Smart Contract");
  console.log("====================================================");
  console.log("Deployer Address :", deployer.address);
  console.log("Network Name     :", network.name);
  console.log("Chain ID         :", network.chainId.toString());

  const deployerBalance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer Balance :", hre.ethers.formatEther(deployerBalance), "ETH");
  console.log("----------------------------------------------------");

  const PayTrustFactory = await hre.ethers.getContractFactory("PayTrust");
  const payTrust = await PayTrustFactory.deploy();
  await payTrust.waitForDeployment();

  const contractAddress = await payTrust.getAddress();
  console.log("✅ PayTrust deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("👑 Protocol Owner   :", await payTrust.owner());
  console.log("💰 Protocol Fee     : 0.05% (5 BPS)");
  console.log("====================================================");

  // Read Artifact ABI
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/PayTrust.sol/PayTrust.json"
  );
  let abi = [];
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    abi = artifact.abi;
  }

  // Contract Config Payload
  const config = {
    address: contractAddress,
    network: network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    feeBps: 5,
    feePercent: "0.05%",
    abi: abi,
  };

  // Save to frontend directory
  const frontendContractsDir = path.join(__dirname, "../frontend/src/contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(frontendContractsDir, "contractConfig.json"),
    JSON.stringify(config, null, 2)
  );

  // Save to root deployments
  fs.writeFileSync(
    path.join(__dirname, "../deployedConfig.json"),
    JSON.stringify(config, null, 2)
  );

  console.log("📁 Configuration exported to:");
  console.log("  - frontend/src/contracts/contractConfig.json");
  console.log("  - deployedConfig.json");
  console.log("====================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });