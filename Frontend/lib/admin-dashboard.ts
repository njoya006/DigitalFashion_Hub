export const adminStats = [
  { label: "Revenue This Month", value: "$128.4K", delta: "+18.2%" },
  { label: "Active Orders", value: "1,284", delta: "+6.4%" },
  { label: "Products Listed", value: "8,642", delta: "+12.1%" },
  { label: "Low Stock SKUs", value: "37", delta: "-4.0%" },
] as const

export const adminHighlights = [
  {
    title: "New Seller Requests",
    value: "14",
    description: "Pending store approvals for luxury and boutique merchants.",
  },
  {
    title: "Customer Growth",
    value: "+9.8%",
    description: "New account registrations are trending upward this week.",
  },
  {
    title: "Stock Alerts",
    value: "6 warehouses",
    description: "Reorder alerts triggered across regional fulfillment hubs.",
  },
] as const

export const adminRevenueBreakdown = [
  { label: "USD", value: "$58.4K", share: "45%" },
  { label: "EUR", value: "€29.1K", share: "23%" },
  { label: "GBP", value: "£18.7K", share: "15%" },
  { label: "XAF", value: "XAF 21.2M", share: "17%" },
] as const

export const lowStockInventory = [
  { sku: "DFH-COAT-214", product: "Oversize Wool Coat", warehouse: "Paris Hub", stock: 4, threshold: 12 },
  { sku: "DFH-BAG-098", product: "Structured Tote Bag", warehouse: "Douala Hub", stock: 2, threshold: 10 },
  { sku: "DFH-SNK-401", product: "Heritage Sneakers", warehouse: "Nairobi Hub", stock: 6, threshold: 15 },
  { sku: "DFH-DRS-130", product: "Silk Evening Dress", warehouse: "Dubai Hub", stock: 3, threshold: 8 },
] as const

export const pendingUsers = [
  { name: "Alicia Moreau", email: "alicia@atelier.com", role: "SELLER", status: "Pending approval" },
  { name: "Musa Nkem", email: "musa@stylehub.co", role: "CUSTOMER", status: "Verified" },
  { name: "Nadia Karim", email: "nadia@luxhouse.io", role: "SELLER", status: "Pending documents" },
  { name: "Theo Bernard", email: "theo@fashionpro.fr", role: "CUSTOMER", status: "Verified" },
] as const

export const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/users", label: "Users" },
] as const
