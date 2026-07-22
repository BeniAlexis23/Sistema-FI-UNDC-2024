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

## Rollback

Conservar la etiqueta de las imágenes anteriores y los respaldos tomados antes
del despliegue. Ante una falla, restaurar las imágenes previas, MongoDB y el
volumen de uploads. Si solo debe revertirse la migración de roles, seguir
`backend/MIGRATIONS.md` con el archivo de respaldo exacto generado al aplicarla.

Comandos operativos útiles:

```powershell
docker compose logs --tail 200 backend
docker compose restart backend
docker compose down
```

`docker compose down` conserva los volúmenes. No utilizar `down -v` salvo que
se pretenda eliminar deliberadamente MongoDB y los uploads persistentes.
