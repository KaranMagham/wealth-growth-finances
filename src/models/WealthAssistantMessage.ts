import mongoose, { Model, Schema, Types } from "mongoose";

export type WealthAssistantMessageRole = "user" | "assistant";

export type WealthAssistantMessageDocument = {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  userId: string;
  role: WealthAssistantMessageRole;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

const messageSchema = new Schema<WealthAssistantMessageDocument>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "WealthAssistantConversation",
      required: true,
      index: true,
    },
    userId: { type: String, required: true, index: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true, trim: true, maxlength: 10000 },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, userId: 1 });

const WealthAssistantMessage: Model<WealthAssistantMessageDocument> =
  mongoose.models.WealthAssistantMessage ||
  mongoose.model<WealthAssistantMessageDocument>(
    "WealthAssistantMessage",
    messageSchema
  );

export default WealthAssistantMessage;