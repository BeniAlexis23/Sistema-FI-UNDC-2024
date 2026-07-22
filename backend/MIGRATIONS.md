# Migraciones

## Roles administrativos 2026

La migración `2026-roles-v1` asigna `admin` al usuario configurado en
`ADMIN_EMAIL`, asigna `editor` a las demás cuentas existentes y activa todas
las cuentas. No modifica contraseñas ni contenido.

Antes de aplicarla:

```powershell
npm run migrate:roles -- --dry-run
```

Para aplicarla:

```powershell
npm run migrate:roles
```

El comando genera primero un respaldo de los campos modificados dentro de
`backups/migrations`. La colección `system_migrations` evita que una segunda
ejecución vuelva a cambiar los roles.

Para revertir, usar exactamente el archivo informado por la migración:

```powershell
npm run migrate:roles:rollback -- backups/migrations/<archivo>.json --confirm
```

El rollback solo restaura `role`, `active` y `passwordChangeRequired`. Para un
despliegue de producción también se debe realizar un respaldo completo de
MongoDB y del volumen de uploads con las herramientas de infraestructura.
