import Fund from "../models/fund.model.js";

class FundController {
  async createFundRecord(req, res) {
    const { date, amount, type, detail } = req.body;

    const fundRecord = await Fund.create({
      date,
      amount,
      type,
      detail,
    });

    return res.status(201).json({
      success: true,
      message: "Fund created successfully",
      fundRecord,
    });
  }

  async getAllFundRecords(req, res) {
    const { type } = req.query;

    const fundRecords = await Fund.find({
      type: { $regex: new RegExp(type, "i") },
    }).sort({ date: -1 });

    return res.status(201).json({
      success: true,
      message: "Funds fetched successfully",
      fundRecords,
    });
  }

  async getFundRecordById(req, res) {
    const { id } = req.params;

    const fundRecord = await Fund.findById(id);

    return res.status(201).json({
      success: true,
      message: "Funds fetched successfully",
      fundRecord,
    });
  }

  async updateFundRecord(req, res) {
    const { id } = req.params;
    const { date, amount, type, detail } = req.body;

    const updatedFund = await Fund.findByIdAndUpdate(
      id,
      { date, amount, type, detail },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: "Fund update successfully",
      updatedFund,
    });
  }
}

export default new FundController();
