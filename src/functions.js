/*//////////////////////////////////////////////////////////////////////////
                                  CONSTANTS
//////////////////////////////////////////////////////////////////////////*/

const BALANCE_OF_SIGHASH = "70a08231"; // this is keccak256("balanceOf(address)")
const CHAIN_ID_ARBITRUM = 42161;
const CHAIN_ID_AVALANCHE = 43114;
const CHAIN_ID_BASE = 8453;
const CHAIN_ID_BSC = 56;
const CHAIN_ID_ETHEREUM = 1;
const CHAIN_ID_GNOSIS = 100;
const CHAIN_ID_OPTIMISM = 10;
const CHAIN_ID_POLYGON = 137;
const DATE_FORMAT = "MMM,d yyyy HH:mm:ss";

/*//////////////////////////////////////////////////////////////////////////
                                    CONFIG
//////////////////////////////////////////////////////////////////////////*/

/// TODO: explain this
const config = {
  coinGecko: {
    apiKey: "0xcAfEbEef00000000000000000000000000000000",
    baseUrl: "https://api.coingecko.com/api/v3",
  },
  cryptos: ["aave", "ethereum-name-service", "maker", "celestia"],
  defaults: {
    account: "0xcaFe00000000000000000000000000000000BeeF",
    crypto: "ens",
    fiat: "usd",
    token: "USDC",
  },
  ranges: {},
};

/// TODO: and this
config.ranges.prices = "C2:C".concat(config.cryptos.length + 1); // +1 because the range starts at 2

/*//////////////////////////////////////////////////////////////////////////
                              INTERNAL FUNCTIONS
//////////////////////////////////////////////////////////////////////////*/

function getJsonRpcUrl(chainId = CHAIN_ID_ETHEREUM) {
  chainId = parseInt(chainId, 10);
  switch (chainId) {
    case CHAIN_ID_ARBITRUM:
      return "https://arbitrum-one.publicnode.com";
    case CHAIN_ID_AVALANCHE:
      return "https://api.avax.network/ext/bc/C/rpc";
    case CHAIN_ID_BASE:
      return "https://base.publicnode.com";
    case CHAIN_ID_BSC:
      return "https://bsc-dataseed1.binance.org";
    case CHAIN_ID_GNOSIS:
      return "https://rpc.gnosischain.com";
    case CHAIN_ID_OPTIMISM:
      return "https://optimism.publicnode.com";
    case CHAIN_ID_POLYGON:
      return "https://polygon-bor.publicnode.com";
    default:
      return "https://ethereum.publicnode.com";
  }
}

