# Genesis Rentals API

Documentacion principal de la API REST para una plataforma de alquileres y reservas tipo Airbnb.

**URL base local:** `http://localhost:3000/api`
**Swagger UI:** `http://localhost:3000/api/docs`

## Autenticacion

Usar JWT Bearer Token en los endpoints protegidos:

```http
Authorization: Bearer <accessToken>
```

Endpoints publicos:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/properties`
- `GET /api/properties/:id`
- `GET /api/properties/:propertyId/reviews`

## Usuarios de prueba seed

Todos usan password `Password123!`.

| Rol | Email |
| --- | --- |
| ADMIN | `admin@genesis.com` |
| HOST | `host@genesis.com` |
| GUEST | `guest@genesis.com` |
| GUEST | `ana@genesis.com` |

## Formato paginado

Los listados paginados devuelven:

```json
{
  "data": [],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "lastPage": 3
  }
}
```

## Enums

- `UserRole`: `GUEST`, `HOST`, `ADMIN`
- `PropertyType`: `APARTMENT`, `HOUSE`, `ROOM`, `HOTEL`, `OTHER`
- `PropertyStatus`: `ACTIVE`, `INACTIVE`
- `BookingStatus`: `PENDING`, `CONFIRMED`, `CANCELED`, `COMPLETED`

---

## Auth

### Registrar usuario

**POST** `/api/auth/register`

```json
{
  "name": "Juan Perez",
  "email": "juan@example.com",
  "password": "Password123!"
}
```

**Response 201**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Juan Perez",
    "email": "juan@example.com",
    "role": "GUEST",
    "avatarUrl": null
  }
}
```

### Login

**POST** `/api/auth/login`

```json
{
  "email": "guest@genesis.com",
  "password": "Password123!"
}
```

**Response 201**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "name": "Guest User",
    "email": "guest@genesis.com",
    "role": "GUEST",
    "avatarUrl": null
  }
}
```

### Obtener usuario autenticado

**GET** `/api/auth/me`

Requiere `Authorization: Bearer <accessToken>`.

**Response 200**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "name": "Guest User",
  "email": "guest@genesis.com",
  "role": "GUEST",
  "avatarUrl": null
}
```

---

## Users

### Obtener mi perfil

**GET** `/api/users/me`

Requiere token.

**Response 200**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "name": "Guest User",
  "email": "guest@genesis.com",
  "role": "GUEST",
  "avatarUrl": null
}
```

### Actualizar mi perfil

**PATCH** `/api/users/me`

Requiere token.

```json
{
  "name": "Juan Actualizado",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response 200**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "name": "Juan Actualizado",
  "email": "guest@genesis.com",
  "role": "GUEST",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

### Listar mis reservas

**GET** `/api/users/me/bookings?page=1&limit=10`

Requiere token. Es alias del listado de bookings filtrado por el usuario y su rol.

**Response 200**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174010",
      "propertyId": "123e4567-e89b-12d3-a456-426614174100",
      "guestId": "123e4567-e89b-12d3-a456-426614174001",
      "checkIn": "2026-09-10",
      "checkOut": "2026-09-15",
      "guests": 2,
      "totalPrice": "500.00",
      "status": "CONFIRMED"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

### Listar mis favoritos

**GET** `/api/users/me/favorites?page=1&limit=10`

Requiere token. Es alias de `GET /api/favorites`.

**Response 200**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174020",
      "userId": "123e4567-e89b-12d3-a456-426614174001",
      "propertyId": "123e4567-e89b-12d3-a456-426614174100",
      "createdAt": "2026-08-24T15:00:00.000Z",
      "property": {
        "id": "123e4567-e89b-12d3-a456-426614174100",
        "title": "Departamento centrico en Palermo",
        "city": "Buenos Aires",
        "country": "Argentina",
        "pricePerNight": "100.00"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

---

## Properties

### Listar propiedades

**GET** `/api/properties?city=Buenos%20Aires&minPrice=50&maxPrice=200&guests=2&page=1&limit=10&sortBy=pricePerNight&order=ASC`

Publico.

Query params disponibles: `city`, `country`, `minPrice`, `maxPrice`, `guests`, `bedrooms`, `bathrooms`, `propertyType`, `checkIn`, `checkOut`, `page`, `limit`, `sortBy`, `order`.

**Response 200**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174100",
      "hostId": "123e4567-e89b-12d3-a456-426614174002",
      "title": "Departamento centrico en Palermo",
      "description": "Hermoso departamento con vista al parque.",
      "propertyType": "APARTMENT",
      "city": "Buenos Aires",
      "country": "Argentina",
      "address": "Av. Santa Fe 1234",
      "latitude": "-34.5875000",
      "longitude": "-58.4204000",
      "pricePerNight": "100.00",
      "maxGuests": 4,
      "bedrooms": 2,
      "bathrooms": 1,
      "status": "ACTIVE",
      "images": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174110",
          "propertyId": "123e4567-e89b-12d3-a456-426614174100",
          "imageUrl": "https://example.com/property.jpg",
          "isCover": true,
          "createdAt": "2026-08-24T15:00:00.000Z"
        }
      ]
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

