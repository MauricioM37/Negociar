# Informe de Análisis y Diseño UML - Plataforma de Ecommerce con IA "Negociar"

Este documento consolida el análisis exhaustivo de la plataforma **Negociar**, comparando las especificaciones detalladas en el documento PDF de la cátedra con el estado actual de la implementación de código en nuestro repositorio. El objetivo de este informe es servir como fuente única de la verdad y guía detallada para sincronizar el código con la especificación y viceversa.

---

## 1. Lo que involucra codificación, features y BDD

El proyecto debe implementar y soportar seis módulos/casos de uso fundamentales, estructurados con metodologías ágiles (Kanban) y descritos mediante historias de usuario y BDD:

### A. Búsqueda Inteligente de Productos mediante Inteligencia Artificial
*   **Qué hace:** Permite que un comprador ingrese una consulta en lenguaje natural (ej. *"necesito algo para escuchar música mientras corro"*), la cual es procesada e interpretada por una IA (Groq Cloud LLM) para sugerir y clasificar de forma relevante los productos del catálogo.
*   **Excepciones de negocio:**
    *   Si el catálogo está vacío: informar que no hay productos.
    *   Si el servicio de IA no responde: realizar una búsqueda textual convencional sobre título, descripción, categoría y vendedor.
    *   Si no hay coincidencias: informar que no se encontraron productos.
*   **Parámetros críticos (PDF):** `buscarProductosIA(textoBusqueda: string, categoria: string, caracteristicas: string, criterioOrdenamiento: string)`

### B. Gestión del Catálogo de Productos por parte de Vendedores
*   **Qué hace:** Permite a los usuarios registrados con rol `"seller"` administrar el catálogo de sus propios productos.
*   **Features:** Alta (registro), Modificación (edición) y Eliminación de productos.
*   **Atributos de producto obligatorios:** nombre, descripción, precio, categoría, imágenes y stock.
*   **Parámetros críticos (PDF):** `RegistrarProducto(nombre: string, descripcion: string, precio: decimal, categoria: string, imagenes: string[], stock: integer)`

### C. Visualización de Catálogo y Detalle de Productos
*   **Qué hace:** Permite a usuarios invitados o registrados explorar el catálogo público de productos, aplicar filtros tradicionales (precio, categoría, etc.), ver artículos destacados, y abrir el detalle completo de un artículo.
*   **Comportamiento clave:** Si un producto tiene stock `0`, se debe desactivar el botón "Añadir al carrito" y mostrar "Sin stock" en la interfaz.

### D. Gestión del Carrito de Compras
*   **Qué hace:** Permite agregar productos, modificar la cantidad seleccionada, validar que no se exceda el stock disponible, y eliminar productos del carrito antes de realizar el pedido.

### E. Proceso de Compra e Historial de Ventas y Compras
*   **Qué hace:** Registra cada transacción de checkout. Los compradores pueden ver sus compras históricas y los vendedores pueden ver las ventas asociadas a sus productos publicados.

### F. Administración, Confirmación y Cancelación de Pedidos
*   **Qué hace:** Permite el seguimiento de pedidos por parte del comprador y del vendedor/administrador. El ciclo de vida del pedido se modela mediante el estado `DeliveryState` (pendiente, confirmado, en proceso, en camino, finalizado, cancelado).
*   **Comportamiento transaccional:** La confirmación descuenta stock y la cancelación antes del envío restituye el stock a la base de datos de manera atómica.

---

## 2. Estado actual del proyecto y nivel de cumplimiento

Nuestro proyecto está desarrollado sobre un entorno moderno en **monorepo administrado por Turborepo**:
*   **Backend (`apps/api`):** Servidor REST en Node.js/Express con TypeScript, Prisma ORM, validaciones mediante Zod y JWT para sesiones.
*   **Frontend (`apps/web`):** Aplicación de una sola página en React con Vite, Tailwind CSS para estilos, y Zustand para manejo de estado local del carrito de compras.
*   **Base de Datos (`packages/db`):** Base de datos relacional MySQL (inge2) mapeada mediante Prisma.

### Análisis detallado de cumplimiento:

1.  **Búsqueda Inteligente (Cumple en un 80%):**
    *   La integración con Groq Cloud usando `llama-3.1-8b-instant` está en funcionamiento (`ai.service.ts`).
    *   **Brecha:** No utiliza exactamente la firma procedural de cuatro parámetros descrita en el PDF. En el código actual, `getProducts` acepta un objeto plano de filtros, y la llamada de IA acepta la consulta de texto y los productos completos.
2.  **Gestión de Productos (Cumple en un 90%):**
    *   Endpoints de creación, edición y borrado protegidos por token JWT y verificación de propiedad de vendedor implementados.
    *   **Brecha:** La firma actual de creación requiere un único string de imagen (`image`), mientras que el PDF requiere un array de strings de imágenes (`imagenes: string[]`). La base de datos actual (`bdd.sql` y `schema.prisma`) solo guarda una columna de string `image_path` / `imagePath`.
