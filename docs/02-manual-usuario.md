# Manual de Usuario

## SGFIP — Sistema de Gestión de Flujo de Informes Patronales

**IGSS Delegación Retalhuleu — Área de Inspección Patronal**

---

## Índice

1. [Introducción](#1-introducción)
2. [Acceso al Sistema](#2-acceso-al-sistema)
3. [Registro de Nuevo Usuario](#3-registro-de-nuevo-usuario)
4. [Inicio de Sesión](#4-inicio-de-sesión)
5. [Panel General](#5-panel-general)
6. [Módulo de Inspector](#6-módulo-de-inspector)
7. [Módulo de Supervisor](#7-módulo-de-supervisor)
8. [Módulo de Administrador](#8-módulo-de-administrador)
9. [Vista de Detalle del Informe](#9-vista-de-detalle-del-informe)
10. [Solución de Problemas](#10-solución-de-problemas)

---

## 1. Introducción

### 1.1 Requisitos Técnicos

- Navegador web moderno (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari)
- Conexión a internet
- Resolución de pantalla mínima: 320px (diseño responsivo)

### 1.2 URL de Acceso

La aplicación está disponible en:

**https://sgfip-igss.vercel.app**

### 1.3 Navegación

La aplicación utiliza un menú lateral que se adapta según el rol del usuario. Cada rol tiene acceso únicamente a las funcionalidades que le corresponden.

---

## 2. Acceso al Sistema

### Pantalla de Inicio

Al ingresar a la URL del sistema, se muestra la pantalla de inicio de sesión con el logo del IGSS. Desde aquí se puede:

1. **Iniciar sesión** si ya tiene una cuenta
2. **Registrarse** si tiene un código de invitación
3. **Acceder al enlace de registro** si no tiene cuenta

---

## 3. Registro de Nuevo Usuario

### 3.1 Solicitar un Código de Invitación

Antes de registrarse, debe solicitar un código de invitación al administrador del sistema. Puede hacerlo de dos formas:

- **Presencialmente**: Solicitar al administrador en las oficinas de la Delegación Retalhuleu
- **Por correo electrónico**: Dar clic en el enlace **"Solicita uno"** ubicado debajo del campo "Código de invitación" en la página de registro. Esto abrirá su cliente de correo con un mensaje pre-llenado para solicitar el código

### 3.2 Formulario de Registro

Una vez que tenga su código de invitación:

1. Diríjase a **https://sgfip-igss.vercel.app/register.html**
2. Complete los siguientes campos:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Nombre completo | Nombres y apellidos | Juan Pérez López |
| Usuario | Nombre de usuario (se guardará como `usuario.igss`) | juan |
| Contraseña | Mínimo 8 caracteres, 1 número y 1 carácter especial | Insp2024# |
| Código de invitación | Código proporcionado por el administrador | a1b2c3d4-e5f6-... |

3. Haga clic en **"Crear cuenta"**
4. Si todo es correcto, será redirigido a la página de inicio de sesión

### 3.3 Recomendaciones de Contraseña Segura

- Utilice al menos 8 caracteres
- Incluya al menos un número (ej. 1, 2, 3...)
- Incluya al menos un carácter especial (ej. #, @, !, $, %...)
- No use información personal fácil de adivinar
- Ejemplo válido: `Inspector2024!`

---

## 4. Inicio de Sesión

### 4.1 Ingreso al Sistema

1. En la pantalla de inicio, ingrese su **usuario** (sin necesidad de escribir `.igss`, el sistema lo agrega automáticamente)
2. Ingrese su **contraseña**
3. Haga clic en **"Iniciar sesión"**

### 4.2 Recuperación de Acceso

Si olvida su contraseña, contacte al administrador del sistema para que le asigne una nueva.

---

## 5. Panel General

### 5.1 Estructura de la Aplicación

Una vez autenticado, la aplicación se compone de:

- **Barra lateral izquierda**: Menú de navegación con las opciones disponibles según su rol
- **Barra superior**: Nombre del usuario y botón de cierre de sesión
- **Área principal**: Contenido de la vista seleccionada

### 5.2 Cierre de Sesión

Para cerrar sesión, haga clic en el botón **"Cerrar sesión"** en la barra superior.

---

## 6. Módulo de Inspector

### 6.1 Vista "Mi cola de trabajo"

Esta es la vista principal del inspector, organizada en tres pestañas:

| Pestaña | Descripción |
|---------|-------------|
| Pendientes | Informes asignados que aún no se han iniciado |
| En Proceso | Informes que están siendo trabajados actualmente |
| Devueltos | Informes que el supervisor ha devuelto para corrección |

### 6.2 Crear un Nuevo Informe

1. En el menú lateral, haga clic en **"Nuevo informe"**
2. El sistema generará automáticamente un número de informe único
3. Aparecerá un modal con el número generado
4. Use el botón **"Copiar número"** si necesita copiarlo
5. El informe se crea en estado **Pendiente** y aparecerá en su cola de trabajo

### 6.3 Iniciar un Informe

1. En la pestaña **Pendientes** de "Mi cola de trabajo", localice el informe
2. Haga clic en el botón **"Iniciar"** para comenzar a trabajar en él
3. El informe cambia a estado **En Proceso**

### 6.4 Enviar un Informe a Revisión

Una vez que haya completado los datos del informe:

1. En la pestaña **En Proceso**, haga clic en el botón **"Enviar a revisión"**
2. Complete los siguientes campos obligatorios:

| Campo | Descripción |
|-------|-------------|
| Fecha del informe | Fecha de emisión del informe |
| Descripción | Descripción detallada de la inspección |
| No. Afiliación de Riesgo | Número de afiliación de riesgo del patrono |
| Nombre del Patrono | Nombre completo del patrono inspeccionado |
| NIT del Patrono | Número de Identificación Tributaria |

| Campo | Descripción |
|-------|-------------|
| Dirección del Patrono | (Opcional) Dirección del establecimiento |

3. Haga clic en **"Enviar a revisión"**
4. El informe pasa a estado **En Revisión** y queda disponible para el supervisor

### 6.5 Corregir un Informe Devuelto

Si el supervisor devuelve un informe con observaciones:

1. En la pestaña **Devueltos**, haga clic en **"Iniciar"** para regresarlo a **En Proceso**
2. Revise la observación del supervisor (disponible en la vista de detalle)
3. Realice las correcciones necesarias
4. Vuelva a enviar a revisión

### 6.6 Ver Detalle de un Informe

En cualquier estado, haga clic en **"Ver detalle"** para abrir el modal con:
- Información general del informe
- Datos del inspector y supervisor asignados
- Timeline de auditoría con todas las acciones realizadas

---

## 7. Módulo de Supervisor

### 7.1 Vista "Bandeja de Supervisor"

Esta vista muestra todos los informes que están en estado **En Revisión** y que requieren la atención del supervisor.

### 7.2 Revisar un Informe

1. En la "Bandeja de Supervisor", haga clic en **"Ver detalle"** para revisar la información completa del informe
2. Evalúe los datos ingresados por el inspector

### 7.3 Aprobar un Informe

1. Haga clic en el botón **"Aprobar"** del informe correspondiente
2. Complete los siguientes campos:

| Campo | Descripción |
|-------|-------------|
| No. Oficio | Número de oficio de aprobación |
| Fecha de Oficio | Fecha del oficio |
| Envío | Medio de envío (físico, digital, etc.) |

3. Haga clic en **"Aprobar"**
4. El informe pasa a estado **Finalizado**

### 7.4 Devolver un Informe con Observaciones

1. Haga clic en el botón **"Devolver"** del informe correspondiente
2. Escriba una **observación** detallada para el inspector (este mensaje será visible para él)
3. Haga clic en **"Devolver"**
4. El informe regresa a estado **Devuelto**

### 7.5 Anular un Informe

1. Haga clic en el botón **"Anular"** del informe correspondiente
2. Seleccione o escriba el **motivo de anulación** (campo obligatorio)
3. Haga clic en **"Anular"**
4. El informe pasa a estado **Anulado**

> **Nota**: La anulación está disponible desde cualquier estado del informe, excepto Finalizado.

---

## 8. Módulo de Administrador

### 8.1 Vista "Informes Patronales"

Lista completa de todos los informes del sistema con filtros por:
- Estado
- Inspector
- Rango de fechas
- Urgencia

### 8.2 Vista "Usuarios"

#### 8.2.1 Pestaña "Usuarios"

- **Lista de usuarios**: Tabla con todos los usuarios del sistema
- **Crear usuario**: Formulario para crear un nuevo usuario directamente (sin código de invitación)
  - Nombre, usuario, contraseña y rol
- **Editar usuario**: Permite modificar datos de un usuario existente
- **Eliminar usuario**: Elimina un usuario del sistema

#### 8.2.2 Pestaña "Invitaciones"

- **Lista de códigos**: Tabla con todos los códigos de invitación generados, su estado (Disponible/Usado) y fechas
- **Generar código**: Permite generar un nuevo código de invitación:
  1. Seleccione el rol (Inspector o Supervisor)
  2. Haga clic en **"Generar código"**
  3. Se mostrará el código generado con opciones para **Copiar** y **Compartir**
- **Compartir código**: Usa la función nativa del dispositivo para compartir el código por WhatsApp, correo electrónico, SMS, etc. El mensaje incluye:
  - El código de invitación
  - El rol asignado
  - El enlace directo a la página de registro
- **Eliminar código**: Elimina un código de invitación que no haya sido usado aún

### 8.3 Vista "Monitoreo"

Panel de estadísticas con tres secciones:

| Sección | Contenido |
|---------|-----------|
| Por Inspector | Tiempo promedio de trabajo por cada inspector |
| Por Supervisor | Tiempo promedio de revisión por cada supervisor |
| General | Estadísticas globales del sistema |

---

## 9. Vista de Detalle del Informe

### 9.1 Información General

El modal de detalle muestra:
- **Número de informe**
- **Estado actual** con indicador visual de color
- **Inspector asignado** (nombre completo)
- **Supervisor asignado** (si aplica)
- **Nivel de urgencia** (Alta, Media, Baja)
- **Fechas clave**: creación, inicio, envío a revisión, finalización

### 9.2 Timeline de Auditoría

El detalle incluye un timeline vertical que muestra cronológicamente todas las acciones realizadas sobre el informe:

| Columna | Descripción |
|---------|-------------|
| Fecha y hora | Momento exacto de la acción |
| Usuario | Nombre de quien realizó la acción |
| Acción | Tipo de acción (Creación, Inicio, Envío, Aprobación, Devolución, Anulación) |
| Detalle | Información adicional (observaciones, motivos, cambios de estado) |

### 9.3 Navegación

El modal de detalle es **desplazable** verticalmente para permitir la visualización completa de informes con muchos eventos de auditoría.

---

## 10. Solución de Problemas

### 10.1 Error de Inicio de Sesión

| Mensaje | Causa | Solución |
|---------|-------|----------|
| "Usuario no encontrado" | El usuario no existe en el sistema | Verifique que escribió bien su usuario o contacte al administrador |
| "Contraseña incorrecta" | La contraseña no coincide | Verifique que está escribiendo la contraseña correcta |
| "Usuario inactivo" | Su cuenta ha sido desactivada | Contacte al administrador |

### 10.2 Error de Registro

| Mensaje | Causa | Solución |
|---------|-------|----------|
| "Código de invitación inválido" | El código no existe en el sistema | Verifique que copió bien el código o solicite uno nuevo |
| "El código de invitación ya fue usado" | El código ya fue utilizado anteriormente | Solicite un nuevo código al administrador |
| "El usuario ya está registrado" | Ya existe una cuenta con ese usuario | Intente iniciar sesión o use otro nombre de usuario |

### 10.3 Errores de Contraseña

| Mensaje | Causa | Solución |
|---------|-------|----------|
| "Mínimo 8 caracteres" | La contraseña es muy corta | Use al menos 8 caracteres |
| "Debe contener al menos un número" | Falta un dígito numérico | Agregue un número (0-9) |
| "Debe contener al menos un carácter especial" | Falta un símbolo especial | Agregue un carácter como #, @, !, $, % |

### 10.4 Problemas Técnicos

| Problema | Posible Solución |
|----------|-----------------|
| La página no carga | Verifique su conexión a internet o intente con otro navegador |
| Sesión expirada | Vuelva a iniciar sesión (la sesión expira después de 24 horas) |
| Error de conexión con el servidor | Intente nuevamente en unos minutos |
| El botón "Compartir" no funciona | Su navegador o dispositivo no soporta la función; use "Copiar código" en su lugar |