### Obtener propiedad por ID

**GET** `/api/properties/:id`

Publico. Solo devuelve propiedades `ACTIVE`.

**Response 200**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174100",
  "hostId": "123e4567-e89b-12d3-a456-426614174002",
  "title": "Departamento centrico en Palermo",
  "description": "Hermoso departamento con vista al parque.",
  "propertyType": "APARTMENT",
  "city": "Buenos Aires",
  "country": "Argentina",
  "address": "Av. Santa Fe 1234",
  "latitude": "-34.5875000",
  "longitude": "-58.4204000",
  "pricePerNight": "100.00",
  "maxGuests": 4,
  "bedrooms": 2,
  "bathrooms": 1,
  "status": "ACTIVE",
  "createdAt": "2026-08-24T15:00:00.000Z",
  "updatedAt": "2026-08-24T15:00:00.000Z",
  "images": []
}
```

### Crear propiedad

**POST** `/api/properties`

Requiere token con rol `HOST` o `ADMIN`.

```json
{
  "title": "Hermosa cabana",
  "description": "Cabana en la montana con vista al lago.",
  "propertyType": "HOUSE",
  "city": "Bariloche",
  "country": "Argentina",
  "address": "Av. Bustillo km 10",
  "latitude": -41.1335,
  "longitude": -71.3103,
  "pricePerNight": 120,
  "maxGuests": 5,
  "bedrooms": 2,
  "bathrooms": 1
}
```

**Response 201**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174101",
  "hostId": "123e4567-e89b-12d3-a456-426614174002",
  "title": "Hermosa cabana",
  "description": "Cabana en la montana con vista al lago.",
  "propertyType": "HOUSE",
  "city": "Bariloche",
  "country": "Argentina",
  "address": "Av. Bustillo km 10",
  "latitude": -41.1335,
  "longitude": -71.3103,
  "pricePerNight": 120,
  "maxGuests": 5,
  "bedrooms": 2,
  "bathrooms": 1,
  "status": "ACTIVE"
}
```

### Actualizar propiedad

**PATCH** `/api/properties/:id`

Requiere token con rol `HOST` propietario o `ADMIN`.

```json
{
  "pricePerNight": 135,
  "maxGuests": 6
}
```

**Response 200**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174101",
  "hostId": "123e4567-e89b-12d3-a456-426614174002",
  "title": "Hermosa cabana",
  "pricePerNight": 135,
  "maxGuests": 6,
  "status": "ACTIVE",
  "updatedAt": "2026-08-24T16:00:00.000Z"
}
```

### Eliminar propiedad

**DELETE** `/api/properties/:id`

Requiere token con rol `HOST` propietario o `ADMIN`. La propiedad pasa a `INACTIVE`.

**Response 200**

Sin cuerpo.

### Agregar imagen a propiedad

**POST** `/api/properties/:id/images`

Requiere token con rol `HOST` propietario o `ADMIN`.

```json
{
  "imageUrl": "https://example.com/property-cover.jpg",
  "isCover": true
}
```

**Response 201**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174110",
  "propertyId": "123e4567-e89b-12d3-a456-426614174101",
  "imageUrl": "https://example.com/property-cover.jpg",
  "isCover": true,
  "createdAt": "2026-08-24T16:00:00.000Z"
}
```

### Eliminar imagen de propiedad

**DELETE** `/api/properties/:id/images/:imageId`

Requiere token con rol `HOST` propietario o `ADMIN`.

**Response 200**

Sin cuerpo.

### Definir imagen de portada

**PATCH** `/api/properties/:id/images/:imageId/cover`

Requiere token con rol `HOST` propietario o `ADMIN`.

**Response 200**

Sin cuerpo.

---

## Bookings

### Crear reserva

**POST** `/api/bookings`

Requiere token. Un `HOST` no puede reservar su propia propiedad, salvo que sea `ADMIN`.

```json
{
  "propertyId": "123e4567-e89b-12d3-a456-426614174100",
  "checkIn": "2026-09-10",
  "checkOut": "2026-09-15",
  "guests": 2
}
```

