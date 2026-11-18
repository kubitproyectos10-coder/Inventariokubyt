# KUBYT · Inventario

App interna de KUBYT para controlar inventario, costos, utilidad e inversión.

## Módulos

| Módulo | Qué hace |
| --- | --- |
| **Inicio** | Tablero del mes: ventas, utilidad, inversión recuperada, stock bajo, top de productos, últimas ventas y alertas. Guía de 5 pasos para arrancar. |
| **Insumos** | Filamentos, cajas, empaques. Calculadora de costo por gramo (precio del rollo ÷ gramos). Compras que suben el stock y promedian el costo. Alerta de stock mínimo. |
| **Productos** | Catálogo con receta (gramos de cada filamento + empaque) y minutos de mano de obra. Costo, utilidad, margen y precio sugerido en vivo. |
| **Producción** | Cada tanda: suma producto terminado y descuenta insumos según la receta (incluye piezas fallidas). Avisa si no alcanza el material. |
| **Ventas** | Descuenta stock y guarda el costo con el que se vendió. Utilidad por venta. Canales y envío/comisión. |
| **Gastos e inversión** | Gastos administrativos (internet, software, luz…), inversiones en máquinas con vida útil (cuota mensual) y aportes de socios. |
| **Informes** | Estado del mes, últimos 6 meses, rentabilidad por producto, ventas por canal, consumo de filamento, inversión y recuperación, stock bajo. |
| **Ajustes** | Valor de la hora de mano de obra, gastos administrativos y unidades estimadas por mes, margen objetivo. |

Botón **+ Registrar** (abajo a la derecha) para registrar venta, producción, compra o gasto desde cualquier pantalla.
Todas las listas se exportan a Excel (CSV) con el ícono de descarga.

### Fórmulas

- **Costo unitario** = Material + Mano de obra + Gastos administrativos por unidad
  - Material = Σ (cantidad de la receta × costo por g/und del insumo)
  - Mano de obra = minutos × (valor hora ÷ 60)
  - Administrativo por unidad = gastos administrativos estimados del mes ÷ unidades estimadas (en Ajustes)
- **Utilidad** = Precio de venta − Costo unitario
- **Utilidad del mes (Informes)** = Ingresos − material vendido − mano de obra − envíos − gastos administrativos reales del mes (incluye la cuota mensual de máquinas = precio ÷ meses de vida útil)
- **Inversión recuperada** = ventas netas ÷ (equipos + gastos administrativos + compras de insumos)

Los movimientos de stock (compras, producción, ventas y sus anulaciones) se guardan con **transacciones**: o se guarda todo o nada.

Hecha con **React 18 + Vite + Firebase** (Authentication + Firestore), organizada en **Modelo – Vista – Controlador** y con los mismos tokens de diseño de la web de KUBYT (`src/styles/tokens.css`).

---

## 1. Antes de correrla (una sola vez, en la consola de Firebase)

1. **Authentication → Método de acceso:** activa *Correo electrónico/contraseña*.
2. **Authentication → Usuarios → Agregar usuario:** crea tu usuario (tu correo y una contraseña).
3. **Firestore Database → Crear base de datos:** modo producción, región `southamerica-east1`.
4. **Firestore Database → Reglas:** borra lo que hay, pega el contenido de `firestore.rules` y pulsa **Publicar**.
5. **Firestore Database → Datos → Iniciar colección:**
   - ID de la colección: `usuarios`
   - ID del documento: tu **UID** (está en Authentication → Usuarios, columna "UID de usuario")
   - Campos: `rol` (string) = `admin` · `nombre` (string) = tu nombre

> Si te saltas el paso 5, la app te deja entrar pero te muestra "Tu cuenta aún no tiene acceso", con tu UID listo para copiar.
> Esto protege los datos: aunque alguien cree una cuenta, sin documento en `usuarios` no puede leer nada.

## 2. Correrla en tu computador

