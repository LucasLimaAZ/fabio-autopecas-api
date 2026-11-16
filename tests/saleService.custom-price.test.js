const assert = require("assert");
const saleService = require("../src/services/SaleService");
const { Product } = require("../src/database/models");

(async () => {
  const productWithCustomPrice = {
    id: 10,
    name: "Filtro de Óleo",
    sale_price: 39.9,
    amount: 5,
    async save() {
      return this;
    },
  };

  Product.findByPk = async () => productWithCustomPrice;

  saleService.validateItems([
    { product_id: "10", quantity: 2, unit_price: "29.90" },
  ]);

  const customResult = await saleService.calculateSaleItems(
    [{ product_id: 10, quantity: 2, unit_price: 29.9 }],
    { LOCK: { UPDATE: "UPDATE" } },
  );

  assert.strictEqual(customResult.total, "59.80");
  assert.strictEqual(customResult.items[0].unit_price, "29.90");
  assert.strictEqual(customResult.items[0].subtotal, "59.80");
  assert.strictEqual(productWithCustomPrice.amount, 3);

  const productWithDefaultPrice = {
    id: 11,
    name: "Vela",
    sale_price: 18.5,
    amount: 4,
    async save() {
      return this;
    },
  };

  Product.findByPk = async () => productWithDefaultPrice;

  const defaultResult = await saleService.calculateSaleItems(
    [{ product_id: 11, quantity: 2 }],
    { LOCK: { UPDATE: "UPDATE" } },
  );

  assert.strictEqual(defaultResult.total, "37.00");
  assert.strictEqual(defaultResult.items[0].unit_price, "18.50");
  assert.strictEqual(defaultResult.items[0].subtotal, "37.00");
  assert.strictEqual(productWithDefaultPrice.amount, 2);

  console.log(
    "OK: sale item price override works and default product price remains unchanged.",
  );
})();
