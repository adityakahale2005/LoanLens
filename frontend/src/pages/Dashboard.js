import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { calculate } from '../utils/api';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#1e3a8a', '#93c5fd'];

export default function Dashboard() {
  const { user, logout }        = useAuth();
  const navigate                = useNavigate();
  const [form, setForm]         = useState({ principal: '', annualRate: '', tenureMonths: '' });
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showTable, setShowTable] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCalculate = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await calculate({
        principal: Number(form.principal),
        annualRate: Number(form.annualRate),
        tenureMonths: Number(form.tenureMonths)
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Format number as Indian currency
  const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  // Prepare chart data — sample every 12 months to keep chart clean
  const chartData = result?.schedule
    ?.filter((_, i) => i % 12 === 0 || i === result.schedule.length - 1)
    ?.map(row => ({
      month: `M${row.month}`,
      Balance: Math.round(row.closingBalance),
      Principal: Math.round(row.principal),
      Interest: Math.round(row.interest)
    }));

  const pieData = result ? [
    { name: 'Principal', value: result.emi * result.schedule.length - result.totalInterest },
    { name: 'Total Interest', value: result.totalInterest }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold">💰 LoanLens</h1>
        <div className="flex items-center gap-4">
          <span className="text-blue-200 text-sm">Welcome, {user?.name}</span>
          <button
            onClick={() => navigate('/history')}
            className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm transition-all"
          >History</button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm transition-all"
          >Logout</button>
          <button
            onClick={() => navigate('/compare')}
            className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm transition-all">
            Compare Loans
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">

        {/* Calculator Form */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">EMI Calculator</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Amount (₹)
              </label>
              <input
                name="principal" type="number" placeholder="e.g. 1000000"
                value={form.principal} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Interest Rate (%)
              </label>
              <input
                name="annualRate" type="number" placeholder="e.g. 8.5"
                value={form.annualRate} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenure (Months)
              </label>
              <input
                name="tenureMonths" type="number" placeholder="e.g. 240"
                value={form.tenureMonths} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          <button
            onClick={handleCalculate} disabled={loading}
            className="mt-4 bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-all disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate EMI'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Monthly EMI',     value: formatINR(result.emi),          color: 'bg-blue-900' },
                { label: 'Total Payment',   value: formatINR(result.totalPayment),  color: 'bg-blue-700' },
                { label: 'Total Interest',  value: formatINR(result.totalInterest), color: 'bg-blue-500' },
                { label: 'Crossover Month', value: `Month ${result.crossoverMonth}`,color: 'bg-indigo-600' },
              ].map((card) => (
                <div key={card.label} className={`${card.color} text-white rounded-2xl p-5 shadow`}>
                  <p className="text-blue-200 text-sm">{card.label}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              {/* Pie Chart */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-bold text-blue-900 mb-4">Principal vs Interest Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatINR(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Line Chart */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-bold text-blue-900 mb-4">Outstanding Balance Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatINR(v)} />
                    <Line type="monotone" dataKey="Balance" stroke="#1e3a8a" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Amortization Table Toggle */}
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-blue-900">Amortization Schedule</h3>
                <button
                  onClick={() => setShowTable(!showTable)}
                  className="text-blue-700 text-sm font-medium hover:underline"
                >
                  {showTable ? 'Hide Table' : 'Show Full Table'}
                </button>
              </div>

              {showTable && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-blue-900 text-white">
                        {['Month', 'Opening Balance', 'EMI', 'Principal', 'Interest', 'Closing Balance'].map(h => (
                          <th key={h} className="px-4 py-2 text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.map((row, i) => (
                        <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${row.month === result.crossoverMonth ? 'bg-yellow-50 font-semibold' : ''}`}>
                          <td className="px-4 py-2">{row.month}</td>
                          <td className="px-4 py-2">{formatINR(row.openingBalance)}</td>
                          <td className="px-4 py-2">{formatINR(row.emi)}</td>
                          <td className="px-4 py-2 text-blue-700">{formatINR(row.principal)}</td>
                          <td className="px-4 py-2 text-red-500">{formatINR(row.interest)}</td>
                          <td className="px-4 py-2">{formatINR(row.closingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}