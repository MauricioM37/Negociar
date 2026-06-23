import type { Product } from '../../types/product';

export interface EstrategiaBusqueda {
  buscar(consulta: string, productosDisponibles: Product[]): Promise<Product[]>;
}
