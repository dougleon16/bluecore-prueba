# Bluecore — Panel de Solicitudes de Crédito

Sistema interno para registrar, evaluar y dar seguimiento a solicitudes de crédito. Un analista puede crear solicitudes, filtrarlas por estado y aprobarlas o rechazarlas dejando trazabilidad de cada decisión.

> **App de uso interno** — no es necesario registrarse. Usa las credenciales proporcionadas abajo.

---

## Despliegue rápido con Docker

### 1. Clonar el repositorio

```bash
git clone git@github.com:dougleon16/bluecore-prueba.git
cd bluecore-test
```

### 2. Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
```

El archivo `.env.example` ya tiene los valores de la base de datos de la prueba. Solo asegúrate de que el archivo `.env` exista antes de continuar.

### 3. Levantar el stack

```bash
docker compose up --build
```

El primer build tarda 2-4 minutos por la descarga de dependencias. Cuando el log del backend muestre `Application running on port 3000`, todo está listo.

### 4. Acceder

| Servicio    | URL                            |
| ----------- | ------------------------------ |
| Frontend    | http://localhost               |
| Backend API | http://localhost:3000/api      |
| Swagger UI  | http://localhost:3000/api/docs |

### 5. Credenciales de acceso

```
Email:    admin@bluecore.com
Password: 123456
```

### Detener

```bash
docker compose down
```

---

## Desarrollo local (sin Docker)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend disponible en `http://localhost:4200`.

---

## API REST

| Método  | Endpoint                          | Auth | Descripción                                     |
| ------- | --------------------------------- | ---- | ----------------------------------------------- |
| `POST`  | `/api/auth/login`                 | —    | Iniciar sesión, retorna `access_token`          |
| `POST`  | `/api/auth/register`              | —    | Registrar un nuevo analista                     |
| `GET`   | `/api/credit-requests`            | JWT  | Listar solicitudes (filtro `?status=` opcional) |
| `POST`  | `/api/credit-requests`            | JWT  | Crear una solicitud de crédito                  |
| `PATCH` | `/api/credit-requests/:id/status` | JWT  | Aprobar o rechazar una solicitud                |

### Ejemplo — crear solicitud

```json
POST /api/credit-requests
{
  "cedula": "8-888-8888",
  "amount": 15000,
  "termMonths": 24
}
```

### Ejemplo — cambiar estado

```json
PATCH /api/credit-requests/1/status
{
  "status": "rejected",
  "comment": "Historial crediticio insuficiente."
}
```

### Formato de error

```json
{
  "statusCode": 400,
  "message": "Se requiere un comentario al rechazar una solicitud",
  "error": "BadRequestException",
  "timestamp": "2026-06-10T00:00:00.000Z",
  "path": "/api/credit-requests/1/status"
}
```

---

## Reglas de negocio

| Regla          | Restricción                                      |
| -------------- | ------------------------------------------------ |
| Monto          | $500 — $50,000                                   |
| Plazo          | 6 — 60 meses                                     |
| Estado inicial | Toda solicitud nace en `pending`                 |
| Transiciones   | Solo `pending → approved` o `pending → rejected` |
| Comentario     | Obligatorio al rechazar                          |

```
pending ──── aprobar ────► approved  (final)
   └──────── rechazar ───► rejected  (final)
```

---

## Pruebas

### Backend (Jest)

```bash
cd backend && npm test
```

24 pruebas unitarias — servicios, controladores, estrategia JWT y filtro de excepciones.

### Frontend (Vitest)

```bash
cd frontend && npm test
```

123 pruebas unitarias — servicios, componentes, guard e interceptor.

---

## Estructura del proyecto

```
/
├── backend/
│   ├── src/
│   │   ├── auth/               # Login, registro, JWT strategy
│   │   ├── credit-requests/    # CRUD + reglas de negocio
│   │   ├── users/              # Entidad User
│   │   └── common/filters/     # Manejo global de errores HTTP
│   └── Dockerfile
├── frontend/
│   ├── src/app/
│   │   ├── auth/               # Login + AuthService (signals)
│   │   ├── core/               # Guard, interceptor, modelos
│   │   └── credit-requests/    # Lista, formulario, stats, tabla
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## Stack tecnológico

| Capa           | Tecnología            | Por qué                                                                                                                   |
| -------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Backend        | **NestJS 10**         | Framework opinionado con módulos, DI y decoradores — reduce boilerplate y facilita los tests unitarios                    |
| ORM            | **TypeORM**           | Integración nativa con NestJS; `synchronize: true` crea el esquema automáticamente en desarrollo sin migraciones manuales |
| Base de datos  | **MySQL 8 (AWS RDS)** | Requerimiento de la prueba; TypeORM abstrae el dialecto                                                                   |
| Autenticación  | **Passport + JWT**    | Estándar de la industria para APIs REST stateless; el token lleva `sub` y `email`, el servidor no guarda sesión           |
| Validación     | **class-validator**   | Decoradores en los DTOs — separa la validación de formato de las reglas de negocio                                        |
| Frontend       | **Angular 21**        | Framework completo con router, formularios reactivos y sistema de DI propio                                               |
| Estado         | **Signals**           | API reactiva nativa de Angular 17+; sin necesidad de NgRx ni RxJS subjects para este alcance                              |
| Estilos        | **Tailwind CSS 4**    | Utility-first — diseño consistente sin archivos de estilos separados                                                      |
| Tests backend  | **Jest**              | Integrado en NestJS; TestingModule permite aislar servicios con mocks sin levantar HTTP                                   |
| Tests frontend | **Vitest**            | Integrado en `@angular/build:unit-test`; compatible con el ecosistema Vite que usa Angular 21                             |

---

## Arquitectura

El backend sigue una arquitectura por capas donde la lógica solo fluye hacia abajo — el controlador nunca accede directamente al repositorio:

```
HTTP Request
    │
    ▼
Controller          ← valida formato (DTOs + class-validator), devuelve respuesta
    │
    ▼
Service             ← aplica reglas de negocio (transiciones de estado, validaciones cruzadas)
    │
    ▼
Repository          ← acceso a datos mediante TypeORM
    │
    ▼
MySQL (RDS)
```

El frontend sigue el patrón de servicios compartidos con componentes standalone:

```
AppComponent (router-outlet)
    │
    ├── LoginComponent         ← formulario reactivo + AuthService
    │
    └── RequestListComponent   ← orquesta todos los componentes hijo
            ├── AppHeaderComponent
            ├── RequestStatsComponent
            ├── RequestTableComponent  ← RequestRowComponent 
            ├── CreateFormComponent
            └── RejectModalComponent
```

`AuthService` mantiene el token en un `signal<string | null>`. El `authInterceptor` funcional lo lee con `inject()` y adjunta el header `Authorization: Bearer <token>` en cada petición saliente. El `authGuard` protege la ruta `/solicitudes` redirigiendo a `/login` si no hay token.
