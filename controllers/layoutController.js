const expressAsyncHandler = require("express-async-handler");
const { handleErrorResponse } = require("../middleware/errorHandler");
const LayoutModel = require("../models/layoutModel");
const cloudinary = require("cloudinary").v2;

// create layout
const createLayout = expressAsyncHandler(async (req, res) => {
  try {
    const { type } = req.body;
    const isTypeExists = await LayoutModel.findOne({ type });
    if (isTypeExists) {
      return res.status(400).send({ message: "This type already exists" });
    }
    if (type === "FAQ") {
      const { faq } = req.body;
      const faqItem = await Promise.all(
        faq.map(async (items) => {
          return {
            question: items.question,
            answer: items.answer,
          };
        })
      );
      if (!faq) {
        return res.status(400).send({ message: "Faq data missing" });
      }
      await LayoutModel.create({ type: "FAQ", faq: faqItem });
    }
    if (type === "CATEGORIES") {
      const { categories } = req.body;
      const categoriesItem = await Promise.all(
        categories.map(async (items) => {
          return {
            title: items.title,
          };
        })
      );
      if (!categories) {
        return res.status(400).send({ message: "categories data missing" });
      }
      await LayoutModel.create({ type: "CATEGORIES", categories: categoriesItem });
    }
    if (type === "BANNER") {
      const { image, title, subTitle } = req.body;
      if (!subTitle || !image || !title) {
        return res.status(400).send({ message: "Enter all fields" });
      }
      const myCloud = await cloudinary.uploader.upload(image, {
        folder: "layout",
      });
      const banner = {
        image: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
        title,
        subTitle,
      };
      await LayoutModel.create(banner);
    }

    return res.status(200).send({ message: "Layout create successfully" });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

// edit layout
const editLayout = expressAsyncHandler(async (req, res) => {
  try {
    const { type } = req.body;
    if (type === "FAQ") {
      const { faq } = req.body;
      const FaqItem = await LayoutModel.findOne({ type: "FAQ" });

      const faqItem = await Promise.all(
        faq.map(async (items) => {
          return {
            question: items.question,
            answer: items.answer,
          };
        })
      );
      if (!faq) {
        return res.status(400).send({ message: "Faq data missing" });
      }
      await LayoutModel.findByIdAndUpdate(FaqItem?._id, { type: "FAQ", faq: faqItem });
    }
    if (type === "CATEGORIES") {
      const { categories } = req.body;
      const CategoriesItem = await LayoutModel.findOne({ type: "CATEGORIES" });

      const categoriesItem = await Promise.all(
        categories.map(async (items) => {
          return {
            title: items.title,
          };
        })
      );
      if (!categories) {
        return res.status(400).send({ message: "categories data missing" });
      }
      await LayoutModel.findByIdAndUpdate(CategoriesItem?._id, {
        type: "CATEGORIES",
        categories: categoriesItem,
      });
    }
    if (type === "BANNER") {
      const { image, title, subTitle } = req.body;
      const bannerData = await LayoutModel.findOne({ type: "Banner" });
      if (!subTitle || !image || !title) {
        return res.status(400).send({ message: "Enter all fields" });
      }
      await cloudinary.destory(bannerData?.image?.public_id);
      const myCloud = await cloudinary.uploader.upload(image, {
        folder: "layout",
      });
      const banner = {
        image: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
        title,
        subTitle,
      };
      await LayoutModel.findByIdAndUpdate(bannerData.id, { banner });
    }
    return res.status(200).send({ message: "Layout updated successfully" });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

// get layout by type

const getLayoutByType = expressAsyncHandler(async (req, res) => {
  try {
    const { type } = req.body;
    const layout = await LayoutModel.findOne({ type });
    res.status(200).send({ message: "sucess", layout });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});
module.exports = { createLayout, editLayout, getLayoutByType };
