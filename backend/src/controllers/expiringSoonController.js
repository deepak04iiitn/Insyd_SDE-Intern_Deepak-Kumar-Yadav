import Stock from "../models/Stock.js";
import { errorHandler } from "../middlewares/errorHandler.js";


const buildQuery = (req, isExpired) => {

  const { search, companyName, quantityType, minPrice, maxPrice } = req.query;
  const query = {};

  if(search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
    ];
  }

  if(companyName) {
    query.companyName = { $regex: companyName, $options: "i" };
  }

  if(quantityType) {
    query.quantityType = quantityType;
  }

  if(minPrice || maxPrice) {
    query.price = {};

    if(minPrice) query.price.$gte = parseFloat(minPrice);
    if(maxPrice) query.price.$lte = parseFloat(maxPrice);

  }

  return query;

};


// Building sort query
const buildSort = (req) => {

  const { sortBy, sortOrder } = req.query;
  const sort = {};

  if(sortBy) {
    const validSortFields = [
      "name",
      "quantity",
      "companyName",
      "price",
      "expiryDate",
      "dateAdded",
      "dateExpired",
      "dateExpiringSoonNotified",
    ];

    if(validSortFields.includes(sortBy)) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sort.expiryDate = 1; 
    }
  } else {
    sort.expiryDate = 1; 
  }

  return sort;
};


// Getting all expiring soon items (within 3 months)
export const getExpiringSoon = async (req, res, next) => {

  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(now.getMonth() + 3);

    const query = buildQuery(req, false);
    query.expiryDate = {
      $exists: true,
      $ne: null,
      $gte: now, 
      $lte: threeMonthsFromNow, 
    };

    const sort = buildSort(req);

    const [stocks, total] = await Promise.all([
      Stock.find(query).sort(sort).skip(skip).limit(limit),
      Stock.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stocks,
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


// Getting all expired items
export const getExpired = async (req, res, next) => {

  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const now = new Date();

    const query = buildQuery(req, true);
    query.expiryDate = {
      $exists: true,
      $ne: null,
      $lt: now, 
    };

    const sort = buildSort(req);

    const [stocks, total] = await Promise.all([
      Stock.find(query).sort(sort).skip(skip).limit(limit),
      Stock.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stocks,
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