**Response 201**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174010",
  "propertyId": "123e4567-e89b-12d3-a456-426614174100",
  "guestId": "123e4567-e89b-12d3-a456-426614174001",
  "checkIn": "2026-09-10",
  "checkOut": "2026-09-15",
  "guests": 2,
  "totalPrice": 500,
  "status": "CONFIRMED"
}
```

### Listar reservas

**GET** `/api/bookings?page=1&limit=10`

Requiere token.

- `ADMIN`: ve todas las reservas.
- `HOST`: ve reservas de sus propiedades.
- `GUEST`: ve sus propias reservas.

**Response 200**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174010",
      "propertyId": "123e4567-e89b-12d3-a456-426614174100",
      "guestId": "123e4567-e89b-12d3-a456-426614174001",
      "checkIn": "2026-09-10",
      "checkOut": "2026-09-15",
      "guests": 2,
      "totalPrice": "500.00",
      "status": "CONFIRMED",
      "property": {
        "id": "123e4567-e89b-12d3-a456-426614174100",
        "title": "Departamento centrico en Palermo"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

### Obtener reserva por ID

**GET** `/api/bookings/:id`

Requiere token. Puede verla el `ADMIN`, el guest de la reserva o el host de la propiedad.

**Response 200**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174010",
  "propertyId": "123e4567-e89b-12d3-a456-426614174100",
  "guestId": "123e4567-e89b-12d3-a456-426614174001",
  "checkIn": "2026-09-10",
  "checkOut": "2026-09-15",
  "guests": 2,
  "totalPrice": "500.00",
  "status": "CONFIRMED",
  "createdAt": "2026-08-24T15:00:00.000Z",
  "updatedAt": "2026-08-24T15:00:00.000Z"
}
```

### Cancelar reserva

**PATCH** `/api/bookings/:id/cancel`

Requiere token. El guest solo puede cancelar sus propias reservas y hasta 24 horas antes del check-in. `ADMIN` puede cancelar sin esa restriccion.

**Response 200**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174010",
  "propertyId": "123e4567-e89b-12d3-a456-426614174100",
  "guestId": "123e4567-e89b-12d3-a456-426614174001",
  "checkIn": "2026-09-10",
  "checkOut": "2026-09-15",
  "guests": 2,
  "totalPrice": "500.00",
  "status": "CANCELED"
}
```

---

## Favorites

### Agregar favorito

**POST** `/api/favorites/:propertyId`

Requiere token.

**Response 201**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174020",
  "userId": "123e4567-e89b-12d3-a456-426614174001",
  "propertyId": "123e4567-e89b-12d3-a456-426614174100",
  "createdAt": "2026-08-24T15:00:00.000Z"
}
```

### Quitar favorito

**DELETE** `/api/favorites/:propertyId`

Requiere token.

**Response 200**

Sin cuerpo.

### Listar favoritos

**GET** `/api/favorites?page=1&limit=10`

Requiere token.

**Response 200**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174020",
      "userId": "123e4567-e89b-12d3-a456-426614174001",
      "propertyId": "123e4567-e89b-12d3-a456-426614174100",
      "createdAt": "2026-08-24T15:00:00.000Z",
      "property": {
        "id": "123e4567-e89b-12d3-a456-426614174100",
        "title": "Departamento centrico en Palermo",
        "city": "Buenos Aires",
        "country": "Argentina",
        "pricePerNight": "100.00"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

---

## Reviews

### Crear review

**POST** `/api/reviews`

Requiere token. Solo se puede crear si la reserva existe, pertenece al usuario, corresponde a la propiedad indicada, esta `COMPLETED` y aun no tiene review.

```json
{
  "propertyId": "123e4567-e89b-12d3-a456-426614174100",
  "bookingId": "123e4567-e89b-12d3-a456-426614174010",
  "rating": 5,
  "comment": "Excelente estadia, muy recomendable."
}
```

**Response 201**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174030",
  "propertyId": "123e4567-e89b-12d3-a456-426614174100",
  "userId": "123e4567-e89b-12d3-a456-426614174001",
  "bookingId": "123e4567-e89b-12d3-a456-426614174010",
  "rating": 5,
  "comment": "Excelente estadia, muy recomendable.",
  "createdAt": "2026-08-24T15:00:00.000Z",
  "updatedAt": "2026-08-24T15:00:00.000Z"
}
```

### Listar reviews de una propiedad

**GET** `/api/properties/:propertyId/reviews?page=1&limit=10`

Publico.

**Response 200**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174030",
      "propertyId": "123e4567-e89b-12d3-a456-426614174100",
      "userId": "123e4567-e89b-12d3-a456-426614174001",
      "bookingId": "123e4567-e89b-12d3-a456-426614174010",
      "rating": 5,
      "comment": "Excelente estadia, muy recomendable.",
      "createdAt": "2026-08-24T15:00:00.000Z",
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "name": "Guest User",
        "avatarUrl": null
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

### Actualizar review

**PATCH** `/api/reviews/:id`

Requiere token. Solo el autor de la review puede actualizarla.

```json
{
  "rating": 4,
  "comment": "Muy buena estadia."
}
```

**Response 200**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174030",
  "propertyId": "123e4567-e89b-12d3-a456-426614174100",
  "userId": "123e4567-e89b-12d3-a456-426614174001",
  "bookingId": "123e4567-e89b-12d3-a456-426614174010",
  "rating": 4,
  "comment": "Muy buena estadia.",
  "updatedAt": "2026-08-24T16:00:00.000Z"
}
```

