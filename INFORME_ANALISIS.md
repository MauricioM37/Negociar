# Informe final de análisis, métodos y esquema de base de datos - Negociar

Este informe refleja el estado final del código luego de sincronizar la nomenclatura de métodos de producto, los parámetros relevantes y el esquema relacional con el Diagrama Entidad-Relación del PDF (p. 54). La base de datos física queda en español mediante `@map` y `@@map` de Prisma, mientras que el código TypeScript conserva nombres de modelos/campos estables para no romper el Prisma Client.

---

## 1. Resumen ejecutivo

- La base de datos física ahora usa tablas y columnas en español: `rol`, `usuario`, `categoria`, `proveedor`, `producto`, `venta` y `detalle_venta`.
- `packages/db/prisma/schema.prisma` mantiene modelos Prisma en inglés, pero cada tabla y columna exigida por el PDF se traduce con `@@map` y `@map`.
- `bdd.sql` fue reescrito de forma simétrica al esquema Prisma, sin tablas fuera del modelo actual.
- La gestión de productos usa eliminación lógica: `eliminarProducto` cambia `estado_activo` a `false` en lugar de borrar el registro físico.
- Los métodos públicos de producto en backend y frontend están en español.

---

## 2. Métodos finales de clases y servicios

### 2.1 `ProductService` backend

Archivo: `apps/api/src/services/product.service.ts`

| Método | Parámetros | Retorno | Responsabilidad | Detalle final |
|---|---|---|---|---|
| `buscarProductos` | `filtros: ProductQueryFilters` | `Promise<Product[]>` | Buscar productos activos con filtros, búsqueda IA opcional y ordenamiento. | Filtra por `activeState: true`, precio, propietario/proveedor, categoría y texto. Si falla la IA, usa búsqueda textual local. |
| `obtenerPorId` | `id: string` | `Promise<Product \| undefined>` | Obtener el detalle de un producto activo. | Convierte el `id` a número y solo devuelve productos con `activeState: true`. |
| `obtenerDestacados` | `limite = 8` | `Promise<Product[]>` | Obtener los productos activos más recientes. | Ordena por `createdAt: 'desc'` y limita la cantidad devuelta. |
| `registrarProducto` | `entrada: ProductMutationInput` | `Promise<Product>` | Crear un producto para el vendedor autenticado. | Asegura categoría y proveedor, guarda `activeState: true` y mapea el registro a `Product`. |
| `actualizarProducto` | `id: string`, `entrada: ProductUpdateInput` | `Promise<Product \| undefined>` | Actualizar un producto propio del vendedor. | Verifica que exista activo y pertenezca al proveedor del propietario antes de actualizar. |
| `eliminarProducto` | `id: string`, `idPropietario: number` | `Promise<boolean>` | Eliminar lógicamente un producto propio. | Verifica propiedad y ejecuta `prisma.product.update({ data: { activeState: false } })`; no elimina físicamente. |

### 2.2 Métodos internos de apoyo

| Método | Parámetros | Retorno | Uso |
|---|---|---|---|
| `mapProduct` | `product: ProductRecord` | `Product` | Convierte el registro Prisma, con `category` y `supplier`, al DTO usado por la UI. |
| `findSupplierForOwner` | `ownerId: number` | `Promise<number \| null>` | Busca el proveedor sintético `Seller {ownerId}` para filtrar o validar propiedad. |
| `ensureSupplierForOwner` | `ownerId: number` | `Promise<number>` | Crea el proveedor sintético si no existe. |
| `ensureCategory` | `category: string` | `Promise<number>` | Normaliza o crea la categoría requerida por un producto. |

### 2.3 Servicio de IA

Archivo: `apps/api/src/services/ai.service.ts`

| Método | Parámetros | Retorno | Responsabilidad |
|---|---|---|---|
| `buscarProductosIA` | `query: string`, `availableProducts: Product[]` | `Promise<Product[]>` | Reordenar y seleccionar productos disponibles según una consulta en lenguaje natural usando Groq Cloud. |

### 2.4 Controlador y rutas de producto

Archivos: `apps/api/src/controllers/product.controller.ts`, `apps/api/src/routes/product.routes.ts`

| Capa | Método final | Servicio llamado | Parámetros principales |
|---|---|---|---|
| Controller | `listarProductos` | `productService.buscarProductos` | Query params: búsqueda, categoría, precios, orden y propietario opcional. |
| Controller | `obtenerProducto` | `productService.obtenerPorId` | `id` desde ruta. |
| Controller | `listarDestacados` | `productService.obtenerDestacados` | `limite` opcional. |
| Controller | `registrarProducto` | `productService.registrarProducto` | Body validado más `ownerId` del usuario autenticado. |
| Controller | `actualizarProducto` | `productService.actualizarProducto` | `id`, body validado y `ownerId`. |
| Controller | `eliminarProducto` | `productService.eliminarProducto` | `id` e `idPropietario` autenticado. |

