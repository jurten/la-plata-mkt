# Plan de refactor de navegación y páginas de La Plata Marketing

Fecha: 20 de noviembre de 2026

Estado: propuesta de estructura, diseño e implementación para revisión

La Plata Marketing pasa de un recorrido continuo a un sitio con páginas independientes para Trabajos, Nosotros y Contacto. Inicio conserva la presentación de la marca y explica la propuesta; cada página desarrolla una necesidad concreta del visitante. La navbar, el idioma y el footer dan continuidad a todo el recorrido.

Este documento define cómo se verá y funcionará cada sección y el orden del refactor. La implementación de la interfaz queda fuera de esta etapa.

## Decisiones confirmadas y dirección propuesta

### Decisiones confirmadas

- Los enlaces principales abren páginas con URL propia.
- La navbar se oculta al bajar y vuelve a mostrarse al subir.
- Contacto tiene un formulario que envía la consulta por email y acceso directo a WhatsApp.
- Trabajos contiene una galería y cada proyecto abre directamente su sitio o demo, sin una ficha intermedia.
- El equipo mantiene a Joaquín Laumann en Tecnología, Santiago Laumann en Creatividad y Justina Guiñazú en Marketing.
- La presentación del equipo debe ser llamativa y explicar quién es cada persona y qué aporta al proyecto.
- Esta etapa produce el plan, sin cambios en el código del sitio.

### Dirección visual del plan

Se conserva el logo oficial, el azul de LPM, las tipografías actuales, la geometría del ojo y la atmósfera de otra perspectiva. El hero actual, las bandas del equipo y el Coverflow de trabajos son recursos de partida. Las páginas nuevas extienden ese lenguaje con composiciones diferentes según su contenido.

La propuesta elimina Enfoque como destino principal del menú y distribuye su contenido: Qué hacemos y El sistema completo en Inicio; Cómo trabajamos en Nosotros. La grilla de escritorio de Trabajos, las vistas previas de Inicio y el detalle de las biografías son decisiones visuales propuestas en este plan.

## Arquitectura y recorridos

| Página | Español | Inglés | Resultado que debe facilitar |
| --- | --- | --- | --- |
| Inicio | `/` | `/en/` | Entender la propuesta y elegir el siguiente destino |
| Trabajos | `/trabajos/` | `/en/work/` | Explorar proyectos y abrir el sitio o demo |
| Nosotros | `/nosotros/` | `/en/about/` | Conocer al equipo y su manera de colaborar |
| Contacto | `/contacto/` | `/en/contact/` | Enviar una consulta o conversar por WhatsApp |
| Privacidad | `/privacidad/` | `/en/privacy/` | Entender el tratamiento de la información compartida |

Se propone una barra final canónica para todas las páginas. Las variantes sin barra se normalizan hacia la misma URL. Cada página tendrá título, descripción y vista previa para compartir propios.

El recorrido principal es Inicio → Trabajos → sitio o demo → Contacto. El recorrido de confianza es Inicio → Nosotros → Contacto. También debe funcionar la llegada directa a cualquiera de las páginas, sin tener que pasar por el hero.

El logo lleva al inicio del idioma actual. Contacto siempre lleva a la página del formulario; el email directo aparece con su dirección y una acción explícita para abrir el correo. Los fragmentos se reservan para destinos dentro de una página, por ejemplo `/nosotros/#como-trabajamos`.

## Sistema visual compartido

### Color y superficies

| Uso | Apariencia clara | Apariencia oscura |
| --- | --- | --- |
| Fondo de lectura | `#EEF2FF` | `#11151C` |
| Superficie de campos y elementos elevados | `#F8FAFF` | `#1B2330` |
| Texto principal | `#0B1430` | `#EDF2F7` |
| Texto secundario | `#4F5E7D` | `#ACB8CA` |
| Enlaces sobre lectura | `#1536F1` | `#AFC7FF` |
| Acción principal de marca | Cobalto `#1536F1` con texto claro | Cobalto `#1536F1` con texto claro |

El hero mantiene su campo azul fijo. El sistema completo mantiene su escena oscura y sus estrellas. El resto utiliza las superficies de lectura del tema activo, con continuidad entre secciones. Los cambios de fondo responden al contenido y a las escenas de marca.

Se conserva la apariencia automática y la preferencia ya guardada. El selector público continúa siendo ESP / ENG.

### Tipografía y escala

Radio Canada Big organiza títulos, nombres y mensajes principales. IBM Plex Sans lleva párrafos, navegación y formularios. IBM Plex Mono se reserva para etiquetas, categorías y datos breves. Newsreader Italic puede enfatizar una frase puntual de la marca.

Rangos iniciales para componer, a verificar con el contenido real:

| Elemento | Escritorio | Móvil |
| --- | --- | --- |
| Mensaje principal de Inicio | 88–132 px | 48–68 px |
| Título de página interior | 72–104 px | 44–60 px |
| Título de sección | 44–64 px | 32–42 px |
| Nombre en la presentación del equipo | 64–88 px | 28–40 px |
| Título de proyecto | 28–36 px | 24–30 px |
| Texto de lectura | 17–18 px | 16–18 px |
| Etiquetas y metadatos | 12–14 px | 12–14 px |

Los títulos se componen en una o dos líneas en páginas interiores. El mensaje de Inicio conserva sus tres líneas intencionales. Los nombres completos pueden ocupar dos líneas en teléfonos estrechos; nunca se recortan ni se reducen a iniciales para hacerlos entrar. Los títulos y subtítulos no llevan punto final.

Los párrafos mantienen aproximadamente 45–65 caracteres por línea. La versión inglesa se compone con sus propias longitudes, sin forzar los saltos del español.

### Espacio y geometría

En escritorio se trabaja con una grilla de doce columnas, separaciones de 24–32 px y márgenes laterales de 48–80 px. En tablet los márgenes se acercan a 32 px; en teléfono, a 20–24 px. A 320 px se pueden reducir a 16 px si el contenido lo requiere.

