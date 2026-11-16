# Componentes 2D para una hero entre estrellas

Investigación actualizada: 15 de noviembre de 2026.

## Dirección del usuario

- Descartar el alien y el texto actual.
- Descartar el 3D y las referencias Lusion, Active Theory y Antinomy de la selección anterior.
- Mantener Monopo London como referencia de atmósfera.
- Buscar componentes que tengan sentido sobre el fondo de estrellas y sirvan a una apertura de página.

Esta es una selección de referencias y propuestas de adaptación. No se modificó la hero ni se instalaron componentes.

## Tres alternativas para la composición principal

### A. Aurora entre las estrellas — primera elección

[Demo y documentación de Aurora, React Bits](https://reactbits.dev/backgrounds/aurora)

El componente genera una aurora suave con movimiento. Para LPM: una franja difusa cobalto/celeste que atraviese parte del cielo, con grandes zonas negras y desplazamiento lento. Las estrellas conservan su lugar como fondo. El interés visual viene de una masa de luz amplia, próxima a la atmósfera de [Monopo London](https://monopo.london/).

Es la opción recomendada para una primera exploración porque desarrolla la única referencia que el usuario consideró útil.

### B. Horizonte luminoso — alternativa más gráfica

[Demo y documentación de Lamp Section Header, Aceternity](https://ui.aceternity.com/components/lamp-effect)

El original produce una línea de luz y su resplandor. Para LPM: situar el foco cerca del borde inferior y explorar un arco muy abierto, como un horizonte recortado. El arco es una adaptación propuesta, no una propiedad documentada de Lamp. La apertura conservaría un cielo amplio arriba y una referencia visual clara abajo.

### C. Órbitas 2D — alternativa más geométrica

[Demo y documentación de Orbiting Circles, Magic UI](https://magicui.design/docs/components/orbiting-circles)

El componente mueve elementos sobre trayectorias circulares. Para LPM: dos arcos enormes, finos y parcialmente fuera de cuadro, con pocos puntos luminosos desplazándose. Tomar las trayectorias del ejemplo; sus logos de aplicaciones no forman parte de la propuesta. Los arcos dan escala y dirección al campo de estrellas.

## Componentes secundarios

| Componente y demo | Función en esta hero | Adaptación propuesta |
| --- | --- | --- |
| [Shooting Stars, Aceternity](https://ui.aceternity.com/components/shooting-stars-and-stars-background) | Un acento breve dentro del cielo | Una única estrella fugaz ocasional, con trazo fino y blanco azulado. Conservar el fondo de estrellas existente. |
| [Moving Border, Aceternity](https://ui.aceternity.com/components/moving-border) | Dar presencia al botón principal | Un tramo de luz azul que recorra despacio el borde; interior oscuro y etiqueta estable. |
| [Lens, Aceternity](https://ui.aceternity.com/components/lens) | Explorar una interacción relacionada con Monopo | Una pequeña región de aumento sobre el cielo. El ejemplo amplía imágenes; aplicarlo a la capa de estrellas requeriría una adaptación propia. |
| [Light Rays, React Bits](https://reactbits.dev/backgrounds/light-rays) | Una alternativa de iluminación direccional | Luz desde una esquina, con apertura amplia e intensidad baja. Sería una alternativa a la aurora, no otro efecto sumado a la misma composición. |

## Combinación recomendada

Estrellas existentes + Aurora azul difusa + Moving Border en la acción principal.

La aurora organiza el conjunto; el botón concentra la interacción. La composición debe conservar zonas oscuras, una navegación compacta y espacio suficiente para resolver luego el mensaje. Una estrella fugaz puede evaluarse como detalle posterior.

Los enlaces llevan a las demos y documentación originales. Los ejemplos usan React; su integración en el proyecto Astro es una decisión posterior. La selección se refiere al resultado visual en 2D y no requiere modelos ni escenas tridimensionales.
