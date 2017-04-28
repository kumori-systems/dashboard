TODOS
---------------------------------------------------------
    SideBar
        - El botón deployments no debería de llevarnos a ninguna ruta
        - El botón para desplegar a los hijos no muestra un funcionamiento correcto:
            1 - No aparece al iniciar la página (hay que pulsar en la sidebar)
            2 - Ocurren solapes cuando, al principio, pulsamos otros elementos de la sidebar
    
    connection
        - Si intento instalar swagger, acaba metiendo dependencias que dan un error y, según parece, puede ser solucionado
            cambiando la configuración de webpack. No lo he hecho porque no me parece limpio y muchos después dicen tener
            problemas con otras cosas. Solución: https://github.com/request/request/issues/1529#issuecomment-103454943

    Sidebar & LevelBar
        - La función whatch sigue sin estar clara en typescript. Teóricamente poniéndola en @Component debería de funcionar,
            pero perdemos toda posible referéncia a métodos de dentro de la clase.

    

    

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
