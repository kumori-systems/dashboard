# Dashboard
Web dashboard para que los clientes puedan manejar sus instáncias de forma visual e intuitiva.

DECISIONES IMPORTANTES
---------------------------------------------------------
- Sólo los innerComponents tendrán props y será el id del elemento al que representan.
- No se obtendrán elementos de la estore complejos (Objetos), ya que se ha comprobado que puede dar problemas al refrescar.

- He cambiado los valores de los identificadores en el archivo de métricas para que coincidan con los deployment locales.
- He añadido un parámetro en el archivo de métricas. Este parámetro es para saber a qué instáncia corresponde cada métrica.


PROBLEMAS RENDERIZACION CHARTS
---------------------------------------------------------
Actualmente tengo problemas con la renderización de los charts. Los problemas no vienen dados por los eventos que llaman
a la store, sino por algo que parece interno de chart.js.
PORQUÉ:
    -> Si los datos no son dinámicos, sino estáticos, seguimos con el mismo problema
    -> El problema parece que es para determinar el intervalo en el que enseñar las fechas
    -> Con una fecha todo funciona bien
    -> Cuando aparece más de una fecha las cosas empiezan a fallar
    -> Anteriormente conseguía cargar 36 puntos en 2 segundos. No sé qué ha pasado que ahora tarda 20 segundos en cargar 2 puntos.


PREGUNTAS
---------------------------------------------------------
// Cuándo listas vacías
¿Qué debería aparecer cuando las listas están vacías? 
-Cuando no hay deployments (servicios)
-Cuando no hay roles en un deployments (se puede dar el caso?). Propuesta. "empty"(en gris)
-Cuando no hay instáncias de un rol en un deployment (se puede dar el caso?). Propuesta. "empty"(en gris)
-Cuando no hay links. Propuesta. "empty"(en gris)
-Cuando un canal no tiene conexiones

//Obtención de porcentaje de uso de los volúmenes
Por lo que entendí, en la ventana que contiene la informaicón de un deployment, debe de aparecer los volúmenes de cada rol.
Cuando mantengamos el volúmen, debería de aparecer, según el dashboard 'muestra total de uso'.
¿Cómo puedo obtener éste dato?
* Volúmenes
No dispongo de datos. Déjalo pendiente, crea una estructura de datos muy sencilla,
con identificador y un dato de % de uso por ejemplo, y mas adelante ya lo concretaremos.

//Vista new Web Service (normal)
Falta por definir

// Memoria, CPU y NET de una instáncia
Actualmente las estoy cogiendo del rol. Sé que deberían de ser los mismos, pero ¿Quieres añadir los datos para cada instáncia o la solución actual te parece bien?

//Métricas de una instáncia
No he cogido los cuarties ya que me falta el valor inicial y el valor final de cada periodo de tiempo.
Actualmente estoy cogiendo la media de los cuartos para representarla.
Pese a que no es un valor real, es bastante representativo.

-> NET: Hay red de bajada y red de subida. ¿Hago una suma para enseñar el uso total de red? ¿O debería de enseñarlo como dos
valores separados?
-> RPM (Request Per Minute): Los valores serán valores altos, y no sé hasta qué punto tiene sentido pasar un
porcentaje, por lo que, personalmente, recomendaría representarlo en una gráfica separada.
-> RES (Response Time): Al contrario que RPM, responsetime siempre contendrá valores muy bajos. Y de la misma forma,
no tiene mucho sentido enseñarlo como un porcentaje. También recomendaría representarlo en otra gráfica.

POSIBLE SOLUCIÓN:
    Dividirlo en 3 tablas y cada tabla en una pestaña;
        1- CPU, MEM, NET
        2- RPM (Request Per Minute)
        3- RES (Response Time)

// Vista elements, nombres cortos (en storyboard vista storage)
Actualmente tengo entendido que únicamente los servicios y los deployments poseen nombres cortos.
En la imágen da a entender que posiblemente queráis añadir nombres cortos también a los componentes y a los runtimes.
¿Es así?

// Vista elements, pop-up información
"Cuando pinchas al icono 'i' de cada elemento debería de aparecer un pop-up que permita descargar el manifiesto."
Entiendo que si no se descarga diréctamente el manifiesto al pulsar sobre la 'i' es porque contamos enseñar más información
en el pop-up. ¿La vista que hay actualmente os gusta?