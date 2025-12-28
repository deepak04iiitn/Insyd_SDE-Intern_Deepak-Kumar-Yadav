import mongoose from "mongoose";

const salesSchema = new mongoose.Schema(
  {
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: [true, "Stock ID is required"],
    },
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    quantitySold: {
      type: Number,
      required: [true, "Quantity sold is required"],
      min: [0, "Quantity sold cannot be negative"],
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
salesSchema.index({ stockId: 1 });
salesSchema.index({ saleDate: -1 });
salesSchema.index({ itemName: 1 });
salesSchema.index({ companyName: 1 });

export default mongoose.model("Sales", salesSchema);

