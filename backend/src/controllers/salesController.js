import Sales from "../models/Sales.js";
import Stock from "../models/Stock.js";
import { errorHandler } from "../middlewares/errorHandler.js";

// Building searching and filtering query
const buildQuery = (req) => {

  const { search, itemName, companyName, startDate, endDate, minQuantity, maxQuantity } = req.query;
  const query = {};

  if(search) {
    query.$or = [
      { itemName: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
    ];
  }

  if(itemName) {
    query.itemName = { $regex: itemName, $options: "i" };
  }

  if(companyName) {
    query.companyName = { $regex: companyName, $options: "i" };
  }

  if(startDate || endDate) {

    query.saleDate = {};
    if(startDate) {
      query.saleDate.$gte = new Date(startDate);
    }

    if(endDate) {
      query.saleDate.$lte = new Date(endDate);
    }
  }

  if(minQuantity || maxQuantity) {

    query.quantitySold = {};
    if(minQuantity) query.quantitySold.$gte = parseFloat(minQuantity);
    if(maxQuantity) query.quantitySold.$lte = parseFloat(maxQuantity);

  }

  return query;
};


// Building sorting query
const buildSort = (req) => {

  const { sortBy, sortOrder } = req.query;
  const sort = {};

  if(sortBy) {
    const validSortFields = [
      "itemName",
      "quantitySold",
      "companyName",
      "price",
      "saleDate",
    ];

    if(validSortFields.includes(sortBy)) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sort.saleDate = -1;
    }

  } else {
    sort.saleDate = -1;
  }

  return sort;
};


// Getting all sales 
export const getSales = async (req, res, next) => {

  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = buildQuery(req);
    const sort = buildSort(req);

    const [sales, total] = await Promise.all([
      Sales.find(query).sort(sort).skip(skip).limit(limit),
      Sales.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        sales,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      },
    });

  } catch (error) {
    next(error);
  }
};


