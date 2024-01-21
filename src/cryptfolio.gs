/*

 ██████╗██████╗ ██╗   ██╗██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗
██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗
██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║
██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║
╚██████╗██║  ██║   ██║   ██║        ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝
 ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝        ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝

*/

/*//////////////////////////////////////////////////////////////////////////
                                    SETUP
//////////////////////////////////////////////////////////////////////////*/

const BALANCE_OF_SIGHASH = "70a08231"; // this is keccak256("balanceOf(address)")
const DATE_FORMAT = "MMM,d yyyy HH:mm:ss";
const TIMEZONE = "Europe/London";

// See https://chainlist.org
const chainIDs = {
  arbitrum: 42161,
  avalanche: 43114,
  base: 8453,
  blast: 81457,
  bnb: 56,
  ethereum: 1,
  gnosis: 100,
  optimism: 10,
  polygon: 137,
  scroll: 534352,
  zksync: 324,
};

/*
 * To be able to run these scripts, you MUST obtain a CoinGecko demo API key.
 *
 * @see {@link https://support.coingecko.com/hc/en-us/articles/21880397454233-User-Guide-How-to-sign-up-for-CoinGecko-Demo-API-and-generate-an-API-key}
 */
const coinGecko = {
  apiKey: "ADD_YOUR_API_KEY_HERE",
  baseUrl: "https://api.coingecko.com/api/v3",
};

const defaults = {
  account: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  crypto: "optimism",
  fiat: "usd",
  token: "USDC",
};

// You MUST have the following named ranges in your Google Sheet:
const ranges = {
  cryptoIDs: "CRYPTO_IDS",
  prices: "PRICES",
  pricesError: "PRICES_ERROR",
  pricesLastUpdatedAt: "PRICES_LAST_UPDATED_AT",
  scriptLastRunAt: "SCRIPT_LAST_RUN_AT",
};

const rpcURLs = {
  [chainIDs.arbitrum]: "https://arbitrum-one.publicnode.com",
  [chainIDs.avalanche]: "https://api.avax.network/ext/bc/C/rpc",
  [chainIDs.base]: "https://base.publicnode.com",
  [chainIDs.blast]: "https://rpc.blast.io",
  [chainIDs.bnb]: "https://bsc-dataseed1.binance.org",
  [chainIDs.gnosis]: "https://rpc.gnosischain.com",
  [chainIDs.optimism]: "https://optimism.publicnode.com",
  [chainIDs.polygon]: "https://polygon-bor.publicnode.com",
  [chainIDs.scroll]: "https://rpc.scroll.io",
  [chainIDs.zksync]: "https://mainnet.era.zksync.io",
  default: "https://ethereum.publicnode.com",
};

