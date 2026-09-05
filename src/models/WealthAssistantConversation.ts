import mongoose, { Model, Schema, Types } from "mongoose";

export type WealthAssistantConversationDocument = {
  _id: Types.ObjectId;
  userId: string;
  title: string;
  status: "active" | "closed";
  saveStatus: "temporary" | "saved";
  createdAt: Date;
  updatedAt: Date;
};

const conversationSchema = new Schema<WealthAssistantConversationDocument>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    status: { type: String, enum: ["active", "closed"], default: "active", index: true },
    saveStatus: { type: String, enum: ["temporary", "saved"], default: "temporary", index: true },
  },
  { timestamps: true }
);

conversationSchema.index({ userId: 1, updatedAt: -1 });

const WealthAssistantConversation: Model<WealthAssistantConversationDocument> =
  mongoose.models.WealthAssistantConversation ||
  mongoose.model<WealthAssistantConversationDocument>(
    "WealthAssistantConversation",
    conversationSchema
  );

export default WealthAssistantConversation;