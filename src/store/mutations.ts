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
  addMetrics(state, metrics) {
    console.log('El objeto que recibimos en addmetrics es', metrics);
    // Metrics with the format [deployment]:{data:metris, roles:{data:metrics, instances:metrics}}
    for (let deploymentId in metrics) {
      if (state.deploymentList[deploymentId]) { // Es posible que nada más conectarnos recibamos métricas, cuando todavía no tenemos los deployment
        (<Deployment>state.deploymentList[deploymentId]).addMetrics(metrics[deploymentId].data);
        for (let rolId in metrics[deploymentId].roles) {
          (<Deployment>state.deploymentList[deploymentId]).roles[rolId].addMetrics(
            (<Deployment>state.deploymentList[deploymentId]).isEntrypoint,
            metrics[deploymentId].roles[rolId].data);
          for (let instanceId in metrics[deploymentId].roles[rolId].instances) {
            (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].addMetrics(
              (<Deployment>state.deploymentList[deploymentId]).isEntrypoint,
              metrics[deploymentId].roles[rolId].instances[instanceId]);
          }
        }
      }
    }
  },
  setFabElements(state, { fabElementsList }) {
    state.fabElements = fabElementsList;
  },
  toggleMenuItemExpanded(state, menuItem) {
    menuItem.meta.expanded = !menuItem.meta.expanded;
  },

  selectedService(state, serviceId) {
    state.selectedService = serviceId;
  }
};