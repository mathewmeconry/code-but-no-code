# Code but no code

This is a challenge for the Hackvent 2022.

## Description

Sanfa loves puzzles and hopes you do too ;)\
Find the secret inputs which fullfile the requirements and gives you the flag.

## Vulnerablity

[ECDSA malleability](https://www.derpturkey.com/inherent-malleability-of-ecdsa-signatures/)
is a vulnerability in the signature verification of ECDSA based electornic
signatures.\
Simply put: When inverting the `s` value to `-s` by calculating
`0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141 - s` and
then change the `recoveryParam` by 1 up or down, depending on the previous
value, one can create the same signature.\
It hasn't really a real world implication but could get one, so the contracts
should check for the lower s value as defined in
[EIP-2](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2.md#specification).\
Openzepplin follows this approach correctly
[https://github.com/OpenZeppelin/openzeppelin-contracts/blob/206a2394481ec1af16d0e0acf216bbffedde405b/contracts/utils/cryptography/ECDSA.sol#L147](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/206a2394481ec1af16d0e0acf216bbffedde405b/contracts/utils/cryptography/ECDSA.sol#L147)

## Solution

These are the restrictions the user needs to pass:

- target must be a contract
- target address must starts with the first 19 bytes 0

Ethereum has some precompiled contracts deployed at the addresses 0x01 - 0x09.\
One of them is ecrecover on 0x01.\
Use this contract with the stuff learned about ECDSA ammleability and exploit
the contract.

See the example `attack.ts` for a working implementation.

## Flag

`HV22{H1dd3N_1n_V4n1Ty}` hardcoded in `scripts/start.ts`.
