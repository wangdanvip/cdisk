const state = {
  view: 'transmission'
}

const mutations = {
  TOGGLE_VIEW (state) {
    state.view = state.view == 'list' ? 'transmission' : 'list'
  },
}

const actions = {
  toggle_view ({ commit }) {
    // do something async
    commit('TOGGLE_VIEW')
  }
}

const getters = {
  view: (state) => state.view
}

export default {
  state,
  mutations,
  actions,
  getters
}

