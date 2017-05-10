export default {
  setDeploymentList(state, { deploymentList }) {
    // actualizamos el estado del stamp
    state.deploymentList = deploymentList;
  },
  addDeploymentMenuItem(state, { deploymentList }) {
    // obtenemos el menuitem deployments
    let menuItem = state.menu.menuItemList.find(menuItem => { return menuItem.name === 'OVERVIEW'; });

    // si no tiene la propiedad children la añadimos
    if (!menuItem.children) menuItem.children = [];

    // añadimos cada deployment a la lista de children
    deploymentList.forEach(element => {
      menuItem.children.push(element);
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