3.  **Catálogo y Detalles (Cumple en un 100%):**
    *   La UI pública muestra productos activos, permite paginación o scroll, filtrar por categoría/precio, y muestra la página de detalle inhabilitando la compra si el stock es cero.
4.  **Gestión de Carrito (Cumple en un 80%):**
    *   El carrito se maneja de manera reactiva en el cliente mediante la store de Zustand.
    *   **Brecha:** El carrito es completamente local, sin sincronización persistente en base de datos, aunque se revalida al renderizar.
5.  **Historial y Administración de Pedidos (Cumple en un 30%):**
    *   El modelo relacional (`Sale`, `SaleItem`, `DeliveryState`) está perfectamente diseñado en Prisma y MySQL.
    *   **Brecha:** No se han expuesto las rutas y servicios específicos para el ciclo transaccional de pedidos (Checkout/Confirmación y Cancelación) ni de visualización del historial comprador/vendedor.

---

## 3. Tabla comparativa de Métodos y Parámetros

A continuación se detalla la comparación exacta de los métodos especificados en el PDF contra los implementados en el código TypeScript de `ProductService` y `ProductController`:

| Objeto / Clase | Método PDF (Fuente de la Verdad) | Método actual en el código | Parámetros en PDF | Parámetros actuales en Código | Discrepancia / Brecha detectada |
|---|---|---|---|---|---|
| **AIProductSearchService** | `buscarProductosIA` | `searchProductsWithAI` | `(textoBusqueda: string, categoria: string, caracteristicas: string, criterioOrdenamiento: string)` | `(query: string, availableProducts: Product[])` | La IA actual procesa solo la consulta de lenguaje natural y el listado de productos, y el filtrado por precio/categoría se ejecuta localmente en backend. |
| **ProductService** | `RegistrarProducto` | `create` | `(nombre: string, descripcion: string, precio: decimal, categoria: string, imagenes: string[], stock: integer)` | `(input: ProductMutationInput)` donde `input` tiene `{ title, description, price, category, image, ownerId }` | El nombre es `create`, el parámetro es un objeto, requiere `title` en lugar de `nombre`, y recibe una sola imagen string en lugar de un array `imagenes[]`. |
| **ProductService** | `Registrar` *(p. 27)* | `create` | `(nombre, descripcion, precio, categoria, stock)` | `(input: ProductMutationInput)` | Es un duplicado del caso de uso RegistrarProducto adaptado al contexto del formulario. |
| **ProductService** | `Actualizar` | `update` | `(idProducto, datosProducto)` | `(id: string, input: ProductUpdateInput)` | Se llama `update` en minúscula; acepta un string `id` (luego convertido a número) y un objeto tipado `ProductUpdateInput`. |
| **ProductService** | `Eliminar` | `delete` | `(idProducto)` | `(id: string, ownerId: number)` | Se llama `delete` en minúscula; además de `id` requiere el `ownerId` del vendedor autenticado por motivos de seguridad y validación de propiedad. |

---

## 4. Métodos adicionales y Funcionalidades diferentes en el código (Para actualizar en el PDF)

Para que el documento de especificación de la cátedra coincida plenamente con nuestro desarrollo moderno, sugerimos incorporar los siguientes métodos y características en los contratos del PDF:

1.  **`obtenerDestacados(limite: número)` / `getFeatured(limit: number)`:**
    *   **Descripción:** Retorna una lista reducida de los productos activos más recientes para la página de inicio o sección de ofertas semanales.
    *   **Retorno:** `Product[]`
2.  **`obtenerPorId(id: string)` / `getById(id: string)`:**
    *   **Descripción:** Obtiene los detalles completos de un producto activo específico por su identificador numérico único.
    *   **Retorno:** `Product | undefined`
3.  **Seguridad y Contexto de Propietario (`ownerId` / `supplierId`):**
    *   La firma de modificación `Actualizar(idProducto, datosProducto, idVendedor)` y `Eliminar(idProducto, idVendedor)` deben incluir obligatoriamente el contexto de seguridad del vendedor autenticado para impedir que un usuario altere recursos de otros.
4.  **Autocreación de Categorías y Proveedores:**
    *   Durante el registro de un producto, si la categoría de texto ingresada no existe, el sistema la da de alta de forma transparente mediante un método interno `ensureCategory(category: string)`.

---

## 5. Diagrama de Clases UML del Sistema

