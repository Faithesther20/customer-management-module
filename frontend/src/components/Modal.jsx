import { useState, useEffect } from 'react';
import api from '../api/axios';
import Button from './Button';
import Loader from './Loader';

export default function Modal({ isOpen, onClose, title, customer = null, onCompleted }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company_name: customer.company_name || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company_name: '',
      });
    }

    setErrors({});
    setGeneralError('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError('');

    try {
      let res;
      if (customer) {
        res = await api.put(`/customers/${customer.id}`, formData);
      } else {
        res = await api.post('/customers', formData);
      }

      if (res.data.success) {
        onCompleted(res.data.message || (customer ? 'Customer updated successfully.' : 'Customer added successfully.'));
        onClose();
      } else {
        setGeneralError(res.data.message || 'Something went wrong.');
      }

    } catch (err) {
      if (err.response) {
        if (err.response.status === 422) {
          setErrors(err.response.data.errors || {});
        } else {
          setGeneralError(err.response.data.message || 'An error occurred.');
        }
      } else {
        setGeneralError('Server is not responding.');
      }
      console.error('Request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-start pt-10 bg-black/30 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-800">{title}</h2>

        {generalError && (
          <div className="mb-4 px-4 py-2 rounded bg-red-100 text-red-700 font-medium">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {['name', 'email', 'phone', 'company_name'].map((field) => (
            <div key={field}>
              <label className="block text-gray-700 font-medium mb-1 capitalize">
                {field.replace('_', ' ')}
              </label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={`Enter ${field.replace('_', ' ')}`}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field][0]}</p>}
            </div>
          ))}

          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" onClick={onClose} fullWidth={false} variant="danger">
              Cancel
            </Button>
            <Button type="submit" fullWidth={false}>
              {loading ? <Loader small /> : customer ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
