"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modules_1 = require("@nomicfoundation/hardhat-ignition/modules");
exports.default = (0, modules_1.buildModule)("DeployMockUSDC", (m) => {
    const mockUSDC = m.contract("MockUSDC");
    return { mockUSDC };
});
