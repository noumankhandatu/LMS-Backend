const asyncHandler = require("express-async-handler");
const { handleErrorResponse } = require("../middleware/errorHandler");

const generateLast12MonthData = asyncHandler(async (myModel, req, res) => {
  try {
    const last12Months = [];
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);

    for (let i = 11; i >= 0; i--) {
      const endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - i * 28
      );
      const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 28);

      const monthYear = endDate.toLocaleString("default", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const count = await myModel.countDocuments({
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });
      last12Months.push({ month: monthYear, count });
    }

    return last12Months;
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

module.exports = { generateLast12MonthData };
