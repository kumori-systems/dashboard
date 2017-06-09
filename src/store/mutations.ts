import { Deployment } from './classes';
export default {
  setStampState(state, stampState) {
    // actualizamos el estado del stamp
    state.deploymentList = { ...state.deploymentList, ...stampState.deploymentList };
    state.serviceList = { ...state.serviceList, ...stampState.serviceList };
    state.linkList.push(stampState.linkList);
    state.componentList = { ...state.componentList, ...stampState.componentList };
    state.resourcesList = { ...state.resourcesList, ...stampState.resourcesList };
    state.runtimesList = { ...state.runtimesList, ...stampState.runtimesList };
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
  addMetrics(state, metrics) {

    for (let deploymentId in metrics) {
      for (let rolId in metrics[deploymentId]) {
        for (let instanceId in metrics[deploymentId][rolId]) {
          for (let metrica in metrics[deploymentId][rolId][instanceId])
            (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].addMetrics(
              metrics[deploymentId][rolId][instanceId][metrica].time,
              metrics[deploymentId][rolId][instanceId][metrica].cpu,
              metrics[deploymentId][rolId][instanceId][metrica].mem,
              metrics[deploymentId][rolId][instanceId][metrica].net_in,
              metrics[deploymentId][rolId][instanceId][metrica].net_out,
              metrics[deploymentId][rolId][instanceId][metrica].rpm,
              metrics[deploymentId][rolId][instanceId][metrica].res
            );
        }
      }
    }
  },
  selectedService(state, serviceId) {
    state.selectedService = serviceId;
  }

};