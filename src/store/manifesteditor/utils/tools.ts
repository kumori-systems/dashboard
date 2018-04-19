
function isUndefinedOrEmpty(obj) {
  return obj === undefined || Object.keys(obj).length;
}

function parseType(value, type) {
  switch (type) {
    case 'integer':
      return parseInt(value);
    case 'boolean':
      return value === 'true';
    default:
      break;
  }
}

function limitName(name, length) {
  if ((name.length) > length) {
    return name.substr(0, length) + '...';
  }
  else
    return name;
}

function parseConnChannels(list) {
  return Object.keys(list).map(function (key) {
    if (list[key].role && list[key].endpoint)
      return {
        fullName: list[key].role + ':' + list[key].endpoint,
        name: [list[key].role, limitName(list[key].endpoint,
          26 - list[key].role.length)],
        role: list[key].role,
        endpoint: list[key].endpoint
      };
    else
      return {
        fullName: list[key].endpoint,
        name: ['', limitName(list[key].endpoint, 26)],
        endpoint: list[key].endpoint
      };
  });
}

function paseSugestionChannels(list, role) {
  return Object.keys(list).map(function (key) {
    if (role && list[key].name)
      return {
        fullName: role + ':' + list[key].name,
        name: [role, limitName(list[key].name, 27 - role.length)],
        label: role + ':' + limitName(list[key].name, 27 - role.length),
        role: role,
        endpoint: list[key].name
      };
    else if (list[key].name)
      return {
        fullName: ':' + list[key].name,
        name: ['', limitName(list[key].name, 27)],
        label: '' + ':' + limitName(list[key].name, 27),
        endpoint: list[key].name
      };
  });
}

function getAllChannels(state, getters, type) {
  let list = [];
  if (state.currentManifest) {
    let excludeRolChann = {};
    let excludeSrvChann = {};

    let connType = type === 'requires' ? 'depended' : 'provided';
    let service = getters.manifests[state.currentManifest];

    // Create exclusions
    for (let conn in service.connectors) {
      for (let entry of service.connectors[conn][connType]) {
        if (entry.role) {
          excludeRolChann[entry.role + ':' + entry.endpoint] = true;
        }
      }
      if (type === 'requires')
        for (let entry in service.connectors[conn][connType]) {
          if (service.connectors[conn][connType][entry].role === undefined) {
            excludeSrvChann[':' + service.connectors[conn][connType][entry].endpoint] = true;
          }
        }
    }

    for (let role in service.roles) {
      if (getters.getComponents[service.roles[role].component]) {
        let comChannels = getters.getComponents[service.roles[role].component].channels[type];
        if (comChannels && comChannels.length > 0) {
          list = list.concat(paseSugestionChannels(comChannels, service.roles[role].name));
        }
      }
    }

    if (type === 'requires' && service.channels && service.channels['provides']) {
      list = list.concat(
        paseSugestionChannels(service.channels['provides'], '')
      );
    }

    list = list.filter((x) => {
      return excludeRolChann[x.fullName] && excludeSrvChann[x.fullName];
    });

  }

  return list;
}

export {
  isUndefinedOrEmpty, parseType, limitName, parseConnChannels,
  paseSugestionChannels, getAllChannels
}