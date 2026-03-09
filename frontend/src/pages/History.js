import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCalculations, deleteCalculation } from '../utils/api';

export default function History() {
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const navigate                        = useNavigate();

  const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await getCalculations();
      setCalculations(res.data.calculations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCalculation(id);
      setCalculations(calculations.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">💰 LoanLens</h1>
        <button onClick={() => navigate('/dashboard')}
          className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm">
          ← Back to Calculator
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Calculation History</h2>

       {loading ? (
  <div className="space-y-4">
    {[1,2,3].map(i => (
      <div key={i} className="bg-white rounded-2xl shadow p-5 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(j => (
            <div key={j}>
              <div className="h-3 bg-gray-200 rounded mb-2 w-20"></div>
              <div className="h-5 bg-gray-300 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
) : calculations.length === 0 ? (
  <div className="text-center py-16">
    <p className="text-6xl mb-4">📊</p>
    <p className="text-gray-500 text-lg font-medium">No calculations yet</p>
    <p className="text-gray-400 text-sm mt-1">Go calculate your first EMI!</p>
    <button
      onClick={() => navigate('/dashboard')}
      className="mt-4 bg-blue-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-800"
    >
      Calculate Now
    </button>
  </div>
)  : (
          <div className="space-y-4">
            {calculations.map((c) => (
              <div key={c._id} className="bg-white rounded-2xl shadow p-5 flex justify-between items-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                  <div>
                    <p className="text-xs text-gray-500">Loan Amount</p>
                    <p className="font-bold text-blue-900">{formatINR(c.principal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rate / Tenure</p>
                    <p className="font-bold">{c.annualRate}% / {c.tenureMonths}mo</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Monthly EMI</p>
                    <p className="font-bold text-blue-700">{formatINR(c.emi)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Interest</p>
                    <p className="font-bold text-red-500">{formatINR(c.totalInterest)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="ml-4 text-red-400 hover:text-red-600 text-sm font-medium"
                >Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}