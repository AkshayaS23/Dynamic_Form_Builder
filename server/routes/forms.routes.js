import express from 'express';
import Form from '../models/Form.js';
import Response from '../models/Response.js';

const router = express.Router();

// Get all forms
router.get('/', async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single form
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new form
router.post('/', async (req, res) => {
  try {
    const { form_name, description, category, status, fields } = req.body;

    const form = new Form({
      form_name,
      description,
      category,
      status,
      fields: fields.map((field, index) => ({
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder,
        helpText: field.helpText,
        options: field.options
          ? field.options.map(opt => ({ option_text: opt }))
          : [],
        sort_order: index,
      })),
    });

    const savedForm = await form.save();
    res.status(201).json({
      id: savedForm._id,
      message: 'Form created successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update form
router.put('/:id', async (req, res) => {
  try {
    const { form_name, description, category, status, fields } = req.body;

    const updatedForm = await Form.findByIdAndUpdate(
      req.params.id,
      {
        form_name,
        description,
        category,
        status,
        fields: fields.map((field, index) => ({
          label: field.label,
          type: field.type,
          required: field.required,
          placeholder: field.placeholder,
          helpText: field.helpText,
          options: field.options
            ? field.options.map(opt => ({ option_text: opt }))
            : [],
          sort_order: index,
        })),
      },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json({ message: 'Form updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete form + its responses
router.delete('/:id', async (req, res) => {
  try {
    const deletedForm = await Form.findByIdAndDelete(req.params.id);
    if (!deletedForm) {
      return res.status(404).json({ error: 'Form not found' });
    }

    await Response.deleteMany({ form_id: req.params.id });

    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Duplicate form
router.post('/:id/duplicate', async (req, res) => {
  try {
    const originalForm = await Form.findById(req.params.id);
    if (!originalForm) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const duplicatedForm = new Form({
      form_name: `${originalForm.form_name} (Copy)`,
      description: originalForm.description,
      category: originalForm.category,
      status: originalForm.status,
      fields: originalForm.fields,
    });

    const savedForm = await duplicatedForm.save();

    res.status(201).json({
      id: savedForm._id,
      message: 'Form duplicated successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit form response
router.post('/:id/submit', async (req, res) => {
  try {
    const { values } = req.body;
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const formattedValues = Object.entries(values).map(([fieldId, value]) => {
      const field = form.fields.id(fieldId);
      return {
        field_id: fieldId,
        field_label: field ? field.label : 'Unknown',
        value,
      };
    });

    const response = new Response({
      form_id: req.params.id,
      form_name: form.form_name,
      values: formattedValues,
    });

    const savedResponse = await response.save();

    res.status(201).json({
      id: savedResponse._id,
      message: 'Response submitted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get responses for a form
router.get('/:id/responses', async (req, res) => {
  try {
    const responses = await Response.find({ form_id: req.params.id })
      .sort({ submitted_at: -1 });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
