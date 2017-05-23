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
  changeTemporaryState(state, { deploymentId, rolId, numInstances }) {
    console.log('ENTRAMOS EN LA MUTACION con: ' + deploymentId + ' ' + rolId + ' ' + numInstances);
    if (numInstances > 0) {
      if (!state.temporaryState[deploymentId]) {
        state.temporaryState[deploymentId] = {};
        state.temporaryState[deploymentId][rolId] = {};
      }
      state.temporaryState[deploymentId][rolId]['numInstances'] = numInstances;
    }
    console.log('SALIMOS DE LA MUTACION');
  }
};