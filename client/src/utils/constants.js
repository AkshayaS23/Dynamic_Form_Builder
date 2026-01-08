// Field Types Configuration
// Field Types Configuration
export const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: '📝' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'phone', label: 'Phone', icon: '📱' },
  { value: 'password', label: 'Password', icon: '🔒' }, 
  { value: 'textarea', label: 'Long Text', icon: '📄' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'time', label: 'Time', icon: '⏰' },
  { value: 'url', label: 'URL', icon: '🔗' },
  { value: 'dropdown', label: 'Dropdown', icon: '⬇️' },
  { value: 'radio', label: 'Radio', icon: '⚪' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { value: 'rating', label: 'Rating', icon: '⭐' },
  { value: 'file', label: 'Upload', icon: '📁' }
];


// Form Categories
export const CATEGORIES = [
  'General',
  'Registration',
  'Feedback',
  'Survey',
  'Application',
  'Contact'
];

// Form Statuses
export const FORM_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' }
];

// Field types that require options
export const FIELDS_REQUIRING_OPTIONS = ['dropdown', 'radio', 'checkbox'];

// Status badge colors
export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-gray-100 text-gray-700'
};