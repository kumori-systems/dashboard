import * as connection from './../connection';
import { DeploymentItem } from './../components';

export default {

    expandMenu({ commit }, menuItem) {
        if (menuItem) {
            menuItem.expanded = menuItem.expanded || false;
            commit('expandMenu', menuItem);
        }
    },

    getStampState({ dispatch, commit }, { vueInstanceReference }) {
        connection.getStampState().then(function (deploymentList) {
            // Guardamos los deployments en el estado
            commit('setDeployments', { deploymentList });

            let res = [];
            for (let key in deploymentList) {
                res.push({
                    'name': key,
                    'path': key,
                });
            }

            // añadimos cada deployment como un deploymentMenuItem
            commit('addDeploymentMenuItem', { deploymentList: res });
        }).catch(function (error) { // TODO: mensaje de advertencia al usuario
            console.error('Error manejando los deployments: ' + error);
        });
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