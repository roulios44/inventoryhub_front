import { createStore } from 'vuex'

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const store = createStore({
  state() {
    return {
      cookieValue: getCookie('myCookie') || '' 
    }
  },
  mutations: {
    setCookieValue(state, newValue) {
      state.cookieValue = newValue
      document.cookie = `myCookie=${newValue}; path=/`
    }
  },
  actions: {
    updateCookieValue({ commit }, newValue) {
      commit('setCookieValue', newValue)
    }
  },
  getters: {
    getCookieValue(state) {
      return state.cookieValue
    }
  }
})

export default store
