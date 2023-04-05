.PHONY: all clean	

all: yarn.lock

yarn.lock: node_modules package.json
	$(MAKE clean)
	yarn install

node_modules:
	mkdir -p $@

clean:
	rm -rf node_modules yarn.lock artifacts cache typechain-types

compile:
	yarn hardhat compile

test: compile
	yarn hardhat test

deploy: compile
	@echo "Make sure you have LINK and ETH tokens in the Sepolia network .."
	yarn hardhat run scripts/deploy.ts --network sepolia

# CHAINLINK_DATA = ${PWD}/chainlink-node/chainlink_data
# CHAINLINK_USER = "user@example.com"
# CHAINLINK_PASSWORD = "password"

# chainlink_data:
# 	sudo rm -rf ${CHAINLINK_DATA}
# 	mkdir -p ${CHAINLINK_DATA}
# 	echo "user@example.com" > ${CHAINLINK_DATA}/.api
# 	echo "password" >> ${CHAINLINK_DATA}/.api
# 	echo "my_wallet_password" > ${CHAINLINK_DATA}/.password
	

# chainlink_up:
# 	echo ${ALCHEMY_API_KEY}
# 	cd chainlink-node && docker-compose up --build