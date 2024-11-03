# Picker Minigame

## Consigna:

Se trata de un minigame de slot (Picker) en el cual el usuario selecciona cajas de regalo. Cada caja puede arrojar 2 resultados diferentes: un valor de premio en dinero o bien un valor de 0 que indica que se ha terminado. El usuario puede elegir hasta 5 cajas máximo, ya que la sexta caja será inevitablemente un 0. Existe solo una caja 0 y puede aparecer en cualquier posición. La información la recibe de una implementación mock del servicio de back-end.

El juego está a medio hacer, con lo cual hay que proseguir y terminar las funcionalidades básicas y algunas mejoras.

## Funcionalidades Básicas:

1. **El juego comienza cuando está listo para jugar**, esto es, cuando el juego ya se ha cargado y se muestra en la página web del editor de cocos creator (estado `readyToPlay`). El servidor debe pasar por un proceso de `loading`, durante este proceso (cuando se llama al método `refresh`), el juego permanece con la pantalla en negro.
2. **El jugador puede cambiar el valor de la apuesta** antes de jugar haciendo click en la bottom bar en la sección donde figura el `BET`. El funcionamiento es simple, cada vez que se hace click en el `BET`, se aumenta hasta llegar al valor máximo en cuyo caso vuelve a empezar desde el valor mínimo otra vez.
3. **El jugador hace clic o tap en el botón de play** (en esta instancia el botón de play debería estar visible) y está habilitado para jugar.
4. **En el momento de darle play**, el valor del balance se reduce en la cantidad apostada (recuperar el valor del balance del server). Ya no es posible cambiar el valor de la apuesta hasta que se vuelva a jugar otra vez. Aparecen las cajas sobre los estantes 1 por 1 de izquierda a derecha y de arriba abajo (actualmente la versión incompleta muestra las cajas ni bien inicia la jugada). El botón de play pasa a un estado inhabilitado y no tiene interacción con el usuario hasta que se vuelva a reiniciar o se termine de jugar (se haya obtenido un 0 o bien se hayan seleccionado 5 cajas). A partir de ahora el juego estará en estado `playing`.
5. **El usuario selecciona cualquiera de las cajas** puede elegir siempre cualquiera de las cajas cerradas. Cuando hace click o tap en alguna, la caja pasa a un estado de selección y ya no puede elegirse hasta que el contenido de la caja no sea revelado.
6. **Cuando el servidor devuelve el resultado**, la caja explota, mostrando unas partículas (`/particles/confetti`) centradas en la caja y la misma pasa a un estado gráfico de caja vacía si el resultado fue un 0, o bien una caja con monedas junto a un label que indica el monto ganado.
7. **Si el monto es distinto de 0**, el contador de premio de la parte superior, se enciende (`/textures/prizeFrameOn`), empieza a contar desde su valor actual (comenzando por 0 ni bien comienza el round), hasta el valor total acumulado (de los premios de cada caja descubierta). La velocidad del contador debe ser proporcional a la cantidad apostada, siendo de 2 segundos si el valor corresponde justo a la cantidad apostada.
8. **Durante el proceso de conteo**, el usuario puede hacer clic en cualquier lugar de la pantalla y cancelar el conteo.
9. **Si se obtuvo una caja vacía**, se termina el round, pero antes se abren el resto de las cajas, mostrando el resto de los valores (esto lo devuelve el server) pero con una fuente black & white del premio y un valor semiopaco para el asset de la caja (`opacity=192`), para diferenciarlo del resto.
10. **El valor del balance (bottom bar)** se actualiza con el valor acumulado hasta el momento (esto lo calcula el servidor solo). El juego vuelve nuevamente a `readyToPlay`. La jugada queda como terminó con toda la información en pantalla pero obviamente no se puede interactuar con ninguna de las cajas.
11. **El proceso se repite hasta quedarse sin dinero**, en cuyo caso el juego no debe permitir jugar si no puede pagar la jugada. Si se vuelve a jugar la pantalla del juego se limpia (las cajas desaparecen, el contador de premio vuelve a 0) y vuelven a aparecer las cajas 1 a una igual que en el punto 4.

