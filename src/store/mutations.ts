import Vue from 'vue';
import { Deployment } from './classes';
export default {
  login(state, {id, name, roles}) {
    state.user.id = id;
    state.user.name = name;
  },
  loginstate(state, value) {
    state.user.state = value;
  },
  addDeployment(state, deploymentMap) {

    /*
    Los deployoment tienen una estructura muy grande y si la añadimos toda de golpe vue no guarda una referéncia
    para escuchar cambios en los roles o las instáncias.
    vue:(https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats)
    vuex: (https://vuex.vuejs.org/en/mutations.html)

    Lo adecuado es que guardemos aquellas referencias a estructuras internas de una en una
    */


    for (let deploymentId in deploymentMap) {
      Vue.set(state.deploymentList, deploymentId, deploymentMap[deploymentId]);

      // Sobreescribimos los roles (pese a que ya se los hemos pasado), para que guarde correctamente la referéncia
      for (let rolId in (<Deployment>deploymentMap[deploymentId]).roles) {
        Vue.set((<Deployment>state.deploymentList[deploymentId]).roles, rolId, deploymentMap[deploymentId].roles[rolId]);
        Vue.set((<Deployment>state.deploymentList[deploymentId]).roles[rolId], 'memory', (<Deployment>deploymentMap[deploymentId]).roles[rolId].memory);
        Vue.set((<Deployment>state.deploymentList[deploymentId]).roles[rolId], 'cpu', (<Deployment>deploymentMap[deploymentId]).roles[rolId].cpu);
        Vue.set((<Deployment>state.deploymentList[deploymentId]).roles[rolId], 'bandwidth', (<Deployment>deploymentMap[deploymentId]).roles[rolId].bandwidth);
        Vue.set((<Deployment>state.deploymentList[deploymentId]).roles[rolId], 'metrics', (<Deployment>deploymentMap[deploymentId]).roles[rolId].metrics);

        for (let instanceId in (<Deployment>deploymentMap[deploymentId]).roles[rolId].instanceList) {
          Vue.set((<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList, instanceId, (<Deployment>deploymentMap[deploymentId]).roles[rolId].instanceList[instanceId]);
          Vue.set((<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId], 'metrics', (<Deployment>deploymentMap[deploymentId]).roles[rolId].instanceList[instanceId].metrics);

          Vue.set((<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].arrangement, 'memory', (<Deployment>deploymentMap[deploymentId]).roles[rolId].instanceList[instanceId].arrangement.memory);
          Vue.set((<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].arrangement, 'cpu', (<Deployment>deploymentMap[deploymentId]).roles[rolId].instanceList[instanceId].arrangement.cpu);
          Vue.set((<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].arrangement, 'bandwith', (<Deployment>deploymentMap[deploymentId]).roles[rolId].instanceList[instanceId].arrangement.bandwith);

        }
      }
    }
    state.deploymentList = { ...state.deploymentList, ...deploymentMap };
  },
  removeDeployment(state, deploymentId) {
    Vue.delete(state.deploymentList, deploymentId);
  },
  addDeploymentMenuItem(state, deploymentMenuItem) {
    // obtenemos el menuitem deployments
    let menuItem = state.menuItemList.find(menuItem => { return menuItem.name === 'Overview'; });

    if (!menuItem.children)
      Vue.set(menuItem, 'children', []);

    let aux = (<Array<any>>menuItem.children).find(mItem => mItem.path === deploymentMenuItem.path);
    if (!aux)
      menuItem.children.push(deploymentMenuItem);
  },
  removeDeploymentMenuItem(state, deploymentPath) {
    let menuItem = state.menuItemList.find(menuItem => { return menuItem.name === 'Overview'; });
    let index = (<Array<any>>menuItem.children).find(item => item.path === deploymentPath);
    index = (<Array<any>>state.menuItemList).indexOf(index);

    menuItem.children = (<Array<any>>menuItem.children).slice(0, index).concat((<Array<any>>menuItem.children).slice(index + 1, menuItem.children.lenght - 1));
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
  removeResource(state, resourceId) {
    Vue.delete(state.resourceList, resourceId);
  },
  addMetrics(state, metrics) {
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
  setMenu(state, menuItems) {
    for (let i = 0; i < menuItems.length; i++) {
      state.menuItemList.push(menuItems[i]);
    }
  },
  setFabElements(state, { fabElementsList }) {
    state.fabElements = fabElementsList;
  },
  toggleMenuItemExpanded(state, menuItem) {
    menuItem.meta.expanded = !menuItem.meta.expanded;
  },

  selectedService(state, serviceId) {
    if (serviceId && state.serviceList[serviceId])
      state.selectedService = serviceId;
  }
};