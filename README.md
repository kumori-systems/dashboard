# Dashboard
Web dashboard para que los clientes puedan manejar sus instáncias de forma visual e intuitiva.

DECISIONES IMPORTANTES
---------------------------------------------------------
- Sólo los innerComponents tendrán props y será el id del elemento al que representan.
- No se obtendrán elementos de la estore complejos (Objetos), ya que se ha comprobado que puede dar problemas al refrescar.

- He cambiado los valores de los identificadores en el archivo de métricas para que coincidan con los deployment locales.
- He añadido un parámetro en el archivo de métricas. Este parámetro es para saber a qué instáncia corresponde cada métrica.

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
