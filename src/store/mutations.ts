export default {
  setDeployments(state, { deploymentList }) {
    for (let i = 0; i < deploymentList.length; i++) {
      state.deploymentList.push(deploymentList[i]);
    }

    // Después de asignar los deployments tenemos que actualizar la sidebar
    // Para ello, simplemente tenemos que actualizar el estado y en items, en el item deployments
    // tantos hijos como deployments tengamos

    state.menu.items.filter(item => { return item.name === 'DEPLOYMENTS'; })[0].children = [
      {
        name: 'Deployment1',
        path: 'Deployment1',
        component: 'DeploymentsItem',
        meta: {
          link: 'src/components/views/DeploymentsItem.vue'
        }
      }];

  },
  hideEntrypoints(state, { }) {
    state.hideEntrypoints = !state.hideEntrypoints;
  },
  addInstance(state, { rol }) {
    state[rol].instances++;
  },
  removeInstance(state, { rol }) {
    state[rol].instances--;
  }
};