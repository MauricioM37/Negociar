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

const buildMessages = (query: string, availableProducts: Product[]): GroqChatMessage[] => {
  const simplifiedProducts = availableProducts.map((product) => ({
    id: product.id,
    name: product.title,
    description: product.description,
    category: product.category,
    price: product.price,
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
        `Productos disponibles (JSON): ${JSON.stringify(simplifiedProducts)}`,
      ].join(' '),
    },
    {
      role: 'user',
      content: `Consulta del usuario: "${query}". Responde únicamente con un JSON array de product_id.`,
    },
  ];
};

export const searchProductsWithAI = async (
  query: string,
  availableProducts: Product[],
): Promise<Product[]> => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || query.trim() === '') {
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
      messages: buildMessages(query, availableProducts),
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

  const productIds = parseProductIds(rawContent);
  const productsById = new Map(availableProducts.map((product) => [product.id, product]));

  const deduplicatedIds = [...new Set(productIds)];

  return deduplicatedIds
    .map((id) => productsById.get(id))
    .filter((product): product is Product => Boolean(product));
};
