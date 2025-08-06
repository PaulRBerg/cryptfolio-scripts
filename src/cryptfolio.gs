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

/**
 * If you forked this file, you have to set the CoinGecko API key here.
 *
 * @see {@link https://support.coingecko.com/hc/en-us/articles/21880397454233-User-Guide-How-to-sign-up-for-CoinGecko-Demo-API-and-generate-an-API-key}
 */
const COINGECKO_API_KEY = "ADD_YOUR_API_KEY_HERE";

/**
 * Alternatively, if you are using this as a library, you can set the API key
 * by calling this function.
 */
function setCoinGeckoAPIKey(apiKey) {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty("COINGECKO_API_KEY", apiKey);
}

const BALANCE_OF_SIGHASH = "70a08231"; // this is keccak256("balanceOf(address)")
const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
const DATE_FORMAT = "MMM,d yyyy HH:mm:ss";
const TIMEZONE = "Europe/London";

/*//////////////////////////////////////////////////////////////////////////
                            SPREADSHEET FUNCTIONS
//////////////////////////////////////////////////////////////////////////*/

/**
 * Queries the CoinGecko API to obtain the current fiat price for all cryptocurrencies in the spreadsheet.
 *
 * @see {@link https://docs.coingecko.com/reference/simple-price}
 */
function GET_ALL_PRICES(fiat = Default.fiat) {
  // Read the IDs from the spreadsheet.
  const spreadsheet = SpreadsheetApp.getActive();
  const coins = spreadsheet.getRangeByName(Range.coinIds).getValues().flat().map(String);

  // Construct the API URL.
  let url = COINGECKO_BASE_URL + "/simple/price";
  url += "?x_cg_demo_api_key=" + getCoinGeckoAPIKey_();
  url += "&ids=" + coins.join(",");
  url += "&vs_currencies=" + fiat;
  const options = { muteHttpExceptions: true };

  // Refresh the "Script Last Run At" cell.
  refreshScriptLastRunAt_();

  try {
    const response = UrlFetchApp.fetch(url, options).getContentText();
    if (!response) {
      throw new Error("GET_ALL_PRICES: Parse response");
    } else if (response === "Throttled") {
      throw new Error("GET_ALL_PRICES: CoinGecko API rate limit");
    }
    const json = JSON.parse(response);
    handleJSONErrors_(json);

    // Load the existing prices range.
    const pricesSheet = spreadsheet.getSheetByName(Sheet.dataPrices);
    const pricesRange = pricesSheet.getRange(Range.prices);
    const pricesValues = pricesRange.getValues();

    const prices = [];
    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];
      const value = json[coin];

      // CoinGecko returns "{}" for some coins, e.g. listed but not launched
      if (!value || Object.keys(value).length === 0) {
        console.warn("Could not access price data for %s", coin);
        prices.push(pricesValues[i]);
      } else {
        const price = json[coin][fiat];
        prices.push([price]);
      }
    }
    // Update the prices range
    pricesRange.setValues(prices);

    // Refresh the "Prices Last Updated At" cell.
    refreshPricesLastUpdatedAt_();

    // Clear the error from the "Error" cell.
    spreadsheet.getRangeByName(Range.pricesError).setValue("No Error");
  } catch (error) {
    throwError(error);
  }
}

/**
 * Makes a JSON-RPC call to the blockchain to get the ERC-20 token balance of an account.
 */
function GET_ERC20_BALANCE(chain = ChainId.ethereum, tokenSymbol = Default.token, account = Default.account) {
  const chainID = getChainID_(chain);
  const url = getRPC_(chainID);
  const token = getToken_(chainID, tokenSymbol);

  // We add 24 zeroes to left-pad the address with 12 bytes such that in total there are 32 bytes after
  // the signature hash. Recall that an Ethereum address has 20 bytes.
  const call = {
    data: "0x" + BALANCE_OF_SIGHASH + "0".repeat(24) + account.slice(2),
    from: account,
    to: token.address,
  };
  const options = {
    contentType: "application/json",
    method: "POST",
    muteHttpExceptions: true,
    payload: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "eth_call",
      params: [call, "latest"],
    }),
  };
  const response = UrlFetchApp.fetch(url, options).getContentText();
  if (!response) {
    throw new Error("GET_ERC20_BALANCE: Parse response");
  }
  const json = JSON.parse(response);
  handleJSONErrors_(json);

  if (!json.result) {
    throw new Error("GET_ERC20_BALANCE: No balance returned");
  }
  const hexBalance = json.result;
  const balance = fromHex_(hexBalance) / 10 ** token.decimals;
  if (balance) {
    return balance;
  } else {
    return 0;
  }
}