## Funcionalidades Especiales:

Las funcionalidades especiales no son requeridas, pero serán tenidas en cuenta a la hora de evaluar el desarrollo siempre y cuando estén bien diseñadas y se hayan completado correctamente las funciones básicas. Estas funcionalidades opcionales no reemplazan a las funciones básicas. Elegir hasta 2 máximo:

1. **Versión Portrait**: La versión incompleta tiene una vista favorable para la versión landscape (más ancho que alto). Esta consigna consiste en hacer una versión portrait y que el juego se adapte al cambiar la orientación en la página web del editor (al hacer clic en rotate). En esta versión deben aparecer 3 estantes en lugar de 2, pero cada estante tiene que tener exactamente 2 cajas de regalos (el asset de estantería ya está adaptado para que se pueda expandir usando nine-scale).
2. **Agregar sonido**: Agregar sonido (carpeta `sounds`) a los eventos más importantes del juego. Elegir cualquier mp3 de música, y ponerlo como música de fondo solo durante la fase de play. La música debe hacer fadeout a la mitad del volumen cuando está sonando cualquier efecto sonoro, y volver al valor de volumen luego del efecto.
3. **Recovery de jugadas**: Hacer recovery de jugadas, actualmente el servidor persiste en caché local cualquier jugada previa que quedó a la mitad (NOTA: para evitar el cache se puede pasar una opción al método `refresh` del server). La idea de esta consigna es poder cargar un juego a la mitad y terminarlo. La carga la realiza el servidor al llamar al método `refresh`.
4. **Monedas voladoras**: Hacer que mientras el contador se va incrementando, luego de haber elegido la caja con premio, salen volando monedas (`textures/coin`) desde la caja hacia el contador (las monedas no deben desaparecer de la caja, simplemente vuelan monedas hacia el contador y se desvanecen al llegar).
5. **Loading de barra de progreso**: Hacer un loading de barra de progreso reemplazando el que está actualmente.


## Pasos de desarrollo:

Para realizar el proyecto, he seguido los siguientes pasos:

1. Leer detenidamente este archivo (`README.md`) para obtener una visión general de los objetivos de la prueba.
2. Hacer un 'fork' del repositorio https://github.com/NekoGamesRepo/js-exam en mi cuenta de GitHub: https://github.com/rubirp/js-exam.
3. Clonar localmente el repositorio `rubirp/js-exam` (usando como cliente de Git, el software GitKraken).
4. Abrir el archivo `package.json` para ver la versión del motor Cocos Creator utilizada (`"version": "2.4.12"`).
5. Descargar el motor Cocos Creator v2.4.12.
6. Abrir el proyecto con el motor previamente descargado.
7. Configurar el editor del motor y el editor de código (Visual Studio Code).
8. Ejecutar el proyecto.
9. Realizar el 'commit 0' con los archivos (.meta) que se modificaron automáticamente al abrir el proyecto.
10. Implementar las funcionalidades descritas en el archivo `README.md`. Estrategia a seguir:
    - Un commit por cada funcionalidad (Si es necesario o si es posible)
    - Ejemplos: Funcionalidad Básica 7 = FB-07, Funcionalidad Especial 3 = FE-03.
    - Comentarios en el código con el estilo `// FB-XX` y `// FE-0X` indicando la funcionalidad o funcionalidades que resuelven.
  
## Detalles de implementación de funcionalidades:
**FB-01, Funcionalidad Básica 1**
- Nada que hacer respecto a esta funcionalidad. El proyecto implementa desde el inicio el comportamiento deseado.
- El juego no permanece con la pantalla en negro (solamente) durante este proceso, sino que tambien aparece un Label que muestra 'Loading...'. No he eliminado el Label porque entiendo que mostrar este Label junto con el fondo negro es el comportamiento deseado.

