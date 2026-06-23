import type { Product } from '../types/product';

export interface ServicioIA {
  buscarProductos(consulta: string, productosDisponibles: Product[]): Promise<Product[]>;
}
