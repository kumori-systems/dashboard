import * as moment from 'moment';

const color = {
  cpu: '#ff0400',
  memory: '#ffec00',
  bandwith_input: '#0000ff',
  bandwith_output: '#228B22',
  http_requests_per_second: '#ff3333',
  http_errors_per_second: '#ffa533',
  http_size_in_per_second: '#fcff33',
  http_size_out_per_second: '#bce26c',
  http_chunk_in_per_second: '#3cff33',
  http_chunk_out_per_second: '#33fff9',
  http_response_time: '#337aff',
  ws_size_in_per_second: '#b833ff',
  ws_size_out_per_second: '#ff33ff'
};

export function prepareDeploymentData(metrics) {

  var res = {
    labels: [],
    datasets: []
  };

  for (let index in metrics.data) {
    for (let prop in metrics.data[index]) {
      if( prop === 'timestamp_init' || prop === 'timestamp_end' || prop === 'elapsed_msec'
    || prop === 'ws_chunk_in_per_second' || prop === 'ws_chunk_out_per_second'){
        // Discarting properties
      }
      else if (prop === 'timestamp')
        res.labels.push(moment(metrics.data[index].timestamp));
      else {
        // Searching existent prop
        let position = res.datasets.findIndex((p) => {
          if (p['label'] === prop) return p;
        })
        if (position !== -1) { // If prop exists, add corresponding object
          res.datasets[position].data.push(metrics.data[index][prop]);
        }
        else { // If prop doesn't exist, create it
          res.datasets.push(
            {
              'label': prop,
              'backgroundColor': color[prop] || '#000000',
              'borderColor': color[prop] || '#000000',
              'fill': false,
              'data': [metrics.data[index][prop]]
            }
          );
        }
      }
    }
  }

  while (res.labels.length < 60) {
    res.labels.push(moment(res.labels[res.labels.length - 1]).add(1, 'm'));
  }
  
  return {
    data: res,
    roles: metrics.roles
  };
}

export function prepareRoleData(metrics) {
  // 'data': { [property: string]: string | number }
  
  var res = {
    labels: [],
    datasets: []
  };

  for (let index in metrics.data) {
    for (let prop in metrics.data[index]) {
      if( prop === 'timestamp_init' || prop === 'timestamp_end' || prop === 'elapsed_msec'
    || prop === 'ws_chunk_in_per_second' || prop === 'ws_chunk_out_per_second'){
        // Discarting properties
      }
      else if (prop === 'timestamp')
        res.labels.push(moment(metrics.data[index].timestamp));
      else {
        // Search for an existing prop
        let position = res.datasets.findIndex((p) => {
          if (p['label'] === prop) return p;
        })
        
        if (position !== -1) { // If exists, add the new object to it
        
          res.datasets[position].data.push(metrics.data[index][prop]);
        }
        else { // If not exists, create a new one
          res.datasets.push(
            {
              'label': prop,
              'backgroundColor': color[prop] || '#000000',
              'borderColor': color[prop] || '#000000',
              'fill': false,
              'data': [metrics.data[index][prop]]
            }
          );
        }
      }
    }
  }

  while (res.labels.length < 60) {
    res.labels.push(moment(res.labels[res.labels.length - 1]).add(1, 'm'));
  }
  
  return {
    data: res,
    instances: metrics.instances
  };
}

export function prepareInstanceData(metrics) {
  // 'data': { [property: string]: string | number }
  
  var res = {
    labels: [],
    datasets: []
  };

  for (let index in metrics.data) {
    for (let prop in metrics.data[index]) {
      if( prop === 'timestamp_init' || prop === 'timestamp_end' || prop === 'elapsed_msec'
    || prop === 'ws_chunk_in_per_second' || prop === 'ws_chunk_out_per_second'){
        // Discartin properties
      }
      else if (prop === 'timestamp')
        res.labels.push(moment(metrics.data[index].timestamp));
      else {
        // Searching existent prop
        let position = res.datasets.findIndex((p) => {
          if (p['label'] === prop) return p;
        })
        if (position !== -1) { // If exists, add the new object
          res.datasets[position].data.push(metrics.data[index][prop]);
        }
        else { // If not exists, create a new object
          res.datasets.push(
            {
              'label': prop,
              'backgroundColor': color[prop] || '#000000',
              'borderColor': color[prop] || '#000000',
              'fill': false,
              'data': [metrics.data[index][prop]]
            }
          );
        }
      }
    }
  }

  while (res.labels.length < 60) {
    res.labels.push(moment(res.labels[res.labels.length - 1]).add(1, 'm'));
  }
  
  return {
    data: res,
  };
}