import type { ServicioIA } from '../../adapters/servicio-ia';
import type { Product } from '../../types/product';
import type { EstrategiaBusqueda } from './estrategia-busqueda';

export class EstrategiaBusquedaIA implements EstrategiaBusqueda {
  constructor(
    private readonly ia: ServicioIA,
    private readonly fallback: EstrategiaBusqueda,
  ) {}

  async buscar(consulta: string, productosDisponibles: Product[]): Promise<Product[]> {
    try {
      return await this.ia.buscarProductos(consulta, productosDisponibles);
    } catch (error) {
      const productosFallback = await this.fallback.buscar(consulta, productosDisponibles);
      console.error('AI search failed, using fallback search:', error);
      return productosFallback;
    }
  }
}
