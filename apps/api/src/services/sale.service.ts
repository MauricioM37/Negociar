import { prisma } from '@Negociar/db/src/client';

export interface ProcesarVentaItem {
  productId: number;
  cantidad: number;
}

export interface ProcesarVentaInput {
  userId: number;
  direccion: string;
  items: ProcesarVentaItem[];
}

export interface ProcesarVentaResult {
  saleId: number;
  total: number;
}

interface DecimalLike {
  toNumber: () => number;
}

interface ProcesarVentaRow {
  id_venta: bigint | number | string;
  precio_total: DecimalLike | number | string;
}

const isDecimalLike = (value: unknown): value is DecimalLike => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in value &&
    typeof value.toNumber === 'function'
  );
};

const parseDecimal = (value: ProcesarVentaRow['precio_total']): number => {
  if (isDecimalLike(value)) {
    return value.toNumber();
  }

  return Number(value);
};

export class SaleService {
  async procesarVenta(input: ProcesarVentaInput): Promise<ProcesarVentaResult> {
    const itemsJson = JSON.stringify(input.items);

    const rows = await prisma.$queryRawUnsafe<ProcesarVentaRow[]>(
      'CALL sp_procesar_venta(?, ?, ?)',
      input.userId,
      input.direccion,
      itemsJson,
    );

    const row = rows[0];

    if (!row) {
      throw new Error('No se pudo procesar la venta');
    }

    return {
      saleId: Number(row.id_venta),
      total: parseDecimal(row.precio_total),
    };
  }
}

export const saleService = new SaleService();
