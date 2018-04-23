import Vuex from "vuex";
import State from "./state";
import { tools } from "./utils";
import {
  getElementDomain,
  getElementName,
  getElementVersion,
  getElementType,
  getResourceType
} from "../../api/utils";

import FileSaver from "file-saver";

const maniAPI = {
  callback: (injectee, todo) => {
    for (let mutation of todo) {
      if (mutation.manifests) {
        // add manifests to parameters
        mutation.params["manifests"] = mutation.manifests;
      }

      injectee.commit(mutation.name, mutation.params);
    }
  },
  socket: null,
  setSocket: (url, injectee) => {
    maniAPI.socket = io.connect(url, { forceNew: true });
    maniAPI.socket.on("status", function(data) {
      injectee.commit("resetAlerts");
      maniAPI.getManifests(injectee);
    });
  },
  POST: (url, data, injectee, actions) => {
    console.debug("POST has been called with", url, data);

    injectee
      .dispatch("updateTemporalManifest", {
        [data.jsonPath]: data.data
      })
      .then(() => {
        maniAPI.callback(injectee, actions.success);
      });
  },
  GET: (url, injectee, callback) => {
    console.debug("THE GET METHOD HAS BEEN CALLED");
    switch (url) {
      case "/getmanifests":
        callback(injectee, injectee.getters.registries);

        break;
      default:
        console.error("Not expected url in manifest editor", url);
    }
    /*
    Vue.http.get(url).then(
      response => {
        if (response.status === 200) {
          callback(injectee, response);
        }
        else {
          injectee.dispatch('addAlert', { text: 'cantread' });
          injectee.dispatch('resetService');
        }
      },
      response => {
        injectee.dispatch('addAlert', { text: 'cantread' });
        injectee.dispatch('resetService');
      }
    );
    */
  },
  updateManifest: (data, path, injectee, actions) => {
    let currentManifest = injectee.state.currentManifest;
    console.debug("El manifiesto actual es", currentManifest);
    let manifest = injectee.getters.manifests[currentManifest];

    maniAPI.POST(
      "/updatemanifest",
      maniAPI.makeParams(data, path, manifest),
      injectee,
      actions
    );

    console.debug("ACTUALIZAMOS EL MANIFIESTO", manifest);
  },
  getManifests: injectee => {
    maniAPI.GET("/getmanifests", injectee, maniAPI.manageRes);
    console.debug("GET MANIFETS HAS BEEN CALLED!!");
  },
  getGraph: (data, injectee) => {
    let url = "/getgraph?service=" + data;
    maniAPI.GET(url, injectee, maniAPI.manageRes);
    console.debug("GET GRAPH HAS BEEN CALLED!!");
  },
  makeParams: (data, path, file) => {
    return { data: data, path: file.filePath, jsonPath: path };
  },
  manageRes: (injectee, response) => {
    let res = JSON.parse(response.bodyText);
    if (res.status === 200) injectee.dispatch("setState", res.data);
    if (res.status === 201) injectee.dispatch("setServs", res.data);
    if (res.status === 500) {
      injectee.dispatch("resetService");
      res.path = res.path !== undefined ? res.path : "";
      injectee.dispatch("addAlert", { text: res.error, extra: res.path });
    }
  }
};

/**
 * Actions to handle the representation of the stamp state easier.
 */
export default class Actions implements Vuex.ActionTree<State, any> {
  [name: string]: Vuex.Action<State, any>;

  setState = (injectee: Vuex.ActionContext<State, any>, payload: any): void => {
    injectee.commit("setState", payload);
  };

