export default {
  setDeployments(state, { deploymentList }) {
    for (let i = 0; i < deploymentList.length; i++) {
      state.deploymentList.push(deploymentList[i]);
    }
  },
  hideEntrypoints(state, { }) {
    state.hideEntrypoints = !state.hideEntrypoints;
  },
  addInstance(state, { rol }) {
    state[rol].instances++;
  },
  removeInstance(state, { rol }) {
    state[rol].instances--;
  }
};