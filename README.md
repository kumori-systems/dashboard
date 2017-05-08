# Dashboard
Web dashboard para que los clientes puedan manejar sus instáncias de forma visual e intuitiva.

PREGUNTAS
---------------------------------------------------------
// Estado deployment
¿Cómo detecto el estado de un deployment? Si me dices que parámetros tengo que tener en cuenta puedo hacer el cálculo, si prefieres que sea un parámetro que obtengo del JSON también me sirve.

// detección del website
Para detectar el website Jero me ha explicado que tengo que mirar los deployments lincados, mirar si alguno es un servidor
http-inbound, entrar en la definición del servício, y la dirección web debería ser el parámetro vhost.
* No miro si el propio servicio es http-inbound. Por lo que aparece en la lista de servicios sin website. Jero me ha comentado
que posiblemente estos no queremos que aparezcan, pero que confirme contigo. Actualmente aparecen.

// Componentes y roles
Por lo que he visto, puede haber varios componentes ejecutando el mismo rol. En la vista overview del storyboard hay por cada rol una línea que apunta a un componente. Entiendo que entonces ¿sería correcto añadir una línea por cada componente? En este caso, entiendo que el número de instáncias sería representadas por componente, ¿me equivoco?.


DECISIONES IMPORTANTES
---------------------------------------------------------
Los inner components no tendrán más props que el id del elemento que representen.
Ésto es porque si cualquier parámetro del elemento al que representan cambia, deberíamos de tener un watch para el prop.
Para evitar ésto, representamos cada parámetro pidiéndolo a la store.

TODOS
---------------------------------------------------------
    SideBar
        - El botón para desplegar a los hijos no muestra un funcionamiento correcto:
            1 - No aparece al iniciar la página (hay que pulsar en la sidebar)
            2 - Ocurren solapes cuando, al principio, pulsamos otros elementos de la sidebar
    
    connection
        - Si intento instalar swagger, acaba metiendo dependencias que dan un error y, según parece, puede ser solucionado
            cambiando la configuración de webpack. No lo he hecho porque no me parece limpio y muchos después dicen tener
            problemas con otras cosas. Solución: https://github.com/request/request/issues/1529#issuecomment-103454943

    Sidebar & LevelBar
        - La función whatch sigue sin estar clara en typescript. Teóricamente poniéndola en @Component debería de funcionar,
            pero perdemos toda posible referéncia a métodos de dentro de la clase, por lo que resulta inútil.
    
    Deployments
        - Proponer que la vista 'Overview' pase a ser la página de deployments
        - El nombre de los hijos no aparece en la ruta
        - El contenido de la vista de deployments debería ser sustituido si router-view tiene contenido

    Rol-Card
=>        - Debería de aparecer en deploymentItem
=>        - Solucionar problemas con las gráficas; actualmente no aparecen

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

    Deployments
        - Los childs de deployments aparecen evitando la llamada a this.$router.addRoutes(routes)
