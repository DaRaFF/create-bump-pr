const _ = require('lodash')
const semver = require('semver')
const gitGetTags = require('./lib/git/get_tags')
const gitGetContent = require('./lib/git/get_content')
const gitCreateBranch = require('./lib/git/create_branch')
const updateContent = require('./lib/git/update_content')
const createPullRequest = require('./lib/git/create_pull_request')
const createApprovalForPullRequest = require('./lib/git/create_approval_for_pull_request')

// @return {'tag': '1.0.1', 'sha': '1234'}
const getHighestTag = async ({repo, owner, token}) => {
  const tagsRaw = await gitGetTags({owner, repo, token})
  return _
    .chain(tagsRaw)
    .map((tag) => {
      return {
        'tag': tag.name,
        'sha': tag.commit.sha
      }
    })
    .reduce((biggest, tag) => {
      if (semver.valid(tag.tag) && semver.gte(tag.tag, biggest.tag)) {
        return tag
      }
      return biggest
    }, {'tag': '0.0.1', 'sha': '0000'})
    .value()
}

// main application
module.exports = async ({owner, repo, ghToken, ghApprovalToken, file, targetBranch, postfix}) => {
  const token = ghToken

  if (token === ghApprovalToken) throw new Error('gh-approval-token token must be different to the gh-token')
  const baseTagCommit = await getHighestTag({repo, owner, token})

  // get README.md
  const readmeBase64Obj = await gitGetContent({owner, repo, token, path: file})
  console.log('readmeBase64Obj', readmeBase64Obj)

  // add an empty line to the readme to have a code diff for the upcoming pull request
  const readme = Buffer.from(readmeBase64Obj.content, 'base64').toString('ascii')
  const newLineReadme = `\n ${readme}`
  const newLineReadmeEncoded = Buffer.from(newLineReadme).toString('base64')

  // create new release-branch
  const branchName = postfix ? `bump-to-next-minor-version-${postfix}` : `bump-to-next-minor-version-${Date.now()}`
  console.log(`try to create branch "${branchName}"`)
  const branch = await gitCreateBranch({
    owner,
    repo,
    token,
    ref: `refs/heads/${branchName}`,
    sha: baseTagCommit.sha
  })

  // add a new commit to the release-branch
  const updatedContent = await updateContent({
    owner,
    repo,
    token,
    path: readmeBase64Obj.path,
    message: `feat(release-management): Bump minor version for release management`,
    content: newLineReadmeEncoded,
    sha: readmeBase64Obj.sha,
    branch: branchName
  })

  // create the bump pull request
  const pullRequest = await createPullRequest({
    owner,
    repo,
    token,
    title: `Bump minor version for release management`,
    head: branchName,
    base: targetBranch,
    body: `## Motivation

Bump minor version for release management
    `
  })

  // auto approval for pull request
  if (ghApprovalToken) {
    await createApprovalForPullRequest({
      owner,
      repo,
      token: ghApprovalToken,
      pull_number: pullRequest.number,
      commit_id: updatedContent.commit.sha
    })
  }

  return pullRequest
}
