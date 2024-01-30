#!/usr/bin/env node
const argv = require('yargs')
  .demandOption(['gh-token', 'owner', 'repo'])
  .option('gh-approval-token', {
    description: 'gh token to auto approve the opened pull request',
    type: 'string'
  })
  .option('file', {
    description: 'appends an empty space to this file (one needs a file diff to create a bump PR)',
    type: 'string',
    choices: ['README.md', 'renovate.json'],
    default: 'README.md'
  })
  .option('target-branch', {
    description: 'create a bump PR onto this branch',
    type: 'string',
    default: 'master'
  })
  .option('postfix', {
    description: 'postfix name of the PR branch - `bump-to-next-minor-version-<postfix>`',
    type: 'string'
  })
  .option('branch', {
    description: 'adds branch to `baseBranches` in renovate.json, e.g. release-2023-01-08. If set, renovate also checks for updates in the branch.', // eslint-disable-line max-len
    type: 'string'
  })
  .help(false)
  .version(false)
  .argv
const run = require('./index')

run(argv)
  .then((pullRequest) => {
    console.log(`
        The PR for the release-management bump has been opened at
        ${pullRequest.html_url}
      `)
  })
  .catch((e) => {
    console.log(e.message)
    process.exit(1)
  })
