# NovaCloud ☁️

Desarrollado por **AuraTech Services**.

NovaCloud es una plataforma web SaaS B2B diseñada para que las PYMES almacenen y gestionen documentos en la nube de forma segura. El sistema integra Inteligencia Artificial para generar resúmenes automáticos y vistas previas de los archivos antes de su descarga. 

Este proyecto utiliza una arquitectura de microservicios orientada a la nube, prescindiendo de bases de datos tradicionales y apoyándose enteramente en la infraestructura de AWS para el almacenamiento y control de accesos.

## 🚀 Arquitectura y Tecnologías

El proyecto opera bajo un modelo de Monorepo, dividiendo los servicios en:

* **Frontend:** Web App desarrollada en **Angular**, aplicando principios estrictos de usabilidad y diseño de interfaces.
* **Backend Core:** API RESTful desarrollada en **C# (.NET)**, encargada de la comunicación directa con el almacenamiento en la nube y gestión de metadatos.
* **Microservicio IA:** API desarrollada en **Python**, encargada de la ingesta de documentos y comunicación con modelos de lenguaje para generar resúmenes.
* **Infraestructura Cloud (AWS):** * **S3:** Almacenamiento físico de documentos con cifrado en reposo.
  * **Cognito:** Control de acceso basado en roles (RBAC) y gestión de identidades.

## 📂 Estructura del Repositorio

- `/frontend` - Aplicación cliente (Angular).
- `/backend-core` - API principal de gestión (C#).
- `/backend-ai` - Microservicio de análisis documental (Python).
- `/infrastructure` - Políticas y scripts de despliegue para AWS.
- `/docs` - Documentación, propuestas y diagramas de arquitectura.

## 🛠️ Requisitos Previos

Para ejecutar este proyecto en un entorno local, asegúrate de tener instalado:

- [Node.js y npm](https://nodejs.org/) (Para el Frontend)
- [Angular CLI](https://angular.io/cli)
- [.NET SDK](https://dotnet.microsoft.com/) (Para el Backend Core)
- [Python 3.x](https://www.python.org/) (Para el Microservicio IA)
- [AWS CLI](https://aws.amazon.com/cli/) configurado con credenciales de desarrollo.

## 👥 Equipo de Desarrollo (AuraTech Services)

* **Jaime Alvarez** - *Tech Lead & Frontend Developer*
* **Aaron Casildo Ruvalcaba** - *Backend Engineer & Cloud Infrastructure*
* **Daniel Romero Bravo** - *Frontend Developer & UI/UX Specialist*
* **Ernesto Torres Pineda** - *AI Engineer & Backend Developer*
