import OpenAI from "openai";
import { formatISO, isValid, parseISO, startOfDay, subDays } from "date-fns";

type ParsedExpense = {
  amount: number;
  category: string;
  description: string;
  date: string;
};

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const categoryMatchers: Array<{ category: string; regex: RegExp }> = [
  { category: "Food", regex: /\b(food|chai|tea|coffee|breakfast|lunch|dinner|zomato|swiggy|snack)\b/i },
  { category: "Travel", regex: /\b(petrol|fuel|uber|ola|cab|auto|metro|bus|train|travel)\b/i },
  { category: "Bills", regex: /\b(bill|electricity|wifi|internet|mobile|recharge|rent)\b/i },
  { category: "Shopping", regex: /\b(shopping|amazon|flipkart|shirt|groceries|store)\b/i },
  { category: "Entertainment", regex: /\b(movie|netflix|party|concert|game)\b/i },
  { category: "Health", regex: /\b(medical|doctor|medicine|pharmacy|gym)\b/i }
];

function normalizeCategory(text: string) {
  const match = categoryMatchers.find((item) => item.regex.test(text));
  return match?.category ?? "Other";
}

function extractAmount(text: string) {
  const matches = text.match(/(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)/i);
  return matches ? Number(matches[1]) : NaN;
}

function resolveRelativeDate(text: string) {
  const lower = text.toLowerCase();
  const now = new Date();

  if (lower.includes("yesterday") || lower.includes("kal")) {
    return startOfDay(subDays(now, 1));
  }

  if (lower.includes("today") || lower.includes("aaj")) {
    return startOfDay(now);
  }

  const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) {
    const parsed = parseISO(`${isoMatch[1]}T00:00:00.000Z`);
    if (isValid(parsed)) {
      return parsed;
    }
  }

  return startOfDay(now);
}

function createDescription(text: string, category: string) {
  const cleaned = text
    .replace(/(?:rs\.?|inr|₹)?\s*\d+(?:\.\d+)?/gi, "")
    .replace(/\b(today|yesterday|aaj|kal)\b/gi, "")
    .trim()
    .replace(/\s+/g, " ");

  if (cleaned.length >= 2) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return `${category} expense`;
}

function fallbackParseExpense(text: string): ParsedExpense {
  const amount = extractAmount(text);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Please include a valid amount like '200 on food'.");
  }

  const category = normalizeCategory(text);
  const date = formatISO(resolveRelativeDate(text));
  const description = createDescription(text, category);

  return {
    amount,
    category,
    description,
    date
  };
}

function sanitizeAiResponse(content: string): ParsedExpense {
  const parsed = JSON.parse(content) as Partial<ParsedExpense>;
  const amount = Number(parsed.amount);
  const date = parsed.date ? new Date(parsed.date) : null;

  if (!Number.isFinite(amount) || amount <= 0 || !date || !isValid(date)) {
    throw new Error("Invalid AI response.");
  }

  return {
    amount,
    category: parsed.category?.trim() || normalizeCategory(content),
    description: parsed.description?.trim() || "Expense",
    date: formatISO(date)
  };
}

export async function parseExpenseInput(text: string): Promise<ParsedExpense> {
  if (!openai) {
    return fallbackParseExpense(text);
  }

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "Extract structured expense data. Understand casual English, Hinglish, and shorthand. Return only valid JSON with amount (number), category (string), description (string), date (ISO format). If no date is mentioned, use today's date."
        },
        {
          role: "user",
          content: `Extract structured expense data from this text: ${text}`
        }
      ],
      response_format: {
        type: "json_object"
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty AI response.");
    }

    return sanitizeAiResponse(content);
  } catch (error) {
    console.warn("Falling back to local parser:", error);
    return fallbackParseExpense(text);
  }
}
