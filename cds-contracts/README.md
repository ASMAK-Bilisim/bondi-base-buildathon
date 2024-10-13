forge install
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit
forge install smartcontractkit/chainlink --no-commit



local deployment
anvil -f wss://base-sepolia-rpc.publicnode.com -b 1

forge script script/DeployCDSManager.s.sol --rpc-url 127.0.0.1:8545 --broadcast

real deployment
forge script script/DeployCDSManager.s.sol --rpc-url wss://base-sepolia-rpc.publicnode.com --broadcast

testing
forge test