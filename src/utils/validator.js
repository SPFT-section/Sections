// Validation utilities

export const validators = {
  // Required field
  required: (value) => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  // Min length
  minLength: (min) => (value) => {
    if (!value) return false;
    return String(value).length >= min;
  },

  // Max length
  maxLength: (max) => (value) => {
    if (!value) return true;
    return String(value).length <= max;
  },

  // Email validation
  email: (value) => {
    if (!value) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // URL validation
  url: (value) => {
    if (!value) return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  // Number range
  range: (min, max) => (value) => {
    if (value === undefined || value === null) return false;
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  // Positive number
  positive: (value) => {
    if (value === undefined || value === null) return false;
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },

  // Non-negative number
  nonNegative: (value) => {
    if (value === undefined || value === null) return false;
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  },

  // Match pattern
  pattern: (regex) => (value) => {
    if (!value) return false;
    return regex.test(value);
  },

  // Contains only letters and spaces
  alpha: (value) => {
    if (!value) return false;
    return /^[a-zA-Z\s]+$/.test(value);
  },

  // Contains only letters, numbers, and spaces
  alphanumeric: (value) => {
    if (!value) return false;
    return /^[a-zA-Z0-9\s]+$/.test(value);
  },

  // Not empty
  notEmpty: (value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return String(value).trim().length > 0;
  },

  // Is a valid date
  date: (value) => {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  },

  // Is a valid phone number (Thai format)
  phoneThai: (value) => {
    if (!value) return false;
    const phoneRegex = /^(0[0-9]{9})$/;
    return phoneRegex.test(value.replace(/-/g, ''));
  },
};

// Validate an object against a schema
export const validateSchema = (data, schema) => {
  const errors = {};

  Object.keys(schema).forEach((field) => {
    const rules = schema[field];
    const value = data[field];

    if (rules.required && !validators.required(value)) {
      errors[field] = rules.message || `${field} is required`;
      return;
    }

    if (value !== undefined && value !== null && value !== '') {
      if (rules.minLength && !validators.minLength(rules.minLength)(value)) {
        errors[field] =
          rules.message || `${field} must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && !validators.maxLength(rules.maxLength)(value)) {
        errors[field] =
          rules.message || `${field} must not exceed ${rules.maxLength} characters`;
      }

      if (rules.pattern && !validators.pattern(rules.pattern)(value)) {
        errors[field] = rules.message || `${field} has invalid format`;
      }

      if (rules.email && !validators.email(value)) {
        errors[field] = rules.message || `${field} must be a valid email`;
      }

      if (rules.url && !validators.url(value)) {
        errors[field] = rules.message || `${field} must be a valid URL`;
      }

      if (rules.range && !validators.range(rules.range[0], rules.range[1])(value)) {
        errors[field] =
          rules.message || `${field} must be between ${rules.range[0]} and ${rules.range[1]}`;
      }

      if (rules.positive && !validators.positive(value)) {
        errors[field] = rules.message || `${field} must be a positive number`;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Novel validation schema
export const novelValidationSchema = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: 'Title must be between 1 and 100 characters',
  },
  author: {
    required: true,
    minLength: 1,
    maxLength: 50,
    message: 'Author name must be between 1 and 50 characters',
  },
  synopsis: {
    required: false,
    maxLength: 500,
    message: 'Synopsis must not exceed 500 characters',
  },
  genre: {
    required: false,
  },
};

// Chapter validation schema
export const chapterValidationSchema = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: 'Chapter title must be between 1 and 100 characters',
  },
  content: {
    required: true,
    minLength: 1,
    message: 'Chapter content cannot be empty',
  },
};
