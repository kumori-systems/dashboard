let linkedFunctions = {

  deployParams: function (state, dep) {

    let serv = state[dep.servicename];
    let result = {};
    let roles;
    try {
      roles = Object.keys(serv.roles).filter((x) => {
        let role = serv.roles[x];
        try {
          if (state[role.component].configuration.parameters.length > 0)
            result[role.name] = { type: "{ }" }
          return state[role.component].configuration.parameters.length > 0;
        } catch (error) {
          return false;
        }
      });

    } catch (error) {
      return {};
    }
    return result;

  },

  deployRes: function (state, dep) {

    let serv = state[dep.servicename];
    let result = {};
    try {
      let resources = serv.configuration.resources;

      for (let i = 0; i < resources.length; i++)
        result[resources[i].name] = { type: "\" \"" }

    } catch (error) {
      return {};
    }
    return result;

  },

  roleParams: function (state, dep) {

    let serv = state[dep.servicename];
    let self = dep.self;
    let result = {};
    let roles;
    try {
      let roles = serv.roles.filter(role => {
        return role.name == dep.self;
      });

      if (roles.length == 1) {
        let params = state[roles[0].component].configuration.parameters;
        for (let i = 0; i < params.length; i++) {
          result[params[i].name] = { type: "\" \"" };
        }
      }
    } catch (error) {
      return {};
    }
    return result;
  }

};

let conditionFunctions = {

  checkType(dep, params) {
    for (let i = 0; i < params.type.length; i++) {
      if (params.type[i] == dep.type)
        return true;
    }
    return false;
  }

};

let service = {

  configuration: {
    type: "{}",
    "{": {
      resources: {
        type: "[]",
        "{": {
          name: {
            type: "\"\"",
          },
          type: {
            filter: "resource",
            type: "\"\"",
          },
        }
      },
      parameters: {
        type: "[]",
        "{": {
          name: {
            type: "\"\"",
          },
          type: {
            type: "\"\"",
            enum: [
              'eslap://eslap.cloud/parameter/boolean/1_0_0',
              'eslap://eslap.cloud/parameter/integer/1_0_0',
              'eslap://eslap.cloud/parameter/json/1_0_0',
              'eslap://eslap.cloud/parameter/list/1_0_0',
              'eslap://eslap.cloud/parameter/number1_0_0',
              'eslap://eslap.cloud/parameter/string/1_0_0',
              'eslap://eslap.cloud/parameter/vhost/1_0_0'
            ]
          },
        }
      }
    }
  },
  roles: {
    type: "[]",
    "{": {
      name: {
        type: "\"\"",
      },
      component: {
        type: "\"\"",
        filter: "component"
      },
      resources: {
        type: "\"\"",
      },
      parameters: {
        type: "\"\"",
      }
    }
  },
  channels: {
    type: "{}",
    "{": {
      provides: {
        type: "[]",
        "{": {
          name: {
            type: "\"\"",
          },
          type: {
            type: "\"\"",
            enum: [
              'eslap://eslap.cloud/channel/duplex/1_0_0',
              'eslap://eslap.cloud/channel/reply/1_0_0',
              'eslap://eslap.cloud/channel/send/1_0_0'
            ]

          },
          protocol: {
            type: "\"\"",
            enum: [
              'eslap://eslap.cloud/protocol/message/http/1_0_0',
              'eslap://eslap.cloud/protocol/tcp/1_0_0',
              'eslap://eslap.cloud/protocol/message/http/1_0_0',
              'eslap://eslap.cloud/protocol/message/1_0_0',
              'eslap://eslap.cloud/protocol/tcp/http/1_0_0'
            ]
          }
        }
      },
      requires: {
        type: "[]",
        "{": {
          name: {
            type: "\"\"",
          },
          type: {
            type: "\"\"",
            enum: [
              'eslap://eslap.cloud/channel/duplex/1_0_0',
              'eslap://eslap.cloud/channel/receive/1_0_0',
              'eslap://eslap.cloud/channel/request/1_0_0']
          },
          protocol: {
            type: "\"\"",
            enum: [
              'eslap://eslap.cloud/protocol/message/http/1_0_0',
              'eslap://eslap.cloud/protocol/tcp/1_0_0',
              'eslap://eslap.cloud/protocol/message/http/1_0_0',
              'eslap://eslap.cloud/protocol/message/1_0_0',
              'eslap://eslap.cloud/protocol/tcp/http/1_0_0'
            ]
          }
        }
      }
    }
  },
  connectors: {
    type: "[]",
    "{": {
      type: {
        type: "\"\"",
        enum: [
          'eslap://eslap.cloud/connector/complete/1_0_0',
          'eslap://eslap.cloud/connector/loadbalancer/1_0_0',
          'eslap://eslap.cloud/connector/pubsub/1_0_0'
        ]
      },
      provided: {
        type: "[]",
        "{": {
          role: {
            type: "\"\"",
          },
          endpoint: {
            type: "\"\"",
          }
        }
      },
      depended: {
        type: "[]",
        "{": {
          role: {
            type: "\"\"",
          },
          endpoint: {
            type: "\"\"",
          }
        }
      }
    }

  },
  name: {
    type: "\"\"",
  },
  spec: {
    type: "\"\"",
  }

}

