
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

function parseSugestionChannels(list, role) {
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
    console.debug(
      'The connection type is ' + JSON.stringify(connType, null, 2)
    );

    // Current service
    let service = state.manifests[state.currentManifest];
    console.debug('The actual service is ' + JSON.stringify(service, null, 2));

    // Create exclusions
    for (let conn in service.connectors) {
      for (let entry of service.connectors[conn][connType]) {

        // Add all provided or depended channels as excluded ones
        if (entry.role) {
          excludeRolChann[entry.role + ':' + entry.endpoint] = true;
        }

      }
      

        for (let entry in service.connectors[conn][connType]) {

          if (!service.connectors[conn][connType][entry].role) {

            excludeSrvChann[
              ':' + service.connectors[conn][connType][entry].endpoint
            ] = true;
          }

        }

      
    }

    // Add component channels
    for (let role in service.roles) {
      let component = getters.getComponents[service.roles[role].component];

      console.debug(
        'The component contains' + JSON.stringify(component, null, 2)
      );

      if (component) {
        let comChannels = component.channels[type];

        console.debug('The type is ' + JSON.stringify(type));

        console.debug(
          'The component channels are ' + JSON.stringify(comChannels, null, 2)
        );

        if (comChannels && comChannels.length > 0) {
          list = list.concat(
            parseSugestionChannels(comChannels, service.roles[role].name)
          );
        }
      }
    }


    console.debug(
      'Before adding the service channels the list contains '
      + JSON.stringify(list, null, 2)
    );

    // Add service channels
    let searched = type === 'provides' ? 'requires' : 'provides';
    list = list.concat(
      parseSugestionChannels(service.channels[searched], '')
    );

    console.debug(
      'In the middle of the method the list contains '
      + JSON.stringify(list, null, 2)
    );

    if (
      type === 'requires'
      && service.channels
      && service.channels['provides']
    ) {
      list = list.concat(
        parseSugestionChannels(service.channels['provides'], '')
      );
    }

    console.debug('La lista de exclusion de roles contiene '
      + JSON.stringify(excludeRolChann, null, 2));
    console.debug('La lista de exclusion de servicios contiene '
      + JSON.stringify(excludeSrvChann, null, 2));

    list = list.filter((x) => {
      return !excludeRolChann[x.fullName] && !excludeSrvChann[x.fullName];
    });

  }


  console.debug(
    'La lista de opciones de canales contiene: '
    + JSON.stringify(list, null, 2)
  );

  return list;
}

export {
  isUndefinedOrEmpty, parseType, limitName, parseConnChannels,
  parseSugestionChannels, getAllChannels
}