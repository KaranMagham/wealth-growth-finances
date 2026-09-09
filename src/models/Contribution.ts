import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type ContributionDocument = Document & {
  goalId: Types.ObjectId;
  userId: string;
  amount: number;
  note?: string;
  isHistorical: boolean;
  includedInGoalTotal: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const ContributionSchema = new Schema<ContributionDocument>(
  {
    goalId: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    isHistorical: {
      type: Boolean,
      required: true,
      default: false,
    },
    includedInGoalTotal: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

ContributionSchema.index({ userId: 1, goalId: 1, createdAt: -1 });
ContributionSchema.index({ goalId: 1, createdAt: -1 });

const Contribution: Model<ContributionDocument> =
  mongoose.models.Contribution ||
  mongoose.model<ContributionDocument>("Contribution", ContributionSchema);

export default Contribution;
