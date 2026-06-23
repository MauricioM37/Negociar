import { GroqAdapter } from '../adapters/groq.adapter';
import type { Product } from '../types/product';

export { GroqAdapter } from '../adapters/groq.adapter';

const groqAdapter = new GroqAdapter();

export const buscarProductosIA = async (
  consulta: string,
  productosDisponibles: Product[],
): Promise<Product[]> => {
  return groqAdapter.buscarProductos(consulta, productosDisponibles);
};