// Mapping of symbols to token addresses and decimals. You probably want to customize this with your token holdings.
const tokenData = {
  ARB: { address: "0x912CE59144191C1204E64559FE8253a0e49E6548", decimals: 18 },
  MKR: { address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2", decimals: 18 },
  OP: { address: "0x4200000000000000000000000000000000000042", decimals: 18 },
  USDC: {
    [chainIDs.arbitrum]: { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6 },
    [chainIDs.avalanche]: { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6 },
    [chainIDs.base]: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
    [chainIDs.bnb]: { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 },
    [chainIDs.optimism]: { address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6 },
    [chainIDs.polygon]: { address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6 },
    [chainIDs.scroll]: { address: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4", decimals: 6 },
    [chainIDs.zksync]: { address: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4", decimals: 6 },
    default: { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
  },
  USDT: {
    [chainIDs.arbitrum]: { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6 },
    [chainIDs.avalanche]: { address: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118", decimals: 6 },
    [chainIDs.bnb]: { address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
    [chainIDs.optimism]: { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6 },
    [chainIDs.polygon]: { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6 },
    [chainIDs.scroll]: { address: "0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df", decimals: 6 },
    [chainIDs.zksync]: { address: "0x493257fD37EDB34451f62EDf8D2a0C418852bA4C", decimals: 6 },
    default: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
  },
  default: { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
};

/*//////////////////////////////////////////////////////////////////////////
                            SPREADSHEET FUNCTIONS
//////////////////////////////////////////////////////////////////////////*/

/**
 * Queries the CoinGecko API to obtain the current fiat price for all cryptocurrencies in the spreadsheet.
 *
 * @see {@link https://docs.coingecko.com/reference/simple-price}
 */
function GET_ALL_PRICES(fiat = defaults.fiat) {
  // Read the IDs from the spreadsheet.
  let spreadsheet = SpreadsheetApp.getActive();
  let cryptos = spreadsheet.getRangeByName(ranges.cryptoIDs).getValues().flat().map(String);

  // Construct the API URL.
  let url = coinGecko.baseUrl + "/simple/price";
  url += "?x_cg_demo_api_key=" + coinGecko.apiKey;
  url += "&ids=" + cryptos.join(",");
  url += "&vs_currencies=" + fiat;
  const options = { muteHttpExceptions: true };

  // Refresh the "Script Last Run At" cell.
  refreshScriptLastRunAt();

  try {
    const response = UrlFetchApp.fetch(url, options).getContentText();
    if (!response) {
      throw new Error("ERR_GET_ALL_PRICES: Parse response");
    } else if (response == "Throttled") {
      throw new Error("ERR_GET_ALL_PRICES: CoinGecko API rate limit");
    }
    const json = JSON.parse(response);
    handleJSONErrors(json);

    // Load the existing prices range.
    const pricesSheet = spreadsheet.getSheetByName("Prices");
    const pricesRange = pricesSheet.getRange(ranges.prices);
    const pricesValues = pricesRange.getValues();

    const prices = [];
    for (let i = 0; i < cryptos.length; i++) {
      let crypto = cryptos[i];
      let value = json[crypto];

      // CoinGecko returns "{}" for some coins, e.g. listed but not launched
      if (!value || Object.keys(value).length === 0) {
        console.warn("Could not access price data for %s", crypto);
        prices.push(pricesValues[i]);
      } else {
        const price = json[crypto].usd;
        prices.push([price]);
      }
    }
    // Update the prices range
    pricesRange.setValues(prices);

    // Refresh the "Prices Last Updated At" cell.
    refreshPricesLastUpdatedAt();

    // Clear the error from the "Error" cell.
    spreadsheet.getRangeByName(ranges.pricesError).setValue("No Error");
  } catch (error) {
    spreadsheet.getRangeByName(ranges.pricesError).setValue(error);
  }
}

/**
 * Makes a JSON-RPC call to the blockchain to get the ERC-20 token balance of an account.
 */
function GET_ERC20_BALANCE(chainID = chainIDs.ethereum, symbol = config, account = defaults.account) {
  const url = getRPC(chainID);
  const token = getToken(chainID, symbol);
  // We add 24 zeroes to left-pad the address with 12 bytes such that in total there are 32 bytes after
  // the signature hash. Recall that an Ethereum address has 20 bytes.
  const call = {
    data: "0x" + BALANCE_OF_SIGHASH + "0".repeat(24) + account.slice(2),
    from: account,
    to: token.address,
  };
  const options = {
    method: "POST",
    contentType: "application/json",
    muteHttpExceptions: true,
    payload: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "eth_call",
      params: [call, "latest"],
    }),
  };
  try {
    const response = UrlFetchApp.fetch(url, options).getContentText();
    if (!response) {
      throw new Error("GET_ERC20_BALANCE: Parse response");
    }
    const json = JSON.parse(response);
    handleJSONErrors(json);

    if (!json.result) {
      throw new Error("GET_ERC20_BALANCE: No balance returned");
    }
    const hexBalance = json.result;
    const balance = parseInt(hexBalance, 16) / 10 ** token.decimals;
    if (balance) {
      return balance;
    } else {
      return 0;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Makes a JSON-RPC call to an EVM blockchain to get the native asset balance of an account.
 */
function GET_NATIVE_BALANCE(chainID = chainIDs.ethereum, account = defaults.account) {
  const url = getRPC(chainID);
  const options = {
    method: "POST",
    contentType: "application/json",
    muteHttpExceptions: true,
    payload: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [account, "latest"],
    }),
  };

  try {
    const response = UrlFetchApp.fetch(url, options).getContentText();
    if (!response) {
      throw new Error("GET_EVM_NATIVE_BALANCE: Parse response");
    }
    const json = JSON.parse(response);
    handleJSONErrors(json);

    if (!json.result) {
      throw new Error("GET_EVM_NATIVE_BALANCE: No balance returned");
    }
    const hexBalance = json.result;
    const balance = parseInt(hexBalance, 16) / 1e18;
    if (balance) {
      return balance;
    } else {
      return 0;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Queries the CoinGecko API to obtain the current fiat price of the given cryptocurrency.
 *
 * @see {@link https://docs.coingecko.com/reference/simple-price}
 */
function GET_PRICE(crypto = DEFAULT_CRYPTO, fiat = defaults.fiat) {
  let url = coinGecko.baseUrl + "/simple/price";
  url += "?x_cg_demo_api_key=" + coinGecko.apiKey;
  url += "&ids=" + crypto;
  url += "&vs_currencies=" + fiat;
  const options = { muteHttpExceptions: true };

  try {
    const response = UrlFetchApp.fetch(url, options).getContentText();
    if (!response) {
      throw new Error("GET_PRICE: Parse response");
    }
    const json = JSON.parse(response);
    handleJSONErrors(json);

    if (!json[crypto] || !json[crypto][fiat]) {
      throw new Error("GET_PRICE: No price data returned");
    }
    return json[crypto][fiat];
  } catch (error) {
    throw error;
  }
}

/*//////////////////////////////////////////////////////////////////////////
                              INTERNAL FUNCTIONS
//////////////////////////////////////////////////////////////////////////*/

function getRPC(chainID = chainIDs.ethereum) {
  chainID = parseInt(chainID, 10);
  return rpcURLs[chainID] || rpcURLs["default"];
}

function getToken(chainID = chainIDs.ethereum, symbol = defaults.token) {
  chainID = parseInt(chainID, 10);
  const token = tokenData[symbol] || tokenData["default"];
  // Some tokens exist on multiple chains.
  return token[chainID] || token["default"] || token;
}

function handleJSONErrors(json) {
  // CoinGecko API Rate Limit
  if (json && json.status && json.status.error_code == 429) {
    throw new Error("CoinGecko API rate limit exceeded");
  }
  // Other CoinGecko API error
  if (json && json.status && json.status.error_code) {
    throw new Error("Unknown CoinGecko API error");
  }
}

function refreshPricesLastUpdatedAt() {
  const cell = SpreadsheetApp.getActive().getRangeByName(ranges.pricesLastUpdatedAt);
  cell.setValue(Utilities.formatDate(new Date(), TIMEZONE, DATE_FORMAT));
}

function refreshScriptLastRunAt() {
  const cell = SpreadsheetApp.getActive().getRangeByName(ranges.scriptLastRunAt);
  cell.setValue(Utilities.formatDate(new Date(), TIMEZONE, DATE_FORMAT));
}
