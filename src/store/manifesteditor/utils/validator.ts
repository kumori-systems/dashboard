let regex = {
  notNull: {
    r: /^.+$/,
    errMsg: 'empty'
  },
  validVersion: {
    r: /^\d+_\d+_\d+$/,
    errMsg: 'invalidf'
  },
  noSpecialChars: {
    r: /^[a-zA-Z0-9_.-]*$/,
    errMsg: 'invalidc'
  },
  integer: {
    r: /^[-+]?\d+$/,
    errMsg: 'invalidc'
  },
  uinteger: {
    r: /^\d+$/,
    errMsg: 'invalidc'
  },
  number: {
    r: /^[-+]?\d+(\.?\d+|\d*)$/,
    errMsg: 'invalidc'
  },
  json: {
    r: /(.|\s)*\S(.|\s)*/,
    errMsg: 'empty'
  },
  boolean: {
    r: /^true$|^false$/,
    errMsg: 'invalidc'
  }

}

let cheCker = (check, value) => {
  let status = value.match(regex[check].r);
  return { err: (status == null), msg: status == null ? regex[check].errMsg : '' };
}

let props = {
  role: {
    name: ['notNull', 'noSpecialChars'],
    component: ['notNull'],
    resource: ['notNull', 'noSpecialChars']
  },
  channel: {
    name: ['notNull', 'noSpecialChars'],
    type: ['notNull'],
    protocol: []
  },
  service: {
    domain: ['notNull', 'noSpecialChars'],
    name: ['notNull', 'noSpecialChars'],
    version: ['notNull', 'validVersion']
  },
  component: {
    runtime: []
  },
  configuration: {
    pname: ['notNull'],
    rname: ['notNull']
  },
  arrangements: {
    __instances: ['notNull', 'uinteger'],
    __cpu: ['notNull', 'uinteger'],
    __memory: ['notNull', 'uinteger'],
    __ioperf: ['notNull', 'uinteger'],
    __iopsintensive: ['notNull', 'boolean'],
    __bandwidth: ['notNull', 'uinteger'],
    __resilience: ['notNull', 'uinteger'],
    __maxinstances: ['notNull', 'uinteger']
  },
  deployment: {
    name: ['noSpecialChars']
  }

}

let validator = (conditions, value) => {
  for (let cond of conditions) {
    let res = cheCker(cond, value)
    console.log(res)
    if (res.err)
      return res;
  }
  return { err: false, msg: '' };
}


let validType = (type, value) => {
  let res = { err: false, msg: '' };

  if (type != 'string') {
    if (['list', 'json', 'vhost'].indexOf(type) > -1) {
      res = cheCker('json', value);
      if (!res.err)
        try {
          let json = JSON.parse(value);
        } catch (error) {
          return { err: true, msg: 'invjson' };
        }
    }
    else {
      if ('notNull' != type) {
        res = cheCker('notNull', value);
        if (res.err)
          return res;
      }
      res = cheCker(type, value);
    }
  }

  return res;
}

let validProp = (type, prop, value) => {
  /*      console.log("------VALIDADTOR------")
      console.log(type)
      console.log(prop)
      console.log(value)
      console.log("----------------------")  */
  let conditions = props[type][prop];
  for (let cond of conditions) {
    let res = cheCker(cond, value)
    if (res.err)
      return res;
  }
  return { err: false, msg: '' };
}

export { validProp, validType };

{/* <div :class="{'form-group':true, 'has-error':validation.name.err, 'has-feedback':validation.name.err}">
    <input class="form-control" @input="updateName" ref="name" v-bind:value="name">
                          <span v-if="validation.name.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
    <span v-if="validation.name.err" class="help-block">{{ validation.name.msg }}</span>
</div> */}