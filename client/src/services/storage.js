// Storage Service
// In-memory storage for React state management

const storage = {
  // In-memory storage
  memoryStore: {
    forms: [],
    formFields: [],
    responses: []
  },

  get(key) {
    return this.memoryStore[key] || [];
  },

  set(key, value) {
    this.memoryStore[key] = value;
  },

  // Initialize with sample data (optional)
  initialize() {
    if (this.memoryStore.forms.length === 0) {
      // Add some sample data if needed
      this.memoryStore.forms = [];
      this.memoryStore.formFields = [];
      this.memoryStore.responses = [];
    }
  }
};

// Initialize on load
storage.initialize();

export default storage;