Las secciones de lectura dejan 96–144 px entre capítulos en escritorio y 64–88 px en móvil. Dentro de un grupo, título, explicación y acción están visiblemente más cerca entre sí que del siguiente grupo. Ninguna página interior necesita una pantalla vacía de apertura para adquirir presencia.

Las superficies funcionales usan esquinas discretas, de unos 8 px; los campos, unos 4 px. Los retratos del equipo conservan cápsulas fijas. La forma del ojo se usa como firma visual y como indicador de navegación; las fotografías y los textos mantienen un contorno estable.

## Navbar y navegación global

### Composición de escritorio

La barra ocupa todo el ancho y mide inicialmente unos 88 px de alto. El logo oficial queda a la izquierda; Trabajos, Nosotros y Contacto forman el grupo central; ESP / ENG se alinea a la derecha. Los tres grupos comparten eje vertical y los márgenes de la página.

El logo mide aproximadamente 72 px de ancho. Los enlaces se leen en Plex Sans de 15–16 px, con áreas de interacción de al menos 44 px. Contacto adquiere más peso mediante una acción de fondo cobalto y texto claro. Trabajos y Nosotros mantienen una presencia más ligera.

La página activa conserva una señal permanente. Para Trabajos y Nosotros se reutiliza el ojo claro detrás del texto, con texto oscuro. Hover y foco usan una señal más suave y un contorno de foco explícito. En Contacto, su acción principal incorpora una marca o contorno adicional para distinguir la página activa del simple énfasis comercial.

En Inicio la barra es transparente sobre el hero, con logo y controles claros. Después del hero y en todas las páginas interiores utiliza un campo carbón opaco. Esto asegura una lectura estable al pasar sobre fotografías y bloques de texto.

### Ocultamiento y regreso

| Situación | Comportamiento previsto |
| --- | --- |
| Entrada a una página | Barra visible y menú cerrado |
| Primer tramo, aproximadamente una altura de barra | Barra visible |
| Bajada sostenida fuera de ese tramo | Barra se retira hacia arriba |
| Subida sostenida | Barra vuelve a aparecer |
| Movimiento mínimo o rebote del navegador | Mantener el estado anterior |
| Menú o idioma abiertos | Barra visible |
| Foco dentro de la barra | Barra visible durante toda la interacción |
| Llegada mediante enlace interno | Barra visible y título de destino despejado |
| Regreso con el navegador | Recuperar posición y calcular el estado después de estabilizar el contenido |

Como punto inicial, acumular unos 24 px de bajada para ocultar y unos 8 px de subida para mostrar. Son tolerancias para calibrar con mouse y pantalla táctil. El cambio de tamaño del viewport y la apertura del teclado móvil no se interpretan como intención de desplazamiento.

La transición dura aproximadamente 200–240 ms y desplaza la barra completa. El contenido conserva su posición. Con movimiento reducido, el estado cambia sin recorrido animado. Si el teclado lleva el foco a la navegación, esta aparece antes de que el control quede oculto.

### Menú de móvil y tablet

Cuando los enlaces y controles ya no entren con comodidad, la barra pasa a logo a la izquierda y un grupo de idioma y Menú a la derecha. El punto de partida es alrededor de 1000 px, con ajuste según el texto de ambos idiomas. En teléfono la barra mide aproximadamente 72–80 px.

Menú abre un panel de pantalla completa en carbón. Arriba permanecen el logo, el idioma y Cerrar. Debajo aparecen Inicio, Trabajos, Nosotros y Contacto, en cuatro filas de altura generosa, con tipografía de 36–52 px según el ancho y separadores finos. La página actual conserva el motivo del ojo y una señal textual accesible.

La parte inferior contiene una acción directa a WhatsApp y el email. En pantallas bajas el panel puede desplazarse internamente, manteniendo accesible el cierre. La previsualización decorativa de televisión deja lugar a los destinos y canales de contacto en esta propuesta.

El panel entra con una transición corta de opacidad y desplazamiento. Elegir un enlace cierra el panel y abre la página. Escape cierra y devuelve el foco a Menú; el contenido de fondo queda fuera de la interacción mientras el panel está abierto.

### Idioma y transiciones entre páginas

ESP / ENG conserva las banderas y las etiquetas actuales. El desplegable es pequeño, queda anclado a su control y comparte la superficie oscura de la barra. Al seleccionar un idioma, se abre el equivalente de la página actual y se conserva el fragmento cuando existe en ambas versiones.

La navegación usa enlaces reales, compatibles con abrir en otra pestaña, copiar dirección y usar el historial. La propuesta reduce las transiciones televisivas a un acento breve y evita repetir el encendido al entrar en cada página. Si se incorpora una transición entre documentos, debe respetar movimiento reducido y dejar la navegación disponible cuando la animación falle.

## Página de inicio

### Orden de las secciones

| Orden | Sección | Presencia visual | Siguiente acción |
| --- | --- | --- | --- |
| 1 | Presentación de marca | Campo azul y mensaje de gran escala | WhatsApp o avanzar a Qué hacemos |
| 2 | Qué hacemos | Ojos, disciplinas y conexión entre ambas | Comprender los servicios |
| 3 | El sistema completo | Escena oscura con el recorrido de siete conceptos | Explorar cómo se conectan las piezas |
| 4 | Selección de trabajos | Dos portadas y textos breves | Ir a Trabajos o abrir un proyecto |
| 5 | El equipo | Tres retratos y sus roles | Ir a Nosotros |
| 6 | Inicio de conversación | Título y dos canales claros | Ir al formulario o a WhatsApp |
| 7 | Footer | Directorio compacto | Navegar y consultar datos de contacto |

### Presentación de marca

