import overview from './overview';
import elements from './elements';
import webDomains from './webDomains';
import dataVolumes from './dataVolumes';
import alarmsAndLogs from './alarmsAndLogs';
import help from './help';

export let routes = [
    overview,
    elements,
    webDomains,
    dataVolumes,
    alarmsAndLogs,
    help
];

const state: any = {
    items: routes
};

const getters: any = {
    menuitems: function (state) {
        return state.items;
    }
};

const mutations: any = {
    expandMenu(state, menuItem) {
        if (menuItem.index > -1) {
            if (state.items[menuItem.index] && state.items[menuItem.index].meta) {
                state.items[menuItem.index].meta.expanded = menuItem.expanded;
            }
        } else if (menuItem.item && 'expanded' in menuItem.item.meta) {
            menuItem.item.meta.expanded = menuItem.expanded;
        }
    }
};

export default {
    'state': state,
    'getters': getters,
    'mutations': mutations
};