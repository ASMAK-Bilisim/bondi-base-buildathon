import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { InvestorNFT } from "../typechain-types";

describe("InvestorNFT", function () {
    let nft: InvestorNFT;
    let owner: SignerWithAddress;
    let minter: SignerWithAddress;
    let otherAccount: SignerWithAddress;
    let baseUri: string;

    // We define a fixture to reuse the same setup in every test.
    async function deployNFTFixture() {
        const [owner_, minter_, otherAccount_] = await ethers.getSigners();
        owner = owner_;
        minter = minter_;
        otherAccount = otherAccount_;
        baseUri = "https://example.com/token/";

        const NFT = await ethers.getContractFactory("InvestorNFT");
        nft = await NFT.deploy("InvestorToken", "ITK", minter);

        return { nft, owner, minter, otherAccount };
    }

    describe("Deployment", function () {
        describe("Successful deployment", function () {
            beforeEach(async () => {
                await loadFixture(deployNFTFixture);
            });

            it("Should set the correct token name and symbol", async function () {
                expect(await nft.name()).to.equal("InvestorToken");
                expect(await nft.symbol()).to.equal("ITK");
            });

            it("Should grant the correct roles to the owner and minter", async function () {
                const DEFAULT_ADMIN_ROLE = await nft.DEFAULT_ADMIN_ROLE();
                const MINTER_ROLE = await nft.MINTER_ROLE();

                expect(await nft.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
                expect(await nft.hasRole(MINTER_ROLE, minter.address)).to.be.true;
            });
        });
    });

    describe("Minting", function () {
        beforeEach(async () => {
            await loadFixture(deployNFTFixture);
            await nft.setBaseURI(baseUri);
        });

        describe("Failed minting", function () {
            it("Should fail if called by an account without MINTER_ROLE", async function () {
                await expect(nft.safeMint(owner)).to.be.revertedWithCustomError(nft, "AccessControlUnauthorizedAccount");
            });

            it("Should fail if minting to the zero address", async function () {
                await expect(nft.connect(minter).safeMint(ethers.ZeroAddress))
                    .to.be.revertedWithCustomError(nft, "ERC721InvalidReceiver");
            });
        });

        describe("Successful minting", function () {
            it("Should mint a new token with correct URI by minter", async function () {
                await nft.connect(minter).safeMint(otherAccount);
                expect(await nft.ownerOf(0)).to.equal(otherAccount.address);
                expect(await nft.tokenURI(0)).to.equal(`${baseUri}0`);
            });

            it("Should increment token ID after minting", async function () {
                await nft.connect(minter).safeMint(otherAccount);
                await nft.connect(minter).safeMint(otherAccount);

                expect(await nft.tokenURI(0)).to.equal(`${baseUri}0`);
                expect(await nft.tokenURI(1)).to.equal(`${baseUri}1`);
            });
        });
    });

    describe("Base URI", function () {
        beforeEach(async () => {
            await loadFixture(deployNFTFixture);
        });

        describe("Failed base URI change", function () {
            it("Should fail if called by a non-admin account", async function () {
                await expect(nft.connect(minter).setBaseURI(baseUri))
                    .to.be.revertedWithCustomError(nft, "AccessControlUnauthorizedAccount");
            });
        });

        describe("Successful base URI change", function () {
            it("Should allow the admin to set a new base URI", async function () {
                await nft.setBaseURI(baseUri);
				await nft.connect(minter).safeMint(owner.address);
                expect(await nft.tokenURI(0)).to.equal(`${baseUri}0`);
            });
        });
    });

    describe("Burning", function () {
        beforeEach(async () => {
            await loadFixture(deployNFTFixture);
            await nft.connect(minter).safeMint(otherAccount.address);
        });

        describe("Failed burning", function () {
            it("Should fail burning if not the token owner", async function () {
                await expect(nft.connect(minter).burn(0))
                    .to.be.revertedWithCustomError(nft, "ERC721InsufficientApproval");
            });

            it("Should fail burning a non-existent token", async function () {
                await expect(nft.burn(9999))
                    .to.be.revertedWithCustomError(nft, "ERC721NonexistentToken");
            });
        });

        describe("Successful burning", function () {
            it("Should allow the token owner to burn", async function () {
                await expect(nft.connect(otherAccount).burn(0)).not.to.be.reverted;
            });
        });
    });
});
