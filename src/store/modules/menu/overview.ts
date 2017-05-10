import { Overview, DeploymentItem } from '../../../components';

export default {
    name: 'OVERVIEW',
    path: '/',
    component: Overview,
    children: [
        {
            path: '/deployments/:deploymentId', name: 'deploymentId', component: DeploymentItem,
            props: true
        }
    ]
};