import { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FileActionModal from '../components/FileActionModal';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [search, setSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/customers', { params: { page, search, company: filterCompany } });
      const data = res.data?.data?.data || [];
      setCustomers(data);
      setPagination({
        current_page: res.data?.data?.current_page || 1,
        last_page: res.data?.data?.last_page || 1,
      });
    } catch (err) {
      console.error(err);
      showMessage('error', 'An error occurred while fetching customers.');
      setCustomers([]); // fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, filterCompany]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      const res = await api.delete(`/customers/${id}`);
      if (res.data.success) {
        const updated = customers.filter(c => c.id !== id);
        setCustomers(updated);
        showMessage('success', res.data.message || 'Customer deleted successfully.');

        // Fetch previous page if last item on current page is deleted
        if (updated.length === 0 && pagination.current_page > 1) {
          fetchCustomers(pagination.current_page - 1);
        }
      } else {
        showMessage('error', res.data.message || 'Failed to delete customer.');
      }
    } catch (err) {
      console.error(err);
      showMessage('error', 'An error occurred while deleting customer.');
    }
  };

  const openAddModal = () => {
    setCurrentCustomer(null);
    setModalOpen(true);
  };

  const openEditModal = (customer) => {
    setCurrentCustomer(customer);
    setModalOpen(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Customers</h1>

      {/* Feedback Message */}
      {message.text && (
        <div className={`mb-4 px-4 py-2 rounded ${message.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 mb-3 md:mb-0 w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        <input
          type="text"
          placeholder="Filter by company..."
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        <div className="flex space-x-2 mt-3 md:mt-0">
          <Button onClick={openAddModal}>Add Customer</Button>
          <Button onClick={() => { setModalType('import'); setFileModalOpen(true); }}>Import</Button>
          <Button onClick={() => { setModalType('export'); setFileModalOpen(true); }}>Export</Button>
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="flex justify-center items-center h-96"><Loader /></div>
      ) : customers.length === 0 ? (
        <div className="text-center py-20 bg-white shadow rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg font-medium">No customers found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg shadow-sm bg-white">
            <thead className="bg-blue-600 text-white rounded-t-lg">
              <tr>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-center font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4">{c.name}</td>
                  <td className="px-6 py-4">{c.email}</td>
                  <td className="px-6 py-4">{c.phone}</td>
                  <td className="px-6 py-4">{c.company_name}</td>
                  <td className="px-6 py-4 flex justify-center space-x-3">
                    <button
                      onClick={() => openEditModal(c)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >Edit</button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-end mt-6 space-x-3">
            <button
              disabled={pagination.current_page <= 1}
              onClick={() => fetchCustomers(pagination.current_page - 1)}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
            >Prev</button>
            <span className="px-4 py-2 text-gray-700 font-medium">{pagination.current_page} / {pagination.last_page}</span>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchCustomers(pagination.current_page + 1)}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
            >Next</button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <Modal
          key={currentCustomer?.id || 'new'}
          title={currentCustomer ? 'Edit Customer' : 'Add Customer'}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          customer={currentCustomer}
          onCompleted={(msg) => {
            showMessage('success', msg);
            fetchCustomers(pagination.current_page);
          }}
        />
      )}

      {/* File Modal */}
      {fileModalOpen && (
        <FileActionModal
          type={modalType}
          isOpen={fileModalOpen}
          onClose={() => setFileModalOpen(false)}
          onCompleted={(msg) => {
            showMessage('success', msg);
            fetchCustomers(pagination.current_page);
          }}
        />
      )}
    </div>
  );
}
