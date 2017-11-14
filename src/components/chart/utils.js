import * as moment from 'moment';

const color = {
  cpu: '#ff0400',
  memory: '#ffec00',
  bandwidth_input: '#00ecff',
  bandwidth_output: '#1300ff'
};
export function prepareData(data) {
  var res = {
    labels: [],
    datasets: []
  };

  for (let index in data) {
    for (let prop in data[index]) {
      if (prop === 'timestamp')
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