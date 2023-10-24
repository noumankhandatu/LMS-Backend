const { Schema, model } = require("mongoose");

const faqSchema = new Schema({
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
});

const categorySchema = new Schema({
  title: {
    type: String,
  },
});

const bannerImageSchema = new Schema({
  public_id: {
    type: String,
  },
  url: {
    type: String,
  },
});

const layoutSchema = new Schema({
  type: {
    type: String,
  },
  faq: [faqSchema],
  categories: [categorySchema],
  banner: {
    image: bannerImageSchema,
    title: {
      type: String,
    },
    subTitle: {
      type: String,
    },
  },
});

const LayoutModel = model("Layout", layoutSchema);
module.exports = LayoutModel;
