---
name: bump-version
description: This skill should be used when the user asks to "bump version", "release a new version", "bump the version", "prepare a release", "update version numbers", "what version should this be", or mentions version bumping, semver analysis, or release preparation.
version: 0.1.0
---

# Bump Version

Analyze changes since the last version tag, determine the correct semver bump, and update all version references in the codebase.

## Workflow

### Step 1: Identify the Latest Version Tag

```bash
git tag --sort=-v:refname | head -1
```

The tag format is `vMAJOR.MINOR.PATCH` (e.g. `v2.1.1`).

### Step 2: Analyze Changes Since the Last Tag

Gather the commit log and diff since the tag:

```bash
git log <tag>..HEAD --oneline
git diff <tag>..HEAD --stat
```

### Step 3: Classify the Semver Bump

Apply [Semantic Versioning](https://semver.org/) rules to the changes:

| Bump    | Criteria                                                                                     |
| ------- | -------------------------------------------------------------------------------------------- |
| `patch` | Bug fixes, dependency bumps, formatting, docs, refactors with no behavioral change           |
| `minor` | New features, new functions, new chain/token support, non-breaking additions                  |
| `major` | Breaking changes: renamed/removed public functions, changed function signatures, schema moves |

**Context-specific guidance for this codebase:**

- Adding a new custom function (e.g. `GET_BALANCE_V2`) &rarr; **minor**
- Adding a new chain or token to `data.gs` &rarr; **minor**
- Renaming or removing an existing custom function &rarr; **major**
- Changing the parameters of an existing custom function &rarr; **major**
- Fixing a bug in price fetching or balance calculation &rarr; **patch**
- Updating RPC URLs, API endpoints, or constants &rarr; **patch**
- Reformatting, linting, dependency bumps &rarr; **patch**

Present the analysis and proposed version to the user for confirmation before making changes.

### Step 4: Update Version References

After the user confirms the bump, update exactly two locations:

#### 1. `package.json` &mdash; `version` field

Update the `"version"` field to the new semver string (without the `v` prefix):

```json
"version": "X.Y.Z"
```

#### 2. `src/cryptfolio.gs` &mdash; `VERSION` constant

The `VERSION` constant near line 13 is a monotonically incrementing integer string used by Google Apps Script for library deployment. Increment it by 1 from the current value:

```js
const VERSION = "N";  // increment N by 1
```

This is **not** the semver version. It is a separate deployment counter that always increments by exactly 1 regardless of the semver bump type.

### Step 5: Summary

After updating, display a summary:

```
Version bump: vOLD -> vNEW
  package.json:       "OLD" -> "NEW"
  src/cryptfolio.gs:  VERSION "N" -> "N+1"
```

Do **not** create a git tag or commit. The user handles that separately.
