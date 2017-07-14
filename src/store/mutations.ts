import { Deployment } from './classes';
export default {
  login(state, user) {
    state.user = user;
  },
  authError(state, value) {
    state.authError = value;
  },
  addDeployment(state, deploymentMap) {
    state.deploymentList = { ...state.deploymentList, ...deploymentMap };
  },
  addDeploymentMenuItem(state, deploymentMenuItem) {
    // obtenemos el menuitem deployments
    let menuItem = state.menuItemList.find(menuItem => { return menuItem.name === 'OVERVIEW'; });

    // Quitamos los hijos anteriores para actualizar de cero
    if (!menuItem.children) menuItem.children = [];
    menuItem.children.push(deploymentMenuItem);
  },
  addService(state, serviceMap) {
    state.serviceList = { ...state.serviceList, ...serviceMap };
  },
  addComponent(state, componentMap) {
    state.componentList = { ...state.componentList, ...componentMap };
  },
  addRuntime(state, runtimeMap) {
    state.runtimeList = { ...state.runtimeList, ...runtimeMap };
  },
  addLink(state, link) {
    state.linkList.push(link);
  },
  addResource(state, resourceMap) {
    state.resourceList = { ...state.resourceList, ...resourceMap };
  },
  setFabElements(state, { fabElementsList }) {
    state.fabElements = fabElementsList;
  },
  toggleMenuItemExpanded(state, menuItem) {
    menuItem.meta.expanded = !menuItem.meta.expanded;
  },
  addMetrics(state, { entryPointMetrics, normalMetrics }) {
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