Necesitas [Node.js](https://nodejs.org) 18 o superior.

```bash
npm install
npm run dev        # abre http://localhost:5173
```

La configuración de Firebase ya está en `.env`. (`.env.example` es la plantilla vacía.)

## 3. Publicarla en internet (Firebase Hosting, gratis)

```bash
npm install -g firebase-tools
firebase login
npm run deploy     # compila y publica en https://kubyt-inventario.web.app
```

`npm run deploy` también publica las reglas de `firestore.rules`.

---

## Estructura (MVC)

```
src/
├── config/firebase.js        ← único lugar donde se inicializa Firebase
├── models/                   ← MODELO: datos y reglas de negocio (los únicos que hablan con Firebase)
│   ├── repository.js           acceso genérico a Firestore + transacciones
│   ├── costModel.js            fórmulas de costo y utilidad
│   ├── reportModel.js          cálculos de informes
│   ├── insumos / productos / produccion / ventas / gastos / ajustes Model.js
│   ├── catalogModel.js         listas fijas (tipos, líneas, canales, categorías)
│   ├── formatModel.js          moneda, fechas, exportar CSV
│   ├── authModel.js            iniciar/cerrar sesión, recuperar contraseña, errores en español
│   ├── userModel.js            perfiles y roles (usuarios/{uid}), permisos por módulo
│   ├── navigationModel.js      lista de módulos, ícono, fase y estado
│   └── brandModel.js
├── controllers/              ← CONTROLADOR: estado e interacción
│   ├── AuthController.jsx      sesión compartida (useAuth): loading / signedOut / noAccess / ready
│   ├── DataController.jsx      datos en tiempo real de todas las colecciones (useData)
│   ├── UIController.jsx        avisos y confirmaciones (useUI)
│   ├── useFormModal.js         formularios crear/editar reutilizables
│   ├── use<Módulo>Controller   uno por módulo
│   ├── useLoginController.js   formulario de login y recuperación
│   ├── useRouter.js            navegación por #/modulo
│   └── useSidebarController.js menú en celular
├── views/                    ← VISTA: solo muestra
│   ├── components/             Logo, Button, Field, Modal, Tabs, Toolbar, Stat, gráficos…
│   ├── layout/                 AppShell (estructura), Sidebar
│   ├── layout/QuickAdd.jsx     botón flotante + Registrar
│   ├── pages/                  Login, Inicio, Insumos, Productos, Producción, Ventas, Gastos, Informes, Ajustes
│   └── routes.js               qué página abre cada módulo
└── styles/                   tokens.css (marca) · base · components · login · shell · pages
```

## Cómo agregar un módulo nuevo

1. `models/xxxModel.js` → datos y reglas (usa `repository.js` para leer/escribir).
2. `controllers/useXxxController.js` → estado de la pantalla (usa `useFormModal`, `useSearch`, `useData`).
3. `views/pages/XxxPage.jsx` → la pantalla (usa los componentes de `views/components`).
4. Regístrala en `views/routes.js` y agrégala en `models/navigationModel.js`.

Archivos clave: `models/costModel.js` (fórmulas de costo), `models/reportModel.js` (informes),
`models/catalogModel.js` (listas: tipos de insumo, líneas, canales, categorías de gasto).

## Pensada para crecer

- **Unir con la web:** comparte `styles/tokens.css` y los componentes de marca (`KubytMark`, `Logo`). Más adelante ambos proyectos pueden vivir en un mismo repositorio (por ejemplo `apps/web` y `apps/inventario` con un paquete `shared/`), o la app puede publicarse en `inventario.kubyt.com`.
- **Más usuarios:** agrega roles en `ROLES` (`models/userModel.js`) y crea su documento en `usuarios`.
- **Router:** si la app crece mucho, se reemplaza `useRouter.js` por react-router sin tocar las páginas.

## Notas

- **Fotos de productos:** no se incluyeron porque Firebase Storage exige el plan Blaze (con tarjeta). Se pueden agregar después.
- **Volumen:** la app carga todas las colecciones en tiempo real. Para un emprendimiento va perfecto; con decenas de miles de registros conviene filtrar por fechas en `DataController.jsx`.
