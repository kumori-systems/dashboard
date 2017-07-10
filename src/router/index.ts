import Vue from 'vue';
import Router from 'vue-router';
import { Overview, DeploymentItem, Elements, WebDomains, DataVolumes, AlarmsAndLogs, Help } from '../components';
import NewHTTPEntrypoint from '../components/views/innerComponents/form/NewHTTPEntrypoint.vue';
import NewWebService from '../components/views/innerComponents/form/NewWebService.vue';
import NewWebServiceAdvanced from '../components/views/innerComponents/form/NewWebServiceAdvanced.vue';
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
      name: 'New HTTP Entrypoint',
      path: '/newHTTPEntrypoint',
      meta: { expanded: false },
      component: NewHTTPEntrypoint
    },
    {
      name: 'New Web Service',
      path: '/newWebService',
      meta: { expanded: false },
      component: NewWebService
    },
    {
      name: 'New Web Service (Advanced)',
      path: '/newWebServiceAdvanced',
      meta: { expanded: false },
      component: NewWebServiceAdvanced
    },
    {
      name: 'Upload bundle',
      path: '/newBundle',
      meta: { expanded: false },
      component: NewBundle
    }
  ]
});
