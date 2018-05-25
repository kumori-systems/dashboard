let alerts = {
  success: 'alert-success',
  info: 'alert-info',
  warning: 'alert-warning',
  danger: 'alert-danger'
};

let modalProps = {
  roles: {
    id: 'modalRoles', icon: 'fa fa-tags', title: 'Roles'
  },
  channels: {
    id: 'modalChannels', icon: 'glyphicon glyphicon-transfer', title: 'Channels'
  },
  connectors: {
    id: 'modalConnectors', icon: 'fa fa-chain', title: 'Connectors'
  },
  runtimes: {
    id: 'modalRuntimes', icon: 'fa fa-dashboard', title: 'Runtime'
  },
  configuration: {
    id: 'modalConfiguration', icon: 'fa fa-gear', title: 'Configuration'
  },
  resources: {
    id: 'modalResources', icon: 'fa fa-cubes', title: 'Resources'
  },
  parameters: {
    id: 'modalParameters', icon: 'fa fa-sliders', title: 'Parameters'
  },
  arrangement: {
    id: 'modalArrangement', icon: 'fa fa-list', title: 'Arrangement'
  },
  runtimeDerived: {
    id: 'runtimeDerived', icon: 'glyphicon glyphicon-import', title: 'Derived'
  },
  runtimeSettings: {
    id: 'runtimeSettings', icon: 'glyphicon glyphicon-list-alt',
    title: 'Runtimes Settings'
  },
  runtimeMetadata: {
    id: 'runtimeMetadata', icon: 'glyphicon glyphicon-barcode',
    title: 'Metadata'
  },

};

let listTypes = {
  channel: {
    provides: 'ch-prov',
    requires: 'ch-req'
  },
  role: 'role',
  res: 'resource',
  connector: 'conn',
  arrangement: 'arrang',
  connectorList: {
    provided: 'connlist-prov',
    depended: 'connlist-dep'
  },
  component: {
    resources: 'c-resources',
    parameters: 'c-parameters'
  },
  deployment: {
    parameters: 'dep-params'
  },
  default: 'def'
};

let listProps = {
  'ch-prov': {
    target: '#' + modalProps.channels.id, icon: true, iconImg: 'fa-arrow-left',
    fullSize: '6', btnsSize: '4', channelType: 'provides',
    buttons: { edit: true, delete: true, save: false }, rowSelection: false
  },
  'ch-req': {
    target: '#' + modalProps.channels.id, icon: true, iconImg: 'fa-arrow-right',
    fullSize: '6', btnsSize: '4', channelType: 'requires',
    buttons: { edit: true, delete: true, save: false }, rowSelection: false
  },
  'role': {
    target: '#' + modalProps.roles.id, icon: false, fullSize: '8',
    btnsSize: '4', buttons: { edit: true, delete: true, save: false },
    rowSelection: false
  },
  'arrang': {
    target: '#' + modalProps.arrangement.id, icon: false, fullSize: '8',
    btnsSize: '4', buttons: { edit: true, delete: false, save: false },
    rowSelection: false
  },
  'dep-params': {
    target: '', icon: false, fullSize: '12', btnsSize: '0',
    buttons: { edit: false, delete: false, save: false }, rowSelection: true
  },
  'conn': {
    target: '', icon: false, fullSize: '8', btnsSize: '4',
    buttons: { edit: false, delete: true, save: false }, rowSelection: true
  },
  'connlist-prov': {
    target: '', icon: false, fullSize: '10', btnsSize: '2',
    buttons: { edit: false, delete: true, save: false }, rowSelection: false
  },
  'connlist-dep': {
    target: '', icon: false, fullSize: '10', btnsSize: '2',
    buttons: { edit: false, delete: true, save: false }, rowSelection: false
  },
  'c-resources': {
    target: '', icon: false, fullSize: '3', extraCol: '8', btnsSize: '1',
    buttons: { edit: false, delete: true, save: false }, rowSelection: false
  },
  'c-parameters': {
    target: '', icon: false, fullSize: '3', extraCol: '8', btnsSize: '1',
    buttons: { edit: false, delete: true, save: false }, rowSelection: false
  },
  'def': {
    target: '', icon: false, fullSize: '8', btnsSize: '4',
    buttons: { edit: true, delete: true, save: false }, rowSelection: false
  }
};

let inlineForms = {
  headers: {
    resource: ['Name', 'Type', 'DeployTag']
  },
  types: {
    resource: 'resource'
  },
  valueTypes: {
    text: 'text',
    input: 'input',
    select: 'select'
  }
};

