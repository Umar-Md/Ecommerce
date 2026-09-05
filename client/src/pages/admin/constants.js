export const EMPTY_PRODUCT = {
  name: "", sku: "", description: "", price: "", originalPrice: "", stock: "",
  category: "", brand: "", images: "", sizes: "", colors: "", tags: "",
  featured: false, active: true,
};

export const ORDER_TRANSITIONS = {
  PENDING: ["PROCESSING", "SHIPPED", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const PRODUCT_CATEGORIES = [
  { _id: "footwear", name: "Footwear" },
  { _id: "clothes", name: "Clothes" },
];
export const categoryValue = (category) => {
  const name = (category?.slug || category?.name || "").toLowerCase();
  if (["footwear", "shoes"].includes(name)) return "footwear";
  if (["clothes", "clothing", "fashion"].includes(name)) return "clothes";
  return "";
};
export const PRODUCT_SIZES = {
  clothes: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free size"],
  footwear: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"],
};