El primer viewport conserva el campo atmosférico azul actual, el texto vivo y el tratamiento WarpText. El mensaje mantiene la composición de tres líneas: Somos un equipo / con ideas de / otro planeta. La alineación alternada se ajusta para que se perciba como una sola frase y conserve aire respecto de la navbar.

La acción Hablemos por WhatsApp queda cerca del mensaje y mantiene el acceso directo. En la franja inferior aparecen Desde La Plata, la descripción breve de marketing y tecnología y la señal de avance hacia Qué hacemos. Esta última deja de nombrar Enfoque.

En teléfono, el mensaje ocupa el centro de la composición y la acción queda debajo, con un área cómoda para el pulgar. Los textos inferiores se ordenan en una franja simple; ninguno queda tapado por los controles del navegador. El hero se adapta a pantallas bajas sin recortar la acción.

Se conserva la salida del hero a través de la silueta oficial. La llegada a Qué hacemos debe mostrar su título y el comienzo del contenido, sin un intervalo vacío. Los efectos se pausan cuando no están visibles. El hero actual no carga un retrato alienígena; este plan no lo reincorpora.

### Qué hacemos

Esta es la nueva ubicación del contenido principal de Enfoque. El título visible es Qué hacemos y una introducción breve explica que LPM conecta comunicación, marketing y tecnología.

La escena mantiene sus tres momentos: Comunicación y marketing, Tecnología y la unión de ambas. En escritorio, el ojo y el texto se reparten la composición; la comunicación comienza a un lado, la tecnología cambia el equilibrio y el encuentro final revela la marca. Cada momento sostiene un título, dos o tres líneas explicativas y una lista breve de servicios.

La tercera parte debe mostrar el trabajo conjunto: de la presencia y la captación a las herramientas y el seguimiento. El método de colaboración se desarrolla en Nosotros; aquí alcanza una acción Cómo trabajamos que lleve a esa sección.

En teléfono, la figura queda arriba y la explicación debajo. La ilustración nunca ocupa tanto alto que obligue a perder el título al leer la lista. La navegación de los tres momentos permanece disponible, con texto de tamaño funcional.

Se propone conservar la secuencia reversible por scroll y retirar el avance automático por inactividad. Así el visitante controla el tiempo de lectura antes de explorar las páginas nuevas. Con movimiento reducido, colores forzados o sin JavaScript se muestran los tres bloques completos en flujo normal.

El detalle de capacidades existente se conserva mediante desplegables simples bajo la escena, agrupado en Web, Captación, Sistemas y Estrategia. Su estado cerrado muestra un resumen útil y una acción clara para ampliar.

### El sistema completo

La sección conserva el fondo oscuro de estrellas y sus límites orgánicos superior e inferior. El cambio de superficie marca el paso de las disciplinas a la relación entre las piezas. El título El sistema completo sigue siendo el centro visual.

En escritorio se mantiene la órbita con Publicidad, Web, Consulta, Comunicación, CRM, Proceso y Venta. Cada concepto conserva su explicación y sus puntos de aplicación. Seleccionar una pieza la trae al frente y permite leerla con estabilidad. El movimiento dispone de pausa y se suspende fuera de pantalla.

En móvil y tablet se mantiene la Circular Gallery ya elegida, con su arco y el contenido legible. El gesto lateral explora conceptos; el gesto vertical permite seguir leyendo la página. Se conserva la ausencia de flechas, contador e indicaciones decorativas. El teclado y la alternativa de lectura normal cubren los contextos que no utilizan el gesto.

El contenido de esta sección se concentra en explicar conexiones. Los botones posteriores llevan a Trabajos o Contacto mediante etiquetas que anticipan el destino. Los nombres de las siete piezas siguen siendo conceptos de la escena.

### Selección de trabajos

Sobre la superficie de lectura, un título Trabajos seleccionados ocupa la izquierda y Ver todos los trabajos se alinea a la derecha. Debajo aparecen inicialmente dos proyectos con portadas del mismo alto y textos breves. El máximo propuesto es tres; se muestran solo los que tengan contenido y destino disponibles.

Cada vista previa tiene imagen, nombre, categoría y Visitar sitio o Ver demo. La descripción ocupa una o dos líneas y explica qué se está viendo. El carácter conceptual, cuando corresponda, permanece visible junto a la categoría.

En escritorio las dos portadas comparten una fila. En móvil se apilan con un espacio claro entre proyectos. Esta selección se lee en flujo normal; la exploración completa con Coverflow queda en Trabajos.

La imagen puede ampliar su escala un 2–3 % al pasar el puntero, dentro de su marco. Título y acción cambian de color o subrayado. El contenido permanece visible desde el principio y el foco recibe una señal equivalente al hover.

### Presentación breve del equipo

El título Tres miradas, un equipo introduce los tres retratos existentes. En escritorio se muestran como cápsulas de igual altura, con nombre completo y rol debajo. Las tres personas tienen el mismo peso visual y un encuadre fotográfico coherente.

Un párrafo breve conecta creatividad, marketing y tecnología. Conocé al equipo lleva a Nosotros. Esta vista previa presenta a las personas; las biografías se leen en la página dedicada.

En teléfono, las cápsulas pueden formar una primera fila compacta si sus rostros se reconocen con claridad. Los nombres y roles se listan debajo en tres filas. A 320 px, se utiliza una lista de retrato pequeño junto a nombre y rol para evitar fotografías diminutas y textos apretados.

### Inicio de conversación

Una línea fina abre el último bloque antes del footer. El mensaje propuesto es Contanos qué querés mejorar, acompañado por una frase breve basada en la conversación y el diagnóstico inicial.

En escritorio, el título ocupa aproximadamente siete columnas y las acciones las cinco restantes. Escribir una consulta abre Contacto; Hablemos por WhatsApp mantiene el canal directo. La primera acción es cobalto y la segunda es un enlace visible con el icono correspondiente.

