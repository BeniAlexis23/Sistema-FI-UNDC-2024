# Despliegue y operación

## Desarrollo local

El backend usa `backend/.env` y el frontend redirige `/api` y `/uploads` a
`http://localhost:3000` mediante Vite.

```powershell
cd backend
npm run dev
```

```powershell
cd client
npm run dev
```

## Docker Compose local

1. Copiar `.env.example` a `.env` en la raíz.
2. Reemplazar `JWT_SECRET` por un valor aleatorio de al menos 32 caracteres.
3. Mantener `APP_ORIGIN=http://localhost:4000` y `COOKIE_SECURE=false` solo
   para la prueba HTTP local.
4. Construir e iniciar:

```powershell
docker compose up -d --build
docker compose ps
```

La aplicación queda disponible en `http://localhost:4000`. MongoDB y la API
no publican puertos al host; Nginx reenvía `/api` y `/uploads` internamente.

Para crear el primer administrador dentro de la base del contenedor:

```powershell
docker compose exec backend npm run migrate:roles -- --dry-run
docker compose exec backend npm run migrate:roles
```

## Datos existentes

Antes de cambiar de infraestructura se requiere un respaldo completo de
MongoDB y de `backend/src/uploads`. La migración de roles solo respalda los
campos que ella modifica y no sustituye un backup operativo.

Después de restaurar MongoDB en el volumen `mongo-data`, copiar las imágenes
existentes al volumen montado en `/app/uploads` y asegurar que pertenezcan al
usuario `node`. Verificar después varias URLs `/uploads/<archivo>` antes de
habilitar tráfico.

## Producción

- Terminar TLS en el proxy o balanceador frontal.
- Configurar `APP_ORIGIN` con el origen HTTPS exacto.
- Establecer siempre `COOKIE_SECURE=true`.
- Usar un `JWT_SECRET` exclusivo, aleatorio y administrado como secreto.
- No publicar directamente los puertos de MongoDB ni del backend.
- Respaldar los volúmenes `mongo-data` y `uploads-data` periódicamente.
- Supervisar `/api/health`; devuelve 200 únicamente cuando MongoDB está conectado.

Secuencia recomendada:

1. Respaldar MongoDB y uploads.
2. Construir imágenes y validar health checks.
3. Ejecutar el dry-run y la migración de roles.
4. Verificar login, usuarios, CRUD e imágenes.
5. Cambiar el tráfico al nuevo frontend.

## Noticias por bloques, categorías y compartir

Los campos nuevos de las noticias (`hidden`, `publishAt`, `featured`,
`category`, `byline`, `imageAlt`, `content`, `readingMinutes`, `mediaRefs`) son
opcionales: **no hay migración de datos** y las noticias existentes se siguen
viendo igual (su cuerpo antiguo se muestra con los saltos de línea). Al abrir una
noticia antigua en el editor, su texto pasa a bloques de texto.

- Todo `push` a `master` despliega a producción (`.github/workflows/deploy.yml`)
  y ese flujo no ejecuta pruebas. Antes de fusionar: respaldar MongoDB y uploads,
  y ejecutar localmente `npm test` en `backend`, `npm run lint`, `npm test` y
  `npm run build` en `client`.
- `APP_ORIGIN` debe ser el origen HTTPS público exacto. También lo usan la
  verificación de origen de las peticiones y las páginas `/compartir/...`, que
  arman con él las URL absolutas de WhatsApp y Facebook.
- nginx reenvía `/compartir/` al backend y `index.html` se sirve con
  `Cache-Control: no-cache`.
- Cada despliegue reemplaza los archivos de `/assets` (llevan hash en el nombre).
  Una pestaña abierta antes del despliegue pide entonces un archivo que ya no
  existe y nginx responde con `index.html`, lo que el navegador reporta como
  «Expected a JavaScript-or-Wasm module script… text/html». Desde
  `client/src/utils/staleChunk.js` esa pestaña se recarga sola una vez; las
  versiones publicadas antes de ese cambio no lo incluyen y necesitan una
  recarga manual (`Ctrl+F5`).
- Las imágenes subidas se convierten a WebP (máximo 2560 px, calidad 82, sin
  metadatos EXIF) y generan una miniatura `<uuid>-480.webp`. Se aceptan originales
  de hasta `MAX_UPLOAD_SIZE_MB` (25 por defecto, máximo 50) y de hasta 120
  megapíxeles: el servidor los reduce, así que lo guardado pesa unos cientos de KB.
  `MAX_UPLOAD_SIZE_MB` debe seguir por debajo de `client_max_body_size` de nginx
  (30 MB); si se sube uno, hay que subir el otro. El navegador valida el mismo
  tope con `MAX_IMAGE_MB` en `client/src/cms/editor/uploads.js`.
