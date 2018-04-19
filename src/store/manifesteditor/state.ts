import webSettings from './settings';

/**
 * Representation of the stamp state.
 */
export default class State {
  temporalManifest: any;
  mDependencies: any;
  confirm: { accept: any, deny: any };
  alerts: any[];
  graph: {};
  showAlertPan: boolean;
  Settings: any;
  socket: any;
  manifestList: any[];
  currentManifest: string;
  clearModals: boolean;

  // DEPLOYMENT
  deploymentState: {
    name: string,
    service: string,
    arrangements: any,
    resources: any,
    parameters: any,
    paramsList: any[],
    charts: any,
    colorsData: any,
    validation: {
      name: { err: boolean, msg: string }
    },
    resValidation: any,
    paramValidation: any,
    arrValidation: any,
    updater: boolean
  };

  currentArrangement: string;

  // SERVICE 
  currentRole: number;
  currentConnector: number;
  roleState: {
    role: { name: string, component: string, resources: any[] },
    validation: {
      name: { err: boolean, msg: string },
      component: { err: boolean, msg: string },
    },
    resourceValidation: {},
    updater: boolean,
    valid: boolean
  };

  channelState: {
    channel: {
      index: number, inout: string,
      data: { name: string, type: string, protocol: string }
    },
    validation: {
      name: { err: boolean, msg: string },
      type: { err: boolean, msg: string },
      protocol: { err: boolean, msg: string }
    },
    updater: boolean,
    valid: boolean
  };

  serviceState: {
    name: {
      domain: string,
      name: string,
      version: string
    },
    validation: {
      domain: { err: boolean, msg: string },
      name: { err: boolean, msg: string },
      version: { err: boolean, msg: string }
    },
    updater: boolean
  };


  // COMPONENT
  componentState: {
    name: {
      domain: string,
      name: string,
      version: string
    },
    runtime: string,
    validation: {
      runtime: { err: boolean, msg: string },

    },
    updater: boolean
  };

  configurationState: {
    pname: string,
    rname: string,
    resources: any[],
    parameters: any[],
    validation: {
      pname: { err: boolean, msg: string },
      rname: { err: boolean, msg: string }
    },
    updater: boolean
  };


  // RESOURCE 
  resourceState: {
    name: {
      domain: string,
      name: string,
      type: string,
      version: string
    },
    parameters: any,
    validation: {
      domain: { err: boolean, msg: string },
      name: { err: boolean, msg: string },
      type: { err: boolean, msg: string },
      version: { err: boolean, msg: string }

    },
    updater: boolean
  };

  // RUNTIME
  runtimeState: {
    name: {
      domain: string,
      name: string,
      version: string
    },
    validation: {
      domain: { err: boolean, msg: string },
      name: { err: boolean, msg: string },
      version: { err: boolean, msg: string }
    },
    updater: boolean
  };

  /** Constructor of the state. */
  constructor() {
    this.temporalManifest = null;
    this.mDependencies = {};
    this.confirm = {
      accept: null,
      deny: null
    };
    this.alerts = [];
    this.graph = {};
    this.showAlertPan = false;
    this.Settings = webSettings;
    this.socket = null;
    this.manifestList = [];
    this.currentManifest = '';
    this.clearModals = false;

    // DEPLOYMENT
    this.deploymentState = {
      name: '',
      service: '',
      arrangements: {},
      resources: {},
      parameters: {},
      paramsList: [],
      charts: {},
      colorsData: {},
      validation: {
        name: { err: false, msg: '' }
      },
      resValidation: {
      },
      paramValidation: {
      },
      arrValidation: {
      },
      updater: false
    };

    this.currentArrangement = '';

    // SERVICE 
    this.currentRole = -1;
    this.currentConnector = -1;
    this.roleState = {
      role: { name: '', component: '', resources: [] },
      validation: {
        name: { err: false, msg: '' },
        component: { err: false, msg: '' },
      },
      resourceValidation: {},
      updater: false,
      valid: true
    };

    this.channelState = {
      channel: {
        index: -1,
        inout: 'provides',
        data: { name: '', type: '', protocol: '' }
      },
      validation: {
        name: { err: false, msg: '' },
        type: { err: false, msg: '' },
        protocol: { err: false, msg: '' }
      },
      updater: false,
      valid: true
    };

    this.serviceState = {
      name: {
        domain: '',
        name: '',
        version: ''
      },
      validation: {
        domain: { err: false, msg: '' },
        name: { err: false, msg: '' },
        version: { err: false, msg: '' }
      },
      updater: false,
    };

    // COMPONENT
    this.componentState = {
      name: {
        domain: '',
        name: '',
        version: ''
      },
      runtime: '',
      validation: {
        runtime: { err: false, msg: '' },
      },
      updater: false
    };

    this.configurationState = {
      pname: '',
      rname: '',
      resources: [],
      parameters: [],
      validation: {
        pname: { err: false, msg: '' },
        rname: { err: false, msg: '' }
      },
      updater: false
    };

    // RESOURCE 
    this.resourceState = {
      name: {
        domain: '',
        name: '',
        type: '',
        version: ''
      },
      parameters: {},
      validation: {
        domain: { err: false, msg: '' },
        name: { err: false, msg: '' },
        type: { err: false, msg: '' },
        version: { err: false, msg: '' }

      },
      updater: false
    };

    // RUNTIME
    this.runtimeState = {
      name: {
        domain: '',
        name: '',
        version: ''
      },
      validation: {
        domain: { err: false, msg: '' },
        name: { err: false, msg: '' },
        version: { err: false, msg: '' }

      },
      updater: false
    };

  }
}