# Cryptfolio Scripts

Google Apps Script functions to help with tracking a crypto portfolio in Google Sheets.

The price data is pulled from [CoinGecko](https://www.coingecko.com/en/api), and the balances from various RPC servers
such as [PublicNode](https://www.publicnode.com/).

## Available Functions

| Function             | Params                   | Description                                                              |
| -------------------- | ------------------------ | ------------------------------------------------------------------------ |
| `GET_NATIVE_BALANCE` | (chainId,account)        | Get the native asset balance of `account` on the chain with id `chainId` |
| `GET_RATES`          | (fiat)                   | Get the current `fiat` prices for `CRYPTOS`                              |
| `GET_SIMPLE_BALANCE` | (crypto,fiat)            | Get the current `fiat` price for `crypto`                                |
| `GET_TOKEN_BALANCE`  | (chainId,symbol,account) | Get the ERC-20 token balance of `account` on the chain with id `chainId` |

## How to Use

1. Foo
2. Bar
3. Baz

## License

This project is licensed under MIT.
