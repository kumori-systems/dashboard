export default {
  setDeployments(state, { deploymentList }) {
    // añadimos los deployments al estado
    state.deploymentList = state.deploymentList.concat(deploymentList);
  },
  addDeploymentMenuItem(state, { deploymentList }) {
    // obtenemos el menuitem deployments
    let deploymentsMenuItem = state.menu.items.filter(item => { return item.name === 'DEPLOYMENTS'; })[0];

    // si no tiene la propiedad children la añadimos
    if (!deploymentsMenuItem.children) deploymentsMenuItem.children = [];

    // añadimos cada deployment a la lista de children
    deploymentList.forEach(element => {
      deploymentsMenuItem.children.push(element);
    });
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