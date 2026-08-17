import mongoose, { Document, Model, Schema } from "mongoose";

export interface IInvestmentTransaction extends Document {
  userId: string;
  investmentId: mongoose.Types.ObjectId;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  amount: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentTransactionSchema =
  new Schema<IInvestmentTransaction>(
    {
      userId: {
        type: String,
        required: true,
        index: true,
      },
      investmentId: {
        type: Schema.Types.ObjectId,
        ref: "Investment",
        required: true,
        index: true,
      },
      type: {
        type: String,
        enum: ["BUY", "SELL"],
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 0.000001,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      date: {
        type: Date,
        required: true,
      },
      notes: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
    },
    { timestamps: true }
  );

InvestmentTransactionSchema.index({
  userId: 1,
  investmentId: 1,
  date: -1,
});

const InvestmentTransaction: Model<IInvestmentTransaction> =
  mongoose.models.InvestmentTransaction ||
  mongoose.model<IInvestmentTransaction>(
    "InvestmentTransaction",
    InvestmentTransactionSchema
  );

export default InvestmentTransaction;