import { useEffect, useState } from 'react';
import axios from 'axios';
import { Database, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    total_carbon_ntco2e: 0,
    total_records: 0,
    active_sources: 0,
    suspicious_anomalies: 0,
    failed_validations: 0,
  })
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/emissions/summary');
      setMetrics(response.data);
      setError(null);
    } catch (err) {
      setError('Unable to securely establish synchronization with carbon registry database.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        <RefreshCw className="animate-spin mr-2" /> Extracting aggregated systems ledger metrics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center shadow">
        <AlertTriangle className="mr-3 text-red-500 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">ESG Ingestion Summary</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time normalization system summary dashboard metrics</p>
        </div>
        <button
          onClick={fetchMetrics}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-sm flex items-center transition text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4 mr-2 text-gray-500" /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 p-6 rounded-2xl shadow-lg border border-emerald-800 text-white relative overflow-hidden">
          <div className="absolute right-4 bottom-4 opacity-10">
            <Database className="w-24 h-24" />
          </div>
          <p className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Gross Normalized Ledger</p>
          <p className="text-3xl font-black mt-2 tracking-tight">{metrics.total_carbon_mtco2e}</p>
          <p className="text-xs text-emerald-300 font-semibold mt-1">Metric Tons CO2e Stored</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Active Ingested Files</span>
            <p className="text-3xl font-extrabold text-gray-900 mt-2">{metrics.active_sources}</p>
          </div>
          <div className="flex items-center text-xs text-indigo-600 font-medium mt-4 bg-indigo-50 px-2.5 py-1 rounded-md w-fit">
            <Database className="w-3.5 h-3.5 mr-1" /> SAP / Utility / Concur Sources
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Suspicious Outliers</span>
            <p className={`text-3xl font-extrabold mt-2 ${metrics.suspicious_anomalies > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
              {metrics.suspicious_anomalies}
            </p>
          </div>
          <div className={`flex items-center text-xs font-medium mt-4 px-2.5 py-1 rounded-md w-fit ${metrics.suspicious_anomalies > 0 ? 'bg-amber-50 text-amber-700 animate-pulse' : 'bg-gray-50 text-gray-600'}`}>
            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Requires Accountant Audit
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Pipeline Processing Rows</span>
            <p className="text-3xl font-extrabold text-gray-900 mt-2">{metrics.total_records}</p>
          </div>
          <div className="flex items-center text-xs text-emerald-700 font-medium mt-4 bg-emerald-50 px-2.5 py-1 rounded-md w-fit">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Successfully Normalized
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard