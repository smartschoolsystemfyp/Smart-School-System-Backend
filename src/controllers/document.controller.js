import Document from "../models/document.model.js";

class DocumentController {
  async createDocumentRecord(req, res) {
    const { name, classId, status, collectedBy } = req.body;

    const documentRecord = await Document.create({
      name,
      class: classId,
      status,
      collectedBy,
    });

    return res.status(201).json({
      success: true,
      message: "Document created successfully",
      documentRecord,
    });
  }

  async getAllDocumentRecords(req, res) {
    const { status } = req.query;

    const documentRecords = await Document.find({
      status: { $regex: new RegExp(status, "i") },
    }).populate("class", "className");

    return res.status(201).json({
      success: true,
      message: "Document fetched successfully",
      documentRecords,
    });
  }

  async getDocumentRecordById(req, res) {
    const { id } = req.params;

    const documentRecord = await Document.findById(id);

    return res.status(201).json({
      success: true,
      message: "Document fetched successfully",
      documentRecord,
    });
  }

  async updateDocumentRecord(req, res) {
    const { id } = req.params;
    const { name, classId, status, collectedBy } = req.body;

    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      { name, classId, status, collectedBy },
      { new: true }
    ).populate("class", "className");

    return res.status(201).json({
      success: true,
      message: "Document update successfully",
      updatedDocument,
    });
  }
}

export default new DocumentController();
