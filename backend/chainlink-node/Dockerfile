FROM smartcontract/chainlink:1.13.0

USER root

LABEL version="1.0" 
LABEL description="Chainlink node" 

RUN mkdir -p /chainlink
COPY ./chainlink_data /chainlink

# Replace with your own values
# Ethereum node URL : e.g. ws:// from Infura or Alchemy
# DATABASE_URL : e.g. postgres://postgres:password@postgres:5432/defaultdb

EXPOSE 6688

ENTRYPOINT  "/bin/bash -c 'chainlink local n -p /chainlink/.password -a /chainlink/.api'"