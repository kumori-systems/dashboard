# Dashboard
Web dashboard para que los clientes puedan manejar sus instáncias de forma visual e intuitiva.

DECISIONES IMPORTANTES
---------------------------------------------------------
- Sólo los innerComponents tendrán props y será el id del elemento al que representan.
- No se obtendrán elementos de la estore complejos (Objetos), ya que se ha comprobado que puede dar problemas al refrescar.


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

//Vista new Web Service (normal)
Falta por definir

// Memoria, CPU y NET de una instáncia
Actualmente las estoy cogiendo del rol. Sé que deberían de ser los mismos, pero ¿Quieres añadir los datos para cada instáncia o la solución actual te parece bien?