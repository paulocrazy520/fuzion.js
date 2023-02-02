# fuzion.js

##NOTE: This documentation is currently work in progress.

This is a JavaScript SDK developed in TypeScript. The SDK will serve to simplify development against our smart contracts, and any other APIs, Databases etc that may come in the future. It's responsibility is to abstract away any block chain complexity and domain that tends to slow down the development of UI or other services that need to integrate against these layers.

There are a couple core classes to the SDK and these will be covered below, to guide you through how to best make use of the functionality within the SDK.

###Technical Documentation
All code is documented inline at a class/function/property/type level and these docs can be accessed in your IDE, while coding, via intellisense.

###Main Classes and Utilities
`FuzionClient` - This is a client class that greatly simplifies smart contract interactions. It contains a wrapper property per contract that is supported, and these wrapper objects can be used to query and execute messages against the contracts they wrap. The SDK consumer is not required to know anything of the message structures expected by the smart contracts, as this is handled internally by the Fuzion.js SDK. There is some initialisation that is required when setting up an instance of a FuzionClient, see the code samples referenced lower down for some sample initialisation code.

`WalletHelper`

`TokenHelper`

###Paginated Results

###Code Examples
```See useful examples of using the SDK here: ./src/examples.ts ```

###Supported Smart Contracts
```
Utilities contract kujira14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9sl4e867
otc contract kujira1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrqnqu9cc
```
