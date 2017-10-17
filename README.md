# Dashboard
Dashboard single web page for Kumori Ecloud.

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

## Important anotations
### Metrics
 - Metrics are grouped in time, and all metrics should be given in one second and in periods of minutes. This is not what really happens, some metrics can appear a few seconds later.
For this has been used moment, which groups the dates in packs of 44 seconds with the instruction 'from'. This restriction can be found at 'addMetrics' in mutations.

 - Metrics are stored 'on the fly', but, while the chart is beeing shown, in general metrics will be represented with a minute of difference. 
 This happens because the events which active the refresh of chart's data are activated when 
 Esto sucede porque los eventos que activan el refresco de los datos de las gráficas
se activan nada más se obtiene un timestamp distinto al que hay. Si el deployment no es el primero que se recibe, las gráficas se actualizan, pero al ir a obtener los datos del delployment que se está visualizando
¡todavía no han llegado!. La recepción de más métricas en el mismo timestamp no provoca una actualización del estado. Es por esto que la representación de las gráficas, mientras se están mostrando, va un minuto atrasada.

Cuando no se están visualizando las gráficas no hay problema, ya que el tiempo de recepción de todo el conjunto de gráficas para el ser humano es ínfimo.. pero en términos de computación son valores muy grandes.