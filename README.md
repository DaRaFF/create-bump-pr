# Description

A simple CLI command to create a semantic-release minor bump pull request.

#### Workflow
- take the latest tag in your repository
- update your README.md with an empty line
- create a minor version bump pull-request to incite a new minor version


# Example

### via CLI

```bash
npx @daraff/create-bump-pr \
  --owner=<gh-owner> \
  --repo=<gh-repo> \
  --gh-token=<your-gh-token>
```


**Arguments**

- `--owner`         (required) GitHub owner of the repo where you want to create the Pull Request
- `--repo`          (required) GitHub repo where you want to create the Pull Request
- `--gh-token`      (required) GitHub token of a user to create the Pull Request with
- `--target-branch` (optional) creates a bump PR towards the target-branch (default: `master`)
- `--file`          (optional) the options are `README.md` | `renovate.json` (default: `README.md`)
- `--postfix`       (optional) the name of the PR branch - `bump-to-next-minor-version-<postfix>`
- `--branch`        (optional) only needed when file=`renovate.json`. Adds branch to `baseBranches` in `renovate.json`, e.g. `release-2023-01-08`. If set, renovate also checks for updates in the branch.'
