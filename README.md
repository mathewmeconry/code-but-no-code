# CTF EVM PUZZLE

This is a challenge for the Hackvent 2022.

## Description

Sanfa loves puzzles and hopes you do too ;)  
Find the secret inputs which fullfile the requirements and gives you the flag.

## Vulnerablity

There is no vulnerability. Just a puzzle to solve.  
The challenge name hints to these contracts mentioned in the solution, because the popular block explorer etherscan doesn't display any code at these addresses eventho there is code.  

## Solution

These are the restrictions the user needs to pass:  
- target must be a contract
- target address must starts with the first 19 bytes 0  
- the return value of the call to the target has to match   

Ethereum has some precompiled contracts deployed at the addresses 0x01 - 0x09.

One of them (0x02) is a contract to hash the given data with sha256.  
So find a value whichs sha256 hash starts with 0x00133755.

One example is 0x42714abf2c99db93  

## Flag

`HV22{H1dd3N_1n_V4n1Ty}` hardcoded in `scripts/start.ts`.
