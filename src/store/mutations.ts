export default {
  setDeployments(state, { deploymentList }) {
    for (let i = 0; i < deploymentList.length; i++) {
      state.deploymentList.push(deploymentList[i]);
    }
  }
};