import Vue from 'vue';
import Router from 'vue-router';
import { Overview, Deployments, DeploymentItem, Storage, WebDomains, DataVolumes, AlarmsAndLogs, Help } from '../components';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Overview',
      component: Overview
    },
    {
      path: '/deployments',
      name: 'Deployments',
      component: Deployments
    },
    {
      path: '/deployments/Deployment1',
      name: 'Deployment1',
      component: DeploymentItem
    },
    {
      path: '/storage',
      name: 'Storage',
      component: Storage
    },
    {
      path: '/webDomains',
      name: 'WebDomains',
      component: WebDomains
    },
    {
      path: '/dataVolumes',
      name: 'DataVolumes',
      component: DataVolumes
    },
    {
      path: '/alarmsAndLogs',
      name: 'AlarmsAndLogs',
      component: AlarmsAndLogs
    },
    {
      path: '/help',
      name: 'Help',
      component: Help
    }
  ]
});
