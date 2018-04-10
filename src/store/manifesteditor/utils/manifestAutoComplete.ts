import ManifestHunter from './manifestHunter';
let Mhunter = new ManifestHunter();
import ManiStruct from './autoCompleteTree';

let verbose = false;

function Normalize(text: string) {

  text = text.replace(/\n|\s/g, '');
  text = text.replace(/:\[/g, ':\[\n');
  text = text.replace(/:\{/g, ':\{\n');

  text = text.replace(/},{/g, '}\n{');
  text = text.replace(/},"/g, '}\n\"');
  text = text.replace(/],"/g, ']\n\"');
  text = text.replace(/,"/g, '\n');

  text = text.replace(/{/g, '{\n');
  text = text.replace(/}/g, '\n}');
  text = text.replace(/]/g, '\n]');

  text = text.replace(/"/g, '');
  text = text.replace(/\n\n/g, '\n');
  text = text.replace(/\"\"/g, '\"');



  return text.split(/\n/);

}
function getPath(text: string) {
  let arr = Normalize(text);

  let match;
  let options = { a: 0, b: 0 };
  let chars = { '{': 'a', '}': 'a', '[': 'b', ']': 'b' };
  let firstChar = '';
  let parent = /(\w*)\s*:\s*([\[|\{])/;
  let rExit = /(]|})/;
  let rEnter = /(\{|\[)/;

  function addOpt(char) {
    options[chars[char]]++;
  }

  function restOpt(char) {
    if (firstChar === '' && options[chars[char]] === 0)
      firstChar = char;
    if (options[chars[char]] > 0)
      options[chars[char]]--;
  }

  function isParent(char) {

    if (firstChar === '' && options[chars[char]] === 0)
      firstChar = char;

    let parent = options[chars[char]] === 0;
    if (!parent && options[chars[char]] > 0) {
      options[chars[char]]--;
    }

    return parent;
  }


  let element;
  let path = [];
  for (let index = arr.length - 1; index >= 0; index--) {
    element = arr[index];

    match = parent.exec(element);

    if (match) {
      if (isParent(match[2])) {
        path.unshift(match[1]);
      }
    } else {
      match = rExit.exec(element);
      if (match) {
        addOpt(match[1]);

      } else {
        match = rEnter.exec(element);
        if (match)
          restOpt(match[1]);
      }
    }
  }
  path.push(firstChar);

  return path;

}

let depStruct = {
  'service': {},
  'component': {},
  'resource': {
    type: /spec"\s*:\s*"eslap:\/\/[\w.]*\/resource\/([\w/]*)\/[\d_]*/
  },
  'deployment': {
    servicename: /"servicename"\s*:\s*"([\w:/]*)"/g
  },
  'runtime': {}
};
let Manifests;
let siblings = {};

function setManifests() {
  Mhunter.servicesList((data) => {
    Manifests = data;
  });
}

setManifests();

function getDependencies(text: string, type: string) {
  if (verbose)
    console.log('getDependencies');
  let dependencies = {};
  let struct = depStruct[type];
  if (struct) {
    let match;
    Object.keys(struct).map((x) => {
      match = struct[x].exec(text);
      if (match[1])
        dependencies[x] = match[1];
    });
    return dependencies;
  }
  else return {};
}

function getSpecType(text: string) {
  let spec = text.split('/');
  if (spec[3] === 'manifest')
    return spec[spec.length - 2];
  else return spec[3];
}

function navToState(type: string, path: any[], dependecies: object) {
  let struct = ManiStruct[type];
  let exit = false;

  if (path.length === 1 && path[0] === '{') {
    return struct;
  }

  for (let i = 0; i < path.length && !exit; i++) {
    try {

      if (struct[path[i]] === undefined) {
        if (verbose)
          console.log('no childrens');
        if (path[i] === '{') {
          if (struct.linked) {
            if (verbose)
              console.log('has linked');
            struct = struct.linked(Manifests, dependecies);
          }
        }
        else {
          if (struct['*wildcard']) {
            if (verbose)
              console.log('****' + path[i]);
            dependecies['self'] = path[i];
            struct = struct['*wildcard'];
            if (struct['{'])
              struct = struct['{'];
          }
        }
      }
      else {
        struct = struct[path[i]];
        if (path.length - (i + 1) > 1 && struct['{'])
          struct = struct['{'];
      }

    } catch (e) {
      console.log(e);
      exit = true;
    }
  }
  if (verbose)
    console.log(struct);
  return struct;
}

function manifestsByFilter(filter: string) {
  return Object.keys(Manifests).map(x => {
    let type = getSpecType(Manifests[x].spec);
    // console.log(type);
    if (type === filter)
      return Manifests[x].name;

  }).filter(x => { return x !== null; });

}

function Sugestions(path: any[], line: string, fullText: string) {
  let regSpec = /\"spec\"\s*\:\s*"([:/\w.-_\d]*)"/g;
  let matchSpec = regSpec.exec(fullText);
  if (verbose) {
    console.log('PATH: ' + JSON.stringify(path));
    console.log(matchSpec);
  }
  if (matchSpec) {

    let type = getSpecType(matchSpec[1]);
    if (verbose)
      console.log(type);
    let dependecies = getDependencies(fullText, type);
    if (verbose)
      console.log(dependecies);
    // RETURN ARRAY ELEMENT { }
    if (path[path.length - 1] === '[') {
      // return [new vs.CompletionItem('{ }', vs.CompletionItemKind.Struct)];
    }

    let result = [];
    let struct = navToState(type, path, dependecies);
    let isProp = /\"(\w+)\"\s*\:$/;
    let matchLine = isProp.exec(line);

    // IF IS PROP
    if (matchLine) {
      if (verbose)
        console.log('IS PROP');
      // NEED TO FILTER WORCKSPACE MANIFESTS
      try {
        let filter = struct[matchLine[1]].filter;
        if (filter !== undefined) {
          let filtered = manifestsByFilter(filter);
          // filtered.map(x => { result.push(new vs.CompletionItem('"' + x 
          // + '"', vs.CompletionItemKind.Field)) });
        }

      } catch (error) {
        console.log(error);
      }
      // HAS LIST OF ELEMENTS TO SUGEST
      try {
        let enumItems = struct[matchLine[1]].enum;
        if (enumItems !== undefined) {
          for (let i = 0; i < enumItems.length; i++) {
            // result.push(new vs.CompletionItem('"' + enumItems[i] + '"',
            // vs.CompletionItemKind.Field));
          }
        }

      } catch (error) {
        console.log(error);
      }
      // console.log(result)
      return result;

    }
    // SHOW CHILDS
    else {
      Object.keys(struct).map(x => {
        if (!siblings[x]) {
          let flag = struct[x].condition !== undefined; // HAS CONDITION
          flag = (flag && struct[x].condition.funct(dependecies,
            struct[x].condition.params)); // APPLY CONDITION TO SHOW
          // IF CHILD DONT HAVE CONDITION
          flag = flag || struct[x].condition === undefined;
          if (flag) {
            // Show elements without condition or when condition is fulfilled
            // result.push(new vs.CompletionItem('"' + x + '": '
            // + struct[x].type, vs.CompletionItemKind.Field));
          }
        }

      });
      return result;
    }

  }
  else
    return [];
}

function getAllSiblings(document, position) {

  let top = Normalize(document.getText(
    null, null
    // new vs.Range(new vs.Position(0, 0),
    // new vs.Position(position.line, position.character))
  ));

  let bot = Normalize(document.getText(
    null, null
    // new vs.Range(new vs.Position(position.line, position.character + 1),
    // new vs.Position(document.lineCount, 0))
  ));

  if (verbose) {
    console.log(top);
    console.log(bot);
  }

  let options = { a: 0, b: 0 };
  let chars = { '{': 'a', '}': 'a', '[': 'b', ']': 'b' };
  let rExit = /(]|})/;
  let rEnter = /(\{|\[)/;
  let key = /(\w+)\s*:\s*[:\w/.-]*/;

  let element;
  let match;
  let stop = false;

  siblings = {};


  function topControl(char) {
    //   chars[char]

    if (char === '{' || char === '[') {
      options[chars[char]]--;
      if (options[chars[char]] < 0)
        return true;
    }

    if (char === '}' || char === ']') {
      options[chars[char]]++;
    }

    return false;
  }

  function botControl(char) {
    //   chars[char]   
    if (char === '{' || char === '[') {
      options[chars[char]]++;
    }

    if (char === '}' || char === ']') {
      options[chars[char]]--;
      if (options[chars[char]] < 0)
        return true;
    }
    return false;
  }

  function registerKey(key) {
    if (options.a === 0) {
      siblings[key] = true;
      if (verbose)
        console.log(key);
    }
  }

  for (let i = top.length - 1; i > 0 && !stop; i--) {
    element = top[i];

    match = rExit.exec(element);
    if (match)
      stop = topControl(match[1]);

    match = rEnter.exec(element);
    if (match)
      stop = topControl(match[1]);

    if (verbose)
      if (stop)
        console.log(i);

    match = key.exec(element);
    if (match) {
      registerKey(match[1]);
    }
  }

  stop = false;
  options = { a: 0, b: 0 };

  for (let i = 0; i < bot.length && !stop; i++) {
    element = bot[i];

    match = key.exec(element);
    if (match) {
      registerKey(match[1]);
    }

    match = rEnter.exec(element);
    if (match)
      stop = botControl(match[1]);

    match = rExit.exec(element);
    if (match)
      stop = botControl(match[1]);

    if (verbose)
      if (stop)
        console.log(i);
  }

  if (verbose)
    console.log(JSON.stringify(siblings));

}

export default class ManifestAutoComplete {

  currentFile: string;

  provideCompletionItems(document, position, token) {

    let currentLine = document.getText(document.lineAt(position).range);
    let subLine = document.getText(
      null // new vs.Range(new vs.Position(position.line, 0), position)
    );
    let txtFromStart = document.getText(
      null // new vs.Range(new vs.Position(0, 0), position)
    );
    let fullText = document.getText();


    getAllSiblings(document, position);

    let path = getPath(txtFromStart);
    if (verbose)
      console.log('=================================================='
        + '======================');
    return Promise.resolve(Sugestions(path, subLine.trim(), fullText));
  }
}