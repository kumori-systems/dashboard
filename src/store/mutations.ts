export default {
  setDeploymentList(state, { deploymentList }) {
    // actualizamos el estado del stamp
    state.deploymentList = deploymentList;
  },
  addDeploymentMenuItem(state, { deploymentList }) {
    // obtenemos el menuitem deployments
    let menuItem = state.menu.items.find(item => { return item.name === 'OVERVIEW'; });

    console.log('El menuItem que tenemos es: ' + JSON.stringify(menuItem));

    // si no tiene la propiedad children la añadimos
    if (!menuItem.children) menuItem.children = [];

    // añadimos cada deployment a la lista de children
    deploymentList.forEach(element => {
      console.log('Los elementos son: ' + JSON.stringify(element));
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