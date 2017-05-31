import { Deployment } from './classes';
export default {
  setStampState(state, stampState) {
    // actualizamos el estado del stamp
    state.deploymentList = stampState.deploymentList;
    state.serviceList = stampState.serviceList;
    state.linkList = stampState.linkList;
    state.componentList = stampState.componentList;
    state.resourcesList = stampState.resourcesList;
    state.runtimesList = stampState.runtimesList;
  },
  setRegisteredElements(state, { registeredElements }) {
    // actualizamos la lista de elementos registrados
    state.registeredElements = registeredElements;
  },
  setElementData(state, { element }) {
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
  addMetrics(state, metrics) {
    console.log('LAS METRICAS QUE LEGAN A LA MUTACION SON: ' + JSON.stringify(metrics));

    for (let deploymentId in metrics) {
      for (let rolId in metrics[deploymentId]) {
        for (let instanceId in metrics[deploymentId][rolId]) {
          (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].addMetrics(
            metrics[deploymentId][rolId][instanceId].time,
            metrics[deploymentId][rolId][instanceId].cpu,
            metrics[deploymentId][rolId][instanceId].mem,
            metrics[deploymentId][rolId][instanceId].net_in,
            metrics[deploymentId][rolId][instanceId].net_out,
            metrics[deploymentId][rolId][instanceId].rpm,
            metrics[deploymentId][rolId][instanceId].res
          );
        }
      }
    }


  }

};