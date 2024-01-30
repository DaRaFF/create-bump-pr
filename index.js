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
module.exports = async ({owner, repo, ghToken, ghApprovalToken, file, targetBranch, postfix, branch}) => { // eslint-disable-line max-len
  const token = ghToken
  const baseTagCommit = await getHighestTag({repo, owner, token})

  // get README.md or renovate.json
  const isRenovateJSON = file === 'renovate.json'
  const base64Obj = await gitGetContent({owner, repo, token, path: file})
  console.log('base64Obj', base64Obj)

  let contentUpdate
  if (isRenovateJSON) {
    if (!branch) throw new Error('branch is required for renovate.json')
    const renovate = Buffer.from(base64Obj.content, 'base64').toString('ascii')
    const renovateJSON = JSON.parse(renovate)
    // add release branch info to (renovate.json).baseBranches
    if (renovateJSON.baseBranches) {
      renovateJSON.baseBranches.push(branch)
    } else {
      throw new Error(`can't extend renovate.json baseBranches with ${branch}`)
    }
    const updatedRenovate = JSON.stringify(renovateJSON, null, 2)
    contentUpdate = Buffer.from(updatedRenovate).toString('base64')
  } else {
    // add an empty line to the readme to have a code diff for the upcoming pull request
    const readme = Buffer.from(base64Obj.content, 'base64').toString('ascii')
    const newLineReadme = `\n ${readme}`
    contentUpdate = Buffer.from(newLineReadme).toString('base64')
  }

  // create bump pr branch
  const branchName = postfix
    ? `bump-to-next-minor-version-${postfix}`
    : `bump-to-next-minor-version-${Date.now()}`
  console.log(`try to create branch "${branchName}"`)
  await gitCreateBranch({
    owner,
    repo,
    token,
    ref: `refs/heads/${branchName}`,
    sha: baseTagCommit.sha
  })

  // add commit to bump pr branch
  const updatedContent = await updateContent({
    owner,
    repo,
    token,
    path: base64Obj.path,
    message: `feat(release-management): Bump minor version for release management`,
    content: contentUpdate,
    sha: base64Obj.sha,
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
