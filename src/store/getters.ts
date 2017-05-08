import { Deployment, Rol, state as StateType } from './classes';
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
  getDeploymentService: function (state): Function {
    return function (deploymentId): string {
      return (<Deployment>state.deploymentList[deploymentId]).service;
    };
  },
  getDeploymentWebsite: function (state): Function {
    return function (deploymentId): string {
      // TODO: Tenemos que saber de dónde obtener el website del sitio
      return '¿Website del entrypoint?';
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
      // TODO: Tenemos que saber de dónde obtener los links
      return ['¿involvedCNs?', 'myLink1'];
    };
  },
  getDeploymentVolumes: function (state): Function {
    return function (deploymentId): Array<number> {
      // TODO: Los volúmenes sé de dónde obtener los de una instáncia concreta, no los de un rol
      return [1, 2, 3];
    };
  },

  /* ROLES */
  getDeploymentRoles: function (state): Function {
    return function (deploymentId): Array<string> {
      let res: Array<string> = [];
      for (let index in state.stampState.deployedServices[deploymentId].manifest.versions['http://eslap.cloud/manifest/deployment/1_0_0'].roles) {
        res.push(index);
      }
      return res;
    };
  },
  getDeploymentRolInfo: function (state) {
    return function (deploymentId, rolId) {
      return state.deploymentList[deploymentId].roles[rolId];
    };
  },
  getDeploymentRolNumInstances: function (state): Function {
    return function (deploymentId, rolId): number {
      let res = 0;
      for (let counter in state.deploymentList[deploymentId].roles[rolId].instances) res++;
      return res;
    };
  }
};