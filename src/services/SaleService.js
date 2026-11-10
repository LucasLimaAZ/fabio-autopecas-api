const { Product, Sale, User, sequelize } = require("../database/models");
const saleRepository = require("../repositories/SaleRepository");

class SaleService {
  async create({ items, sale_date, notes } = {}, userId) {
    this.validateItems(items);
    this.validateSaleDetails(sale_date, notes, userId);

    return await sequelize.transaction(async (transaction) => {
      const user = await User.findByPk(userId, {
        transaction,
      });
      if (!user) {
        const error = new Error("Authenticated user not found");
        error.name = "AuthenticatedUserError";
        throw error;
      }

      const calculated = await this.calculateSaleItems(items, transaction);

      const sale = await saleRepository.create(
        {
          total_amount: calculated.total,
          sale_date: sale_date || new Date().toISOString().slice(0, 10),
          user_id: user.id,
          notes: notes?.trim() || null,
        },
        { transaction },
      );

      await saleRepository.createItems(
        calculated.items.map((item) => ({ ...item, sale_id: sale.id })),
        { transaction },
      );

      return await saleRepository.findById(sale.id, { transaction });
    });
  }

  async findAll({ page = 1, limit = 10 } = {}) {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    this.validatePagination(parsedPage, parsedLimit);

    return await saleRepository.findAll({
      page: parsedPage,
      limit: parsedLimit,
    });
  }

  async findById(id) {
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      const error = new Error("Sale id must be a positive integer");
      error.name = "ValidationError";
      throw error;
    }

    const sale = await saleRepository.findById(Number(id));
    if (!sale) {
      const error = new Error("Sale not found");
      error.name = "NotFoundError";
      throw error;
    }

    return sale;
  }

  async update(id, { items } = {}) {
    this.validateItems(items);

    return await sequelize.transaction(async (transaction) => {
      const sale = await Sale.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
        include: [{ association: "items" }],
      });

      if (!sale) {
        const error = new Error("Sale not found");
        error.name = "NotFoundError";
        throw error;
      }

      for (const item of sale.items) {
        await Product.increment(
          { amount: item.quantity },
          { where: { id: item.product_id }, transaction },
        );
      }

      await saleRepository.deleteItems(sale.id, { transaction });
      const calculated = await this.calculateSaleItems(items, transaction);
      sale.total_amount = calculated.total;
      await sale.save({ transaction });
      await saleRepository.createItems(
        calculated.items.map((item) => ({ ...item, sale_id: sale.id })),
        { transaction },
      );

      return await saleRepository.findById(sale.id, { transaction });
    });
  }

  async delete(id) {
    return await sequelize.transaction(async (transaction) => {
      const sale = await Sale.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
        include: [{ association: "items" }],
      });

      if (!sale) {
        const error = new Error("Sale not found");
        error.name = "NotFoundError";
        throw error;
      }

      for (const item of sale.items) {
        await Product.increment(
          { amount: item.quantity },
          { where: { id: item.product_id }, transaction },
        );
      }

      await saleRepository.deleteItems(sale.id, { transaction });
      await saleRepository.delete(sale, { transaction });
    });
  }

  async calculateSaleItems(items, transaction) {
    const quantities = new Map();
    for (const item of items) {
      quantities.set(
        item.product_id,
        (quantities.get(item.product_id) || 0) + item.quantity,
      );
    }

    const saleItems = [];
    let totalInCents = 0;
    const now = new Date();

    for (const [productId, quantity] of [...quantities].sort(
      ([firstId], [secondId]) => firstId - secondId,
    )) {
      const product = await Product.findByPk(productId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        const error = new Error(`Product ${productId} not found`);
        error.name = "ValidationError";
        throw error;
      }
      if (product.amount < quantity) {
        const error = new Error(
          `Insufficient stock for product ${product.name}. Available: ${product.amount}; requested: ${quantity}`,
        );
        error.name = "InsufficientStockError";
        throw error;
      }
      if (product.sale_price === null) {
        const error = new Error(
          `Product ${product.name} does not have a sale price`,
        );
        error.name = "ValidationError";
        throw error;
      }

      const unitPriceInCents = Math.round(Number(product.sale_price) * 100);
      const subtotalInCents = unitPriceInCents * quantity;
      totalInCents += subtotalInCents;
      product.amount -= quantity;
      await product.save({ transaction });
      saleItems.push({
        product_id: product.id,
        quantity,
        unit_price: (unitPriceInCents / 100).toFixed(2),
        subtotal: (subtotalInCents / 100).toFixed(2),
        createdAt: now,
        updatedAt: now,
      });
    }

    return { items: saleItems, total: (totalInCents / 100).toFixed(2) };
  }

  validatePagination(page, limit) {
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      const error = new Error(
        "page must be a positive integer and limit must be between 1 and 100",
      );
      error.name = "ValidationError";
      throw error;
    }
  }

  validateItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
      const error = new Error("At least one sale item is required");
      error.name = "ValidationError";
      throw error;
    }

    for (const item of items) {
      if (
        !item ||
        !Number.isInteger(Number(item.product_id)) ||
        Number(item.product_id) < 1 ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1
      ) {
        const error = new Error(
          "Each item must have a valid product_id and a positive integer quantity",
        );
        error.name = "ValidationError";
        throw error;
      }

      item.product_id = Number(item.product_id);
      item.quantity = Number(item.quantity);
    }
  }

  validateSaleDetails(saleDate, notes, userId) {
    if (!Number.isInteger(Number(userId)) || Number(userId) < 1) {
      const error = new Error("Authenticated user is required");
      error.name = "AuthenticatedUserError";
      throw error;
    }

    if (
      saleDate !== undefined &&
      (typeof saleDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(saleDate) ||
        Number.isNaN(Date.parse(`${saleDate}T00:00:00Z`)) ||
        new Date(`${saleDate}T00:00:00Z`).toISOString().slice(0, 10) !==
          saleDate)
    ) {
      const error = new Error(
        "sale_date must be a valid date in YYYY-MM-DD format",
      );
      error.name = "ValidationError";
      throw error;
    }

    if (notes !== undefined && notes !== null && typeof notes !== "string") {
      const error = new Error("notes must be a string");
      error.name = "ValidationError";
      throw error;
    }
  }
}

module.exports = new SaleService();