let menuOptions = {
  service: [
    {
      id: 'service',
      name: 'menu.service.label',
      icon: 'fa fa-tasks',
      secondLevel: false
    },
    {
      id: 'roles',
      name: 'menu.roles.label',
      icon: 'fa fa-tags',
      secondLevel: true,
      add: {
        type: 'button',
        id: 'addRole',
        target: '#' + modalProps.roles.id,
        icon: 'glyphicon glyphicon-plus',
        fieldSize: 'col-sm-10'
      }
    },
    {
      id: 'channels',
      name: 'menu.channels.label',
      icon: 'glyphicon glyphicon-transfer',
      secondLevel: true,
      add: {
        type: 'button',
        id: 'addChannel',
        target: '#' + modalProps.channels.id,
        icon: 'glyphicon glyphicon-plus',
        fieldSize: 'col-sm-10'
      }
    },
    {
      id: 'connectors',
      name: 'menu.connectors.label',
      icon: 'fa fa-chain',
      clear: true,
      secondLevel: false,
      target: '#' + modalProps.connectors.id

    }
  ],
  component: [
    {
      id: 'component',
      name: 'menu.component.label',
      icon: 'glyphicon glyphicon-hdd ',
      secondLevel: false
    },
    {
      id: 'runtime',
      name: 'menu.runtime.label',
      icon: 'fa fa-dashboard',
      target: '#' + modalProps.runtimes.id,
      secondLevel: false
    },
    {
      id: 'channels',
      name: 'menu.channels.label',
      icon: 'glyphicon glyphicon-transfer',
      secondLevel: true,
      add: {
        type: 'button',
        id: 'addChannel',
        target: '#' + modalProps.channels.id,
        icon: 'glyphicon glyphicon-plus',
        fieldSize: 'col-sm-10'
      }
    },
    {
      id: 'config',
      name: 'menu.config.label',
      icon: 'fa fa-gear',
      target: '#' + modalProps.configuration.id,
      secondLevel: false,
    },
  ],
  deployments: [
    {
      id: 'deployment',
      name: 'menu.deployments.label',
      icon: 'fa fa-cloud-upload',
      secondLevel: true
    },
    {
      id: 'resources',
      name: 'menu.resources.label',
      icon: 'fa fa-cubes',
      target: '#' + modalProps.resources.id,
      secondLevel: false,
    }, {
      id: 'parameters',
      name: 'menu.parameters.label',
      icon: 'fa fa-sliders',
      target: '#' + modalProps.parameters.id,
      secondLevel: false,
    },
    {
      id: 'arrangements',
      name: 'menu.arrangements.label',
      icon: 'fa fa-list',
      secondLevel: true
    }
  ],
  resource: [
    {
      id: 'resource',
      name: 'menu.resource.label',
      icon: 'fa fa-cubes',
      secondLevel: true
    }, {
      id: 'parameters',
      name: 'menu.parameters.label',
      icon: 'fa fa-sliders',
      target: '#' + modalProps.parameters.id,
      secondLevel: false,
    }
  ],
  runtime: [
    {
      id: 'runtime',
      name: 'menu.runtime.label',
      icon: 'fa fa-dashboard',
      secondLevel: true
    },
    {
      id: 'derived',
      name: 'menu.runtime.derived',
      icon: 'glyphicon glyphicon-import',
      target: '#' + modalProps.runtimeDerived.id,
      secondLevel: false
    },
    {
      id: 'runsettings',
      name: 'menu.runtime.runsettings',
      icon: 'glyphicon glyphicon-list-alt',
      target: '#' + modalProps.runtimeSettings.id,
      secondLevel: false
    },

    {
      id: 'metadata',
      name: 'menu.runtime.metadata',
      icon: 'glyphicon glyphicon-barcode',
      target: '#' + modalProps.runtimeMetadata.id,
      secondLevel: false,
    }
  ],
  shared: [{
    id: 'ui',
    name: 'menu.settings.label',
    icon: 'fa fa-wrench ',
    secondLevel: true,
    enum: [{
      type: 'link',
      action: 'resetService',
      id: 'menu.settings.opt.changeServ',
      href: '#',
      fieldSize: 'col-sm-10'
    }]
  }
  ]

};

let version = '1_0_0';

