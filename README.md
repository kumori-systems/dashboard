# Dashboard
Dashboard single web page for Kumori Ecloud.

## Authentication
The authentication depends on acs, but we are actually using:
user: josep@iti.es
password: josep

## Development Setup
``` bash
git clone git@gitlab.com:ECloud/dashboard.git;
cd dashboard;
git checkout ticket741;
npm install;
npm run dev;
```
The default browser should be automatically prompt.

## Usefull tools
Web debug for chrome: vue devtools (https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)

Visual studio plulgin: vetur (https://marketplace.visualstudio.com/items?itemName=octref.vetur)


## Optimización de llamadas
- En la llamada que se hace al entrar en la vista overview tenemos que obtener todos los deployment.
En ésta vista, hace falta también obtener la información de los servicios, ya que la urn de un componente la almacena el servicio. Si ésta información la ofreciera el propio rol del deployment nos ahorraríamos unas cuantas llamadas, posiblemente innecesarias.

- En la llamada para la vista Elements, tengo que hacer múltiples llamadas; una para obtener el número de elementos registrados en el sistema y una por cada elemento para obtener su información.

## Preguntas
- Actualmente con la info que tengo no puedo obtener la información de las resources de un servício,
ya que tengo el tipo pero no la URI del resource. ¿Cómo podría resolver ésto?

### Entrypoints
- Tiene sentido que al crear un entrypoint definamos esto?:
    '__cpu': 1,
    '__memory': 2,
    '__ioperf': 1,
    '__iopsintensive': false,
    '__bandwidth': 100,
    
    Lo pregunto porque estos valores no los pedimos y éstos son los que he puesto por defecto.

- ¿Debería de pedir un campo 'name' para los entrypoints? En el manifiesto de despliegue está

# Problemas
Estoy teniendo actualmente un problema con la actualización de los charts de los rols y las instáncias.
Consiste en que los datos son almacenados correctamente, pero vue no reconoce los cambios y, por tanto, no actualiza
los charts.
El problema parece ir relacionado con: 'https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats'.
Sin embargo, no está claro si vuex escucha correctamente los cambios o no.

Este comentario del creador puede ayudar a guiarnos..
"No, the actual mutation happens on the object inside the array, not the array itself, so it is not subject to the index detection caveat."

Mutations to Arrays in JavaScript happen through methods like push() and pop().

If you want to store things with string keys you should use an Object.
And since you are adding a new property, you should use Vue.set().