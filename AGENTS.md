# Cryptfolio Scripts

Google Apps Script library for tracking crypto portfolios in Google Sheets.

## Environment

**Runtime:** Google Apps Script (cloud-based, serverless)

- No access to npm packages at runtime
- No Node.js environment
- Uses Google's built-in APIs: `SpreadsheetApp`, `UrlFetchApp`, `PropertiesService`, `Utilities`

**Local Development:** Standard Node.js tooling for code quality only

- `package.json` devDependencies are for local linting/formatting only
- `biome` - linter and formatter for .gs files
- `prettier` - formatter for markdown/yml files

## Structure

```
src/
├── cryptfolio.gs  # Custom functions exposed to Google Sheets
└── data.gs        # Data structures (ChainId, Token, RpcUrl mappings)
```

**Constraint:** Google Apps Script [custom functions](https://developers.google.com/apps-script/guides/sheets/functions)
cannot modify cells other than those they return values to. Functions that write to multiple cells can only run from the
Apps Script editor, not from cell formulas.

## Dependencies

**External APIs:**

- CoinGecko API (price data) - requires API key
- EVM RPC servers (balance queries) - PublicNode by default

## Customization

### Adding Chains

Edit `data.gs`:

1. Add chain ID to `ChainId` object
2. Add RPC URL to `RpcUrl` object
3. Optionally add name mapping to `ChainNameMap`

### Adding Tokens

1. Update spreadsheet: Add to `Data:Prices` sheet and update `COIN_IDS` range
2. Edit `data.gs`: Add token to `Token` object with address and decimals
3. Multi-chain tokens: Use chain-specific structure (see `USDC`, `DAI` examples)

## Development Workflow

```bash
# Format and lint locally
bun run full-write

# Check without modifying
bun run full-check
```

**Deployment:** Copy `src/*.gs` files to Apps Script editor in Google Sheets.
