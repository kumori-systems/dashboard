import * as connection from './proxy';
import { DeploymentItem } from './../components';
import { Deployment } from './classes';

export default {
    getDeploymentList({ dispatch, commit }, { vueInstanceReference }) {
        connection.getDeploymentList().then(function (deploymentList) {
            // Guardamos los deployments en el estado
            commit('setDeploymentList', { deploymentList });

            // añadimos cada deployment como un deploymentMenuItem
            let res = [];
            let path: string;
            for (let key in deploymentList) {
                path = (<Deployment>deploymentList[key]).id;
                let index = path.indexOf('/');
                while (index !== -1) {
                    path = path.replace('/', '\\');
                    index = path.indexOf('/');
                }
                res.push({
                    'name': deploymentList[key].name,
                    'path': 'deployments\\' + path,
                    'meta': {
                        'id': deploymentList[key].id
                    }
                });
            }
            commit('addDeploymentMenuItem', { deploymentList: res });
        }).catch(function (error) { // TODO: mensaje de advertencia al usuario
            console.error('Error manejando los deployments: ' + error);
        });
    },

    toggleMenuItemExpanded({ commit }, { menuItem }) {
        commit('toggleMenuItemExpanded', menuItem);
    },

    hideEntrypoints({ commit }, { }) {
        commit('hideEntrypoints', {});
    },

    // TODO: no queda claro que hace falta para añadir una estáncia ni qué se devuelve
    deploymentRolAddInstance({ commit }, { rol }) {
        connection.deploymentRolAddInstance().then(function () {
            commit('deploymentRolAddInstance', { rol });
        }).catch(function (error) { // TODO: mensaje de advertencia al usuario
            console.error('No se han podido añadir una instáncia nueva al rol \'' + rol + '\' por el error: ' + error);
        });
    },

    deploymentRolRemoveInstance({ commit }, { rol }) {
        connection.deploymentRolRemoveInstance().then(function () {
            commit('deploymentRolRemoveInstance', { rol });
        }).catch(function (error) { // TODO: mensaje de advertencia al usuario
            console.error('No se han podido eliminar una instáncia nueva al rol \'' + rol + '\' por el error: ' + error);
        });
    }

};