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

- `--owner` - Github owner of the repo where you want to create the Pull Request
- `--repo` - Github repo where you want to create the Pull Request
- `--gh-token` - Github token of a user to create the PR with
- `--target-branch` - default: `master`, creates a bump PR towards the target-branch
- `--file` - (optional) default: `README.md`
- `--postfix` - (optional) the name of the PR branch - `bump-to-next-minor-version-<postfix>`
