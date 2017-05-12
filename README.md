# Dashboard
Web dashboard para que los clientes puedan manejar sus instáncias de forma visual e intuitiva.

PREGUNTAS
---------------------------------------------------------
// Primer campo en el título de los deployments
Actualmente en OVERVIEW en todos los deployments tengo 'slap://eslap.clod', donde en el storyboard pone 'CALCULATOR-5'.
Pero entiendo que ésto no es correcto. He preguntado y no han sabido contestarme, entonces, ¿a qué campo en el JSON corresponde ésta parte del título?

// Estado Instáncias
¿Cómo detecto el estado de una instáncia? Si me dices que parámetros tengo que tener en cuenta puedo hacer el cálculo o si prefieres que sea un parámetro en el JSON también me sirve.
Por otro lado, entiendo que el estado del rol y el estado del deployment van a depender de éste. La forma que tenía pensada
es todo bien, excepto si  nºwarnings>0 (que sería warning) y en el caso que  nºerrores > 1 SIEMPRE se mostraría error, tanto en los roles como en el deployment.

// Datos monitorización para una instáncia
Me hace falta una representación de cómo voy a recibir los datos de monitorización de una instáncia. Con esto me refiero
a la estructura con la que voy a recibir los datos, si van a estar metidos dentro del JSON que recibo al principio en algún campo
o si voy a tener que hacer alguna llamada aparte al servidor para obtener éstos datos.

//¿Media o suma?
Respecto a los distintos datos representados en un instáncia, a medida que van acumulándose para representar los roles y los deployments, tengo que saber cáda uno cómo se 'acumula'. Entiendo que lo que me respondas servirá tanto para datosInstancia->datosRol como para datosRol->datosDeployments.
- CPU ¿media o suma?
- MEM ¿media o suma?
- NET ¿media o suma?
- **Hay dos campos que no entiendo, lo siento

/**************************************************************/
/* A PARTIR DE AQUÍ PUEDE ESPERAR, PERO POR DEJARLO PLANTEADO */
/**************************************************************/

// Cuándo listas vacías
¿Qué debería aparecer cuando las listas están vacías?
-Cuando no hay deployments (servicios) todavía
-Cuando no hay roles en un deployments (se puede dar el caso?)
-Cuando no hay instáncias de un rol en un deployment (se puede dar el caso?)
-Cuando no hay links

// ¿Preferéncias de representación de espera de finalización de petición?
Hay alguna preferéncia en qué hacer MIENTRAS el usuario está esperando a que el servidor conteste una petición?
Te propongo varias alternativas, si no tenías nada pensado;
    -> Mensaje al lado del botón 'apply' "in process.." que cambia a "done"/"retry" cuando la acción acaba.
    -> Círculo estilo el de android que va dando vueltas hasta que la acción acaba. En este caso habría que pensar
        cómo avisar al ususario de que la acción ha acabado correctamente o no.
    
// Componentes y roles
Aquí tengo un poco de jaleo porque entendí que varios componentes pueden comportarse como el mismo rol. Actualmente
asumo que el componente y el rol tienen el mismo nombre.
Por lo que entendí, Jero me comentó que actualmente hay algo intermedio, en el que un rol únicamente puede ser llevado por un componente, en cuyo caso tendría sentido lo que está hecho ahora. Cambiarlo no cuesta mucho, simplemente no encontraba
el objeto que relaciona ambos. Lo dejo anotado y cuando tenga un tiempo lo arreglo.

// Componentes, roles e instáncias
Siguiendo con el caso anterior, las instáncias a representar serían por rol o por componente?
Lo pregunto por que aparece un número de instáncias que vamos cambiando.



DECISIONES IMPORTANTES
---------------------------------------------------------
Los inner components no tendrán más props que el id del elemento que representen.
Ésto es porque si cualquier parámetro del elemento al que representan cambia, deberíamos de tener un watch para el prop.
Para evitar ésto, representamos cada parámetro pidiéndolo a la store.

TODOS
---------------------------------------------------------    
    Proxy -> Connexión
        - Si intento instalar swagger, acaba metiendo dependencias que dan un error y, según parece, puede ser solucionado
            cambiando la configuración de webpack. No lo he hecho porque no me parece limpio y muchos después dicen tener
            problemas con otras cosas. Solución: https://github.com/request/request/issues/1529#issuecomment-103454943

    Deployments
        - El nombre de los hijos no aparece en la ruta de la navbar (breadcrumb)
        - El contenido de la vista de deployments debería ser sustituido si router-view tiene contenido

DONE
---------------------------------------------------------
    Card
        - El contenido debería de poder renderizar etiquetas html

    OverView
        - Las cards deberían de estar en horizontal, por lo menos hasta un grupo de 2.
        - Eventos asíncronos en vuex.
        - Añadir icono flotante '+' con las opciones desplegables:
            -> Deploy a new HTTP Entrypoint
            -> Deploy a new Web Service
            -> Deploy a new service (advanced mode)
        - Acabar de mirar cómo ocultar los entrypoints

    SideBar
        - Debería de aparecer un icono para desplegar en aquellos elementos que tienen hijos.
        - Falta por hacer que aparezcan distintos deployments
        - El botón para desplegar a los hijos no muestra un funcionamiento correcto:
            1 - No aparece al iniciar la página (hay que pulsar en la sidebar)
            2 - Ocurren solapes cuando, al principio, pulsamos otros elementos de la sidebar    

    Deployments
        - Los childs de deployments aparecen evitando la llamada a this.$router.addRoutes(routes)
    
    Rol-Card
        - Debería de aparecer en deploymentItem
        - Solucionar problemas con las gráficas; actualmente no aparecen

    Sidebar & LevelBar
        - Sustituida función whatch grácias a la store.