import { Deployment, NormalMetrics, EntryPointMetrics } from './classes';
export default {
  setStampState(state, stampState) {
    // actualizamos el estado del stamp
    state.deploymentList = { ...state.deploymentList, ...stampState.deploymentList };
    state.serviceList = { ...state.serviceList, ...stampState.serviceList };
    state.linkList = state.linkList.concat(stampState.linkList);
    state.componentList = { ...state.componentList, ...stampState.componentList };
    state.resourceList = { ...state.resourceList, ...stampState.resourceList };
    state.runtimeList = { ...state.runtimeList, ...stampState.runtimeList };
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
  setTemporaryState(state, temporaryState) {
    state.temporaryState = { ...temporaryState };
  },
  clearTemporaryState(state) {
    state.temporaryState = {};
  },
  addMetrics(state, { entryPointMetrics, normalMetrics }) {
    console.log('EntryPointMetrics: ' + JSON.stringify(entryPointMetrics));
    console.log('NormalMetrics: ' + JSON.stringify(normalMetrics));
    for (let deploymentId in entryPointMetrics) {
      for (let rolId in entryPointMetrics[deploymentId]) {
        for (let instanceId in entryPointMetrics[deploymentId][rolId]) {
          (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].concatEntryPointMetrics(entryPointMetrics[deploymentId][rolId][instanceId]);
        }
      }
    }

    for (let deploymentId in normalMetrics) {
      for (let rolId in normalMetrics[deploymentId]) {
        for (let instanceId in normalMetrics[deploymentId][rolId]) {
          (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].concatNormalMetrics(normalMetrics[deploymentId][rolId][instanceId]);
        }
      }
    }

  },
  selectedService(state, serviceId) {
    state.selectedService = serviceId;
  }

};