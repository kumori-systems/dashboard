TODOS
---------------------------------------------------------
    SideBar
        - Debería de aparecer un icono para desplegar en aquellos elementos que tienen hijos.
    
    connection
        - Si intento instalar swagger, acaba metiendo dependencias que dan un error y, según parece, puede ser solucionado
            cambiando la configuración de webpack. No lo he hecho porque no me parece limpio y muchos después dicen tener
            problemas con otras cosas. Solución: https://github.com/request/request/issues/1529#issuecomment-103454943

    OverView
        - Actualmente no se está ejecutando el final de la promesa. Por lo que leí, posiblemente sólo se ejecuten
            eventos asíncronos dentro de la store (vuex). Probar a mover la promesa dentro de vuex.
            => Ojo! que para webpack posíblemente los eventos asíncronos haya que tratarlos de otra manera:
                https://vuejs.org/v2/guide/components.html#Async-Components
                INTENTAR PASARLO A LA STORE, PORQUE FINALMENTE VA A QUEDARSE AHÍ. SI ESO LO SOLUCIONA ME OLVIDO DEL RESTO.

DONE
---------------------------------------------------------
    Card
        - El contenido debería de poder renderizar etiquetas html

    OverView
        - Las cards deberían de estar en horizontal, por lo menos hasta un grupo de 2.


