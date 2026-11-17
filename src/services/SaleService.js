const {
  Product,
  Sale,
  User,
  SaleItem,
  sequelize,
} = require("../database/models");
const saleRepository = require("../repositories/SaleRepository");
const { Op } = require("sequelize");

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

  async getProductsSoldByDateRange({ startDate, endDate, page = 1 } = {}) {
    const { startDate: normalizedStart, endDate: normalizedEnd } =
      this.validateDateRange(startDate, endDate);

    const parsedPage = Number(page);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      const error = new Error("page must be a positive integer");
      error.name = "ValidationError";
      throw error;
    }

    const limit = 20;
    const sales = await Sale.findAll({
      where: {
        sale_date: {
          [Op.between]: [normalizedStart, normalizedEnd],
        },
      },
      attributes: ["id", "sale_date", "total_amount"],
      include: [
        {
          model: SaleItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
      order: [
        ["sale_date", "DESC"],
        ["id", "DESC"],
      ],
    });

    const soldItems = [];
    const orderedSales = [...sales].sort((first, second) => {
      const dateComparison = String(second.sale_date).localeCompare(
        String(first.sale_date),
      );
      return dateComparison || Number(second.id) - Number(first.id);
    });

    for (const sale of orderedSales) {
      for (const item of sale.items || []) {
        if (!item?.product) continue;

        soldItems.push({
          sale_id: Number(sale.id),
          sale_date: sale.sale_date,
          product_id: Number(item.product.id),
          product_name: item.product.name,
          ref: item.product.ref,
          category_id: item.product.category_id,
          quantity: Number(item.quantity || 0),
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        });
      }
    }

    const totalItems = soldItems.length;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (parsedPage - 1) * limit;

    if (parsedPage > 1 && offset >= totalItems && totalItems > 0) {
      const error = new Error("page exceeds the available results");
      error.name = "ValidationError";
      throw error;
    }

    return {
      startDate: normalizedStart,
      endDate: normalizedEnd,
      totalSales: sales.length,
      totalItems,
      page: parsedPage,
      limit,
      totalPages,
      items: soldItems.slice(offset, offset + limit),
    };
  }

  async getAggregatedProductsSoldByDateRange({ startDate, endDate } = {}) {
    const { startDate: normalizedStart, endDate: normalizedEnd } =
      this.validateDateRange(startDate, endDate);

    const sales = await Sale.findAll({
      where: {
        sale_date: {
          [Op.between]: [normalizedStart, normalizedEnd],
        },
      },
      attributes: ["id", "sale_date", "total_amount"],
      include: [
        {
          model: SaleItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    const productMap = new Map();

    for (const sale of sales) {
      for (const item of sale.items || []) {
        if (!item?.product) continue;

        const productId = Number(item.product.id);
        const entry =
          productMap.get(productId) ||
          (productMap.set(productId, {
            product_id: productId,
            product_name: item.product.name,
            ref: item.product.ref,
            category_id: item.product.category_id,
            total_quantity: 0,
            total_amount: 0,
          }),
          productMap.get(productId));

        entry.total_quantity += Number(item.quantity || 0);
        entry.total_amount += Number(item.subtotal || 0);
      }
    }

    const items = [...productMap.values()].map((item) => ({
      ...item,
      total_amount: Number(item.total_amount).toFixed(2),
      average_unit_price:
        item.total_quantity > 0
          ? (Number(item.total_amount) / item.total_quantity).toFixed(2)
          : "0.00",
    }));

    return {
      startDate: normalizedStart,
      endDate: normalizedEnd,
      totalSales: sales.length,
      totalProducts: items.length,
      items,
    };
  }

  async getTopProductsByPeriod({ limit = 10, startDate, endDate } = {}) {
    const requestedLimit = Number(limit);
    if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
      const error = new Error("limit must be a positive integer");
      error.name = "ValidationError";
      throw error;
    }

    const normalizedLimit = Math.min(requestedLimit, 10);
    const range = this.validateDateRange(startDate, endDate);
    const report = await this.getAggregatedProductsSoldByDateRange(range);
    const topProducts = [...report.items]
      .sort(
        (first, second) =>
          second.total_quantity - first.total_quantity ||
          Number(second.total_amount) - Number(first.total_amount),
      )
      .slice(0, normalizedLimit)
      .map((item, index) => ({
        rank: index + 1,
        ...item,
      }));

    return {
      startDate: range.startDate,
      endDate: range.endDate,
      limit: normalizedLimit,
      totalSales: report.totalSales,
      totalProducts: topProducts.length,
      items: topProducts,
    };
  }

  async getTotalRevenueByDateRange({ startDate, endDate } = {}) {
    const { startDate: normalizedStart, endDate: normalizedEnd } =
      this.validateDateRange(startDate, endDate);

    const sales = await Sale.findAll({
      where: {
        sale_date: {
          [Op.between]: [normalizedStart, normalizedEnd],
        },
      },
      attributes: ["total_amount"],
    });

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.total_amount || 0),
      0,
    );

    return {
      startDate: normalizedStart,
      endDate: normalizedEnd,
      totalSales: sales.length,
      totalRevenue: totalRevenue.toFixed(2),
    };
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
    const groupedItems = new Map();

    for (const item of items) {
      const normalizedUnitPrice =
        item.unit_price ?? item.price ?? item.value ?? item.valor;
      const key =
        normalizedUnitPrice !== undefined && normalizedUnitPrice !== null
          ? `${item.product_id}:${Number(normalizedUnitPrice).toFixed(2)}`
          : `${item.product_id}`;

      if (!groupedItems.has(key)) {
        groupedItems.set(key, {
          product_id: item.product_id,
          quantity: 0,
          unit_price:
            normalizedUnitPrice !== undefined && normalizedUnitPrice !== null
              ? Number(normalizedUnitPrice)
              : undefined,
        });
      }

      groupedItems.get(key).quantity += item.quantity;
    }

    const saleItems = [];
    let totalInCents = 0;
    const now = new Date();

    for (const groupedItem of [...groupedItems.values()].sort(
      (first, second) => first.product_id - second.product_id,
    )) {
      const product = await Product.findByPk(groupedItem.product_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        const error = new Error(`Product ${groupedItem.product_id} not found`);
        error.name = "ValidationError";
        throw error;
      }
      if (product.status === "archived") {
        const error = new Error(`Product ${product.name} is archived`);
        error.name = "ValidationError";
        throw error;
      }
      if (product.amount < groupedItem.quantity) {
        const error = new Error(
          `Insufficient stock for product ${product.name}. Available: ${product.amount}; requested: ${groupedItem.quantity}`,
        );
        error.name = "InsufficientStockError";
        throw error;
      }

      const effectiveUnitPrice =
        groupedItem.unit_price !== undefined
          ? groupedItem.unit_price
          : product.sale_price;

      if (effectiveUnitPrice === null || effectiveUnitPrice === undefined) {
        const error = new Error(
          `Product ${product.name} does not have a sale price`,
        );
        error.name = "ValidationError";
        throw error;
      }

      const normalizedUnitPrice = Number(effectiveUnitPrice);
      if (!Number.isFinite(normalizedUnitPrice) || normalizedUnitPrice < 0) {
        const error = new Error(
          `Invalid unit price for product ${product.name}`,
        );
        error.name = "ValidationError";
        throw error;
      }

      const unitPriceInCents = Math.round(normalizedUnitPrice * 100);
      const subtotalInCents = unitPriceInCents * groupedItem.quantity;
      totalInCents += subtotalInCents;
      product.amount -= groupedItem.quantity;
      await product.save({ transaction });
      saleItems.push({
        product_id: product.id,
        quantity: groupedItem.quantity,
        unit_price: (unitPriceInCents / 100).toFixed(2),
        subtotal: (subtotalInCents / 100).toFixed(2),
        createdAt: now,
        updatedAt: now,
      });
    }

    return { items: saleItems, total: (totalInCents / 100).toFixed(2) };
  }

  validateDateRange(startDate, endDate) {
    const normalizedStart = this.parseDateString(startDate, "startDate");
    const normalizedEnd = this.parseDateString(endDate, "endDate");

    if (normalizedStart > normalizedEnd) {
      const error = new Error(
        "startDate must be earlier than or equal to endDate",
      );
      error.name = "ValidationError";
      throw error;
    }

    return {
      startDate: normalizedStart,
      endDate: normalizedEnd,
    };
  }

  parseDateString(dateValue, fieldName) {
    if (
      typeof dateValue !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ) {
      const error = new Error(
        `${fieldName} must be a valid date in YYYY-MM-DD format`,
      );
      error.name = "ValidationError";
      throw error;
    }

    const timestamp = Date.parse(`${dateValue}T00:00:00Z`);
    if (Number.isNaN(timestamp)) {
      const error = new Error(
        `${fieldName} must be a valid date in YYYY-MM-DD format`,
      );
      error.name = "ValidationError";
      throw error;
    }

    const normalizedDate = new Date(timestamp).toISOString().slice(0, 10);
    if (normalizedDate !== dateValue) {
      const error = new Error(`${fieldName} must be a valid calendar date`);
      error.name = "ValidationError";
      throw error;
    }

    return normalizedDate;
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

      const unitPrice =
        item.unit_price ?? item.price ?? item.value ?? item.valor;
      if (unitPrice !== undefined && unitPrice !== null) {
        const numericUnitPrice = Number(unitPrice);

        if (
          (typeof unitPrice === "string" && unitPrice.trim() === "") ||
          !Number.isFinite(numericUnitPrice) ||
          numericUnitPrice < 0
        ) {
          const error = new Error(
            "If informed, the item price must be a non-negative number",
          );
          error.name = "ValidationError";
          throw error;
        }

        item.unit_price = numericUnitPrice;
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
