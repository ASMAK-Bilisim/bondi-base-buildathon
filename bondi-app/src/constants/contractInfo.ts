import { Abi } from "viem";

export const CDS_MANAGER_ADDRESS = '0xA68bF7fAB3468504FacAC136Cbb1304fB9ad4e1a';
export const MOCK_USDC_ADDRESS = '0x161410d974A28dD839fb9175032538F62B258c4b';
// USDC address for Base Sepolia testnet
export const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

// Zeta contract addresses
export const ZETA_FUNDING_CONTRACT = '0x2959B79bd099A1D74A37e05426BF044D9E4E5685';
export const ZETA_BOND_TOKEN = '0x63976d1fB668B646BA47e1Fd856E50D0853a1b2b';
export const ZETA_OG_NFT = '0xdF22356916F5274164674449b40265978F3f37C7';
export const ZETA_WHALE_NFT = '0x6B4a84963a7d91Ab2D5C866A7d1184C56dB71D85';

// Alpha contract addresses
export const ALPHA_FUNDING_CONTRACT = '0xf6a2Ac21A57Ef4AdEDaaab1ea9C851C7C0aa180d';
export const ALPHA_BOND_TOKEN = '0x2eA4523B6D9b9920F0A544b6c10A58c583F01B65';
export const ALPHA_OG_NFT = '0xB54a78FD797c5359eD7058238EA7c09b079A8371';
export const ALPHA_WHALE_NFT = '0x7EAC7C79B74926d2Ce5D66BA81869d88Fd81E6a7';

// Beta contract addresses
export const BETA_FUNDING_CONTRACT = '0x29F5f610c9ddb26180f05e8E5993e7DdDb94Dc17';
export const BETA_BOND_TOKEN = '0xc41cB648A9bd0e4C4FCc9011218967fE8CB33107';
export const BETA_OG_NFT = '0xb7C5ad42cBDFBc20da6544aE32a3FD4FA1F6e5F3';
export const BETA_WHALE_NFT = '0x25C0C3787535AaB94E6e5A18bF8F008f8b62b04B';

