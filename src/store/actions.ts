import * as connection from './../connection';
import { DeploymentItem } from './../components';
export default {
    expandMenu({ commit }, menuItem) {
        if (menuItem) {
            menuItem.expanded = menuItem.expanded || false;
            commit('expandMenu', menuItem);
        }
    },
    getDeployments({ dispatch, commit }, { vueInstanceReference }) {
        connection.getDeployments().then(function ({ deploymentList }) {
            // Obtenemos la lista de deployments
            commit('setDeployments', { deploymentList });



            let res = [];
            deploymentList.forEach(element => {
                res.push({
                    'name': element.name,
                    'path': element.name,
                });
            });
            /* Aparentemente deberíamos de hacerlo sin esto
            // añadimos las rutas en el router
                let router = vueInstanceReference.$router;
                console.log('las rutas actuales son:' + JSON.stringify(router.options.routes));
                router.addRoutes([{ name: 'oscar', path: '/myPath' }]);
            */

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
    addInstance({ commit }, { rol }) {
        connection.addInstance().then(function () {
            commit('addInstance', { rol });
        }).catch(function (error) { // TODO: mensaje de advertencia al usuario
            console.error('No se han podido añadir una instáncia nueva al rol \'' + rol + '\' por el error: ' + error);
        });
    },
    removeInstance({ commit }, { rol }) {
        connection.removeInstance().then(function () {
            commit('removeInstance', { rol });
        }).catch(function (error) { // TODO: mensaje de advertencia al usuario
            console.error('No se han podido eliminar una instáncia nueva al rol \'' + rol + '\' por el error: ' + error);
        });
    }
};