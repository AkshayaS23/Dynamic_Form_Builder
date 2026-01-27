// API Service - Backend Integration with File Upload Support
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;
// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Something went wrong');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

const api = {
  // Get all forms
  async getForms() {
    const forms = await apiCall('/forms');
    return forms.map(form => ({
      id: form._id,
      form_name: form.form_name,
      description: form.description,
      slug: form.slug,
      category: form.category,
      status: form.status,
      created_at: form.createdAt,
      updated_at: form.updatedAt
    }));
  },

  // Get single form with sections and fields
  async getForm(id) {
    const form = await apiCall(`/forms/${id}`);
    
    if (!form) return null;

    console.log('API getForm - received from backend:', form);

    // Transform backend data structure
    return {
      id: form._id,
      form_name: form.form_name,
      description: form.description,
      slug: form.slug,
      category: form.category,
      status: form.status,
      created_at: form.createdAt,
      updated_at: form.updatedAt,
      // Handle sections - keep all fields including repeatable settings
      sections: form.sections && form.sections.length > 0 
        ? form.sections.map(section => ({
            id: section.id || section._id,
            title: section.title || '',
            description: section.description || '',
            repeatable: Boolean(section.repeatable),
            maxEntries: Number(section.maxEntries) || 0,
            addButtonText: section.addButtonText || '',
            fields: (section.fields || []).map(field => ({
              id: field.id || field._id,
              label: field.label,
              type: field.type,
              required: field.required,
              placeholder: field.placeholder || '',
              helpText: field.helpText || '',
              options: Array.isArray(field.options) 
                ? field.options.map(opt => typeof opt === 'string' ? opt : opt.option_text)
                : [],
              sort_order: field.sort_order || 0
            }))
          }))
        : []
    };
  },

  // Get form by slug (for public form filling)
  async getFormBySlug(slug) {
    const form = await apiCall(`/forms/slug/${slug}`);
    
    if (!form) return null;

    return {
      id: form._id,
      form_name: form.form_name,
      description: form.description,
      slug: form.slug,
      category: form.category,
      status: form.status,
      sections: form.sections && form.sections.length > 0 
        ? form.sections.map(section => ({
            id: section.id || section._id,
            title: section.title || '',
            description: section.description || '',
            repeatable: Boolean(section.repeatable),
            maxEntries: Number(section.maxEntries) || 0,
            addButtonText: section.addButtonText || '',
            fields: (section.fields || []).map(field => ({
              id: field.id || field._id,
              label: field.label,
              type: field.type,
              required: field.required,
              placeholder: field.placeholder || '',
              helpText: field.helpText || '',
              options: Array.isArray(field.options) 
                ? field.options.map(opt => typeof opt === 'string' ? opt : opt.option_text)
                : [],
              sort_order: field.sort_order || 0
            }))
          }))
        : []
    };
  },

  // Create new form with sections
  async createForm(data) {
    console.log('API createForm - sending to backend:', data);
    
    const payload = {
      form_name: data.form_name,
      description: data.description || '',
      slug: data.slug, // ✅ IMPORTANT: Include slug
      category: data.category || 'General',
      status: data.status || 'active',
      sections: data.sections || []
    };

    console.log('API createForm - payload:', payload);

    const result = await apiCall('/forms', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return { id: result._id, message: 'Form created successfully' };
  },

  // Update form with sections
  async updateForm(id, data) {
    console.log('API updateForm - sending to backend:', data);
    
    const payload = {
      form_name: data.form_name,
      description: data.description || '',
      slug: data.slug, // ✅ IMPORTANT: Include slug
      category: data.category || 'General',
      status: data.status || 'active',
      sections: data.sections || []
    };

    console.log('API updateForm - payload:', payload);

    const result = await apiCall(`/forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    return result;
  },

  // Delete form
  async deleteForm(id) {
    return await apiCall(`/forms/${id}`, {
      method: 'DELETE'
    });
  },

  // Duplicate form
  async duplicateForm(id) {
    const result = await apiCall(`/forms/${id}/duplicate`, {
      method: 'POST'
    });

    return { id: result._id, message: 'Form duplicated successfully' };
  },

  // Submit form response with file support
  async submitResponse(formId, values) {
    const payload = {
      values: values
    };

    const result = await apiCall(`/forms/${formId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return { id: result._id, message: 'Response submitted successfully' };
  },

  // Get responses for a form
  async getResponses(formId) {
    const responses = await apiCall(`/forms/${formId}/responses`);
    
    return responses.map(response => ({
      id: response._id,
      form_id: response.form_id,
      submitted_at: response.submitted_at,
      values: response.values
    }));
  },

  // Delete response
  async deleteResponse(responseId) {
    return await apiCall(`/responses/${responseId}`, {
      method: 'DELETE'
    });
  },

  // Get all responses
  async getAllResponses() {
    return await apiCall('/responses');
  },

  // Get statistics
  async getStats() {
    try {
      const forms = await this.getForms();
      const responses = await this.getAllResponses();

      return {
        totalForms: forms.length,
        totalResponses: responses.length,
        activeForms: forms.filter(f => f.status === 'active').length
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalForms: 0,
        totalResponses: 0,
        activeForms: 0
      };
    }
  }
};

export default api;