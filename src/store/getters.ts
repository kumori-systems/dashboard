import { Deployment, Runtime, Component, Service, Webdomain, Link, Resource, FabElement } from './classes';
import urlencode from 'urlencode';
export default {
  /* GENERAL */
  getUser: function (state): string {
    return state.user;
  },
  authError: function (state): boolean {
    return state.authError;
  },
  sidebar: function (state) {
    return state.sidebar;
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
    for (let deploymentId in state.deploymentList) {
      res.push(deploymentId);
    }
    return res;
  },
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
      if ((<Deployment>state.deploymentList[deploymentId]))
        return (<Deployment>state.deploymentList[deploymentId]).name;
      return '';
    };
  },
  getDeploymentService: function (state): Function {
    return function (deploymentId: string): string {
      if (state.deploymentList[deploymentId] === undefined) return null;
      return (<Deployment>state.deploymentList[deploymentId]).serviceId;
    };
  },
  getIsEntryPoint: function (state, getters) {
    return function (deploymentId: string): boolean {
      if (state.deploymentList[deploymentId] !== undefined)
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
    return function (deploymentId: string): Array<string> {
      if (state.deploymentList[deploymentId] === undefined) return [];
      let website: Array<string> = (<Deployment>state.deploymentList[deploymentId]).website;
      // Si en este punto es null, significa que no es un entrypoint y tenemos que buscar en los links aquel que esté
      // lincado y sea un entrypoint (tenga un website != null)

      for (let linkIndex in state.linkList) {
        if ((<Link>state.linkList[linkIndex]).deploymentOne === deploymentId) {
          if ((<Deployment>state.deploymentList[(<Link>state.linkList[linkIndex]).deploymentTwo]).website.length > 0) {
            website = website.concat((<Deployment>state.deploymentList[(<Link>state.linkList[linkIndex]).deploymentTwo]).website);
          }
        }
        if ((<Link>state.linkList[linkIndex]).deploymentTwo === deploymentId) {
          if ((<Deployment>state.deploymentList[(<Link>state.linkList[linkIndex]).deploymentOne]).website.length > 0)
            website = website.concat((<Deployment>state.deploymentList[(<Link>state.linkList[linkIndex]).deploymentOne]).website);
        }
      }

      return website;
    };
  },
  getDeploymentState: function (state, getters): Function {
    return function (deploymentId: string): Deployment.Rol.Instance.State {
      let onProgress = false;
      if (state.deploymentList[deploymentId] === undefined) return Deployment.Rol.Instance.State.ON_PROGRESS;
      for (let rolId in (<Deployment>state.deploymentList[deploymentId]).roles) {
        switch (getters.getDeploymentRolState(deploymentId, rolId)) {
          case Deployment.Rol.Instance.State.DISCONNECTED:
            return Deployment.Rol.Instance.State.DISCONNECTED;
          case Deployment.Rol.Instance.State.ON_PROGRESS:
            onProgress = true;
        }
      }
      if (onProgress === true) return Deployment.Rol.Instance.State.ON_PROGRESS;
      return Deployment.Rol.Instance.State.CONNECTED;
    };
  },

  /**
   * Buscamos las conexiones definidas por el servicio del deployment.
   * Buscaremos también los links para saber aquellas conexiones que están siendo utilizadas y cuales no
  */
  getDeploymentProvideChannels: function (state) {
    return (deploymentId: string) => {
      if (state.deploymentList[deploymentId] === undefined) return [];
      let serviceId: string = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      if (serviceId === undefined) return [];
      let res = [];
      /* // TODO: Esto debería de ser posible de realizar en una actualización de la API
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
      }*/
      return res;
    };
  },
  getDeploymentRequireChannels: function (state) {
    return (deploymentId: string) => {
      if (state.deploymentList[deploymentId] === undefined) return [];
      let serviceId: string = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      if (state.serviceList[serviceId] === undefined) return [];
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
      if (state.serviceList[serviceId] === undefined) return [];
      let serviceResources = (<Service>state.serviceList[serviceId]).resources;
      for (let serviceResourceIndex in serviceResources) {
        if (
          state.resourceList[serviceResources[serviceResourceIndex]] !== undefined
          && serviceResources[serviceResourceIndex].split('/')[4] === 'volume'
        )
          res.push(serviceResources[serviceResourceIndex]);
      }
      return res;
    };
  },

  getDeploymentChartData: function (state, getters): Function {
    return function (deploymentId: string): Object {
      let res: Deployment.Metrics;
      if (
        !state.deploymentList[deploymentId]
        || !(<Deployment>state.deploymentList[deploymentId]).metrics
      ) {
        if (getters.getIsEntryPoint(deploymentId)) {
          res = new Deployment.EntryPointMetrics();
        } else {
          res = new Deployment.CommonMetrics();
        }
      } else {
        res = (<Deployment>state.deploymentList[deploymentId]).metrics;
      }
      return res.getFormattedMetrics();
    };
  },

  /* ROLES */
  getDeploymentRoles: function (state): Function {
    return function (deploymentId: string): Array<string> {
      let res: Array<string> = [];
      if (state.deploymentList[deploymentId] !== undefined) {
        for (let rolId in (<Deployment>state.deploymentList[deploymentId]).roles) {
          res.push(rolId);
        }
      }
      return res;
    };
  },

  getDeploymentRolComponentURN: function (state) {
    return function (deploymentId: string, rolId: string) {
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      if (state.serviceList[serviceId] === undefined) { return null; }
      return (<Service>state.serviceList[serviceId]).roles[rolId].component;
    };
  },

  getDeploymentRolNumInstances: function (state): Function {
    return function (deploymentId: string, rolId: string) {
      return (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceNumber;
    };
  },

  getDeploymentRolState: function (state, getters): Function {
    return function (deploymentId: string, rolId: string): Deployment.Rol.Instance.State {
      let onProgress = false;
      for (let instanceId in (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList) {
        switch (getters.getDeploymentRolInstanceState(deploymentId, rolId, instanceId)) {
          case Deployment.Rol.Instance.State.DISCONNECTED: return Deployment.Rol.Instance.State.DISCONNECTED;
          case Deployment.Rol.Instance.State.ON_PROGRESS: onProgress = true; break;
          default:
        }
      }
      if (onProgress === true) return Deployment.Rol.Instance.State.ON_PROGRESS;
      return Deployment.Rol.Instance.State.CONNECTED;
    };
  },
  getDeploymentRolRuntime: function (state): Function {
    return function (deploymentId: string, rolId: string): string {
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      if (state.serviceList[serviceId] === undefined || state.serviceList[serviceId] === null) return null;
      let componentId = (<Service>state.serviceList[serviceId]).roles[rolId].component;
      if (state.componentList[componentId] === undefined || state.componentList[componentId] === null) return null;
      return (<Component>state.componentList[componentId]).runtime;
    };
  },
  getDeploymentRolChartData: function (state, getters): Function {
    return function (deploymentId: string, rolId: string): Object {
      let res: Deployment.Metrics;
      if (
        !state.deploymentList[deploymentId]
        || !(<Deployment>state.deploymentList[deploymentId]).roles[rolId]
        || !(<Deployment>state.deploymentList[deploymentId]).roles[rolId].metrics
      ) {
        if (getters.getIsEntryPoint(deploymentId)) {
          res = new Deployment.EntryPointMetrics();
        } else {
          res = new Deployment.CommonMetrics();
        }
      } else {
        res = (<Deployment>state.deploymentList[deploymentId]).roles[rolId].metrics;
      }
      return res.getFormattedMetrics();
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
          && resourceId.split('/')[4] === 'volume'
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
  getDeploymentRolReqConnectedTo: function (state): Function {
    return function (deploymentId: string, rolId: string): Array<[string, Service.Rol.Channel]> {
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      if (!state.serviceList[serviceId]) return [];
      let componentId = (<Service>state.serviceList[serviceId]).roles[rolId].component;
      if (!state.componentList[componentId]) return [];
      let res = [];
      for (let connectionIndex in (<Component>state.componentList[componentId]).reqChannels) {
        res.push([connectionIndex, (<Component>state.componentList[componentId]).reqChannels[connectionIndex]]);
      }
      return res;
    };
  },
  getDeploymentRolProConnectedTo: function (state): Function {
    return function (deploymentId: string, rolId: string): Array<[string, Service.Rol.Channel]> {
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      if (!state.serviceList[serviceId]) return [];
      let componentId = (<Service>state.serviceList[serviceId]).roles[rolId].component;
      if (!state.componentList[componentId]) return [];
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
      if (!(<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].state)
        return Deployment.Rol.Instance.State.ON_PROGRESS;
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
  getDeploymentRolInstanceChartData: function (state, getters): Function {
    return function (deploymentId: string, rolId: string, instanceId: string) {
      let res: Deployment.Metrics;
      if (
        !state.deploymentList[deploymentId]
        || !(<Deployment>state.deploymentList[deploymentId]).roles[rolId]
        || !(<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId]
        || !(<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].metrics
      ) {
        if (getters.getIsEntryPoint(deploymentId)) {
          res = new Deployment.EntryPointMetrics();
        } else {
          res = new Deployment.CommonMetrics();
        }
      } else {
        res = (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].metrics;
      }
      return res.getFormattedMetrics();
    };
  },

  componentList: function (state) {
    return state.componentList;
  },
  getComponentOwnerList: function (state, getters) {
    return (showPublicElements: boolean, filter): Array<string> => {
      let res: Array<string> = [];
      let owner: string;
      for (let componentIndex in state.componentList) {
        if (state.componentList[componentIndex] !== undefined) {
          owner = (<Component>state.componentList[componentIndex]).owner;
          if (
            (showPublicElements || getters.getUser === owner) // Cumple las condiciones
            && ((filter && filter !== null && filter.length > 0 && componentIndex.indexOf(filter) !== -1) || (filter === undefined || filter === null || filter.length <= 0)) // Pasa el filtro
            && (res.findIndex(elem => { return elem === owner; }) === -1) // Todavía no lo tenemos
          ) {
            res.push(owner);
          }
        }
      }

      return res;
    };
  },

  getOwnerComponentList: function (state, getters) {
    return (owner, filter) => {
      // Buscamos todos los componentes del owner
      let res: Array<string> = []; let compName;
      for (let componentId in state.componentList) {
        if ((<Component>state.componentList[componentId]).owner === owner) {
          // Si el componente ya esta no lo añadimos
          compName = (<Component>state.componentList[componentId]).name;
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
          (<Component>state.componentList[componentId]).owner === owner
          && (<Component>state.componentList[componentId]).name === component
        ) {
          if (filtro !== null && filtro.length > 0) {
            if (componentId.indexOf(filtro) !== -1) {
              res.push((<Component>state.componentList[componentId]).version);
            }
          } else {
            res.push((<Component>state.componentList[componentId]).version);
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

  /**
   * Devolvemos una lista de servicios disponibles para el usuario
   */
  getServiceOwnerList: function (state, getters) {
    return (showPublicElements: boolean, filter: string): Array<string> => {
      let res: Array<string> = [];
      let owner: string;
      for (let serviceIndex in state.serviceList) {
        owner = (<Service>state.serviceList[serviceIndex]).owner;
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
  getServiceInfo: function (state) {
    return (serviceId) => {
      return state.serviceList[serviceId];
    };
  },
  getOwnerServiceList: function (state, getters) {
    return (owner, filter) => {
      // Buscamos todos los servicios del owner
      let res: Array<string> = [];
      let serviceName;
      for (let serviceId in state.serviceList) {
        serviceName = (<Service>state.serviceList[serviceId]).name;

        if ((<Service>state.serviceList[serviceId]).owner === owner
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
        if ((<Service>state.serviceList[serviceId]).owner === owner
          && (<Service>state.serviceList[serviceId]).name === service) {
          if (filtro !== null && filtro.length > 0) {
            if (serviceId.indexOf(filtro) !== -1) {
              res.push((<Service>state.serviceList[serviceId]).version);
            }
          } else {
            res.push((<Service>state.serviceList[serviceId]).version);
          }

        }
      }
      return res;
    };
  },

  getRuntimeVersionList: function (state, getters) {
    return (owner, runtime, filtro) => {
      let res: Array<string> = [];
      // Buscamos en la lista de servicios, todos aquellos que encajen con el owner y el servicio
      for (let runtimeId in state.runtimeList) {
        if (
          state.runtimeList[runtimeId] !== undefined
          && state.runtimeList[runtimeId] !== null
          && (<Runtime>state.runtimeList[runtimeId]).owner === owner
          && (<Runtime>state.runtimeList[runtimeId]).name === runtime
        ) {
          if (filtro !== null && filtro.length > 0) {
            if (runtimeId.indexOf(filtro) !== -1)
              res.push((<Runtime>state.runtimeList[runtimeId]).version);
          } else {
            res.push((<Runtime>state.runtimeList[runtimeId]).version);
          }
        }
      }

      return res;
    };
  },

  getServiceName: function (state, getters) {
    return (serviceId) => {
      return (<Service>state.serviceList[serviceId]).name;
    };
  },
  getServiceNameList: function (state, getters): Array<string> {
    let res = [];
    for (let serviceId in state.serviceList)
      res.push((<Service>state.serviceList[serviceId]).name);
    return res;
  },

  /**
   * Devolvemos el nombre de aquellos servicios que no sean Entrypoint
   */
  getNoEPServiceList: function (state, getters): Array<string> {
    let res = [];
    for (let serviceId in state.serviceList) {
      if ((<Service>state.serviceList[serviceId]) && !getters.getServiceIsEntryPoint(serviceId))
        res.push({ id: serviceId, name: (<Service>state.serviceList[serviceId]).name });
    }
    return res;
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
        if (state.runtimeList[runtimeIndex] !== undefined) {
          owner = (<Runtime>state.runtimeList[runtimeIndex]).owner;
          if (
            (showPublicElements || getters.getUser === owner)
            && ((filter && filter !== null && filter.length > 0 && runtimeIndex.indexOf(filter) !== -1) || (filter === undefined || filter === null || filter.length <= 0)) // Pasa el filtro
            && (res.findIndex(menuItem => { return menuItem === owner; }) === -1)
          ) {
            res.push(owner);
          }
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
        runtimeName = (<Runtime>state.runtimeList[runtimeId]).name;
        if (((<Runtime>state.runtimeList[runtimeId]).owner === owner)
          && ((filter && filter !== null && filter.length > 0 && runtimeId.indexOf(filter) !== -1) || (filter === undefined || filter === null || filter.length <= 0)) // Pasa el filtro
          && (res.findIndex(serv => { return serv === runtimeName; }) === -1)) {
          res.push(runtimeName);
        }
      }
      return res;
    };
  },

  getRuntimeId: function (state, getters) {
    return (owner, runtime, version) => {
      for (let runtimeId in state.runtimeList) {
        if ((<Runtime>state.runtimeList[runtimeId]).owner === owner
          && (<Runtime>state.runtimeList[runtimeId]).name === runtime
          && (<Runtime>state.runtimeList[runtimeId]).version === version)
          return runtimeId;
      }
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

  getRuntimeUsedBy: function (state, getters) {
    return (runtimeId) => {
      let res = [];
      for (let componentId in state.componentList) {
        if ((<Component>state.componentList[componentId]).runtime === runtimeId)
          res.push(
            (<Component>state.componentList[componentId]).name
            + (<Component>state.componentList[componentId]).version
          );
      }
      return res;
    };
  },

  getWebDomainList: function (state): Array<string> {
    let res: Array<string> = [];
    for (let resourceId in state.resourceList) {
      if ((state.resourceList[resourceId]).domain !== undefined)
        res.push((<Webdomain>state.resourceList[resourceId]).domain);
    }
    return res;
  },

  getUsedWebDomainList: function (state, getters) {
    let usedWebdomain: Array<[string, string]> = [];
    let websiteList: Array<string> = null;
    for (let deploymentId in state.deploymentList) {
      if (state.deploymentList[deploymentId] !== undefined)
        websiteList = (<Deployment>state.deploymentList[deploymentId]).website;
      if (websiteList !== undefined && websiteList !== null) {
        for (let index in websiteList) {
          usedWebdomain.push([getters.getDeploymentName(deploymentId), websiteList[index]]);
        }
      }
    }
    return usedWebdomain;
  },

  getWebdomainResource: function (state) {
    return (webdomain: string) => {
      for (let resourceId in state.resourceList) {
        if ((<Webdomain>state.resourceList[resourceId]).domain === webdomain)
          return resourceId;
      }
    };
  },
  getWebdomainState: function (state, getters) {
    return (webdomain) => {
      let resourceId: string = getters.getWebdomainResource(webdomain);
      if (resourceId)
        return (<Webdomain>state.resourceList[resourceId]).state;
    };
  },

  getFreeWebDomainList: function (state, getters) {
    // Buscamos los inbound
    let allWebDomains: Array<string> = getters.getWebDomainList;
    let usedWebdomains: Array<string> = getters.getUsedWebDomainList;
    let freeWebdomains = [];
    for (let domain in allWebDomains) {
      if (usedWebdomains.indexOf(allWebDomains[domain]) === -1) {
        freeWebdomains.push(allWebDomains[domain]);
      }
    }
    return freeWebdomains;
  },

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

  getCertificateList: function (state) {
    return state.certList;
  },

  getComponentId: function (state, getters) {
    return (owner, component, version) => {
      for (let componentId in state.componentList) {
        if ((<Component>state.componentList[componentId]).owner === owner
          && (<Component>state.componentList[componentId]).name === component
          && (<Component>state.componentList[componentId]).version === version)
          return componentId;
      }
    };
  },

  getServiceId: function (state, getters) {
    return (owner, service, version) => {
      let myServiceId;
      for (let serviceId in state.serviceList) {
        if ((<Service>state.serviceList[serviceId]).owner === owner
          && (<Service>state.serviceList[serviceId]).name === service
          && (<Service>state.serviceList[serviceId]).version === version)
          return serviceId;
      }
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
    return (serviceName: string) => {
      let serviceId = getters.getServiceIdFromName(serviceName);
      if (serviceId === null) return [];
      let res: Array<string> = [];
      for (let proChannel in (<Service>state.serviceList[serviceId]).proChannels) {
        res.push(proChannel);
      }
      return res;
    };
  },

  getServiceReqChannels: function (state, getters) {
    return (serviceId: string) => {
      let res = [];
      for (let reqChannel in (<Service>state.serviceList[serviceId]).reqChannels) {
        res.push(reqChannel);
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
      if (state.serviceList[serviceId] !== undefined && state.serviceList[serviceId] !== null)
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
      if (state.serviceList[serviceId] !== undefined && state.serviceList[serviceId] !== null)
        for (let requiredChannelId in (<Service>state.serviceList[serviceId]).reqChannels)
          res.push(getters.getDeploymentName(deploymentId) + ' + ' + requiredChannelId);
    }
    return res;
  },

  getFreeResource: function (state) {
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

  getSelectedService: function (state) {
    return state.selectedService;
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
  }
};