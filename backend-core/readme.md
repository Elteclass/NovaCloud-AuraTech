# Backend Core - Estado para el Equipo

Ultima actualizacion: 2026-05-11

## Alcance
Esta carpeta registra el setup de backend-core para la arquitectura base serverless.

Regla de arquitectura para esta fase:
- No usar base de datos tradicional.
- Identidad: Amazon Cognito.
- Persistencia de archivos: Amazon S3.

## Verificacion del Entorno
Herramientas locales verificadas:

```powershell
dotnet --version
# 10.0.201

aws --version
# aws-cli/2.34.33 Python/3.14.4 Windows/10 exe/AMD64
```

## Lo que ya esta implementado

Proyecto:
- Web API en .NET creada en [backend-core/NovaCloud.BackendCore](NovaCloud.BackendCore).
- Paquetes NuGet de AWS instalados:
  - `AWSSDK.S3`
  - `AWSSDK.CognitoIdentityProvider`

Endpoint de API para desbloquear frontend:
- `GET /api/files` implementado en [backend-core/NovaCloud.BackendCore/Controllers/FilesController.cs](NovaCloud.BackendCore/Controllers/FilesController.cs).
- Devuelve el payload mock requerido para la integracion.

Bootstrap/configuracion de API:
- Routing por controladores y CORS habilitado para `http://localhost:4200` en [backend-core/NovaCloud.BackendCore/Program.cs](NovaCloud.BackendCore/Program.cs).
- Redireccion HTTPS deshabilitada en Development para evitar warning local.

## Modelo de Configuracion Segura

Enfoque actual:
- Valores no sensibles en [backend-core/NovaCloud.BackendCore/appsettings.Development.json](NovaCloud.BackendCore/appsettings.Development.json).
- Valores especificos de entorno leidos desde `.env` usando `DotNetEnv`.
- Plantilla versionada en [backend-core/NovaCloud.BackendCore/.env.example](NovaCloud.BackendCore/.env.example).
- Archivo local `.env` ignorado por git via [backend-core/.gitignore](.gitignore).

Claves esperadas en `.env`:

```env
AWS__Region=us-east-1
AWS__UserPoolId=REEMPLAZAR_USER_POOL_ID
AWS__ClientId=REEMPLAZAR_CLIENT_ID
AWS__BucketName=REEMPLAZAR_BUCKET_NAME
```

Notas de seguridad:
- No subir IAM access keys, secret keys ni session tokens.
- Mantener `.env` solo en local.

## Handoff de Equipo - IDs AWS (No Secretos)

Documentado para integracion del equipo:
- Region: us-east-1
- UserPoolId: REEMPLAZAR_USER_POOL_ID
- ClientId (App Client SPA sin secreto): REEMPLAZAR_CLIENT_ID
- BucketName: REEMPLAZAR_BUCKET_NAME

Notas:
- Son identificadores, no secretos de autenticacion.
- No almacenar credenciales IAM en archivos del repositorio.

## Evidencia - Validacion de CORS en S3

Validado con AWS CLI:

```powershell
aws s3api get-bucket-cors --bucket REEMPLAZAR_BUCKET_NAME --output json
```

Resultado confirmado:
- AllowedOrigins incluye `http://localhost:4200`
- AllowedMethods incluye `GET`, `PUT`, `POST`

## Como Ejecutar en Local

Desde [backend-core/NovaCloud.BackendCore](NovaCloud.BackendCore):

```powershell
dotnet restore
dotnet build
dotnet run
```

Endpoint de prueba:
- `http://localhost:<port>/api/files`

Resultado esperado:
- `200 OK` con 2 objetos mock requeridos por frontend.

## Como Ejecutar con Docker

Desde la raiz del repo (docker-compose.yml):

```powershell
docker compose up --build
```

Endpoint de prueba:
- `http://localhost:8080/api/files`

Notas:
- El contenedor usa el perfil AWS local montado desde `~/.aws` y `AWS_PROFILE=default` (ver docker-compose.yml).
- Si quieres usar otro perfil, cambia `AWS_PROFILE` en docker-compose.yml (ej: `AWS_PROFILE=personal`).
- La configuracion de la app (`AWS__Region`, `AWS__BucketName`, etc.) se lee desde `backend-core/NovaCloud.BackendCore/.env`.
- Sin ambos de estos parámetros declarados no es posible hacer uso del servicio backend-core