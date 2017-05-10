import overview from './overview';
import elements from './elements';
import webDomains from './webDomains';
import dataVolumes from './dataVolumes';
import alarmsAndLogs from './alarmsAndLogs';
import help from './help';

export let routes: Array<any> = [
    overview,
    elements,
    webDomains,
    dataVolumes,
    alarmsAndLogs,
    help
];

const state: any = {
    menuItemList: routes
};

const getters: any = {
    menuItems: function (state) {
        return state.menuItemList;
    },
    menuItemIsExpanded: function (state): Function {
        return function (menuItem): boolean {
            return state.menuItemList.find(item => { return item.name === menuItem.name; }).expanded || false;
        };
    },
    menuItemHasChildren: function (state): Function {
        return function (menuItem): boolean {
            if (menuItem.children) return true;
            return false;
        };
    }

};

const mutations: any = {
    menuItemExpandToggle(state, { menuItem }) {
        let item = state.menuItemList.find(item => { return item.name === menuItem.name; });
        if (!item.expanded) {
            item.expanded = false;
        }
        item.expanded = !item.expanded;
    }
};

const actions: any = {
    menuItemExpandToggle({ commit }, { menuItem }) {
        commit('menuItemExpandToggle', { menuItem });
    }
};

export default {
    'state': state,
    'getters': getters,
    'mutations': mutations,
    'actions': actions
};