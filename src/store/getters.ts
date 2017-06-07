import { Deployment, DeploymentRol, Component, Service, Webdomain, Link, State as StateType, Channel, Resource, Instance, FabElement } from './classes';
export default {
  /* GENERAL */
  getUsername: function (state): string {
    return state.username;
  },
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
      return getters.getServiceIsEntryPoint(getters.getDeploymentService(deploymentId));
    };
  },
  getServiceIsEntryPoint: function (state) {
    return function (serviceId: string): boolean {
      if (serviceId === 'eslap://eslap.cloud/services/http/inbound/1_0_0')
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

  /**
   * Buscamos las conexiones definidas por el servicio del deployment.
   * Buscaremos también los links para saber aquellas conexiones que están siendo utilizadas y cuales no
  */
  getDeploymentProvideChannels: function (state) {
    return (deploymentId: string) => {
      let serviceId: string = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      let res = [];
      for (let proChannel in (<Service>state.serviceList[serviceId]).proChannels) {
        let encontrado: boolean = false;
        for (let linkIndex in state.linkList) {
          if ((<Link>state.linkList[linkIndex]).deploymentOne === deploymentId) {
            if ((<Link>state.linkList[linkIndex]).channelOne === proChannel) {
              res.push({
                'myChannel': (<Link>state.linkList[linkIndex]).channelOne,
                'toDeployment': (<Deployment>state.deploymentList[(<Link>state.linkList[linkIndex]).deploymentTwo]).name,
                'toChannel': (<Link>state.linkList[linkIndex]).channelTwo
              });
              encontrado = true;
            }

          }
          if ((<Link>state.linkList[linkIndex]).deploymentTwo === deploymentId) {
            if ((<Link>state.linkList[linkIndex]).channelTwo === proChannel) {
              res.push({
                'myChannel': (<Link>state.linkList[linkIndex]).channelTwo,
                'toDeployment': (<Deployment>state.deploymentList[(<Link>state.linkList[linkIndex]).deploymentOne]).name,
                'toChannel': (<Link>state.linkList[linkIndex]).channelOne
              });
              encontrado = true;
            }
          }
        }
        if (!encontrado) { // Se utiliza para cubrir el caso en que el canal de servicio no tenga link
          res.push({
            'myChannel': proChannel,
            'toDeployment': 'none',
            'toChannel': 'none'
          });
        }
      }
      return res;
    };
  },
  getDeploymentRequireChannels: function (state) {
    return (deploymentId: string) => {
      let serviceId: string = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      let res = [];
      for (let reqChannel in (<Service>state.serviceList[serviceId]).reqChannels) {
        let encontrado: boolean = false;
        for (let linkIndex in state.linkList) {
          if ((<Link>state.linkList[linkIndex]).deploymentOne === deploymentId) {
            if ((<Link>state.linkList[linkIndex]).channelOne === reqChannel) {
              res.push({
                'myChannel': (<Link>state.linkList[linkIndex]).channelOne,
                'toDeployment': (<Deployment>state.deploymentList[(<Link>state.linkList[linkIndex]).deploymentTwo]).name,
                'toChannel': (<Link>state.linkList[linkIndex]).channelTwo
              });
              encontrado = true;
            }

          }
          if ((<Link>state.linkList[linkIndex]).deploymentTwo === deploymentId) {
            if ((<Link>state.linkList[linkIndex]).channelTwo === reqChannel) {
              res.push({
                'myChannel': (<Link>state.linkList[linkIndex]).channelTwo,
                'toDeployment': (<Deployment>state.deploymentList[(<Link>state.linkList[linkIndex]).deploymentOne]).name,
                'toChannel': (<Link>state.linkList[linkIndex]).channelOne
              });
              encontrado = true;
            }
          }
        }
        if (!encontrado) { // Se utiliza para cubrir el caso en el que el canal de servicio no tenga link
          res.push({
            'myChannel': reqChannel,
            'toDeployment': 'none',
            'toChannel': 'none'
          });
        }
      }
      return res;
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
  getDeploymentChartData: function (state, getters): Function {
    return function (deploymentId: string): Object {
      // Buscamos todas las instancias del rol
      for (let rolId in (<Deployment>state.deploymentList[deploymentId]).roles) {
        // TODO: Esto va mal, devuelve el valor del primer rol y no suma
        return getters.getDeploymentRolChartData(deploymentId, rolId);
      }
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
  getDeploymentRolChartData: function (state, getters): Function {
    return function (deploymentId: string, rolId: string): Object {
      // Buscamos todas las instancias del rol
      for (let instanceId in (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList) {
        // TODO: Esto va mal, devuelve el valor de la primera instancia, y no suma
        return getters.getDeploymentRolInstanceChartData(deploymentId, rolId, instanceId);
      }
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
        if ((<Resource>state.resourcesList[resources[resourceId]]).realName.split('/')[4] === 'volume') {
          res.push(resources[resourceId]);
        }
      }
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
  getDeploymentRolReqConnectedTo: function (state): Function {
    return function (deploymentId: string, rolId: string): Array<[string, Channel]> {
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      let componentId = (<Service>state.serviceList[serviceId]).roles[rolId].component;
      let res = [];
      for (let connectionIndex in (<Component>state.componentList[componentId]).reqChannels) {
        res.push([connectionIndex, (<Component>state.componentList[componentId]).reqChannels[connectionIndex]]);
      }
      return res;
    };
  },
  getDeploymentRolProConnectedTo: function (state): Function {
    return function (deploymentId: string, rolId: string): Array<[string, Channel]> {
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      let componentId = (<Service>state.serviceList[serviceId]).roles[rolId].component;
      let res = [];
      for (let connectionIndex in (<Component>state.componentList[componentId]).proChannels) {
        res.push([connectionIndex, (<Component>state.componentList[componentId]).proChannels[connectionIndex]]);
      }
      return res;
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
      return getters.getDeploymentRolMemNumber(deploymentId, rolId);
    };
  },
  getDeploymentRolInstanceCPU: function (state, getters): Function {
    return function (deploymentId: string, rolId: string, InstanceId: string): number {
      return getters.getDeploymentRolCPUNumber(deploymentId, rolId);
    };
  },
  getDeploymentRolInstanceNet: function (state, getters): Function {
    return function (deploymentId: string, rolId: string, InstanceId: string): number {
      return getters.getDeploymentRolNetNumber(deploymentId, rolId);
    };
  },
  getDeploymentRolInstanceChartData: function (state): Function {
    return function (deploymentId: string, rolId: string, instanceId: string): Array<{
      'time': Date, 'cpu': number, 'mem': number, 'net_in': number, 'net_out': number, 'rpm': number, 'res': number
    }> {
      return (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].metrics;
    };
  },

  getComponentList: function (state, getters): Function {
    return (filter, showPublicElems): Array<string> => {
      let res: Array<string> = [];
      for (let componentIndex in state.componentList) {
        res.push(componentIndex);
      }
      if (!showPublicElems) {
        let username = getters.getUsername;
        res = res.filter(elem => { return elem.split('/')[2] === username; });
      }

      if (filter != null && filter.length > 0)
        return res.filter(elem => { return elem.indexOf(filter) !== -1; });
      return res;
    };
  },

  getComponentVersion: function (state) {
    return (componentId) => {
      let splitted = componentId.split('/');
      return splitted[splitted.length - 1];
    };
  },

  getComponentOwner: function (state) {
    return (componentId) => {
      return componentId.split('/')[2];
    };
  },
  getIsComponentInUse: function (state) {
    return (componentId) => {
      // Tenemos que comprobar si el componente está siendo utilizado por algún servicio
      for (let serviceIndex in state.serviceList) {
        for (let componentIndex in (<Service>state.serviceList[serviceIndex]).components) {
          if ((<Service>state.serviceList[serviceIndex]).components[componentIndex] === componentId)
            return true;
        }
      }
      return false;
    };
  },

  /**
   * Devolvemos una lista de servicios web disponibles para el usuario
   */
  getWebServiceList: function (state, getters): Function {
    return (filter, showPublicElems): Array<string> => {
      let res = [];
      for (let serviceId in state.serviceList) {
        res.push(serviceId);
      }

      if (!showPublicElems) {
        let username = getters.getUsername;
        res = res.filter(elem => { return elem.split('/')[2] === username; });
      }

      if (filter != null && filter.length > 0)
        return res.filter(elem => { return elem.indexOf(filter) !== -1; });
      return res;
    };



  },
  getServiceNameList: function (state): Array<string> {
    let res = [];
    for (let serviceId in state.serviceList)
      res.push((<Service>state.serviceList[serviceId]).name);
    return res;
  },
  /**
   * Devolvemos el nombre de aquellos servicios que no sean Entrypoint
   */
  getNoEPServiceNameList: function (state): Array<string> {
    let res = [];
    for (let serviceId in state.serviceList) {
      if (serviceId.split('/')[5] !== 'inbound')
        res.push((<Service>state.serviceList[serviceId]).name);
    }
    return res;
  },
  /**
   * Devolvemos una lista de runtimes disponibles para el usuario
   */
  getRuntimeList: function (state, getters): Function {
    // Buscamos todos los runtime en los roles de los deployments
    return (filter, showPublicElems): Array<string> => {

      let res = [];
      let aux: string;
      for (let serviceId in state.serviceList) {
        for (let componentId in (<Component>state.componentList)) {
          aux = (<Component>state.componentList[componentId]).runtime;
          if (!res.find(runtim => { return runtim === aux; }))// Comprobamos que no esta ya añadido
            res.push(aux);
        }
      }

      if (!showPublicElems) {
        let username = getters.getUsername;
        res = res.filter(elem => { return elem.split('/')[2] === username; });
      }


      if (filter != null && filter.length > 0)
        return res.filter(elem => { return elem.indexOf(filter) !== -1; });
      return res;
    };
  },
  getRuntimeVersion: function (state) {
    return (runtimeId) => {
      let splitted = runtimeId.split('/');
      return splitted[splitted.length - 1];
    };
  },
  getIsRuntimeInUse: function (state) {
    return (runtimeId) => {
      // Recorremos la lista de componentes.
      // Si encontramos el runtime en alguno de los componentes devolvemos true
      for (let componentId in state.componentList) {
        if ((<Component>state.componentList[componentId]).runtime === runtimeId)
          return true;
      }
      return false;
    };
  },
  getRuntimeOwner: function (state) {
    return (runtimeId) => {
      return runtimeId.split('/')[2];
    };
  },

  getWebDomainList: function (state): Array<string> {
    let res: Array<string> = [];
    for (let index in state.webDomainList) {
      res.push((<Webdomain>state.webDomainList[index]).url);
    }
    return res;
  },

  getUsedWebDomainList: function (state, getters) {
    let usedWebdomain: Array<string> = [];
    let website: string = null;
    for (let deploymentId in state.deploymentList) {
      website = (<Deployment>state.deploymentList[deploymentId]).website;
      if (website != null)
        usedWebdomain.push(website);
    }
    return usedWebdomain;
  },
  getWebdomainState: function (state) {
    return (webdomain) => {
      return state.webDomainList.find(elem => {
        return elem.url === webdomain;
      }).state;
    };
  },
  getFreeWebDomainList: function (state, getters) {
    // Buscamos los inbound
    let allWebDomains: Array<string> = getters.getWebDomainList;
    let usedWebdomains: Array<string> = getters.getUsedWebDomainList;
    let index: number;
    for (let uwd in usedWebdomains) {
      index = allWebDomains.indexOf(usedWebdomains[uwd]);
      if (index > -1) {
        allWebDomains.splice(index, 1);
      }
    }
    // En este punto, en allWebDomains, únicamente quedan aquellos que no están en la lista usedWebdomains
    return allWebDomains;
  },
  getDataVolumesList: function (state, getters): Array<string> {
    let res: Array<string> = [];
    for (let resourceIndex in state.resourcesList) {
      if ((<Resource>state.resourcesList[resourceIndex]).realName && (<Resource>state.resourcesList[resourceIndex]).realName.split('/')[4] === 'volume') {
        res.push(resourceIndex);
      }
    }
    return res;
  },
  getCertificateList: function (state) {
    return state.certList;
  },
  getServiceName: function (state) {
    return (serviceId) => {
      return (<Service>state.serviceList[serviceId]).name;
    };
  },
  getServiceVersion: function (state) {
    return (serviceId: string) => {

      // En el id debería de estar la versión del servicio
      let splitted = serviceId.split('/');
      return splitted[splitted.length - 1];

    };
  },

  getIsServiceInUse: function (state) {
    return (serviceId): boolean => {
      // Miramos en la lista de deployments
      for (let deploymentIndex in state.deploymentList) {
        // Si alguno utiliza este servicio devolvemos true
        if ((<Deployment>state.deploymentList[deploymentIndex]).serviceId === serviceId)
          return true;
      }
      return false;
    };
  },
  getServiceOwner: function (state) {
    return (serviceId) => {
      return serviceId.split('/')[2];
    };
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
  getTotalProvidedDeploymentChannels: function (state, getters) {
    // Recorremos los deployments y añadimos todos los identificadores de los canales provided
    let res = [];

    for (let deploymentId in state.deploymentList) {
      // Obtenemos el servicio del deployment
      let serviceId: string = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      for (let providedChannelId in (<Service>state.serviceList[serviceId]).proChannels)
        res.push(getters.getDeploymentName(deploymentId) + ' + ' + providedChannelId);
    }
    return res;
  },
  getTotalRequiredDeploymentChannels: function (state, getters) {
    // Recorremos los deployments y añadimos todos los identificadores de los canales provided
    let res = [];

    for (let deploymentId in state.deploymentList) {
      // Obtenemos el servicio del deployment
      let serviceId: string = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      for (let requiredChannelId in (<Service>state.serviceList[serviceId]).reqChannels)
        res.push(getters.getDeploymentName(deploymentId) + ' + ' + requiredChannelId);
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
  },

  getChartData: function (state, getters): Function {
    return function (deploymentId: string, rolId?: string, instanceId?: string): Object {
      if (rolId !== undefined) {
        if (instanceId !== undefined) { // Chart de una instancia
          return getters.getDeploymentRolInstanceChartData(deploymentId, rolId, instanceId);
        }
        else { // Chart de un rol
          return getters.getDeploymentRolChartData(deploymentId, rolId);
        }
      } else { // Chart de un deployment
        return getters.getDeploymentChartData(deploymentId);
      }
    };
  },
  getSelectedService: function (state): string {
    return state.selectedService;
  },
  getIsDataVolumeUsed: function (state): Function {
    // Tenemos que mirar en los recursos de los servicios
    return (dataVolumeId): boolean => {
      for (let serviceId in state.serviceList) {
        if ((<Service>state.serviceList[serviceId]).resources.indexOf(dataVolumeId) !== -1)
          return true;
      }
      return false;
    };
  },
  getServiceUsingDataVolume: function (state) {
    return (dataVolumeId) => {
      for (let serviceId in state.serviceList) {
        if ((<Service>state.serviceList[serviceId]).resources.indexOf(dataVolumeId) !== -1) {
          return serviceId;
        }
      }
    };
  },
  getRolUsingDataVolume: function (state, getters) {
    return (dataVolumeId) => {
      let serviceId = getters.getServiceUsingDataVolume(dataVolumeId);
      for (let rolId in (<Service>state.serviceList[serviceId]).roles) {
        if ((<Service>state.serviceList[serviceId]).roles[rolId].resources[dataVolumeId] !== undefined)
          return rolId;
      }
    };
  },
  getNumberOfChunksDataVolume: function (state) {
    return (dataVolumeId) => { return 0; };
  }
};