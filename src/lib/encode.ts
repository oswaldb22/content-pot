import { Article } from "./types";
import { deflate, inflate } from "pako";

// Convert Uint8Array to string efficiently
function uint8ArrayToString(uint8Array: Uint8Array): string {
  return String.fromCharCode.apply(null, Array.from(uint8Array));
}

// Convert string to Uint8Array efficiently
function stringToUint8Array(str: string): Uint8Array {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
}

// URL-safe base64 encoding
function toBase64URL(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// URL-safe base64 decoding
function fromBase64URL(base64url: string): string {
  // Add padding if needed
  const padding = "=".repeat((4 - (base64url.length % 4)) % 4);
  return base64url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(base64url.length + padding.length, "=");
}

export function encodeArticlesForUrl(articles: Article[]): string {
  try {
    // Convert articles to JSON string
    const jsonStr = JSON.stringify(
      articles.map((article) => ({
        url: article.url,
      }))
    );

    // Compress the JSON string using pako
    const compressed = deflate(jsonStr, { level: 9 });

    // Convert compressed data to string
    const binaryString = uint8ArrayToString(compressed);

    // Convert to URL-safe base64
    return toBase64URL(btoa(binaryString));
  } catch (error) {
    console.error("Error encoding articles:", error);
    return "";
  }
}

export function decodeArticlesFromUrl(encoded: string): Article[] {
  try {
    // Convert from URL-safe base64
    const base64 = fromBase64URL(encoded);

    // Convert base64 to binary string
    const binaryString = atob(base64);

    // Convert binary string to Uint8Array
    const compressedData = stringToUint8Array(binaryString);

    // Decompress data
    const jsonStr = inflate(compressedData, { to: "string" });

    // Parse JSON
    const data = JSON.parse(jsonStr);

    // Validate that the data is an array of articles
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format: not an array");
    }

    // Basic validation of article properties
    const articles: Article[] = data.map((article) => {
      if (!article.url) {
        throw new Error("Invalid article format");
      }
      return {
        ...article,
        id: crypto.randomUUID(),
        read: false,
        deleted: false,
        status: "active",
        dateAdded: new Date().toISOString(),
      };
    });

    return articles;
  } catch (error) {
    console.error("Error decoding articles:", error);
    return [];
  }
}

export function generateShareableUrl(articles: Article[]): string {
  const encoded = encodeArticlesForUrl(articles);
  const url = new URL(window.location.href);
  url.hash = `data=${encoded}`;
  return url.toString();
}
