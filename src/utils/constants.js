//chứa các biến , api endpoint api root
let apiRoot = ''
if (process.env.BUILD_MODE === 'dev') {
  apiRoot = 'http://localhost:2008'
}
if (process.env.BUILD_MODE === 'production') {
  apiRoot = 'https://whip-api.onrender.com'
}
console.log(apiRoot)
export const API_ROOT = apiRoot
