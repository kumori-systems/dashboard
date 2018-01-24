import Vue from 'vue';
import Router from 'vue-router';

import {
  AlarmsAndLogsView, DetailedDeploymentView, DomainsView, ElementsView,
  NewBundleView, NewDeploymentView, NewDomainView, NewHTTPEntrypointView,
  OverviewView, SignInView
} from '../views';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: '/',
  routes: [
    {
      path: '/overview',
      component: OverviewView
    },
    {
      path: '/deployment/:uri',
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
      component: null
    },
    {
      path: '/alarmsAndLogs',
      component: AlarmsAndLogsView
    },
    {
      path: '/help',
      component: null
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
      path: '/addVolume',
      component: null
    },
    {
      path: '/uploadbundle',
      component: NewBundleView
    },
    // Global redirect for 404
    { path: '*', redirect: '/overview' }
  ]
});
Vue.use(Router);