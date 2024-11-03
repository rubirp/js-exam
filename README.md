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

Para realizar este proyecto, se siguieron los siguientes pasos:

1. Revisar detalladamente el archivo `README.md` para comprender los objetivos de la prueba.
2. Realizar un *fork* del repositorio en GitHub desde [NekoGamesRepo](https://github.com/NekoGamesRepo/js-exam) a mi cuenta personal: [rubirp/js-exam](https://github.com/rubirp/js-exam).
3. Clonar el repositorio `rubirp/js-exam` de GitHub a una ubicación local utilizando el cliente de Git GitKraken.
4. Abrir el archivo `package.json` para identificar la versión del motor Cocos Creator utilizada (`"version": "2.4.12"`).
5. Descargar e instalar Cocos Creator en la versión 2.4.12.
6. Abrir el proyecto en Cocos Creator.
7. Configurar tanto el editor de Cocos Creator como el editor de código (Visual Studio Code).
8. Ejecutar el proyecto para verificar su correcto funcionamiento.
9. Realizar el primer *commit* (“commit 0”) con los archivos `.meta` que se generaron al abrir el proyecto.
10. Implementar las funcionalidades descritas en `README.md` siguiendo esta estrategia:
    - Realizar un *commit* por cada funcionalidad implementada (si es aplicable).
    - Nomenclatura de los commits: **Funcionalidad Básica N** como `FB-0N` y **Funcionalidad Especial M** como `FE-0M`. Ejemplo: `FB-07` para la Funcionalidad Básica 7.
    - En el código, documentar cada funcionalidad implementada utilizando comentarios del tipo `// FB-XX` o `// FE-0X`.

## Detalles de Implementación de Funcionalidades

### FB-01 - Estado Inicial de Juego
- **Pendiente de Redactar**

### FB-02 - Actualización de la Apuesta (BET)
- La variable `currentBet` ahora se actualiza en la función `updateState()` del modelo.
- Se añadió la función `incrementCurrentBet()` en el modelo para incrementar la apuesta actual en '1' o reiniciarla al valor mínimo cuando llega al máximo.
- Se agregaron las referencias `currentBetLabel` y `currentBetNode` en la vista principal para mostrar y actualizar el valor actual de la apuesta, escuchando los eventos de clic del usuario.
- La variable de apuesta en el modelo se suscribe al evento correspondiente en la vista para reflejar los cambios de apuesta en pantalla.
- Cuando el jugador hace clic en `currentBetNode`, se llama al método `incrementCurrentBet()` para modificar la apuesta.

### FB-03 y FB-04 - Inicio de la Jugada y Disposición de Elementos en la Vista
- En el modelo se creó una función `doPlay()` que llama al método `play()` con `currentBet` como parámetro, llamada desde la vista cuando el usuario interactúa con el botón de *play*.
- En la vista se añadió la referencia `playButton` y se configuró su evento de clic (`clickEvent`) con el *callback* `onPlayButtonClicked`.
- Este *callback* desactiva el botón *play* para prevenir múltiples clics mientras el juego está en progreso, y previene la modificación de `currentBet` hasta que el juego se reinicie.
- En la vista, al iniciar la jugada, se reinician todos los elementos y se configuran los `itemIds` en orden ascendente.
- El método `showIdleState()` en el *picker* oculta y luego muestra cada nodo con animación, aplicando un retardo específico basado en su `itemId`.

### FB-05 - Selección de Cajas
- Se modificó el *prefab* 'item' para incluir referencias a todos sus nodos hijos.
- Se añadió la variable `selecting` en el modelo para indicar si se está seleccionando un elemento.
- Cuando no se está seleccionando ningún elemento, el método `select()` en la vista del *picker* sigue su ejecución normal.
- En la vista del juego se crean *callbacks* para cada elemento, de modo que cuando el usuario interactúa con un *item*, el método `selectItem(itemId)` del modelo es llamado usando el `itemId` correspondiente.

### FB-06 - Explosión de Confeti y Visualización de Premio
- Se creó un *prefab* de confeti que se instancia en cada *item* al llamar el método `showChosenSubState()`.
- Los subnodos del *item* se activan o desactivan en el *picker* cuando corresponde.
- Se actualizó el *label* para mostrar el valor del premio obtenido en cada caja.

### FB-07 - Actualización y Animación del Contador de Premio
- En el modelo del juego, se guarda el total acumulado de premios de las cajas abiertas en la variable `winAcumulated`.
- En la vista del juego, se suscriben los cambios de esta variable para actualizar el contador de premio a través del método `updateTotalWinAcumulated(totalWinAcumulated)`.
- La animación del *label* del contador de premio se realiza en el método `update()`, donde se incrementa el valor mostrado hasta el total acumulado.

### FB-08 - Cancelación del Conteo al Clic
- Se añadió un evento de escucha en el nodo principal de la vista de juego que ocupa todo el *canvas*.
- Al hacer clic en cualquier parte del *canvas* durante la animación del contador, se detiene el conteo y se muestra directamente el valor total.

### FB-09 - Visualización de Premios de Cajas Restantes
- **Pendiente de Redactar**

### FB-10 - Actualización de Balance y Estado del Juego
- **Pendiente de Redactar**

### FB-11 - Reinicio Automático del Juego
- **Pendiente de Redactar**

---

## Funcionalidades Especiales

### FE-04 - Animación de Monedas Voladoras
- **Pendiente de Redactar**

### FE-05 - Barra de Progreso en el Cargado Inicial
- **Pendiente de Redactar**