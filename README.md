# Modelo de Gestion Integral - Cafeteria

Aplicacion en React interactiva para presentar un modelo de gestion integral de cafeteria. Todos los datos son editables en tiempo real para conversar con el dueno/administrador durante la visita.

## Caracteristicas

- **Dashboard ejecutivo** con KPIs principales.
- **Ingresos, Costos Fijos y Variables** completamente editables (con botones "+" para agregar filas).
- **Estado de Resultados** con tasa de impuesto configurable (default 27% regimen general chileno).
- **Punto de Equilibrio** calculado automaticamente.
- **Sensibilizacion de escenarios** (negativo / medio / positivo) con % ajustable.
- **Balance Patrimonial** (Activos, Pasivos, Patrimonio, Endeudamiento).
- **Cartera de Productos** con Matriz BCG (Estrella / Vaca / Interrogante / Perro).
- **Marketing Mix (7P)** con radar y semaforo de desempeno.
- **Control Legal** con checklist de cumplimiento normativo.

Datos persisten solo en memoria (session). No requiere backend.

## Stack

- Vite + React 18
- Tailwind CSS 3
- Recharts para visualizaciones

---

## 1. Correr localmente

```bash
npm install
npm run dev
```

Abre la URL que indica Vite (usualmente http://localhost:5173).

## 2. Subir a GitHub

```bash
# desde la carpeta cafeteria-gestion
git init
git add .
git commit -m "feat: modelo de gestion integral cafeteria"
git branch -M main

# crea un repo vacio en https://github.com/new (ej: cafeteria-gestion)
# y copia el link, luego:
git remote add origin https://github.com/TU_USUARIO/cafeteria-gestion.git
git push -u origin main
```

## 3. Deployar a Vercel

### Opcion A - Dashboard web (mas rapido)

1. Entra a https://vercel.com/new
2. Conecta tu cuenta de GitHub
3. Selecciona el repo `cafeteria-gestion`
4. Vercel detecta Vite automaticamente - solo clic en **Deploy**
5. En ~1 minuto tendras una URL publica tipo `https://cafeteria-gestion.vercel.app`

### Opcion B - CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## 4. Presentar desde celular/tablet

- Abre la URL de Vercel en el navegador del celular/tablet
- Manten brillo al maximo y la pantalla limpia
- La app es 100% responsive - el menu superior es scroll horizontal en mobile
- Todos los campos son editables en vivo (puedes ajustar numeros mientras conversas con el administrador)

---

## Estructura del proyecto

```
cafeteria-gestion/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── index.html
└── src/
    ├── main.jsx
    ├── index.css
    └── App.jsx      # toda la aplicacion
```

## Pitch sugerido al llegar

> "Hola, mi nombre es Cristobal. Vengo a dejar mi CV porque me encantaria trabajar aca como garzon/mesero. Soy Ingeniero en Negocios y Analista de Datos, y arme esta aplicacion para mostrarles a que me refiero cuando digo que puedo aportar valor tambien desde el back-office. Basicamente es un modelo de gestion integral: ingresos, costos, punto de equilibrio, escenarios, cartera de productos... todo editable y visual. Me encantaria entrar al salon para aprender la operacion desde dentro, y en mis tiempos libres ir construyendo estas herramientas para el negocio. Tienen 2 minutos?"

## Siguientes pasos (opcional)

- Persistencia en `localStorage` para que los datos no se pierdan al recargar.
- Exportar a PDF (usar `html2canvas` + `jsPDF`).
- Modo de importacion de datos desde CSV del POS.
- Integracion con API de facturacion electronica SII.
