import { Deployment, Rol, state as StateType, Link, Volume } from './classes';
export default {

  /* GENERAL */
  sidebar: function (state) {
    return state.sidebar;
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
      res.push((<Deployment>state.deploymentList[index]).name);
    return res;
  },
  getDeploymentIdFromDeploymentRoute: function (state): Function {
    return function (deploymentRoute: String): string {
      // Tenemos que obtener el id a partir de la ruta, esto es
      // Entrar en el menú, mirar qué elemento está utilizando esta ruta y pasar el nombre
      let overview = state.menuItemList.find(menuItem => { return menuItem.name === 'OVERVIEW'; });
      return overview.children.find(menuItem => {
        console.log('MenuItemPath es: ' + menuItem.path);
        console.log('DeploymentRoute es: ' + deploymentRoute);
        return menuItem.path === deploymentRoute;
      }).name;
    };
  },
  getDeploymentPath: function (state): Function {
    return function (deploymentId: String): string {
      // Obtenemos la vista que contiene los deployment == OVERVIEW
      let overview = state.menuItemList.find(menuItem => { return menuItem.name === 'OVERVIEW'; });
      return overview.children.find(deploymentMenuItem => { return deploymentMenuItem.name === deploymentId; }).path;
    };
  },
  getDeploymentShortTitle: function (state): Function {
    return function (deploymentId: string): string {
      return deploymentId.substring(0, deploymentId.indexOf('deployments') - 1);
    };
  },
  getDeploymentLongTitle: function (state): Function {
    return function (deploymentId: string): string {
      return deploymentId.substring(deploymentId.indexOf('deployments') + 12, deploymentId.length);
    };
  },
  getIsEntryPoint: function (state, getters) {
    return function (deploymentId: string): boolean {
      if (getters.getDeploymentService(deploymentId) === 'eslap://eslap.cloud/services/http/inbound/1_0_0')
        return true;
      return false;
    };
  },
  getDeploymentService: function (state): Function {
    return function (deploymentId: string): string {
      let deployment: Deployment = state.deploymentList.find(deployment => {
        return deployment.name === deploymentId;
      });
      return deployment.service;
    };
  },
  getDeploymentWebsite: function (state): Function {
    return function (deploymentId: string): string {
      return (<Deployment>state.deploymentList.find(deployment => { return deployment.name === deploymentId; })).website;
    };
  },
  getDeploymentState: function (state): Function {
    return function (deploymentId: string): StateType {
      // TODO: Tenemos que saber de dónde obtener el estado
      let ranNumber = Math.trunc(Math.random() * 3);
      switch (ranNumber) {
        case 0: return StateType.NORMAL;
        case 1: return StateType.WARNING;
        default: return StateType.ERROR;
      }
    };
  },
  getDeploymentLinks: function (state): Function {
    return function (deploymentId: string): Array<string> {
      let res: Array<string> = [];
      let links: Array<Link> = (<Deployment>state.deploymentList.find(deployment => { return deployment.name === deploymentId; })).links;
      for (let index in links) {
        res.push(links[index].connectedTo);
      }
      return res;
    };
  },
  getDeploymentVolumes: function (state): Function {
    return function (deploymentId: string): Array<string> {
      let res: Array<string> = [];
      let deployment: Deployment = state.deploymentList.find(deployment => { return deployment.name === deploymentId; });
      for (let rolIndex in deployment.roles) // Por cada rol buscamos en las instáncias los volúmenes que utilizan
        for (let instanceIndex in deployment.roles[rolIndex].instances)
          for (let volumeIndex in deployment.roles[rolIndex].instances[instanceIndex].volumes)
            res.push(deployment.roles[rolIndex].instances[instanceIndex].volumes[volumeIndex].name);

      return res;
    };
  },
  getDeploymentChartData: function (state): Function {
    return function (): Object {
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
      let deployment: Deployment = state.deploymentList.find(deployment => { return deployment.name === deploymentId; });

      for (let index in deployment.roles) {
        res.push(deployment.roles[index].name);
      }
      return res;
    };
  },
  getDeploymentRolComponentURN: function (state) {
    return function (deploymentId: string, rolId: string) {
      return (<Deployment>state.deploymentList.find(deployment => { return deployment.name === deploymentId; })).roles.find(rol => { return rol.name === rolId; }).definitionURN;
    };
  },
  getDeploymentRolInfo: function (state) {
    return function (deploymentId: string, rolId: string) {
      return state.deploymentList.find(deployment => { return deployment.name === deploymentId; }).roles.find(rol => { return rol.name === rolId; });
    };
  },
  getDeploymentRolNumInstances: function (state): Function {
    return function (deploymentId: string, rolId: string): number {
      return (<Deployment>state.deploymentList.find(deployment => { return deployment.name === deploymentId; })).roles.find(rol => { return rol.name === rolId; }).instances.length;
    };
  },
  getDeploymentRolName: function (state): Function {
    return function (deploymentId: string, rolId: string): string {
      return (<Deployment>state.deploymentList.find(deployment => { return deployment.name === deploymentId; })).roles.find(rol => { return rol.name === rolId; }).name;
    };
  },
  getDeploymentRolState: function (state): Function {
    return function (deploymentId: string, rolId: string): StateType {
      let ranNumber = Math.trunc(Math.random() * 3);
      switch (ranNumber) {
        case 0: return StateType.NORMAL;
        case 1: return StateType.WARNING;
        default: return StateType.ERROR;
      }
    };
  }
};