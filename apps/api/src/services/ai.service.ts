import type { Product } from '../types/product';

interface GroqChatMessage {
  role: 'system' | 'user';
  content: string;
}

interface GroqChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const getGroqModel = (): string => {
  return process.env.GROQ_MODEL ?? 'llama-3.1-8b-instant';
};

const extractJsonArray = (rawContent: string): string | null => {
  const trimmed = rawContent.trim();

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed;
  }

  const markdownMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (markdownMatch && markdownMatch[1]) {
    const candidate = markdownMatch[1].trim();
    if (candidate.startsWith('[') && candidate.endsWith(']')) {
      return candidate;
    }
  }

  const startIndex = trimmed.indexOf('[');
  const endIndex = trimmed.lastIndexOf(']');
  if (startIndex >= 0 && endIndex > startIndex) {
    return trimmed.slice(startIndex, endIndex + 1);
  }

  return null;
};

const parseProductIds = (rawContent: string): string[] => {
  const jsonArray = extractJsonArray(rawContent);
  if (!jsonArray) {
    throw new Error('No se encontró un JSON array en la respuesta de IA');
  }

  const parsed = JSON.parse(jsonArray) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error('La respuesta de IA no es un array');
  }

  return parsed
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
};

const buildMessages = (consulta: string, productosDisponibles: Product[]): GroqChatMessage[] => {
  const productosSimplificados = productosDisponibles.map((producto) => ({
    id: producto.id,
    name: producto.title,
    description: producto.description,
    category: producto.category,
    price: producto.price,
  }));

  return [
    {
      role: 'system',
      content: [
        'Eres un asistente experto en e-commerce.',
        'Recibirás productos disponibles y una consulta del usuario.',
        'Debes devolver SOLO un JSON array de product_id ordenados por relevancia.',
        'No agregues texto, explicación ni markdown.',
        'Si no hay coincidencias, devuelve [].',
        `Productos disponibles (JSON): ${JSON.stringify(productosSimplificados)}`,
      ].join(' '),
    },
    {
      role: 'user',
      content: `Consulta del usuario: "${consulta}". Responde únicamente con un JSON array de product_id.`,
    },
  ];
};

export const buscarProductosIA = async (
  consulta: string,
  productosDisponibles: Product[],
): Promise<Product[]> => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || consulta.trim() === '') {
    throw new Error('Groq API key no configurada o búsqueda vacía');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getGroqModel(),
      temperature: 0,
      messages: buildMessages(consulta, productosDisponibles),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as GroqChatResponse;
  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error('Groq devolvió una respuesta vacía');
  }

  const idsProducto = parseProductIds(rawContent);
  const productosPorId = new Map(productosDisponibles.map((producto) => [producto.id, producto]));

  const idsSinDuplicados = [...new Set(idsProducto)];

  return idsSinDuplicados
    .map((id) => productosPorId.get(id))
    .filter((producto): producto is Product => Boolean(producto));
};