En móvil, título, explicación y acciones se apilan. La información sobre la primera reunión gratuita puede acompañar las acciones, conservando la afirmación ya presente en el sitio.

## Página de trabajos

### Apertura

La página comienza bajo la navbar sólida, con unos 64–88 px de espacio en escritorio y 32–48 px en teléfono. El título Trabajos queda a la izquierda; una explicación breve a la derecha describe qué se puede explorar. La primera portada comienza dentro del primer viewport en un escritorio de altura habitual.

La introducción mantiene una medida corta. Cuando el contenido sea conceptual, la explicación lo indica junto a la galería. Las categorías de los proyectos describen su alcance; inicialmente no se agrega una barra de filtros para un catálogo de tres piezas.

### Galería de escritorio

La propuesta reemplaza el recorrido horizontal obligatorio de escritorio por una galería vertical editorial. La primera pieza ocupa todo el ancho de la grilla, con la portada en ocho columnas y su información en cuatro. Las siguientes dos se distribuyen en dos columnas iguales, con portadas de la misma proporción y las descripciones debajo.

La primera pieza se elige por la calidad y claridad del material disponible. Si ninguna merece un tratamiento destacado, se utiliza una grilla regular de dos columnas. La decisión depende del contenido y queda resuelta antes de maquetar la versión final.

El primer proyecto usa una portada amplia, aproximadamente 16:10. Las piezas de la fila inferior pueden usar 4:3. Las imágenes comparten un criterio de encuadre y una superficie discreta. Si se usa una captura de un sitio, debe permitir reconocer el trabajo; los textos pequeños de la captura no cumplen la función de descripción.

La información se organiza siempre así: categoría y estado conceptual si aplica, nombre, descripción de dos o tres líneas, aporte de LPM y enlace de salida. Los datos secundarios permanecen por debajo del nombre y no compiten con la imagen.

Cada imagen y su acción abren directamente la URL del sitio o demo. La salida se propone en una pestaña nueva para conservar la galería y su posición; el enlace lo informa visualmente con una flecha externa y con un nombre accesible. La acción comercial Tengo un proyecto parecido queda como enlace secundario y no sustituye la visita al proyecto.

### Galería de móvil y tablet

Hasta el contexto táctil ya definido, se conserva Coverflow. En teléfono, el título y la introducción aparecen primero, seguidos por una tarjeta central de aproximadamente el 80–86 % del ancho y avances laterales de las tarjetas vecinas. El relieve pertenece a las vistas laterales; la tarjeta activa se presenta estable para su lectura.

La tarjeta contiene una portada de altura controlada, nombre, descripción breve, alcance y enlace. La extensión del texto se limita editorialmente para que la acción sea localizable sin recorrer una tarjeta desproporcionada. Si una pantalla baja necesita más alto para mostrar el contenido, la página puede desplazarse verticalmente y la tarjeta no se recorta.

En tablet horizontal, la apertura puede ocupar la columna izquierda y Coverflow la derecha. En tablet vertical, el conjunto se apila cuando la tarjeta pierde ancho de lectura. Las vistas laterales permanecen dentro de su zona visual y no provocan desbordamiento de la página.

Se conserva la decisión de no mostrar flechas, contador ni indicación de swipe. El gesto horizontal cambia de proyecto; el desplazamiento vertical continúa siendo nativo. Los enlaces solo se activan con un toque o clic intencional, después de distinguirlo de un arrastre.

### Material y estados de la galería

| Situación | Presentación y comportamiento |
| --- | --- |
| Trabajo real con publicación autorizada | Nombre, material final y enlace al sitio |
| Concepto con demo disponible | Etiqueta Estudio conceptual y acción Ver demo |
| Concepto sin demo | Se conserva para revisión interna hasta disponer de un destino; queda fuera de la galería visitable |
| URL pendiente durante preparación | Se mantiene fuera del conjunto de trabajos visitables hasta completar el destino |
| Imagen que falla | Superficie reservada y nombre legible, sin cambiar el alto de la composición |
| Sin JavaScript o con colores forzados | Lista de proyectos completa con enlaces nativos |
| Movimiento reducido | Cambios de tarjeta instantáneos y tratamiento visual estable |

El portfolio actual contiene tres estudios conceptuales y no define sus URLs de salida. La experiencia de visitar trabajos depende de completar esos destinos y del material autorizado para publicación. Las piezas conceptuales existentes no se convierten en casos reales por cambiarles el título.

### Cierre de trabajos

Después de la galería aparece un bloque breve con el título ¿Tenés un proyecto en mente? y la acción Contanos tu idea hacia Contacto. Un enlace de menor peso permite conocer al equipo. El bloque pertenece a esta página y continúa hacia el footer, sin revelar Nosotros debajo mediante una animación compartida.

## Página de nosotros

### Apertura

El título propuesto es Tres miradas, un equipo. Una introducción de unas 35–55 palabras explica la combinación de creatividad, marketing y tecnología. El texto acompaña la identidad de LPM sin atribuir experiencia, estudios o logros que todavía no estén confirmados.

En escritorio, título e introducción forman un par editorial: unas siete columnas para el título y cinco para la explicación. El índice del equipo empieza inmediatamente después, con una línea fina que conecta ambos bloques. En móvil el título ocupa dos líneas como máximo y la introducción queda debajo.

### Presentación interactiva del equipo

Se conserva la firma de las tres filas con Joaquín Laumann, Santiago Laumann y Justina Guiñazú. Cada fila muestra el nombre grande a la izquierda, el rol alineado hacia la derecha y una acción Ver perfil. Los separadores finos mantienen el orden y las filas tienen el mismo alto.

En escritorio, hover o foco activa la banda cobalto de la fila. La banda conserva nombres y retratos en cápsulas fijas, con el movimiento horizontal existente. Los bordes se mantienen rectos y los retratos no se deforman. El color diferencia la persona explorada, mientras el rol sigue siendo legible.

