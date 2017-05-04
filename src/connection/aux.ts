import { StampState } from './logic';

// TODO: sustituir esta función por la llamada correspondiente
function auxFunction(): Promise<{ response: string, body: string }> {
    const promesa = new Promise(function (resolve, reject) {
        resolve({ response: 'respuesta', body: 'cuerpo' });
    });
    return promesa;
}

import stampStateExample from './../../examples/tc-state-example';
export function getStampState() {
    // Cambiamos el body para que sea el JSON de ejemplo
    return auxFunction().then(function ({ response, body }) {
        
        // Nos aseguramos que lo que estamos importando tiene el tipado de un StampState
        let res: StampState = <StampState> stampStateExample.tcState;

        // Gestión de errores de conexión
        // TODO: hay que comprobar los valores de cuando se lanza un error y de cuándo no se lanzan
        let error = null;
        if (response === error) { Promise.reject(new Error('Error de conexión al intentar obtener estado: ' + response)); }

        return res;
    });
}
export function deploymentRolAddInstance() {
    return auxFunction();
}
export function deploymentRolRemoveInstance() { return auxFunction(); }