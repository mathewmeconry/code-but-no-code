FROM node:lts

RUN mkdir -p /home/appuser/
RUN mkdir -p /app

RUN groupadd -r appuser && \ 
    useradd appuser -g appuser && \ 
    chown -R appuser:appuser /home/appuser/ && \ 
    chown -R appuser:appuser /app

# Run everything after as non-privileged user.
USER appuser

WORKDIR /app

COPY --chown=appuser:appuser ./contracts/Challenge.sol /app/contracts/Challenge.sol
COPY --chown=appuser:appuser ./contracts/Setup.sol /app/contracts/Setup.sol
COPY --chown=appuser:appuser ./contracts/Challenge.sol /app/public/Challenge.sol
COPY --chown=appuser:appuser ./contracts/Setup.sol /app/public/Setup.sol
COPY --chown=appuser:appuser ./public /app/public
COPY --chown=appuser:appuser ./scripts/start.ts /app/scripts/start.ts
COPY --chown=appuser:appuser ./package.json /app/package.json
COPY --chown=appuser:appuser ./hardhat.config.ts /app/hardhat.config.ts
COPY --chown=appuser:appuser ./tsconfig.json /app/tsconfig.json

WORKDIR /app/
RUN npm i
RUN yarn run compile

EXPOSE 8080
EXPOSE 8545

ENTRYPOINT ["yarn", "start"]