Las bandas funcionan como presentación visual. Hacer clic en el nombre o en Ver perfil lleva a la biografía correspondiente, situada debajo en la misma página. Así el recurso llamativo tiene una continuación clara y cada persona cuenta con un enlace compartible.

La permanencia actual de 250svh y su regla vertical se conservan inicialmente como un tramo independiente de Nosotros. Se trasladan fuera del contenedor de Trabajos y se miden desde la llegada del índice. Los enlaces a los perfiles permiten saltar directamente al contenido. En pantallas bajas y movimiento reducido se utiliza flujo normal. La duración de esa permanencia se vuelve a evaluar con las biografías completas para que no entorpezca su acceso.

En táctil se puede conservar la selección visual por scroll existente, con reinicio en los extremos. Tocar Ver perfil realiza una navegación explícita. El contenido personal permanece disponible aunque la banda esté cerrada o la animación no se ejecute.

### Perfiles y aportes

Debajo del índice se presentan tres perfiles editoriales en el mismo orden. Cada perfil es un bloque abierto separado por una línea fina, con retrato, nombre, rol, presentación personal y un texto sobre su aporte al proyecto. Las biografías se muestran completas en el flujo de lectura.

En escritorio, el retrato ocupa cuatro columnas y el texto aproximadamente siete, con una columna de separación. El perfil siguiente invierte la posición de imagen y texto para variar el ritmo. El tercero recupera la primera disposición. Los retratos conservan la geometría de cápsula, una escala comparable y el encuadre propio de cada fotografía.

Cada bloque tiene entre 48 y 72 px de separación interna y entre 80 y 112 px respecto del siguiente, según el ancho. La fotografía tiene suficiente presencia para reconocer a la persona; el texto mantiene su medida de lectura. Los nombres se leen a 40–52 px y los roles, en una escala claramente secundaria.

| Persona | Rol confirmado | Contenido que se debe completar |
| --- | --- | --- |
| Joaquín Laumann | Tecnología | Presentación personal y contribución concreta dentro de esa disciplina |
| Santiago Laumann | Creatividad | Presentación personal y contribución concreta dentro de esa disciplina |
| Justina Guiñazú | Marketing | Presentación personal y contribución concreta dentro de esa disciplina |

La presentación personal debe tener unas 45–70 palabras. El aporte se explica en un segundo párrafo de unas 30–50 palabras o en dos puntos concretos. La distinción ayuda a conocer a la persona y a entender su participación en un proyecto.

En móvil, cada perfil se apila: retrato, nombre, rol, presentación y aporte. Las fotografías mantienen un encuadre ancho en cápsula y un tamaño consistente. El orden de lectura es el mismo en los tres casos. La información se muestra sin hover y los perfiles no quedan fijados al viewport.

No se agregan enlaces de LinkedIn, credenciales ni citas personales hasta disponer de esos datos confirmados. Si un retrato falla, el nombre, el rol y la biografía siguen organizando el bloque; se conserva la superficie de imagen sin sustituir a la persona por una fotografía ajena.

### Cómo trabajamos

Esta sección desarrolla el método que antes acompañaba a Enfoque. Un título de 44–56 px y un párrafo corto introducen una conversación, un diagnóstico y la definición de alcance, tiempos y presupuesto antes de comenzar. Se conserva la información de servicios puntuales y acompañamiento continuo.

Debajo, tres columnas abiertas describen Conversación inicial, Diagnóstico y Definición del proyecto. Cada columna tiene un número pequeño, un subtítulo y un párrafo. La información proviene del método ya comunicado; la redacción final debe mantener ese alcance.

En teléfono se convierten en tres filas verticales, unidas por una línea discreta si ayuda a leer la secuencia. Las tres se ven completas y no requieren activar un paso para descubrir el siguiente. Un texto breve explica la disponibilidad desde La Plata y la colaboración remota.

### Cierre de nosotros

El cierre utiliza el título Conversemos sobre tu proyecto y una acción hacia Contacto. La idea de trabajar con el equipo queda conectada con una tarea concreta. La composición recupera el formato de título amplio y acciones a un lado utilizado al cerrar Inicio.

## Página de contacto

### Primera impresión y composición

Contacto prioriza la lectura y el envío. La página comienza con la navbar sólida y un título Contanos qué querés mejorar. El fondo utiliza la superficie de lectura del tema, con un detalle óptico pequeño cerca del título si acompaña la composición.

En escritorio se divide aproximadamente en cinco columnas de introducción y contacto directo, una de separación y seis de formulario. El título queda alineado con el comienzo del formulario. El primer campo y la acción de WhatsApp aparecen dentro del primer viewport, sin una apertura de pantalla completa.

El formulario se apoya sobre el fondo general, separado por una línea fina. Los campos llevan una superficie ligeramente distinta. El contraste entre texto, campos y acciones organiza la página; el contenido funcional conserva su estabilidad durante la escritura.

### Contacto directo

La columna izquierda contiene una explicación breve, Hablemos por WhatsApp, el número visible y el email seleccionable. La afirmación La primera reunión es gratuita conserva su posición cerca de la invitación a conversar. La ubicación y la disponibilidad remota se muestran debajo en un párrafo de menor peso.

WhatsApp usa una acción cobalto con icono y texto. El email se presenta como dirección legible y enlace directo. Se mantienen los destinos actualmente configurados, salvo una indicación posterior del usuario.

En móvil, después del título aparecen WhatsApp y el email como un bloque compacto. El formulario comienza inmediatamente después. Los detalles de ubicación se pueden ubicar al terminar el formulario para que no alejen el primer campo.

### Campos y jerarquía

