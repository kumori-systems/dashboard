# Dashboard
Web dashboard para que los clientes puedan manejar sus instáncias de forma visual e intuitiva.

DECISIONES IMPORTANTES
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








-----------------------------------------------------------

Por fin he encontrado el tipo de objeto que estoy utilizando(FileList) y al final se resuelve bastante sencillo.

Mirando en la documentación de vue-resource, he encontrado el ejemplo perfecto para nuestro caso:

var formData = new FormData();
let fileInput = fileList[0]; //Contando que únicamente añadiremos 1 bundle

formData.append('pic', fileInput, 'mypic.jpg'); // formData.append(name, value, filename);

this.$http.post('/someUrl', formData).then(response => {
  // success callback
}, response => {
  // error callback
});

Ejemplo(https://github.com/pagekit/vue-resource/blob/develop/docs/recipes.md#forms)
FileList(https://developer.mozilla.org/en/docs/Web/API/FileList)
FormData(https://developer.mozilla.org/en-US/docs/Web/API/FormData)


* Lo he comprobado todo para asegurarme que no te topas con dependencias de vue y que los tipos de los argumentos son acordes.
** tipos de value: Blob | File | USVString