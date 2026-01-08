import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Save, Edit, Trash2, Eye, FileText } from "lucide-react";

import Layout from "../../components/layout/Layout";
import FieldModal from "../../components/forms/FieldModal";
import DynamicField from "../../components/forms/DynamicField";
import Loader from "../../components/common/Loader";
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
  const [fields, setFields] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadForm();
    }
  }, [id, isEditMode]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const form = await api.getForm(id);
      if (form) {
        setName(form.form_name);
        setDesc(form.description);
        setCategory(form.category);
        setStatus(form.status);
        setFields(form.fields);
      }
    } catch (error) {
      console.error('Error loading form:', error);
      alert('Error loading form: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addField = (data) => {
    if (editIdx !== null) {
      const updated = [...fields];
      updated[editIdx] = data;
      setFields(updated);
      setEditIdx(null);
    } else {
      setFields([...fields, data]);
    }
    setShowModal(false);
  };

  const save = async () => {
    if (!name.trim() || fields.length === 0) {
      alert('Please enter form name and add at least one field');
      return;
    }

    try {
      setSaving(true);
      const data = { form_name: name, description: desc, category, status, fields };

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

  if (loading) {
    return <Loader message="Loading form..." />;
  }

  return (
    <Layout showSidebar={true} sidebarType="admin">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isEditMode ? 'Edit' : 'Create'} Form
            </h1>
            <p className="text-gray-600">Design your custom form with various field types</p>
          </div>
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 h-fit"
          >
            <Eye className="w-4 h-4 mr-2" />
            {preview ? 'Hide' : 'Show'} Preview
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Form Details</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Form Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Job Application"
                  className="w-full px-4 py-2.5 border rounded-lg"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Brief description"
                  rows={3}
                  className="w-full px-4 py-2.5 border rounded-lg"
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg"
                    disabled={saving}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg"
                    disabled={saving}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">Fields</h3>
                <button
                  onClick={() => { setEditIdx(null); setShowModal(true); }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={saving}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No fields yet. Click "Add Field" to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{f.label}</p>
                          {f.required && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Type: {f.type}</p>
                      </div>
                      <button
                        onClick={() => { setEditIdx(i); setShowModal(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        disabled={saving}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setFields(fields.filter((_, idx) => idx !== i))}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Saving...' : isEditMode ? 'Update Form' : 'Create Form'}
              </button>
              <button
                onClick={() => navigate('/forms')}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>

          {preview && (
            <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              <div className="space-y-4">
                <div className="pb-4 border-b">
                  <h4 className="font-bold text-xl">{name || 'Form Name'}</h4>
                  {desc && <p className="text-sm text-gray-600 mt-1">{desc}</p>}
                </div>
                {fields.map((f, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium mb-2">
                      {f.label}
                      {f.required && <span className="text-red-600 ml-1">*</span>}
                    </label>
                    <DynamicField field={{ ...f, id: i }} value="" onChange={() => {}} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {showModal && (
          <FieldModal
            onClose={() => { setShowModal(false); setEditIdx(null); }}
            onSave={addField}
            initial={editIdx !== null ? fields[editIdx] : null}
          />
        )}
      </div>
    </Layout>
  );
};

export default FormEditor;