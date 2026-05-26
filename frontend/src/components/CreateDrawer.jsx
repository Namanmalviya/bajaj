import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';

export default function CreateDrawer({ isOpen, onClose, onSubmit, submitting }) {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    customerEmail: '',
    priority: 'low' // default to low
  });

  const [errors, setErrors] = useState({});

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        subject: '',
        description: '',
        customerEmail: '',
        priority: 'low'
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear inline error when user edits
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required.';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required.';
    }
    
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required.';
    } else {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(formData.customerEmail)) {
        newErrors.customerEmail = 'Please provide a valid email format (e.g. name@example.com).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm() || submitting) return;
    
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Dark backdrop overlay */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        {/* Drawer slide-in panel */}
        <div className="w-screen max-w-md bg-white border-l border-stone-200 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out translate-x-0">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display">
                Create Support Ticket
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Submit a new support ticket to the triage board
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
            
            {/* Subject Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="subject" className="text-xs font-bold text-slate-600 uppercase tracking-wide font-sans">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                disabled={submitting}
                placeholder="e.g. Can't connect to server"
                className={`w-full bg-stone-50 border text-slate-700 text-sm rounded-lg px-3.5 py-2.5 font-sans focus:outline-none focus:ring-1 focus:bg-white transition-all ${
                  errors.subject
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                    : 'border-stone-200 focus:ring-slate-400'
                }`}
              />
              {errors.subject && (
                <span className="flex items-center gap-1 text-xs text-rose-600 font-sans font-medium mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.subject}
                </span>
              )}
            </div>

            {/* Customer Email Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="customerEmail" className="text-xs font-bold text-slate-600 uppercase tracking-wide font-sans">
                Customer Email
              </label>
              <input
                type="text"
                id="customerEmail"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                disabled={submitting}
                placeholder="customer@domain.com"
                className={`w-full bg-stone-50 border text-slate-700 text-sm rounded-lg px-3.5 py-2.5 font-sans focus:outline-none focus:ring-1 focus:bg-white transition-all ${
                  errors.customerEmail
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                    : 'border-stone-200 focus:ring-slate-400'
                }`}
              />
              {errors.customerEmail && (
                <span className="flex items-center gap-1 text-xs text-rose-600 font-sans font-medium mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.customerEmail}
                </span>
              )}
            </div>

            {/* Priority Selector */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="priority" className="text-xs font-bold text-slate-600 uppercase tracking-wide font-sans">
                Priority
              </label>
              <div className="relative">
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={submitting}
                  className="appearance-none w-full bg-stone-50 border border-stone-200 text-slate-700 text-sm rounded-lg px-3.5 py-2.5 pr-10 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white font-sans transition-all"
                >
                  <option value="low">Low (72 hours target)</option>
                  <option value="medium">Medium (24 hours target)</option>
                  <option value="high">High (4 hours target)</option>
                  <option value="urgent">Urgent (1 hour target)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Description Textarea */}
            <div className="flex flex-col gap-1.5 flex-1 min-h-[140px]">
              <label htmlFor="description" className="text-xs font-bold text-slate-600 uppercase tracking-wide font-sans">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                disabled={submitting}
                placeholder="Provide details about the issue..."
                className={`w-full flex-1 bg-stone-50 border text-slate-700 text-sm rounded-lg px-3.5 py-2.5 font-sans focus:outline-none focus:ring-1 focus:bg-white resize-none transition-all ${
                  errors.description
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                    : 'border-stone-200 focus:ring-slate-400'
                }`}
              />
              {errors.description && (
                <span className="flex items-center gap-1 text-xs text-rose-600 font-sans font-medium mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.description}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-slate-700 font-sans font-semibold text-sm py-2.5 rounded-lg active:scale-98 transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-sans font-semibold text-sm py-2.5 rounded-lg active:scale-98 transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
