import http from 'http';
import path from 'path';

let fs = {
  readdirSync: (dir) => { return []; },
  readFileSync: (file, format?) => { return null; },
  statSync: (file) => {
    return {
      isDirectory: () => { return false; }
    };
  }
};

/**
 * Locates all manifests in a certain folder and classifies them.
 */
export default class ManifestHunter {

  /** Name of the actual manifest  */
  maniName: string;
  paths = {};

  services = {};
  components = {};
  resources = {};
  graph = { nodes: [], edges: [] };

  /** All services,  */
  allData = {};

  /** All manifests stored in memory. */
  manifests = {};

  /** Constructor of the class. */
  constructor() {
    this.maniName = 'manifest.json';
    this.services = {};
    this.components = {};
    this.resources = {};
    this.graph = { nodes: [], edges: [] };
    this.allData = {};
    this.manifests = {};
  }

  /**
   * Creates an object containing a structure of a service.
   * @param servPath path of the service to process.
   * @param callback function where to send the result.
   */
  jsonToGrpah(servPath, callback) {
    this.services = {};
    this.components = {};
    this.graph = { nodes: [], edges: [] };
    this.scanAll();
    this.graphParser(this.paths[servPath], callback);
  }

  /**
   * returns ALL MANIFESTS.
   * @param callback function where to send the result.
   */
  servicesList(callback) {
    this.manifests = {};
    this.scanAll();
    callback(this.manifests);
  }

  /**
   * Given a service creates an object with the correspondig structure.
   * @param serviceKey urn of the service.
   * @param callback function where to send the result.
   */
  graphParser(serviceKey, callback) {
    let graph = this.graph;
    let nodesMap = {};
    let service = this.services[serviceKey];

    if (service === undefined) {
      throw { err: 'servnotfoud', path: serviceKey };
    }

    for (let idRol in service.roles) { // ROLES
      let rol = service.roles[idRol];
      let node = {
        title: rol.name, type: 'component', cat: 'component', h: 0, w: 0,
        id: Number(idRol), channels: [], x: 0, y: 0
      };
      let component = this.components[rol.component];
      for (let channel of component.channels.provides)
        node.channels.push({
          title: channel.name, id: node.channels.length, type: 'provided',
          order: 0
        });
      for (let channel of component.channels.requires)
        node.channels.push({
          title: channel.name, id: node.channels.length, type: 'depended',
          order: 0
        });

      nodesMap[rol.name] = Number(idRol);
      graph.nodes.push(node);
    }

    let baseX = 20;
    let baseY = 100;
    let unitsX = 350;
    let unitsY = 100;
    let sectionsLength = {};
    let sectionType = [];
    let sectionOrder = [];
    let connectors = [];
    let getRow = (row, type) => {
      if (sectionType.length < row) {
        sectionType.push(type);
        return row;
      }
      else {
        let i = row - 1;
        for (i; i < sectionType.length; i++)
          if (sectionType[i] === type) {
            return i + 1;
          }
        sectionType.push(type);
        return i + 1;
      }
    };

    for (let connector of service.connectors) { // CONNECTORS
      let type = connector.type.split('/');
      let node = {
        title: type[type.length - 2], type: 'connector',
        cat: type[type.length - 2], h: 0, w: 0, id: graph.nodes.length,
        channels: [], x: 0, y: 0
      };
      connectors.push(graph.nodes.length);
      let j = 0;
      let maxX = 0;
      if (connector.hasOwnProperty('depended')) {
        if (j === 0)
          node.channels.push({
            title: 'provided', id: node.channels.length, type: 'provided',
            order: 0
          });
        for (let conn of connector.depended) {
          if (conn.hasOwnProperty('role')) {
            let conNode = graph.nodes[nodesMap[conn.role]];
            let channel = conNode.channels.filter((val) => {
              return val.title === conn.endpoint;
            })[0];
            if (j === 0) {
              graph.edges.push({
                id: '', target: node.id, source: conNode.id,
                connDest: node.channels.length - 1, connOr: channel.id
              });
            }
            if (conNode.x >= maxX) {
              maxX = conNode.x + 1;
            }
            if (conNode.x === 0) {
              conNode.x = getRow(1, 'com');
              sectionsLength.hasOwnProperty(conNode.x) ?
                sectionsLength[conNode.x] += 1 : sectionsLength[conNode.x] = 1;
              conNode.y = baseY + unitsY * sectionsLength[conNode.x];
              sectionOrder.push(conNode.id);
            }
          }
        }
      }
      node.x = getRow(maxX, 'con');
      sectionsLength.hasOwnProperty(node.x) ?
        sectionsLength[node.x] += 1 : sectionsLength[node.x] = 1;
      node.y = baseY + unitsY * sectionsLength[node.x];
      sectionOrder.push(graph.nodes.length);

      if (connector.hasOwnProperty('provided')) {
        if (j === 0) {
          node.channels.push({
            title: 'depended', id: node.channels.length, type: 'depended',
            order: 0
          });
        }

        for (let conn of connector.provided) {
          if (conn.hasOwnProperty('role')) {
            let conNode = graph.nodes[nodesMap[conn.role]];
            let channel = conNode.channels.filter((val) => {
              return val.title === conn.endpoint;
            })[0];
            if (j === 0)
              graph.edges.push({
                id: '', source: node.id, target: conNode.id,
                connOr: node.channels.length - 1, connDest: channel.id
              });
            if (conNode.x) {
              if (conNode.x > 0) {
                sectionsLength[conNode.x] = sectionsLength[conNode.x] - 1;
                let index = sectionOrder.indexOf(conNode.id);
                sectionOrder.splice(index, 1);
              }
              conNode.x = getRow(maxX + 1, 'com');
              sectionsLength.hasOwnProperty(conNode.x) ?
                sectionsLength[conNode.x] += 1 : sectionsLength[conNode.x] = 1;
              conNode.y = baseY + unitsY * sectionsLength[conNode.x];
              sectionOrder.push(conNode.id);
            }
          }
        }
      }
      graph.nodes.push(node);
    }

    for (let conn of connectors) {

      let node = graph.nodes[conn];

      let index = sectionOrder.indexOf(node.id);
      sectionOrder.splice(index, 1);

      let relations = graph.edges.filter((val) => {
        return val.source === node.id;
      });

      if (relations.length > 0) {
        node.x = getRow(Math.max.apply(Math, relations.map(function (o) {
          return graph.nodes[o.target].x;
        })) - 1, 'con');
      }

      relations = graph.edges.filter((val) => {
        return val.target === node.id;
      });

      if (relations.length > 0) {
        node.x = getRow(Math.min.apply(Math, relations.map(function (o) {
          return graph.nodes[o.source].x;
        })) + 1, 'con');
      }

      sectionsLength.hasOwnProperty(node.x) ?
        sectionsLength[node.x] += 1 : sectionsLength[node.x] = 1;
      node.y = baseY + unitsY * sectionsLength[node.x];
      sectionOrder.push(node.id);
    }

    for (let i of sectionOrder) {
      let node = graph.nodes[i];
      if (sectionType.length >= node.x) {
        node.x = baseX + unitsX * node.x;
      }
    }

    this.allData['graph'] = graph;
    this.allData['manifests'] = {};
    this.allData['manifests']['service'] = service;
    this.allData['manifests']['components'] = this.components;
    this.allData['manifests']['resources'] = this.resources;
    callback(this.allData);
  }

