import Vue from 'vue';
import * as moment from 'moment'; // as recommended in https://momentjs.com/docs/
import { Deployment, Metric } from './classes';
export default {
  login(state, { id, name }) {
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
      if ((<Deployment>deploymentMap[deploymentId]).roles !== null) {
        // Sobreescribimos los roles (pese a que ya se los hemos pasado), para que guarde correctamente la referéncia
        for (let rolId in (<Deployment>deploymentMap[deploymentId]).roles) {
          Vue.set((<Deployment>state.deploymentList[deploymentId]).roles, rolId, deploymentMap[deploymentId].roles[rolId]);
          
          Vue.set((<Deployment>state.deploymentList[deploymentId]).roles[rolId], 'memory', (<Deployment>deploymentMap[deploymentId]).roles[rolId].memory);
          Vue.set((<Deployment>state.deploymentList[deploymentId]).roles[rolId], 'cpu', (<Deployment>deploymentMap[deploymentId]).roles[rolId].cpu);
          Vue.set((<Deployment>state.deploymentList[deploymentId]).roles[rolId], 'bandwidth', (<Deployment>deploymentMap[deploymentId]).roles[rolId].bandwidth);

          for (let instanceId in (<Deployment>deploymentMap[deploymentId]).roles[rolId].instanceList) {
            if ((<Deployment>deploymentMap[deploymentId]).roles[rolId].instanceList[instanceId]) {
              Vue.set((<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList, instanceId, (<Deployment>deploymentMap[deploymentId]).roles[rolId].instanceList[instanceId]);

              Vue.set((<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].arrangement, 'memory', (<Deployment>deploymentMap[deploymentId]).roles[rolId].instanceList[instanceId].arrangement.memory);
              Vue.set((<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].arrangement, 'cpu', (<Deployment>deploymentMap[deploymentId]).roles[rolId].instanceList[instanceId].arrangement.cpu);
              Vue.set((<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].arrangement, 'bandwith', (<Deployment>deploymentMap[deploymentId]).roles[rolId].instanceList[instanceId].arrangement.bandwith);
            }
          }
        }
      }

    }
    state.deploymentList = { ...state.deploymentList, ...deploymentMap };
  },

  addInstance(state, payload: {
    'deploymentId': string,
    'roleId': string,
    'instanceId': string,
    'instance': Deployment.Rol.Instance
  }) {
    Vue.set((<Deployment>state.deploymentList[payload.deploymentId]).roles[payload.roleId].instanceList, payload.instanceId, payload.instance);
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

    menuItem.children = (<Array<any>>menuItem.children).slice(0, index).concat((<Array<any>>menuItem.children).slice(index + 1, menuItem.children.length - 1));
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

  addDomain(state, resourceMap) {
    state.domainList = { ...state.domainList, ...resourceMap };
  },

  addVolume(state, resourceMap) {
    state.volumeList = { ...state.volumeList, ...resourceMap };
  },

  addCert(state, resourceMap) {
    state.certList = { ...state.certList, ...resourceMap };
  },

  removeResource(state, resourceId) {
    Vue.delete(state.resourceList, resourceId);
  },

  addMetrics(state, metricBundle: { [deploymentId: string]: { 'data': Metric, 'roles': { [rolId: string]: { 'data': Metric, 'instances': { [instanceId: string]: Metric } } } } }) {
    for (let deploymentId in metricBundle) { // This will only happen once
      (<Deployment>state.deploymentList[deploymentId])
        .metrics.push([
          metricBundle[deploymentId].data.timestamp,
          metricBundle[deploymentId]
        ]);
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
    state.selectedService = serviceId;
  }
};