/// TODO: document this
function getTokenAddress(chainId = CHAIN_ID_ETHEREUM, symbol = config.defaults.token) {
  chainId = parseInt(chainId, 10);
  switch (symbol) {
    case "DAI": {
      switch (chainId) {
        case CHAIN_ID_ARBITRUM:
          return { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18 };
        case CHAIN_ID_AVALANCHE:
          return { address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", decimals: 18 };
        case CHAIN_ID_BSC:
          return { address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", decimals: 18 };
        case CHAIN_ID_OPTIMISM:
          return { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18 };
        case CHAIN_ID_POLYGON:
          return { address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", decimals: 18 };
        default:
          return { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 };
      }
    }
    case "ENS": {
      return { address: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", decimals: 18 };
    }
    case "MKR": {
      return { address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2", decimals: 18 };
    }
    case "USDC": {
      switch (chainId) {
        case CHAIN_ID_ARBITRUM:
          return { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6 };
        case CHAIN_ID_AVALANCHE:
          return { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6 };
        case CHAIN_ID_BSC:
          return { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 };
        case CHAIN_ID_OPTIMISM:
          return { address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", decimals: 6 };
        case CHAIN_ID_POLYGON:
          return { address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6 };
        default:
          return { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 };
      }
    }
    default:
      return { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 }; // USDC
  }
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

function refreshRatesLastUpdatedAt() {
  const cell = SpreadsheetApp.getActive().getRangeByName("RATES_LAST_UPDATED_AT");
  cell.setValue(Utilities.formatDate(new Date(), "GMT+2", DATE_FORMAT));
}

function refreshScriptLastRunAt() {
  const cell = SpreadsheetApp.getActive().getRangeByName("SCRIPT_LAST_RUN_AT");
  cell.setValue(Utilities.formatDate(new Date(), "GMT+2", DATE_FORMAT));
}

/*//////////////////////////////////////////////////////////////////////////
                              PUBLIC FUNCTIONS
//////////////////////////////////////////////////////////////////////////*/

function GET_NATIVE_BALANCE(chainId = CHAIN_ID_ETHEREUM, account = config.defaults.account) {
  const url = getJsonRpcUrl(chainId);
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
      throw new Error("ERR_GET_NATIVE_BALANCE: Parse response");
    }
    const json = JSON.parse(response);
    handleJSONErrors(json);

    if (!json.result) {
      throw new Error("ERR_GET_NATIVE_BALANCE: No balance returned");
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

function GET_RATES(fiat = config.defaults.fiat) {
  let url = config.coinGecko.baseUrl + "/simple/price";
  url += "?x_cg_demo_api_key=" + config.coinGecko.apiKey;
  url += "&ids=" + config.cryptos.join(",");
  url += "&vs_currencies=" + fiat;
  const options = { muteHttpExceptions: true };

  // Refresh the script last run at cell.
  refreshScriptLastRunAt();

  try {
    const response = UrlFetchApp.fetch(url, options).getContentText();
    if (!response) {
      throw new Error("ERR_GET_RATES: Parse response");
    } else if (response == "Throttled") {
      throw new Error("ERR_GET_RATES: CoinGecko API rate limit");
    }
    const json = JSON.parse(response);
    handleJSONErrors(json);

    // Load the existing prices range.
    const rates = SpreadsheetApp.getActive().getSheetByName("Rates");
    const pricesRange = rates.getRange(config.ranges.prices);
    const pricesValues = pricesRange.getValues();

    const prices = [];
    for (let i = 0; i < config.cryptos.length; i++) {
      let crypto = config.cryptos[i];
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

    // Refresh the rates last updated at cell.
    refreshRatesLastUpdatedAt();

    // Clear the error from the error cell.
    SpreadsheetApp.getActive().getRangeByName("RATES_ERROR").setValue("No Error");
  } catch (error) {
    SpreadsheetApp.getActive().getRangeByName("RATES_ERROR").setValue(error);
  }
}

function GET_SIMPLE_PRICE(crypto = DEFAULT_CRYPTO, fiat = config.defaults.fiat) {
  let url = config.coinGecko.baseUrl + "/simple/price";
  url += "?x_cg_demo_api_key=" + config.coinGecko.apiKey;
  url += "&ids=" + crypto;
  url += "&vs_currencies=" + fiat;
  const options = { muteHttpExceptions: true };

  try {
    const response = UrlFetchApp.fetch(url, options).getContentText();
    if (!response) {
      throw new Error("ERR_GET_PRICE: Parse response");
    }
    const json = JSON.parse(response);
    handleJSONErrors(json);

    if (!json[crypto] || !json[crypto][fiat]) {
      throw new Error("ERR_GET_PRICE: No price data returned");
    }
    return json[crypto][fiat];
  } catch (error) {
    throw error;
  }
}

function GET_TOKEN_BALANCE(chainId = CHAIN_ID_ETHEREUM, symbol = config, account = config.defaults.account) {
  const url = getJsonRpcUrl(chainId);
  const token = getTokenAddress(chainId, symbol);
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
      throw new Error("GET_TOKEN_BALANCE: Parse response");
    }
    const json = JSON.parse(response);
    handleJSONErrors(json);

    if (!json.result) {
      throw new Error("GET_TOKEN_BALANCE: No balance returned");
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
