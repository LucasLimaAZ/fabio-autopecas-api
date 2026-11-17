const assert = require("assert");
const { Op } = require("sequelize");
const saleService = require("../src/services/SaleService");
const { Sale } = require("../src/database/models");

(async () => {
  assert.strictEqual(
    typeof saleService.getProductsSoldByDateRange,
    "function",
    "Service should expose getProductsSoldByDateRange",
  );
  assert.strictEqual(
    typeof saleService.getTopProductsByPeriod,
    "function",
    "Service should expose getTopProductsByPeriod",
  );
  assert.strictEqual(
    typeof saleService.getTotalRevenueByDateRange,
    "function",
    "Service should expose getTotalRevenueByDateRange",
  );

  const originalFindAll = Sale.findAll;
  Sale.findAll = async ({ where }) => {
    assert.deepStrictEqual(where.sale_date[Op.between], [
      "2026-11-01",
      "2026-11-30",
    ]);
    assert.strictEqual(where.sale_date["[Op.between]"], undefined);

    return [
      {
        id: 1,
        sale_date: "2026-11-05",
        total_amount: "150.00",
        items: [
          {
            product: {
              id: 10,
              name: "Filtro de Óleo",
              ref: "FLT-001",
              category_id: 2,
            },
            quantity: 2,
            subtotal: "79.80",
          },
          {
            product: { id: 11, name: "Vela", ref: "VEL-001", category_id: 1 },
            quantity: 3,
            subtotal: "70.20",
          },
        ],
      },
      {
        id: 2,
        sale_date: "2026-11-20",
        total_amount: "45.00",
        items: [
          {
            product: {
              id: 10,
              name: "Filtro de Óleo",
              ref: "FLT-001",
              category_id: 2,
            },
            quantity: 1,
            subtotal: "39.90",
          },
        ],
      },
    ];
  };

  try {
    const productsReport = await saleService.getProductsSoldByDateRange({
      startDate: "2026-11-01",
      endDate: "2026-11-30",
    });

    assert.strictEqual(productsReport.items.length, 2);
    assert.strictEqual(productsReport.items[0].product_name, "Filtro de Óleo");
    assert.strictEqual(productsReport.items[0].total_quantity, 3);
    assert.strictEqual(productsReport.items[0].total_amount, "119.70");
    assert.strictEqual(productsReport.items[1].product_name, "Vela");

    const revenueReport = await saleService.getTotalRevenueByDateRange({
      startDate: "2026-11-01",
      endDate: "2026-11-30",
    });

    assert.strictEqual(revenueReport.totalRevenue, "195.00");
    assert.strictEqual(revenueReport.totalSales, 2);

    const topProducts = await saleService.getTopProductsByPeriod({
      period: "month",
      year: 2026,
      month: 11,
      limit: 5,
    });

    assert.strictEqual(topProducts.period, "month");
    assert.strictEqual(topProducts.items[0].product_name, "Filtro de Óleo");
    assert.strictEqual(topProducts.items[0].total_quantity, 3);
  } finally {
    Sale.findAll = originalFindAll;
  }

  console.log(
    "OK: sales report service exposes report endpoints and consolidates the data correctly.",
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
