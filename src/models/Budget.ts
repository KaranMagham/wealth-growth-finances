import mongoose, { Schema } from "mongoose";
import { EXPENSE_CATEGORIES } from "@/constants/transaction";

const BudgetSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: EXPENSE_CATEGORIES,
      required: true,
    },
    limit: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2020,
    },
  },
  {
    timestamps: true,
  }
);

BudgetSchema.index(
  {
    userId: 1,
    category: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

const Budget =
  mongoose.models.Budget ||
  mongoose.model("Budget", BudgetSchema);

export default Budget;