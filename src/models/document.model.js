import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  status: { type: String, required: true },
  collectedBy: { type: String, required: true },
});

const Document = mongoose.model("Document", documentSchema);

export default Document;
