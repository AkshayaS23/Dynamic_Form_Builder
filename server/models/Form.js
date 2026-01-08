import mongoose from 'mongoose';

const fieldOptionSchema = new mongoose.Schema({
  option_text: {
    type: String,
    required: true,
  },
});

const formFieldSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'email', 'phone','password', 'textarea', 'number', 'date', 'time', 'url', 'dropdown', 'radio', 'checkbox', 'rating', 'file'],
  },
  required: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
  helpText: {
    type: String,
    default: '',
  },
  options: [fieldOptionSchema],
  sort_order: {
    type: Number,
    default: 0,
  },
});

const formSchema = new mongoose.Schema(
  {
    form_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active',
    },
    fields: [formFieldSchema],
  },
  {
    timestamps: true,
  }
);

const Form = mongoose.model('Form', formSchema);

export default Form;