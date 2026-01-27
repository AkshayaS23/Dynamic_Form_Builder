import express from 'express';
import Form from '../models/Form.js';
import Response from '../models/Response.js';
import upload from '../configs/multer.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Helper function to normalize sections
const normalizeSections = (sections) => {
  if (!sections || !Array.isArray(sections)) return [];
  
  return sections.map(section => {
    // Generate ID if missing
    const sectionId = section.id || uuidv4();
    
    // Normalize fields
    const normalizedFields = (section.fields || []).map(field => ({
      id: field.id || uuidv4(),
      label: field.label || '',
      type: field.type || 'text',
      required: Boolean(field.required),
      placeholder: field.placeholder || '',
      helpText: field.helpText || '',
      options: Array.isArray(field.options) ? field.options : [],
      sort_order: field.sort_order || 0
    }));
    
    return {
      id: sectionId,
      title: section.title || '',
      description: section.description || '',
      repeatable: Boolean(section.repeatable), // Ensure it's a boolean
      maxEntries: parseInt(section.maxEntries) || 0,
      addButtonText: section.addButtonText || '',
      fields: normalizedFields,
      sort_order: section.sort_order || 0
    };
  });
};

// GET all forms
router.get('/', async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single form by ID
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    console.log('Returning form:', form); // Debug log
    res.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET form by slug (for public form filling)
router.get('/slug/:slug', async (req, res) => {
  try {
    const form = await Form.findOne({ slug: req.params.slug });
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    res.json(form);
  } catch (error) {
    console.error('Error fetching form by slug:', error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE new form
router.post('/', async (req, res) => {
  try {
    const { form_name, description, category, status, slug, sections } = req.body;
    
    console.log('Received form data:', req.body); // Debug log
    
    // Check if slug already exists
    const existingForm = await Form.findOne({ slug });
    if (existingForm) {
      return res.status(400).json({ error: 'A form with this slug already exists' });
    }
    
    // Normalize sections with proper types
    const normalizedSections = normalizeSections(sections);
    
    console.log('Normalized sections:', normalizedSections); // Debug log
    
    const form = new Form({
      form_name,
      description: description || '',
      category: category || 'General',
      status: status || 'draft',
      slug,
      sections: normalizedSections
    });
    
    const savedForm = await form.save();
    console.log('Saved form:', savedForm); // Debug log
    
    res.status(201).json(savedForm);
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE form
router.put('/:id', async (req, res) => {
  try {
    const { form_name, description, category, status, slug, sections } = req.body;
    
    console.log('Updating form with data:', req.body); // Debug log
    
    const form = await Form.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Check if slug is being changed and if new slug already exists
    if (slug && slug !== form.slug) {
      const existingForm = await Form.findOne({ slug, _id: { $ne: req.params.id } });
      if (existingForm) {
        return res.status(400).json({ error: 'A form with this slug already exists' });
      }
    }
    
    // Normalize sections with proper types
    const normalizedSections = normalizeSections(sections);
    
    console.log('Normalized sections for update:', normalizedSections); // Debug log
    
    // Update fields
    form.form_name = form_name;
    form.description = description || '';
    form.category = category || 'General';
    form.status = status || form.status;
    form.slug = slug || form.slug;
    form.sections = normalizedSections;
    
    const updatedForm = await form.save();
    console.log('Updated form:', updatedForm); // Debug log
    
    res.json(updatedForm);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE form
router.delete('/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    res.json({ message: 'Form deleted successfully', form });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: error.message });
  }
});

// DUPLICATE form
router.post('/:id/duplicate', async (req, res) => {
  try {
    const originalForm = await Form.findById(req.params.id);
    
    if (!originalForm) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Create a unique slug for the duplicate
    const timestamp = Date.now();
    const newSlug = `${originalForm.slug}-copy-${timestamp}`;
    
    // Create duplicate with normalized sections
    const duplicateForm = new Form({
      form_name: `${originalForm.form_name} (Copy)`,
      description: originalForm.description,
      category: originalForm.category,
      status: 'draft', // Set to draft by default
      slug: newSlug,
      sections: normalizeSections(originalForm.sections)
    });
    
    const savedForm = await duplicateForm.save();
    res.status(201).json(savedForm);
  } catch (error) {
    console.error('Error duplicating form:', error);
    res.status(500).json({ error: error.message });
  }
});

// SUBMIT form response (with file upload support)
router.post('/:id/submit', upload.any(), async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Check if form is active
    if (form.status !== 'active') {
      return res.status(403).json({ error: 'This form is not accepting responses' });
    }

    let values = {};

    // Handle multipart/form-data (with files)
    if (req.files && req.files.length > 0) {
      console.log('Received files:', req.files);
      
      // Parse organized values from form data
      if (req.body.organizedValues) {
        values = JSON.parse(req.body.organizedValues);
        console.log('Parsed organizedValues:', values);
      } else if (req.body.values) {
        values = JSON.parse(req.body.values);
        console.log('Parsed values:', values);
      }

      // Process uploaded files and update values
      req.files.forEach(file => {
        console.log('Processing file:', file.fieldname, file.filename);
        
        const fileInfo = {
          originalname: file.originalname,
          filename: file.filename,
          path: `/uploads/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size
        };

        // Check if this is a repeatable section field
        const fieldParts = file.fieldname.split('_');
        
        if (fieldParts.length === 3) {
          // Repeatable section: sectionId_entryIdx_fieldId
          const [sectionId, entryIdx, fieldId] = fieldParts;
          const idx = parseInt(entryIdx);
          
          if (!values[sectionId]) {
            values[sectionId] = [];
          }
          
          if (!values[sectionId][idx]) {
            values[sectionId][idx] = {};
          }
          
          values[sectionId][idx][fieldId] = fileInfo;
          console.log(`Set repeatable file: ${sectionId}[${idx}].${fieldId}`);
        } else {
          // Regular field
          values[file.fieldname] = fileInfo;
          console.log(`Set regular file: ${file.fieldname}`);
        }
      });
    } else {
      // Handle JSON data (no files)
      values = req.body.values || req.body;
      console.log('No files, using JSON values:', values);
    }

    console.log('Final values to save:', JSON.stringify(values, null, 2));

    // Create response
    const response = new Response({
      form_id: form._id,
      form_name: form.form_name,
      values: values,
      submitted_at: new Date()
    });

    const savedResponse = await response.save();
    console.log('Saved response:', savedResponse._id);
    
    res.status(201).json({
      _id: savedResponse._id,
      message: 'Response submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET responses for a specific form
router.get('/:id/responses', async (req, res) => {
  try {
    const responses = await Response.find({ form_id: req.params.id }).sort({ submitted_at: -1 });
    res.json(responses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;