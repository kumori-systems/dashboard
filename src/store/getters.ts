import { Deployment, DeploymentRol, Component, Service, Link, State as StateType, Channel, Resource, Instance, FabElement } from './classes';
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
      let website = (<Deployment>state.deploymentList[deploymentId]).website;
      if (website != null) return website;
      // Si en este punto es null, significa que no es un entrypoint y tenemos que buscar en los links aquel que esté
      // lincado y sea un entrypoint (tenga un website != null)

      for (let linkIndex in state.linkList) {
        if ((<Link>state.linkList[linkIndex]).deploymentOne === deploymentId) {
          if ((<Deployment>state.deploymentList[(<Link>state.linkList[linkIndex]).deploymentTwo]).website != null)
            return (<Deployment>state.deploymentList[(<Link>state.linkList[linkIndex]).deploymentTwo]).website;
        }
        if ((<Link>state.linkList[linkIndex]).deploymentTwo === deploymentId) {
          if ((<Deployment>state.deploymentList[(<Link>state.linkList[linkIndex]).deploymentOne]).website != null)
            return (<Deployment>state.deploymentList[(<Link>state.linkList[linkIndex]).deploymentOne]).website;
        }
      }
    };
  },
  getDeploymentState: function (state, getters): Function {
    return function (deploymentId: string): StateType {
      let onProgress = false;
      for (let rolId in (<Deployment>state.deploymentList[deploymentId]).roles) {
        switch (getters.getDeploymentRolState(deploymentId, rolId)) {
          case StateType.DISCONNECTED: return StateType.DISCONNECTED;
          case StateType.ON_PROGRESS: onProgress = true; break;
          default:
        }
      }
      if (onProgress === true) return StateType.ON_PROGRESS;
      return StateType.CONNECTED;
    };
  },
  getDeploymentLinks: function (state): Function {
    return function (deploymentId: string) {
      let res = [];
      // Buscamos en los links las conexiones de este deployment
      for (let linkIndex in state.linkList) {
        if ((<Link>state.linkList[linkIndex]).deploymentOne === deploymentId) {
          res.push({
            'myChannel': (<Link>state.linkList[linkIndex]).channelOne,
            'toDeployment': (<Deployment>state.deploymentList[(<Link>state.linkList[linkIndex]).deploymentTwo]).name,
            'toChannel': (<Link>state.linkList[linkIndex]).channelTwo
          });
        }
        if ((<Link>state.linkList[linkIndex]).deploymentTwo === deploymentId) {
          res.push({
            'myChannel': (<Link>state.linkList[linkIndex]).channelTwo,
            'toDeployment': (<Deployment>state.deploymentList[(<Link>state.linkList[linkIndex]).deploymentOne]).name,
            'toChannel': (<Link>state.linkList[linkIndex]).channelOne
          });
        }
      }
      return res;
    };
  },
  getDeploymentVolumes: function (state): Function {
    return function (deploymentId: string): Array<string> {
      let res: Array<string> = [];
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      let serviceResources = (<Service>state.serviceList[serviceId]).resources;
      for (let resourceIndex in serviceResources) {
        if ((<Resource>state.resourcesList[serviceResources[resourceIndex]]).realName && (<Resource>state.resourcesList[serviceResources[resourceIndex]]).realName.split('/')[4] === 'volume')
          res.push(serviceResources[resourceIndex]);
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

  getDeploymentRolState: function (state, getters): Function {
    return function (deploymentId: string, rolId: string): StateType {
      let onProgress = false;
      for (let instanceId in (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList) {
        switch (getters.getDeploymentRolInstanceState(deploymentId, rolId, instanceId)) {
          case StateType.DISCONNECTED: return StateType.DISCONNECTED;
          case StateType.ON_PROGRESS: onProgress = true; break;
          default:
        }
      }
      if (onProgress === true) return StateType.ON_PROGRESS;
      return StateType.CONNECTED;
    };
  },
  getDeploymentRolRuntime: function (state): Function {
    return function (deploymentId: string, rolId: string): string {
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      let componentId = (<Service>state.serviceList[serviceId]).roles[rolId].component;
      return (<Component>state.componentList[componentId]).runtime;
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
      return (<Deployment>state.deploymentList[deploymentId]).roles[rolId].bandwidth;
    };
  },
  getDeploymentRolVolumeList: function (state) {
    return (deploymentId, rolId) => {
      let res = [];
      // Obtenemos el servicio
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      let resources = (<Service>state.serviceList[serviceId]).roles[rolId].resources;
      for (let resourceId in resources) {
        // Buscamos las resources que sean volumenes
        if ((<Resource>state.resourcesList[resources[resourceId]]).realName.split[4] === 'volume') {
          res.push(resources[resourceId]);
        }
      }

      console.log('LOS VOLUMENES DEL ROL SON: ' + JSON.stringify(res));
      return res;
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
    return function (deploymentId: string, rolId: string) {
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      let componentId = (<Service>state.serviceList[serviceId]).roles[rolId].component;
      return {
        ...(<Component>state.componentList[componentId]).proChannels,
        ...(<Component>state.componentList[componentId]).reqChannels
      };
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
  getDeploymentRolInstanceState: function (state) {
    return function (deploymentId: string, rolId: string, instanceId: string): number {
      return (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].state;
    };
  },
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
  getWebServiceNameList: function (state): Array<string> {
    let res = [];
    for (let serviceId in state.serviceList)
      res.push((<Service>state.serviceList[serviceId]).name);
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
      for (let componentId in (<Component>state.componentList)) {
        aux = (<Component>state.componentList[componentId]).runtime;
        if (!res.find(runtim => { return runtim === aux; }))// Comprobamos que no esta ya añadido
          res.push(aux);
      }
    }
    return res;
  },

  getWebDomainList: function (state): Array<string> {
    return [
      'monitor-ticket740.slap53.iti.es',
      'admission-ticket740.slap53.iti.es',
      'acs-ticket740.slap53.iti.es',
      'another-webdomain.slap53.iti.es',
      'another2-webdomain.slap53.iti.es',
      'another3-webdomain.slap53.iti.es'
    ];
  },

  getFreeWebDomainList: function (state, getters) {
    // Buscamos los inbound
    let allWebDomains: Array<string> = getters.getWebDomainList;
    let usedWebdomain: string;
    let index: number;
    for (let deploymentId in state.deploymentList) {
      usedWebdomain = (<Deployment>state.deploymentList[deploymentId]).website;
      index = allWebDomains.indexOf(usedWebdomain);
      if (index > -1) {
        allWebDomains.splice(index, 1);
      }
    }

    return allWebDomains;
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
    return ['cert1', 'cert2', 'cert3'];
  },
  getServiceRoles: function (state) {
    return function (serviceName: string) {
      if (serviceName == null) return [];
      let res: Array<string> = [];

      // Tenemos que buscar el servicio por su nombre
      for (let serviceId in state.serviceList) {
        if (state.serviceList[serviceId].name === serviceName) {
          // Y obtener sus roles
          for (let rol in (<Service>state.serviceList[serviceId]).roles) {
            res.push(rol);
          }
        }
      }
      return res;
    };
  },
  getServiceResources: function (state) {
    return (serviceName: string) => {
      if (serviceName == null) return [];
      let res: Array<string> = [];

      // Tenemos que buscar el servicio por su nombre
      for (let serviceId in state.serviceList) {
        if (state.serviceList[serviceId].name === serviceName) {
          // Y obtener sus resources
          for (let resourceIndex in (<Service>state.serviceList[serviceId]).resources) {
            res.push((<Service>state.serviceList[serviceId]).resources[resourceIndex]);
          }
        }
      }
      return res;
    };
  },
  getServiceProChannels: function (state) {
    return (serviceName: string) => {
      if (serviceName == null) return [];
      let res: Array<string> = [];

      // Tenemos que buscar el servicio por su nombre
      for (let serviceId in state.serviceList) {
        if (state.serviceList[serviceId].name === serviceName) {
          // Y obtener sus proChannels
          for (let proChannel in (<Service>state.serviceList[serviceId]).proChannels) {
            res.push(proChannel);
          }
        }
      }
      return res;
    };
  },
  getServiceReqChannels: function (state) {
    return (serviceName: string) => {
      if (serviceName == null) return [];
      let res: Array<string> = [];

      // Tenemos que buscar el servicio por su nombre
      for (let serviceId in state.serviceList) {
        if (state.serviceList[serviceId].name === serviceName) {
          // Y obtener sus reqChannels
          for (let reqChannel in (<Service>state.serviceList[serviceId]).reqChannels) {
            res.push(reqChannel);
          }
        }
      }
      return res;
    };
  },
  getTotalProvidedDeploymentChannels: function (state) {
    // Recorremos los deployments y añadimos todos los identificadores de los canales provided
    let res = [];

    for (let deploymentId in state.deploymentList) {
      // Obtenemos el servicio del deployment
      let serviceId: string = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      for (let providedChannelId in (<Service>state.serviceList[serviceId]).proChannels)
        res.push(deploymentId + ' + ' + providedChannelId);
    }
    return res;
  },
  getTotalRequiredDeploymentChannels: function (state) {
    // Recorremos los deployments y añadimos todos los identificadores de los canales provided
    let res = [];

    for (let deploymentId in state.deploymentList) {
      // Obtenemos el servicio del deployment
      let serviceId: string = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      for (let requiredChannelId in (<Service>state.serviceList[serviceId]).reqChannels)
        res.push(deploymentId + ' + ' + requiredChannelId);
    }
    return res;
  },
  getFreeResource: function (state) {
    return (configId) => {
      let res: Array<string> = [];

      // Miramos el tipo de configId
      if ((<Resource>state.resourcesList[configId]).realName) {
        let type = (<Resource>state.resourcesList[configId]).realName.split('/')[4];

        for (let resourceId in (<Array<Resource>>state.resourcesList)) {
          if ((<Resource>state.resourcesList[resourceId]).realName && (<Resource>state.resourcesList[resourceId]).realName.split('/')[4] === type) {
            res.push(resourceId);
          }
        }
      }

      // Debemos de eliminar las resources ya utilizadas
      for (let deploymentId in (<Array<Deployment>>state.deploymentList)) {
        for (let resourceId in (<Deployment>state.deploymentList[deploymentId]).resourcesConfig) {
          let index = res.indexOf(resourceId);
          if (index > -1)
            res.splice(index, 1);
        }
      }

      return res;
    };
  },
  getTemporaryState: function (state) {
    return state.temporaryState;
  }
};