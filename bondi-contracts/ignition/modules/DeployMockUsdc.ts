import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DeployMockUSDC", (m) => {
  console.log("Starting MockUSDC deployment...");
  
  console.log("Deploying new MockUSDC contract");
  const mockUSDC = m.contract("MockUSDC");
  console.log("MockUSDC contract created successfully");
  
  console.log("MockUSDC deployment initiated. Address will be available after deployment.");
  
  return { mockUSDC };
});