"use strict";

const salesSeed = [
  {
    date: "2026-11-01",
    notes: "Venda teste seedada #1",
    items: [
      ["TEST-FIL-001", 2],
      ["TEST-MOT-005", 4],
    ],
  },
  {
    date: "2026-11-03",
    notes: "Venda teste seedada #2",
    items: [
      ["TEST-FIL-001", 1],
      ["TEST-FRE-001", 1],
    ],
  },
  {
    date: "2026-11-05",
    notes: "Venda teste seedada #3",
    items: [
      ["TEST-SUS-001", 1],
      ["TEST-MOT-005", 2],
    ],
  },
  {
    date: "2026-11-07",
    notes: "Venda teste seedada #4",
    items: [["TEST-ELT-001", 1]],
  },
  {
    date: "2026-11-09",
    notes: "Venda teste seedada #5",
    items: [
      ["TEST-FIL-002", 2],
      ["TEST-FRE-003", 1],
    ],
  },
  {
    date: "2026-11-11",
    notes: "Venda teste seedada #6",
    items: [
      ["TEST-MOT-001", 1],
      ["TEST-SUS-003", 2],
    ],
  },
  {
    date: "2026-11-13",
    notes: "Venda teste seedada #7",
    items: [
      ["TEST-FIL-001", 3],
      ["TEST-ELT-003", 2],
    ],
  },
  {
    date: "2026-11-15",
    notes: "Venda teste seedada #8",
    items: [
      ["TEST-TRA-001", 1],
      ["TEST-MOT-005", 4],
    ],
  },
  {
    date: "2026-11-17",
    notes: "Venda teste seedada #9",
    items: [
      ["TEST-FRE-002", 2],
      ["TEST-FIL-003", 2],
    ],
  },
  {
    date: "2026-11-17",
    notes: "Venda teste seedada #10",
    items: [
      ["TEST-ELT-001", 1],
      ["TEST-ELT-004", 3],
    ],
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const now = new Date();

      const [users] = await queryInterface.sequelize.query(
        "SELECT id FROM users ORDER BY id ASC LIMIT 1",
        { transaction },
      );
      const userId = users.length > 0 ? users[0].id : null;

      await queryInterface.bulkDelete(
        "sales",
        { notes: { [Sequelize.Op.like]: "Venda teste seedada #%" } },
        { transaction },
      );

      const refs = [
        ...new Set(salesSeed.flatMap((sale) => sale.items.map(([ref]) => ref))),
      ];
      const [productRows] = await queryInterface.sequelize.query(
        "SELECT id, ref, sale_price FROM products WHERE ref IN (:refs)",
        { replacements: { refs }, transaction },
      );

      const productsByRef = new Map(
        productRows.map((product) => [product.ref, product]),
      );

      for (const seed of salesSeed) {
        let totalCents = 0;

        for (const [ref, quantity] of seed.items) {
          const product = productsByRef.get(ref);
          if (!product) {
            throw new Error(
              `Produto necessário para o seeder não encontrado: ${ref}`,
            );
          }
          totalCents += Math.round(Number(product.sale_price) * 100) * quantity;
        }

        await queryInterface.bulkInsert(
          "sales",
          [
            {
              total_amount: (totalCents / 100).toFixed(2),
              sale_date: seed.date,
              user_id: userId,
              notes: seed.notes,
              createdAt: now,
              updatedAt: now,
            },
          ],
          { transaction },
        );

        const [saleRows] = await queryInterface.sequelize.query(
          "SELECT id FROM sales WHERE notes = :notes LIMIT 1",
          { replacements: { notes: seed.notes }, transaction },
        );

        if (saleRows.length === 0) {
          throw new Error(
            `Não foi possível localizar a venda seedada: ${seed.notes}`,
          );
        }

        const saleId = saleRows[0].id;
        const saleItems = seed.items.map(([ref, quantity]) => {
          const product = productsByRef.get(ref);
          const unitPriceCents = Math.round(Number(product.sale_price) * 100);

          return {
            sale_id: saleId,
            product_id: product.id,
            quantity,
            unit_price: (unitPriceCents / 100).toFixed(2),
            subtotal: ((unitPriceCents * quantity) / 100).toFixed(2),
            createdAt: now,
            updatedAt: now,
          };
        });

        await queryInterface.bulkInsert("sale_items", saleItems, {
          transaction,
        });
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("sales", {
      notes: { [Sequelize.Op.like]: "Venda teste seedada #%" },
    });
  },
};
