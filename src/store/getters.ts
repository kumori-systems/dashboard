import { Deployment, Runtime, Component, Service, Domain, Link, Resource, FabElement, Channel, Metric } from './classes';
import urlencode from 'urlencode';
import { getElementOwner, getElementName, getElementVersion, isServiceEntrypoint, getElementType, ElementType, getResourceType, ResourceType } from './proxy/utils';
export default {
  /* USER */
  getUser: function (state): string {
    return state.user.id;
  },

  /**
   * @returns string 'authenticated'|'error'
   */
  userState: function (state): boolean {
    return state.user.state;
  },

  getUserName: function (state): string {
    return state.user.name;
  },

  /* TOOLBAR */
  getNumAlerts: function (state): number {
    return state.alerts.length;
  },

  /* FAB BUTTON*/
  getFabElements: function (state): Array<FabElement> {
    return state.fabElements;
  },

  /* MENU */
  menuItems: function (state) {
    return state.menuItemList;
  },

  menuElement: function (state) {
    return function (path) {
      let menuItem = (<Array<any>>state.menuItemList).find(elemen => elemen.path === path);
      let res;
      if (menuItem)
        res = { name: menuItem.name, path: menuItem.path };
      else
        res = { name: 'OVERVIEW', path: '/' };
      return res;
    };
  },

  /* VIEWS: NEW DEPLOYMENT */
  getSelectedService: function (state) {
    return state.selectedService;
  },

  getTotalRequiredDeploymentChannels: function (state, getters) {
    return (serviceId: string, channelId: string) => {
      console.log('Entramos en getTotalReqChannels');
      // Obtenemos el canal y miramos de qué tipo es
      let type: string = (<Service>state.serviceList[serviceId]).proChannels[channelId].type;
      let typeSearched: string;
      switch (type) {
        case 'eslap://eslap.cloud/endpoint/request/1_0_0':
          console.warn('deprecated channel URI \'endpoint\'');
        case 'eslap://eslap.cloud/channel/request/1_0_0':
          typeSearched = 'eslap://eslap.cloud/channel/reply/1_0_0';
          break;

        case 'eslap://eslap.cloud/endpoint/reply/1_0_0':
          console.warn('deprecated channel URI \'endpoint\'');
        case 'eslap://eslap.cloud/channel/reply/1_0_0':
          typeSearched = 'eslap://eslap.cloud/channel/request/1_0_0';
          break;

        default:
          console.error('Not expected channel type %s on  %s:%s', type, serviceId, channelId);
      }
      let res = [];
      for (let deploymentId in state.deploymentList) {
        if (!(<Deployment>state.deploymentList[deploymentId]).isEntrypoint || (<Deployment>state.deploymentList[deploymentId]).links.length === 0) { // Si es un entrypoint y ya está en uso no lo listamos
          let serviceId: string = (<Deployment>state.deploymentList[deploymentId]).serviceId;
          if (state.serviceList[serviceId]) { // if service exists
            for (let requiredChannelId in (<Service>state.serviceList[serviceId]).reqChannels) { // Recorremos los canales required del servicio
              if ((<Service>state.serviceList[serviceId]).reqChannels[requiredChannelId].type.split('/')[4] === typeSearched.split('/')[4]) { // Si encaja con el tipo de canal que buscamos
                res.push(getters.getDeploymentName(deploymentId) + ' + ' + requiredChannelId); // Lo añadimos
              }
            }
          }
        }
      }
      return res;
    };
  },

  getTotalProvidedDeploymentChannels: function (state, getters) {
    return (serviceId: string, channelId: string) => {
      let type: string = (<Service>state.serviceList[serviceId]).reqChannels[channelId].type;
      let typeSearched: string;
      switch (type) {
        case 'eslap://eslap.cloud/endpoint/request/1_0_0':
          // this line +21 split should be removed after fixing this
          console.warn('deprecated channel URI \'endpoint\'');
        case 'eslap://eslap.cloud/channel/request/1_0_0':
          typeSearched = 'eslap://eslap.cloud/channel/reply/1_0_0';
          break;

        case 'eslap://eslap.cloud/endpoint/reply/1_0_0':
          // this line +15 split should be removed after fixing this
          console.warn('deprecated channel URI \'endpoint\'');
        case 'eslap://eslap.cloud/channel/reply/1_0_0':
          typeSearched = 'eslap://eslap.cloud/channel/request/1_0_0';
          break;

        default:
          console.error('Not expected channel type %s on  %s:%s', type, serviceId, channelId);
      }

      let res = [];
      for (let deploymentId in state.deploymentList) {
        if (!(<Deployment>state.deploymentList[deploymentId]).isEntrypoint || (<Deployment>state.deploymentList[deploymentId]).links.length === 0) { // Si es un entrypoint y ya está en uso no lo listamos
          let serviceId: string = (<Deployment>state.deploymentList[deploymentId]).serviceId;
          if (state.serviceList[serviceId]) { // if service exists
            for (let providedChannelId in (<Service>state.serviceList[serviceId]).proChannels) { // Recorremos los canales required del servicio
              if ((<Service>state.serviceList[serviceId]).proChannels[providedChannelId].type.split('/')[4] === typeSearched.split('/')[4]) { // Si encaja con el tipo de canal que buscamos
                res.push(getters.getDeploymentName(deploymentId) + ' + ' + providedChannelId); // Lo añadimos
              }
            }
          }
        }
      }
      return res;
    };
  },

  /* Creo que no se utiliza */
  getFreeResource: function (state) {
    console.warn('deprecated function get free resource');
    return (configId) => {
      let res: Array<string> = [];
      if (
        state.resourceList[configId] !== undefined
        && state.resourceList[configId] !== null
      ) {
        for (let resourceId in (<Array<Resource>>state.resourceList)) {
          if (resourceId.split('/')[4] === configId.split('/')[4]) {
            res.push(resourceId);
          }
        }
      }

      // Debemos de eliminar las resources ya utilizadas
      for (let deploymentId in (<Array<Deployment>>state.deploymentList)) {
        for (let resourceId in (<Deployment>state.deploymentList[deploymentId]).resourcesConfig) {
          let index = res.indexOf(resourceId);
          if (index !== -1)
            res.splice(index, 1);
        }
      }

      return res;
    };
  },

  /* METRICS */

  /**
   * Devuelve una lista de tuplas.
   * La tupla contiene;
   *  - Métricas del deployment
   *  - Mapa para identificar métricas en roles e instáncias.
   */
  deploymentMetricList: function (state): Function {
    return (deploymentId: string): [Date, { 'data': Metric, 'roles': { [roleId: string]: { 'data': Metric, 'instances': { [instanceId: string]: Metric } } } }][] => {
      return (<Deployment>state.deploymentList[deploymentId]).metrics;
    };
  },


  /* DEPLOYMENTS */
  getDeploymentList: function (state): Array<string> {
    let res: Array<string> = [];
    for (let deploymentId in state.deploymentList) {
      res.push(deploymentId);
    }
    return res;
  },

  /**
   * Used from menu items to find it's deployment
   */
  getDeploymentIdFromDeploymentRoute: function (state): Function {
    return function (deploymentRoute: string): string {
      return urlencode.decode(deploymentRoute.split('/')[2]);
    };
  },

  getDeploymentPath: function (state): Function {
    return function (deploymentId: String): string {
      // Obtenemos la vista que contiene los deployment == OVERVIEW
      return '/deployment/' + urlencode(deploymentId);
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
      return (<Deployment>state.deploymentList[deploymentId]).isEntrypoint;
    };
  },

  getServiceIsEntryPoint: function (state, getters) {
    console.warn('deprecated getServiceIsEntryPoint. Use utils instead');
    return (uri: string) => { return isServiceEntrypoint(uri); };
  },

  getDeploymentState: function (state, getters): Function {
    return function (deploymentId: string): Deployment.State {
      let res: Deployment.State = Deployment.State.UNKOWN;
      if (state.deploymentList[deploymentId])
        res = (<Deployment>state.deploymentList[deploymentId]).state;
      return res;
    };
  },

  getDeploymentLinks: function (state): Function {
    return function (deploymentId: string) {
      let res = [];
      for (let linkIndex in (<Deployment>state.deploymentList[deploymentId]).links) {
        // TODO: Este renombrado podría evitarse
        res.push({
          'fromChannel': (<Deployment>state.deploymentList[deploymentId]).links[linkIndex].channelOne,
          'toDeployment': (<Deployment>state.deploymentList[(<Deployment>state.deploymentList[deploymentId]).links[linkIndex].deploymentTwo]).name,
          'toChannel': (<Deployment>state.deploymentList[deploymentId]).links[linkIndex].channelTwo
        });
      }
      return res;
    };
  },

  getDeploymentWebsite: function (state): Function {
    return function (deploymentId: string): Array<string> {
      let res: Array<string> = [];
      if ((<Deployment>state.deploymentList[deploymentId]).isEntrypoint) {
        res = (<Deployment>state.deploymentList[deploymentId]).website;
      } else {
        for (let linkIndex in (<Deployment>state.deploymentList[deploymentId]).links) {
          if ((<Deployment>state.deploymentList[(<Deployment>state.deploymentList[deploymentId]).links[linkIndex].deploymentTwo]).isEntrypoint) {
            res = res.concat((<Deployment>state.deploymentList[(<Deployment>state.deploymentList[deploymentId]).links[linkIndex].deploymentTwo]).website);
          }
        }
      }
      return res;
    };
  },

  /**
   * Buscamos las conexiones definidas por el servicio del deployment.
   * Buscaremos también los links para saber aquellas conexiones que están siendo utilizadas y cuales no
  */
  getDeploymentProvideChannels: function (state) {
    return (deploymentId: string) => {
      let res = [];
      let serviceId: string = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      if ((<Service>state.serviceList[serviceId])) { // if service exists
        for (let proChannel in (<Service>state.serviceList[serviceId]).proChannels) {
          let encontrado: boolean = false;
          for (let linkIndex in (<Deployment>state.deploymentList[deploymentId]).links) {
            if ((<Deployment>state.deploymentList[deploymentId]).links[linkIndex].channelOne === proChannel)
              // TODO: este renombrado podría evitarse
              res.push({
                'fromChannel': proChannel,
                'toDeployment': (<Deployment>state.deploymentList[(<Deployment>state.deploymentList[deploymentId]).links[linkIndex].deploymentTwo]).name,
                'toChannel': (<Deployment>state.deploymentList[deploymentId]).links[linkIndex].channelTwo
              });
          }
        }
      }
      return res;
    };
  },

  getDeploymentRequireChannels: function (state) {
    return (deploymentId: string) => {
      let res = [];
      let serviceId: string = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      if ((<Service>state.serviceList[serviceId])) { // if service exists
        for (let reqChannel in (<Service>state.serviceList[serviceId]).reqChannels) {
          let encontrado: boolean = false;
          for (let linkIndex in (<Deployment>state.deploymentList[deploymentId]).links) {
            if ((<Deployment>state.deploymentList[deploymentId]).links[linkIndex].channelOne === reqChannel)
              // TODO: este renombrado podría evitarse
              res.push({
                'fromChannel': reqChannel,
                'toDeployment': (<Deployment>state.deploymentList[(<Deployment>state.deploymentList[deploymentId]).links[linkIndex].deploymentTwo]).name,
                'toChannel': (<Deployment>state.deploymentList[deploymentId]).links[linkIndex].channelTwo
              });
          }
        }
      }
      return res;
    };
  },

  getDeploymentVolumes: function (state): Function {
    return function (deploymentId: string): Array<string> {
      let res: Array<string> = [];
      /* // TODO: This is not properly working
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      if (state.serviceList[serviceId]) { // if service exists
        let serviceResources = (<Service>state.serviceList[serviceId]).resources;
        for (let serviceResourceIndex in serviceResources) {
          if (
            state.volumeList[serviceResources[serviceResourceIndex]]
            && getElementType(serviceResources[serviceResourceIndex]) === ElementType.resource
            && getResourceType(serviceResources[serviceResourceIndex]) === ResourceType.volume
          )
            res.push(serviceResources[serviceResourceIndex]);
        }
      }
      */
      return res;
    };
  },

  /* DEPLOYMENT ROLES */
  getDeploymentRoles: function (state): Function {
    return function (deploymentId: string): Array<string> {
      let res: Array<string> = [];
      for (let rolId in (<Deployment>state.deploymentList[deploymentId]).roles) {
        res.push(rolId);
      }
      return res;
    };
  },

  getDeploymentRolNumInstances: function (state): Function {
    return function (deploymentId: string, rolId: string) {
      return (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceNumber;
    };
  },

  getDeploymentRolState: function (state, getters): Function {
    return function (deploymentId: string, rolId: string): Deployment.Rol.State {
      return (<Deployment>state.deploymentList[deploymentId]).roles[rolId].state;
    };
  },

  getDeploymentRolComponentURI: function (state) {
    return function (deploymentId: string, rolId: string) {
      let res: string = null;
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      if (state.serviceList[serviceId]) { // if service exists
        if ((<Service>state.serviceList[serviceId]).roles[rolId]) {
          res = (<Service>state.serviceList[serviceId]).roles[rolId].component;
        }
        else {
          console.warn('Found deploymen with a rol not defined in the service. deployment %s, rol %s', deploymentId, rolId);
        }
      }
      return res;

    };
  },

  getDeploymentRolRuntime: function (state): Function {
    return function (deploymentId: string, rolId: string): string {
      let res: string = null;
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      if (state.serviceList[serviceId]) { // if service exists
        let componentId = (<Service>state.serviceList[serviceId]).roles[rolId].component;
        if (state.componentList[componentId]) { // if component exists
          res = (<Component>state.componentList[componentId]).runtime;
        }
      }
      return res;

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
      if (state.serviceList[serviceId] === undefined) return [];
      let resources = (<Service>state.serviceList[serviceId]).roles[rolId].resources;

      for (let resourceId in resources) {
        // Buscamos las resources que sean volumenes
        if (
          state.resourceList[resources[resourceId]]
          && state.resourceList[resources[resourceId]] !== null
          && getElementType(resourceId) === ElementType.resource
          && getResourceType(resourceId) === ResourceType.volume
        ) {
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


  getDeploymentRolConnections: function (state): Function {
    return function (deploymentId: string, rolId: string): Array<Service.Connector> {
      let res: Array<Service.Connector> = [];
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      if (state.serviceList[serviceId]) {
        for (let connector in (<Service>state.serviceList[serviceId]).connectors) {
          if (
            (<Service>state.serviceList[serviceId]).connectors[connector].depended[0].role === rolId
            || (<Service>state.serviceList[serviceId]).connectors[connector].provided[0].role === rolId
          ) {
            res.push((<Service>state.serviceList[serviceId]).connectors[connector]);
          }
        }
      }

      return res;
    };
  },

  /* DEPRECATED */
  getDeploymentRolReqChannels: function (state): Function {
    console.warn('getDeploymentRolReqChannels is a deprecated function. Take the connections instead.');
    return function (deploymentId: string, rolId: string): { [channelId: string]: Channel } {
      let res: { [channelId: string]: Channel } = {};
      let reqChannels: { [channelId: string]: Channel } = {};
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      if (state.serviceList[serviceId]) { // if service exists
        let componentId = (<Service>state.serviceList[serviceId]).roles[rolId].component;
        if (state.componentList[componentId]) { // if component exists
          reqChannels = (<Component>state.componentList[componentId]).reqChannels;
        }
      }

      // Por cada canal, buscamos todas las conexiones que pueda tener

      return res;
    };
  },

  getDeploymentRolProChannels: function (state): Function {
    console.warn('getDeploymentRolProChannels is a deprecated function. Take the connections instead.');
    return function (deploymentId: string, rolId: string): { [channelId: string]: Channel } {
      let res: { [channelId: string]: Channel } = {};
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      if (state.serviceList[serviceId]) { // if service exists
        let componentId = (<Service>state.serviceList[serviceId]).roles[rolId].component;
        if (state.componentList[componentId]) { // if component exists
          res = (<Component>state.componentList[componentId]).proChannels;

        }
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

  /* COMPONENTS */
  getComponentInfo: function (state) {
    return (componentId) => {
      return state.componentList[componentId];
    };
  },
  getComponentId: function (state, getters) {
    return (owner, component, version) => {
      for (let componentId in state.componentList) {
        if (getElementOwner(componentId) === owner
          && getElementName(componentId) === component
          && getElementVersion(componentId) === version)
          return componentId;
      }
    };
  },

  componentList: function (state) {
    return state.componentList;
  },

  getComponentProChannels: function (state) {
    return (componentId) => {
      if ((<Component>state.componentList[componentId]))
        return (<Component>state.componentList[componentId]).proChannels;
      return '';
    };
  },

  getComponentReqChannels: function (state) {
    return (componentId) => {
      if ((<Component>state.componentList[componentId]))
        return (<Component>state.componentList[componentId]).reqChannels;
      return '';
    };
  },

  getComponentResourcesConfig: function (state) {
    return (componentId) => {
      if ((<Component>state.componentList[componentId]))
        return (<Component>state.componentList[componentId]).resourcesConfig;
      return '';
    };
  },

  getComponentRuntime: function (state) {
    return (componentId) => {
      if (state.componentList[componentId])
        return (<Component>state.componentList[componentId]).runtime;
      return null;
    };
  },

  getComponentOwnerList: function (state, getters) {
    return (showPublicElements: boolean, filter): Array<string> => {
      let res: Array<string> = [];
      let owner: string = null;
      for (let componentIndex in state.componentList) {
        owner = getElementOwner(componentIndex);
        if (
          (showPublicElements || getters.getUser === owner) // Cumple las condiciones
          && ((filter && filter !== null && filter.length > 0 && componentIndex.indexOf(filter) !== -1) || (filter === undefined || filter === null || filter.length <= 0)) // Pasa el filtro
          && (res.findIndex(elem => { return elem === owner; }) === -1) // Todavía no lo tenemos
        ) {
          res.push(owner);
        }
      }
      return res;
    };
  },

  getOwnerComponentList: function (state, getters) {
    return (owner, filter) => {
      // Buscamos todos los componentes del owner
      let res: Array<string> = [];
      let compName;
      for (let componentId in state.componentList) {
        if (getElementOwner(componentId) === owner) {
          // Si el componente ya esta no lo añadimos
          compName = getElementName(componentId);
          if (res.findIndex(comp => { return comp === compName; }) === -1) {
            if (filter !== null && filter.length > 0) {
              if (componentId.indexOf(filter) !== -1) {
                res.push(compName);
              }
            } else { res.push(compName); }
          }
        }
      }
      return res;
    };
  },

  getComponentVersionList: function (state, getters) {
    return (owner, component, filtro) => {
      let res: Array<string> = [];
      for (let componentId in state.componentList) {
        if (
          getElementOwner(componentId) === owner
          && getElementName(componentId) === component
        ) {
          if (filtro !== null && filtro.length > 0) {
            if (componentId.indexOf(filtro) !== -1) {
              res.push(getElementVersion(componentId));
            }
          } else {
            res.push(getElementVersion(componentId));
          }
        }
      }

      return res;
    };
  },

  getIsComponentInUse: function (state, getters) {
    return (componentId: string) => {
      // Tenemos que comprobar si el componente está siendo utilizado por algún servicio
      for (let serviceIndex in state.serviceList) {
        if (state.serviceList[serviceIndex] === undefined || state.serviceList[serviceIndex] === null) return false;
        for (let rolId in (<Service>state.serviceList[serviceIndex]).roles) {
          if ((<Service>state.serviceList[serviceIndex]).roles[rolId].component === componentId)
            return true;
        }
      }
      return false;
    };
  },

  getComponentUsedBy: function (state, getters) {
    return (componentId: string) => {
      let res: Array<string> = [];
      // Tenemos que comprobar si el componente está siendo utilizado por algún servicio
      for (let serviceIndex in state.serviceList) {
        if (state.serviceList[serviceIndex] === undefined || state.serviceList[serviceIndex] === null) return false;
        for (let rolId in (<Service>state.serviceList[serviceIndex]).roles) {
          if ((<Service>state.serviceList[serviceIndex]).roles[rolId].component === componentId)
            res.push((<Service>state.serviceList[serviceIndex]).name + (<Component>state.serviceList[serviceIndex]).version);
        }
      }
      return res;
    };
  },

  /* SERVICES */
  getServiceId: function (state, getters) {
    return (owner, service, version) => {
      let myServiceId;
      for (let serviceId in state.serviceList) {
        if (getElementOwner(serviceId) === owner
          && getElementName(serviceId) === service
          && getElementVersion(version) === version)
          return serviceId;
      }
    };
  },

  getServiceInfo: function (state) {
    return (serviceId) => {
      return state.serviceList[serviceId];
    };
  },

  getIsServiceInUse: function (state, getters) {
    return (serviceId): boolean => {
      // Tenemos que comprobar si el servicio está siendo utilizado por algún deployment
      for (let deploymentIndex in state.deploymentList) {
        if ((<Deployment>state.deploymentList[deploymentIndex]).serviceId === serviceId)
          return true;
      }
      return false;
    };
  },

  getServiceUsedBy: function (state, getters) {
    return (serviceId) => {
      let res = [];
      // Tenemos que comprobar si el servicio está siendo utilizado por algún deployment
      for (let deploymentIndex in state.deploymentList) {
        if ((<Deployment>state.deploymentList[deploymentIndex]).serviceId === serviceId)
          res.push((<Deployment>state.deploymentList[deploymentIndex]).name);
      }
      return res;
    };
  },

  getServiceRoles: function (state) {
    return function (serviceId: string) {
      let res: Array<string> = [];
      if ((<Service>state.serviceList[serviceId]))
        for (let rol in (<Service>state.serviceList[serviceId]).roles) {
          res.push(rol);
        }
      return res;
    };
  },

  getServiceResources: function (state, getters) {
    return (serviceId: string) => {
      let res: Array<string> = [];
      if ((<Service>state.serviceList[serviceId]) && (<Service>state.serviceList[serviceId]).resources)
        for (let resourceIndex in (<Service>state.serviceList[serviceId]).resources) {
          if ((<Service>state.serviceList[serviceId]).resources[resourceIndex])
            res.push((<Service>state.serviceList[serviceId]).resources[resourceIndex]);
        }
      return res;
    };
  },

  getServiceIdFromName: function (state, getters) {
    return (serviceName: string) => {
      if (serviceName == null) return null;
      for (let serviceId in state.serviceList) {
        if (state.serviceList[serviceId].name === serviceName) {
          return serviceId;
        }
      }
      return null;
    };
  },

  getServiceProChannels: function (state, getters) {
    return (serviceId: string) => {
      let res = [];
      if ((<Service>state.serviceList[serviceId])) { // if service exists
        for (let proChannel in (<Service>state.serviceList[serviceId]).proChannels) {
          res.push(proChannel);
        }
      }
      return res;
    };
  },

  getServiceReqChannels: function (state, getters) {
    return (serviceId: string) => {
      let res = [];
      if ((<Service>state.serviceList[serviceId])) { // if service exists
        for (let reqChannel in (<Service>state.serviceList[serviceId]).reqChannels) {
          res.push(reqChannel);
        }
      }
      return res;
    };
  },

  getServiceOwnerList: function (state, getters) {
    return (showPublicElements: boolean, filter: string): Array<string> => {
      let res: Array<string> = [];
      let owner: string;
      for (let serviceIndex in state.serviceList) {
        owner = getElementOwner(serviceIndex);
        if ((showPublicElements || getters.getUser === owner) // Cumple las condiciones
          && ((filter && filter !== null && filter.length > 0 && serviceIndex.indexOf(filter) !== -1) || (filter === undefined || filter === null || filter.length <= 0)) // Pasa el filtro
          && (res.findIndex(elem => { return elem === owner; }) === -1) // Todavía no lo tenemos
        ) {
          res.push(owner);
        }
      }
      return res;
    };
  },

  getOwnerServiceList: function (state, getters) {
    return (owner, filter) => {
      // Buscamos todos los servicios del owner
      let res: Array<string> = [];
      let serviceName;
      for (let serviceId in state.serviceList) {
        serviceName = getElementName(serviceId);

        if (getElementOwner(serviceId) === owner
          && ((filter && filter !== null && filter.length > 0 && serviceId.indexOf(filter) !== -1) || (filter === undefined || filter === null || filter.length <= 0)) // Pasa el filtro
          && res.findIndex(serv => { return serv === serviceName; }) === -1) {
          res.push(serviceName);
        }
      }
      return res;
    };
  },

  getServiceVersionList: function (state, getters) {
    return (owner, service, filtro) => {
      let res: Array<string> = [];
      // Buscamos en la lista de servicios, todos aquellos que encajen con el owner y el servicio
      for (let serviceId in state.serviceList) {
        if (getElementOwner(serviceId) === owner
          && getElementName(serviceId) === service) {
          if (filtro !== null && filtro.length > 0) {
            if (serviceId.indexOf(filtro) !== -1) {
              res.push(getElementVersion(serviceId));
            }
          } else {
            res.push(getElementVersion(serviceId));
          }

        }
      }
      return res;
    };
  },

  getServiceParameters: function (state, getters) {
    return (serviceId) => {
      if ((<Service>state.serviceList[serviceId]))
        return (<Service>state.serviceList[serviceId]).parameters;
      return '';
    };
  },

  /*
  getServiceNameList: function (state, getters): Array<string> {
    console.warn('Se llama a service name list');
    let res = [];
    for (let serviceId in state.serviceList)
      res.push((<Service>state.serviceList[serviceId]).name);
    return res;
  },
  */

  /**
   * Devolvemos el nombre de aquellos servicios que no sean Entrypoint
   */

  getServiceList: function (state, getters): Array<string> {
    let res = [];
    for (let serviceId in state.serviceList) {
      res.push(serviceId);
    }
    return res;
  },

  /* RESOURCES: RUNTIME */
  getRuntimeId: function (state, getters) {
    return (owner, runtime, version) => {
      for (let runtimeId in state.runtimeList) {
        if (getElementOwner(runtimeId) === owner
          && getElementName(runtimeId) === runtime
          && getElementVersion(runtimeId) === version)
          return runtimeId;
      }
    };
  },

  getRuntimeOwner: function (state) {
    return (runtimeId) => {
      if ((<Runtime>state.runtimeList[runtimeId]))
        return (<Runtime>state.runtimeList[runtimeId]).owner;
      return '';
    };
  },

  getRuntimeVersionList: function (state, getters) {
    return (owner, runtime, filtro) => {
      let res: Array<string> = [];
      // Buscamos en la lista de servicios, todos aquellos que encajen con el owner y el servicio
      for (let runtimeId in state.runtimeList) {
        if (
          state.runtimeList[runtimeId] !== null
          && getElementOwner(runtimeId) === owner
          && getElementName(runtimeId) === runtime
        ) {
          if (filtro !== null && filtro.length > 0) {
            if (runtimeId.indexOf(filtro) !== -1)
              res.push(getElementVersion(runtimeId));
          } else {
            res.push(getElementVersion(runtimeId));
          }
        }
      }

      return res;
    };
  },

  /**
   * Devolvemos una lista de runtimes disponibles para el usuario
   */
  getRuntimeOwnerList: function (state, getters) {
    return (showPublicElements: boolean, filter: string): Array<string> => {
      // ShowPublicElements marca si enseñamos elementos que no son nuestros
      let res: Array<string> = [];
      let owner: string = null;
      for (let runtimeIndex in state.runtimeList) {
        owner = getElementOwner(runtimeIndex);
        if (
          (showPublicElements || getters.getUser === owner)
          && ((filter && filter !== null && filter.length > 0 && runtimeIndex.indexOf(filter) !== -1) || (filter === undefined || filter === null || filter.length <= 0)) // Pasa el filtro
          && (res.findIndex(menuItem => { return menuItem === owner; }) === -1)
        ) {
          res.push(owner);
        }
      }
      return res;
    };
  },

  getOwnerRuntimeList: function (state, getters) {
    return (owner, filter) => {
      // Buscamos todos los servicios del owner
      let res: Array<string> = [];
      let runtimeName;
      for (let runtimeId in state.runtimeList) {
        runtimeName = getElementName(runtimeId);
        if ((getElementOwner(runtimeId) === owner)
          && ((filter && filter !== null && filter.length > 0 && runtimeId.indexOf(filter) !== -1) || (filter === undefined || filter === null || filter.length <= 0)) // Pasa el filtro
          && (res.findIndex(serv => { return serv === runtimeName; }) === -1)) {
          res.push(runtimeName);
        }
      }
      return res;
    };
  },

  getIsRuntimeInUse: function (state) {
    return (runtimeId) => {
      // Recorremos la lista de componentes.
      // Si encontramos el runtime en alguno de los componentes devolvemos true
      for (let componentId in state.componentList) {
        if (state.componentList[componentId] && (<Component>state.componentList[componentId]).runtime === runtimeId)
          return true;
      }
      return false;
    };
  },

  getRuntimeUsedBy: function (state, getters) {
    return (runtimeId) => {
      let res = [];
      for (let componentId in state.componentList) {
        if (state.componentList[componentId] && (<Component>state.componentList[componentId]).runtime === runtimeId)
          res.push(
            getElementName(componentId)
            + getElementVersion(componentId)
          );
      }
      return res;
    };
  },

  /* RESOURCE: DOMAIN */
  domainList: function (state) {
    return state.domainList;
  },

  /* RESOURCE: DATA VOLUMES */
  getDataVolumesList: function (state, getters): Array<string> {
    let res: Array<string> = [];
    for (let resourceId in state.resourceList) {
      if (
        state.resourceList[resourceId]
        && resourceId.split('/')[4] === 'volume'
      ) {
        res.push(resourceId);
      }
    }
    return res;
  },

  getIsDataVolumeUsed: function (state): Function {
    // Tenemos que mirar en los recursos de los servicios
    return (dataVolumeId): boolean => {
      for (let serviceId in state.serviceList) {
        if (
          (<Service>state.serviceList[serviceId])
          && (<Service>state.serviceList[serviceId]).resources[dataVolumeId]
        )
          return true;
      }
      return false;
    };
  },

  getDeploymentUsingDataVolume: function (state) {
    return (dataVolumeId) => {
      // Tenemos que entrar en resourcesConfig de cada deployment y mirar si está el volumen
      for (let deploymentId in state.deploymentList) {
        if ((<Deployment>state.deploymentList[deploymentId]).resourcesConfig[dataVolumeId])
          return deploymentId;
      }
      return null;
    };
  },

  getRolUsingDataVolume: function (state, getters) {
    return (dataVolumeId) => {
      let deploymentId = getters.getDeploymentUsingDataVolume(dataVolumeId);
      if (!<Deployment>state.deploymentList[deploymentId]) return false;
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      if (deploymentId === null || !state.serviceList[serviceId]) return false;
      for (let rolId in (<Service>state.serviceList[serviceId]).roles) {
        if ((<Service>state.serviceList[serviceId]).roles[rolId].resources[dataVolumeId] !== undefined)
          return rolId;
      }
    };
  },

  getNumberOfChunksDataVolume: function (state) {
    return (dataVolumeId) => { return 0; };
  },

  /* RESOURCE: CERTIFICATES */
  getCertificateList: function (state) {
    return state.certList;
  }
};