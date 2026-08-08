import mongoose, { Schema } from "mongoose";
import { TRANSACTION_TYPES } from "@/constants/transaction";

const TransactionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: TRANSACTION_TYPES,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    paymentMethod: {
      type: String,
      default: "Cash",
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);

export default Transaction;