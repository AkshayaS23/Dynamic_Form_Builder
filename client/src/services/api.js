// API Service - Backend Integration with Express/MongoDB
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    // Transform backend data to match frontend format
    return forms.map(form => ({
      id: form._id,
      form_name: form.form_name,
      description: form.description,
      category: form.category,
      status: form.status,
      created_at: form.createdAt,
      updated_at: form.updatedAt
    }));
  },

  // Get single form with fields
  async getForm(id) {
    const form = await apiCall(`/forms/${id}`);
    
    if (!form) return null;

    // Transform backend data structure
    return {
      id: form._id,
      form_name: form.form_name,
      description: form.description,
      category: form.category,
      status: form.status,
      created_at: form.createdAt,
      fields: form.fields.map(field => ({
        id: field._id,
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder,
        helpText: field.helpText,
        options: field.options ? field.options.map(opt => opt.option_text) : [],
        sort_order: field.sort_order
      }))
    };
  },

  // Create new form
  async createForm(data) {
    const payload = {
      form_name: data.form_name,
      description: data.description || '',
      category: data.category || 'General',
      status: data.status || 'active',
      fields: data.fields.map(field => ({
        label: field.label,
        type: field.type,
        required: field.required || false,
        placeholder: field.placeholder || '',
        helpText: field.helpText || '',
        options: field.options || []
      }))
    };

    const result = await apiCall('/forms', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return { id: result.id, message: result.message };
  },

  // Update form
  async updateForm(id, data) {
    const payload = {
      form_name: data.form_name,
      description: data.description || '',
      category: data.category || 'General',
      status: data.status || 'active',
      fields: data.fields.map(field => ({
        label: field.label,
        type: field.type,
        required: field.required || false,
        placeholder: field.placeholder || '',
        helpText: field.helpText || '',
        options: field.options || []
      }))
    };

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

    return { id: result.id, message: result.message };
  },

  // Submit form response
  async submitResponse(formId, values) {
    const payload = {
      values: values
    };

    const result = await apiCall(`/forms/${formId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return { id: result.id, message: result.message };
  },

  // Get responses for a form
  async getResponses(formId) {
    const responses = await apiCall(`/forms/${formId}/responses`);
    
    // Transform backend response structure
    return responses.map(response => ({
      id: response._id,
      form_id: response.form_id,
      submitted_at: response.submitted_at,
      // Convert values array back to object format
      values: response.values.reduce((acc, val) => {
        acc[val.field_id] = val.value;
        return acc;
      }, {})
    }));
  },

  // Get all responses (for stats)
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
  },

  // Health check
  async healthCheck() {
    try {
      return await apiCall('/health');
    } catch (error) {
      return { status: 'ERROR', message: error.message };
    }
  }
};

export default api;