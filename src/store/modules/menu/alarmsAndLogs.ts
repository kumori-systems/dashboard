export default {
    name: 'ALARMS & LOGS',
    path: '/alarmsAndLogs',
    meta: {
        link: 'src/components/views/AlarmsAndLogs.vue',
        expanded: false
    },
    component: 'AlarmsAndLogs',
    childen: [
        {
            name: 'ALARMS',
            path: '/alarms',
            component: 'src/components/views/Alarms.vue',
            meta: {
                link: 'src/components/views/Alarms.vue'
            }
        }
    ]
};