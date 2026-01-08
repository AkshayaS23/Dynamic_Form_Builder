// API Service - Backend Integration with Express/MongoDB

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  async createForm(data) {
    return await apiCall('/api/forms', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateForm(id, data) {
    return await apiCall(`/api/forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteForm(id) {
    return await apiCall(`/api/forms/${id}`, {
      method: 'DELETE'
    });
  },

  async submitResponse(formId, values) {
    return await apiCall(`/api/forms/${formId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ values })
    });
  },

  async getResponses(formId) {
    return await apiCall(`/api/forms/${formId}/responses`);
  },

  async getAllResponses() {
    return await apiCall('/api/responses');
  },

  async healthCheck() {
    return await apiCall('/api/health');
  }
};

export default api;
