import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Check, AlertCircle, ChevronRight, ChevronLeft, Home, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import DynamicField from '../../components/forms/DynamicField';
import { Loader, ErrorMessage } from '../../components/common/Loader';
import api from '../../services/api';

const FillForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Track repeatable section entries: { sectionId: [entryIndex1, entryIndex2, ...] }
  const [repeatableEntries, setRepeatableEntries] = useState({});

  useEffect(() => {
    loadForm();
  }, [id]);

  useEffect(() => {
    // Initialize repeatable sections with at least one entry
    if (form && form.sections) {
      const initialEntries = {};
      form.sections.forEach(section => {
        if (section.repeatable) {
          initialEntries[section.id] = [0]; // Start with one entry
        }
      });
      setRepeatableEntries(initialEntries);
    }
  }, [form]);

  const loadForm = async () => {
    try {
      setLoading(true);
      setError(null);
      const f = await api.getForm(id);
      setForm(f);
    } catch (err) {
      setError(err.message);
      console.error('Error loading form:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldId, value, sectionId = null, entryIndex = null) => {
    if (sectionId && entryIndex !== null) {
      // Repeatable section field
      const key = `${sectionId}_${entryIndex}_${fieldId}`;
      setValues({ ...values, [key]: value });
      if (errors[key]) {
        const newErrors = { ...errors };
        delete newErrors[key];
        setErrors(newErrors);
      }
    } else {
      // Regular field
      setValues({ ...values, [fieldId]: value });
      if (errors[fieldId]) {
        const newErrors = { ...errors };
        delete newErrors[fieldId];
        setErrors(newErrors);
      }
    }
  };

  const addRepeatableEntry = (sectionId) => {
    const section = form.sections.find(s => s.id === sectionId);
    const currentEntries = repeatableEntries[sectionId] || [];
    
    // Check max entries limit
    if (section.maxEntries > 0 && currentEntries.length >= section.maxEntries) {
      alert(`Maximum ${section.maxEntries} entries allowed`);
      return;
    }
    
    const newIndex = currentEntries.length > 0 ? Math.max(...currentEntries) + 1 : 0;
    setRepeatableEntries({
      ...repeatableEntries,
      [sectionId]: [...currentEntries, newIndex]
    });
  };

  const removeRepeatableEntry = (sectionId, entryIndex) => {
    const currentEntries = repeatableEntries[sectionId] || [];
    if (currentEntries.length <= 1) {
      alert('At least one entry is required');
      return;
    }
    
    // Remove this entry
    setRepeatableEntries({
      ...repeatableEntries,
      [sectionId]: currentEntries.filter(idx => idx !== entryIndex)
    });
    
    // Clear values for this entry
    const section = form.sections.find(s => s.id === sectionId);
    if (section) {
      const newValues = { ...values };
      section.fields.forEach(field => {
        const key = `${sectionId}_${entryIndex}_${field.id}`;
        delete newValues[key];
      });
      setValues(newValues);
    }
  };

  const getOverallProgress = () => {
    if (!form || !form.sections) return 0;
    
    let totalFields = 0;
    let filledFields = 0;
    
    form.sections.forEach(section => {
      if (section.repeatable) {
        const entries = repeatableEntries[section.id] || [0];
        totalFields += section.fields.length * entries.length;
        
        entries.forEach(entryIdx => {
          section.fields.forEach(field => {
            const key = `${section.id}_${entryIdx}_${field.id}`;
            const val = values[key];
            if (val !== undefined && val !== '' && val !== null && 
                (!Array.isArray(val) || val.length > 0)) {
              filledFields++;
            }
          });
        });
      } else {
        totalFields += section.fields.length;
        section.fields.forEach(field => {
          const val = values[field.id];
          if (val !== undefined && val !== '' && val !== null && 
              (!Array.isArray(val) || val.length > 0)) {
            filledFields++;
          }
        });
      }
    });
    
    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  };

  const validateCurrentSection = () => {
    if (!form || !form.sections[currentStep]) return true;
    
    const currentSection = form.sections[currentStep];
    const newErrors = {};
    
    if (currentSection.repeatable) {
      const entries = repeatableEntries[currentSection.id] || [0];
      entries.forEach(entryIdx => {
        currentSection.fields.forEach(field => {
          if (field.required) {
            const key = `${currentSection.id}_${entryIdx}_${field.id}`;
            const val = values[key];
            if (!val || (Array.isArray(val) && val.length === 0)) {
              newErrors[key] = 'This field is required';
            }
          }
        });
      });
    } else {
      currentSection.fields.forEach(field => {
        if (field.required) {
          const val = values[field.id];
          if (!val || (Array.isArray(val) && val.length === 0)) {
            newErrors[field.id] = 'This field is required';
          }
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentSection()) {
      if (currentStep < form.sections.length - 1) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


const handleSubmit = async () => {
  // Final validation
  const newErrors = {};
  form.sections.forEach(section => {
    if (section.repeatable) {
      const entries = repeatableEntries[section.id] || [0];
      entries.forEach(entryIdx => {
        section.fields.forEach(field => {
          if (field.required) {
            const key = `${section.id}_${entryIdx}_${field.id}`;
            const val = values[key];
            if (!val || (Array.isArray(val) && val.length === 0)) {
              newErrors[key] = 'Required';
            }
          }
        });
      });
    } else {
      section.fields.forEach(field => {
        if (field.required) {
          const val = values[field.id];
          if (!val || (Array.isArray(val) && val.length === 0)) {
            newErrors[field.id] = 'Required';
          }
        }
      });
    }
  });

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    alert('Please fill all required fields');
    return;
  }

  try {
    setSubmitting(true);
    
    // Organize values by section
    const organizedValues = {};
    
    form.sections.forEach(section => {
      if (section.repeatable) {
        const entries = repeatableEntries[section.id] || [0];
        organizedValues[section.id] = entries.map(entryIdx => {
          const entryData = {};
          section.fields.forEach(field => {
            const key = `${section.id}_${entryIdx}_${field.id}`;
            entryData[field.id] = values[key];
          });
          return entryData;
        });
      } else {
        section.fields.forEach(field => {
          organizedValues[field.id] = values[field.id];
        });
      }
    });
    
    // Check for file uploads - FIXED: Check if value is File directly
    const hasFiles = Object.values(values).some(v => v instanceof File);
    
    console.log('Has files:', hasFiles);
    console.log('All values:', values);
    
    if (hasFiles) {
      // Use FormData for file uploads
      const formData = new FormData();
      
      // Process all values
      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof File) {
          // Append the actual file
          formData.append(key, value);
          console.log(`Appending file: ${key} -> ${value.name}`);
          
          // Update organizedValues with filename for reference
          const parts = key.split('_');
          if (parts.length === 3) {
            // Repeatable section: sectionId_entryIdx_fieldId
            const [sectionId, entryIdx, fieldId] = parts;
            const idx = parseInt(entryIdx);
            
            if (organizedValues[sectionId] && organizedValues[sectionId][idx]) {
              organizedValues[sectionId][idx][fieldId] = value.name;
            }
          } else {
            // Regular field
            organizedValues[key] = value.name;
          }
        }
      });
      
      // Append the organized values as JSON
      formData.append('organizedValues', JSON.stringify(organizedValues));
      
      console.log('Submitting with files. Organized values:', organizedValues);
      
      // Send to backend
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${BASE_URL}/api/forms/${id}/submit`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type - browser will set it with boundary
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit');
      }
      
      const result = await response.json();
      console.log('Submission result:', result);
      
    } else {
      // No files - use JSON
      console.log('Submitting without files. Organized values:', organizedValues);
      await api.submitResponse(id, organizedValues);
    }
    
    setSubmitted(true);
  } catch (error) {
    console.error('Error:', error);
    alert('Error submitting form: ' + error.message);
  } finally {
    setSubmitting(false);
  }
};

  if (loading) return <Loader message="Loading form..." />;
  if (error || !form) return <ErrorMessage message={error || "Form Not Found"} backPath="/user" />;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <Home className="w-5 h-5 mr-2" />Home
            </Link>
            <Link to="/user" className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
              <ArrowLeft className="w-5 h-5 mr-2" />Back to Forms
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="max-w-2xl w-full text-center py-12 bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Submitted Successfully!</h2>
            <p className="text-gray-600 mb-8">Thank you for your response.</p>
            <div className="flex gap-4 justify-center">
              <Link to="/" className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                Go Home
              </Link>
              <Link to="/user" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                View More Forms
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sections = form.sections || [];
  const currentSection = sections[currentStep];
  const overallProgress = getOverallProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <Home className="w-5 h-5 mr-2" />Home
          </Link>
          <Link to="/user" className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />Back
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-blue-600 to-blue-700 p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">{form.form_name}</h2>
            {form.description && <p className="text-blue-100">{form.description}</p>}
          </div>

          <div className="px-8 pt-6 pb-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-semibold text-blue-600">{overallProgress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-blue-600 transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>

          {sections.length > 1 && (
            <div className="px-8 py-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                {sections.map((section, index) => (
                  <React.Fragment key={index}>
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        index === currentStep ? 'bg-blue-600 text-white' :
                        index < currentStep ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                      </div>
                      <div className="mt-2 text-center max-w-25">
                        <div className={`text-xs font-medium truncate ${
                          index === currentStep ? 'text-blue-600' :
                          index < currentStep ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {section.title || `Step ${index + 1}`}
                        </div>
                      </div>
                    </div>
                    {index < sections.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-2 mt-5 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <div className="p-8">
            {currentSection && (
              <>
                {currentSection.title && (
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{currentSection.title}</h3>
                    {currentSection.description && (
                      <p className="text-sm text-gray-600 mt-1">{currentSection.description}</p>
                    )}
                    {sections.length > 1 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Section {currentStep + 1} of {sections.length}
                      </p>
                    )}
                  </div>
                )}

                {/* Repeatable Section */}
                {currentSection.repeatable ? (
                  <div className="space-y-6">
                    {(repeatableEntries[currentSection.id] || [0]).map((entryIdx, arrayIdx) => (
                      <div key={entryIdx} className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50 relative">
                        {/* Entry Header */}
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-lg text-gray-900">
                            Entry {arrayIdx + 1}
                          </h4>
                          {(repeatableEntries[currentSection.id] || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRepeatableEntry(currentSection.id, entryIdx)}
                              className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        {/* Fields for this entry */}
                        <div className="space-y-4">
                          {currentSection.fields.map((field, fieldIdx) => {
                            const fieldKey = `${currentSection.id}_${entryIdx}_${field.id}`;
                            return (
                              <div key={field.id}>
                                <label className="block mb-2">
                                  <span className="text-sm font-semibold text-gray-700">
                                    <span className="text-gray-400 mr-2">{fieldIdx + 1}.</span>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                  </span>
                                </label>
                                <DynamicField
                                  field={field}
                                  value={values[fieldKey]}
                                  onChange={(fId, val) => handleChange(fId, val, currentSection.id, entryIdx)}
                                  error={errors[fieldKey]}
                                />
                                {field.helpText && (
                                  <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
                                )}
                                {errors[fieldKey] && (
                                  <p className="text-sm text-red-600 mt-1 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" />{errors[fieldKey]}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Add Another Button */}
                    {(!currentSection.maxEntries || 
                      (repeatableEntries[currentSection.id] || []).length < currentSection.maxEntries) && (
                      <button
                        type="button"
                        onClick={() => addRepeatableEntry(currentSection.id)}
                        className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center justify-center gap-2 font-medium"
                      >
                        <Plus className="w-5 h-5" />
                        {currentSection.addButtonText || 'Add Another'}
                      </button>
                    )}
                  </div>
                ) : (
                  /* Regular Section */
                  <div className="space-y-6">
                    {currentSection.fields.map((field, idx) => (
                      <div key={field.id}>
                        <label className="block mb-2">
                          <span className="text-sm font-semibold text-gray-700">
                            <span className="text-gray-400 mr-2">{idx + 1}.</span>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </span>
                        </label>
                        <DynamicField
                          field={field}
                          value={values[field.id]}
                          onChange={handleChange}
                          error={errors[field.id]}
                        />
                        {field.helpText && (
                          <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
                        )}
                        {errors[field.id] && (
                          <p className="text-sm text-red-600 mt-1 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />{errors[field.id]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="px-8 py-6 bg-gray-50 border-t flex justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center px-6 py-3 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />Previous
            </button>
            <button
              onClick={handleNext}
              disabled={submitting}
              className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold shadow-md"
            >
              {currentStep === sections.length - 1 ? (
                submitting ? (
                  <><span className="animate-spin mr-2">⏳</span>Submitting...</>
                ) : (
                  <><Check className="w-5 h-5 mr-2" />Submit</>
                )
              ) : (
                <>Next<ChevronRight className="w-5 h-5 ml-1" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FillForm;