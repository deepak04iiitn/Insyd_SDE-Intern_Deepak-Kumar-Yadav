import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    quantityType: {
      type: String,
      required: [true, "Quantity type is required"],
      enum: ["numbers", "kg", "liters", "boxes", "pieces", "units"],
      default: "numbers",
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    expiryDate: {
      type: Date,
      required: false,
    },
    dateAdded: {
      type: Date,
      default: Date.now,
    },
    isSoldOut: {
      type: Boolean,
      default: false,
    },
    dateOutOfStock: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


stockSchema.index({ name: 1 });
stockSchema.index({ companyName: 1 });
stockSchema.index({ isSoldOut: 1 });
stockSchema.index({ expiryDate: 1 });

export default mongoose.model("Stock", stockSchema);

