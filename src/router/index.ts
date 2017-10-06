import Vue from 'vue';
import Router from 'vue-router';
import { Overview, DeploymentItem, Elements, Domains, DataVolumes, AlarmsAndLogs, Help } from '../components';
import NewHTTPEntrypoint from '../components/views/innerComponents/form/NewHTTPEntrypoint.vue';
import NewDeployment from '../components/views/innerComponents/form/NewDeployment.vue';
import NewServiceAdvanced from '../components/views/innerComponents/form/NewServiceAdvanced.vue';
import NewVolume from '../components/views/innerComponents/form/NewVolume.vue';
import NewDomain from '../components/views/innerComponents/form/NewDomain.vue';
import NewBundle from '../components/views/innerComponents/form/NewBundle.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      name: 'Overview',
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
      name: 'Elements',
      path: '/elements',
      meta: { expanded: false },
      component: Elements
    },
    {
      name: 'Domains',
      path: '/domains',
      meta: { expanded: false },
      component: Domains
    },
    {
      name: 'Data volumes',
      path: '/dataVolumes',
      meta: { expanded: false },
      component: DataVolumes
    },
    {
      name: 'Alarms & logs',
      path: '/alarmsAndLogs',
      meta: { expanded: false },
      component: AlarmsAndLogs
    },
    {
      name: 'Help',
      path: '/help',
      meta: { expanded: false },
      component: Help
    },
    {
      name: 'Add entrypoint',
      path: '/newHTTPEntrypoint',
      meta: { expanded: false },
      component: NewHTTPEntrypoint
    },
    {
      name: 'New deployment',
      path: '/newDeployment',
      meta: { expanded: false },
      component: NewDeployment
    },
    {
      name: 'New domain',
      path: '/newDomain',
      meta: { expanded: false },
      component: NewDomain
    },
    {
      name: 'New volume',
      path: '/newVolume',
      meta: { expanded: false },
      component: NewVolume
    },
    {
      name: 'Upload bundle',
      path: '/newBundle',
      meta: { expanded: false },
      component: NewBundle
    }
  ]
});