- En producción corre el stack de Docker Compose y la petición pasa por tres capas:
  el Apache que se describe a continuación (en el servidor, fuera de este
  repositorio), el nginx de la imagen del frontend (usa `client/nginx.conf`, con
  `client_max_body_size 30m`) y el backend. Se comprobó el 2026-11-03: `/api/health`
  responde con `Server: nginx/1.29.4`, la imagen de `client/Dockerfile`.
  `MAX_UPLOAD_SIZE_MB` sale del `.env` de Compose; si ese archivo se copió del
  `.env.example` anterior puede seguir en `5`, y eso no afecta a las fotos porque el
  navegador reduce las de más de 4 MB antes de subirlas (ver abajo).
  `scripts/prepare-release.ps1` empaqueta una versión sin Docker, que no es la que
  respondió en esa comprobación.
- Delante de la aplicación hay un **Apache** (2.4.58, Ubuntu) que no está en este
  repositorio y corta las subidas antes de que lleguen al servidor. Probado el
  2026-11-03 con JPEG válidos y sin sesión: hasta ~8 MB llegan a la aplicación; con
  ~10 MB Apache responde 403 (página HTML) y desde ~14 MB responde 413. Por eso el
  editor reduce cada foto en el navegador antes de subirla
  (`client/src/cms/editor/imagePrep.js`: lado mayor de 2560 px y unos 3 MB), y un
  403 en HTML se muestra como un filtro del servidor, no como un error de sesión.
  Si se quisieran subir originales tal cual, quien administre el servidor debe subir
  `LimitRequestBody` (y `SecRequestBodyLimit` si usa ModSecurity) del sitio a 30 MB.
- Las fotos que se suben al editor y nunca se guardan quedan en el volumen. Para
  revisarlas y limpiarlas (solo archivos sin uso y con más de 48 horas):

```powershell
docker compose exec backend npm run gc:uploads
docker compose exec backend npm run gc:uploads -- --apply
```

## Portada editable

El carrusel de la portada se administra desde el panel (menú «Portada», para
administradores y editores; hay una sola portada para todo el sitio, no una por
usuario): imagen de escritorio y de móvil, zona que se conserva al
recortar, título, subtítulo, botón a una noticia o a un enlace, orden, apagar y
programar en hora de Lima. Opcionalmente suma hasta 3 noticias destacadas con
portada.

- **No hay migración.** Las colecciones `heroslides` y `sitesettings` se crean al
  usarlas. Mientras no haya diapositivas activas el sitio muestra los 5 banners que
  vienen en el código (`client/src/assets/banner1..5.webp`), así que desplegar no
  cambia nada visible hasta que alguien configure la portada.
- Para partir de lo que se ve hoy: en «Portada», botón «Importar los banners
  actuales». Sube las 5 imágenes y crea las diapositivas solo si todas salen bien.
- Si se apagan o eliminan todas las diapositivas, el sitio vuelve a los banners
  incluidos.
- `gc:uploads` cuenta también las imágenes de la portada como en uso, y una foto
  compartida entre una noticia y una diapositiva no se borra mientras alguna la use.
- Rollback: el código anterior ignora esas colecciones y vuelve a mostrar los
  banners fijos. Las imágenes subidas quedan en el volumen.

## Rollback

Conservar la etiqueta de las imágenes anteriores y los respaldos tomados antes
del despliegue. Ante una falla, restaurar las imágenes previas, MongoDB y el
volumen de uploads. Si solo debe revertirse la migración de roles, seguir
`backend/MIGRATIONS.md` con el archivo de respaldo exacto generado al aplicarla.

El código anterior a las noticias por bloques ignora `hidden` y `publishAt`: si
se revierte, las noticias ocultas o programadas pasarían a verse en el portal.
Antes de revertir, eliminarlas o corregirlas desde el panel.

Comandos operativos útiles:

```powershell
docker compose logs --tail 200 backend
docker compose restart backend
docker compose down
```

`docker compose down` conserva los volúmenes. No utilizar `down -v` salvo que
se pretenda eliminar deliberadamente MongoDB y los uploads persistentes.
