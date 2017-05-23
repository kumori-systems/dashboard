import { Deployment, DeploymentRol, Component, Service, State as StateType, Channel, Resource, Instance, FabElement } from './classes';
export default {

  /* GENERAL */
  sidebar: function (state) {
    return state.sidebar;
  },
  getFabElements: function (state): Array<FabElement> {
    return state.fabElements;
  },

  /* MENU */
  menuItems: function (state) {
    return state.menuItemList;
  },

  /* VIEWS */
  getHideEntrypoints: function (state): boolean {
    return state.hideEntrypoints;
  },

  /* DEPLOYMENTS */
  getDeploymentList: function (state): Array<string> {
    let res: Array<string> = [];
    for (let index in state.deploymentList)
      res.push(index);
    return res;
  },
  getDeploymentIdFromDeploymentRoute: function (state): Function {
    return function (deploymentRoute: string): string {
      // Tenemos que obtener el id a partir de la ruta, esto es
      // Entrar en el menú, mirar qué elemento está utilizando esta ruta y pasar el nombre
      let overview = state.menuItemList.find(menuItem => { return menuItem.name === 'OVERVIEW'; });

      // Eliminamos el primer \ y cambiamos el resto por /
      while (deploymentRoute.indexOf('\\') !== -1) {
        deploymentRoute = deploymentRoute.replace('\\', '/');
      }
      deploymentRoute = deploymentRoute.substring(1, deploymentRoute.length);

      // Tenemos que deshacer el cambio para poder reconocer el id
      return overview.children.find(menuItem => {
        return menuItem.meta.id === deploymentRoute;
      }).meta.id;
    };
  },
  getDeploymentPath: function (state): Function {
    return function (deploymentId: String): string {
      // Obtenemos la vista que contiene los deployment == OVERVIEW
      let overview = state.menuItemList.find(menuItem => { return menuItem.name === 'OVERVIEW'; });
      return overview.children.find(deploymentMenuItem => {
        return deploymentMenuItem.meta.id === deploymentId;
      }).path;
    };
  },
  getDeploymentName: function (state): Function {
    return function (deploymentId: string): string {
      return (<Deployment>state.deploymentList[deploymentId]).name;
    };
  },
  getDeploymentService: function (state): Function {
    return function (deploymentId: string): string {
      return (<Deployment>state.deploymentList[deploymentId]).serviceId;
    };
  },
  getIsEntryPoint: function (state, getters) {
    return function (deploymentId: string): boolean {
      if (getters.getDeploymentService(deploymentId) === 'eslap://eslap.cloud/services/http/inbound/1_0_0')
        return true;
      return false;
    };
  },
  getDeploymentWebsite: function (state): Function {
    return function (deploymentId: string): string {
      return (<Deployment>state.deploymentList[deploymentId]).website;
    };
  },
  getDeploymentState: function (state): Function {
    return function (deploymentId: string): StateType {
      let ranNumber = Math.trunc(Math.random() * 3);
      switch (ranNumber) {
        case 0: return StateType.ACTIVE;
        case 1: return StateType.NO_ACTIVE;
        default: return StateType.ON_PROGRESS;
      }
    };
  },
  getDeploymentLinks: function (state): Function {
    return function (deploymentId: string): { [channelId: string]: Channel } {
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      let res: { [channelId: string]: Channel } = {
        ...(<Service>state.serviceList[serviceId]).proChannels,
        ...(<Service>state.serviceList[serviceId]).reqChannels
      };
      return res;
    };
  },
  getDeploymentVolumes: function (state): Function {
    return function (deploymentId: string): Array<string> {
      let res: Array<string> = [];
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      let resources = (<Service>state.serviceList[serviceId]).resources;
      for (let resourceIndex in resources) {
        if (resources[resourceIndex].realName && resources[resourceIndex].realName.split('/')[4] === 'volume')
          res.push(resourceIndex);
      }

      return res;
    };
  },
  getDeploymentChartData: function (state): Function {
    return function (deploymentId: string): Object {
      return {
        datasets: [{
          label: 'mylabel',
          backgroundColor: 'green',
          data: [
            { x: 0, y: 2 },
            { x: 1, y: 1 }
          ]
        }, {
          label: 'mylabel2',
          backgroundColor: 'yellow',
          data: [
            { x: 0, y: 1 },
            { x: 1, y: 3 }
          ]
        },
        {
          label: 'mylabel3',
          backgroundColor: 'red',
          data: [
            { x: 0, y: 2.4 },
            { x: 1, y: 1.5 }
          ]
        }]
      };
    };
  },

  /* ROLES */
  getDeploymentRoles: function (state): Function {
    return function (deploymentId: string): Array<string> {
      let res: Array<string> = [];
      let deployment: Deployment = state.deploymentList[deploymentId];
      for (let rolId in deployment.roles) {
        res.push(rolId);
      }
      return res;
    };
  },

  getDeploymentRolComponentURN: function (state) {
    return function (deploymentId: string, rolId: string) {
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      return (<Service>state.serviceList[serviceId]).roles[rolId].component;
    };
  },

  getDeploymentRolNumInstances: function (state): Function {
    return function (deploymentId: string, rolId: string) {
      return (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instances;
    };
  },

  getDeploymentRolState: function (state): Function {
    return function (deploymentId: string, rolId: string): StateType {
      let ranNumber = Math.trunc(Math.random() * 3);
      switch (ranNumber) {
        case 0: return StateType.ACTIVE;
        case 1: return StateType.NO_ACTIVE;
        default: return StateType.ON_PROGRESS;
      }
    };
  },
  getDeploymentRolRuntime: function (state): Function {
    return function (deploymentId: string, rolId: string): string {
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      let componentId = (<Service>state.serviceList[serviceId]).roles[rolId].component;
      return (<Service>state.serviceList[serviceId]).components[componentId].runtime;
    };
  },
  getDeploymentRolChartData: function (state): Function {
    return function (deploymentId: string, rolId: string): Object {
      return {
        datasets: [{
          label: 'mylabel',
          backgroundColor: 'green',
          data: [
            { x: 0, y: 2 },
            { x: 1, y: 1 }
          ]
        }, {
          label: 'mylabel2',
          backgroundColor: 'yellow',
          data: [
            { x: 0, y: 1 },
            { x: 1, y: 3 }
          ]
        },
        {
          label: 'mylabel3',
          backgroundColor: 'red',
          data: [
            { x: 0, y: 2.4 },
            { x: 1, y: 1.5 }
          ]
        }]
      };
    };
  },
  getDeploymentRolMemNumber: function (state): Function {
    return function (deploymentId: string, rolId: string): number {
      return (<Deployment>state.deploymentList[deploymentId]).roles[rolId].memory;
    };
  },
  getDeploymentRolCPUNumber: function (state): Function {
    return function (deploymentId: string, rolId: string): number {
      return (<Deployment>state.deploymentList[deploymentId]).roles[rolId].cpu;
    };
  },
  getDeploymentRolNetNumber: function (state): Function {
    return function (deploymentId: string, rolId: string): number {
      return (<Deployment>state.deploymentList[deploymentId]).roles[rolId].bandwith;
    };
  },
  getDeploymentRolInstances: function (state) {
    return function (deploymentId: string, rolId: string): Array<string> {
      let res: Array<string> = [];
      for (let instanceId in (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList)
        res.push(instanceId);
      return res;
    };
  },
  getDeploymentRolConnectedTo: function (state) {
    return function (deploymentId: string, rolId: string): { providers: any, dependents: any } {
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      let componentId = (<Service>state.serviceList[serviceId]).roles[rolId].component;
      return { providers: (<Service>state.serviceList[serviceId]).components[componentId].proChannels, dependents: (<Service>state.serviceList[serviceId]).components[componentId].reqChannels };
    };
  },

  getDeploymetRolTemporaryState: function (state) {
    return function (deploymentId: string, rolId: string) {
      if (state.temporaryState[deploymentId])
        return state.temporaryState[deploymentId][rolId];
      else
        return state.temporaryState[deploymentId];
    };
  },
  /* INSTANCES */

  getDeploymentRolInstanceMem: function (state, getters): Function {
    return function (deploymentId: string, rolId: string, instanceId: string): number {
      return getters.getDeploymentRolMemNumber;
    };
  },
  getDeploymentRolInstanceCPU: function (state, getters): Function {
    return function (deploymentId: string, rolId: string, InstanceId: string): number {
      return getters.getDeploymentRolCPUNumber;
    };
  },
  getDeploymentRolInstanceNet: function (state, getters): Function {
    return function (deploymentId: string, rolId: string, InstanceId: string): number {
      return getters.getDeploymentRolNETNumber;
    };
  },

  getDeploymentRolInstanceChartData: function (state): Function {
    return function (deploymentId: string, rolId: string, InstanceId: string): Object {
      return {
        datasets: [{
          label: 'mylabel',
          backgroundColor: 'green',
          data: [
            { x: 0, y: 2 },
            { x: 1, y: 1 }
          ]
        }, {
          label: 'mylabel2',
          backgroundColor: 'yellow',
          data: [
            { x: 0, y: 1 },
            { x: 1, y: 3 }
          ]
        },
        {
          label: 'mylabel3',
          backgroundColor: 'red',
          data: [
            { x: 0, y: 2.4 },
            { x: 1, y: 1.5 }
          ]
        }]
      };
    };
  },

  getComponentList: function (state): Array<string> {
    // Buscamos en cada servicio todos los componentes que poseen
    let res = [];
    for (let servicetIndex in state.serviceList) {
      for (let componentId in (<Service>state.serviceList[servicetIndex]).components) {
        res.push(componentId);
      }
    }
    return res;
  },

  /**
   * Devolvemos una lista de servicios web disponibles para el usuario
   */
  getWebServiceList: function (state): Array<string> {
    let res = [];
    for (let serviceId in state.serviceList)
      res.push(serviceId);
    return res;
  },
  /**
   * Devolvemos una lista de runtimes disponibles para el usuario
   */
  getRuntimeList: function (state): Array<string> {
    // Buscamos todos los runtime en los roles de los deployments
    let res = [];
    let aux: string;
    for (let serviceId in state.serviceList) {
      for (let componentId in (<Service>state.serviceList[serviceId]).components) {
        aux = (<Component>(<Service>state.serviceList[serviceId]).components[componentId]).runtime;
        if (!res.find(runtim => { return runtim === aux; }))// Comprobamos que no esta ya añadido
          res.push(aux);
      }
    }
    return res;
  },
  getWebDomainList: function (state) {
    // Buscamos los inbound
    let res = [];
    let aux: string;
    for (let deploymentId in state.deploymentList) {
      aux = (<Deployment>state.deploymentList[deploymentId]).website;
      if (!res.find(dom => { return dom === aux; }))
        res.push(aux);
    }

    return res;
  },
  getDataVolumesList: function (state, getters) {
    // Los volumenes los tengo almacenados por instáncia!!
    let res = [];
    for (let deploymentId in state.deploymentList) {
      for (let volumeId in getters.getDeploymentVolumes(deploymentId)) {
        if (!res.find(vol => { return vol === volumeId; }))
          res.push(volumeId);
      }
    }

    return res;
  },
  getCertificateList: function (state) {

  }
};