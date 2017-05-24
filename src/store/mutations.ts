export default {
  setStampState(state, { deploymentList, serviceList }) {
    // actualizamos el estado del stamp
    state.deploymentList = deploymentList;
    state.serviceList = serviceList;
  },
  setRegisteredElements(state, { registeredElements }) {
    // actualizamos la lista de elementos registrados
    state.registeredElements = registeredElements;
  },
  setElementData(state, { element }) {
    console.log('ENTRAMOS EN SETELEMENTDATA');
    let [elementId, elementData] = element;
    state.registeredElements[elementId] = elementData;
  },
  setFabElements(state, { fabElementsList }) {
    state.fabElements = fabElementsList;
  },
  addDeploymentMenuItem(state, { deploymentList }) {
    // obtenemos el menuitem deployments
    let menuItem = state.menuItemList.find(menuItem => { return menuItem.name === 'OVERVIEW'; });

    // Quitamos los hijos anteriores para actualizar de cero
    menuItem.children = [];

    // añadimos cada deployment a la lista de children
    deploymentList.forEach(element => {
      menuItem.children.push(element);
    });
  },
  toggleMenuItemExpanded(state, menuItem) {
    menuItem.meta.expanded = !menuItem.meta.expanded;
  },
  hideEntrypoints(state, { }) {
    state.hideEntrypoints = !state.hideEntrypoints;
  },
  setTemporaryState(state, temporaryState) {
    console.log('Cambiamos el estado temporal a: ' + JSON.stringify(temporaryState));
    state.temporaryState = { ...temporaryState };
  },
  clearTemporaryState(state) {
    console.log('Reiniciamos el estado temporal');
    state.temporaryState = {};
  },

};