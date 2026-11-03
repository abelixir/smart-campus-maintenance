import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const initialState = {
  title: '',
  description: '',
  category: 'Electrical',
  location: '',
  priority: 'Medium',
};

export default function ComplaintForm() {
  const [formData, setFormData] = useState(initialState);
  const [imageName, setImageName] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Complaint submitted:', formData);
    alert('Complaint submitted successfully.');
    setFormData(initialState);
    setImageName('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label="Complaint Title"
          id="title"
          name="title"
          placeholder="e.g. Broken lighting in lecture hall"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <option>Electrical</option>
            <option>Plumbing</option>
            <option>HVAC</option>
            <option>Security</option>
            <option>Cleaning</option>
            <option>Furniture</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows="5"
          value={formData.description}
          onChange={handleChange}
          placeholder="Provide detailed information about the issue, impact, and any relevant observations."
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          required
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label="Location / Building"
          id="location"
          name="location"
          placeholder="e.g. Engineering Block A, Floor 2"
          value={formData.location}
          onChange={handleChange}
          required
        />

        <div className="space-y-2">
          <label htmlFor="priority" className="block text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="photo" className="block text-sm font-medium text-slate-700">
          Photo Upload
        </label>
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition hover:border-blue-300 hover:bg-blue-50">
          <span>{imageName || 'Upload a reference image'}</span>
          <span className="rounded-lg bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm">Browse</span>
          <input
            id="photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => setImageName(event.target.files?.[0]?.name || '')}
          />
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" className="sm:min-w-32">
          Save Draft
        </Button>
        <Button type="submit" className="sm:min-w-40">
          Submit Complaint
        </Button>
      </div>
    </form>
  );
}
