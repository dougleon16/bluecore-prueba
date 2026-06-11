# Bluecore — Panel de Solicitudes de Crédito

Sistema interno para registrar, evaluar y dar seguimiento a solicitudes de crédito. Un analista puede crear solicitudes, filtrarlas por estado y aprobarlas o rechazarlas dejando trazabilidad de cada decisión.

> **App de uso interno** — no es necesario registrarse. Usa las credenciales proporcionadas abajo.

---

## Despliegue rápido con Docker

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
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

## Decisiones de diseño

- **NestJS + TypeORM** — módulos, inyección de dependencias y sincronización automática de esquema en desarrollo (`synchronize: true`).
- **JWT stateless** — el token lleva `sub` y `email`; el servidor no guarda estado de sesión.
- **Reglas de negocio en la capa de servicio** — las transiciones de estado viven en `CreditRequestsService`, aisladas y testeables sin levantar HTTP.
- **Angular signals** — `AuthService` expone un `signal<string | null>` para el token; `isAuthenticated` es un `computed` derivado. Sin `BehaviorSubject` ni NgRx.
- **`authInterceptor` funcional** — usa `inject()` para leer el token, alineado con las buenas prácticas de Angular 17+.
