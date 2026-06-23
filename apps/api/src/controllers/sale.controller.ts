import type { Request, Response } from 'express';
import {
  saleService,
  type ProcesarVentaInput,
  type ProcesarVentaItem,
  type ProcesarVentaResult,
} from '../services/sale.service';

interface CheckoutBody {
  userId?: unknown;
  direccion?: unknown;
  items?: unknown;
}

interface ErrorResponse {
  message: string;
}

type CheckoutRequest = Request<Record<string, never>, ProcesarVentaResult | ErrorResponse, CheckoutBody>;

export class SaleController {
  private parseCheckoutInput(body: CheckoutBody): ProcesarVentaInput | undefined {
    if (
      typeof body.userId !== 'number' ||
      !Number.isInteger(body.userId) ||
      body.userId <= 0 ||
      typeof body.direccion !== 'string' ||
      body.direccion.trim() === '' ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return undefined;
    }

    const items: ProcesarVentaItem[] = [];

    for (const item of body.items) {
      if (typeof item !== 'object' || item === null) {
        return undefined;
      }

      const rawProductId = 'productId' in item ? item.productId : undefined;
      const rawCantidad = 'cantidad' in item ? item.cantidad : undefined;

      if (
        typeof rawProductId !== 'number' ||
        !Number.isInteger(rawProductId) ||
        rawProductId <= 0 ||
        typeof rawCantidad !== 'number' ||
        !Number.isInteger(rawCantidad) ||
        rawCantidad <= 0
      ) {
        return undefined;
      }

      items.push({ productId: rawProductId, cantidad: rawCantidad });
    }

    return {
      userId: body.userId,
      direccion: body.direccion.trim(),
      items,
    };
  }

  checkout = async (req: CheckoutRequest, res: Response): Promise<void> => {
    const input = this.parseCheckoutInput(req.body);

    if (!input) {
      res.status(400).json({ message: 'Datos de checkout inválidos' });
      return;
    }

    try {
      const result = await saleService.procesarVenta(input);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo procesar la venta';
      res.status(400).json({ message });
    }
  };
}

export const saleController = new SaleController();
