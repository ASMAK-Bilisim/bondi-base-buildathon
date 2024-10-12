local deployment
anvil -f wss://base-sepolia-rpc.publicnode.com -b 1

forge script script/DeployCDSManager.s.sol --rpc-url 127.0.0.1:8545 --broadcast

real deployment
forge script script/DeployCDSManager.s.sol --rpc-url wss://base-sepolia-rpc.publicnode.com --broadcast

testing
forge test