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
      return { name: menuItem.name, path: menuItem.path };
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
      if (state.deploymentList[deploymentId] === undefined) return false;
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
      console.log('Entramos por aquí');
      if (state.deploymentList[deploymentId] === undefined) return [];
      console.log('Encuentra un deployment');
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
      if (state.deploymentList[deploymentId] === undefined) return [];
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
      if (state.serviceList[serviceId] === undefined) return [];
      let serviceResources = (<Service>state.serviceList[serviceId]).resources;
      for (let resourceIndex in serviceResources) {
        if (state.resourceList[serviceResources[resourceIndex]] !== null && (<Resource>state.resourceList[serviceResources[resourceIndex]]).realName && (<Resource>state.resourceList[serviceResources[resourceIndex]]).realName.split('/')[4] === 'volume')
          res.push(serviceResources[resourceIndex]);
      }
      return res;
    };
  },
  getDeploymentChartData: function (state, getters): Function {
    return function (deploymentId: string): Object {
      if (state.deploymentList[deploymentId] === undefined) return null;
      if (getters.getIsEntryPoint(deploymentId)) {
        let res: Deployment.Rol.Instance.EntryPointMetrics = new Deployment.Rol.Instance.EntryPointMetrics();
        for (let rolId in (<Deployment>state.deploymentList[deploymentId]).roles) {
          res = res.groupValues(getters.getDeploymentRolChartData(deploymentId, rolId));
        }
        return getters.formatChartData(true, res);
      } else {
        let res: Deployment.Rol.Instance.CommonMetrics = new Deployment.Rol.Instance.CommonMetrics();
        for (let rolId in (<Deployment>state.deploymentList[deploymentId]).roles) {
          res = res.groupValues(getters.getDeploymentRolChartData(deploymentId, rolId));
        }
        return getters.formatChartData(false, res);
      }
    };
  },

  formatChartData: function (state, getters): Function {
    return function (isEntryPoint: boolean, chartData: Deployment.Rol.Instance.Metrics) {
      if (isEntryPoint) {
        return {
          labels: chartData.time,
          datasets: [
            {
              label: 'timestamp_init',
              backgroundColor: '#1fc8db',
              borderColor: '#1fc8db',
              fill: false,
              data: (<Deployment.Rol.Instance.EntryPointMetrics>chartData).timestamp_init
            },
            {
              label: 'timestamp_end',
              backgroundColor: '#fce473',
              borderColor: '#fce473',
              fill: false,
              data: (<Deployment.Rol.Instance.EntryPointMetrics>chartData).timestamp_end
            },
            {
              label: 'elapsed_msec',
              backgroundColor: '#42afe3',
              borderColor: '#42afe3',
              fill: false,
              data: (<Deployment.Rol.Instance.EntryPointMetrics>chartData).elapsed_msec
            },
            {
              label: 'http_request_per_second',
              backgroundColor: '#42afe3',
              borderColor: '#42afe3',
              fill: false,
              data: (<Deployment.Rol.Instance.EntryPointMetrics>chartData).http_request_per_second
            },
            {
              label: 'http_errors_per_second',
              backgroundColor: '#ed6c63',
              borderColor: '#ed6c63',
              fill: false,
              data: (<Deployment.Rol.Instance.EntryPointMetrics>chartData).http_errors_per_second
            },
            {
              label: 'http_size_in_per_second',
              backgroundColor: '#97cd76',
              borderColor: '#97cd76',
              fill: false,
              data: (<Deployment.Rol.Instance.EntryPointMetrics>chartData).http_size_in_per_second
            },
            {
              label: 'http_size_out_per_second',
              backgroundColor: '#97cd76',
              borderColor: '#97cd76',
              fill: false,
              data: (<Deployment.Rol.Instance.EntryPointMetrics>chartData).http_size_out_per_second
            },
            {
              label: 'http_response_time',
              backgroundColor: '#97cd76',
              borderColor: '#97cd76',
              fill: false,
              data: (<Deployment.Rol.Instance.EntryPointMetrics>chartData).http_response_time
            },
            {
              label: 'ws_size_in_per_second',
              backgroundColor: '#97cd76',
              borderColor: '#97cd76',
              fill: false,
              data: (<Deployment.Rol.Instance.EntryPointMetrics>chartData).ws_size_in_per_second
            },
            {
              label: 'ws_size_out_per_second',
              backgroundColor: '#97cd76',
              borderColor: '#97cd76',
              fill: false,
              data: (<Deployment.Rol.Instance.EntryPointMetrics>chartData).ws_size_out_per_second
            },
            {
              label: 'ws_chunk_in_per_second',
              backgroundColor: '#97cd76',
              borderColor: '#97cd76',
              fill: false,
              data: (<Deployment.Rol.Instance.EntryPointMetrics>chartData).ws_chunk_in_per_second
            },
            {
              label: 'ws_chunk_out_per_second',
              backgroundColor: '#97cd76',
              borderColor: '#97cd76',
              fill: false,
              data: (<Deployment.Rol.Instance.EntryPointMetrics>chartData).ws_chunk_out_per_second
            }
          ]
        };
      }
      else {
        return {
          labels: chartData.time,
          datasets: [
            {
              label: 'CPU',
              backgroundColor: '#1fc8db',
              borderColor: '#1fc8db',
              fill: false,
              data: (<Deployment.Rol.Instance.CommonMetrics>chartData).cpu
            },
            {
              label: 'MEM',
              backgroundColor: '#fce473',
              borderColor: '#fce473',
              fill: false,
              data: (<Deployment.Rol.Instance.CommonMetrics>chartData).mem
            },
            {
              label: 'NET_IN',
              backgroundColor: '#42afe3',
              borderColor: '#42afe3',
              fill: false,
              data: (<Deployment.Rol.Instance.CommonMetrics>chartData).net_in
            },
            {
              label: 'NET_OUT',
              backgroundColor: '#42afe3',
              borderColor: '#42afe3',
              fill: false,
              data: (<Deployment.Rol.Instance.CommonMetrics>chartData).net_out
            },
            {
              label: 'RPM',
              backgroundColor: '#ed6c63',
              borderColor: '#ed6c63',
              fill: false,
              data: (<Deployment.Rol.Instance.CommonMetrics>chartData).rpm
            },
            {
              label: 'RES',
              backgroundColor: '#97cd76',
              borderColor: '#97cd76',
              fill: false,
              data: (<Deployment.Rol.Instance.CommonMetrics>chartData).res
            }
          ]
        };
      }

    };
  },

  /* ROLES */
  getDeploymentRoles: function (state): Function {
    return function (deploymentId: string): Array<string> {
      let deployment: Deployment = state.deploymentList[deploymentId];
      if (deployment === undefined) return [];

      let res: Array<string> = [];
      for (let rolId in deployment.roles) {
        res.push(rolId);
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
      return (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instances();
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
      // Buscamos todas las instancias del rol
      if (getters.getIsEntryPoint(deploymentId)) {
        let res: Deployment.Rol.Instance.EntryPointMetrics = new Deployment.Rol.Instance.EntryPointMetrics();
        for (let instanceId in (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList) {
          res = res.groupValues(getters.getDeploymentRolInstanceChartData(deploymentId, rolId, instanceId));
        }
        return res;
      } else {
        let res: Deployment.Rol.Instance.CommonMetrics = new Deployment.Rol.Instance.CommonMetrics();
        for (let instanceId in (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList) {
          res = res.groupValues(getters.getDeploymentRolInstanceChartData(deploymentId, rolId, instanceId));
        }
        return res;
      }
    };
  },
  getDeploymentRolChartDataFormatted: function (state, getters): Function {
    return function (deploymentId: string, rolId: string): any {
      return getters.formatChartData(getters.getIsEntryPoint(deploymentId), getters.getDeploymentRolChartData(deploymentId, rolId));
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
          && (<Resource>state.resourceList[resources[resourceId]]).realName.split('/')[4] === 'volume'
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
      let componentId = (<Service>state.serviceList[serviceId]).roles[rolId].component;
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
      let componentId = (<Service>state.serviceList[serviceId]).roles[rolId].component;
      let res = [];
      console.log('Entra en deploymentRolProConnectedTo');
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
    return function (deploymentId: string, rolId: string, instanceId: string): Deployment.Rol.Instance.Metrics {
      return (<Deployment>state.deploymentList[deploymentId]).roles[rolId].instanceList[instanceId].metrics;
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
        owner = getters.getElementOwner(componentIndex);
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
      let res: Array<string> = []; let compName;
      for (let componentId in state.componentList) {
        if (getters.getElementOwner(componentId) === owner) {
          // Si el componente ya esta no lo añadimos
          compName = getters.getComponentName(componentId);
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
      // Buscamos en la lista de componentes, todos aquellos que encajen con el owner y el componente
      for (let key in state.componentList) {
        if (getters.getElementOwner(key) === owner && getters.getComponentName(key) === component) {
          if (filtro !== null && filtro.length > 0) {
            if (key.indexOf(filtro) !== -1) {
              res.push(getters.getServiceVersion(key));
            }
          } else {
            res.push(getters.getServiceVersion(key));
          }
        }
      }

      return res;
    };
  },

  getComponentName: function (state) {
    return (componentId: string) => {
      return componentId.split('/')[4];
    };
  },

  getComponentVersion: function (state) {
    return (componentId) => {
      let splitted = componentId.split('/');
      return splitted[splitted.length - 1];
    };
  },

  getIsComponentInUse: function (state, getters) {
    return (componentId) => {
      // Tenemos que comprobar si el componente está siendo utilizado por algún servicio
      for (let serviceIndex in state.serviceList) {
        if (state.serviceList[serviceIndex] === undefined || state.serviceList[serviceIndex] === null) return false;
        for (let componentIndex in (<Service>state.serviceList[serviceIndex]).components) {
          if ((<Service>state.serviceList[serviceIndex]).components[componentIndex] === componentId)
            return true;
        }
      }
      return false;
    };
  },
  getComponentUsedBy: function (state, getters) {
    return (componentId) => {
      let res: Array<string> = [];
      // Tenemos que comprobar si el componente está siendo utilizado por algún servicio
      for (let serviceIndex in state.serviceList) {
        if (state.serviceList[serviceIndex] === undefined || state.serviceList[serviceIndex] === null) return false;
        for (let componentIndex in (<Service>state.serviceList[serviceIndex]).components) {
          if ((<Service>state.serviceList[serviceIndex]).components[componentIndex] === componentId)
            res.push((<Service>state.serviceList[serviceIndex]).name + getters.getServiceVersion(serviceIndex));
        }
      }
      return res;
    };
  },

  /**
   * Devolvemos una lista de servicios web disponibles para el usuario
   */
  getServiceOwnerList: function (state, getters) {
    return (showPublicElements: boolean, filter: string): Array<string> => {
      let res: Array<string> = [];
      let owner: string;
      for (let serviceIndex in state.serviceList) {
        owner = getters.getElementOwner(serviceIndex);
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
        serviceName = getters.getServiceName(serviceId);

        if (getters.getElementOwner(serviceId) === owner
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
      for (let key in state.serviceList) {
        if (getters.getElementOwner(key) === owner && getters.getServiceName(key) === service) {
          if (filtro !== null && filtro.length > 0) {
            if (key.indexOf(filtro) !== -1) {
              res.push(getters.getServiceVersion(key));
            }
          } else {
            res.push(getters.getServiceVersion(key));
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
        if (state.runtimeList[runtimeId] !== undefined && state.runtimeList[runtimeId] !== null)
          if (getters.getElementOwner(runtimeId) === owner && getters.getRuntimeName(runtimeId) === runtime) {
            if (filtro !== null && filtro.length > 0) {
              if (runtimeId.indexOf(filtro) !== -1) {
                res.push(getters.getServiceVersion(runtimeId));
              }
            } else {
              res.push(getters.getServiceVersion(runtimeId));
            }
          }
      }

      return res;
    };
  },

  getServiceNameList: function (state, getters): Array<string> {
    let res = [];
    for (let serviceId in state.serviceList)
      res.push(getters.getServiceName(serviceId));
    return res;
  },

  /**
   * Devolvemos el nombre de aquellos servicios que no sean Entrypoint
   */
  getNoEPServiceNameList: function (state, getters): Array<string> {
    let res = [];
    for (let serviceId in state.serviceList) {
      if (getters.getServiceIsEntryPoint(serviceId))
        res.push(getters.getServiceName(serviceId));
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
        owner = getters.getElementOwner(runtimeIndex);

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
        runtimeName = getters.getRuntimeName(runtimeId);
        if ((getters.getElementOwner(runtimeId) === owner)
          && ((filter && filter !== null && filter.length > 0 && runtimeId.indexOf(filter) !== -1) || (filter === undefined || filter === null || filter.length <= 0)) // Pasa el filtro
          && (res.findIndex(serv => { return serv === runtimeName; }) === -1)) {
          res.push(runtimeName);
        }
      }
      return res;
    };
  },

  getRuntimeVersion: function (state) {
    return (runtimeId) => {
      let splitted = runtimeId.split('/');
      return splitted[splitted.length - 1];
    };
  },

  getNeedElementInfo: function (state, getters) {
    return (type, owner, element): Boolean => {
      let elementVersions: Array<string> = getters.getElementBundle(type, owner, element);
      console.log('El tipo que tenemos es: ', type, owner, element);
      console.log('Vamos a preguntar en el estado por los elementos:', elementVersions);
      for (let i = 0; i < elementVersions.length; i++) {
        console.log('Preguntamos por el elemento', elementVersions[i]);
        switch (type) {
          case 'component':
            if (
              state.componentList[elementVersions[i]] === undefined
              || state.componentList[elementVersions[i]] === null
            )
              return true;
            break;
          case 'service':
            if (
              state.serviceList[elementVersions[i]] === undefined
              || state.serviceList[elementVersions[i]] === null
            )
              return true;
            break;

          case 'runtime':
            if (
              state.runtimeList[elementVersions[i]] === undefined
              || state.runtimeList[elementVersions[i]] === null
            )
              return true;
            break;
          default:
            console.error('getNeedElementInfno error, tipo de elemento no esperado:', type);
        }
      }
      return false;
    };
  },
  getElementBundle: function (state, getters) {
    // Esta función sirve para obtener las distintas versiones del mismo elemento para cargar su info
    return (type, owner, element) => {
      let res: Array<string> = [];
      switch (type) {
        case 'component':
          for (let componentId in state.componentList) {
            if (
              getters.getElementOwner(componentId) === owner
              && getters.getComponentName(componentId) === element
            )
              res.push(componentId);
          }
          break;

        case 'service':
          for (let serviceId in state.serviceList) {
            if (
              getters.getElementOwner(serviceId) === owner
              && getters.getServiceName(serviceId) === element
            )
              res.push(serviceId);
          }
          break;
        case 'runtime':
          for (let runtimeId in state.runtimeList) {
            if (
              getters.getElementOwner(runtimeId) === owner
              && getters.getRuntimeName(runtimeId) === element
            )
              res.push(runtimeId);
          }
          break;
        default:
          console.error('¿De qué tipo hemos pedido el elemento?', type);
      }
      return res;
    };
  },
  getRuntimeId: function (state, getters) {
    return (owner, runtime, version) => {
      for (let runtimeId in state.runtimeList) {
        if (getters.getElementOwner(runtimeId) === owner
          && getters.getRuntimeName(runtimeId) === runtime
          && getters.getRuntimeVersion(runtimeId) === version)
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
          res.push(getters.getComponentName(componentId) + getters.getComponentVersion(componentId));
      }
      return res;
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
    let usedWebdomain: Array<[string, string]> = [];
    let websiteList: Array<string> = null;
    for (let deploymentId in state.deploymentList) {
      websiteList = (<Deployment>state.deploymentList[deploymentId]).website;
      if (websiteList != null) {
        for (let index in websiteList) {
          usedWebdomain.push([getters.getDeploymentName(deploymentId), websiteList[index]]);
        }
      }
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
    for (let resourceIndex in state.resourceList) {
      if (
        state.resourceList[resourceIndex] !== null
        && (<Resource>state.resourceList[resourceIndex]).realName
        && (<Resource>state.resourceList[resourceIndex]).realName.split('/')[4] === 'volume'
      ) {
        res.push(resourceIndex);
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
        if (getters.getElementOwner(componentId) === owner
          && getters.getComponentName(componentId) === component
          && getters.getComponentVersion(componentId) === version)
          return componentId;
      }
    };
  },

  getServiceName: function (state) {
    return (serviceId: string) => {
      return serviceId.split('/')[4];
      /*
      if (state.serviceList[serviceId] === null) return serviceId;
      return (<Service>state.serviceList[serviceId]).name;
      */
    };
  },
  getRuntimeName: function (state, getters) {
    return (runtimeId) => {
      let splitted = runtimeId.split('/');
      if (splitted[5] === getters.getRuntimeVersion(runtimeId))
        return splitted[4];
      else
        return splitted[4] + '.' + splitted[5];
    };
  },

  getServiceVersion: function (state) {
    return (serviceId: string) => {
      // En el id debería de estar la versión del servicio
      let splitted = serviceId.split('/');
      return splitted[splitted.length - 1];
    };
  },
  getServiceId: function (state, getters) {
    return (owner, service, version) => {
      let myServiceId;
      for (let serviceId in state.serviceList) {
        if (getters.getElementOwner(serviceId) === owner
          && getters.getServiceName(serviceId) === service
          && getters.getServiceVersion(serviceId) === version)
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

  getServiceResources: function (state, getters) {
    return (serviceName: string) => {
      let serviceId = getters.getServiceIdFromName(serviceName);
      if (serviceId == null) return [];

      let res: Array<string> = [];
      for (let resourceIndex in (<Service>state.serviceList[serviceId]).resources) {
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

      console.log('Pasa por aquí!!');
      let res: Array<string> = [];
      for (let proChannel in (<Service>state.serviceList[serviceId]).proChannels) {
        res.push(proChannel);
      }
      return res;
    };
  },

  getServiceReqChannels: function (state, getters) {
    return (serviceName: string) => {
      if (serviceName == null) return [];
      let res: Array<string> = [];

      let serviceId = getters.getServiceIdFromName(serviceName);
      // Tenemos que buscar el servicio por su nombre

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

      // Miramos el tipo de configId
      if (state.resourceList[configId] !== null && (<Resource>state.resourceList[configId]).realName) {
        let type = (<Resource>state.resourceList[configId]).realName.split('/')[4];

        for (let resourceId in (<Array<Resource>>state.resourceList)) {
          if ((<Resource>state.resourceList[resourceId]).realName && (<Resource>state.resourceList[resourceId]).realName.split('/')[4] === type) {
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

  getDeploymentUsingDataVolume: function (state) {
    return (dataVolumeId) => {
      // Tenemos que entrar en resourcesConfig de cada deployment y mirar si está el volumen
      for (let deploymentId in state.deploymentList) {
        if ((<Deployment>state.deploymentList[deploymentId]).resourcesConfig[dataVolumeId] !== undefined) {
          return deploymentId;
        }
      }
    };
  },

  getRolUsingDataVolume: function (state, getters) {
    return (dataVolumeId) => {
      let deploymentId = getters.getDeploymentUsingDataVolume(dataVolumeId);
      let serviceId = (<Deployment>state.deploymentList[deploymentId]).serviceId;
      if (state.serviceList[serviceId] === undefined) return false;
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