export default {
  sidebar: function (state) {
    return state.sidebar;
  },
  getDeploymentList: function(state){
    return state.deploymentList;
  },
  getHideEntrypoints: function(state){
    return state.hideEntrypoints;
  }
};