```text
+-------------------------------------------------------+
|                       Usuario                         |
+-------------------------------------------------------+
| + id: Int                                             |
| + username: String                                    |
| + email: String                                       |
| + passwordHash: String                                |
| + fullName: String                                    |
| + phone: String                                       |
| + address: String                                     |
| + activeState: Boolean                                |
+-------------------------------------------------------+
                            | 1
                            |
                            | 0..*
+-------------------------------------------------------+
|                        Venta                          |
+-------------------------------------------------------+
| + id: Int                                             |
| + userId: Int                                         |
| + address: String                                     |
| + deliveryState: DeliveryState                        |
| + totalPrice: Decimal                                 |
| + canceledAt: DateTime                                |
+-------------------------------------------------------+
  | 1
  |
  | 1..*
+-------------------------------------------------------+
|                     DetalleVenta                      |
+-------------------------------------------------------+
| + id: Int                                             |
| + saleId: Int                                         |
| + productId: Int                                      |
| + amount: Int                                         |
| + price: Decimal                                      |
+-------------------------------------------------------+
                            | *
                            |
                            | 1
+-------------------------------------------------------+
|                       Producto                        |
+-------------------------------------------------------+
| + id: Int                                             |
| + name: String                                        |
| + description: String                                 |
| + imagePath: String                                   |
| + price: Decimal                                      |
| + categoryId: Int                                     |
| + supplierId: Int                                     |
| + activeState: Boolean                                |
| + stock: Int                                          |
+-------------------------------------------------------+
         | *                             | *
         |                               |
         | 1                             | 1
+--------------------+         +--------------------+
|     Categoria      |         |     Proveedor      |
+--------------------+         +--------------------+
| + id: Int          |         | + id: Int          |
| + name: String     |         | + name: String     |
+--------------------+         | + cuil: String     |
                               | + email: String    |
                               | + phoneNumber:     |
                               |   String           |
                               | + activeState:     |
                               |   Boolean          |
                               +--------------------+
```

---

## 6. Patrones de Diseño Detectados y Potenciales

### Patrones de Diseño Actualmente Implementados:
1.  **Patrón Repository (vía Prisma ORM):**
    *   La base de datos se maneja a través del Prisma Client, aislando las sentencias SQL crudas en un mapper relacional unificado.
2.  **Patrón MVC / Arquitectura de Capas (Layered Architecture):**
    *   Estructurado rígidamente en Rutas (R), Controladores (C) que gestionan peticiones HTTP/Zod, Servicios (S) que procesan la lógica del dominio, y el cliente Prisma para persistencia de datos (M).
3.  **Patrón Singleton:**
    *   El cliente de base de datos se inicializa una única vez en `packages/db/src/client.ts` para compartir y optimizar el pool de conexiones en el entorno monorepo.
4.  **Patrón DTO / Mapper:**
    *   El método privado `mapProduct` mapea la entidad de la base de datos a un contrato plano idóneo para el frontend (`ProductDTO`), resolviendo diferencias de precios como tipos `Decimal` a tipos de punto flotante en JavaScript de forma transparente.
5.  **Patrón Middleware (Express Chain of Responsibility):**
    *   Utilizado para interceptar peticiones, extraer y validar tokens JWT (`verifyToken`), corroborar permisos de usuarios (`requireRole`) y gestionar la persistencia en disco de ficheros subidos (`multer`).

### Patrones de Diseño Potenciales a Utilizar:
1.  **Patrón Strategy (Búsqueda local vs. Búsqueda de IA):**
    *   Se puede formalizar la búsqueda definiendo una interfaz común de búsqueda. Al instanciar, el sistema elige `EstrategiaBusquedaIA` o `EstrategiaBusquedaTexto` de forma explícita.
2.  **Patrón State (Ciclo de entrega del pedido):**
    *   Permite controlar las transiciones de estados del pedido (`PENDIENTE` -> `CONFIRMADO` -> `EN_PROCESO` -> `EN_CAMINO` -> `FINALIZADO`). Cada estado valida de forma aislada si se permite la cancelación o el reembolso de dinero.
3.  **Patrón Unit of Work (Transaccionalidad):**
    *   Asegurar que la confirmación del pedido y el descuento del stock de productos se ejecuten en una transacción atómica (`prisma.$transaction`). Si uno de los productos no tiene stock suficiente, se efectúa un rollback absoluto de la compra.
4.  **Patrón Adapter (Servicio de IA):**
    *   Establecer una interfaz abstracta `ServicioIA` para desacoplar a Groq de nuestro backend. Esto posibilitará cambiar en el futuro a OpenAI o modelos locales sin modificar una sola línea del servicio de productos.

---

## 7. Plan de Refactorización a Español

De acuerdo con el mandato de la cátedra para que todos los métodos y la base de datos coincidan en español, ejecutaremos la siguiente refactorización sistemática:

### Traducción de Métodos en `ProductService` y `ProductController`:
*   `getProducts` ➔ **`buscarProductos`**
*   `searchProductsWithAI` / `buscarProductosIA` ➔ **`buscarProductosIA`** (Consolidando parámetros de búsqueda con IA en español)
*   `getById` ➔ **`obtenerPorId`**
*   `getFeatured` ➔ **`obtenerDestacados`**
*   `create` ➔ **`registrarProducto`**
*   `update` ➔ **`actualizarProducto`**
*   `delete` ➔ **`eliminarProducto`**

Adicionalmente, se actualizarán los parámetros en español, y las historias de usuario BDD se mantendrán sincronizadas en la especificación y pruebas lógicas.
