import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Save, Edit, Trash2, Eye, EyeOff, FileText, GripVertical, Layers, AlertCircle } from "lucide-react";

import Layout from "../../components/layout/Layout";
import FieldModal from "../../components/forms/FieldModal";
import DynamicField from "../../components/forms/DynamicField";
import { Loader } from "../../components/common/Loader";
import { CATEGORIES } from "../../utils/constants";
import api from "../../services/api";

const FormEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('General');
  const [status, setStatus] = useState('active');
  const [slug, setSlug] = useState('');
  const [sections, setSections] = useState([{ title: '', fields: [] }]);
  const [showModal, setShowModal] = useState(false);
  const [editField, setEditField] = useState(null);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      loadForm();
    }
  }, [id, isEditMode]);

  // Auto-generate slug from form name
  useEffect(() => {
    if (!isEditMode && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [name, isEditMode]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const form = await api.getForm(id);
      if (form) {
        console.log('Loaded form data:', form); // Debug log
        
        setName(form.form_name);
        setDesc(form.description || '');
        setCategory(form.category);
        setStatus(form.status);
        setSlug(form.slug || '');
        
        // Ensure repeatable settings are properly initialized
        const normalizedSections = form.sections && form.sections.length > 0 
          ? form.sections.map(section => {
              console.log('Processing section:', section); // Debug log
              return {
                title: section.title || '',
                repeatable: Boolean(section.repeatable),
                maxEntries: Number(section.maxEntries) || 0,
                addButtonText: section.addButtonText || '',
                fields: section.fields || []
              };
            })
          : [{ title: '', repeatable: false, maxEntries: 0, addButtonText: '', fields: [] }];
        
        console.log('Normalized sections:', normalizedSections); // Debug log
        setSections(normalizedSections);
      }
    } catch (error) {
      console.error('Error loading form:', error);
      alert('Error loading form: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateSlug = (slugValue) => {
    if (!slugValue) {
      setSlugError('Slug is required');
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(slugValue)) {
      setSlugError('Slug can only contain lowercase letters, numbers, and hyphens');
      return false;
    }
    setSlugError('');
    return true;
  };

  const handleSlugChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(value);
    validateSlug(value);
  };

  const addSection = () => {
    setSections([...sections, { 
      title: '', 
      repeatable: false, 
      maxEntries: 0, 
      addButtonText: '', 
      fields: [] 
    }]);
  };

  const removeSection = (sectionIdx) => {
    if (sections.length === 1) {
      alert('Form must have at least one section');
      return;
    }
    setSections(sections.filter((_, idx) => idx !== sectionIdx));
  };

  const updateSectionTitle = (sectionIdx, title) => {
    const updated = [...sections];
    updated[sectionIdx].title = title;
    setSections(updated);
  };

  const addField = (data) => {
    const updated = [...sections];

    // Edit existing field
    if (editField && editField.fieldIdx !== null) {
      const { sectionIdx, fieldIdx } = editField;
      updated[sectionIdx].fields[fieldIdx] = data;
    } 
    // Add new field
    else {
      const sectionIdx = editField?.sectionIdx ?? 0;
      updated[sectionIdx].fields.push(data);
    }

    setSections(updated);
    setEditField(null);
    setShowModal(false);
  };

  const editFieldHandler = (sectionIdx, fieldIdx) => {
    setEditField({ sectionIdx, fieldIdx });
    setShowModal(true);
  };

  const removeField = (sectionIdx, fieldIdx) => {
    const updated = [...sections];
    updated[sectionIdx].fields = updated[sectionIdx].fields.filter((_, idx) => idx !== fieldIdx);
    setSections(updated);
  };

  const openFieldModal = (sectionIdx) => {
    setEditField({ sectionIdx, fieldIdx: null });
    setShowModal(true);
  };

  const save = async () => {
    if (!name.trim()) {
      alert('Please enter form name');
      return;
    }

    if (!validateSlug(slug)) {
      alert('Please fix the slug error before saving');
      return;
    }

    const hasFields = sections.some(s => s.fields.length > 0);
    if (!hasFields) {
      alert('Please add at least one field to the form');
      return;
    }

    try {
      setSaving(true);
      const data = { 
        form_name: name, 
        description: desc, 
        category, 
        status,
        slug: slug.trim(),
        sections: sections.map(s => ({
          title: s.title || '',
          repeatable: Boolean(s.repeatable),
          maxEntries: parseInt(s.maxEntries) || 0,
          addButtonText: s.addButtonText || '',
          fields: s.fields || []
        }))
      };

      console.log('Saving form data:', data); // Debug log

      if (isEditMode) {
        await api.updateForm(id, data);
        alert('Form updated successfully!');
      } else {
        await api.createForm(data);
        alert('Form created successfully!');
      }
      navigate('/forms');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const totalFields = sections.reduce((sum, s) => sum + s.fields.length, 0);

  if (loading) {
    return <Loader message="Loading form..." />;
  }

  return (
    <Layout showSidebar={true} sidebarType="admin">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isEditMode ? 'Edit' : 'Create'} Form
            </h1>
            <p className="text-gray-600">Design your custom form with sections and fields</p>
          </div>
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all font-medium"
          >
            {preview ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show Preview
              </>
            )}
          </button>
        </div>

        <div className={`grid ${preview ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Form Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                Form Details
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Form Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Job Application Form"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Form Slug (URL) *
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-600">
                        /form/
                      </span>
                      <input
                        type="text"
                        value={slug}
                        onChange={handleSlugChange}
                        placeholder="job-application-form"
                        className={`flex-1 px-4 py-3 border ${slugError ? 'border-red-300' : 'border-gray-300'} rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        disabled={saving}
                      />
                    </div>
                    {slugError && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {slugError}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      This will be the public URL for your form. Use lowercase letters, numbers, and hyphens only.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Please fill out this form to apply for open positions..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={saving}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={saving}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={saving}
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Layers className="w-6 h-6 mr-2 text-blue-600" />
                  Form Sections ({sections.length})
                </h3>
                <button
                  onClick={addSection}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                  disabled={saving}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section
                </button>
              </div>

              <div className="space-y-6">
                {sections.map((section, sectionIdx) => (
                  <div key={sectionIdx} className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                          Section {sectionIdx + 1} Title (Optional)
                        </label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateSectionTitle(sectionIdx, e.target.value)}
                          placeholder={`e.g., Personal Information, Contact Details`}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                          disabled={saving}
                        />
                      </div>
                      {sections.length > 1 && (
                        <button
                          onClick={() => removeSection(sectionIdx)}
                          className="mt-8 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={saving}
                          title="Remove Section"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Repeatable Section Toggle */}
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={section.repeatable || false}
                          onChange={(e) => {
                            const updated = [...sections];
                            updated[sectionIdx].repeatable = e.target.checked;
                            if (!e.target.checked) {
                              // Reset repeatable settings when unchecked
                              updated[sectionIdx].maxEntries = 0;
                              updated[sectionIdx].addButtonText = '';
                            }
                            setSections(updated);
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          disabled={saving}
                        />
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-gray-900">
                            Allow Multiple Entries (Repeatable Section)
                          </span>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Users can add multiple instances of this section (e.g., Education, Projects, Work Experience)
                          </p>
                        </div>
                      </label>

                      {/* Repeatable Section Settings */}
                      {section.repeatable && (
                        <div className="pl-7 space-y-3 pt-2 border-t border-blue-200">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Maximum Entries (0 = unlimited)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={section.maxEntries || 0}
                              onChange={(e) => {
                                const updated = [...sections];
                                updated[sectionIdx].maxEntries = parseInt(e.target.value) || 0;
                                setSections(updated);
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                              placeholder="0"
                              disabled={saving}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Add Button Text (optional)
                            </label>
                            <input
                              type="text"
                              value={section.addButtonText || ''}
                              onChange={(e) => {
                                const updated = [...sections];
                                updated[sectionIdx].addButtonText = e.target.value;
                                setSections(updated);
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                              placeholder="e.g., Add Another Project"
                              disabled={saving}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold text-gray-700">
                        Fields ({section.fields.length})
                      </h4>
                      <button
                        onClick={() => openFieldModal(sectionIdx)}
                        className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        disabled={saving}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Field
                      </button>
                    </div>

                    {section.fields.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No fields in this section</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {section.fields.map((field, fieldIdx) => (
                          <div key={fieldIdx} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 bg-white transition-all group">
                            <div className="text-gray-400 cursor-move">
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-gray-500">
                                  #{fieldIdx + 1}
                                </span>
                                <p className="font-semibold text-gray-900 text-sm">{field.label}</p>
                                {field.required && (
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                    Required
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600">
                                Type: <span className="font-medium">{field.type}</span>
                              </p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => editFieldHandler(sectionIdx, fieldIdx)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                disabled={saving}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeField(sectionIdx, fieldIdx)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                disabled={saving}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex gap-3">
                <button
                  onClick={save}
                  disabled={saving || !!slugError}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {saving ? 'Saving...' : isEditMode ? 'Update Form' : 'Create Form'}
                </button>
                <button
                  onClick={() => navigate('/forms')}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          {preview && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6 max-h-[calc(100vh-100px)]">
              <div className="bg-linear-to-r from-blue-600 to-blue-700 p-6 text-white">
                <h3 className="text-sm font-semibold mb-2 opacity-90">LIVE PREVIEW</h3>
                <h4 className="font-bold text-2xl">{name || 'Form Name'}</h4>
                {desc && <p className="text-blue-100 mt-2 text-sm">{desc}</p>}
                {slug && (
                  <p className="text-blue-200 mt-3 text-xs font-mono">
                    URL: /form/{slug}
                  </p>
                )}
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(100vh-280px)]">
                {totalFields === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="font-medium">No fields to preview</p>
                    <p className="text-sm mt-1">Add fields to see them here</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {sections.map((section, sectionIdx) => (
                      section.fields.length > 0 && (
                        <div key={sectionIdx}>
                          {section.title && (
                            <div className="mb-4 pb-2 border-b-2 border-blue-200 flex items-center justify-between">
                              <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                              {section.repeatable && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                                  Repeatable {section.maxEntries > 0 ? `(max ${section.maxEntries})` : ''}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="space-y-5">
                            {section.fields.map((field, fieldIdx) => (
                              <div key={fieldIdx}>
                                <label className="block mb-2">
                                  <span className="text-sm font-semibold text-gray-700 flex items-center">
                                    <span className="text-gray-400 mr-2">{fieldIdx + 1}.</span>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                  </span>
                                </label>
                                <DynamicField 
                                  field={{ ...field, id: `${sectionIdx}-${fieldIdx}` }} 
                                  value="" 
                                  onChange={() => {}} 
                                />
                                {field.helpText && (
                                  <p className="text-xs text-gray-500 mt-1.5">{field.helpText}</p>
                                )}
                              </div>
                            ))}
                          </div>
                          {section.repeatable && (
                            <button
                              className="mt-4 w-full px-4 py-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 font-medium text-sm flex items-center justify-center"
                              disabled
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {section.addButtonText || 'Add Another Entry'}
                            </button>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {showModal && (
          <FieldModal
            onClose={() => { 
              setShowModal(false); 
              setEditField(null); 
            }}
            onSave={addField}
            initial={editField && editField.fieldIdx !== null 
              ? sections[editField.sectionIdx].fields[editField.fieldIdx] 
              : null
            }
          />
        )}
      </div>
    </Layout>
  );
};

export default FormEditor;