| Campo | Requisito propuesto | Presentación |
| --- | --- | --- |
| Nombre | Obligatorio | Etiqueta visible y autocompletado de nombre |
| Email | Obligatorio | Tipo de entrada y teclado apropiados |
| Empresa | Opcional | Indicación Opcional junto a la etiqueta |
| Teléfono | Opcional | Indicación Opcional y validación solo si se completa |
| Mensaje | Obligatorio | Área amplia con ayuda sobre qué contar |
| Aceptación de privacidad | Obligatoria | Casilla y enlace a la política, con un área cómoda de interacción |

Nombre y Email comparten la primera fila en escritorio. Empresa y Teléfono comparten la segunda. Mensaje ocupa todo el ancho, seguido por privacidad, estado y Enviar mensaje. En móvil todos los campos se apilan.

Las etiquetas quedan sobre cada campo, separadas unos 8 px. Los campos miden al menos 52 px de alto y usan texto de 16 px o más. Mensaje comienza con unos 180–220 px de alto y puede crecer. La ayuda propone contar el contexto, qué se quiere mejorar y cómo contactar a la persona, sin exigir un briefing completo.

La separación entre filas es de unos 24 px; entre un campo y su error, de unos 8 px. Los errores aparecen junto al campo y conservan sus asociaciones accesibles. El foco utiliza el azul del tema más un indicador visible. Los placeholders, cuando existan, solo contienen ejemplos.

### Estados del formulario

| Estado | Qué se ve | Comportamiento |
| --- | --- | --- |
| Listo para escribir | Campos, ayuda, privacidad y Enviar mensaje | Todos los datos se pueden editar |
| Datos inválidos | Mensaje junto al campo y resumen cuando sea necesario | El foco llega al primer problema al intentar enviar |
| Enviando | Botón con Enviando y estado textual próximo | Se impide un segundo envío y se conservan los valores |
| Consulta recibida | Confirmación junto al formulario y email al que se responderá | Se evita repetir el envío y se ofrece escribir otra consulta |
| Fallo de envío | Explicación breve y acciones para reintentar o usar WhatsApp | El mensaje escrito permanece intacto |
| Fallo de verificación antispam | Mensaje específico y nueva oportunidad de verificar | Se conserva todo el contenido ingresado |
| Límite de intentos | Explicación sobre la espera y canal directo disponible | El formulario no entra en un ciclo de reintentos |
| Entorno de demostración | Indicación explícita de que no se envió correo real | No se muestra una confirmación de entrega |

El éxito puede decir Recibimos tu consulta y explicar que la respuesta llegará al email indicado. El error general puede decir No pudimos enviar el mensaje. Intentá de nuevo o escribinos por WhatsApp. Se evita prometer un plazo de respuesta que no esté acordado.

La confirmación aparece en el mismo lugar del formulario y mantiene la continuidad visual de la página. El mensaje de estado se anuncia sin depender del color. Si la notificación interna fue aceptada pero falla el correo automático de confirmación, la consulta mantiene su estado de recibida y no invita a enviarla otra vez.

Al cambiar de idioma con un mensaje escrito, el formulario conserva sus valores y los traslada a la página equivalente mediante un borrador temporal en la misma pestaña. Ese borrador se elimina al recuperar los datos en el destino y tiene una caducidad máxima de treinta minutos si el cambio se interrumpe. El traslado no envía el contenido a terceros y no exige volver a escribirlo.

### Envío y cierre de página

Se reutilizan el endpoint de contacto, Resend, Turnstile y las defensas existentes. La empresa pasa a ser opcional en la validación y en el asunto del correo, con una alternativa basada en el nombre cuando no se informa. La confirmación automática se adapta al idioma del formulario.

La página debe manejar fallos del proveedor con una respuesta que el formulario pueda explicar. Se comprueba el modo de entrega antes de mostrar éxito y se confirma la recepción en la casilla de destino durante la validación de la implementación.

La página termina con ubicación, disponibilidad y footer. El botón flotante de WhatsApp se omite en esta ruta para despejar el formulario, dado que el canal está presente en el bloque de contacto directo y en el footer.

## Footer compartido y contacto persistente

El footer conserva tres columnas abiertas: Hablemos, Desde La Plata y Navegá. Cada una empieza con un título de 20–24 px y una línea fina. Los enlaces y párrafos se leen en Plex Sans de 15–17 px. El fondo sigue la apariencia de lectura y el logo oficial cierra la composición.

Hablemos reúne WhatsApp y el email. Desde La Plata mantiene la información local y remota. Navegá ofrece Inicio, Trabajos, Nosotros, Contacto y Privacidad. Qué hacemos y Cómo trabajamos pueden aparecer como enlaces secundarios con su página y fragmento correspondientes.

Contacto abre `/contacto/`; el email tiene su propia etiqueta. La firma de marca vuelve al inicio del idioma actual. Volver arriba desplaza al comienzo de la página que se está leyendo. La línea final incluye año y ubicación con un peso discreto; el dato técnico de apariencia automática deja de ocupar espacio público en esta propuesta.

En móvil se apilan primero Hablemos, luego Navegá y finalmente Desde La Plata. El logo y la línea final conservan una separación clara. Las direcciones largas pueden partir por puntos naturales sin ensanchar la página.

WhatsApp flotante se mantiene en Inicio, Trabajos y Nosotros. Aparece en una posición estable, respeta la zona segura del dispositivo y evita superponerse a enlaces de galería, perfiles y footer. Se oculta cuando el menú está abierto o cuando los canales de contacto del cierre ya están visibles. Su tratamiento visual conserva el cobalto existente.

## Privacidad y páginas de sistema

Privacidad adopta la navbar y el footer comunes. Su contenido utiliza una columna de lectura de aproximadamente 720–800 px, título de 48–64 px en escritorio y subtítulos de 26–32 px. En móvil mantiene los márgenes y el tamaño de lectura compartidos. La página vuelve al formulario mediante un enlace claro a Contacto.

El contenido se actualiza para describir los campos del formulario y los servicios que participan en el envío, incluidos Resend y la verificación antispam, junto con los canales directos existentes. Se retira la afirmación de que el sitio no tiene formulario activo cuando la función se publique.

