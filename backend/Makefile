#!make
include .env

.PHONY: all clean	

all: yarn.lock

yarn.lock: node_modules package.json
    $(MAKE clean)
    yarn install --production=false

node_modules:
    mkdir -p $@

clean:
    rm -fr node_modules yarn.lock

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