/**
 * Makes a JSON-RPC call to an EVM blockchain to get the native asset balance of an account.
 */
function GET_NATIVE_BALANCE(chain = ChainId.ethereum, account = Default.account) {
  const chainID = getChainID_(chain);
  const url = getRPC_(chainID);
  const options = {
    contentType: "application/json",
    method: "POST",
    muteHttpExceptions: true,
    payload: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [account, "latest"],
    }),
  };

  const response = UrlFetchApp.fetch(url, options).getContentText();
  if (!response) {
    throw new Error("GET_NATIVE_BALANCE: Parse response");
  }
  const json = JSON.parse(response);
  handleJSONErrors_(json);

  if (!json.result) {
    throw new Error("GET_NATIVE_BALANCE: No balance returned");
  }
  const hexBalance = json.result;
  const balance = fromHex_(hexBalance) / 1e18;
  if (balance) {
    return balance;
  } else {
    return 0;
  }
}

/**
 * Queries the CoinGecko API to obtain the current fiat price of the given cryptocurrency.
 *
 * @see {@link https://docs.coingecko.com/reference/simple-price}
 */
function GET_PRICE(coinId = Default.coin, fiat = Default.fiat) {
  let url = COINGECKO_BASE_URL + "/simple/price";
  url += "?x_cg_demo_api_key=" + getCoinGeckoAPIKey_();
  url += "&ids=" + coinId;
  url += "&vs_currencies=" + fiat;
  const options = { muteHttpExceptions: true };

  const response = UrlFetchApp.fetch(url, options).getContentText();
  if (!response) {
    throw new Error("GET_PRICE: Parse response");
  }
  const json = JSON.parse(response);
  handleJSONErrors_(json);

  if (!json[coinId] || !json[coinId][fiat]) {
    throw new Error("GET_PRICE: No price data returned");
  }
  return json[coinId][fiat];
}

/* -------------------------------------------------------------------------- */
/*                               INTERNAL LOGIC                               */
/* -------------------------------------------------------------------------- */

function fromHex_(value) {
  return parseInt(value, 16);
}

function getChainID_(chain) {
  if (typeof chain === "number") {
    return chain;
  }

  const chainID = ChainNameMap[chain.toLowerCase()];
  if (!chainID) {
    throw new Error(`Unknown chain name: ${chain}`);
  }

  return chainID;
}

function getCoinGeckoAPIKey_() {
  if (COINGECKO_API_KEY !== "ADD_YOUR_API_KEY_HERE") {
    return COINGECKO_API_KEY;
  }
  const properties = PropertiesService.getScriptProperties();
  const apiKey = properties.getProperty("COINGECKO_API_KEY");
  if (!apiKey) {
    throw new Error("CoinGecko API key not set");
  }
  return apiKey;
}

function getRPC_(chainID = ChainId.ethereum) {
  chainID = parseInt(chainID, 10);
  return RpcUrl[chainID] || RpcUrl.default;
}

function getToken_(chainID = ChainId.ethereum, symbol = Default.token) {
  chainID = parseInt(chainID, 10);
  const token = Token[symbol] || Token.default;
  // Some tokens exist on multiple chains.
  return token[chainID] || token.default || token;
}

function handleJSONErrors_(json) {
  // CoinGecko API Rate Limit
  if (json?.status?.error_code === 429) {
    throw new Error("CoinGecko API rate limit exceeded");
  }
  // Other CoinGecko API error
  if (json?.status?.error_code) {
    throw new Error("Unknown CoinGecko API error");
  }
}

function refreshPricesLastUpdatedAt_() {
  const cell = SpreadsheetApp.getActive().getRangeByName(Range.pricesLastUpdatedAt);
  cell.setValue(Utilities.formatDate(new Date(), TIMEZONE, DATE_FORMAT));
}

function refreshScriptLastRunAt_() {
  const cell = SpreadsheetApp.getActive().getRangeByName(Range.scriptLastRunAt);
  cell.setValue(Utilities.formatDate(new Date(), TIMEZONE, DATE_FORMAT));
}

function throwError(message) {
  const spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.getRangeByName(Range.pricesError).setValue(message);
  throw new Error(message);
}
