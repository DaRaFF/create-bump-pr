const request = require('request-promise')

// https://docs.github.com/en/rest/reference/repos#get-repository-content
//
// @return
module.exports = async ({
  owner, repo, token, path
}) => {
  try {
    console.log('get-content.js', `https://api.github.com/repos/${owner}/${repo}/contents/${path}`)
    return await request({
      method: 'GET',
      uri: `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
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
