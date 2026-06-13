//chứa các biến , api endpoint api root
let apiRoot = ''
if (process.env.BUILD_MODE === 'dev') {
  apiRoot = 'http://localhost:2008'
}
if (process.env.BUILD_MODE === 'production') {
  apiRoot = 'https://api.whip.cobweb.id.vn'
}
console.log(apiRoot)
export const API_ROOT = apiRoot

//mặc định 
export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const CARD_MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}