let manifestStructure = {
  version: version,
  eslap: 'eslap://',
  domain: 'eslap.cloud',
  elementtype: {
    channel: {
      name: 'channel', label: 'Channel', enum: [
        {
          name: 'DUPLEX',
          eslap: 'eslap://eslap.cloud/channel/duplex/' + version,
          type: 'all'
        },
        {
          name: 'RECEIVE',
          eslap: 'eslap://eslap.cloud/channel/receive/' + version,
          type: 'requires'
        },
        {
          name: 'REPLY',
          eslap: 'eslap://eslap.cloud/channel/reply/' + version,
          type: 'provides'
        },
        {
          name: 'REQUEST',
          eslap: 'eslap://eslap.cloud/channel/request/' + version,
          type: 'requires'
        },
        {
          name: 'SEND',
          eslap: 'eslap://eslap.cloud/channel/send/' + version,
          type: 'provides'
        }
      ]
    },
    protocol: {
      name: 'protocol', label: 'Channel Protocol', enum: [
        {
          name: 'DEFAULT',
          eslap: 'eslap://eslap.cloud/protocol/message/http/' + version
        },
        {
          name: 'TCP',
          eslap: 'eslap://eslap.cloud/protocol/tcp/' + version
        },
        {
          name: 'HTTP_intern',
          eslap: 'eslap://eslap.cloud/protocol/message/http/' + version
        },
        {
          name: 'MESSAGE',
          eslap: 'eslap://eslap.cloud/protocol/message/' + version
        },
        {
          name: 'HTTP',
          eslap: 'eslap://eslap.cloud/protocol/tcp/http/' + version
        }
      ]
    },
    connector: {
      name: 'Connectors', label: 'Connectors', enum: [
        {
          name: 'COMPLETE',
          eslap: 'eslap://eslap.cloud/connector/complete/' + version
        },
        {
          name: 'LB',
          eslap: 'eslap://eslap.cloud/connector/loadbalancer/' + version
        },
        {
          name: 'PUBSUB',
          eslap: 'eslap://eslap.cloud/connector/pubsub/' + version
        }
      ]
    },
    parameter: {
      name: 'parameter', enum: [
        {
          name: 'boolean',
          eslap: 'eslap://eslap.cloud/parameter/boolean/' + version
        },
        {
          name: 'integer',
          eslap: 'eslap://eslap.cloud/parameter/integer/' + version
        },
        {
          name: 'json',
          eslap: 'eslap://eslap.cloud/parameter/json/' + version
        },
        {
          name: 'list',
          eslap: 'eslap://eslap.cloud/parameter/list/' + version
        },
        {
          name: 'number',
          eslap: 'eslap://eslap.cloud/parameter/number' + version
        },
        {
          name: 'string',
          eslap: 'eslap://eslap.cloud/parameter/string/' + version
        },
        {
          name: 'vhost',
          eslap: 'eslap://eslap.cloud/parameter/vhost/' + version
        }
      ]
    },
    resource: {
      name: 'resource', enum: [
        {
          name: 'Cert/Client',
          eslap: 'eslap://eslap.cloud/resource/cert/client/' + version
        },
        {
          name: 'Cert/Server',
          eslap: 'eslap://eslap.cloud/resource/cert/server/' + version
        },
        {
          name: 'Faultgroups',
          eslap: 'eslap://eslap.cloud/resource/faultgroups/' + version
        },
        {
          name: 'VHost',
          eslap: 'eslap://eslap.cloud/resource/vhost/' + version
        },
        {
          name: 'Volume/Persistent',
          eslap: 'eslap://eslap.cloud/resource/volume/persistent/' + version
        },
        {
          name: 'Volume/Volatile',
          eslap: 'eslap://eslap.cloud/resource/volume/volatile/' + version
        }
      ]
    },
    service: { name: 'service' },
    component: { name: 'component' },
    runtime: {
      name: 'runtime',
      enum: [
        { eslap: 'eslap://eslap.cloud/runtime/java/1_0_1' },
        { eslap: 'eslap://eslap.cloud/runtime/java/1_1_1' },
        { eslap: 'eslap://eslap.cloud/runtime/native/1_0_1' },
        { eslap: 'eslap://eslap.cloud/runtime/native/1_1_1' },
        { eslap: 'eslap://eslap.cloud/runtime/native/2_0_0' },
        { eslap: 'eslap://eslap.cloud/runtime/native/dev/privileged/2_0_0' },
        { eslap: 'eslap://c2netproject.eu/runtime/nodejs/1_0_0' },
        { eslap: 'eslap://c2netproject.eu/runtime/nodejs/1_0_2' },
        { eslap: 'eslap://c2netproject.eu/runtime/mariadb/1_0_2' },
        { eslap: 'eslap://linagora.c2netproject.eu/runtime/ucp/1_0_0' },
        { eslap: 'eslap://linagora.c2netproject.eu/runtime/ucp/1_0_4' },
        { eslap: 'eslap://c2netproject.eu/runtime/java/1_0_0' },
        { eslap: 'eslap://c2netproject.eu/runtime/java/1_0_2' },
        { eslap: 'eslap://slapdomain/runtimes/managed/nodejs/0_0_1' }

      ]
    },
    arrangements: {
      types: {
        __instances: { type: 'integer', default: 1 },
        __cpu: { type: 'integer', default: 1 },
        __memory: { type: 'integer', default: 1 },
        __ioperf: { type: 'integer', default: 1 },
        __iopsintensive: { type: 'boolean', default: false },
        __bandwidth: { type: 'integer', default: 1 },
        __resilience: { type: 'integer', default: 1 },
        __maxinstances: { type: 'integer', default: 1 }
      },
      main_enum: [
        '__instances',
        '__cpu',
        '__memory',
        '__ioperf',
        '__iopsintensive',
        '__bandwidth',
        '__resilience'
      ],
      opt_enum:
        ['__maxinstances']

    },


  }
};

let resourceFields = {
  // CERT 
  content: { type: 'json', default: null, computed: null },

  // VHOST
  vhost: { type: 'string', default: null, computed: null },

  // VOLUME
  size: { type: 'string', default: null, computed: null },
  prefix: { type: 'string', default: null, computed: null },
  mountpoint: { type: 'string', default: null, computed: true },
  best_effort: { type: 'boolean', default: false, computed: null },
  follows_instance: { type: 'boolean', default: false, computed: null },

  // FAULTGROUPS
  number: { type: 'integer', default: 1, computed: null }

};

export default {
  alerts,
  modalProps,
  listTypes,
  listProps,
  inlineForms,
  menuOptions,
  manifestStructure,
  resourceFields

};