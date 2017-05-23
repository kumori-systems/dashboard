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

// CPU, MEM y NET de una instáncia
Actualmente se muestran los correspondientes al rol, ya que no he podido encontrar el dato relativo a cada instáncia. Si ésto se cambia en el futuro lo actualizo.

// Runtimes
¿Puede un servicio tener más de un runtime? Actualmente sólo cuento con que haya uno