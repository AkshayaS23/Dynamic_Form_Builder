import mongoose from 'mongoose';

const responseValueSchema = new mongoose.Schema({
  field_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  field_label: {
    type: String,
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
});

const responseSchema = new mongoose.Schema(
  {
    form_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    form_name: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      default: 'anonymous',
    },
    values: [responseValueSchema],
    submitted_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Response = mongoose.model('Response', responseSchema);

export default Response;