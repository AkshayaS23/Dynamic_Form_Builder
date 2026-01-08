// API Service - Backend Integration with Express/MongoDB
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
      const text = await response.text();
      throw new Error(text || 'Something went wrong');
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
    const forms = await apiCall('/api/forms');
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

  // Get single form
  async getForm(id) {
    const form = await apiCall(`/api/forms/${id}`);
    if (!form) return null;

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
        options: field.options
          ? field.options.map(opt => opt.option_text)
          : [],
        sort_order: field.sort_order
      }))
    };
  },

  // Create form
  async createForm(data) {
    return await apiCall('/api/forms', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Update form
  async updateForm(id, data) {
    return await apiCall(`/api/forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Delete form
  async deleteForm(id) {
    return await apiCall(`/api/forms/${id}`, {
      method: 'DELETE'
    });
  },

  // ✅ Duplicate form (FIXED)
  async duplicateForm(id) {
    return await apiCall(`/api/forms/${id}/duplicate`, {
      method: 'POST'
    });
  },

  // Submit response
  async submitResponse(formId, values) {
    return await apiCall(`/api/forms/${formId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ values })
    });
  },

  // Get responses for a form
 async getResponses(formId) {
  const responses = await apiCall(`/api/forms/${formId}/responses`);

  return responses.map(response => ({
    id: response._id,
    submitted_at: response.createdAt || response.submitted_at,
    values: response.values.reduce((acc, item) => {
      acc[item.field_id] = item.value;
      return acc;
    }, {})
  }));
},
  // Get all responses
   async getAllResponses() {
    const responses = await apiCall('/api/responses');

    return responses.map(response => ({
        id: response._id,
        form_id: response.form_id,
        submitted_at: response.createdAt || response.submitted_at,
        values: response.values.reduce((acc, item) => {
        acc[item.field_id] = item.value;
        return acc;
        }, {})
    }));
    },

  // ✅ Stats (FIXED)
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
    return await apiCall('/api/health');
  }
};

export default api;
