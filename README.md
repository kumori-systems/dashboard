# Dashboard
Dashboard single web page for Kumori Ecloud.

## Authentication
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