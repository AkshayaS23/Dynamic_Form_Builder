import mongoose from 'mongoose';

const fieldOptionSchema = new mongoose.Schema({
  option_text: {
    type: String,
    required: true,
  },
}, { _id: false });

const formFieldSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'email', 'phone', 'password', 'textarea', 'number', 'date', 'time', 'url', 'dropdown', 'radio', 'checkbox', 'rating', 'file'],
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
  options: [String], // Simplified - just array of strings
  sort_order: {
    type: Number,
    default: 0,
  },
}, { _id: false });

// Section Schema with repeatable option
const sectionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  // Allow this section to be repeated
  repeatable: {
    type: Boolean,
    default: false,
  },
  // Button text for adding new entries
  addButtonText: {
    type: String,
    default: '',
  },
  // Maximum number of entries allowed (0 = unlimited)
  maxEntries: {
    type: Number,
    default: 0,
  },
  fields: [formFieldSchema],
  sort_order: {
    type: Number,
    default: 0,
  },
}, { _id: false });

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
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
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
    sections: [sectionSchema],
  },
  {
    timestamps: true,
  }
);

// Add index for slug
formSchema.index({ slug: 1 });

const Form = mongoose.model('Form', formSchema);

export default Form;