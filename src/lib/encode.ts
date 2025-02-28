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

// Size threshold for full article inclusion (1MB in bytes)
const SIZE_THRESHOLD_BYTES = 1048576;

// Extract only essential fields from an article for encoding
function extractArticleEssentials(article: Article): Partial<Article> {
  return {
    url: article.url,
    title: article.title,
    description: article.description,
    image: article.image,
    favicon: article.favicon,
  };
}

// Estimate the size of all articles in dataset
function estimateDatasetSize(articles: Article[]): number {
  try {
    // Create array with essential fields for accurate size estimation
    const essentials = articles.map(extractArticleEssentials);
    const jsonStr = JSON.stringify(essentials);
    return new TextEncoder().encode(jsonStr).length;
  } catch (error) {
    console.error("Error estimating dataset size:", error);
    return Infinity; // Conservative approach
  }
}

export function encodeArticlesForUrl(articles: Article[]): string {
  try {
    const totalSize = estimateDatasetSize(articles);
    const useEssentialsOnly = totalSize >= SIZE_THRESHOLD_BYTES;

    // Convert articles to JSON string based on total size
    const jsonStr = JSON.stringify(
      articles.map((article) => {
        if (useEssentialsOnly) {
          // If dataset is large, only include URL
          return { url: article.url };
        } else {
          // Otherwise include essential fields
          return extractArticleEssentials(article);
        }
      })
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

    console.log(`Decoding ${data.length} articles from URL`);

    const articles: Article[] = data.map((article, index) => {
      if (!article.url) {
        throw new Error(
          `Invalid article format at index ${index}: missing URL`
        );
      }

      return {
        url: article.url,
        title: article.title,
        description: article.description,
        image: article.image,
        id: crypto.randomUUID(),
        read: false,
        deleted: false,
        status: "active" as const,
        dateAdded: new Date().toISOString(),
        categories: [],
        favorite: false,
      };
    });

    return articles;
  } catch (error) {
    console.error("Error decoding articles:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return [];
  }
}

export function generateShareableUrl(articles: Article[]): string {
  const encoded = encodeArticlesForUrl(articles);
  const url = new URL(window.location.href);
  url.hash = `data=${encoded}`;
  return url.toString();
}
