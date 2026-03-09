import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculate } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Compare() {
  const navigate = useNavigate();

  const emptyForm = { principal: '', annualRate: '', tenureMonths: '' };
  const [formA, setFormA] = useState(emptyForm);
  const [formB, setFormB] = useState(emptyForm);
  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(n);

  const handleCompare = async () => {
    setError('');

    // Validate both forms
    const fieldsA = Object.values(formA).every(v => v !== '');
    const fieldsB = Object.values(formB).every(v => v !== '');
    if (!fieldsA || !fieldsB) {
      setError('Please fill all fields in both loans');
      return;
    }

    setLoading(true);
    try {
      // Calculate both loans simultaneously
      const [resA, resB] = await Promise.all([
        calculate({
          principal: Number(formA.principal),
          annualRate: Number(formA.annualRate),
          tenureMonths: Number(formA.tenureMonths)
        }),
        calculate({
          principal: Number(formB.principal),
          annualRate: Number(formB.annualRate),
          tenureMonths: Number(formB.tenureMonths)
        })
      ]);

      setResultA(resA.data);
      setResultB(resB.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  // Determine winner based on total interest paid
  const getWinner = () => {
    if (!resultA || !resultB) return null;
    if (resultA.totalInterest < resultB.totalInterest) return 'A';
    if (resultB.totalInterest < resultA.totalInterest) return 'B';
    return 'TIE';
  };

  const winner = getWinner();

  // Bar chart data
  const chartData = resultA && resultB ? [
    {
      name: 'Monthly EMI',
      'Loan A': resultA.emi,
      'Loan B': resultB.emi
    },
    {
      name: 'Total Interest',
      'Loan A': resultA.totalInterest,
      'Loan B': resultB.totalInterest
    },
    {
      name: 'Total Payment',
      'Loan A': resultA.totalPayment,
      'Loan B': resultB.totalPayment
    }
  ] : [];

  const LoanForm = ({ label, form, setForm }) => (
    <div className={`bg-white rounded-2xl shadow p-6 border-t-4 ${
      label === 'Loan A' ? 'border-blue-900' : 'border-indigo-500'
    }`}>
      <h3 className={`text-lg font-bold mb-4 ${
        label === 'Loan A' ? 'text-blue-900' : 'text-indigo-600'
      }`}>{label}</h3>

      <div className="space-y-3">
        {[
          { name: 'principal',    label: 'Loan Amount (₹)',       placeholder: 'e.g. 1000000' },
          { name: 'annualRate',   label: 'Annual Interest Rate (%)', placeholder: 'e.g. 8.5' },
          { name: 'tenureMonths', label: 'Tenure (Months)',        placeholder: 'e.g. 240' },
        ].map(field => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type="number"
              name={field.name}
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const ResultCard = ({ result, label, isWinner }) => (
    <div className={`bg-white rounded-2xl shadow p-6 border-t-4 ${
      isWinner
        ? 'border-green-500 ring-2 ring-green-200'
        : label === 'Loan A' ? 'border-blue-900' : 'border-indigo-500'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-bold ${
          label === 'Loan A' ? 'text-blue-900' : 'text-indigo-600'
        }`}>{label}</h3>
        {isWinner && (
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
            ✓ BETTER DEAL
          </span>
        )}
      </div>

      <div className="space-y-3">
        {[
          { label: 'Monthly EMI',    value: formatINR(result.emi) },
          { label: 'Total Payment',  value: formatINR(result.totalPayment) },
          { label: 'Total Interest', value: formatINR(result.totalInterest), highlight: true },
          { label: 'Crossover Month', value: `Month ${result.crossoverMonth}` },
        ].map(item => (
          <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className={`font-bold ${item.highlight ? 'text-red-500' : 'text-blue-900'}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold">💰 LoanLens</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm transition-all"
        >
          ← Back to Calculator
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-blue-900">Loan Comparison</h2>
          <p className="text-gray-500 mt-1">
            Enter two loan options to find out which one costs you less
          </p>
        </div>

        {/* Input Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <LoanForm label="Loan A" form={formA} setForm={setFormA} />
          <LoanForm label="Loan B" form={formB} setForm={setFormB} />
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleCompare}
          disabled={loading}
          className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition-all disabled:opacity-50 mb-8"
        >
          {loading ? 'Comparing...' : 'Compare Loans'}
        </button>

        {/* Results */}
        {resultA && resultB && (
          <>
            {/* Winner Banner */}
            <div className={`rounded-2xl p-5 mb-6 text-center ${
              winner === 'TIE'
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-green-50 border border-green-200'
            }`}>
              {winner === 'TIE' ? (
                <p className="text-yellow-700 font-bold text-lg">
                  🤝 Both loans cost the same total interest
                </p>
              ) : (
                <>
                  <p className="text-green-700 font-bold text-lg">
                    ✅ Loan {winner} is the better deal
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    You save {formatINR(Math.abs(resultA.totalInterest - resultB.totalInterest))} in interest
                    compared to Loan {winner === 'A' ? 'B' : 'A'}
                  </p>
                </>
              )}
            </div>

            {/* Result Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ResultCard
                result={resultA}
                label="Loan A"
                isWinner={winner === 'A'}
              />
              <ResultCard
                result={resultB}
                label="Loan B"
                isWinner={winner === 'B'}
              />
            </div>

            {/* Bar Chart Comparison */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-bold text-blue-900 mb-4">Side-by-Side Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} barGap={8}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(v) => formatINR(v)} />
                  <Legend />
                  <Bar dataKey="Loan A" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Loan B" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}