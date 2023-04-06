.PHONY: all clean	

all: yarn.lock

yarn.lock: node_modules package.json
	$(MAKE clean)
	yarn install

node_modules:
	mkdir -p $@

clean:
	rm -rf node_modules yarn.lock artifacts cache typechain-types .pnp.cjs .pnp.loader.mjs

compile:
	yarn hardhat compile

test: compile
	yarn hardhat test

deploy: compile
	@echo "Make sure you have LINK and ETH tokens in the Sepolia network .."
	yarn hardhat run scripts/deploy.ts --network sepolia

local_run: compile
	@echo "Please run the following command on a separate terminal: `yarn hardhat node`"
	yarn hardhat run scripts/deploy.ts --network localhost
