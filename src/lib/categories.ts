import { get, set } from "idb-keyval";

export interface Category {
  name: string;
  description: string;
  dateAdded: string;
}

const CATEGORIES_STORE_KEY = "article-bundle-categories";

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await get<Category[]>(CATEGORIES_STORE_KEY);
    return categories || [];
  } catch (error) {
    console.error("Error getting categories:", error);
    return [];
  }
}

export async function saveCategory(
  category: Omit<Category, "dateAdded">
): Promise<Category> {
  try {
    const categories = await getCategories();

    // Check if category already exists
    if (
      categories.some(
        (c) => c.name.toLowerCase() === category.name.toLowerCase()
      )
    ) {
      throw new Error("Category already exists");
    }

    const newCategory: Category = {
      ...category,
      dateAdded: new Date().toISOString(),
    };

    await set(CATEGORIES_STORE_KEY, [...categories, newCategory]);
    return newCategory;
  } catch (error) {
    console.error("Error saving category:", error);
    throw error;
  }
}
