export const EMPTY_PRODUCT = {
  name: "", sku: "", description: "", price: "", originalPrice: "", stock: "",
  category: "", brand: "", images: "", sizes: "", colors: "", tags: "",
  featured: false, active: true,
};

export const ORDER_TRANSITIONS = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
