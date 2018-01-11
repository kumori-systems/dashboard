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

console.warn('bandwith_input and bandwith_output typo');

export function prepareData(data) {
  // 'data': { [property: string]: string | number }
  
  var res = {
    labels: [],
    datasets: []
  };

  for (let index in data) {
    for (let prop in data[index]) {
      if( prop === 'timestamp_init' || prop === 'timestamp_end' || prop === 'elapsed_msec'
    || prop === 'ws_chunk_in_per_second' || prop === 'ws_chunk_out_per_second'){
        // Descartamos estas propiedades
      }
      else if (prop === 'timestamp')
        res.labels.push(moment(data[index].timestamp));
      else {
        // Recorremos el dataset buscando la posición de uno ya existente. Si existe guardamos su pos
        let position = res.datasets.findIndex((p) => {
          // console.debug('Dentro del find, p vale', p);
          if (p['label'] === prop) return p;
        })
        // console.debug('La posición del elemento es', position);
        if (position !== -1) { // Si ya existe, lo añadimos al objeto correspondiente
          // console.debug('Actualizamos una propiedad');
          res.datasets[position].data.push(data[index][prop]);
        }
        else { // Si no existe, hacemos un nuevo push
          res.datasets.push(
            {
              'label': prop,
              'backgroundColor': color[prop] || '#000000',
              'borderColor': color[prop] || '#000000',
              'fill': false,
              'data': [data[index][prop]]
            }
          );
        }
      }
    }
  }

  while (res.labels.length < 60) {
    res.labels.push(moment(res.labels[res.labels.length - 1]).add(1, 'm'));
  }

  return res;
}