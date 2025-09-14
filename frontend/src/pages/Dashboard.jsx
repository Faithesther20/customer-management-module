import { useEffect, useState } from 'react';
import { FaUsers, FaUserPlus, FaBuilding } from 'react-icons/fa';
import api from '../api/axios';
import Loader from '../components/Loader';
import AdminLayout from '../layout/AdminLayout';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/customers/dashboard/summary');
      if (res.data.success) {
        setSummary(res.data.data);
      } else {
        setError(res.data.message || 'Failed to fetch summary');
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
      setError('An error occurred while fetching summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-center">
        <p className="text-red-500 font-semibold mb-4">{error}</p>
        <button
          onClick={fetchSummary}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Customers',
      value: summary?.total_customers ?? 0,
      icon: <FaUsers className="text-white text-3xl" />,
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
    },
    {
      title: 'Customers Added Today',
      value: summary?.customers_today ?? 0,
      icon: <FaUserPlus className="text-white text-3xl" />,
      bg: 'bg-gradient-to-r from-green-400 to-green-500',
    },
    {
      title: 'Top 5 Companies',
      value: summary?.top_companies ?? [],
      icon: <FaBuilding className="text-white text-3xl" />,
      bg: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
    },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between p-6 rounded-xl shadow-lg ${card.bg} text-white`}
          >
            <div>
              <h3 className="text-lg font-medium">{card.title}</h3>
              {card.title !== 'Top 5 Companies' ? (
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              ) : card.value.length > 0 ? (
                <ul className="mt-2 list-disc list-inside text-white font-semibold">
                  {card.value.map((c, i) => (
                    <li key={i}>
                      {c.company_name} ({c.total})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 font-semibold">No companies yet</p>
              )}
            </div>
            <div>{card.icon}</div>
          </div>
        ))}
      </div>
    </>
  );
}