**FB-02, Funcionalidad Básica 2**
- Ahora se modifica la variable `currentBet` en la funcion `updateState()` del modelo
- Se ha implementado en el modelo la funcion `incrementCurrentBet()` que tiene en cuenta el bet actual y lo incrementa en '1' entre los permitidos o lo inicializa al primero permitido si es el ultimo
- Se han añadido en la escena 'main' y en la vista las referencias necesarias. `currenBetLabel` para mostrar el valor del bet actual y `currentBetNode` que escucha los eventos de 'click' del usuario.
- Suscribimos la variable bet del modelo al evento correspondiente de la vista para que actualice los valores al modificar el valor, como ocurre con el resto de variables (`this.model.value.getCurrentBet().subscribe(this.updateCurrentBet.bind(this))`)
- Cuando el jugador hace 'click' en el area del `currentBetNode` se llama al metodo `incrementCurrentBet()` del modelo antes mencionado.

**FB-03, Funcionalidad Básica 3 & FB-04, Funcionalidad Básica 4**
- Del lado del modelo sólo es necesario implementar una función llamada `doPlay()` que llama al metodo `play()` con el `currentBet` como parámetro. Esta función es llamada desde la vista cuando el usuario interactua con el botton de 'play'.
- En la vista añadimos la referencia `playButton` y desde el editor implementamos su `clickEvent` (callback).
- Este callback recibe el nombre de `onPlayButtonClicked`. En el momento de ser llamado deshabilita el boton de 'play' para evitar interacciones consecutivas por parte del usuario.
- Tambien evitamos incrementar el `currentBet` con el node de `currentBetNode` si el boton de 'play' no es interactuable.
- En la vista del juego al interactuar con el boton de jugar reseteamos tods los items
- En el editor modificamos todos los 'itemsIds' desde el 0-5 de forma ascendente
- En la vista del picker implementamos el método `showIdleState()` que primero oculta el nodo y luego lo muestara con una animacion y un determnidado delay dependiendo de su 'itemId'

**FB-05, Funcionalidad Básica 5**
- Se ha modificado el prefab 'item' apra que contenga referencias a todos sus nodos hijos
- En el modelo del game se ha creado una variable `selecting` que indica si se está seleccionado algun item
- Si no se esta seleccionado ningun item el método `select()` llamado desde la vista del picker continua su ejecucion normal.
- Desde la vista del game se crean callbacks para todos los items cuando se interactua con ellos. 
- Cuando se intactua con un item se obtine su `itemId` y se llama a la funcion `selectItem(itemId)`del modelo del juego
  
**FB-06, Funcionalidad Básica 6**
- Se ha creato un prefab con la 'explosion' de confetis que se instancia en cada item cuando se llama al metodo `showChosenSubState()`
- Los nodos hijos del item que represetan el subestado del item son activados y descativados en la vista del picker cuando corresponde.
- El label ahora muestra el contenido del precio obtenido

**FB-07, Funcionalidad Básica 7**
- En la modelo del juego cada vez que se selecciona una caja se almacena en una variable el total de precios acumulados de las cajas abiertas, `winAcumulated`
- En la vsta del juego nos suscribimos a los cambios de esta variable y cuando es modigicama llamamos al método `updateTotalWinAcumulated(totalWinAcumulated)`
- En ese método almacenamos todas la variables necesarias para que posteiormente en el metodo `update()` animemos el Label con la la cantidad acumulada.

**FB-08, Funcionalidad Básica 8**
- Se ha añadido un evento de escucha al nodo completo de game view que ocupa todo el canvas.
- Cuando el jugador interactua con este nodo si se ha iniciado la aimacion del contador del total acumulado, el conteo se detien y avanza hasta la cantidad objetivo.

**FB-09, Funcionalidad Básica 9**
- TODO

**FB-10, Funcionalidad Básica 10**
- TODO

**FB-11, Funcionalidad Básica 11**
- TODO

---

**FE-01, Funcionalidad Especial 01**
- TODO

**FE-02, Funcionalidad Especial 02**
- TODO

**FE-03, Funcionalidad Especial 03**
- TODO

**FE-04, Funcionalidad Especial 04**
- TODO

**FE-05, Funcionalidad Especial 05**
- TODO
