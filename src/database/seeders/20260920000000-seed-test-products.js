"use strict";

const categories = [
  "Motor",
  "Freios",
  "Suspensão",
  "Elétrica",
  "Filtros",
  "Transmissão",
];

const products = [
  [
    "Filtro de óleo Tecfil PSL55",
    "TEST-FIL-001",
    "Filtro de óleo para motores de passeio.",
    18.5,
    32.9,
    42,
    10,
    "Filtros",
  ],
  [
    "Filtro de ar Fram CA-9012",
    "TEST-FIL-002",
    "Filtro de ar para veículos compactos.",
    24.9,
    44.9,
    31,
    8,
    "Filtros",
  ],
  [
    "Filtro de combustível Mann WK-58",
    "TEST-FIL-003",
    "Filtro de combustível com alta retenção de impurezas.",
    29.9,
    54.9,
    18,
    5,
    "Filtros",
  ],
  [
    "Pastilha de freio dianteira Cobreq",
    "TEST-FRE-001",
    "Jogo de pastilhas dianteiras para uso urbano.",
    72,
    129.9,
    25,
    6,
    "Freios",
  ],
  [
    "Pastilha de freio traseira Bosch",
    "TEST-FRE-002",
    "Jogo de pastilhas traseiras.",
    68,
    119.9,
    16,
    5,
    "Freios",
  ],
  [
    "Disco de freio dianteiro Fremax",
    "TEST-FRE-003",
    "Disco ventilado para eixo dianteiro.",
    145,
    239.9,
    12,
    4,
    "Freios",
  ],
  [
    "Cilindro de roda traseiro Controil",
    "TEST-FRE-004",
    "Cilindro hidráulico de roda traseiro.",
    41,
    79.9,
    9,
    3,
    "Freios",
  ],
  [
    "Amortecedor dianteiro Cofap",
    "TEST-SUS-001",
    "Amortecedor pressurizado dianteiro.",
    189,
    319.9,
    14,
    4,
    "Suspensão",
  ],
  [
    "Amortecedor traseiro Nakata",
    "TEST-SUS-002",
    "Amortecedor traseiro para veículos leves.",
    132,
    229.9,
    11,
    3,
    "Suspensão",
  ],
  [
    "Kit de batente do amortecedor",
    "TEST-SUS-003",
    "Kit com batente e coifa para amortecedor.",
    36,
    69.9,
    22,
    6,
    "Suspensão",
  ],
  [
    "Bieleta da barra estabilizadora",
    "TEST-SUS-004",
    "Bieleta dianteira da barra estabilizadora.",
    28,
    54.9,
    27,
    8,
    "Suspensão",
  ],
  [
    "Terminal de direção direito",
    "TEST-SUS-005",
    "Terminal externo de direção lado direito.",
    44,
    84.9,
    13,
    4,
    "Suspensão",
  ],
  [
    "Correia dentada Gates",
    "TEST-MOT-001",
    "Correia de sincronismo do motor.",
    86,
    149.9,
    19,
    5,
    "Motor",
  ],
  [
    "Tensor da correia dentada",
    "TEST-MOT-002",
    "Tensor para sistema de distribuição.",
    115,
    199.9,
    8,
    3,
    "Motor",
  ],
  [
    "Junta da tampa de válvulas",
    "TEST-MOT-003",
    "Junta de vedação da tampa de válvulas.",
    38,
    74.9,
    17,
    5,
    "Motor",
  ],
  [
    "Bomba d'água SKF",
    "TEST-MOT-004",
    "Bomba d'água com rotor reforçado.",
    154,
    269.9,
    7,
    3,
    "Motor",
  ],
  [
    "Vela de ignição NGK",
    "TEST-MOT-005",
    "Vela de ignição para motor flex.",
    12,
    24.9,
    64,
    16,
    "Motor",
  ],
  [
    "Cabo de vela Magneti Marelli",
    "TEST-MOT-006",
    "Jogo de cabos de ignição.",
    58,
    104.9,
    10,
    3,
    "Motor",
  ],
  [
    "Bateria 60Ah Moura",
    "TEST-ELT-001",
    "Bateria automotiva de 60 amperes-hora.",
    389,
    599.9,
    6,
    2,
    "Elétrica",
  ],
  [
    "Alternador remanufaturado Bosch",
    "TEST-ELT-002",
    "Alternador remanufaturado para veículos leves.",
    620,
    899.9,
    4,
    1,
    "Elétrica",
  ],
  [
    "Lâmpada H7 Philips",
    "TEST-ELT-003",
    "Lâmpada halógena H7 para farol.",
    21,
    39.9,
    35,
    10,
    "Elétrica",
  ],
  [
    "Relé auxiliar 12V",
    "TEST-ELT-004",
    "Relé automotivo auxiliar de 12 volts.",
    9.5,
    19.9,
    29,
    8,
    "Elétrica",
  ],
  [
    "Kit de embreagem Luk",
    "TEST-TRA-001",
    "Kit com platô, disco e rolamento.",
    475,
    749.9,
    5,
    2,
    "Transmissão",
  ],
  [
    "Cabo de embreagem",
    "TEST-TRA-002",
    "Cabo de acionamento da embreagem.",
    32,
    64.9,
    15,
    4,
    "Transmissão",
  ],
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const [existingCategories] = await queryInterface.sequelize.query(
        "SELECT id, name FROM categories WHERE name IN (:names)",
        { replacements: { names: categories }, transaction },
      );

      const existingCategoryNames = new Set(
        existingCategories.map((category) => category.name),
      );
      const missingCategories = categories
        .filter((name) => !existingCategoryNames.has(name))
        .map((name) => ({
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

      if (missingCategories.length > 0) {
        await queryInterface.bulkInsert("categories", missingCategories, {
          transaction,
        });
      }

      const [categoryRows] = await queryInterface.sequelize.query(
        "SELECT id, name FROM categories WHERE name IN (:names)",
        { replacements: { names: categories }, transaction },
      );
      const categoryIds = new Map(
        categoryRows.map((category) => [category.name, category.id]),
      );

      const refs = products.map((product) => product[1]);
      const [existingProducts] = await queryInterface.sequelize.query(
        "SELECT ref FROM products WHERE ref IN (:refs)",
        { replacements: { refs }, transaction },
      );
      const existingRefs = new Set(
        existingProducts.map((product) => product.ref),
      );
      const now = new Date();
      const productsToInsert = products
        .filter((product) => !existingRefs.has(product[1]))
        .map(
          ([
            name,
            ref,
            notes,
            cost_price,
            sale_price,
            amount,
            minimum_amount,
            category,
          ]) => ({
            name,
            ref,
            notes,
            cost_price,
            sale_price,
            amount,
            minimum_amount,
            category_id: categoryIds.get(category),
            createdAt: now,
            updatedAt: now,
          }),
        );

      if (productsToInsert.length > 0) {
        await queryInterface.bulkInsert("products", productsToInsert, {
          transaction,
        });
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("products", {
      ref: {
        [Sequelize.Op.in]: products.map((product) => product[1]),
      },
    });
  },
};
