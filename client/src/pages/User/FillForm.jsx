import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, AlertCircle } from "lucide-react";

import Layout from "../../components/layout/Layout";
import DynamicField from "../../components/forms/DynamicField";
import Loader from "../../components/common/Loader";
import api from "../../services/api";


const FillForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadForm();
  }, [id]);

  useEffect(() => {
    if (form) {
      const filled = Object.keys(values).filter(
        k => values[k] && values[k].length !== 0
      ).length;
      setProgress(
        form.fields.length > 0 
          ? Math.round((filled / form.fields.length) * 100) 
          : 0
      );
    }
  }, [values, form]);

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

  const handleChange = (fieldId, value) => {
    setValues({ ...values, [fieldId]: value });
    if (errors[fieldId]) {
      setErrors({ ...errors, [fieldId]: null });
    }
  };

  const submit = async () => {
    const newErrors = {};
    form.fields.forEach(f => {
      if (
        f.required && 
        (!values[f.id] || (Array.isArray(values[f.id]) && values[f.id].length === 0))
      ) {
        newErrors[f.id] = 'Required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await api.submitResponse(id, values);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Error submitting form: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading form..." />;
  }

  if (error || !form) {
    return <ErrorMessage message={error || "Form Not Found"} backPath="/user" />;
  }

  if (submitted) {
    return (
      <Layout showSidebar={true} sidebarType="user">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-2xl w-full text-center py-12 bg-white rounded-xl shadow-lg p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Submitted Successfully!</h2>
            <p className="text-gray-600 mb-8">Thank you for your response.</p>
            <button
              onClick={() => navigate('/user')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Forms
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true} sidebarType="user">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">{form.form_name}</h2>
            {form.description && <p className="text-blue-100">{form.description}</p>}
          </div>

          <div className="p-2 bg-gray-100">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="px-2 pb-2 bg-gray-100">
            <p className="text-xs text-gray-600 text-right">{progress}% complete</p>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              {form.fields.map((f, i) => (
                <div key={f.id} className="pb-6 border-b last:border-0">
                  <label className="block text-sm font-semibold mb-3 text-gray-700">
                    <span className="text-gray-400 mr-2">{i + 1}.</span>
                    {f.label}
                    {f.required && <span className="text-red-600 ml-1">*</span>}
                  </label>
                  <DynamicField
                    field={f}
                    value={values[f.id]}
                    onChange={handleChange}
                    error={errors[f.id]}
                  />
                  {f.helpText && (
                    <p className="text-sm text-gray-600 mt-1">{f.helpText}</p>
                  )}
                  {errors[f.id] && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors[f.id]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={submit}
              disabled={submitting}
              className="w-full mt-8 flex items-center justify-center px-8 py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Form'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FillForm;