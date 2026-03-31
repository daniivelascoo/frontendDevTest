# 📱 ITX Front-End Test

Mini aplicación SPA para la compra de dispositivos móviles desarrollada con **React + Vite**.

---

## 🚀 Cómo ejecutar el proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Ejecutar en desarrollo

```bash
npm run start
```

Abrir en el navegador:

```
http://localhost:5173
```

### 3. Build de producción

```bash
npm run build
```

### 4. Previsualizar build

```bash
npm run preview
```

### 5. Ejecutar tests

```bash
npm run test
```

### 6. Lint

```bash
npm run lint
```

---

## 🧠 Descripción del proyecto

Esta aplicación implementa una SPA con dos vistas principales:

### 🧾 Product List Page (PLP)

- Listado de productos obtenidos desde la API  
- Filtrado en tiempo real por marca y modelo  
- Navegación a detalle de producto  
- Grid responsive (máx. 4 columnas)  

### 📦 Product Details Page (PDP)

- Información detallada del producto  
- Selección de:
  - Color  
  - Almacenamiento  
- Añadir producto al carrito  
- Navegación de vuelta al listado  

Según la especificación de la prueba.

---

## 🌐 API

Base URL:

```
https://itx-frontend-test.onrender.com/api
```

Endpoints utilizados:

- `GET /product` → listado de productos  
- `GET /product/:productId` → detalle del producto
- `POST /cart` → añadir al carrito  

---

# 🧪 Validación de datos con Zod

Para garantizar la integridad de los datos provenientes de la API, se utiliza la librería **Zod** para validar y transformar las respuestas.

---

## 📦 Validación de listado de productos

Se define un esquema base para cada producto:

```js
const productSchema = z.object({
    id: z.string(),
    brand: z.string(),
    model: z.string(),
    price: z.string(),
    imgUrl: z.string(),
});
```

Posteriormente, se valida el array completo de productos:

```js
export const productsSchema = z.array(z.any()).transform((items) =>
  items.flatMap((item) => {
    const parsed = productSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  })
);
```

### 🔍 Decisión técnica

- Se utiliza `safeParse` para evitar que la app falle si un elemento es inválido  
- Se filtran automáticamente los productos que no cumplen el esquema  
- Se evita mostrar productos corruptos o incompletos en la UI  

---

## 📱 Validación de detalle de producto

El detalle del producto es más complejo y presenta inconsistencias en la API.

### ⚠️ Problema detectado

La API devuelve algunos campos como:
- `string` → "Yes"
- `array` → ["Yes", "No"]

Esto obliga a normalizar los datos.

---

## 🔄 Normalización de datos

Se crea un helper reutilizable:

```js
const toArray = z
  .union([z.string(), z.array(z.string())])
  .transform((val) => (Array.isArray(val) ? val : [val]));
```

### ✅ Beneficios

- Todos los campos se transforman a array  
- Se elimina lógica condicional en la UI  
- Se simplifica el renderizado de datos  

Ejemplo:

```
"Yes" → ["Yes"]
["Yes", "No"] → ["Yes", "No"]
```

---

## 🛒 Validación del carrito

Se valida el body enviado al endpoint `/api/cart`:

```js
export const productCartBodySchema = z.object({
    id: z.string(),
    colorCode: z.number(),
    storageCode: z.number(),
});
```

### ✅ Beneficios

- Garantiza que los datos enviados al backend son correctos  
- Evita errores en la petición  
- Facilita el debugging  

---

## 💡 Conclusión

El uso de Zod permite:

- Validar datos de forma segura  
- Prevenir errores en runtime  
- Normalizar inconsistencias de la API  
- Simplificar la lógica de la UI  

---

## 👨‍💻 Autor

Dani Velasco
