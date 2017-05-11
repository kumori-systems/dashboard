import { Overview, DeploymentItem, AlarmsAndLogs, DataVolumes, Elements, Help, WebDomains } from '../components';

export default [
    {
        name: 'OVERVIEW',
        path: '/',
        meta: { expanded: false },
        component: Overview,
        children: [
            {
                path: 'deployments_:deploymentRoute', name: 'deploymentId', component: DeploymentItem,
                props: true
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
    }
];
