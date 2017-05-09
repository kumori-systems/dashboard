import { Deployment, Rol, state as StateType, Link, Volume } from './classes';
export default {

  /* GENERAL */
  sidebar: function (state) {
    return state.sidebar;
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
  getDeploymentShortTitle: function (state): Function {
    return function (deploymentId): string {
      return deploymentId.substring(0, deploymentId.indexOf('deployments') - 1);
    };
  },
  getDeploymentLongTitle: function (state): Function {
    return function (deploymentId): string {
      return deploymentId.substring(deploymentId.indexOf('deployments') + 12, deploymentId.length);
    };
  },
  getIsEntryPoint: function (state, getters) {
    return function (deploymentId): boolean {
      if (getters.getDeploymentService(deploymentId) === 'eslap://eslap.cloud/services/http/inbound/1_0_0')
        return true;
      return false;
    };
  },
  getDeploymentService: function (state): Function {
    return function (deploymentId): string {
      let deployment: Deployment = state.deploymentList.find(deployment => {
        return deployment.name === deploymentId;
      });
      return deployment.service;
    };
  },
  getDeploymentWebsite: function (state): Function {
    return function (deploymentId): string {
      return (<Deployment>state.deploymentList.find(deployment => { return deployment.name === deploymentId; })).website;
    };
  },
  getDeploymentState: function (state): Function {
    return function (deploymentId): StateType {
      // TODO: Tenemos que saber de dónde obtener el estado
      return StateType.NORMAL;
    };
  },
  getDeploymentLinks: function (state): Function {
    return function (deploymentId): Array<string> {
      let res: Array<string> = [];
      let links: Array<Link> = (<Deployment>state.deploymentList.find(deployment => { return deployment.name === deploymentId; })).links;
      for (let index in links) {
        res.push(links[index].connectedTo);
      }
      return res;
    };
  },
  getDeploymentVolumes: function (state): Function {
    return function (deploymentId): Array<string> {
      let res: Array<string> = [];
      let deployment: Deployment = state.deploymentList.find(deployment => { return deployment.name === deploymentId; });
      for (let rolIndex in deployment.roles) // Por cada rol buscamos en las instáncias los volúmenes que utilizan
        for (let instanceIndex in deployment.roles[rolIndex].instances)
          for (let volumeIndex in deployment.roles[rolIndex].instances[instanceIndex].volumes)
            res.push(deployment.roles[rolIndex].instances[instanceIndex].volumes[volumeIndex].name);

      return res;
    };
  },

  /* ROLES */
  getDeploymentRoles: function (state): Function {
    return function (deploymentId): Array<string> {
      let res: Array<string> = [];
      let deployment: Deployment = state.deploymentList.find(deployment => { return deployment.name === deploymentId; });
      for (let index in deployment.roles) {
        res.push(deployment.roles[index].name);
      }
      return res;
    };
  },
  getDeploymentRolComponentURN: function (state) {
    return function (deploymentId, rolId) {
      return (<Deployment>state.deploymentList.find(deployment => { return deployment.name === deploymentId; })).roles.find(rol => { return rol.name === rolId; }).definitionURN;
    };
  },
  getDeploymentRolInfo: function (state) {
    return function (deploymentId, rolId) {
      return state.deploymentList.find(deployment => { return deployment.name === deploymentId; }).roles.find(rol => { return rol.name === rolId; });
    };
  },
  getDeploymentRolNumInstances: function (state): Function {
    return function (deploymentId, rolId): number {
      return (<Deployment>state.deploymentList.find(deployment => { return deployment.name === deploymentId; })).roles.find(rol => { return rol.name === rolId; }).instances.length;

    };
  }
};