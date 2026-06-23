import type { Product } from '../../types/product';
import type { EstrategiaBusqueda } from './estrategia-busqueda';

export class EstrategiaBusquedaBDD implements EstrategiaBusqueda {
  async buscar(consulta: string, productosDisponibles: Product[]): Promise<Product[]> {
    const termino = consulta.toLowerCase().trim();

    if (termino === '') {
      return productosDisponibles;
    }

    return productosDisponibles.filter((producto) =>
      producto.title.toLowerCase().includes(termino) ||
      producto.description.toLowerCase().includes(termino) ||
      producto.category.toLowerCase().includes(termino) ||
      producto.seller.toLowerCase().includes(termino),
    );
  }
}