  /**
   * Recursively reads all contents of a directory adding all manifests.
   */
  scanAll() {
    this.readDirStruct('/home/$USER/workspace/');
  }

  /**
   * Recursively reads all contents of a directory adding all manifests.
   * @param dir Root directory where to start to read.
   */
  readDirStruct(dir) {
    let files = fs.readdirSync(dir);
    for (let file of files) {
      if (file.toLocaleLowerCase() === this.maniName) {
        this.registerManifest(path.join(dir, file));
      }
      else if (fs.statSync(path.join(dir, file)).isDirectory()) {
        this.readDirStruct(path.join(dir, file));
      }
    }
  }

  /**
   * Given a manifest classifies it as service, component or resource.
   * @param manifest location of the file representing a manifest.
   */
  clasifyManifests(manifest) {
    let json;
    try {
      json = JSON.parse(fs.readFileSync(manifest, 'utf8'));
      json['filePath'] = manifest;
      let spec = json.spec.split('/');

      this.paths[manifest] = json.name;

      switch (spec[3]) {
        case 'manifest':
          switch (spec[spec.length - 2]) {
            case 'service':
              this.services[json.name] = json;
              break;
            case 'component':
              this.components[json.name] = json;
              break;
          }
          break;
        case 'resource':
          this.resources[json.name] = json;
          break;
      }
    }
    catch (ex) {
      throw { err: 'invjson', path: manifest };
    }
  }

  /**
   * Registers a manifest depending if it's a deployment or another kind of
   * manifest. Stores all the manifest in memory.
   * @param manifest location of the file representing a manifest.
   */
  registerManifest(manifest) {
    let json;
    let types = ['service', 'component', 'deployment', 'resource', 'runtime'];
    try {
      json = JSON.parse(fs.readFileSync(manifest, 'utf8'));

      json['filePath'] = manifest;

      let spec = json.spec.split('/');
      let type;

      if (spec[3] === 'manifest')
        type = spec[spec.length - 2];
      else type = spec[3];

      json['type'] = type;

      if (types.indexOf(type) > -1)
        if (type === 'deployment')
          this.manifests[manifest] = json;
        else
          this.manifests[json.name] = json;
    }
    catch (ex) {
      throw { err: 'invjson', path: manifest };
    }
  }
}