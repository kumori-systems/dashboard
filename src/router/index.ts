import Vue from 'vue';
import Router from 'vue-router';
import { Overview, Deployments, DeploymentItem, Elements, WebDomains, DataVolumes, AlarmsAndLogs, Help } from '../components';
import { routes as rou } from '../store/modules/menu';

Vue.use(Router);

export default new Router({
  routes: rou
});
