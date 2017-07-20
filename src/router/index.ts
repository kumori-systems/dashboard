import Vue from 'vue';
import Router from 'vue-router';
import { Overview, DeploymentItem, Elements, WebDomains, DataVolumes, AlarmsAndLogs, Help } from '../components';
import NewHTTPEntrypoint from '../components/views/innerComponents/form/NewHTTPEntrypoint.vue';
import NewService from '../components/views/innerComponents/form/NewService.vue';
import NewServiceAdvanced from '../components/views/innerComponents/form/NewServiceAdvanced.vue';
import AddVolume from '../components/views/innerComponents/form/AddVolume.vue';
import NewBundle from '../components/views/innerComponents/form/NewBundle.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      name: 'OVERVIEW',
      path: '/',
      meta: { expanded: false },
      component: Overview,
      children: [
        {
          path: '/deployment/:deploymentRoute', name: ' ', component: DeploymentItem,
          meta: { expanded: false }
        }
      ]
    },
    {
      name: 'ELEMENTS',
      path: '/elements',
      meta: { expanded: false },
      component: Elements
    },
    {
      name: 'WEB DOMAINS',
      path: '/webdomains',
      meta: { expanded: false },
      component: WebDomains
    },
    {
      name: 'DATA VOLUMES',
      path: '/dataVolumes',
      meta: { expanded: false },
      component: DataVolumes
    },
    {
      name: 'ALARMS & LOGS',
      path: '/alarmsAndLogs',
      meta: { expanded: false },
      component: AlarmsAndLogs
    },
    {
      name: 'HELP',
      path: '/help',
      meta: { expanded: false },
      component: Help
    },
    {
      name: 'NEW HTTP ENTRYPOINT',
      path: '/newHTTPEntrypoint',
      meta: { expanded: false },
      component: NewHTTPEntrypoint
    },
    {
      name: 'NEW SERVICE',
      path: '/newService',
      meta: { expanded: false },
      component: NewService
    },
    {
      name: 'UPLOAD BUNDLE',
      path: '/newBundle',
      meta: { expanded: false },
      component: NewBundle
    }
  ]
});
