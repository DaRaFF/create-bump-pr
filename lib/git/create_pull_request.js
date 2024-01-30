const request = require('request-promise')

// https://docs.github.com/en/rest/reference/pulls#create-a-pull-request
module.exports = async ({
  owner, repo, token, title, head, base, body
}) => {
  try {
    return request({
      method: 'POST',
      uri: `https://api.github.com/repos/${owner}/${repo}/pulls`,
      body: {title, head, base, body},
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
