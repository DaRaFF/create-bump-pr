const request = require('request-promise')

// https://docs.github.com/en/rest/git/refs?apiVersion=2022-11-28#create-a-reference
module.exports = async ({owner, repo, token, ref, sha}) => {
  try {
    return await request({
      method: 'POST',
      uri: `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      body: {ref, sha},
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
