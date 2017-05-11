import Vue from 'vue';
import Router from 'vue-router';
import { Overview, Deployments, DeploymentItem, Elements, WebDomains, DataVolumes, AlarmsAndLogs, Help } from '../components';
import routes from '../menu';

Vue.use(Router);

export default new Router({
  'routes': routes
});