// Getting sales analytics
export const getSalesAnalytics = async (req, res, next) => {

  try {

    const { itemName, companyName, months } = req.query;
    const monthsToAnalyze = parseInt(months) || 12;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsToAnalyze);

    const baseQuery = {
      saleDate: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if(itemName) {
      baseQuery.itemName = { $regex: itemName, $options: "i" };
    }

    if(companyName) {
      baseQuery.companyName = { $regex: companyName, $options: "i" };
    }

    const allSales = await Sales.find(baseQuery).sort({ saleDate: 1 });

    const salesByDate = {};
    allSales.forEach((sale) => {

      const dateKey = sale.saleDate.toISOString().split("T")[0];
      if(!salesByDate[dateKey]) {
        salesByDate[dateKey] = {
          date: dateKey,
          quantity: 0,
          revenue: 0,
          count: 0,
        };
      }

      salesByDate[dateKey].quantity += sale.quantitySold;
      salesByDate[dateKey].revenue += sale.quantitySold * sale.price;
      salesByDate[dateKey].count += 1;

    });

    const salesTrend = Object.values(salesByDate).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    
    const salesByItem = {};

    allSales.forEach((sale) => {
      const key = sale.itemName;

      if(!salesByItem[key]) {
        salesByItem[key] = {
          itemName: sale.itemName,
          companyName: sale.companyName,
          totalQuantity: 0,
          totalRevenue: 0,
          saleCount: 0,
          firstSaleDate: sale.saleDate,
          lastSaleDate: sale.saleDate,
        };
      }

      salesByItem[key].totalQuantity += sale.quantitySold;
      salesByItem[key].totalRevenue += sale.quantitySold * sale.price;
      salesByItem[key].saleCount += 1;

      if(sale.saleDate < salesByItem[key].firstSaleDate) {
        salesByItem[key].firstSaleDate = sale.saleDate;
      }

      if(sale.saleDate > salesByItem[key].lastSaleDate) {
        salesByItem[key].lastSaleDate = sale.saleDate;
      }

    });

    
    const salesByCompany = {};
    allSales.forEach((sale) => {
      const key = sale.companyName;

      if(!salesByCompany[key]) {
        salesByCompany[key] = {
          companyName: sale.companyName,
          totalQuantity: 0,
          totalRevenue: 0,
          saleCount: 0,
          uniqueItems: new Set(),
        };
      }

      salesByCompany[key].totalQuantity += sale.quantitySold;
      salesByCompany[key].totalRevenue += sale.quantitySold * sale.price;
      salesByCompany[key].saleCount += 1;
      salesByCompany[key].uniqueItems.add(sale.itemName);

    });

    
    Object.keys(salesByCompany).forEach((key) => {
      salesByCompany[key].uniqueItemsCount = salesByCompany[key].uniqueItems.size;
      delete salesByCompany[key].uniqueItems;
    });

    
    const itemNames = Object.keys(salesByItem);
    const currentStocks = await Stock.find({
      name: { $in: itemNames },
    });

    const stockMap = {};
    currentStocks.forEach((stock) => {

      if(!stockMap[stock.name]) {
        stockMap[stock.name] = [];
      }
      stockMap[stock.name].push(stock);

    });

    
    const itemAnalytics = Object.values(salesByItem).map((item) => {

      const daysDiff = (item.lastSaleDate - item.firstSaleDate) / (1000 * 60 * 60 * 24);
      const daysSinceFirstSale = (endDate - item.firstSaleDate) / (1000 * 60 * 60 * 24);
      const avgQuantityPerSale = item.totalQuantity / item.saleCount;
      const avgDaysBetweenSales = daysSinceFirstSale > 0 ? daysSinceFirstSale / item.saleCount : 0;
      const salesVelocity = daysSinceFirstSale > 0 ? item.totalQuantity / daysSinceFirstSale : 0;

      const stocks = stockMap[item.itemName] || [];
      const currentStock = stocks.find((s) => !s.isSoldOut) || stocks[0];
      const isOutOfStock = !currentStock || currentStock.isSoldOut;
      const currentQuantity = currentStock ? currentStock.quantity : 0;
      const dateOutOfStock = currentStock?.dateOutOfStock || null;

      let timeToOutOfStock = null;
      if(isOutOfStock && dateOutOfStock && item.firstSaleDate) {
        const daysToOutOfStock = (dateOutOfStock - item.firstSaleDate) / (1000 * 60 * 60 * 24);
        timeToOutOfStock = daysToOutOfStock;
      }

      return {
        ...item,
        avgQuantityPerSale,
        avgDaysBetweenSales,
        salesVelocity,
        isOutOfStock,
        currentQuantity,
        timeToOutOfStock,
        performanceScore:
          item.totalRevenue * 0.4 +
          item.totalQuantity * 0.2 +
          (1 / (avgDaysBetweenSales + 1)) * 1000 * 0.2 +
          salesVelocity * 0.2,
      };

    });

    itemAnalytics.sort((a, b) => b.performanceScore - a.performanceScore);

    const bestPerformingItems = itemAnalytics.slice(0, 10);

    const companyAnalytics = Object.values(salesByCompany).map((company) => {

      const companyItems = itemAnalytics.filter((item) => item.companyName === company.companyName);

      const avgPerformanceScore = companyItems.length > 0 ? companyItems.reduce((sum, item) => sum + item.performanceScore, 0) / companyItems.length : 0;

      return {
        ...company,
        avgPerformanceScore,
        itemCount: companyItems.length,
      };

    });

    companyAnalytics.sort((a, b) => b.avgPerformanceScore - a.avgPerformanceScore);

    const restockingSuggestions = itemAnalytics
      .filter((item) => {
        return (
          (item.isOutOfStock || item.currentQuantity < 10) &&
          item.performanceScore > 0
        );
      })
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 10)
      .map((item) => ({
        itemName: item.itemName,
        companyName: item.companyName,
        currentQuantity: item.currentQuantity,
        isOutOfStock: item.isOutOfStock,
        performanceScore: item.performanceScore,
        totalRevenue: item.totalRevenue,
        salesVelocity: item.salesVelocity,
        priority: item.isOutOfStock ? "High" : "Medium",
      }));

    const totalRevenue = allSales.reduce((sum, sale) => sum + sale.quantitySold * sale.price, 0);

    const totalQuantity = allSales.reduce((sum, sale) => sum + sale.quantitySold, 0);

    const totalSales = allSales.length;
    const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalQuantity,
          totalSales,
          avgSaleValue,
          dateRange: {
            startDate,
            endDate,
          },
        },
        salesTrend,
        itemAnalytics,
        companyAnalytics,
        bestPerformingItems,
        restockingSuggestions,
      },
    });

  } catch (error) {
    next(error);
  }
};

