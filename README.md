# Sistema de Gestión de Cajas

<h1 align="center">
  <br>
  <img src="https://avatars.githubusercontent.com/u/186534649?v=4" alt="Logo de tu empresa" width="200">
  <br>
  Sistema de Gestión de Cajas
  <br>
</h1>

<h4 align="center">Aplicación web para la gestión y visualización de cajas disponibles para atención al cliente en tiempo real.</h4>

<p align="center">
  <a href="#características">Características</a> •
  <a href="#estructura-del-proyecto">Estructura</a> •
  <a href="#instalación">Instalación</a> •
  <a href="#uso">Uso</a> •
  <a href="#configuración">Configuración</a> •
  <a href="#solución-de-problemas">Solución de Problemas</a>
</p>

## Características

* **Gestión de cajas en tiempo real**
  - Panel de control para que los cajeros indiquen su disponibilidad
  - Pantalla para clientes que muestra la caja disponible
  - Actualización instantánea cuando un cajero cambia su estado
  - Interfaz intuitiva y visual para cajeros y clientes

* **Diseño intuitivo**
  - Código de colores que indica claramente el estado de las cajas
  - Animaciones sutiles para destacar la caja disponible
  - Diseño responsivo que se adapta a diferentes dispositivos
  - Navegación simple entre vistas

* **Implementación sencilla**
  - Solución basada en Angular 18 (HTML, CSS, TypeScript)
  - Funciona en cualquier navegador moderno
  - Fácil de desplegar en una red local

* **Características visuales**
  - Paleta de colores personalizable según la identidad de marca
  - Animaciones para llamar la atención sobre la información importante
  - Diseño limpio y profesional
  - Mensajes de estado claros

## Estructura del Proyecto

```
cashier-queue/
├── .editorconfig
├── .gitignore
├── angular.json
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.spec.json
├── .angular/
│   └── cache/
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   └── tasks.json
├── public/
│   └── favicon.ico
├── src/
│   ├── index.html
│   ├── main.ts
│   ├── styles.css
│   ├── app/
│   │   ├── app.component.css
│   │   ├── app.component.html
│   │   ├── app.component.spec.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── login/
│   │   │   ├── login.component.css
│   │   │   ├── login.component.html
│   │   │   └── login.component.ts
│   │   ├── models/
│   │   │   └── login.model.ts
│   │   ├── navbar/
│   │   │   ├── navbar.component.css
│   │   │   ├── navbar.component.html
│   │   │   └── navbar.component.ts
│   │   ├── pages/
│   │   │   ├── alta-usuarios/
│   │   │   │   ├── alta-usuarios.component.css
│   │   │   │   ├── alta-usuarios.component.html
│   │   │   │   └── alta-usuarios.component.ts
│   │   │   ├── clients-side/
│   │   │   │   ├── clients-side.component.css
│   │   │   │   ├── clients-side.component.html
│   │   │   │   └── clients-side.component.ts
│   │   │   ├── mainmenu/
│   │   │   │   ├── mainmenu.component.css
│   │   │   │   ├── mainmenu.component.html
│   │   │   │   └── mainmenu.component.ts
│   │   │   ├── panel-control/
│   │   │   │   ├── panel-control.component.css
│   │   │   │   ├── panel-control.component.html
│   │   │   │   └── panel-control.component.ts
│   │   ├── services/
│   │   │   ├── cajas.service.ts
│   │   │   ├── login.service.ts
│   │   │   └── usuarios.service.ts
│   └── env/
│       └── environment.ts
```

## Instalación
### DETALLE IMPORTANTE: esta aplicación depende de un backend para manejar usuarios, el total de cajas y la actualización de la disponibilidad. Dicho backend es privado de momento

### Requisitos:

- Node.js y npm instalados

```bash
# Clonar el repositorio
$ git clone https://tu-repositorio/cashier-queue.git
$ cd cashier-queue

# Instalar dependencias
$ npm install
```

### Dependencias:

Este proyecto utiliza las siguientes dependencias:

- Angular 18
- SweetAlert
- Bootstrap

Para instalar estas dependencias, asegúrate de que estén listadas en tu `package.json` y ejecuta `npm install`:

```json
{
  "dependencies": {
    "@angular/core": "^18.0.0",
    "sweetalert2": "^11.0.0",
    "bootstrap": "^5.0.0"
  }
}
```

## Uso

### Ejecución en desarrollo:

```bash
# Iniciar la aplicación en modo desarrollo
$ npm start
```

### Ejecución de pruebas:

```bash
# Ejecutar pruebas unitarias
$ npm test
```

### Construcción para producción:

```bash
# Construir la aplicación para producción
$ npm run build
```

## Configuración

### Personalización de la interfaz:

Para personalizar la apariencia, puedes modificar el archivo `src/styles.css`:

```css
/* Cambiar colores principales */
body {
    background-color: #YOUR_COLOR_HERE;  /* Color de fondo */
}
```

## Solución de Problemas

### Los cambios de estado no se reflejan en la pantalla

Verifica que ambas pestañas (panel de control y pantalla de clientes) estén abiertas en la misma sesión del navegador. Si estás usando dispositivos separados, asegúrate de que estén conectados a la misma red y utiliza el modo servidor.

### La aplicación no funciona en Internet Explorer

Esta aplicación está diseñada para navegadores modernos. Recomendamos utilizar Chrome, Firefox, Safari o Edge para una experiencia óptima.

### Problemas de visualización en dispositivos móviles

Si experimentas problemas de visualización en dispositivos móviles, verifica que la meta etiqueta de viewport esté correctamente configurada en el archivo `src/index.html`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

<p align="center">
  © 2025 DouDev SA - Desarrollado para proporcionar una gestión eficiente de cajas y mejorar la experiencia del cliente en establecimientos comerciales.
</p>