let component = {

  spec: {
    type: "\"\""
  },
  name: {
    type: "\"\""
  },
  runtime: {
    type: "\"\""
  },
  code: {
    type: "\"\"", // List blobs
    filter: "blob"
  },
  channels: {
    type: "{}",
    "{": {
      provides: {
        type: "[]",
        "{": {
          name: {
            type: "\"\"",
          },
          type: {
            type: "\"\"",
            enum: ['eslap://eslap.cloud/channel/duplex/1_0_0',
              'eslap://eslap.cloud/channel/reply/1_0_0',
              'eslap://eslap.cloud/channel/send/1_0_0']
          },
          protocol: {
            type: "\"\"",
            enum: [
              'eslap://eslap.cloud/protocol/message/http/1_0_0',
              'eslap://eslap.cloud/protocol/tcp/1_0_0',
              'eslap://eslap.cloud/protocol/message/http/1_0_0',
              'eslap://eslap.cloud/protocol/message/1_0_0',
              'eslap://eslap.cloud/protocol/tcp/http/1_0_0'
            ]
          }
        }
      },
      requires: {
        type: "[]",
        "{": {
          name: {
            type: "\"\"",
          },
          type: {
            type: "\"\"",
            enum: [
              'eslap://eslap.cloud/channel/duplex/1_0_0',
              'eslap://eslap.cloud/channel/receive/1_0_0',
              'eslap://eslap.cloud/channel/request/1_0_0'
            ]
          },
          protocol: {
            type: "\"\"",
            enum: [
              'eslap://eslap.cloud/protocol/message/http/1_0_0',
              'eslap://eslap.cloud/protocol/tcp/1_0_0',
              'eslap://eslap.cloud/protocol/message/http/1_0_0',
              'eslap://eslap.cloud/protocol/message/1_0_0',
              'eslap://eslap.cloud/protocol/tcp/http/1_0_0'
            ]
          }
        }
      }
    }
  },
  configuration: {
    type: "{}",
    "{": {
      resources: {
        type: "[]",
        "{": {
          name: {
            type: "\"\"",
          },
          type: {
            filter: "resource",
            type: "\"\"",
          },
        }
      },
      parameters: {
        type: "[]",
        "{": {
          name: {
            type: "\"\"",
          },
          type: {
            type: "\"\"",
            enum: [
              'eslap://eslap.cloud/parameter/boolean/1_0_0',
              'eslap://eslap.cloud/parameter/integer/1_0_0',
              'eslap://eslap.cloud/parameter/json/1_0_0',
              'eslap://eslap.cloud/parameter/list/1_0_0',
              'eslap://eslap.cloud/parameter/number1_0_0',
              'eslap://eslap.cloud/parameter/string/1_0_0',
              'eslap://eslap.cloud/parameter/vhost/1_0_0'
            ]
          },
        }
      }
    }
  },
  profile: {
    type: "{ }",
    "{": {
      threadability: {
        type: "\"*\"",
      }
    }
  }

}

let deployment = {
  spec: {
    type: "\"\""
  },
  servicename: {
    type: "\"\""
  },
  name: {
    type: "\"\""
  },
  configuration: {
    type: "{}",
    "{": {
      resources: {
        type: "{ }",
        linked: linkedFunctions.deployRes
      },
      parameters: {
        type: "{ }",
        linked: linkedFunctions.deployParams,
        "*wildcard": {
          linked: linkedFunctions.roleParams
        }
      }
    }
  },
  roles: {
    type: "{ }",
    "*wildcard": {
      type: "{ }",
      "{": {
        resources: {
          type: "{ }",
          "{": {
            __instances: { type: " int" },
            __cpu: { type: " int" },
            __memory: { type: " int" },
            __ioperf: { type: " int" },
            __iopsintensive: { type: " boolean" },
            __bandwidth: { type: " int" },
            __resilience: { type: " int" }
          }
        }
      }
    }
  }

}

let resource = {
  spec: {
    type: "\"\""
  },
  name: {
    type: "\"\""
  },
  parameters: {
    type: "{ }",
    "{": {
      content: {
        type: "{ }",
        condition: {
          funct: conditionFunctions.checkType,
          params: { type: ["cert/server", "cert/client"] }
        }
      },
      name: {
        type: "\" \"",
        condition: {
          funct: conditionFunctions.checkType,
          params: { type: ["faultgroups", "vhost"] }
        }
      },
      type: {
        type: "\" \"",
        condition: {
          funct: conditionFunctions.checkType,
          params: { type: ["faultgroups", "vhost"] }
        }
      },
      size: {
        type: "int",
        condition: {
          funct: conditionFunctions.checkType,
          params: { type: ["volume/persistent", "volume/volatile"] }
        }
      },
      mountpoint: {
        type: "\"\"",
        condition: {
          funct: conditionFunctions.checkType,
          params: { type: ["volume/persistent", "volume/volatile"] }
        }
      },
      prefix: {
        type: "\" \"",
        condition: {
          funct: conditionFunctions.checkType,
          params: { type: ["volume/persistent", "volume/volatile"] }
        }
      },
      best_effort: {
        type: "\" \"",
        condition: {
          funct: conditionFunctions.checkType,
          params: { type: ["volume/persistent", "volume/volatile"] }
        }
      },
      follows_instance: {
        type: "\" \"",
        condition: {
          funct: conditionFunctions.checkType,
          params: { type: ["volume/persistent", "volume/volatile"] }
        }
      }
    }
  }
}

let runtime = {
  spec: {
    type: "\"\"",
  },
  name: {
    type: "\"\"",
  },
  derived: {
    type: "{}",
    "{": {
      from: {
        type: "\"\"",
        filter: "runtime"

      }
    }
  },
  agent: {
    type: "\"\"",
  },
  sourcedir: {
    type: "\"\"",
  },
  entrypoint: {
    type: "\"\"",
  },
  metadata: {
    type: "{ }",
    "{": {
      description: {
        type: "\"\"",
      },
      os_name: {
        type: "\"\"",
      },
      os_version: {
        type: "\"\"",
      },
      os_release: {
        type: "\"\"",
      },
      software: {
        type: "{ }",
      },
      layerId: {
        type: "\"\"",
      }
    }
  }
}

export default {
  service,
  component,
  deployment,
  resource,
  runtime
};