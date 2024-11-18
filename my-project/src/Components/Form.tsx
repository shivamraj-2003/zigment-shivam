import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Define Alert and AlertDescription directly in this file
const Alert: React.FC<{ variant?: string; className?: string; children: React.ReactNode }> = ({
  variant,
  className,
  children,
}) => {
  return <div className={`alert alert-${variant} ${className}`}>{children}</div>;
};

const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <span className="alert-description">{children}</span>;
};

// Form component
interface FormOption {
  value: string;
  label: string;
}

interface FormValidation {
  pattern?: string;
  message?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
}

interface FormField {
  id: string;
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'radio';
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: FormOption[];
  validation?: FormValidation;
}

interface FormSchema {
  formTitle: string;
  formDescription?: string;
  fields: FormField[];
}

const Form: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (!jsonInput.trim()) {
        setFormSchema(null);
        setJsonError(null);
        return;
      }

      const parsed = JSON.parse(jsonInput) as FormSchema;
      if (!parsed.formTitle || !Array.isArray(parsed.fields)) {
        throw new Error('Invalid schema format. Must include "formTitle" and "fields" array.');
      }

      setFormSchema(parsed);
      setJsonError(null);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
      setFormSchema(null);
    }
  }, [jsonInput]);

  const handleInputChange = (id: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    validateField(id, value);
  };

  const validateField = (id: string, value: string): void => {
    const field = formSchema?.fields.find((f) => f.id === id);
    if (!field) return;

    let error = '';

    if (field.required && !value) {
      error = 'This field is required';
    } else if (field.validation) {
      if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
        error = field.validation.message || 'Invalid format';
      }
      if (field.validation.minLength && value.length < field.validation.minLength) {
        error = `Minimum length is ${field.validation.minLength}`;
      }
      if (field.validation.maxLength && value.length > field.validation.maxLength) {
        error = `Maximum length is ${field.validation.maxLength}`;
      }
    }

    setFormErrors((prev) => ({
      ...prev,
      [id]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors: Record<string, string> = {};
    formSchema?.fields.forEach((field) => {
      const value = formData[field.id] || '';
      validateField(field.id, value);
      if (field.required && !value) {
        newErrors[field.id] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Form submitted:', formData);
      setIsSubmitted(true);
    } else {
      setFormErrors(newErrors);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dynamic Form Generator</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">JSON Schema Editor</h2>
            <textarea
              className="w-full h-96 font-mono p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`{
                "title": "Contact Form",
                "fields": [
                  {
                    "type": "text",
                    "label": "Name",
                    "name": "name",
                    "required": true
                  }
                ]
              }`}
            />
            {jsonError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{jsonError}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            {formSchema ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-semibold mb-2">{formSchema.formTitle}</h2>
                {formSchema.formDescription && (
                  <p className="text-gray-600 mb-6">{formSchema.formDescription}</p>
                )}

                {formSchema.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        id={field.id}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        required={field.required}
                      >
                        <option value="">Select an option</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'radio' ? (
                      <div className="space-y-2">
                        {field.options?.map((option) => (
                          <label key={option.value} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={field.id}
                              value={option.value}
                              checked={formData[field.id] === option.value}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              className="focus:ring-2 focus:ring-blue-500"
                              required={field.required}
                            />
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        id={field.id}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                        required={field.required}
                      />
                    ) : (
                      <input
                        type={field.type}
                        id={field.id}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        required={field.required}
                      />
                    )}

                    {formErrors[field.id] && (
                      <p className="text-sm text-red-500">{formErrors[field.id]}</p>
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>

                {isSubmitted && (
                  <Alert className="mt-4">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>Form submitted successfully!</AlertDescription>
                  </Alert>
                )}
              </form>
            ) : (
              <div className="text-center text-gray-500">
                Enter a valid JSON schema to generate the form
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;
