import mongoose, { Document, Model, Schema } from "mongoose";

export const INVESTMENT_TYPES = [
    "Stocks",
    "Mutual Funds",
    "ETF",
    "Bonds",
    "Fixed Deposit",
    "Crypto",
    "Gold",
    "Other",
] as const;

export type InvestmentType =
    (typeof INVESTMENT_TYPES)[number];

export interface IInvestment extends Document {
    userId: string;
    name: string;
    type: InvestmentType;
    symbol?: string;
    quantity: number;
    averageBuyPrice: number;
    totalInvested: number;
    currentPrice: number;
    currentValue: number;
    profitLoss: number;
    returnPercentage: number;
    purchaseDate: Date;
    notes?: string;
    goldPurity?: "18K" | "22K" | "24K";
    schemeCode?: string;
    priceSource: "MANUAL" | "MARKET_API";
    priceUpdatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const InvestmentSchema = new Schema<IInvestment>(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        type: {
            type: String,
            required: true,
            enum: INVESTMENT_TYPES,
        },

        symbol: {
            type: String,
            trim: true,
            uppercase: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 0,
        },

        averageBuyPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        totalInvested: {
            type: Number,
            required: true,
            min: 0,
        },

        currentPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        goldPurity: {
            type: String,
            enum: ["18K", "22K", "24K"],
        },

        schemeCode: {
            type: String,
            trim: true,
        },

        priceSource: {
            type: String,
            enum: ["MANUAL", "MARKET_API"],
            default: "MANUAL",
        },

        priceUpdatedAt: {
            type: Date,
        },

        currentValue: {
            type: Number,
            required: true,
            min: 0,
        },

        profitLoss: {
            type: Number,
            required: true,
        },

        returnPercentage: {
            type: Number,
            required: true,
        },

        purchaseDate: {
            type: Date,
            required: true,
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
    },
    {
        timestamps: true,
    }
);

InvestmentSchema.index({
    userId: 1,
    createdAt: -1,
});

const Investment: Model<IInvestment> =
    mongoose.models.Investment ||
    mongoose.model<IInvestment>(
        "Investment",
        InvestmentSchema
    );

export default Investment;