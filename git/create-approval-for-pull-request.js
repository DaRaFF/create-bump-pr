const request = require('request-promise')

// https://docs.github.com/en/rest/reference/pulls#create-a-review-for-a-pull-request
module.exports = async ({
  owner, repo, token, pullNumber, commitId, event = 'APPROVE'
}) => {
  try {
    return request({
      method: 'POST',
      uri: `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`,
      body: {
        commit_id: commitId,
        event
      },
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Request-Promise',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      json: true
    })
  } catch (error) {
    throw error
  }
}
