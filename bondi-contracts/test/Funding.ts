import {
	time,
	loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { MockUSDC, Funding, InvestorNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

// Expressed in wei
const MINIMUM_INVESTMENT_AMOUNT = 1000000000n; // 1 Gwei
const TARGET_AMOUNT = 1000000000000000000n; // 1 Eth
const THIRTY_DAYS = 30;
const THIRTY_DAYS_IN_SECONDS = THIRTY_DAYS * 86400;

describe("Funding", function () {
	let funding: Funding;
	let usdc: MockUSDC;
	let whale: InvestorNFT;
	let og: InvestorNFT;
	let owner: SignerWithAddress;
	let otherAccount: SignerWithAddress;
	let emptyAccount: SignerWithAddress;

	// We define a fixture to reuse the same setup in every test.
	// We use loadFixture to run this setup once, snapshot that state,
	// and reset Hardhat Network to that snapshot in every test.
	async function deployFundingFixture() {
		// Contracts are deployed using the first signer/account by default
		const [owner_, otherAccount_, emptyAccount_] = await hre.ethers.getSigners();

		owner = owner_;
		otherAccount = otherAccount_;
		emptyAccount = emptyAccount_;
		const USDCMock = await hre.ethers.getContractFactory("MockUSDC");
		usdc = await USDCMock.deploy();

		const Funding = await hre.ethers.getContractFactory("Funding");
		funding = await Funding.deploy(
			MINIMUM_INVESTMENT_AMOUNT,
			TARGET_AMOUNT,
			THIRTY_DAYS,
			await usdc.getAddress()
		);

		const WhaleNFT = await hre.ethers.getContractFactory("InvestorNFT");
		whale = await WhaleNFT.deploy("Whale", "WHL", funding);
		const OgNFT = await hre.ethers.getContractFactory("InvestorNFT");
		og = await OgNFT.deploy("OG", "OG", funding);

		return { usdc, funding, owner, otherAccount };
	}

	describe("Funding - Deployment", () => {
		describe("Failed deployment", () => {
			it("Should fail with zero minimumInvestmentAmount", async () => {
				const [owner_] = await hre.ethers.getSigners();
				const USDCMock = await hre.ethers.getContractFactory("MockUSDC");
				const usdc_ = await USDCMock.deploy();

				const Funding = await hre.ethers.getContractFactory("Funding");
				await expect(Funding.deploy(
					0n,
					TARGET_AMOUNT,
					THIRTY_DAYS,
					await usdc_.getAddress()
				)).to.be.revertedWithCustomError(Funding, "FundingMinimumCannotBeZero");
			});
			it("Should fail with zero targetAmount", async () => {
				const [owner_] = await hre.ethers.getSigners();
				const USDCMock = await hre.ethers.getContractFactory("MockUSDC");
				const usdc_ = await USDCMock.deploy();

				const Funding = await hre.ethers.getContractFactory("Funding");
				await expect(Funding.deploy(
					MINIMUM_INVESTMENT_AMOUNT,
					0n,
					THIRTY_DAYS,
					await usdc_.getAddress()
				)).to.be.revertedWithCustomError(Funding, "FundingTargetCannotBeZero");
			});
			it("Should fail with old fundingPeriodLimit", async () => {
				const [owner_] = await hre.ethers.getSigners();
				const USDCMock = await hre.ethers.getContractFactory("MockUSDC");
				const usdc_ = await USDCMock.deploy();

				const Funding = await hre.ethers.getContractFactory("Funding");
				await expect(Funding.deploy(
					MINIMUM_INVESTMENT_AMOUNT,
					TARGET_AMOUNT,
					0,
					await usdc_.getAddress()
				)).to.be.revertedWithCustomError(Funding, "FundingPeriodCannotBeZero");
			});
			it("Should fail with zero address USDC", async () => {
				const Funding = await hre.ethers.getContractFactory("Funding");
				await expect(Funding.deploy(
					MINIMUM_INVESTMENT_AMOUNT,
					TARGET_AMOUNT,
					THIRTY_DAYS,
					hre.ethers.ZeroAddress
				)).to.be.revertedWithCustomError(Funding, "FundingCannotBeZeroAddress");
			});
		});
		describe("Successful deployment", () => {
			beforeEach(async () => {
				await loadFixture(deployFundingFixture);
			});
			it("Should set the right targetAmount", async function () {
				expect(await funding.targetAmount()).to.equal(TARGET_AMOUNT);
			});
	
			it("Should set the right usdcToken", async function () {
				const usdcAddress = await usdc.getAddress();
	
				expect(await funding.usdcToken()).to.equal(usdcAddress);
			});
	
			it("Should set the right owner", async function () {
				const ownerAddress = await owner.getAddress();
				const DEFAULT_ADMIN_ROLE = await funding.DEFAULT_ADMIN_ROLE();
	
				expect(await funding.hasRole(DEFAULT_ADMIN_ROLE, ownerAddress)).to.be.true;
			});
	
			it("Should set the right owner", async function () {
				const ownerAddress = await owner.getAddress();
				const DEFAULT_ADMIN_ROLE = await funding.DEFAULT_ADMIN_ROLE();
	
				expect(await funding.hasRole(DEFAULT_ADMIN_ROLE, ownerAddress)).to.be.true;
			});
		});
	});

	describe("Funding - Variable Setters", () => {
		describe("Failed set", () => {
			beforeEach(async () => {
				await loadFixture(deployFundingFixture);
			});
			it("Should fail setting the targetAmount due to smaller amount", async () => {
				const newTargetAmount = TARGET_AMOUNT - 100000000000n;
				await expect(funding.setTargetAmount(newTargetAmount)).to.be.revertedWithCustomError(funding, "FundingTargetTooSmall");
				expect(await funding.targetAmount()).to.equal(TARGET_AMOUNT);
			});
			it("Should fail setting the fundingPeriodLimit for being zero", async () => {
				const newFundingPeriodLimitInDays = 0;
				await expect(funding.incrementFundingPeriodLimit(newFundingPeriodLimitInDays)).to.be.revertedWithCustomError(funding, "FundingPeriodCannotBeZero");
			});
			it("Should fail setting the minimumInvestmentAmount due to zero", async () => {
				const newMinimumInvestmentAmount = 0n;
				await expect(funding.setMinimumInvestmentAmount(newMinimumInvestmentAmount)).to.be.revertedWithCustomError(funding, "FundingMinimumCannotBeZero");
			});
			it("Should fail setting the whaleNFT address due to zero", async () => {
				const whaleNFT = ethers.ZeroAddress;
				await expect(funding.setWhaleNFTAddress(whaleNFT)).to.be.revertedWithCustomError(funding, "InvestorNFTCannotBeZeroAddress");
			});
			it("Should fail setting the ogNFT address due to zero", async () => {
				const ogNFT = ethers.ZeroAddress;
				await expect(funding.setOgNFTAddress(ogNFT)).to.be.revertedWithCustomError(funding, "InvestorNFTCannotBeZeroAddress");
			});
			describe("Failed set - Not DEFAULT_ADMIN_ROLE", () => {
				it("Should fail setting the targetAmount due to role", async () => {
					const newTargetAmount = TARGET_AMOUNT + 100000000000n;
					await expect(funding.connect(otherAccount).setTargetAmount(newTargetAmount)).to.be.revertedWithCustomError(funding, "AccessControlUnauthorizedAccount");
					expect(await funding.targetAmount()).to.equal(TARGET_AMOUNT);
				});
				it("Should fail setting the fundingPeriodLimit due to role", async () => {
					const newFundingPeriodLimitInDays = THIRTY_DAYS + THIRTY_DAYS;
					await expect(funding.connect(otherAccount).incrementFundingPeriodLimit(newFundingPeriodLimitInDays)).to.be.revertedWithCustomError(funding, "AccessControlUnauthorizedAccount");
				});
				it("Should fail setting the minimumInvestmentAmount due to role", async () => {
					const newMinimumInvestmentAmount = MINIMUM_INVESTMENT_AMOUNT + 1000000n;
					await expect(funding.connect(otherAccount).setMinimumInvestmentAmount(newMinimumInvestmentAmount)).to.be.revertedWithCustomError(funding, "AccessControlUnauthorizedAccount");
				});
				it("Should fail setting the whaleNFT due to role", async () => {
					await expect(funding.connect(otherAccount).setWhaleNFTAddress(whale)).to.be.revertedWithCustomError(funding, "AccessControlUnauthorizedAccount");
				});
				it("Should fail setting the ogNFT due to role", async () => {
					await expect(funding.connect(otherAccount).setOgNFTAddress(og)).to.be.revertedWithCustomError(funding, "AccessControlUnauthorizedAccount");
				});
			});
		});

		describe("Successful set", () => {
			beforeEach(async () => {
				await loadFixture(deployFundingFixture);
			});
			it("Should set the targetAmount", async () => {
				const newTargetAmount = TARGET_AMOUNT + 100000000000n;
				expect(await funding.setTargetAmount(newTargetAmount)).not.to.be.reverted;
				expect(await funding.targetAmount()).to.equal(newTargetAmount);
			});
			it("Should set the fundingPeriodLimit", async () => {
				const newFundingPeriodLimit = THIRTY_DAYS;
				expect(await funding.incrementFundingPeriodLimit(newFundingPeriodLimit)).not.to.be.reverted;
			});
			it("Should set the minimumInvestmentAmount", async () => {
				const newMinimumInvestmentAmount = MINIMUM_INVESTMENT_AMOUNT + 1000000n;
				expect(await funding.setMinimumInvestmentAmount(newMinimumInvestmentAmount)).not.to.be.reverted;
			});
			it("Should set the whaleNFT address", async () => {
				await expect(funding.setWhaleNFTAddress(whale)).not.to.be.reverted;
			});
			it("Should set the ogNFT address", async () => {
				await expect(funding.setOgNFTAddress(og)).not.to.be.reverted;
			});
			describe("Successful set - Paused", () => {
				beforeEach(async () => {
					await funding.pause();
				});
				it("Should set the targetAmount", async () => {
					const newTargetAmount = TARGET_AMOUNT + 100000000000n;
					expect(await funding.setTargetAmount(newTargetAmount)).not.to.be.reverted;
					expect(await funding.targetAmount()).to.equal(newTargetAmount);
				});
				it("Should set the fundingPeriodLimit", async () => {
					const newFundingPeriodLimit = THIRTY_DAYS;
					expect(await funding.incrementFundingPeriodLimit(newFundingPeriodLimit)).not.to.be.reverted;
				});
				it("Should set the minimumInvestmentAmount", async () => {
					const newMinimumInvestmentAmount = MINIMUM_INVESTMENT_AMOUNT + 1000000n;
					expect(await funding.setMinimumInvestmentAmount(newMinimumInvestmentAmount)).not.to.be.reverted;
				});
				it("Should set the whaleNFT address", async () => {
					await expect(funding.setWhaleNFTAddress(whale)).not.to.be.reverted;
				});
				it("Should set the ogNFT address", async () => {
					await expect(funding.setOgNFTAddress(og)).not.to.be.reverted;
				});
			});
		});
	});

	describe("Funding - Investing", () => {
		describe("Failed Investing", () => {
			beforeEach(async () => {
				await loadFixture(deployFundingFixture);
				const otherAccountAddress = await otherAccount.getAddress();
				await usdc.transfer(otherAccountAddress, BigInt(5 * 10 ** 18));
			});
			it("Should fail when investing without setting whale or og address", async () => {
				await expect(funding.invest(MINIMUM_INVESTMENT_AMOUNT)).to.be.revertedWithCustomError(funding, "InvestorNFTCannotBeZeroAddress");
			});
			it("Should fail when investing without setting whale address", async () => {
				await funding.setOgNFTAddress(og);
				await expect(funding.invest(MINIMUM_INVESTMENT_AMOUNT)).to.be.revertedWithCustomError(funding, "InvestorNFTCannotBeZeroAddress");
			});
			it("Should fail when investing without setting og address", async () => {
				await funding.setWhaleNFTAddress(whale);
				await expect(funding.invest(MINIMUM_INVESTMENT_AMOUNT)).to.be.revertedWithCustomError(funding, "InvestorNFTCannotBeZeroAddress");
			});
			it("Should fail when investing after fundingPeriod has finished", async () => {
				await funding.setWhaleNFTAddress(whale);
				await funding.setOgNFTAddress(og);
				// We increase the time in Hardhat Network
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				await usdc.connect(otherAccount).approve(funding, MINIMUM_INVESTMENT_AMOUNT);
				await expect(funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT)).to.be.revertedWithCustomError(funding, "FundingPeriodFinished");
			});
			it("Should fail when investing exceeding targetAmount with first investment", async () => {
				await funding.setWhaleNFTAddress(whale);
				await funding.setOgNFTAddress(og);
				await usdc.connect(otherAccount).approve(funding, TARGET_AMOUNT + 100n);
				await expect(funding.connect(otherAccount).invest(TARGET_AMOUNT + 100n)).to.be.revertedWithCustomError(funding, "FundingExceedsTargetAmount");
			});
			it("Should fail when investing exceeding targetAmount with later investment", async () => {
				await funding.setWhaleNFTAddress(whale);
				await funding.setOgNFTAddress(og);
				await usdc.connect(otherAccount).approve(funding, TARGET_AMOUNT + MINIMUM_INVESTMENT_AMOUNT);
				await funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
				await expect(funding.connect(otherAccount).invest(TARGET_AMOUNT)).to.be.revertedWithCustomError(funding, "FundingExceedsTargetAmount");
			});
			it("Should fail when investing less than minimumInvestmentAmount", async () => {
				await funding.setWhaleNFTAddress(whale);
				await funding.setOgNFTAddress(og);
				await usdc.connect(otherAccount).approve(funding, MINIMUM_INVESTMENT_AMOUNT - 100n);
				await expect(funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT - 100n)).to.be.revertedWithCustomError(funding, "FundingBelowMinimum");
			});
			it("Should fail when investor doesn't have enough balance", async () => {
				await funding.setWhaleNFTAddress(whale);
				await funding.setOgNFTAddress(og);
				await expect(funding.connect(emptyAccount).invest(MINIMUM_INVESTMENT_AMOUNT)).to.be.revertedWithCustomError(funding, "FundingInsufficientBalance");
			});
			it("Should fail when paused", async () => {
				await funding.setWhaleNFTAddress(whale);
				await funding.setOgNFTAddress(og);
				await funding.pause();
				await usdc.connect(otherAccount).approve(funding, MINIMUM_INVESTMENT_AMOUNT);
				await expect(funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT)).to.be.revertedWithCustomError(funding, "EnforcedPause");
			});
		});

		describe("Successful Investing", () => {
			beforeEach(async () => {
				await loadFixture(deployFundingFixture);
				await usdc.transfer(otherAccount, BigInt(5000 * 10 ** 18));
				await funding.setWhaleNFTAddress(whale);
				await funding.setOgNFTAddress(og);
			});
			it("Should invest minimum from otherAccount", async () => {
				await usdc.connect(otherAccount).approve(funding, MINIMUM_INVESTMENT_AMOUNT);
				// Investor hasn't invested yet so is unregistered
				const investorBefore = await funding.investedAmountPerInvestor(otherAccount);
				expect(investorBefore.investedAmount).to.equal(0n);
				expect(investorBefore.investorIndex).to.equal(0n);
				// Invest
				await expect(funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT)).to.emit(funding, "InvestmentMade");
				// Investor has invested, so is registered
				const investorAfter = await funding.investedAmountPerInvestor(otherAccount);
				expect(investorAfter.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(investorAfter.investorIndex).to.equal(0);
				expect(await og.balanceOf(otherAccount)).to.equal(1);
				// Total contract balance of USDC
				expect(BigInt(await usdc.balanceOf(funding))).to.equal(MINIMUM_INVESTMENT_AMOUNT);
			});
			it("Should invest WHALE_INVESTOR_THRESHOLD from otherAccount", async () => {
				const WHALE_INVESTOR_THRESHOLD = BigInt(5000 * 10 ** 18);
				await funding.setTargetAmount(BigInt(6000 * 10 ** 18));
				await usdc.connect(otherAccount).approve(funding, WHALE_INVESTOR_THRESHOLD);
				// Investor hasn't invested yet so is unregistered
				const investorBefore = await funding.investedAmountPerInvestor(otherAccount);
				expect(investorBefore.investedAmount).to.equal(0n);
				expect(investorBefore.investorIndex).to.equal(0n);
				expect(await og.balanceOf(otherAccount)).to.equal(0);
				expect(await whale.balanceOf(otherAccount)).to.equal(0);
				// Invest
				await expect(funding.connect(otherAccount).invest(WHALE_INVESTOR_THRESHOLD)).to.emit(funding, "InvestmentMade");
				// Investor has invested, so is registered
				const investorAfter = await funding.investedAmountPerInvestor(otherAccount);
				expect(investorAfter.investedAmount).to.equal(WHALE_INVESTOR_THRESHOLD);
				expect(investorAfter.investorIndex).to.equal(0);
				expect(await og.balanceOf(otherAccount)).to.equal(1);
				expect(await whale.balanceOf(otherAccount)).to.equal(1);
				// Total contract balance of USDC
				expect(BigInt(await usdc.balanceOf(funding))).to.equal(WHALE_INVESTOR_THRESHOLD);
			});
			it("Should invest minimum twice from 2 accounts", async () => {
				await usdc.connect(otherAccount).approve(funding, MINIMUM_INVESTMENT_AMOUNT);
				await usdc.approve(funding, MINIMUM_INVESTMENT_AMOUNT);
				// Investor otherAccount hasn't invested yet so is unregistered
				const otherAccountBefore = await funding.investedAmountPerInvestor(otherAccount);
				expect(otherAccountBefore.investedAmount).to.equal(0n);
				expect(otherAccountBefore.investorIndex).to.equal(0n);
				// Investor owner hasn't invested yet so is unregistered
				const ownerBefore = await funding.investedAmountPerInvestor(otherAccount);
				expect(ownerBefore.investedAmount).to.equal(0n);
				expect(ownerBefore.investorIndex).to.equal(0n);
				// Invest
				await expect(funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT)).to.emit(funding, "InvestmentMade");
				await expect(funding.invest(MINIMUM_INVESTMENT_AMOUNT)).to.emit(funding, "InvestmentMade");
				// Investor otherAccount has invested, so is registered
				const otherAccountAfter = await funding.investedAmountPerInvestor(otherAccount);
				expect(otherAccountAfter.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(otherAccountAfter.investorIndex).to.equal(0);
				// Investor has invested, so is registered
				const ownerAfter = await funding.investedAmountPerInvestor(owner);
				expect(ownerAfter.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(ownerAfter.investorIndex).to.equal(1);
				// Total contract balance of USDC
				expect(BigInt(await usdc.balanceOf(funding))).to.equal(2n * MINIMUM_INVESTMENT_AMOUNT);
			});
		});
	});

	describe("Funding - Withdrawing", () => {
		describe("Investment and Withdrawal consistency", () => {
			beforeEach(async () => {
				await loadFixture(deployFundingFixture);
				await usdc.transfer(otherAccount, BigInt(3 * 10 ** 18));
				await usdc.transfer(emptyAccount, BigInt(3 * 10 ** 18));
				await usdc.approve(funding, BigInt(3 * 10 ** 18));
				await usdc.connect(emptyAccount).approve(funding, BigInt(3 * 10 ** 18));
				await usdc.connect(otherAccount).approve(funding, BigInt(3 * 10 ** 18));
				await funding.setWhaleNFTAddress(whale);
				await funding.setOgNFTAddress(og);
			});
			it("First investor is removed", async () => {
				const ownerBefore = await funding.investedAmountPerInvestor(owner);
				expect(ownerBefore.investedAmount).to.equal(0n);
				expect(ownerBefore.investorIndex).to.equal(0n);
				await funding.invest(MINIMUM_INVESTMENT_AMOUNT);
				// reach funding period limit
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				const ownerMiddle = await funding.investedAmountPerInvestor(owner);
				expect(ownerMiddle.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(ownerMiddle.investorIndex).to.equal(0n);
				await funding.withdraw();
				const ownerAfter = await funding.investedAmountPerInvestor(owner);
				expect(ownerAfter.investedAmount).to.equal(0n);
				expect(ownerAfter.investorIndex).to.equal(0n);
			});
			it("First investor is removed and last investor moves to be the first one", async () => {
				// _investors = [];
				await funding.connect(emptyAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
				const emptyInvested = await funding.investedAmountPerInvestor(emptyAccount);
				expect(emptyInvested.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(emptyInvested.investorIndex).to.equal(0n);
				// _investors = [empty];
				await funding.invest(MINIMUM_INVESTMENT_AMOUNT);
				const ownerInvested = await funding.investedAmountPerInvestor(owner);
				expect(ownerInvested.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(ownerInvested.investorIndex).to.equal(1n);
				// _investors = [empty, owner];
				await funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
				const otherInvested = await funding.investedAmountPerInvestor(otherAccount);
				expect(otherInvested.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(otherInvested.investorIndex).to.equal(2n);
				// _investors = [empty, owner, other];
				// reach funding period limit
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				// withdraw first investor
				await funding.connect(emptyAccount).withdraw();
				// _investors = [other, owner];
				const emptyWithdrawn = await funding.investedAmountPerInvestor(emptyAccount);
				expect(emptyWithdrawn.investedAmount).to.equal(0n);
				expect(emptyWithdrawn.investorIndex).to.equal(0n);
				const ownerWithdrawn = await funding.investedAmountPerInvestor(owner);
				expect(ownerWithdrawn.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(ownerWithdrawn.investorIndex).to.equal(1n);
				const otherWithdrawn = await funding.investedAmountPerInvestor(otherAccount);
				expect(otherWithdrawn.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(otherWithdrawn.investorIndex).to.equal(0n);
			});
			it("Middle investor is removed and last investor moves to be the second one", async () => {
				// _investors = [];
				await funding.connect(emptyAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
				const emptyInvested = await funding.investedAmountPerInvestor(emptyAccount);
				expect(emptyInvested.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(emptyInvested.investorIndex).to.equal(0n);
				// _investors = [empty];
				await funding.invest(MINIMUM_INVESTMENT_AMOUNT);
				const ownerInvested = await funding.investedAmountPerInvestor(owner);
				expect(ownerInvested.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(ownerInvested.investorIndex).to.equal(1n);
				// _investors = [empty, owner];
				await funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
				const otherInvested = await funding.investedAmountPerInvestor(otherAccount);
				expect(otherInvested.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(otherInvested.investorIndex).to.equal(2n);
				// _investors = [empty, owner, other];
				// reach funding period limit
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				// withdraw middle investor
				await funding.withdraw();
				// _investors = [empty, other];
				const emptyWithdrawn = await funding.investedAmountPerInvestor(emptyAccount);
				expect(emptyWithdrawn.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(emptyWithdrawn.investorIndex).to.equal(0n);
				const ownerWithdrawn = await funding.investedAmountPerInvestor(owner);
				expect(ownerWithdrawn.investedAmount).to.equal(0n);
				expect(ownerWithdrawn.investorIndex).to.equal(0n);
				const otherWithdrawn = await funding.investedAmountPerInvestor(otherAccount);
				expect(otherWithdrawn.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(otherWithdrawn.investorIndex).to.equal(1n);
			});
			it("Last investor is removed and others don't change", async () => {
				// _investors = [];
				await funding.connect(emptyAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
				const emptyInvested = await funding.investedAmountPerInvestor(emptyAccount);
				expect(emptyInvested.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(emptyInvested.investorIndex).to.equal(0n);
				// _investors = [empty];
				await funding.invest(MINIMUM_INVESTMENT_AMOUNT);
				const ownerInvested = await funding.investedAmountPerInvestor(owner);
				expect(ownerInvested.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(ownerInvested.investorIndex).to.equal(1n);
				// _investors = [empty, owner];
				await funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
				const otherInvested = await funding.investedAmountPerInvestor(otherAccount);
				expect(otherInvested.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(otherInvested.investorIndex).to.equal(2n);
				// _investors = [empty, owner, other];
				// reach funding period limit
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				// withdraw last investor
				await funding.connect(otherAccount).withdraw();
				// _investors = [empty,owner];
				const emptyWithdrawn = await funding.investedAmountPerInvestor(emptyAccount);
				expect(emptyWithdrawn.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(emptyWithdrawn.investorIndex).to.equal(0n);
				const ownerWithdrawn = await funding.investedAmountPerInvestor(owner);
				expect(ownerWithdrawn.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(ownerWithdrawn.investorIndex).to.equal(1n);
				const otherWithdrawn = await funding.investedAmountPerInvestor(otherAccount);
				expect(otherWithdrawn.investedAmount).to.equal(0n);
				expect(otherWithdrawn.investorIndex).to.equal(0n);
			});
		});
		describe("Failed Withdrawing", () => {
			beforeEach(async () => {
				await loadFixture(deployFundingFixture);
				const otherAccountAddress = await otherAccount.getAddress();
				await usdc.transfer(otherAccountAddress, BigInt(5 * 10 ** 18));
				await usdc.approve(funding, BigInt(5 * 10 ** 18));
				await usdc.connect(otherAccount).approve(funding, BigInt(5 * 10 ** 18));
				await funding.setWhaleNFTAddress(whale);
				await funding.setOgNFTAddress(og);
				await funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
			});
			it("Should fail when funding period is ongoing", async () => {
				await expect(funding.connect(otherAccount).withdraw()).to.be.revertedWithCustomError(funding, "FundingPeriodOngoing");
			});
			it("Should fail when funding targetAmount has been reached", async () => {
				await funding.connect(otherAccount).invest(TARGET_AMOUNT - MINIMUM_INVESTMENT_AMOUNT);
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				await expect(funding.connect(otherAccount).withdraw()).to.be.revertedWithCustomError(funding, "FundingTargetAmountReached");
			});
			it("Should fail when there are no investors to refund", async () => {
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				await funding.connect(otherAccount).withdraw();
				await expect(funding.connect(otherAccount).withdraw()).to.be.revertedWithCustomError(funding, "FundingNoInvestorsToRefund");
			});
			it("Should fail when withdrawer is not registered as investor", async () => {
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				await expect(funding.connect(emptyAccount).withdraw()).to.be.revertedWithCustomError(funding, "FundingNoRegisteredFunds");
			});
			it("Should fail when investor has withdrawn all their funds", async () => {
				await funding.invest(MINIMUM_INVESTMENT_AMOUNT);
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				await funding.connect(otherAccount).withdraw();
				await expect(funding.connect(otherAccount).withdraw()).to.be.revertedWithCustomError(funding, "FundingNoRegisteredFunds");
			});
			it("Should fail when paused", async () => {
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				await funding.pause();
				await expect(funding.connect(otherAccount).withdraw()).to.be.revertedWithCustomError(funding, "EnforcedPause");
			});
		});
		describe("Successful Withdrawing", () => {
			beforeEach(async () => {
				await loadFixture(deployFundingFixture);
				const otherAccountAddress = await otherAccount.getAddress();
				await usdc.transfer(otherAccountAddress, BigInt(5 * 10 ** 18));
				await usdc.approve(funding, BigInt(5 * 10 ** 18));
				await funding.setWhaleNFTAddress(whale);
				await funding.setOgNFTAddress(og);
				await funding.invest(MINIMUM_INVESTMENT_AMOUNT);
				await usdc.connect(otherAccount).approve(funding, BigInt(5 * 10 ** 18));
				await funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
			});
			it("Should withdraw when fundingPeriod ended and target hasn't been reached", async () => {
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				const balanceBeforeRefund = await usdc.balanceOf(otherAccount);
				await expect(funding.connect(otherAccount).withdraw()).to.emit(funding, "WithdrawalMade");
				expect(await usdc.balanceOf(otherAccount)).to.equal(balanceBeforeRefund + MINIMUM_INVESTMENT_AMOUNT);
			});
			it("Should withdraw when fundingPeriod ended and target hasn't been reached, from two accounts", async () => {
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				const balanceBeforeRefund = await usdc.balanceOf(otherAccount);
				await expect(funding.connect(otherAccount).withdraw()).to.emit(funding, "WithdrawalMade");
				await expect(funding.withdraw()).to.emit(funding, "WithdrawalMade");
				expect(await usdc.balanceOf(otherAccount)).to.equal(balanceBeforeRefund + MINIMUM_INVESTMENT_AMOUNT);
			});
		});
	});

	describe("Funding - Refunding", () => {
		describe("Investment and Refunding consistency", () => {
			beforeEach(async () => {
				await loadFixture(deployFundingFixture);
				await usdc.transfer(otherAccount, BigInt(3 * 10 ** 18));
				await usdc.transfer(emptyAccount, BigInt(3 * 10 ** 18));
				await usdc.approve(funding, BigInt(3 * 10 ** 18));
				await usdc.connect(emptyAccount).approve(funding, BigInt(3 * 10 ** 18));
				await usdc.connect(otherAccount).approve(funding, BigInt(3 * 10 ** 18));
				await funding.setWhaleNFTAddress(whale);
				await funding.setOgNFTAddress(og);

				// _investors = [];
				await funding.connect(emptyAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
				const emptyInvested = await funding.investedAmountPerInvestor(emptyAccount);
				expect(emptyInvested.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(emptyInvested.investorIndex).to.equal(0n);
				// _investors = [empty];
				await funding.invest(MINIMUM_INVESTMENT_AMOUNT);
				const ownerInvested = await funding.investedAmountPerInvestor(owner);
				expect(ownerInvested.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(ownerInvested.investorIndex).to.equal(1n);
				// _investors = [empty, owner];
				await funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
				const otherInvested = await funding.investedAmountPerInvestor(otherAccount);
				expect(otherInvested.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(otherInvested.investorIndex).to.equal(2n);
				// _investors = [empty, owner, other];
				// reach funding period limit
				await time.increase(THIRTY_DAYS_IN_SECONDS);
			});
			it("All investors are removed", async () => {
				// refund all investors
				await funding.refundInvestors(3);
				// _investors = [];
				const emptyWithdrawn = await funding.investedAmountPerInvestor(emptyAccount);
				expect(emptyWithdrawn.investedAmount).to.equal(0n);
				expect(emptyWithdrawn.investorIndex).to.equal(0n);
				const ownerWithdrawn = await funding.investedAmountPerInvestor(owner);
				expect(ownerWithdrawn.investedAmount).to.equal(0n);
				expect(ownerWithdrawn.investorIndex).to.equal(0n);
				const otherWithdrawn = await funding.investedAmountPerInvestor(otherAccount);
				expect(otherWithdrawn.investedAmount).to.equal(0n);
				expect(otherWithdrawn.investorIndex).to.equal(0n);
			});
			it("First investor is removed and last investor moves to be the first one", async () => {
				// refund first investor
				await funding.refundInvestors(1);
				// _investors = [other, owner];
				const emptyWithdrawn = await funding.investedAmountPerInvestor(emptyAccount);
				expect(emptyWithdrawn.investedAmount).to.equal(0n);
				expect(emptyWithdrawn.investorIndex).to.equal(0n);
				const ownerWithdrawn = await funding.investedAmountPerInvestor(owner);
				expect(ownerWithdrawn.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(ownerWithdrawn.investorIndex).to.equal(1n);
				const otherWithdrawn = await funding.investedAmountPerInvestor(otherAccount);
				expect(otherWithdrawn.investedAmount).to.equal(MINIMUM_INVESTMENT_AMOUNT);
				expect(otherWithdrawn.investorIndex).to.equal(0n);
			});
		});
		describe("Failed Refunding", () => {
			beforeEach(async () => {
				await loadFixture(deployFundingFixture);
				const otherAccountAddress = await otherAccount.getAddress();
				await usdc.transfer(otherAccountAddress, BigInt(5 * 10 ** 18));
				await usdc.connect(otherAccount).approve(funding, BigInt(5 * 10 ** 18));
				await funding.setWhaleNFTAddress(whale);
				await funding.setOgNFTAddress(og);
			});
			it("Should fail when funding period is ongoing", async () => {
				await funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
				await expect(funding.refundInvestors(1)).to.be.revertedWithCustomError(funding, "FundingPeriodOngoing");
			});
			it("Should fail when funding targetAmount has been reached", async () => {
				await funding.connect(otherAccount).invest(TARGET_AMOUNT);
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				await expect(funding.refundInvestors(1)).to.be.revertedWithCustomError(funding, "FundingTargetAmountReached");
			});
			it("Should fail when there are no registered investors", async () => {
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				await expect(funding.connect(emptyAccount).refundInvestors(1)).to.be.revertedWithCustomError(funding, "FundingNoInvestorsToRefund");
			});
			it("Should fail when investor has been refunded all funds", async () => {
				await funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				await funding.refundInvestors(1);
				await expect(funding.refundInvestors(1)).to.be.revertedWithCustomError(funding, "FundingNoInvestorsToRefund");
			});
			it("Should fail when providing refund amount zero", async () => {
				await funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				await expect(funding.refundInvestors(0)).to.be.revertedWithCustomError(funding, "FundingNoInvestorsToRefund");
			});
			it("Should fail when providing refund amount too big", async () => {
				await funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				await expect(funding.refundInvestors(2)).to.be.revertedWithCustomError(funding, "FundingInvestorsAmountToRefundTooBig");
			});
			it("Should fail when paused", async () => {
				await funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
				await time.increase(THIRTY_DAYS_IN_SECONDS);
				await funding.pause();
				await expect(funding.refundInvestors(1)).to.be.revertedWithCustomError(funding, "EnforcedPause");
			});
		});
		describe("Successful Refunding", () => {
			beforeEach(async () => {
				await loadFixture(deployFundingFixture);
				const otherAccountAddress = await otherAccount.getAddress();
				await usdc.transfer(otherAccountAddress, BigInt(5 * 10 ** 18));
				await usdc.approve(funding, BigInt(5 * 10 ** 18));
				await funding.setWhaleNFTAddress(whale);
				await funding.setOgNFTAddress(og);
				await funding.invest(MINIMUM_INVESTMENT_AMOUNT);
				await usdc.connect(otherAccount).approve(funding, BigInt(5 * 10 ** 18));
				await funding.connect(otherAccount).invest(MINIMUM_INVESTMENT_AMOUNT);
				await time.increase(THIRTY_DAYS_IN_SECONDS);
			});
			it("Should refund when fundingPeriod ended and target hasn't been reached", async () => {
				const balanceBeforeRefund = await usdc.balanceOf(otherAccount);
				const ownerBalanceBeforeRefund = await usdc.balanceOf(owner);
				await expect(funding.connect(otherAccount).refundInvestors(1)).to.emit(funding, "RefundedInvestors");
				expect(await usdc.balanceOf(otherAccount)).to.equal(balanceBeforeRefund);
				expect(await usdc.balanceOf(owner)).to.equal(ownerBalanceBeforeRefund + MINIMUM_INVESTMENT_AMOUNT);
			});
			it("Should refund when fundingPeriod ended and target hasn't been reached, from two accounts", async () => {
				const balanceBeforeRefund = await usdc.balanceOf(otherAccount);
				await expect(funding.refundInvestors(2)).to.emit(funding, "RefundedInvestors");
				expect(await usdc.balanceOf(otherAccount)).to.equal(balanceBeforeRefund + MINIMUM_INVESTMENT_AMOUNT);
			});
		});
	});
});