// ABIs
export const contractABI: Abi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "minimumInvestmentAmount_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "targetAmount_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "fundingPeriodLimitInDays_",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "usdcTokenAddress_",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
     {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EnforcedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "invested",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minimum",
        "type": "uint256"
      }
    ],
    "name": "FundingBelowMinimum",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FundingCannotBeZeroAddress",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "currentBalance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "target",
        "type": "uint256"
      }
    ],
    "name": "FundingExceedsTargetAmount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "available",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "required",
        "type": "uint256"
      }
    ],
    "name": "FundingInsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FundingInvestorsAmountToRefundTooBig",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FundingMinimumCannotBeZero",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FundingNoInvestorsToRefund",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FundingNoRegisteredFunds",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FundingPeriodCannotBeZero",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "finishedAt",
        "type": "uint256"
      }
    ],
    "name": "FundingPeriodFinished",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "finishesAt",
        "type": "uint256"
      }
    ],
    "name": "FundingPeriodOngoing",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FundingTargetAmountReached",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FundingTargetCannotBeZero",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FundingTargetTooSmall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvestorNFTCannotBeZeroAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "investor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "InvestmentMade",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountOfInvestors",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "RefundedInvestors",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "investor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "WithdrawalMade",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "WHALE_INVESTOR_THRESHOLD",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "bondDistribution",
    "outputs": [
      {
        "internalType": "contract BondDistribution",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "bondPriceSet",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFundingPeriodLimit",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getInvestorAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMinimumInvestmentAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "daysToAddToFundingPeriodLimit_",
        "type": "uint256"
      }
    ],
    "name": "incrementFundingPeriodLimit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountToInvest_",
        "type": "uint256"
      }
    ],
    "name": "invest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "investedAmountPerInvestor",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "investedAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "investorIndex",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "investors",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ogNFT",
    "outputs": [
      {
        "internalType": "contract InvestorNFT",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountOfInvestorsToRefund_",
        "type": "uint256"
      }
    ],
    "name": "refundInvestors",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "callerConfirmation",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_bondDistribution",
        "type": "address"
      }
    ],
    "name": "setBondDistribution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_bondPrice",
        "type": "uint256"
      }
    ],
    "name": "setBondPriceAndInitiateMinting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "minimumInvestmentAmount_",
        "type": "uint256"
      }
    ],
    "name": "setMinimumInvestmentAmount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "ogNFTAddress_",
        "type": "address"
      }
    ],
    "name": "setOgNFTAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "targetAmount_",
        "type": "uint256"
      }
    ],
    "name": "setTargetAmount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "whaleNFTAddress_",
        "type": "address"
      }
    ],
    "name": "setWhaleNFTAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "targetAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "usdcToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "whaleNFT",
    "outputs": [
      {
        "internalType": "contract InvestorNFT",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const mockUsdcABI: Abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const cdsManagerABI = [
  {
      "type": "constructor",
      "inputs": [
          {
              "name": "_usdcToken",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "_admin",
              "type": "address",
              "internalType": "address"
          }
      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "acceptDefault",
      "inputs": [
          {
              "name": "cdsID",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "addBond",
      "inputs": [
          {
              "name": "bondAddress",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "nextCouponAmount",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "nextCouponDate",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "bytes32",
              "internalType": "bytes32"
          }
      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "admin",
      "inputs": [],
      "outputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "bondsAndExpiration",
      "inputs": [
          {
              "name": "",
              "type": "bytes32",
              "internalType": "bytes32"
          }
      ],
      "outputs": [
          {
              "name": "bondAddress",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "nextCouponAmount",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "nextCouponDate",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "buyCDS",
      "inputs": [
          {
              "name": "cdsID",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "cdsContracts",
      "inputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "cdsID",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "bondAddressAndExpiration",
              "type": "bytes32",
              "internalType": "bytes32"
          },
          {
              "name": "creator",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "buyer",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "premium",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "isActive",
              "type": "bool",
              "internalType": "bool"
          },
          {
              "name": "isClaimed",
              "type": "bool",
              "internalType": "bool"
          },
          {
              "name": "isAccused",
              "type": "bool",
              "internalType": "bool"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "cdsCount",
      "inputs": [],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "createCDS",
      "inputs": [
          {
              "name": "_bondAndExpiration",
              "type": "bytes32",
              "internalType": "bytes32"
          },
          {
              "name": "premium",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "getBond",
      "inputs": [
          {
              "name": "bondAndExpiration",
              "type": "bytes32",
              "internalType": "bytes32"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getCDS",
      "inputs": [
          {
              "name": "cdsID",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "",
              "type": "bytes32",
              "internalType": "bytes32"
          },
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "",
              "type": "bool",
              "internalType": "bool"
          },
          {
              "name": "",
              "type": "bool",
              "internalType": "bool"
          },
          {
              "name": "",
              "type": "bool",
              "internalType": "bool"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getCDSCount",
      "inputs": [],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "recoverCollateral",
      "inputs": [
          {
              "name": "cdsID",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "rejectDefault",
      "inputs": [
          {
              "name": "cdsID",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "requestDefaultVerification",
      "inputs": [
          {
              "name": "cdsID",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "event",
      "name": "BondAdded",
      "inputs": [
          {
              "name": "bondAddress",
              "type": "address",
              "indexed": false,
              "internalType": "address"
          },
          {
              "name": "nextCouponAmount",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
          },
          {
              "name": "nextCouponDate",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
          },
          {
              "name": "bondAndExpiration",
              "type": "bytes32",
              "indexed": false,
              "internalType": "bytes32"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "CDSBought",
      "inputs": [
          {
              "name": "cdsID",
              "type": "uint256",
              "indexed": true,
              "internalType": "uint256"
          },
          {
              "name": "buyer",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "CDSClaimed",
      "inputs": [
          {
              "name": "cdsID",
              "type": "uint256",
              "indexed": true,
              "internalType": "uint256"
          },
          {
              "name": "buyer",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "CDSCreated",
      "inputs": [
          {
              "name": "cdsID",
              "type": "uint256",
              "indexed": true,
              "internalType": "uint256"
          },
          {
              "name": "creator",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "bondAddress",
              "type": "address",
              "indexed": false,
              "internalType": "address"
          },
          {
              "name": "premium",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
          },
          {
              "name": "couponDate",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "CollateralRecovered",
      "inputs": [
          {
              "name": "cdsID",
              "type": "uint256",
              "indexed": true,
              "internalType": "uint256"
          },
          {
              "name": "creator",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "DefaultAccepted",
      "inputs": [
          {
              "name": "cdsID",
              "type": "uint256",
              "indexed": true,
              "internalType": "uint256"
          },
          {
              "name": "admin",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "DefaultRejected",
      "inputs": [
          {
              "name": "cdsID",
              "type": "uint256",
              "indexed": true,
              "internalType": "uint256"
          },
          {
              "name": "admin",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "DefaultRequested",
      "inputs": [
          {
              "name": "cdsID",
              "type": "uint256",
              "indexed": true,
              "internalType": "uint256"
          },
          {
              "name": "buyer",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  }
];