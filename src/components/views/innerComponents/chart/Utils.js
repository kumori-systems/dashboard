import * as moment from 'moment';
export function prepareData(data) {
    var res = {
        labels: [],
        datasets: []
    };
    console.debug('Los datos que estamos recibiendo para pintar son: ', data);
    for (let index in data) {
        console.debug('La iteración del elemento: ', index);
        for (let prop in data[index]) {
            console.debug('La iteración de la propiedad:', prop);
            if (prop === 'timestamp')
                res.labels.push(moment(data[index].timestamp));
            else {
                // Recorremos el dataset buscando la posición de uno ya existente. Si existe guardamos su pos
                console.debug('El dataset que intentamos recorrer contiene: ', res.datasets);
                let position = res.datasets.findIndex((p) => {
                    console.debug('Dentro del find, p vale', p);
                    if (p['label'] === prop) return p;
                })
                console.debug('La posición del elemento es', position);
                if (position !== -1) { // Si ya existe, lo añadimos al objeto correspondiente
                    console.debug('Actualizamos una propiedad');
                    res.datasets[position].data.push(data[index][prop]);
                }
                else { // Si no existe, hacemos un nuevo push
                    console.debug('Creamos una nueva propiedad %s, con valor %d', prop, data[index][prop]);
                    res.datasets.push(
                        {
                            'label': prop,
                            'backgroundColor': '#1fc8db',
                            'borderColor': '#1fc8db',
                            'fill': false,
                            'data': [data[index][prop]]
                        }
                    );
                    console.debug('Tras añadir la propiedad, res vale:', res);
                }
            }
        }
    }
    console.debug('Los datos procesados son:', res);
    return res;
}