  startConnection = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    maniAPI.getManifests(injectee);
    maniAPI.setSocket("/", injectee);
  };

  downloadTemporalManifest = (
    injectee: Vuex.ActionContext<State, any>,
    payload: { [param: string]: any }
  ): void => {
    /*
      In the case the temporal manifest havent been modified, the requested
      manifest should be downloaded.
    */
    if (!injectee.state.temporalManifest) {
      injectee.commit("updateTemporalManifest", {
        manifests: injectee.getters.manifests
      });
    }

    let temporalManifest = injectee.state.temporalManifest;
    // Stores the temporal manifest in a local file
    FileSaver.saveAs(
      new Blob([JSON.stringify(temporalManifest, null, 2) + "\n"], {
        type: "application/json;charset=utf-8"
      }),
      "TemporalManifest.json"
    );
  };

  updateTemporalManifest = (
    injectee: Vuex.ActionContext<State, any>,
    payload: { [param: string]: any }
  ): void => {
    injectee.commit("updateTemporalManifest", {
      manifests: injectee.getters.manifests,
      ...payload
    });
  };

  deleteAlert = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    injectee.commit("deleteAlert", payload);
  };

  alertResult = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    injectee.commit("displayAlertPan", false);
    if (payload) {
      injectee.state.confirm.accept();
    } else {
      injectee.state.confirm.deny();
    }
  };

  addAlert = (injectee: Vuex.ActionContext<State, any>, payload: any): void => {
    payload.extra = payload.extra !== undefined ? payload.extra : "";
    injectee.commit("addAlert", {
      text: payload.text,
      type: injectee.state.Settings.alerts.danger,
      extra: payload.extra
    });
  };

  clearModals = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    injectee.commit("clearModals", payload);
  };

  // DEPLOYMENT
  setDeploymentState = (injectee: Vuex.ActionContext<State, any>): void => {
    let deploy = injectee.getters.manifests[injectee.state.currentManifest];

    let serviceName = {
      name: getElementName(deploy.servicename),
      domain: getElementDomain(deploy.servicename),
      version: getElementVersion(deploy.servicename)
    };

    console.debug("The manifest contains", deploy);
    let resources = deploy.configuration ? deploy.configuration.resources : {};
    let parameters = deploy.configuration
      ? deploy.configuration.parameters
      : {};

    injectee.commit("updateDeployState", { key: "name", value: deploy.name });

    injectee.commit("updateDeployState", {
      key: "service",
      value: serviceName
    });

    injectee.commit("updateDeployState", {
      key: "resources",
      value: resources
    });

    injectee.commit("updateDeployState", {
      key: "parameters",
      value: parameters
    });

    if (deploy.interconnection) {
      injectee.commit("updateDeployState", {
        key: "interconnection",
        value: deploy.interconnection
      });
    } else {
      injectee.commit("updateDeployState", {
        key: "interconnection",
        value: null
      });
    }

    //  DEPLOY - RESOURCES
    injectee.commit(
      "deleteValidation",
      injectee.state.deploymentState.resValidation
    );

    for (let key in resources) {
      injectee.commit("updateDeployResState", {
        key: key,
        value: resources[key]
      });
      injectee.commit("setValidation", {
        validation: injectee.state.deploymentState.resValidation,
        prop: key,
        msg: ""
      });
    }

    injectee.dispatch("validateDeployRes");
    injectee.commit("setDeploymentParams", {
      manifests: injectee.getters.manifests
    });
  };

  validateDeployRes = (injectee: Vuex.ActionContext<State, any>): void => {
    if (injectee.state.currentManifest) {
      let deploy = injectee.getters.manifests[injectee.state.currentManifest];
      let service = injectee.getters.manifests[deploy.servicename];
      let userState = injectee.state.deploymentState.resources;
      for (let x in userState) {
        if (userState[x].length > 0) {
          let res = injectee.getters.manifests[userState[x]];
          if (res === undefined)
            injectee.commit("setErrValidation", {
              validation: injectee.state.deploymentState.resValidation,
              prop: x,
              msg: "manifest404"
            });
          else {
            let sres = service.configuration.resources.filter(elem => {
              return elem.name === x;
            });
            if (sres.length > 0) {
              if (res.spec !== sres[0].type)
                injectee.commit("setErrValidation", {
                  validation: injectee.state.deploymentState.resValidation,
                  prop: x,
                  msg: "invalidType"
                });
            }
          }
        } else {
          injectee.commit("setErrValidation", {
            validation: injectee.state.deploymentState.resValidation,
            prop: x,
            msg: "empty"
          });
        }
      }
    }
  };

  updateDeployState = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let validation = injectee.state.deploymentState.validation;
    injectee.commit("updateDeployState", payload);
    injectee.commit("updateValidation", {
      validation: validation,
      prop: payload.key,
      type: "deployment",
      value: payload.value
    });
    if (!injectee.state.deploymentState.validation.name.err) {
      maniAPI.updateManifest(payload.value, "name", injectee, {
        success: [],
        failure: []
      });
    }
  };

  updateDeployParamState = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let validation = injectee.state.deploymentState.paramValidation;
    let key = payload.role + payload.name;
    injectee.commit("updateDeployParamState", {
      key: key,
      value: payload.value
    });
    injectee.commit("resetValidation", { validation: validation, key: key });
    injectee.commit("updateValidationType", {
      validation: validation,
      prop: key,
      type: payload.type,
      value: payload.value
    });

    if (!validation[key].err) {
      let path = "configuration.parameters.";
      if (payload.role.length > 0) path = path + payload.role + ".";
      path = path + payload.name;

      switch (payload.type) {
        case "number":
        case "integer":
          payload.value = payload.value * 1;
          break;
        case "vhost":
        case "list":
        case "json":
          payload.value = JSON.parse(payload.value);
          break;

        default:
          break;
      }
      maniAPI.updateManifest(payload.value, path, injectee, {
        success: [],
        failure: []
      });
    }
  };

  updateDeployResState = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    injectee.commit("updateDeployResState", payload);
    injectee.commit(
      "resetAllValidation",
      injectee.state.deploymentState.resValidation
    );
    injectee.dispatch("validateDeployRes");

    let path = "configuration.resources." + payload.key;
    maniAPI.updateManifest(payload.value, path, injectee, {
      success: [],
      failure: []
    });
  };

  setArrangement = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    injectee.commit("setArrangement", {
      payload: payload,
      manifests: injectee.getters.manifests
    });
    injectee.dispatch("validateArrangements");
  };

  validateArrangements = (injectee: Vuex.ActionContext<State, any>): void => {
    let arrangements = injectee.state.deploymentState.arrangements;
    Object.keys(arrangements).filter(x => {
      injectee.commit("updateValidation", {
        type: "arrangements",
        prop: x,
        value: arrangements[x].toString(),
        validation: injectee.state.deploymentState.arrValidation
      });
    });
  };

  updateArrangementState = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let validation = injectee.state.deploymentState.arrValidation;

    injectee.commit("updateArrangementState", payload);
    injectee.commit("resetValidation", {
      key: payload.key,
      validation: validation
    });
    injectee.commit("updateValidation", {
      type: "arrangements",
      prop: payload.key,
      value: payload.value.toString(),
      validation: validation
    });
    if (!validation[payload.key].err) {
      payload.value = tools.parseType(
        payload.value,
        injectee.state.Settings.manifestStructure.elementtype.arrangements
          .types[payload.key].type
      );
      let path = "roles." + injectee.state.currentArrangement + ".resources";
      let resources = Object.assign(
        {},
        injectee.getters.manifests[injectee.state.currentManifest].roles[
          injectee.state.currentArrangement
        ].resources
      );
      resources[payload.key] = payload.value;

      maniAPI.updateManifest(resources, path, injectee, {
        success: [
          {
            name: "updateArrangement",
            params: resources
          }
        ],
        failure: []
      });
    }
  };

  delteArrangement = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let path = "roles." + injectee.state.currentArrangement + ".resources";
    let resources = Object.assign(
      {},
      injectee.getters.manifests[injectee.state.currentManifest].roles[
        injectee.state.currentArrangement
      ].resources
    );
    delete resources[payload];

    maniAPI.updateManifest(resources, path, injectee, {
      success: [
        { name: "updateArrangement", params: resources },
        { name: "deleteArrangementState", params: payload }
      ],
      failure: []
    });
  };

  addArrangement = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let validation = injectee.state.deploymentState.arrValidation;
    let path = "roles." + injectee.state.currentArrangement + ".resources";
    let resources = Object.assign(
      {},
      injectee.getters.manifests[injectee.state.currentManifest].roles[
        injectee.state.currentArrangement
      ].resources
    );

    resources[payload] =
      injectee.state.Settings.manifestStructure.elementtype.arrangements.types[
        payload
      ].default;
    let success = [
      {
        name: "updateArrangementState",
        params: {
          key: payload,
          value: resources[payload]
        }
      },
      {
        name: "updateValidation",
        params: {
          type: "arrangements",
          prop: payload,
          value: resources[payload].toString(),
          validation: validation
        }
      }
    ];
    maniAPI.updateManifest(resources, path, injectee, {
      success: success,
      failure: []
    });
  };

  setDeployCharts = (injectee: Vuex.ActionContext<State, any>): void => {
    let colorsData = injectee.state.deploymentState.colorsData;

    let setColor = (colors, key) => {
      let color;
      if (colorsData[key]) {
        color = colorsData[key];
      } else {
        color = "#" + Math.floor(Math.random() * 16777215).toString(16);
        while (colors.indexOf(color) > -1 || color.length < 7) {
          color = "#" + Math.floor(Math.random() * 16777215).toString(16);
        }
        colorsData[key] = color;
      }
      colors.push(color);
    };

    let charts = {
      instances: {
        id: "instances",
        data: [],
        colors: [],
        resize: true
      },
      cpu: {
        id: "cpu",
        data: [],
        colors: [],
        resize: true
      },
      memory: {
        id: "memory",
        data: [],
        colors: [],
        resize: true
      },
      resume: {
        id: "resume",
        data: [],
        colors: [],
        resize: true,
        xkey: "prop",
        ykeys: '["val"]',
        grid: "true"
      }
    };

    let totales = {
      instances: 0,
      cpu: 0,
      memory: 0
    };

    let currentManifest = injectee.state.currentManifest;
    if (currentManifest) {
      let roles = injectee.getters.manifests[currentManifest].roles;

      for (let key in roles) {
        charts.instances.data.push({
          label: key,
          value: roles[key].arrangement.instances
        });

        setColor(charts.instances.colors, key);

        charts.cpu.data.push({
          label: key,
          value: roles[key].arrangement.cpu
        });
        setColor(charts.cpu.colors, key);
        charts.memory.data.push({
          label: key,
          value: roles[key].arrangement.memory
        });
        setColor(charts.memory.colors, key);

        totales.instances += roles[key].arrangement.instances;
        totales.cpu += roles[key].arrangement.cpu;
        totales.memory += roles[key].arrangement.memory;
      }

      Object.keys(totales).map(key => {
        charts.resume.data.push({ prop: key, val: totales[key] });
      });

      injectee.commit("setDeployCharts", charts);
    }
  };

  // COMPONENTS
  setComponentState = (injectee: Vuex.ActionContext<State, any>): void => {
    let component = injectee.getters.manifests[injectee.state.currentManifest];
    injectee.commit("updateCompState", {
      key: "runtime",
      value: component.runtime
    });
    injectee.commit("updateConfState", {
      key: "resources",
      value: component.configuration.resources
    });
    injectee.commit("updateConfState", {
      key: "parameters",
      value: component.configuration.parameters
    });

    let validation = injectee.state.componentState.validation;
    console.debug("La validacion del componente vale", validation);
    injectee.commit("updateAllValidation", {
      type: "component",
      data: component,
      currState: injectee.state.componentState
    });
    if (
      injectee.state.Settings.manifestStructure.elementtype.runtime.enum.filter(
        x => {
          return x.eslap === component.runtime;
        }
      ).length === 0
    ) {
      injectee.commit("setErrValidation", {
        validation: validation,
        prop: "runtime",
        msg: "wrongruntime"
      });
    }
  };

  updateComponentState = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    console.debug("UpdateComponentState with:", payload);

    injectee.commit("updateCompState", payload);
    let component = injectee.getters.manifests[injectee.state.currentManifest];

    let path = "";
    let success = [];
    if ((payload.key = "runtime")) {
      path = payload.key;
      success.push({
        name: "setComponentRuntime",
        params: {
          value: payload.value,
          manifests: injectee.getters.manifests
        }
      });
    }

    injectee.commit("updateAllValidation", {
      type: "component",
      data: component,
      currState: injectee.state.componentState
    });

    maniAPI.updateManifest(payload.value, path, injectee, {
      success: success,
      failure: []
    });
  };

  updateConfigState = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let component = injectee.getters.manifests[injectee.state.currentManifest];
    injectee.commit("updateConfigState", payload);
    injectee.commit("resetValidation", {
      key: payload.key,
      validation: injectee.state.configurationState.validation
    });
    if (
      payload.key === "rname" &&
      component.configuration.resources.filter(x => {
        return x.name === payload.value;
      }).length > 0
    )
      injectee.commit("setErrValidation", {
        validation: injectee.state.configurationState.validation,
        prop: "rname",
        msg: "dupname"
      });
    if (
      payload.key === "pname" &&
      component.configuration.parameters.filter(x => {
        return x.name === payload.value;
      }).length > 0
    ) {
      injectee.commit("setErrValidation", {
        validation: injectee.state.configurationState.validation,
        prop: "pname",
        msg: "dupname"
      });
    }
  };

  addComponentResource = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let component = injectee.getters.manifests[injectee.state.currentManifest];
    injectee.commit("updateValidation", {
      type: "configuration",
      prop: "rname",
      value: payload.name,
      validation: injectee.state.configurationState.validation
    });

    if (
      component.configuration.resources.filter(x => {
        return x.name === payload.name;
      }).length > 0
    ) {
      injectee.commit("setErrValidation", {
        validation: injectee.state.configurationState.validation,
        prop: "rname",
        msg: "dupname"
      });
    }

    if (!injectee.state.configurationState.validation.rname.err) {
      let resources = component.configuration.resources.slice();
      resources.push(payload);

      maniAPI.updateManifest(resources, "configuration.resources", injectee, {
        success: [
          {
            name: "setComponentResources",
            params: resources,
            manifests: injectee.getters.manifests
          },
          {
            name: "updateConfigState",
            params: {
              key: "resources",
              value: resources
            }
          },
          {
            name: "updateConfigState",
            params: {
              key: "rname",
              value: ""
            }
          }
        ],
        failure: []
      });
    }
  };

  addComponentParameter = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let component = injectee.getters.manifests[injectee.state.currentManifest];
    injectee.commit("updateValidation", {
      type: "configuration",
      prop: "pname",
      value: payload.name,
      validation: injectee.state.configurationState.validation
    });
    if (
      component.configuration.parameters.filter(x => {
        return x.name === payload.name;
      }).length > 0
    )
      injectee.commit("setErrValidation", {
        validation: injectee.state.configurationState.validation,
        prop: "pname",
        msg: "dupname"
      });

    if (!injectee.state.configurationState.validation.pname.err) {
      let parameters = component.configuration.parameters.slice();
      parameters.push(payload);

      maniAPI.updateManifest(parameters, "configuration.parameters", injectee, {
        success: [
          {
            name: "setComponentParameters",
            params: parameters,
            manifests: injectee.getters.manifests
          },
          {
            name: "updateConfigState",
            params: {
              key: "parameters",
              value: parameters
            }
          },
          {
            name: "updateConfigState",
            params: {
              key: "pname",
              value: ""
            }
          }
        ],
        failure: []
      });
    }
  };

  deleteComponentResource = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let component = injectee.getters.manifests[injectee.state.currentManifest];
    let resources = component.configuration.resources.slice();
    resources.splice(payload.index, 1);
    maniAPI.updateManifest(resources, "configuration.resources", injectee, {
      success: [
        {
          name: "setComponentResources",
          params: resources,
          manifests: injectee.getters.manifests
        },
        {
          name: "updateConfigState",
          params: {
            key: "resources",
            value: resources
          }
        }
      ],
      failure: []
    });
  };

  deleteComponentParameter = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let component = injectee.getters.manifests[injectee.state.currentManifest];
    let parameters = component.configuration.parameters.slice();
    parameters.splice(payload.index, 1);
    maniAPI.updateManifest(parameters, "configuration.parameters", injectee, {
      success: [
        {
          name: "setComponentParameters",
          params: parameters,
          manifests: injectee.getters.manifests
        },
        {
          name: "updateConfigState",
          params: {
            key: "parameters",
            value: parameters
          }
        }
      ],
      failure: []
    });
  };

  // SERVICE
  resetService = (injectee: Vuex.ActionContext<State, any>): void => {
    injectee.commit("clearModals", true);
    injectee.commit("setManifest", "");
  };

  setServs = (injectee: Vuex.ActionContext<State, any>, payload: any): void => {
    if (payload && Object.keys(payload).length) {
      injectee.commit(
        "setServs",
        Object.keys(payload).map(function(key, index) {
          return {
            value: key,
            label: key,
            type: payload[key].type,
            id: index
          };
        })
      );
    }

    let services = [];
    Object.keys(payload).map(function(key, index) {
      if (payload[key].type === "service") {
        services.push(payload[key]);
      }
      return true;
    });

    let mDependencies = {};
    for (let serv of services) {
      for (let role of serv.roles)
        if (role.component) mDependencies[role.component] = serv.name;
    }

    injectee.commit("setDependencies", mDependencies);
    injectee.dispatch("setState", payload);

    if (injectee.state.currentManifest.length > 0) {
      if (payload[injectee.state.currentManifest] !== undefined) {
        injectee.dispatch("setManifest", injectee.state.currentManifest);
      } else {
        injectee.commit("setManifest", "");
      }
    } else {
      injectee.commit("setManifest", "");
    }
  };

  setManifest = (
    injectee: Vuex.ActionContext<State, any>,
    manifestURN: string
  ): void => {
    injectee.commit("clearTemporalManifest");

    injectee.commit("setManifest", manifestURN);
    let service = injectee.getters.manifests[manifestURN];
    let state = null;

    switch (service.type) {
      case "service":
        state = injectee.state.serviceState;
        injectee.commit("resetConnector", injectee.getters.manifests);
        break;
      case "component":
        state = injectee.state.componentState;
        injectee.dispatch("setComponentState");
        break;
      case "deployments":
        injectee.dispatch("setDeploymentState");
        break;
      case "resource":
        injectee.dispatch("setResourceState");
        break;
      case "runtime":
        state = injectee.state.runtimeState;
        injectee.dispatch("setRuntimeState");
        break;
      default:
        break;
    }

    if (state != null) {
      injectee.commit("setStateName", {
        state: state,
        param: {
          name: getElementName(service.name),
          domain: getElementDomain(service.name),
          version: getElementVersion(service.name)
        }
      });

      injectee.commit("updateAllValidation", {
        type: "service",
        data: injectee.getters.getServiceName,
        currState: injectee.state.serviceState
      });
    }
  };

  updateServiceName = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let currName =
      injectee.getters.manifests[injectee.state.currentManifest].name;
    let splitname = currName.split("/");
    splitname[4] = payload.name; // name
    splitname[2] = payload.domain; // domain
    splitname[5] = payload.version; // version
    let path = "name";
    maniAPI.updateManifest(splitname.join("/"), path, injectee, {
      success: [
        {
          name: "setServiceName",
          params: splitname.join("/"),
          manifests: injectee.getters.manifests
        }
      ],
      failure: [
        {
          name: "setServiceName",
          params: currName,
          manifests: injectee.getters.manifests
        }
      ]
    });
  };

  updateServState = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    injectee.commit("updateValidation", {
      type: "service",
      prop: payload.key,
      value: payload.value,
      validation: injectee.state.serviceState.validation
    });
    injectee.commit("updateServState", payload);
    let path = "name";
    maniAPI.updateManifest(payload.value, path, injectee, {
      success: [],
      failure: []
    });
  };

  // ROLES
  setRole = (injectee: Vuex.ActionContext<State, any>, payload: any): void => {
    injectee.commit("resetRole");
    injectee.commit(
      "deleteValidation",
      injectee.state.roleState.resourceValidation
    );
    injectee.commit("setRole", {
      manifests: injectee.getters.manifests,
      role: payload
    });

    let currentManifest =
      injectee.getters.manifests[injectee.state.currentManifest];
    console.debug("The current manifest is", currentManifest);
    let role = currentManifest.roles[injectee.state.currentRole];
    console.debug("The current role is", role);
    let component = injectee.getters.manifests[role.component];
    console.debug("The component is", component);

    if (component.configuration.resources) {
      component.configuration.resources.map(elem => {
        injectee.commit("setValidation", {
          validation: injectee.state.roleState.resourceValidation,
          prop: elem.name,
          msg: ""
        });
      });
    }

    injectee.commit("updateAllValidation", {
      type: "role",
      data:
        injectee.getters.manifests[injectee.state.currentManifest].roles[
          payload
        ],
      currState: injectee.state.roleState
    });
  };

  updateRoleName = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let validation = injectee.state.roleState.validation;
    injectee.dispatch("updateRoleState", {
      key: "name",
      value: name,
      manifests: injectee.getters.manifests
    });
    let roles = injectee.getters.manifests[
      injectee.state.currentManifest
    ].roles.filter((rol, index) => {
      return rol.name === name && index !== injectee.state.currentRole;
    });
    if (roles.length > 0)
      injectee.commit("setErrValidation", {
        validation: validation,
        prop: "name",
        msg: "dupname"
      });

    // console.log(validation.name.err)
    if (!validation.name.err) {
      injectee.dispatch("updateRoleNameInConnectors", {
        oldName:
          injectee.getters.manifests[injectee.state.currentManifest].roles[
            injectee.state.currentRole
          ].name,
        newName: name
      });
      injectee.dispatch("updateRoleNameInParams", {
        oldName:
          injectee.getters.manifests[injectee.state.currentManifest].roles[
            injectee.state.currentRole
          ].name,
        newName: name
      });

      let path = "roles." + injectee.state.currentRole + ".name";

      maniAPI.updateManifest(name, path, injectee, {
        success: [
          {
            name: "updateRoleName",
            params: name,
            manifest: injectee.getters.manifests
          }
        ],
        failure: []
      });
    }
  };

  updateRoleNameInParams = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let parameters = injectee.getters.manifests[
      injectee.state.currentManifest
    ].configuration.parameters.slice();
    for (let j = 0; j < parameters.length; j++) {
      if (payload.oldName === parameters[j].name)
        parameters[j].name = payload.newName;
    }

    let path = "configuration.parameters";
    maniAPI.updateManifest(parameters, path, injectee, {
      success: [
        {
          name: "setServParams",
          params: parameters,
          manifests: injectee.getters.manfiests
        }
      ],
      failure: []
    });
  };

  updateRoleNameInConnectors = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let connectors = injectee.getters.manifests[
      injectee.state.currentManifest
    ].connectors.slice();
    let UpdateConnList = (data, list) => {
      for (let j = 0; j < list.length; j++)
        if (list[j].role && data.oldName === list[j].role)
          list[j].role = data.newName;
    };

    for (let i = 0; i < connectors.length; i++) {
      UpdateConnList(payload, connectors[i].provided);
      UpdateConnList(payload, connectors[i].depended);
    }

    let path = "connectors";

    maniAPI.updateManifest(connectors, path, injectee, {
      success: [
        {
          name: "updateConnectors",
          params: connectors,
          manifests: injectee.getters.manifests
        }
      ],
      failure: []
    });
  };

  addRole = (injectee: Vuex.ActionContext<State, any>, payload: any): void => {
    injectee.commit("updateAllValidation", {
      type: "role",
      data: payload,
      currState: injectee.state.roleState
    });
    if (injectee.state.roleState.valid) {
      let path = "roles";
      let roles = injectee.getters.manifests[
        injectee.state.currentManifest
      ].roles.slice();

      roles.push(payload);

      try {
        let conf = injectee.getters.manifests[payload.component].configuration;
        if (conf.resources.length === 0 && conf.parameters.length === 0)
          injectee.commit("clearModals", true);
        else if (conf.resources) {
          conf.resources.map(elem => {
            injectee.commit("setValidation", {
              validation: injectee.state.roleState.resourceValidation,
              prop: elem.name,
              msg: ""
            });
          });
        }
      } catch (e) {
        console.log(e);
        injectee.commit("clearModals", true);
      }
      maniAPI.updateManifest(roles, path, injectee, {
        success: [
          {
            name: "updateRoles",
            params: payload,
            manifests: injectee.getters.manifests
          },
          {
            name: "setRole",
            params: roles.length - 1
          }
        ],
        failure: []
      });
    }
  };

  updateRoleComp = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    injectee.commit("displayAlertPan", true);
    injectee.state.confirm.accept = () => {
      injectee.commit("updateRoleState", {
        key: "component",
        value: payload
      });

      injectee.dispatch("deleteRoleFromConnectors", injectee.state.currentRole);
      injectee.dispatch("deleteRoleFromResouces", injectee.state.currentRole);
      injectee.dispatch("deleteRolesResouces", injectee.state.currentRole);
      injectee.dispatch("deleteRoleFromParameters", injectee.state.currentRole);

      let path = "roles." + injectee.state.currentRole + ".component";

      maniAPI.updateManifest(payload, path, injectee, {
        success: [
          {
            name: "updateRoleComp",
            params: {
              component: payload,
              manifests: injectee.getters.manifests
            }
          }
        ],
        failure: []
      });
    };
    injectee.state.confirm.deny = () => {
      injectee.commit("updateRoleComp", {
        component:
          injectee.getters.manifests[injectee.state.currentManifest].roles[
            injectee.state.currentRole
          ].component,
        manifests: injectee.getters.manifests
      });
      injectee.commit("updateRoleState", {
        key: "component",
        value:
          injectee.getters.manifests[injectee.state.currentManifest].roles[
            injectee.state.currentRole
          ].component
      });
    };
  };

  updateRoleState = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    injectee.commit("updateRoleState", payload);
    injectee.commit("updateValidation", {
      type: "role",
      prop: payload.key,
      value: payload.value,
      validation: injectee.state.roleState.validation
    });
  };

  deleteRole = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    injectee.commit("displayAlertPan", true);
    injectee.state.confirm.accept = () => {
      injectee.commit("resetRole");
      let roles = injectee.getters.manifests[
        injectee.state.currentManifest
      ].roles.slice();

      injectee.dispatch("deleteRoleFromConnectors", payload);
      injectee.dispatch("deleteRoleFromResouces", payload);
      injectee.dispatch("deleteRoleFromParameters", payload);

      // UPDATE ROLES
      roles.splice(payload, 1);
      let path = "roles";
      maniAPI.updateManifest(roles, path, injectee, {
        success: [
          {
            name: "deleteRole",
            params: payload,
            manifests: injectee.getters.manifests
          }
        ],
        failure: []
      });
    };
    injectee.state.confirm.deny = () => {};
  };

  deleteRoleFromConnectors = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let path = "";
    let roles = injectee.getters.manifests[
      injectee.state.currentManifest
    ].roles.slice();
    let role = roles[payload];

    // UPDATE SERVICE CONNECTORS
    let filterConn = function(elem) {
      return elem.role !== undefined && elem.role !== role.name;
    };
    let connectors = injectee.getters.manifests[
      injectee.state.currentManifest
    ].connectors.slice();
    for (let i = 0; i < connectors.length; i++) {
      connectors[i].provided = connectors[i].provided.filter(filterConn);
      connectors[i].depended = connectors[i].depended.filter(filterConn);
    }
    path = "connectors";
    maniAPI.updateManifest(connectors, path, injectee, {
      success: [
        {
          name: "updateConnectors",
          params: connectors,
          manifests: injectee.getters.manifests
        }
      ],
      failure: []
    });
  };

  deleteRoleFromResouces = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let path = "";
    let roles = injectee.getters.manifests[
      injectee.state.currentManifest
    ].roles.slice();
    let role = roles[payload];

    // UPDATE SERVICE RESOURCES
    let resources =
      injectee.getters.manifests[injectee.state.currentManifest].configuration
        .resources;
    let roleRes = {};
    let filterRes = function(elem) {
      return roleRes[elem.name] === undefined;
    };

    for (let prop in role.resources) {
      roleRes[role.resources[prop]] = true;
    }

    resources = resources.filter(filterRes);

    path = "configuration.resources";
    maniAPI.updateManifest(resources, path, injectee, {
      success: [
        {
          name: "setServRes",
          params: { res: resources },
          manifests: injectee.getters.manifests
        }
      ],
      failure: []
    });
  };

  deleteRolesResouces = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let roles = injectee.getters.manifests[
      injectee.state.currentManifest
    ].roles.slice();
    let role = roles[payload];

    // UPDATE SERVICE RESOURCES
    role.resources = {};

    injectee.commit("updateRoleState", { key: "resources", value: {} });

    let path = "roles." + payload;
    maniAPI.updateManifest(role, path, injectee, {
      success: [
        {
          name: "updateRoleRes",
          params: {},
          manifests: injectee.getters.manifests
        }
      ],
      failure: []
    });
  };

  deleteRoleFromParameters = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let path = "";
    let roles = injectee.getters.manifests[
      injectee.state.currentManifest
    ].roles.slice();
    let role = roles[payload];

    // UPDATE SERVICE PARAMETERS
    let filterParam = function(elem) {
      return elem.name !== role.name;
    };
    let parameters = injectee.getters.manifests[
      injectee.state.currentManifest
    ].configuration.parameters.filter(filterParam);
    path = "configuration.parameters";
    maniAPI.updateManifest(parameters, path, injectee, {
      success: [
        {
          name: "setServParams",
          params: parameters,
          manifests: injectee.getters.manifests
        }
      ],
      failure: []
    });
  };

  // RESOURCES
  setResource = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let role =
      injectee.getters.manifests[injectee.state.currentManifest].roles[
        injectee.state.currentRole
      ];
    let sResources = injectee.getters.manifests[
      injectee.state.currentManifest
    ].configuration.resources.slice();
    let sResIndex = sResources.findIndex(x => x["name"] === payload.oldTag);
    let path = "";

    let validation = injectee.state.roleState.resourceValidation;

    injectee.commit("updateValidation", {
      type: "role",
      prop: payload.name,
      dinamic: "resource",
      value: payload.tag,
      validation: validation
    });

    if (!validation[payload.name].err) {
      let duplicateRes = sResources.filter(x => {
        return x.name === payload.tag;
      });
      if (duplicateRes.length === 0) {
        if (injectee.state.currentRole > -1) {
          if (
            role.resources &&
            role.resources[payload.name] &&
            sResIndex > -1
          ) {
            if (payload.tag.length > 0) {
              // actualizar
              path = "configuration.resources." + sResIndex;
              sResources[sResIndex].name = payload.tag;
              maniAPI.updateManifest(sResources[sResIndex], path, injectee, {
                success: [
                  {
                    name: "updateServRes",
                    params: {
                      index: sResIndex,
                      name: payload.tag
                    },
                    manifests: injectee.getters.manifests
                  }
                ],
                failure: []
              });

              path =
                "roles." +
                injectee.state.currentRole +
                ".resources." +
                payload.name;
              let rResources = {};
              Object.assign(rResources, role.resources);
              rResources[payload.name] = payload.tag;
              maniAPI.updateManifest(rResources[payload.name], path, injectee, {
                success: [
                  {
                    name: "updateRolRes",
                    params: {
                      name: payload.name,
                      tag: payload.tag
                    },
                    manifests: injectee.getters.manifests
                  }
                ],
                failure: []
              });
            } else {
              // borrar
              path = "configuration.resources";
              sResources.splice(sResIndex, 1);
              maniAPI.updateManifest(sResources, path, injectee, {
                success: [
                  {
                    name: "setServRes",
                    params: { res: sResources },
                    manifests: injectee.getters.manifests
                  }
                ],
                failure: []
              });

              path = "roles";
              let rResources = {};
              Object.assign(rResources, role.resources);
              delete rResources[payload.name];
              let roles = injectee.getters.manifests[
                injectee.state.currentManifest
              ].roles.slice();
              roles[injectee.state.currentRole].resources = rResources;

              maniAPI.updateManifest(roles, path, injectee, {
                success: [
                  {
                    name: "setRolRes",
                    params: { res: rResources },
                    manifests: injectee.getters.manifests
                  }
                ],
                failure: []
              });
            }
          } else if (payload.tag.length > 0) {
            // crear
            if (sResIndex < 0) {
              sResources.push({ name: payload.tag, type: payload.type });
              sResIndex = sResources.length;
            } else {
              sResources[sResIndex] = { name: payload.tag, type: payload.type };
            }
            path = "configuration.resources";
            maniAPI.updateManifest(sResources, path, injectee, {
              success: [
                {
                  name: "setServRes",
                  params: { res: sResources },
                  manifests: injectee.getters.manifests
                }
              ],
              failure: []
            });

            let rResources = {};
            if (role.resources) {
              Object.assign(rResources, role.resources);
              rResources[payload.name] = payload.tag;
            } else {
              rResources[payload.name] = payload.tag;
            }
            path = "roles." + injectee.state.currentRole + ".resources";
            maniAPI.updateManifest(rResources, path, injectee, {
              success: [
                {
                  name: "setRolRes",
                  params: { res: rResources },
                  manifests: injectee.getters.manifests
                }
              ],
              failure: []
            });
          }
        }
      } else {
        if (duplicateRes.length === 1 && payload.tag !== payload.oldTag)
          injectee.commit("setErrValidation", {
            validation: injectee.state.roleState.resourceValidation,
            prop: payload.name,
            msg: "dupname"
          });
      }
    }
  };

  setResourceState = (injectee: Vuex.ActionContext<State, any>): void => {
    injectee.commit(
      "deleteValidation",
      injectee.state.resourceState.validation
    );
    let resource = injectee.getters.manifests[injectee.state.currentManifest];
    console.debug("The manifest contains", resource);
    // resourceState
    let resourceName = {
      name: getElementName(resource._urn),
      //  version: name[name.length - 1],
      domain: getElementDomain(resource._urn),
      type: getResourceType(resource._type)
    };
    injectee.commit("updateResourceState", {
      key: "name",
      value: resourceName
    });

    Object.keys(resourceName).map(x => {
      injectee.commit("setValidation", {
        validation: injectee.state.resourceState.validation,
        prop: x,
        msg: ""
      });
    });

    let parameters = {};
    Object.keys(resource.parameters).map(key => {
      parameters[key] = resource.parameters[key];
      injectee.commit("setValidation", {
        validation: injectee.state.resourceState.validation,
        prop: key,
        msg: ""
      });
    });
    injectee.commit("updateResourceState", {
      key: "parameters",
      value: parameters
    });
  };

  updateResourceState = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let validation = injectee.state.resourceState.validation;
    let params = Object.assign({}, injectee.state.resourceState.parameters);
    injectee.commit("updateValidationType", {
      validation: validation,
      prop: payload.key,
      type: payload.type,
      value: payload.value
    });
    params[payload.key] = payload.value;
    injectee.commit("updateResourceState", {
      key: "parameters",
      value: params
    });

    if (!validation[payload.key].err) {
      let path = "parameters." + payload.key;

      switch (payload.type) {
        case "number":
        case "integer":
          payload.value = payload.value * 1;
          break;
        case "vhost":
        case "list":
        case "json":
          payload.value = JSON.parse(payload.value);
          break;

        default:
          break;
      }
      maniAPI.updateManifest(payload.value, path, injectee, {
        success: [],
        failure: []
      });
    }
  };

  // RUNTIMES
  setRuntimeState = (injectee: Vuex.ActionContext<State, any>): void => {
    let runtime = injectee.getters.manifests[injectee.state.currentManifest];

    if (runtime.derived) {
      injectee.commit("updateRuntimeState", {
        key: "derived",
        value: runtime.derived
      });

      Object.keys(runtime.derived).map(key => {
        injectee.commit("setValidation", {
          validation: injectee.state.runtimeState.validation,
          prop: key,
          msg: ""
        });
      });
    }

    let runsettings = {};
    if (runtime.sourcedir) {
      runsettings["sourcedir"] = runtime.sourcedir;
      injectee.commit("setValidation", {
        validation: injectee.state.runtimeState.validation,
        prop: "sourcedir",
        msg: ""
      });
    }
    if (runtime.entrypoint) {
      runsettings["entrypoint"] = runtime.entrypoint;
      injectee.commit("setValidation", {
        validation: injectee.state.runtimeState.validation,
        prop: "entrypoint",
        msg: ""
      });
    }
    if (runtime.agent) {
      runsettings["agent"] = runtime.agent;
      injectee.commit("setValidation", {
        validation: injectee.state.runtimeState.validation,
        prop: "agent",
        msg: ""
      });
    }

    injectee.commit("updateRuntimeState", {
      key: "runsettings",
      value: runsettings
    });

    if (runtime.metadata) {
      injectee.commit("updateRuntimeState", {
        key: "metadata",
        value: runtime.metadata
      });
      injectee.commit("setValidation", {
        validation: injectee.state.runtimeState.validation,
        prop: "metadata",
        msg: ""
      });
    }
  };

  updateRuntimeState = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let validation = injectee.state.runtimeState.validation;
    let path = "";

    injectee.commit("updateValidationType", {
      validation: validation,
      prop: payload.key,
      type: payload.type,
      value: payload.value
    });
    if (payload.parent) {
      injectee.commit("updateRuntimeStateParent", {
        key: payload.key,
        value: payload.value,
        parent: payload.parent
      });
      if (payload.parent === "derived") path = "derived.";
    } else
      injectee.commit("updateRuntimeState", {
        key: payload.parent ? payload.parent : payload.key,
        value: payload.value
      });

    if (!validation[payload.key].err) {
      path = path + payload.key;

      switch (payload.type) {
        case "number":
        case "integer":
          payload.value = payload.value * 1;
          break;
        case "vhost":
        case "list":
        case "json":
          payload.value = JSON.parse(payload.value);
          break;

        default:
          break;
      }
      maniAPI.updateManifest(payload.value, path, injectee, {
        success: [],
        failure: []
      });
    }
  };

  // PARAMETERS
  changeBypass = (injectee: Vuex.ActionContext<State, any>): void => {
    if (injectee.state.currentRole >= 0) {
      let role =
        injectee.getters.manifests[injectee.state.currentManifest].roles[
          injectee.state.currentRole
        ];
      let params = injectee.getters.manifests[
        injectee.state.currentManifest
      ].configuration.parameters.slice();
      let pIndex = params.findIndex(x => x.name === role.name);
      //     console.log(pIndex)
      if (pIndex > -1) {
        params.splice(pIndex, 1);
      } else {
        params.push({
          name: role.name,
          type: injectee.state.Settings.manifestStructure.elementtype.parameter.enum.find(
            x => x.name === "json"
          ).eslap
        });
      }
      //  console.log(JSON.stringify(params))
      let path = "configuration.parameters";
      maniAPI.updateManifest(params, path, injectee, {
        success: [
          {
            name: "setServParams",
            params: params,
            manifests: injectee.getters.manifests
          }
        ],
        failure: []
      });
    }
  };

  // CHANNELS
  setChannel = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    payload.data = Object.assign(
      {},
      injectee.getters.manifests[injectee.state.currentManifest].channels[
        payload.inout
      ][payload.index]
    );
    injectee.commit("setChannel", payload);
    injectee.commit("updateAllValidation", {
      type: "channel",
      data:
        injectee.getters.manifests[injectee.state.currentManifest].channels[
          payload.inout
        ][payload.index],
      currState: injectee.state.channelState
    });
  };

  deleteChannel = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    payload.data = Object.assign(
      {},
      injectee.getters.manifests[injectee.state.currentManifest].channels[
        payload.inout
      ][payload.index]
    );
    injectee.commit("displayAlertPan", true);

    injectee.state.confirm.accept = () => {
      let channels = injectee.getters.manifests[
        injectee.state.currentManifest
      ].channels[payload.inout].slice();
      channels.splice(payload.index, 1);
      let path = "channels." + payload.inout;
      maniAPI.updateManifest(channels, path, injectee, {
        success: [
          {
            name: "updateChannels",
            params: {
              channels: channels,
              direction: payload.inout
            },
            manifests: injectee.getters.manifests
          }
        ],
        failure: []
      });
      injectee.dispatch("deleteChannelInConnectors", payload);
    };
    injectee.state.confirm.deny = () => {};
  };

  deleteChannelInConnectors = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let service = injectee.getters.manifests[injectee.state.currentManifest];
    // UPDATE SERVICE CONNECTORS
    if (service.type === "service") {
      let filterConn = function(elem) {
        return elem.role !== undefined || elem.endpoint !== payload.data.name;
      };
      let connectors = service.connectors.slice();
      for (let i = 0; i < connectors.length; i++) {
        connectors[i].provided = connectors[i].provided.filter(filterConn);
        connectors[i].depended = connectors[i].depended.filter(filterConn);
      }
      let path = "connectors";
      maniAPI.updateManifest(connectors, path, injectee, {
        success: [
          {
            name: "updateConnectors",
            params: connectors,
            manifests: injectee.getters.manifests
          }
        ],
        failure: []
      });
    }
  };

  updateCurrentChannel = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let service = injectee.getters.manifests[injectee.state.currentManifest];
    let channels = service.channels[payload.inout].slice();

    if (
      channels[payload.index].type !== payload.data.type ||
      (channels[payload.index].protocol !== payload.data.protocol &&
        payload.data.protocol !== "")
    ) {
      injectee.commit("displayAlertPan", true);
      injectee.state.confirm.accept = () => {
        injectee.dispatch("deleteChannelInConnectors", payload);
        channels[payload.index].name = payload.data.name;
        channels[payload.index].type = payload.data.type;
        if (payload.data.protocol !== "")
          channels[payload.index].protocol = payload.data.protocol;

        let path = "channels." + payload.inout;
        maniAPI.updateManifest(channels, path, injectee, {
          success: [
            {
              name: "updateChannels",
              params: {
                channels: channels,
                direction: payload.inout
              },
              manifests: injectee.getters.manifests
            }
          ],
          failure: []
        });
      };
      injectee.state.confirm.deny = () => {
        injectee.dispatch("updateChannState", {
          key: "type",
          value: channels[payload.index].type
        });
        injectee.dispatch("updateChannState", {
          key: "protocol",
          value: channels[payload.index].protocol
        });
      };
    } else {
      let validation = injectee.state.channelState.validation;
      let filteredChan;
      injectee.dispatch("updateChannState", {
        key: "name",
        value: payload.data.name
      });
      let direct = "provides";
      filteredChan = injectee.getters.manifests[
        injectee.state.currentManifest
      ].channels[direct].filter((chann, index) => {
        return (
          chann.name === payload.data.name &&
          (direct === payload.inout ? index !== payload.index : true)
        );
      });
      if (filteredChan.length > 0)
        injectee.commit("setErrValidation", {
          validation: validation,
          prop: "name",
          msg: "dupname"
        });

      direct = "requires";
      filteredChan = injectee.getters.manifests[
        injectee.state.currentManifest
      ].channels[direct].filter((chann, index) => {
        return (
          chann.name === payload.data.name &&
          (direct === payload.inout ? index !== payload.index : true)
        );
      });

      if (filteredChan.length > 0)
        injectee.commit("setErrValidation", {
          validation: validation,
          prop: "name",
          msg: "dupname"
        });

      if (!validation.name.err) {
        injectee.dispatch("updateChannelInConnectors", {
          oldName: channels[payload.index].name,
          newName: payload.data.name
        });
        channels[payload.index].name = payload.data.name;
        channels[payload.index].type = payload.data.type;
        if (payload.data.protocol !== "")
          channels[payload.index].protocol = payload.data.protocol;
        let path = "channels." + payload.inout;
        maniAPI.updateManifest(channels, path, injectee, {
          success: [
            {
              name: "updateChannels",
              params: {
                channels: channels,
                direction: payload.inout
              },
              manifests: injectee.getters.manifests
            }
          ],
          failure: []
        });
      }
    }
  };

  updateChannelInConnectors = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let service = injectee.getters.manifests[injectee.state.currentManifest];
    if (service.type === "service") {
      let connectors = service.connectors.slice();
      let UpdateConnList = (data, list) => {
        for (let j = 0; j < list.length; j++)
          if (list[j].role === undefined && data.oldName === list[j].endpoint)
            list[j].endpoint = data.newName;
      };

      for (let i = 0; i < connectors.length; i++) {
        UpdateConnList(payload, connectors[i].provided);
        UpdateConnList(payload, connectors[i].depended);
      }
      let path = "connectors";
      maniAPI.updateManifest(connectors, path, injectee, {
        success: [
          {
            name: "updateConnectors",
            params: connectors,
            manifests: injectee.getters.manifests
          }
        ],
        failure: []
      });
    }
  };

  setChannelDirect = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    injectee.commit("resetChannel");
    injectee.commit(
      "resetAllValidation",
      injectee.state.channelState.validation
    );
    injectee.commit("setChannelDirect", payload);
  };

  addChannel = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    injectee.commit("updateAllValidation", {
      type: "channel",
      data: payload.data,
      currState: injectee.state.channelState
    });
    if (injectee.state.channelState.valid) {
      let channels = injectee.getters.manifests[
        injectee.state.currentManifest
      ].channels[payload.inout].slice();
      channels.push(payload.data);
      let path = "channels." + payload.inout;
      maniAPI.updateManifest(channels, path, injectee, {
        success: [
          {
            name: "updateChannels",
            params: {
              channels: channels,
              direction: payload.inout
            },
            manifests: injectee.getters.manifests
          },
          {
            name: "setChannel",
            params: {
              index: channels.length - 1,
              inout: payload.inout,
              data: payload.data
            }
          }
        ],
        failure: []
      });
    }
  };

  updateChannState = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    injectee.commit("updateChannState", payload);
    injectee.commit("updateValidation", {
      type: "channel",
      prop: payload.key,
      value: payload.value,
      validation: injectee.state.channelState.validation
    });
  };

  // CONNECTORS
  setConnector = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    injectee.commit("setConnector", payload);
  };

  deleteConnector = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let connectors = injectee.getters.manifests[
      injectee.state.currentManifest
    ].connectors.slice();
    connectors.splice(payload, 1);
    if (connectors.length > 0)
      if (payload > 0) injectee.commit("setConnector", payload - 1);
      else injectee.commit("setConnector", 0);
    else injectee.commit("setConnector", -1);

    let path = "connectors";
    maniAPI.updateManifest(connectors, path, injectee, {
      success: [
        {
          name: "updateConnectors",
          params: connectors,
          manifests: injectee.getters.manifests
        }
      ],
      failure: []
    });
  };

  addConnector = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let connectors = injectee.getters.manifests[
      injectee.state.currentManifest
    ].connectors.slice();
    connectors.push(payload);
    let path = "connectors";
    maniAPI.updateManifest(connectors, path, injectee, {
      success: [
        {
          name: "updateConnectors",
          params: connectors,
          manifests: injectee.getters.manifests
        }
      ],
      failure: []
    });
    injectee.commit("setConnector", connectors.length - 1);
  };

  addConnection = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let connectors = injectee.getters.manifests[
      injectee.state.currentManifest
    ].connectors.slice();
    connectors[injectee.state.currentConnector][payload.direction].push(
      payload.element
    );
    let path = "connectors";
    maniAPI.updateManifest(connectors, path, injectee, {
      success: [
        {
          name: "updateConnectors",
          params: connectors,
          manifests: injectee.getters.manifests
        }
      ],
      failure: []
    });
  };

  deleteConnList = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    if (injectee.state.currentConnector >= 0) {
      let direction =
        payload.type ===
        injectee.state.Settings.listTypes.connectorList.provided
          ? "provided"
          : "depended";
      let connChannels = injectee.getters.manifests[
        injectee.state.currentManifest
      ].connectors[injectee.state.currentConnector][direction].slice();
      connChannels.splice(payload.index, 1);
      let path =
        "connectors." + injectee.state.currentConnector + "." + direction;
      maniAPI.updateManifest(connChannels, path, injectee, {
        success: [
          {
            name: "deleteConnList",
            params: payload,
            manifests: injectee.getters.manifests
          }
        ],
        failure: []
      });
    }
  };

  // ROUTING ACTIONS
  cleanCurrent = (
    injectee: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    payload = payload.split("#")[1];
    switch (payload) {
      case injectee.state.Settings.modalProps.roles.id:
        injectee.commit("resetRole");
        injectee.commit(
          "resetAllValidation",
          injectee.state.roleState.validation
        );
        break;
      case injectee.state.Settings.modalProps.channels.id:
        injectee.commit("resetChannel");
        injectee.commit(
          "resetAllValidation",
          injectee.state.channelState.validation
        );
        break;
      case injectee.state.Settings.modalProps.connectors.id:
        injectee.commit("resetConnector", injectee.getters.manifests);
        break;
      default:
        break;
    }
  };
}
