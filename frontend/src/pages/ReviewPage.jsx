import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, AlertCircle, Lock, RefreshCw } from 'lucide-react';

const ReviewPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/emissions/records');
      setRecords(response.data);
    } catch (err) {
      console.error("Error downloading data ledger rows", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setProcessingId(id);
    try {
      await axios.patch(`http://127.0.0.1:8000/api/emissions/records/${id}/review`, { action });
      // Optimized state adjustment - modifies local array list instead of making another full GET call
      setRecords(prev => prev.map(rec => {
        if (rec.id === id) {
          return {
            ...rec,
            status: action === 'APPROVE' ? 'APPROVED' : 'FLAGGED',
            is_suspicious: action === 'APPROVE' ? false : rec.is_suspicious,
            locked: action === 'APPROVE' ? true : false
          };
        }
        return rec;
      }));
    } catch (err) {
      alert(`Verification routing update error encountered,${err}`);
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchRecords()
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Audit Review Ledger</h1>
          <p className="text-slate-500 text-sm mt-1">Verify parsed multi-source ingestion rows against carbon factors</p>
        </div>
        <button
          onClick={fetchRecords}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg shadow-sm flex items-center text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 mr-2 text-gray-500 ${loading ? 'animate-spin' : ''}`} /> Refresh Rows
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Streaming ledger blocks...</div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Category / Context</th>
                  <th className="px-6 py-4">Raw Data</th>
                  <th className="px-6 py-4">Normalized Footprint</th>
                  <th className="px-6 py-4">Status & Flags</th>
                  <th className="px-6 py-4 text-right">Review Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {records.map((row) => (
                  <tr key={row.id} className={`hover:bg-slate-50/70 transition-colors ${row.is_suspicious ? 'bg-amber-50/40' : ''}`}>

                    {/* Source Tag Column */}
                    <td className="px-6 py-4 whitespace-nowrap font-bold">
                      <span className={`px-2.5 py-1 rounded-md text-xs tracking-wide ${row.source_type === 'SAP' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        row.source_type === 'UTILITY' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                          'bg-teal-50 text-teal-700 border border-teal-100'
                        }`}>
                        {row.source_type}
                      </span>
                    </td>

                    {/* Category Description */}
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {row.category}
                    </td>

                    {/* Raw Quantity metrics */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono">
                      {row.quantity.toLocaleString()} <span className="text-xs">{row.unit}</span>
                    </td>

                    {/* Normalized GHG Carbon Target value */}
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 font-mono">
                      {row.normalized_quantity.toFixed(4)} <span className="text-xs text-slate-400 font-normal">{row.normalized_unit}</span>
                    </td>

                    {/* Conditional Status Badges */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                          {row.status}
                        </span>
                        {row.is_suspicious && (
                          <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 animate-pulse">
                            <AlertCircle className="w-3 h-3 mr-1" /> Outlier Anomaly
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Interactive Button Logic Blocks */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                      {row.locked ? (
                        <span className="inline-flex items-center text-slate-400 font-normal bg-gray-100 px-3 py-1 rounded-md">
                          <Lock className="w-3.5 h-3.5 mr-1" /> Immutable Audit Locked
                        </span>
                      ) : (
                        <div className="flex justify-end items-center space-x-2">
                          <button
                            disabled={processingId !== null}
                            onClick={() => handleAction(row.id, 'APPROVE')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium shadow-sm flex items-center transition disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                          </button>
                          <button
                            disabled={processingId !== null}
                            onClick={() => handleAction(row.id, 'REJECT')}
                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg font-medium shadow-sm flex items-center transition disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1 text-red-500" /> Flag
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewPage