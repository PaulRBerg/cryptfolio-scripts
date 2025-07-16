// @see {@link https://chainlist.org}
const ChainId = {
  arbitrum: 42161,
  avalanche: 43114,
  base: 8453,
  blast: 81457,
  bsc: 56,
  ethereum: 1,
  gnosis: 100,
  linea: 59144,
  morph: 2818,
  optimism: 10,
  polygon: 137,
  scroll: 534352,
  zksync: 324,
};

// Map common chain names to their IDs
const ChainNameMap = {
  arb: ChainId.arbitrum,
  arbitrum: ChainId.arbitrum,
  avalanche: ChainId.avalanche,
  avax: ChainId.avalanche,
  base: ChainId.base,
  binance: ChainId.bsc,
  blast: ChainId.blast,
  bnb: ChainId.bsc,
  bsc: ChainId.bsc,
  eth: ChainId.ethereum,
  ethereum: ChainId.ethereum,
  gnosis: ChainId.gnosis,
  linea: ChainId.linea,
  mainnet: ChainId.ethereum,
  matic: ChainId.polygon,
  morph: ChainId.morph,
  op: ChainId.optimism,
  optimism: ChainId.optimism,
  polygon: ChainId.polygon,
  scroll: ChainId.scroll,
  zksync: ChainId.zksync,
};

const Default = {
  account: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  coi: "aave",
  fiat: "usd",
  token: "USDC",
};

// Make sure to have the following named ranges in your Google Sheet:
const Range = {
  coinIds: "COIN_IDS",
  prices: "PRICES",
  pricesError: "PRICES_ERROR",
  pricesLastUpdatedAt: "PRICES_LAST_UPDATED_AT",
  scriptLastRunAt: "SCRIPT_LAST_RUN_AT",
};

const RpcUrl = {
  [ChainId.arbitrum]: "https://arbitrum-one.publicnode.com",
  [ChainId.avalanche]: "https://api.avax.network/ext/bc/C/rpc",
  [ChainId.base]: "https://base.publicnode.com",
  [ChainId.blast]: "https://rpc.blast.io",
  [ChainId.bsc]: "https://bsc-dataseed1.binance.org",
  [ChainId.gnosis]: "https://rpc.gnosischain.com",
  [ChainId.linea]: "https://linea-rpc.publicnode.com",
  [ChainId.morph]: "https://rpc.morphl2.io",
  [ChainId.optimism]: "https://optimism.publicnode.com",
  [ChainId.polygon]: "https://polygon-bor.publicnode.com",
  [ChainId.scroll]: "https://rpc.scroll.io",
  [ChainId.zksync]: "https://mainnet.era.zksync.io",
  default: "https://ethereum.publicnode.com",
};

const Sheet = {
  dataPrices: "Data:Prices",
};

// Helper function to create token objects
function define(address, decimals) {
  return { address, decimals };
}

// Mapping of symbols to token addresses and decimals
const Token = {
  AAVE: define("0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", 18),
  ARB: define("0x912CE59144191C1204E64559FE8253a0e49E6548", 18),
  aArbUSDCn: define("0x724dc807b04555b71ed48a6896b6F41593b8C637", 6),
  aEthUSDC: define("0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c", 6),
  DAI: {
    [ChainId.arbitrum]: define("0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18),
    [ChainId.avalanche]: define("0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", 18),
    [ChainId.bsc]: define("0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", 18),
    [ChainId.optimism]: define("0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18),
    [ChainId.polygon]: define("0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", 18),
    default: define("0x6B175474E89094C44Da98b954EedeAC495271d0F", 18),
  },
  DYDX: define("0x92D6C1e31e14520e676a687F0a93788B716BEff5", 18),
  default: define("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 6),
  EIGEN: define("0xec53bF9167f50cDEB3Ae105f56099aaaB9061F83", 18),
  ENS: define("0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", 18),
  EPOCH: define("0x97d0cfeb4fde54b430307c9482d6f79c761fe9b6", 18),
  FUEL: define("0x675B68AA4d9c2d3BB3F0397048e62E6B7192079c", 18),
  GEL: define("0x15b7c0c907e4C6b9AdaAaabC300C08991D6CEA05", 18),
  GRT: define("0xc944E90C64B2c07662A292be6244BDf05Cda44a7", 18),
  MKR: define("0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2", 18),
  NOTE: define("0xCFEAead4947f0705A14ec42aC3D44129E1Ef3eD5", 8),
  OP: define("0x4200000000000000000000000000000000000042", 18),
  SAFE: define("0x5aFE3855358E112B5647B952709E6165e1c1eEEe", 18),
  SCR: define("0xd29687c813D741E2F938F4aC377128810E217b1b", 18),
  stETH: define("0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", 18),
  UNI: define("0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", 18),
  USDC: {
    [ChainId.arbitrum]: define("0xaf88d065e77c8cC2239327C5EDb3A432268e5831", 6),
    [ChainId.avalanche]: define("0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", 6),
    [ChainId.base]: define("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", 6),
    [ChainId.bsc]: define("0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", 18),
    [ChainId.optimism]: define("0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", 6),
    [ChainId.polygon]: define("0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", 6),
    [ChainId.scroll]: define("0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4", 6),
    [ChainId.zksync]: define("0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4", 6),
    default: define("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 6),
  },
  USDT: {
    [ChainId.arbitrum]: define("0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", 6),
    [ChainId.avalanche]: define("0xc7198437980c041c805A1EDcbA50c1Ce5db95118", 6),
    [ChainId.bsc]: define("0x55d398326f99059fF775485246999027B3197955", 18),
    [ChainId.optimism]: define("0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", 6),
    [ChainId.polygon]: define("0xc2132D05D31c914a87C6611C10748AEb04B58e8F", 6),
    [ChainId.scroll]: define("0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df", 6),
    [ChainId.zksync]: define("0x493257fD37EDB34451f62EDf8D2a0C418852bA4C", 6),
    default: define("0xdAC17F958D2ee523a2206206994597C13D831ec7", 6),
  },
  WETH: define("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18),
  ZK: define("0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E", 18),
};
