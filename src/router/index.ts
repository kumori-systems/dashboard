import Vue from 'vue';
import Router from 'vue-router';
import { Overview, DeploymentItem, Elements, WebDomains, DataVolumes, AlarmsAndLogs, Help } from '../components';

import NewHTTPEntrypoint from '../components/views/innerComponents/form/NewHTTPEntrypoint.vue';
import NewWebService from '../components/views/innerComponents/form/NewWebService.vue';
import NewWebServiceAdvanced from '../components/views/innerComponents/form/NewWebServiceAdvanced.vue';
import AddVolume from '../components/views/innerComponents/form/AddVolume.vue';
import NewBundle from '../components/views/innerComponents/form/NewBundle.vue';

import r from '../menu';

Vue.use(Router);

// No queda más remedio que hacer una copia del array para que no se añadan al menú
let routes = [];
for (let index in r)
  routes.push(r[index]);

/* Añadimos elementos que no deberían de estar en el menú */
// Buscamos componente overview y le  añadimos los children (para poder enrutar los distintos deployment)
let overview = routes.find(route => { return route.name === 'OVERVIEW'; });
overview['children'] = [
  {
    path: 'deployments\:deploymentRoute', name: ' ', component: DeploymentItem,
    meta: { id: null },
    props: true
  }
];

// Añadimos las vistas para creacion de..
routes.push({
  name: 'New HTTP Entrypoint',
  path: '/newHTTPEntrypoint',
  meta: { expanded: false },
  component: NewHTTPEntrypoint
});

routes.push({
  name: 'New Web Service',
  path: '/newWebService',
  meta: { expanded: false },
  component: NewWebService
});

routes.push({
  name: 'New Web Service (Advanced)',
  path: '/newWebServiceAdvanced',
  meta: { expanded: false },
  component: NewWebServiceAdvanced
});

routes.push({
  name: 'New Element',
  path: '/newBundle',
  meta: { expanded: false },
  component: NewBundle
});

export default new Router({
  'routes': routes
});
