# Frontend - Sistema de Reclutamiento

Interfaz web del Sistema de Reclutamiento, desarrollada con Nuxt 4 y Vue 3.

El frontend permite interactuar con los diferentes módulos del sistema mediante una interfaz web y se comunica con una API desarrollada en Laravel.

## Tecnologías utilizadas

- Nuxt 4
- Vue 3
- TypeScript
- Nuxt UI
- Tailwind CSS
- Node.js
- npm
- ExcelJS para la generación de reportes Excel

## Requisitos previos

Para ejecutar el proyecto se necesita:

- Node.js compatible con Nuxt 4.
- npm.
- Git.
- Backend Laravel configurado y ejecutándose.

## Instalación

### 1. Despues de clonar repositorio

Ingresar a la carpeta:

```bash
cd reclutamiento-nuxt
```

### 2. Instalar dependencias

Ejecutar:

```bash
npm install
```

Este comando instalará las dependencias definidas en `package.json`.

### 3. Configurar la conexión con Laravel

Configura si es necesario el archivo nuxt.config.ts para que la propiedad `laravelApiUrl` dentro de `runtimeConfig` apunte a la URL del backend Laravel.

Agregar:

```env
runtimeConfig: {
    laravelApiUrl: 'http://127.0.0.1:8000/api'
}
```

Verificar que `nuxt.config.ts` tenga configurada la propiedad `laravelApiUrl` dentro de `runtimeConfig`.

La URL debe coincidir con la dirección donde se está ejecutando el backend.

### 4. Iniciar el frontend

Ejecutar:

```bash
npm run dev
```

El servidor de desarrollo estará disponible normalmente en:

```text
http://localhost:3000
```

Abrir esta dirección en el navegador.

## Acceso al sistema

1. Abrir `http://localhost:3000`.
2. En la pantalla principal, comprobar la conexión con Laravel.
3. Presionar el botón **Iniciar sesión**.
4. Ingresar las credenciales de un usuario registrado.
5. Acceder al panel principal del sistema.

Las cuentas iniciales se configuran desde los seeders del backend.

## Funcionalidades

### Inicio de sesión

Permite autenticar a los usuarios mediante el backend Laravel y acceder a los módulos del sistema.

### Gestión de vacantes

- Consultar vacantes.
- Registrar nuevas vacantes.
- Editar información.
- Eliminar vacantes.
- Seleccionar unidad, modalidad de trabajo y estado.

### Gestión de candidatos

- Consultar candidatos.
- Registrar nuevos candidatos.
- Editar información.
- Eliminar candidatos.

### Gestión de postulaciones

- Registrar postulaciones asociando candidatos y vacantes.
- Consultar postulaciones registradas.
- Filtrar por vacante y estado.
- Actualizar estados desde el listado.
- Generar reportes en formato Excel.

### Gestión de entrevistas

- Registrar entrevistas.
- Consultar entrevistas.
- Editar entrevistas.
- Eliminar entrevistas.
- Seleccionar postulación, entrevistador, tipo y resultado.
