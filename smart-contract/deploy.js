const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("Starting deployment...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract with the account:", deployer.address);
    
    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "MON");

    // Payment address from environment
    const paymentAddress = process.env.NEXT_PUBLIC_PAYMENT_ADDRESS || "0x76914803b100Df11D1329e7F916F83B72bb4A508";
    console.log("Payment address:", paymentAddress);

    // Deploy the contract
    console.log("Deploying GameRegistration contract...");
    const GameRegistration = await ethers.getContractFactory("GameRegistration");
    const gameRegistration = await GameRegistration.deploy(paymentAddress);
    
    console.log("Waiting for deployment confirmation...");
    await gameRegistration.deployed();

    console.log("✅ GameRegistration deployed to:", gameRegistration.address);
    console.log("✅ Transaction hash:", gameRegistration.deployTransaction.hash);
    console.log("✅ Payment address set to:", paymentAddress);
    
    // Verify deployment
    const deployedPaymentAddress = await gameRegistration.paymentAddress();
    const registrationFee = await gameRegistration.REGISTRATION_FEE();
    
    console.log("\n📋 Contract Details:");
    console.log("Contract Address:", gameRegistration.address);
    console.log("Payment Address:", deployedPaymentAddress);
    console.log("Registration Fee:", ethers.utils.formatEther(registrationFee), "MON");
    
    console.log("\n🔧 Next Steps:");
    console.log("1. Update .env.local with NEXT_PUBLIC_GAME_CONTRACT_ADDRESS=" + gameRegistration.address);
    console.log("2. Verify the contract on Monad Explorer if needed");
    console.log("3. Test the contract functions");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n✅ Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment script error:", error);
    process.exit(1);
  });
