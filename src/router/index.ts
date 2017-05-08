import Vue from 'vue';
import Router from 'vue-router';
import { Overview, Deployments, DeploymentItem, Elements, WebDomains, DataVolumes, AlarmsAndLogs, Help } from '../components';

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
      component: Deployments,
      children: [
        { path: ':deploymentId', name: 'deploymentId', component: DeploymentItem,
        props: true
      }
      ]
    },
    {
      path: '/elements',
      name: 'Elements',
      component: Elements
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
