export enum state { NORMAL, WARNING, ERROR };

export class StampState {
    deployedServices: {
        [index: string]: Deployment
    };
    deployedInstances: {
        [index: string]: {
            cnId: string;
        }
    };
    allocatedNodes: {
        [index: string]: {
            initialResources: {
                disk: number;
                bandwidth: number;
                memory: number;
                cpu: number;
            };
            size: string;
            id: string;
            publicIp: string;
            privateIp: string;
            subnet: string;
            net: string;
            zone: string;
            imageId: string;
            tags: {
                slap: string;
                name: string;
            }
        }
    };
    linkedServices: Array<{
        deployment1: string;
        channel1: string;
        deployment2: string;
        channel2: string;
    }>;
}

export class Deployment {
    manifest: Manifest;
    instanceList: {
        [index: string]: {
            incnum: number;
            component: string;
            cnsocket: string;
            cnid: string;
            connected: boolean;
        }
    };
    involvedCNs: any;
}

export class Manifest {
    owner: string;
    components: { [index: string]: any };
    service: Service;
    versions: { [index: string]: Version };
    SLA: string;
    arrangement: {};
    runtimes: {};
    resources: {};
    spec: string;
    servicename: string;
    name: string;
    interconnection: boolean;
    entrypoints: {};
    'components-configuration': {};
    'components-resources': {};
    configuration: {};
}

export class Service {
    configuration_spread: any;
    defaults: any;
    configuration: any;
    connectors: Array<{
        providers: Array<{
            channel: string,
            component: string
        }>;
        dependents: Array<{
            channel: string
        }>;
        type: string;
    }>;
    components: {
        [key: string]: string
    };
    name: string;
    spec: string;
}

export class Version {
    owner: string;
    'components-resources': {
        __service: any;
    };
    'components-configuration': {
        [index: string]: any
    };
    resources: any;
    runtimes: {
        [index: string]: {
            name: string;
            spec: string;
        }
    };
    spec: string;
    servicename: string;
    interconnection: boolean;
    configuration: any;

    name: string;
    service: any;
    components: any;
}

export class Rol {
    resources: {
        __resilience: number;
        __bandwidth: number;
        __iopsintensive: boolean;
        __ioperf: number;
        __memory: number;
        __cpu: number;
        __instances: number;
    };
}