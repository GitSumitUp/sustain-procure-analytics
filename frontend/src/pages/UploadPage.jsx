import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertTriangle, FileText, Loader2 } from 'lucide-react';

export default function UploadPage() {
  const [uploadStates, setUploadStates] = useState({
    sap: { loading: false, success: null, error: null, fileName: "" },
    utility: { loading: false, success: null, error: null, fileName: "" },
    travel: { loading: false, success: null, error: null, fileName: "" },
  });

  const handleFileChange = (e, sourceKey) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStates((prev) => ({
      ...prev,
      [sourceKey]: { ...prev[sourceKey], fileName: file.name, success: null, error: null },
    }));
  };

  const executeUpload = async (sourceKey, endpoint) => {
    const fileInput = document.getElementById(`file-${sourceKey}`);
    const file = fileInput?.files[0];

    if (!file) {
      setUploadStates((prev) => ({
        ...prev,
        [sourceKey]: { ...prev[sourceKey], error: "Please choose a valid CSV file before attempting transmission." },
      }));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadStates((prev) => ({
      ...prev,
      [sourceKey]: { ...prev[sourceKey], loading: true, error: null, success: null },
    }));

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/upload/${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadStates((prev) => ({
        ...prev,
        [sourceKey]: {
          ...prev[sourceKey],
          loading: false,
          success: response.data.message || "File ledger normalization completed successfully.",
        },
      }));
    } catch (err) {
      console.error(err);
      const backendError = err.response?.data?.error || "Network error: Pipeline target is unreachable.";
      setUploadStates((prev) => ({
        ...prev,
        [sourceKey]: { ...prev[sourceKey], loading: false, error: backendError },
      }));
    }
  };

  // Helper dictionary to cleanly map unique section elements 
  const sourcesConfig = [
    { key: 'sap', name: 'SAP ERP Fuel Procurement', endpoint: 'sap', desc: 'Accepts raw SAP grid dumps with German technical headers (Menge, MEINS).' },
    { key: 'utility', name: 'Utility Grid Electricity', endpoint: 'utility', desc: 'Accepts utility billing statement portal exports containing multi-rate data fields.' },
    { key: 'travel', name: 'Corporate Travel Management', endpoint: 'travel', desc: 'Accepts SAP Concur Intelligence travel ledgers containing flight route IATA codes.' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Data Ingestion Engine</h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload messy raw data segments directly into our carbon normalization processing pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {sourcesConfig.map((source) => {
          const state = uploadStates[source.key];

          return (
            <div key={source.key} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{source.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{source.desc}</p>
                <div className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 mt-2 rounded w-fit">
                  POST /api/upload/{source.endpoint}
                </div>
              </div>

              <label
                htmlFor={`file-${source.key}`}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer flex flex-col items-center justify-center transition-all ${state.fileName ? 'border-indigo-400 bg-indigo-50/20' : 'border-gray-300 hover:border-indigo-400 hover:bg-slate-50'
                  }`}
              >
                <input
                  type="file"
                  id={`file-${source.key}`}
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, source.key)}
                  disabled={state.loading}
                />

                {state.fileName ? (
                  <div className="flex items-center text-slate-700 space-x-2 text-sm font-medium">
                    <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <span className="truncate max-w-[180px] font-mono text-xs">{state.fileName}</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-600">Choose CSV File</span>
                  </>
                )}
              </label>

              {/* Server Status Feedback Logs */}
              {state.success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{state.success}</span>
                </div>
              )}

              {state.error && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-xl flex items-start">
                  <AlertTriangle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="font-medium break-all">{state.error}</span>
                </div>
              )}

              {/* Dynamic Action Trigger Trigger Button */}
              <button
                disabled={state.loading}
                onClick={() => executeUpload(source.key, source.endpoint)}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold py-2 px-4 rounded-xl shadow-sm text-sm transition flex items-center justify-center"
              >
                {state.loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Normalizing Elements...
                  </>
                ) : (
                  'Ingest Asset Data'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}