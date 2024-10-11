import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DeployMockUSDC", (m) => {
  const mockUSDC = m.contract("MockUSDC");

  return { mockUSDC };
});