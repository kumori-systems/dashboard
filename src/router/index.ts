/**
 * This is the configuration for the official suported router by vue.
 */
import Vue from 'vue';
import Router from 'vue-router';

import {
  AlarmsAndLogsView, DetailedDeploymentView, DomainsView, ElementsView,
  HelpView, NewBundleView, NewDeploymentView, NewDomainView,
  NewHTTPEntrypointView, NewVolumeView, OverviewView, UserSettingsView,
  VolumesView
} from '../views';

Vue.use(Router);

export default new Router({
  mode: 'history',
  scrollBehavior: (to, from, savedPosition) => { return { x: 0, y: 0 }; },
  routes: [
    {
      path: '/overview',
      component: OverviewView
    },
    {
      path: '/deployment/:urn',
      component: DetailedDeploymentView
    },
    {
      path: '/elements',
      component: ElementsView
    },
    {
      path: '/domains',
      component: DomainsView
    },
    {
      path: '/volumes',
      component: VolumesView
    },
    {
      path: '/alarmsAndLogs',
      component: AlarmsAndLogsView
    },
    {
      path: '/help',
      component: HelpView
    },
    {
      path: '/addHTTPEntrypoint',
      component: NewHTTPEntrypointView
    },
    {
      path: '/addDeployment',
      component: NewDeploymentView
    },
    {
      path: '/addDomain',
      component: NewDomainView
    },
    {
      path: '/addPersistentVolume',
      component: NewVolumeView
    },
    {
      path: '/uploadbundle',
      component: NewBundleView
    },
    {
      path: '/userSettings',
      component: UserSettingsView
    },
    // If not found, go to main view
    { path: '*', redirect: '/overview' }
  ]
});
Vue.use(Router);