---

## 3. Esquema final Prisma con mapeos a español

Archivo fuente: `packages/db/prisma/schema.prisma`

### 3.1 Tabla `rol`

Modelo Prisma: `Role`

| Campo Prisma | Tipo | Columna física | Notas |
|---|---|---|---|
| `id` | `Int` | `id_rol` | PK autoincremental. |
| `name` | `String` | `nombre_rol` | `VARCHAR(30)`. |

Mapeo de tabla: `@@map("rol")`.

### 3.2 Tabla `usuario`

Modelo Prisma: `User`

| Campo Prisma | Tipo | Columna física | Notas |
|---|---|---|---|
| `id` | `Int` | `id_usuario` | PK autoincremental. |
| `username` | `String` | `username` | `VARCHAR(150)`. |
| `email` | `String?` | `email` | `VARCHAR(100)`. |
| `passwordHash` | `String?` | `hash_contrasena` | `VARCHAR(255)`. |
| `fullName` | `String` | `nombre_completo` | `VARCHAR(250)`. |
| `roleId` | `Int?` | `id_rol` | FK a `rol.id_rol`. |
| `phone` | `String?` | `telefono` | `VARCHAR(20)`. |
| `address` | `String?` | `direccion` | `VARCHAR(50)`. |
| `activeState` | `Boolean?` | `estado_activo` | Default `true`. |
| `createdAt` | `DateTime` | `creado_en` | Default `now()`. |
| `updatedAt` | `DateTime` | `actualizado_en` | `@updatedAt`. |

Mapeo de tabla: `@@map("usuario")`.

### 3.3 Tabla `categoria`

Modelo Prisma: `Category`

| Campo Prisma | Tipo | Columna física | Notas |
|---|---|---|---|
| `id` | `Int` | `id_categoria` | PK autoincremental. |
| `name` | `String` | `nombre_categoria` | `VARCHAR(150)`. |

Mapeo de tabla: `@@map("categoria")`.

### 3.4 Tabla `proveedor`

Modelo Prisma: `Supplier`

| Campo Prisma | Tipo | Columna física | Notas |
|---|---|---|---|
| `id` | `Int` | `id_proveedor` | PK autoincremental. |
| `name` | `String` | `nombre_proveedor` | `VARCHAR(150)`. |
| `cuil` | `String?` | `cuil` | `VARCHAR(50)`. |
| `email` | `String?` | `correo` | `VARCHAR(50)`. |
| `phoneNumber` | `String?` | `numero_telefono` | `VARCHAR(50)`. |
| `activeState` | `Boolean` | `estado_activo` | Default `true`. |
| `createdAt` | `DateTime` | `creado_en` | Default `now()`. |
| `updatedAt` | `DateTime` | `actualizado_en` | `@updatedAt`. |

Mapeo de tabla: `@@map("proveedor")`.

### 3.5 Tabla `producto`

Modelo Prisma: `Product`

| Campo Prisma | Tipo | Columna física | Notas |
|---|---|---|---|
| `id` | `Int` | `id_producto` | PK autoincremental. |
| `name` | `String` | `nombre_producto` | `VARCHAR(255)`. |
| `description` | `String?` | `descripcion_producto` | `TEXT`. |
| `imagePath` | `String?` | `ruta_imagen` | `VARCHAR(500)`. |
| `price` | `Decimal` | `precio` | `DECIMAL(10,2)`. |
| `categoryId` | `Int` | `id_categoria` | FK a `categoria.id_categoria`, `ON DELETE CASCADE`. |
| `supplierId` | `Int?` | `id_proveedor` | FK a `proveedor.id_proveedor`. |
| `activeState` | `Boolean` | `estado_activo` | Default `true`; se usa para soft-delete. |
| `stock` | `Int` | `stock` | Stock disponible. |
| `createdAt` | `DateTime` | `creado_en` | Default `now()`. |
| `updatedAt` | `DateTime` | `actualizado_en` | `@updatedAt`. |

Mapeo de tabla: `@@map("producto")`.

### 3.6 Tabla `venta`

Modelo Prisma: `Sale`

