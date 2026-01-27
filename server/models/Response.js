import mongoose from 'mongoose';

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
    // Values structure:
    // For regular sections: { field_id: value }
    // For repeatable sections: { section_id: [{ field_id: value }, { field_id: value }] }
    values: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    submitted_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Response', responseSchema);