### Eliminar review

**DELETE** `/api/reviews/:id`

Requiere token. Puede eliminarla el autor o un `ADMIN`.

**Response 200**

Sin cuerpo.

---

## Admin

Todos los endpoints de esta seccion requieren token con rol `ADMIN`.

### Estadisticas

**GET** `/api/admin/stats`

**Response 200**

```json
{
  "totalUsers": 4,
  "totalProperties": 12,
  "totalBookings": 20,
  "totalReviews": 8,
  "activeBookings": 6,
  "completedBookings": 10,
  "canceledBookings": 4
}
```

### Listar usuarios

**GET** `/api/admin/users?page=1&limit=10`

**Response 200**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "name": "Guest User",
      "email": "guest@genesis.com",
      "role": "GUEST",
      "avatarUrl": null,
      "createdAt": "2026-08-24T15:00:00.000Z",
      "updatedAt": "2026-08-24T15:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

### Actualizar rol de usuario

**PATCH** `/api/admin/users/:id/role`

```json
{
  "role": "HOST"
}
```

**Response 200**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "name": "Guest User",
  "email": "guest@genesis.com",
  "role": "HOST",
  "avatarUrl": null,
  "updatedAt": "2026-08-24T16:00:00.000Z"
}
```

### Eliminar usuario

**DELETE** `/api/admin/users/:id`

**Response 200**

Sin cuerpo.

### Listar propiedades

**GET** `/api/admin/properties?page=1&limit=10`

**Response 200**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174100",
      "hostId": "123e4567-e89b-12d3-a456-426614174002",
      "title": "Departamento centrico en Palermo",
      "propertyType": "APARTMENT",
      "city": "Buenos Aires",
      "country": "Argentina",
      "pricePerNight": "100.00",
      "status": "ACTIVE"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

### Listar reservas

**GET** `/api/admin/bookings?page=1&limit=10`

**Response 200**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174010",
      "propertyId": "123e4567-e89b-12d3-a456-426614174100",
      "guestId": "123e4567-e89b-12d3-a456-426614174001",
      "checkIn": "2026-09-10",
      "checkOut": "2026-09-15",
      "guests": 2,
      "totalPrice": "500.00",
      "status": "CONFIRMED"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

### Listar reviews

**GET** `/api/admin/reviews?page=1&limit=10`

**Response 200**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174030",
      "propertyId": "123e4567-e89b-12d3-a456-426614174100",
      "userId": "123e4567-e89b-12d3-a456-426614174001",
      "bookingId": "123e4567-e89b-12d3-a456-426614174010",
      "rating": 5,
      "comment": "Excelente estadia, muy recomendable.",
      "createdAt": "2026-08-24T15:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

### Eliminar review

**DELETE** `/api/admin/reviews/:id`

**Response 200**

Sin cuerpo.

---

## Errores comunes

El filtro global devuelve errores con esta forma:

```json
{
  "statusCode": 400,
  "message": "checkOut must be after checkIn",
  "error": "Bad Request",
  "timestamp": "2026-08-24T16:00:00.000Z",
  "path": "/api/bookings"
}
```

Codigos habituales:

- `400 Bad Request`: datos invalidos, fechas incorrectas o maximo de huespedes superado.
- `401 Unauthorized`: token JWT ausente, invalido o usuario no encontrado.
- `403 Forbidden`: rol insuficiente o recurso ajeno.
- `404 Not Found`: recurso no encontrado.
- `409 Conflict`: email ya registrado, favorito duplicado, review duplicada o fechas no disponibles.
- `422 Unprocessable Entity`: regla de negocio incumplida, por ejemplo cancelar dentro de las 24 horas previas al check-in.
