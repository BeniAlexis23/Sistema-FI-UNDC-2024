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
- Las imágenes subidas se convierten a WebP (máximo 2000 px, sin metadatos EXIF)
  y generan una miniatura `<uuid>-480.webp`. `MAX_UPLOAD_SIZE_MB` (5 por defecto)
  debe seguir por debajo de `client_max_body_size` de nginx (6 MB); si se sube
  uno, hay que subir el otro.
- Las fotos que se suben al editor y nunca se guardan quedan en el volumen. Para
  revisarlas y limpiarlas (solo archivos sin uso y con más de 48 horas):

```powershell
docker compose exec backend npm run gc:uploads
docker compose exec backend npm run gc:uploads -- --apply
```

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
