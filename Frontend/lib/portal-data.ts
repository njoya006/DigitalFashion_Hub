export const customerOverview = {
  name: "Alicia Moreau",
  tier: "Premium",
  loyaltyPoints: 1240,
  lifetimeValue: "$4,380",
  preferredCurrency: "USD",
}

export const customerRecentOrders = [
  { id: "DFH-2026-1132", date: "2026-04-10", status: "Shipped", total: "$289.00", items: 2 },
  { id: "DFH-2026-1087", date: "2026-04-03", status: "Delivered", total: "$420.00", items: 1 },
  { id: "DFH-2026-1019", date: "2026-03-27", status: "Delivered", total: "$195.00", items: 1 },
]

export const customerTierBenefits = [
  "Priority customer support",
  "Early access to curated drops",
  "10% loyalty discount on selected items",
  "Faster returns processing",
]

export const sellerOverview = {
  storeName: "Atelier Noir",
  rating: "4.8",
  pendingOrders: 18,
  monthlyRevenue: "$18,470",
  activeProducts: 124,
}

export const sellerOrders = [
  { id: "ORD-8821", customer: "Nadia Karim", status: "Processing", amount: "$680.00", date: "2026-04-12" },
  { id: "ORD-8794", customer: "Theo Bernard", status: "Shipped", amount: "$240.00", date: "2026-04-11" },
  { id: "ORD-8752", customer: "Musa Nkem", status: "Delivered", amount: "$195.00", date: "2026-04-09" },
]

export const sellerProducts = [
  { sku: "ATN-BAG-01", name: "Structured Tote Bag", stock: 22, price: "$680.00", status: "Active" },
  { sku: "ATN-CLT-22", name: "Leather Clutch", stock: 8, price: "$320.00", status: "Low stock" },
  { sku: "ATN-SCF-07", name: "Silk Signature Scarf", stock: 35, price: "$110.00", status: "Active" },
]
