var request = require('request-promise');

// https://docs.github.com/en/rest/reference/git#create-a-reference
module.exports = async ({owner, repo, token, ref, sha}) => {
  try {
    return await request({
      method: 'POST',
      uri: `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      body: {ref, sha},
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Request-Promise',
      },
      json: true
    })
  } catch (error) {
    throw error
  }
}