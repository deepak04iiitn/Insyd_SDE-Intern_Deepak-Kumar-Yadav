import Stock from "../models/Stock.js";
import Sales from "../models/Sales.js";
import { errorHandler } from "../middlewares/errorHandler.js";


// Building search and filter query
const buildQuery = (req, isSoldOut) => {

  const { search, companyName, quantityType, minPrice, maxPrice } = req.query;
  const query = { isSoldOut };

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
      "dateOutOfStock",
    ];

    if(validSortFields.includes(sortBy)) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sort.createdAt = -1; 
    }

  } else {
    sort.createdAt = -1; 
  }

  return sort;
};


// Getting all available stock items
export const getAvailableStock = async (req, res, next) => {

  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = buildQuery(req, false);
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


// Getting all out of stock items 
export const getOutOfStock = async (req, res, next) => {

  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = buildQuery(req, true);
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


// Adding new stock item
export const addStock = async (req, res, next) => {

  try {

    const { name, quantity, quantityType, companyName, price, expiryDate } = req.body;

    if(!name || name.trim() === "" || 
       quantity === undefined || quantity === null || 
       !quantityType || quantityType.trim() === "" || 
       !companyName || companyName.trim() === "" || 
       price === undefined || price === null) {
      return next(
        errorHandler(400, "Please provide all required fields (name, quantity, quantityType, companyName, price)")
      );
    }

    if(quantity < 0) {
      return next(errorHandler(400, "Quantity cannot be negative"));
    }

    if(price < 0) {
      return next(errorHandler(400, "Price cannot be negative"));
    }

    const stock = await Stock.create({
      name,
      quantity,
      quantityType,
      companyName,
      price,
      expiryDate: expiryDate || undefined,
      dateAdded: new Date(),
      isSoldOut: quantity === 0,
      dateOutOfStock: quantity === 0 ? new Date() : null,
    });

    res.status(201).json({
      success: true,
      message: "Stock item added successfully",
      data: {
        stock,
      },
    });

  } catch (error) {
    next(error);
  }
};


// Updating stock item 
export const updateStock = async (req, res, next) => {

  try {

    const { id } = req.params;
    const { name, quantity, quantityType, companyName, price, expiryDate, isSoldOut } = req.body;

    const stock = await Stock.findById(id);

    if(!stock) {
      return next(errorHandler(404, "Stock item not found"));
    }

    const oldQuantity = stock.quantity;
    const newQuantity = quantity !== undefined ? quantity : oldQuantity;
    const quantityDecreased = newQuantity < oldQuantity;
    const quantityDecrease = oldQuantity - newQuantity;

    let quantityToRecordForSale = 0;
    if(isSoldOut !== undefined && isSoldOut) {
      quantityToRecordForSale = stock.quantity;
    }

    if(name !== undefined) stock.name = name;
    if(quantity !== undefined) stock.quantity = newQuantity;
    if(quantityType !== undefined) stock.quantityType = quantityType;
    if(companyName !== undefined) stock.companyName = companyName;
    if(price !== undefined) stock.price = price;
    if(expiryDate !== undefined) stock.expiryDate = expiryDate;

    if(isSoldOut !== undefined) {

      stock.isSoldOut = isSoldOut;
      
      if(isSoldOut) {
        stock.quantity = 0;

        if(quantityToRecordForSale > 0) {
          await Sales.create({
            stockId: stock._id,
            itemName: stock.name,
            quantitySold: quantityToRecordForSale,
            saleDate: new Date(),
            companyName: stock.companyName,
            price: stock.price,
          });
        }
        
        if(!stock.dateOutOfStock) {
          stock.dateOutOfStock = new Date();
        }

      } else {
        stock.dateOutOfStock = null;
      }

    } else {
      if(newQuantity === 0 && !stock.isSoldOut) {
        stock.isSoldOut = true;
        stock.dateOutOfStock = new Date();
      } else if (newQuantity > 0 && stock.isSoldOut) {
        stock.isSoldOut = false;
        stock.dateOutOfStock = null;
      }
    }

    await stock.save();

    if(quantityDecreased && quantityDecrease > 0 && isSoldOut === undefined) {
      await Sales.create({
        stockId: stock._id,
        itemName: stock.name,
        quantitySold: quantityDecrease,
        saleDate: new Date(),
        companyName: stock.companyName,
        price: stock.price,
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock item updated successfully",
      data: {
        stock,
      },
    });

  } catch (error) {
    next(error);
  }
};


// Deleting stock item
export const deleteStock = async (req, res, next) => {

  try {

    const { id } = req.params;

    const stock = await Stock.findById(id);

    if(!stock) {
      return next(errorHandler(404, "Stock item not found"));
    }

    await Stock.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Stock item deleted successfully",
    });

  } catch (error) {
    next(error);
  }
};


// Getting single stock item
export const getStockById = async (req, res, next) => {

  try {

    const { id } = req.params;

    const stock = await Stock.findById(id);

    if(!stock) {
      return next(errorHandler(404, "Stock item not found"));
    }

    res.status(200).json({
      success: true,
      data: {
        stock,
      },
    });

  } catch (error) {
    next(error);
  }
};