Una ruta inexistente muestra una página de error dentro de la misma estructura: No encontramos esta página, una explicación breve y acciones para volver a Inicio o ver Trabajos. El estado HTTP corresponde a una página no encontrada. Esta pantalla conserva el idioma de la ruta cuando pueda determinarse.

## Movimiento y adaptación

### Reparto del movimiento

| Superficie | Movimiento con propósito | Alternativa estable |
| --- | --- | --- |
| Navbar | Ocultamiento y regreso según dirección | Cambio de estado inmediato |
| Menú | Apertura y cierre breves | Panel inmediato |
| Hero | Atmósfera, texto y salida por silueta existentes | Texto y acciones sobre campo estático |
| Qué hacemos | Secuencia de disciplinas y encuentro | Tres bloques de lectura |
| Sistema | Órbita o arco de conceptos | Lista completa |
| Trabajos | Coverflow táctil y respuesta discreta de enlaces | Galería de lectura con enlaces |
| Equipo | Bandas y regla del índice | Nombres y perfiles en flujo normal |
| Contacto | Cambios de estado funcionales | Misma información sin animación |

Las animaciones costosas se detienen fuera de pantalla y con la pestaña oculta. La navegación y los estados del formulario están disponibles aunque un efecto visual no se inicialice. El movimiento de entrada nunca es la única forma de revelar texto.

### Contextos de revisión

| Contexto | Decisión de composición |
| --- | --- |
| Escritorio amplio | Grilla de doce columnas y mensajes amplios, manteniendo las medidas de lectura |
| Portátil o escritorio bajo | Menor espacio vertical y escenas adaptadas sin recortar acciones |
| Tablet con tacto | Coverflow de trabajos y Circular Gallery del sistema; menú compacto si hace falta |
| Teléfono vertical | Lectura apilada, perfiles completos y controles al alcance |
| Teléfono horizontal | Flujo normal cuando una escena fijada no entra con comodidad |
| Zoom o texto ampliado | Navegación compacta y bloques capaces de crecer |
| Sin JavaScript | Páginas, enlaces, listas y contenido principal disponibles; el contacto directo sigue accesible |

Los puntos de partida de revisión son 320, 390, 768, 1024, 1440 y 1920 px, además de alturas cortas y ambas orientaciones de tablet. Son tamaños para descubrir problemas de composición, no una promesa de que cada cambio ocurra en un breakpoint fijo.

## Plan técnico de implementación

### Separar estructura y contenido

La estructura del documento HTML, las fuentes, los metadatos, la apariencia, la navbar, el footer y los canales comunes pasan a una base compartida. Cada página entrega su título, descripción, contenido e idioma. Las escenas y sus estilos se cargan solo donde se usan; Contacto y Privacidad no necesitan los efectos del hero o la galería.

La configuración de navegación tendrá una única relación entre identificador de página, etiquetas, rutas equivalentes y estado activo. Se separa de la lógica de scroll de la navbar. Los datos de contacto también tendrán un origen común para mantener consistentes formulario, footer y WhatsApp.

### Responsabilidades actuales que deben cambiar

| Área actual | Cambio requerido |
| --- | --- |
| `src/components/HomePage.astro` | Dejar de contener todas las páginas y delegar la estructura común |
| `src/components/TelevisionNavigation.astro` | Sustituir destinos por fragmentos por enlaces a páginas y ajustar el menú |
| `src/scripts/tv-navigation.ts` | Separar página activa, apertura del menú, scroll y transiciones; eliminar la dependencia de que todas las secciones existan |
| `src/scripts/gooey-navigation.ts` | Vincular la señal activa a la página y respetar teclado y movimiento reducido |
| `src/components/PortfolioReveal.astro` | Independizar la galería del contenedor y la revelación de Nosotros |
| `src/scripts/portfolio-reveal.ts` | Mantener Coverflow y retirar la coordinación entre páginas distintas |
| `src/components/TeamRoster.astro` | Enlazar el índice con los perfiles y mostrar las biografías completas |
| `src/scripts/team-roster.ts` | Medir y desmontar su propia escena dentro de Nosotros |
| `src/components/ServicesSection.astro` | Presentar Qué hacemos y conservar servicios, capacidades y enlaces válidos |
| `src/components/ContactFooter.astro` | Convertir la navegación en enlaces entre páginas y mantener los canales directos |
| `src/lib/i18n.ts` | Resolver todas las parejas de rutas y los textos nuevos |
| `src/lib/team.ts` | Incorporar presentaciones y aportes reales en los dos idiomas |
| Datos de proyectos | Incorporar destino externo, material, categoría, descripción y estado de publicación |
| `src/lib/contact-schema.ts` | Alinear requisitos con el nuevo formulario |
| `src/lib/email.ts` | Aceptar empresa opcional y confirmación localizada |
| `src/pages/api/contact.ts` y su manejador | Ofrecer respuestas interpretables ante validación, verificación y fallos de entrega |
| Sitemap, privacidad y verificador de build | Incluir y revisar todas las rutas nuevas |

Los estilos que hoy dependen de que todo sea una página de inicio se convierten en estilos compartidos o propios de cada escena. La animación de un componente no debe modificar el espacio ni el foco de otra página. Los controladores se inicializan y desmontan de forma consistente con la navegación elegida.

### Compatibilidad de enlaces

| Enlace anterior | Destino previsto |
| --- | --- |
| `/#inicio` | `/` |
| `/#soluciones` | `/#que-hacemos`, conservando una llegada compatible |
| `/#trabajo` | `/trabajos/` |
| `/#nosotros` | `/nosotros/` |
| `/#contacto` | `/contacto/` |
| `/#como-trabajamos` | `/nosotros/#como-trabajamos` |
| `/#team-...` | Perfil equivalente dentro de `/nosotros/` |
| Fragmentos de proyectos conceptuales | Proyecto correspondiente dentro de `/trabajos/`, si se conserva |
| Antiguo `#faq` | Información de cómo se trabaja, sin recuperar una sección de FAQ |

