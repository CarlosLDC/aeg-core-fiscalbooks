# MANUAL DE USUARIO — LIBRO VIRTUAL DE CONTROL, REPARACIÓN Y MANTENIMIENTO

## Sistema de Gestión de Máquinas Fiscales

**Empresa:** ALPHA ENGINEER GROUP, C.A. (AEG)  
**RIF:** J-50459436-9  
**Providencia:** SENIAT 0141  
**Versión del documento:** 1.0  
**Fecha:** Mayo 2026

---

## TABLA DE CONTENIDO

1. [Introducción](#1-introducción)
2. [Requisitos del Sistema](#2-requisitos-del-sistema)
3. [Acceso al Sistema](#3-acceso-al-sistema)
4. [Pantalla Principal — Búsqueda de Equipos](#4-pantalla-principal--búsqueda-de-equipos)
5. [Libro Fiscal del Equipo](#5-libro-fiscal-del-equipo)
6. [Información Base del Equipo](#6-información-base-del-equipo)
7. [Servicios Técnicos](#7-servicios-técnicos)
8. [Inspecciones Anuales](#8-inspecciones-anuales)
9. [Filtros y Navegación de Registros](#9-filtros-y-navegación-de-registros)
10. [Exportación a PDF](#10-exportación-a-pdf)
11. [Roles y Permisos](#11-roles-y-permisos)
12. [Preguntas Frecuentes](#12-preguntas-frecuentes)
13. [Glosario](#13-glosario)
14. [Soporte Técnico](#14-soporte-técnico)

---

## 1. INTRODUCCIÓN

### 1.1 Propósito

El **Libro Virtual de Control, Reparación y Mantenimiento** es una aplicación web desarrollada por Alpha Engineer Group, C.A. (AEG) que digitaliza el registro obligatorio de máquinas fiscales según la Providencia SENIAT 0141. El sistema permite:

- Consultar el historial completo de cada equipo fiscal.
- Registrar servicios técnicos (mantenimiento preventivo, correctivo, cambio de alícuota, reparación general e inicialización).
- Registrar inspecciones anuales.
- Gestionar precintos de seguridad.
- Exportar documentación oficial en formato PDF.
- Auditar información de forma segura con trazabilidad completa.

### 1.2 Alcance

Este manual cubre todas las funcionalidades del sistema accesibles a los usuarios según su rol asignado: **Auditor SENIAT**, **Técnico** y **Administrador**.

### 1.3 Marco Legal

El sistema cumple con los lineamientos establecidos en la **Providencia Administrativa N° SNAT/2018/0141** del Servicio Nacional Integrado de Administración Aduanera y Tributaria (SENIAT), que regula la fabricación, importación, distribución, venta y control de Máquinas Fiscales en el territorio nacional.

---

## 2. REQUISITOS DEL SISTEMA

### 2.1 Navegadores Compatibles

| Navegador | Versión Mínima |
|---|---|
| Google Chrome | 90+ |
| Mozilla Firefox | 88+ |
| Microsoft Edge | 90+ |
| Safari | 14+ |

### 2.2 Requisitos Técnicos

- Conexión a Internet estable.
- Resolución de pantalla mínima recomendada: 1024×768 píxeles.
- El sistema es **responsive** y puede utilizarse desde dispositivos móviles (smartphones y tablets).
- JavaScript habilitado en el navegador.

### 2.3 Credenciales de Acceso

Las credenciales son proporcionadas exclusivamente por un administrador de AEG. No existe registro público de usuarios.

---

## 3. ACCESO AL SISTEMA

### 3.1 Inicio de Sesión

1. Abra su navegador e ingrese la dirección URL del sistema proporcionada por AEG.
2. En la pantalla de inicio de sesión verá el formulario con los campos:
   - **Correo Electrónico**: ingrese el correo asignado por el administrador.
   - **Contraseña**: ingrese su contraseña. Puede usar el ícono del ojo (👁) para mostrar/ocultar la contraseña.
3. Pulse el botón **"Entrar al Sistema"**.
4. Si las credenciales son correctas, será redirigido a la pantalla principal de búsqueda.

> **Nota:** Si no posee credenciales de acceso, contacte a un administrador de AEG.

### 3.2 Cierre de Sesión

1. En la esquina superior derecha de la barra de navegación verá su correo electrónico.
2. Pulse el botón **"Salir"** ubicado junto a su correo.
3. Será redirigido automáticamente a la pantalla de inicio de sesión.

### 3.3 Cambio de Tema (Claro/Oscuro)

El sistema soporta modo claro y modo oscuro. Para alternar entre ambos:

1. Pulse el ícono de sol (☀) o luna (🌙) en la barra superior.
2. La preferencia se guarda automáticamente en su navegador.

---

## 4. PANTALLA PRINCIPAL — BÚSQUEDA DE EQUIPOS

La pantalla principal permite localizar equipos fiscales registrados en la red AEG.

### 4.1 Tipos de Búsqueda

El sistema ofrece dos modalidades de búsqueda mediante un selector segmentado:

| Tipo | Formato Esperado | Ejemplo |
|---|---|---|
| **Serial** | 3 letras mayúsculas + 7 dígitos | `GRA0000123` |
| **RIF** | V/E/J/P/G + 7 a 9 dígitos | `J12345678` |

### 4.2 Cómo Buscar

1. Seleccione el tipo de búsqueda: **Serial** o **RIF**.
2. Escriba el dato en el campo de texto. El sistema normaliza automáticamente la entrada (convierte a mayúsculas y elimina caracteres no alfanuméricos).
3. Pulse el botón **"Auditar"**.
4. El sistema validará el formato antes de ejecutar la búsqueda:
   - Si el formato es incorrecto, mostrará un mensaje de error indicando el formato esperado.
   - Si es correcto, mostrará los resultados.

### 4.3 Búsqueda General

Si deja el campo de búsqueda **vacío** y pulsa **"Auditar"**, el sistema mostrará el listado completo de equipos disponibles según su rol.

### 4.4 Resultados de Búsqueda

Los resultados muestran tarjetas con la siguiente información:

- **Razón social** del contribuyente (o serial fiscal si buscó por RIF).
- **RIF** y **Serial Fiscal** del equipo.
- **Estatus** del equipo, que puede ser:

| Estatus | Significado |
|---|---|
| **Asignada** | Equipo instalado y operativo en un contribuyente |
| **Laboratorio** | Equipo en proceso de configuración o reparación |
| **Sin asignar** | Equipo disponible, sin contribuyente asignado |
| **Enajenada** | Equipo transferido o fuera de servicio |

### 4.5 Paginación

- Configure la cantidad de resultados por página (5, 10, 20 o 50) usando el selector **"Por página"**.
- Navegue entre páginas con los botones **"Anterior"** y **"Siguiente"**.
- La preferencia de tamaño de página se guarda en su navegador.

### 4.6 Acceder al Libro Fiscal

Haga clic sobre cualquier tarjeta de resultado para abrir el **Libro Fiscal** completo de ese equipo.

> **Comportamiento especial:** Si busca por serial y existe exactamente un resultado, el sistema lo redirige automáticamente al libro fiscal de ese equipo sin mostrar la lista intermedia.

---

## 5. LIBRO FISCAL DEL EQUIPO

### 5.1 Estructura General

El libro fiscal se presenta como un documento formal digital con el encabezado oficial:

- **Título:** "Libro Virtual de Control, Reparación y Mantenimiento"
- **Subtítulo:** "Máquina Fiscal – Providencia SENIAT 0141"
- **Serial Fiscal** del equipo en la esquina superior derecha.

### 5.2 Pestañas de Navegación

El libro se divide en tres secciones accesibles mediante pestañas:

| Pestaña | Contenido |
|---|---|
| **Inf. Base** | Datos generales del equipo, fabricante, enajenador, contribuyente, software y firmware |
| **Servicios** | Historial de servicios técnicos realizados al equipo (con contador) |
| **Inspecciones** | Historial de inspecciones anuales realizadas al equipo (con contador) |

### 5.3 Barra de Control

En la parte superior del libro se encuentra una barra sticky con las siguientes funciones:

- **Volver**: regresa a la pantalla de búsqueda.
- **Pestañas**: selector de secciones.
- **Paginador**: navegación entre registros individuales (en Servicios e Inspecciones).
- **Filtros**: botón para abrir/cerrar el panel de filtros.
- **Agregar (+)**: crear un nuevo registro (solo rol Técnico).
- **Descargar PDF**: exportar el registro actual.

En dispositivos móviles, las opciones se agrupan bajo un menú hamburguesa (☰).

---

## 6. INFORMACIÓN BASE DEL EQUIPO

La pestaña **"Inf. Base"** muestra los datos principales del equipo organizados en seis secciones:

### 6.1 Datos del Fabricante (Sección 1)

Información fija de Alpha Engineer Group, C.A.:

| Campo | Valor |
|---|---|
| Razón Social | ALPHA ENGINEER GROUP, C.A. |
| RIF | J504594369 |
| Estado / Ciudad | MIRANDA / LOS TEQUES |
| Domicilio Fiscal | Avenida Bicentenario, Redoma del Tambor, Edificio Veracruz, Piso 1, Local N° 3 |
| Teléfono | 584242913038 |
| Correo | soportealphavzla@gmail.com |

### 6.2 Datos del Enajenador (Sección 2)

Información de la distribuidora que vendió/instaló el equipo:

- Razón Social, RIF, Estado, Ciudad, Dirección, Teléfono y Correo.
- Si no hay enajenador registrado, se muestra: *"Sin enajenador registrado."*

### 6.3 Datos del Contribuyente/Usuario (Sección 3)

Información del negocio donde opera el equipo:

- Razón Social, RIF, Tipo de Contribuyente, Estado, Ciudad, Domicilio Fiscal, Teléfono y Correo.

### 6.4 Datos del Lugar de Instalación (Sección 4)

Se indica que el lugar de instalación corresponde al domicilio fiscal del contribuyente.

### 6.5 Datos de la Máquina Fiscal (Sección 5)

| Campo | Descripción |
|---|---|
| Número de Registro (serial) | Serial fiscal único del equipo |
| Tipo de Dispositivo Fiscal | Interno o Externo |
| Marca | Marca del fabricante del hardware |
| Modelo | Código de modelo del equipo |
| Serial del Precinto | Serial del precinto de seguridad activo |
| Fecha de Instalación | Fecha en que se instaló el equipo |
| Versión del Firmware | Versión del firmware instalado (puede ver la versión completa al pasar el cursor sobre el ícono de información) |

### 6.6 Datos del Software (Sección 6)

- **Nombre** del software fiscal instalado.
- **Versión** del software.

> **Nota:** Los campos sin información disponible se muestran como **"N/D"** (No Disponible).

---

## 7. SERVICIOS TÉCNICOS

### 7.1 Consultar Servicios

1. Dentro del libro fiscal, seleccione la pestaña **"Servicios"**.
2. El contador entre paréntesis indica el total de registros (ej: `Servicios (5)`).
3. Cada registro se muestra como una página individual con indicadores de:
   - Número de página actual y total.
   - ID del registro.
   - Fecha y hora de creación del registro.

### 7.2 Contenido de un Registro de Servicio

Cada servicio técnico contiene cuatro secciones:

#### Sección 1: Datos del Servicio
| Campo | Descripción |
|---|---|
| Centro de Servicio Técnico Autorizado | Nombre del centro que realizó el servicio |
| RIF Centro de Servicio | RIF del centro |
| Fecha de Solicitud | Fecha en que se solicitó el servicio |
| Fecha de Inicio | Inicio del servicio (fecha y hora) |
| Fecha de Fin | Fin del servicio (fecha y hora) |
| Primer Reporte Z | Número del primer reporte Z |
| Fecha y Hora de Primer Reporte Z | Timestamp del primer Z |
| Último Reporte Z | Número del último reporte Z |
| Fecha y Hora de Último Reporte Z | Timestamp del último Z |

#### Sección 2: Gestión de Precintos
| Campo | Descripción |
|---|---|
| Serial del Precinto Actual | Precinto presente al momento del servicio |
| ¿Precinto Violentado? | SÍ / NO (resaltado en rojo si fue violentado) |
| ¿Se Cambió el Precinto? | SÍ / NO |
| Serial del Nuevo Precinto | Serial del precinto instalado (si aplica) |

#### Sección 3: Detalles de la Intervención
- **Falla Reportada y Acción Realizada**: descripción detallada del trabajo ejecutado.

#### Sección 4: Cierre y Responsabilidades
- Nombre del **Técnico Autorizado** que realizó el servicio.
- Nombre de la **Persona que Recibe** (razón social del contribuyente).

### 7.3 Crear un Nuevo Servicio Técnico (Solo Rol Técnico)

1. En la pestaña **Servicios**, pulse el botón **"+"** (agregar).
2. Se abrirá el formulario **"Añadir Servicio Técnico"**.
3. Los siguientes campos se completan automáticamente según su perfil:
   - **Técnico Responsable**: su nombre y cédula.
   - **Centro de servicio / Distribuidora**: sede asociada a su empleado.

4. Complete los campos obligatorios (marcados con *):

| Campo | Tipo | Descripción |
|---|---|---|
| Fecha de Solicitud | Fecha | Fecha en que se solicitó el servicio |
| Inicio de Servicio | Fecha + Hora | Cuándo comenzó el servicio |
| Fin de Servicio | Fecha + Hora | Cuándo finalizó el servicio |
| Reporte Z Inicial | Número | Número del primer reporte Z durante el servicio |
| Fecha y Hora del Z Inicial | Fecha + Hora | Timestamp exacto del primer Z |
| Reporte Z Final | Número | Número del último reporte Z |
| Fecha y Hora del Z Final | Fecha + Hora | Timestamp exacto del último Z |
| Falla Reportada | Texto | Descripción detallada de la falla y acción realizada |
| Costo | Número | Costo del servicio (en Bs.) |

5. Indique si el precinto fue violentado y si se reemplazó:
   - Si marca **"¿Se cambió el precinto?"**, se mostrará una lista desplegable con los precintos disponibles en inventario para seleccionar el nuevo precinto.

6. Pulse **"Guardar Servicio"**.

### 7.4 Validaciones del Servicio

El sistema aplica las siguientes validaciones automáticas:

- Todos los campos obligatorios deben estar completos.
- La fecha de fin no puede ser anterior a la fecha de inicio.
- Un servicio no puede durar más de **8 días**.
- La fecha de solicitud no puede ser posterior al fin del servicio.
- El Reporte Z final no puede ser menor al inicial.
- Las fechas de los Reportes Z deben estar dentro del período del servicio.
- Si se reemplaza el precinto, debe seleccionar uno con estatus "disponible".
- El precinto nuevo no puede ser el mismo que el actual.

### 7.5 Tras Guardar el Servicio

Se muestra un modal de confirmación con dos opciones:
- **"Ver en el libro"**: redirige al libro fiscal, pestaña Servicios, en la página del registro creado.
- **"Permanecer aquí"**: cierra el modal y permanece en el formulario.

---

## 8. INSPECCIONES ANUALES

### 8.1 Consultar Inspecciones

1. Seleccione la pestaña **"Inspecciones"** en el libro fiscal.
2. El contador entre paréntesis indica el total de inspecciones.
3. Cada registro muestra:
   - Número de página, ID del registro y fecha de creación.

### 8.2 Contenido de un Registro de Inspección

#### Sección 1: Datos del Centro y Técnico
| Campo | Descripción |
|---|---|
| Centro de Servicio Técnico | Centro que realizó la inspección |
| RIF Centro de Servicio | RIF del centro |
| Fecha de Inspección | Fecha de la inspección |
| Inspector Actuante | Nombre del inspector |

#### Sección 2: Resultados de inspección
Checklist reglamentario con el estado de cada ítem (Bien, Violentado o Defectuoso según corresponda):

| Ítem | Descripción |
|---|---|
| Estado del Precinto | Integridad del precinto fiscal |
| Estado de la Etiqueta Fiscal | Condición de la etiqueta fiscal |
| Estado de la Factura | Resultado de la prueba de factura |
| Estado de la Nota de Crédito | Resultado de la prueba de nota de crédito |
| Estado Sensor de Papel | Funcionamiento del sensor de papel |

#### Sección 3: Detalles adicionales
- **Observaciones y Hallazgos**: texto descriptivo con los resultados de la inspección.
- **Auditoría MQTT** (si aplica): registro de impresora, fecha SetDateRevO y número de factura de prueba.

### 8.3 Crear una Nueva Inspección (Solo Rol Técnico)

1. En la pestaña **Inspecciones**, pulse el botón **"+"**.
2. Se abrirá un **único formulario** «Añadir Inspección Anual» (una sola tarjeta, sin secciones separadas).
3. En la parte superior verá el progreso **1. Impresora → 2. Guardar en libro** cuando el equipo aplique para comunicación fiscal.

4. Complete los **datos del registro** (siempre visibles en el mismo formulario):

| Campo | Tipo | Descripción |
|---|---|---|
| Inspector Responsable | Automático | Su nombre y cédula |
| Fecha de inspección | Fecha | No puede ser futura |
| Observaciones / Resultados | Texto | Descripción detallada de hallazgos |

5. **Paso 1 · Impresora** (obligatorio en equipos enajenados con cliente y MAC):
   - Pulse **«Consultar impresora (StaInf)»** para obtener el registro.
   - Complete el **checklist reglamentario** (cinco ítems) y, si lo desea, las pruebas opcionales de factura y nota de crédito.
   - Pulse **«Paso 1 · Registrar en impresora (SetDateRevO)»**.
   - Al confirmarse en la impresora, el indicador marcará el paso 1 como completado.

6. **Paso 2 · Guardar en libro fiscal**:
   - Pulse **«Paso 2 · Guardar en libro fiscal»** (habilitado tras el paso 1).
   - El sistema persiste en una sola fila de base de datos: checklist, observaciones, fecha, inspector y auditoría MQTT.

> El estado del precinto se determina únicamente desde el checklist («Estado del Precinto»); no hay un campo duplicado.

### 8.4 Validaciones de Inspección

- En equipos con comunicación fiscal, debe completarse el **paso 1 (SetDateRevO)** antes de habilitar el guardado en libro.
- La fecha de inspección no puede ser futura.
- Los campos de inspector, fecha y observaciones son obligatorios.
- Se requiere una sesión activa válida.

---

## 9. FILTROS Y NAVEGACIÓN DE REGISTROS

### 9.1 Panel de Filtros

Disponible en las pestañas de Servicios e Inspecciones:

1. Pulse el ícono de **filtro** (embudo) en la barra de acciones.
2. Se desplegará el panel con:
   - **Campo de búsqueda por texto**: filtra por falla, técnico, centro, observaciones o ID del registro.
   - **Selector de año**: filtra registros por año de creación.
3. Para limpiar los filtros, pulse **"Limpiar filtros"**.

### 9.2 Navegación entre Registros

- Use las flechas **◀ ▶** del paginador para navegar registro a registro.
- El indicador muestra la posición actual (ej: `03 / 12`).
- Si hay filtros activos, el indicador muestra cuántos registros coinciden del total (ej: `filtrado: 3 de 12`).

---

## 10. EXPORTACIÓN A PDF

### 10.1 Generar PDF

1. Navegue al registro que desea exportar (servicio o inspección).
2. Pulse el ícono de **descarga** (⬇) en la barra de acciones.
3. El sistema generará un archivo PDF con formato oficial que incluye:

**Página 1 — Datos del equipo:**
- Encabezado con logo AEG, RIF y control fiscal.
- Serial fiscal del equipo.
- Las 6 secciones de información base (fabricante, enajenador, contribuyente, lugar de instalación, máquina fiscal, software).

**Página 2 — Detalle del registro** (si está en la pestaña de Servicios o Inspecciones):
- Encabezado repetido con serial fiscal.
- Datos completos del servicio o inspección seleccionados.
- Espacios para firma de técnico autorizado y persona que recibe.

4. El archivo se descarga automáticamente con nombre: `{SERIAL_FISCAL}-{TIMESTAMP}.pdf`

### 10.2 Contenido del PDF

El PDF incluye:
- Formato tamaño carta (letter).
- Campos sin datos se muestran como *N/D* en cursiva.
- Pie de página: *"Documento generado por Portal de Auditoría AEG"* con fecha y hora de generación.

---

## 11. ROLES Y PERMISOS

### 11.1 Matriz de Permisos

| Funcionalidad | Auditor SENIAT | Técnico | Administrador |
|---|:---:|:---:|:---:|
| Buscar equipos fiscales | ✅ Todos | ✅ Solo su distribuidora | ✅ Todos |
| Ver libro fiscal completo | ✅ | ✅ | ✅ |
| Ver historial de servicios | ✅ | ✅ | ✅ |
| Ver historial de inspecciones | ✅ | ✅ | ✅ |
| Crear servicio técnico | ❌ | ✅ | ❌ |
| Crear inspección anual | ❌ | ✅ | ❌ |
| Exportar PDF | ✅ | ✅ | ✅ |
| Filtrar registros | ✅ | ✅ | ✅ |
| Acceder al Manual | ✅ | ✅ | ❌ |

### 11.2 Rol Auditor SENIAT

- **Acceso de solo lectura** a todos los equipos del sistema.
- Puede buscar por serial, RIF o listar todos los equipos.
- Puede auditar información completa: datos base, servicios e inspecciones.
- Puede exportar PDFs como evidencia de auditoría.
- **No puede** crear ni modificar registros.

### 11.3 Rol Técnico

- **Acceso operativo** limitado a equipos de su distribuidora.
- Puede consultar y registrar servicios técnicos e inspecciones.
- Los datos del técnico y centro de servicio se obtienen automáticamente del directorio de empleados.
- Si su perfil no tiene distribuidora vinculada, no podrá listar equipos.
- **No puede** ver equipos de otras distribuidoras.

### 11.4 Rol Administrador

- Acceso completo de consulta a todos los equipos.
- No aparece el enlace al manual en la barra de navegación.

---

## 12. PREGUNTAS FRECUENTES

### ¿Qué hago si no puedo iniciar sesión?
Verifique que su correo y contraseña sean correctos. Si el problema persiste, contacte a un administrador de AEG para restablecer su acceso.

### ¿Por qué no veo el botón "+" para agregar servicios?
Solo los usuarios con rol **Técnico** tienen permiso para crear registros. Si es auditor SENIAT, su acceso es de solo lectura.

### ¿Por qué aparece "N/D" en algunos campos?
"N/D" significa **No Disponible**. Indica que ese dato no ha sido registrado en el sistema para ese equipo en particular.

### ¿Qué significa el mensaje "Su perfil técnico no tiene distribuidora vinculada"?
Su usuario no está correctamente asociado a una distribuidora en el directorio de empleados. Contacte al administrador para que corrija la asignación.

### ¿Puedo editar un servicio o inspección ya guardada?
No. Los registros son inmutables una vez guardados, lo cual garantiza la integridad y trazabilidad del libro fiscal según la normativa vigente.

### ¿Se puede usar desde un teléfono celular?
Sí. El sistema es responsivo y se adapta a pantallas de cualquier tamaño. En dispositivos móviles, las opciones del libro fiscal se agrupan bajo un menú hamburguesa (☰).

### ¿Cómo sé qué versión de firmware tiene mi equipo?
En la pestaña **"Inf. Base"**, sección 5 (Datos de la Máquina Fiscal), verá el campo **"Versión del Firmware"**. Pase el cursor sobre el ícono ℹ para ver la versión completa.

---

## 13. GLOSARIO

| Término | Definición |
|---|---|
| **Serial Fiscal** | Identificador único de la máquina fiscal, compuesto por 3 letras y 7 dígitos |
| **RIF** | Registro de Información Fiscal del contribuyente |
| **Reporte Z** | Reporte de cierre diario emitido por la máquina fiscal |
| **Precinto** | Sello de seguridad físico colocado en la máquina fiscal para garantizar su integridad |
| **Enajenador** | Distribuidora que vendió o instaló el equipo fiscal al contribuyente |
| **Contribuyente** | Persona jurídica o natural que utiliza la máquina fiscal en su establecimiento |
| **Providencia 0141** | Normativa del SENIAT que regula las máquinas fiscales en Venezuela |
| **Firmware** | Software embebido en el hardware de la máquina fiscal |
| **Centro de Servicio Técnico** | Establecimiento autorizado para dar mantenimiento a máquinas fiscales |
| **Libro Fiscal** | Registro obligatorio de todas las intervenciones técnicas realizadas a una máquina fiscal |

---

## 14. SOPORTE TÉCNICO

Para asistencia técnica con el sistema, comuníquese con:

**Alpha Engineer Group, C.A.**  
- **Correo:** soportealphavzla@gmail.com  
- **Teléfono:** +58 424-291-3038  
- **Dirección:** Avenida Bicentenario, Redoma del Tambor, Edificio Veracruz, Piso 1, Local N° 3, Los Teques, Estado Miranda, Venezuela.

---

*Documento generado como parte del expediente de homologación de firmware y libro digital ante el SENIAT.*  
*© 2026 Alpha Engineer Group, C.A. Todos los derechos reservados.*
