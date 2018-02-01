const state = {
  capacity: {
    useCapacity: 0,
    totalCapacity: 0,
    userAccount: ''
  }
}

const mutations = {
  RENDER (state, params) {
    state.capacity = params
  },
}

const actions = {
  render ({ commit }, params) {
    // do something async
    commit('RENDER', params)
  }
}

const getters = {
  capacity: (state) => state.capacity
}

export default {
  state,
  mutations,
  actions,
  getters
}