La misma relación se aplica a los enlaces de la versión inglesa. Los fragmentos no llegan al servidor: su compatibilidad debe resolverse en el navegador o mediante puntos de llegada de Inicio con enlaces a las páginas nuevas. No se plantea una redirección HTTP que dependa de leer un fragmento.

### Orden de ejecución

1. Completar el inventario de proyectos, destinos, textos personales y material publicable. Cerrar el orden de las piezas y la composición destacada de Trabajos.
2. Validar la composición de navbar y primeras pantallas de Inicio, Trabajos, Nosotros y Contacto, con sus versiones móviles. La vía propuesta es un boceto previo; la alternativa es revisarlas directamente sobre una primera implementación.
3. Extraer la estructura compartida y crear las rutas con navegación nativa y equivalencias de idioma.
4. Implementar el comportamiento de navbar, menú, idioma, historial y foco antes de adaptar las escenas.
5. Separar Trabajos y Nosotros, trasladar Coverflow y el índice del equipo, y desarrollar perfiles y cierres de página.
6. Reorganizar Inicio con Qué hacemos, El sistema completo y las vistas previas.
7. Construir el formulario, adaptar validación y correo, completar estados y actualizar privacidad.
8. Ajustar el footer, las llegadas antiguas, la página de error, los metadatos y el sitemap.
9. Verificar funciones, composición y recepción de correo; corregir en conjunto los problemas encontrados.
10. Actualizar la documentación de producto, diseño y superficies para que refleje el sitio multipágina final. La publicación se trata como una etapa separada de la implementación.

## Criterios de aceptación

### Navegación

- Todas las páginas abren y recargan mediante su URL, con contenido propio y la opción activa correcta.
- El logo vuelve al inicio del idioma actual y el selector conserva la página equivalente.
- La navbar se oculta al bajar y se muestra al subir, sin parpadeos ni desplazamientos del contenido.
- Menú, idioma y foco mantienen visible la barra; el teclado móvil no altera su estado accidentalmente.
- Atrás y Adelante recuperan un estado coherente, sin bloquear controles ni duplicar escuchas de eventos.
- Los enlaces antiguos conservan una llegada útil y los destinos externos admiten copiar o abrir su dirección mediante controles nativos.

### Composición visual

- Los títulos y subtítulos carecen de punto final y tienen saltos de línea intencionales en ambos idiomas.
- Navbar, títulos, portadas y footer comparten ejes de alineación y márgenes coherentes.
- El primer contenido útil de cada página interior aparece sin atravesar una apertura vacía.
- La grilla de trabajos, los avances de Coverflow y las bandas del equipo no ensanchan el documento.
- Las fotografías mantienen proporción y encuadre, y los tres integrantes reciben un peso comparable.
- Los textos secundarios conservan contraste y tamaño de lectura en ambas apariencias.
- Móvil, tablet, pantallas bajas y zoom mantienen acceso a todos los textos y acciones.

### Contenido y contacto

- Cada trabajo visitable tiene un destino real y el carácter conceptual aparece cuando corresponde.
- Cada integrante tiene una presentación y un aporte concreto basados en información confirmada.
- El formulario distingue datos inválidos, envío, recepción, fallo de verificación, límite de intentos y demostración.
- Los errores conservan los valores escritos y la respuesta de éxito depende del modo de entrega real.
- La casilla configurada recibe una consulta de prueba y la confirmación utiliza el idioma adecuado.
- WhatsApp y el email directo están disponibles con independencia del formulario.
- Privacidad describe los campos y servicios del flujo que efectivamente se publique.

### Validación de la implementación

Se reutilizan las pruebas existentes de validación, correo y antispam, ajustándolas al formulario definitivo. Las pruebas de navegación pasan de comprobar secciones activas a comprobar rutas, idioma, menú, historial y regresos. Las pruebas de galería y equipo verifican que sus escenas funcionan por separado.

La revisión visual cubre ambos temas, los dos idiomas y los tamaños definidos, incluyendo hover, foco, menú abierto, tarjeta activa y estados del formulario. El contacto se prueba con una entrega controlada al destino configurado; las credenciales y la configuración real se verifican en la etapa de implementación.

## Material que falta completar

| Material | Uso | Condición para cerrar el diseño |
| --- | --- | --- |
| URLs de sitios y demos | Acciones de la galería | Cada trabajo visitable tiene un destino accesible |
| Portadas y capturas finales | Selección de Inicio y galería | Material con encuadre y resolución adecuados |
| Estado de publicación de cada proyecto | Nombre, descripción y material público | Separar trabajos autorizados y conceptos |
| Presentación y aporte de Joaquín | Perfil de Tecnología | Texto real con extensión comparable a los otros perfiles |
| Presentación y aporte de Santiago | Perfil de Creatividad | Texto real con extensión comparable a los otros perfiles |
| Presentación y aporte de Justina | Perfil de Marketing | Texto real con extensión comparable a los otros perfiles |
| Traducciones de contenido nuevo | Todas las páginas y confirmaciones | Texto completo y compuesto para cada idioma |

Los retratos y los roles actuales ya sirven como base. Los destinos, biografías y textos finales se completan antes de presentar el contenido como listo para publicación.

## Referencias de implementación

- [Rutas y enlaces nativos en Astro](https://docs.astro.build/en/guides/routing/)
- [Navegación accesible y estado de página actual en W3C](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)
- [Decisiones actuales del portfolio táctil](portfolio-touch.md)
- [Presentación e interacción actuales del equipo](team-flowing.md)
- [Identidad visual y decisiones de diseño del proyecto](../DESIGN.md)
- [Contexto y restricciones de contenido del proyecto](../PRODUCT.md)
