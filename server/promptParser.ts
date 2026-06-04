/**
 * AI Prompt Parser for multilingual natural language processing
 * Supports English, Hindi, and Marathi
 */

import { invokeLLM } from "./_core/llm";

export interface ParsedPrompt {
  productName: string;
  amount: number; // in paise
  description?: string;
  contactFields: "phone" | "email" | "both";
  isRecurring: boolean;
  billingInterval?: "monthly" | "yearly";
  language: "en" | "hi" | "mr";
}

/**
 * Parse natural language prompt to extract payment page details
 * Supports English, Hindi, and Marathi prompts
 */
export async function parsePrompt(prompt: string): Promise<ParsedPrompt> {
  // Detect language from prompt
  const language = detectLanguage(prompt);

  // Use LLM to parse the prompt
  const systemPrompt = getSystemPrompt(language);

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "payment_page_details",
        strict: true,
        schema: {
          type: "object",
          properties: {
            productName: {
              type: "string",
              description: "Name of the product or service",
            },
            amount: {
              type: "number",
              description: "Amount in paise (₹1 = 100 paise)",
            },
            description: {
              type: "string",
              description: "Optional description of the product",
            },
            contactFields: {
              type: "string",
              enum: ["phone", "email", "both"],
              description: "Which contact fields to collect",
            },
            isRecurring: {
              type: "boolean",
              description: "Whether this is a recurring/subscription payment",
            },
            billingInterval: {
              type: "string",
              enum: ["monthly", "yearly"],
              description: "Billing interval if recurring",
            },
          },
          required: [
            "productName",
            "amount",
            "contactFields",
            "isRecurring",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const messageContent = response.choices[0]?.message.content;
  if (!messageContent) {
    throw new Error("Failed to parse prompt: no response from LLM");
  }

  // Extract text from content (could be string or array of content objects)
  let content: string;
  if (typeof messageContent === "string") {
    content = messageContent;
  } else if (Array.isArray(messageContent)) {
    const textContent = messageContent.find((c: any) => c.type === "text") as any;
    content = (textContent?.text) || JSON.stringify(messageContent);
  } else {
    content = JSON.stringify(messageContent);
  }

  const parsed = JSON.parse(content);

  return {
    ...parsed,
    language,
  };
}

/**
 * Detect language from prompt text
 */
function detectLanguage(text: string): "en" | "hi" | "mr" {
  // Hindi Unicode range: 0x0900-0x097F
  // Marathi uses same Unicode range as Hindi
  const hindiMarathiRegex = /[\u0900-\u097F]/g;
  const matches = text.match(hindiMarathiRegex);

  if (!matches) {
    return "en"; // Default to English if no Devanagari script found
  }

  const devanagariRatio = matches.length / text.length;

  if (devanagariRatio > 0.3) {
    // If more than 30% Devanagari, check for Marathi-specific patterns
    if (
      /\u0902|\u0903|\u094D/.test(text) ||
      /ण|ळ|ड|ढ/.test(text)
    ) {
      return "mr"; // Marathi
    }
    return "hi"; // Hindi
  }

  return "en"; // English
}

/**
 * Get system prompt for LLM based on language
 */
function getSystemPrompt(language: "en" | "hi" | "mr"): string {
  const prompts = {
    en: `You are a payment page parser. Extract the following information from the user's prompt:
1. Product/Service Name
2. Amount in rupees (convert to paise by multiplying by 100)
3. Contact fields to collect (phone, email, or both)
4. Whether it's a recurring payment (look for keywords like "monthly", "subscription", "recurring", "yearly")
5. Billing interval if recurring (monthly or yearly)
6. Optional description

Return the extracted information as JSON. If any required field is missing, make a reasonable assumption based on context.
Keywords for recurring: monthly, subscription, recurring, yearly, every month, every year, per month, per year, subscription plan`,

    hi: `आप एक भुगतान पृष्ठ पार्सर हैं। उपयोगकर्ता के प्रॉम्प्ट से निम्नलिखित जानकारी निकालें:
1. उत्पाद/सेवा का नाम
2. रुपये में राशि (पैसे में बदलने के लिए 100 से गुणा करें)
3. संपर्क क्षेत्र एकत्र करने के लिए (फोन, ईमेल, या दोनों)
4. क्या यह एक आवर्ती भुगतान है (मासिक, सदस्यता, आवर्ती, वार्षिक जैसे कीवर्ड देखें)
5. यदि आवर्ती है तो बिलिंग अंतराल (मासिक या वार्षिक)
6. वैकल्पिक विवरण

निकाली गई जानकारी को JSON के रूप में लौटाएं। यदि कोई आवश्यक फील्ड गायब है, तो संदर्भ के आधार पर एक उचित धारणा बनाएं।
आवर्ती के लिए कीवर्ड: मासिक, सदस्यता, आवर्ती, वार्षिक, हर महीने, हर साल, प्रति माह, प्रति वर्ष`,

    mr: `आप एक भुगतान पृष्ठ पार्सर आहात. वापरकर्त्याच्या प्रॉम्प्टमधून खालील माहिती काढा:
1. उत्पाद/सेवेचे नाव
2. रुपयांमध्ये रक्कम (पैशांमध्ये बदलण्यासाठी 100 ने गुणा करा)
3. संपर्क क्षेत्रे गोळा करण्यासाठी (फोन, ईमेल, किंवा दोन्ही)
4. हा आवर्ती भुगतान आहे का (मासिक, सदस्यता, आवर्ती, वार्षिक असे कीवर्ड शोधा)
5. आवर्ती असल्यास बिलिंग अंतराल (मासिक किंवा वार्षिक)
6. वैकल्पिक वर्णन

काढलेली माहिती JSON म्हणून परत करा. जर कोणतेही आवश्यक क्षेत्र गायब असेल तर संदर्भाच्या आधारे वाजवी गृहीतक बनवा.
आवर्तीसाठी कीवर्ड: मासिक, सदस्यता, आवर्ती, वार्षिक, प्रत्येक महिना, प्रत्येक वर्ष, प्रति महिना, प्रति वर्ष`,
  };

  return prompts[language];
}

/**
 * Generate slug from product name
 */
export function generateSlug(productName: string): string {
  return productName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

/**
 * Validate parsed prompt
 */
export function validateParsedPrompt(parsed: ParsedPrompt): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!parsed.productName || parsed.productName.trim().length === 0) {
    errors.push("Product name is required");
  }

  if (!parsed.amount || parsed.amount <= 0) {
    errors.push("Amount must be greater than 0");
  }

  if (parsed.amount > 10000000) {
    // Max ₹100,000 (10,000,000 paise)
    errors.push("Amount is too large (max ₹100,000)");
  }

  if (!["phone", "email", "both"].includes(parsed.contactFields)) {
    errors.push("Contact fields must be phone, email, or both");
  }

  if (
    parsed.isRecurring &&
    !["monthly", "yearly"].includes(parsed.billingInterval || "")
  ) {
    errors.push("Billing interval must be specified for recurring payments");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
