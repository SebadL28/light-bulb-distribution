---
title: Light bulb distribution
description: Aplicativo para solución de problema planteado.
---

# Light bulb distribution 

Este aplicativo soluciona el siguiente problema planteado:

>    Un electricista muy cuidadoso está tratando de iluminar al mas bajo costo posible las habitaciones de sus clientes. Las habitaciones que él ilumina, siempre son habitaciones en forma de Matriz. Como los bombillos son muy costosos, él trata de iluminar toda la habitación utilizando la menor cantidad de los mismos.
>
>    Los bombillos sólo tienen alcance de iluminar la habitación de forma horizontal y de forma vertical.
>
>    Lo único malo es que las habitaciones pueden tener las paredes dentro de ellas, en cuyo caso, se interrumpiría el alcance de la luz de un bombillo determinado.


## Tecnologias utilizadas

Para este proyecto se utilizó

- Angular 12.2
- HTML5 / CSS3
- Bootstrap

## Instalación

Se requiere tener instalado:

- Node.js
- npm package manager
- [Angular CLI](https://angular.io/guide/setup-local).

Dentro de la carpeta `app` se deben correr el siguiente comandos:

    npm install

Despues, para correr el proyecto se utiliza el siguiente comando:

    ng serve

Y por ultmo se ingresa a la url generada
> Normalmente es http://localhost:4200/

Para compilar se utliza el comando:

    ng build


### Dist

En caso de que no se quiera correr toda la instalación, se puede copiar la carpeta [dist](https://github.com/SebadL28/light-bulb-distribution/tree/master/dist) y abrir el `index.html`


## Funcionamiento

Se debe cargar una matriz del siguiente tipo

    [
        [0,0,0,1,1,1,0,0],
        [0,1,0,0,0,1,0,0],
        [0,1,0,1,0,0,1,0],
        [0,1,0,0,1,0,0,0],
        [0,1,1,1,0,1,0,0],
        [0,1,0,0,1,1,0,0],
        [0,1,0,0,1,0,0,0]
    ]

Donde 0 son los caminos libres (Donde se pueden colocar los bombillos) y 1 los muros (Que bloquean la luz).

Despues dar click en la opción de `Cargar bombillos`.

> Validar 2 pasos: 
> Esta opción permite generar una mayor cantidad de combinaciones, pero generalmente tarda mas en procesar.

Cuando se ha terminado de cargar los bombillos, se puede navegar entre los resultados con los botones de navegación.

## Autor

- Sebastian Leiva