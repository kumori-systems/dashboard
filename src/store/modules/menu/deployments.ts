export default {
    name: 'DEPLOYMENTS',
    path: '/deployments',
    meta: {
        link: 'src/components/views/Deployments.vue',
        expanded: true,
    },
    component: 'Deployments',
    children: [{
        name: 'Deployment1',
        path: 'Deployment1',
        component: 'DeploymentsItem',
        meta: {
            link: 'src/components/views/DeploymentsItem.vue',
        }
    }
    ]
};