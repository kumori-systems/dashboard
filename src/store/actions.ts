import * as connection from './../connection';
export default {
    expandMenu({ commit }) {
        commit('expandMenu');
    },
    getDeployments({ commit }) {
        connection.getDeployments().then(function ({ deploymentList }) {
            commit('setDeployments', { deploymentList });
        }).catch(function (error) { // TODO: mensaje de advertencia al usuario
            console.log('No se han podido obtener los deployments');
            console.log('motivo: ' + error);
        });
    },
    hideEntrypoints({commit}, {}) {
        commit('hideEntrypoints', {});
    },
    // TODO: no queda claro que hace falta para añadir una estáncia ni qué se devuelve
    addInstance({ commit }, { rol }) {
        connection.addInstance().then(function () {
            commit('addInstance', { rol });
        }).catch(function (error) { // TODO: mensaje de advertencia al usuario
            console.log('No se han podido añadir una instáncia nueva al rol: ' + rol);
            console.log('motivo: ' + error);
        });
    },
    removeInstance({ commit }, { rol }) {
        connection.removeInstance().then(function () {
            commit('removeInstance', { rol });
        }).catch(function (error) { // TODO: mensaje de advertencia al usuario
            console.log('No se han podido eliminar una instáncia del rol: ' + rol);
            console.log('motivo: ' + error);
        });
    }
};