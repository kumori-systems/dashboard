# Dashboard
Web dashboard para que los clientes puedan manejar sus instáncias de forma visual e intuitiva.

CAMBIOS EN FICHEROS DE EJEMPLO
---------------------------------------------------------
- He cambiado los valores de los identificadores en el archivo de métricas para que coincidan con los deployment locales.
- He añadido un parámetro en el archivo de métricas. Este parámetro es para saber a qué instáncia corresponde cada métrica.

USUARIO NUEVO
---------------------------------------------------------
Cuando un usuario se crea, éste no debería de tener deployments y, por tanto la vista overview estaría vacía.
¿Qué preferís que aparezca? Ejemplo: un mini tuotrial

VISTA NEW WEB SERVICE
---------------------------------------------------------
Falta por definir. Bajo mi punto de vista, actualmente no es necesaria y se podría definir en un futuro dependiendo de las necesidades de la plataforma y la forma que creamos que se puede agilizar la creación de un web service.

CHARTS (NO ENTRYPOINTS)
---------------------------------------------------------
-> NET: Hay red de bajada y red de subida. ¿Hago una suma para enseñar el uso total de red? ¿O debería de enseñarlo como dos valores separados?

CHARTS (ENTRYPOINTS)
---------------------------------------------------------
Necesitaría una breve esplicación de las métricas.
¿Se van a querer utilizar todas las métricas que aparecen?
¿Tengo que hacer cálculos con alguna de ellas?
¿Rango de valores de cada métrica?
¿Puedo sacar alguna métrica con porcentajes?

INFORMACIÓN COMPONENT, SERVICE y RUNTIME
---------------------------------------------------------
Queda por definir qué información se mostrará cuando pinchamos sobre el borón 'info' en la vista elements sobre cada tipo de componente.

DATA VOLUMES CHUNKS
---------------------------------------------------------
No sé cómo sacar el número de chunks utilizados. De hecho, agradecería una definición de 'chunk', ya que la que he visto es 'fragmento de información'.

INFORMACIÓN VOLUMENES
---------------------------------------------------------
Queda pendiente obtener la información de los volúmenes, para overview el porcentaje de uso y para la vista 'data volumes'