| Campo Prisma | Tipo | Columna física | Notas |
|---|---|---|---|
| `id` | `Int` | `id_venta` | PK autoincremental. |
| `userId` | `Int` | `id_usuario` | FK a `usuario.id_usuario`, `ON DELETE RESTRICT`. |
| `address` | `String?` | `direccion` | `VARCHAR(150)`. |
| `deliveryState` | `DeliveryState?` | `estado_entrega` | Enum de estado de entrega. |
| `totalPrice` | `Decimal` | `precio_total` | `DECIMAL(10,2)`. |
| `canceledAt` | `DateTime?` | `cancelado_en` | Fecha de cancelación. |
| `createdAt` | `DateTime` | `creado_en` | Default `now()`. |
| `updatedAt` | `DateTime` | `actualizado_en` | `@updatedAt`. |

Mapeo de tabla: `@@map("venta")`.

### 3.7 Tabla `detalle_venta`

Modelo Prisma: `SaleItem`

| Campo Prisma | Tipo | Columna física | Notas |
|---|---|---|---|
| `id` | `Int` | `id_detalle_venta` | PK autoincremental. |
| `saleId` | `Int` | `id_venta` | FK a `venta.id_venta`, `ON DELETE CASCADE`. |
| `productId` | `Int` | `id_producto` | FK a `producto.id_producto`. |
| `amount` | `Int` | `cantidad` | Default `1`. |
| `price` | `Decimal` | `precio` | `DECIMAL(10,2)`. |
| `createdAt` | `DateTime` | `creado_en` | Default `now()`. |
| `updatedAt` | `DateTime` | `actualizado_en` | `@updatedAt`. |

Mapeo de tabla: `@@map("detalle_venta")`.

### 3.8 Enum `DeliveryState`

| Valor Prisma | Valor físico |
|---|---|
| `PENDIENTE` | `pendiente` |
| `CONFIRMADO` | `confirmado` |
| `EN_PROCESO` | `en proceso` |
| `EN_CAMINO` | `en camino` |
| `FINALIZADO` | `finalizado` |
| `CANCELADO` | `cancelado` |

El campo que almacena este enum se llama físicamente `estado_entrega`.

---

## 4. Esquema SQL final

Archivo fuente: `bdd.sql`

El script SQL crea la base `inge2` y define exactamente las mismas tablas y columnas físicas que Prisma expone mediante `@@map` y `@map`:

```sql
rol(id_rol, nombre_rol)
usuario(id_usuario, username, email, hash_contrasena, nombre_completo, id_rol, telefono, direccion, estado_activo, creado_en, actualizado_en)
categoria(id_categoria, nombre_categoria)
proveedor(id_proveedor, nombre_proveedor, cuil, correo, numero_telefono, estado_activo, creado_en, actualizado_en)
producto(id_producto, nombre_producto, descripcion_producto, ruta_imagen, precio, id_categoria, id_proveedor, estado_activo, stock, creado_en, actualizado_en)
venta(id_venta, id_usuario, direccion, estado_entrega, precio_total, cancelado_en, creado_en, actualizado_en)
detalle_venta(id_detalle_venta, id_venta, id_producto, cantidad, precio, creado_en, actualizado_en)
```

Relaciones principales:

- `usuario.id_rol` referencia `rol.id_rol`.
- `producto.id_categoria` referencia `categoria.id_categoria` con `ON DELETE CASCADE`.
- `producto.id_proveedor` referencia `proveedor.id_proveedor`.
- `venta.id_usuario` referencia `usuario.id_usuario` con `ON DELETE RESTRICT`.
- `detalle_venta.id_venta` referencia `venta.id_venta` con `ON DELETE CASCADE`.
- `detalle_venta.id_producto` referencia `producto.id_producto`.

---

## 5. Eliminación lógica de productos

La eliminación de productos queda configurada como soft-delete.

Antes:

```ts
await prisma.product.delete({ where: { id: idProducto } });
```

Ahora:

```ts
await prisma.product.update({
  where: { id: idProducto },
  data: { activeState: false },
});
```

Impacto funcional:

- El producto no se borra de la tabla `producto`.
- La columna física `estado_activo` queda en `false`.
- Las búsquedas públicas y de propietario ya filtran `activeState: true`, por lo que el producto eliminado lógicamente deja de aparecer.
- Se preserva integridad histórica para ventas y detalles que referencien productos existentes.

---

## 6. Brechas conocidas fuera de este fast-forward

- El PDF menciona imágenes como colección (`imagenes: string[]`), pero el modelo actual mantiene una sola ruta `ruta_imagen`/`imagePath`.
- El carrito se mantiene en estado cliente con Zustand y todavía no tiene persistencia propia en base de datos.
- El modelo de ventas existe, pero las rutas transaccionales completas de checkout, historial, confirmación y cancelación siguen siendo trabajo futuro si se requiere paridad completa con todos los casos de uso del PDF.
