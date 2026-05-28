// import './App.css'
// import { Routes, Route } from "react-router-dom";
// import Dashboard from './pages/Dashboard';
// import ReviewPage from './pages/ReviewPage';
// import UploadPage from './pages/UploadPage';

// function App() {

//   return (
//     <div className="min-h-screen bg-slate-50 w-full pt-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         <Routes>
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/review" element={<ReviewPage />} />
//           <Route path="/upload-files" element={<UploadPage />} />
//         </Routes>
//       </div>
//     </div>
//   )
// }

// export default App


import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileSpreadsheet, UploadCloud, Leaf } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ReviewPage from './pages/ReviewPage';
import UploadPage from './pages/UploadPage';

export default function App() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 font-sans antialiased">

      {/* 1. FIXED ENTERPRISE SIDEBAR */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col border-r border-slate-800 shadow-xl z-10">

        {/* Platform Branding Header */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="bg-emerald-500 p-2 rounded-xl text-slate-950 shadow-md shadow-emerald-500/20">
            <Leaf className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight leading-none text-white">SourceEmit</h2>
            <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mt-1 block">Carbon Ledger</span>
          </div>
        </div>

        {/* Sidebar Links Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 mt-4">
          <Link
            to="/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${isActive('/dashboard')
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${isActive('/dashboard') ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
            <span>Analyst Dashboard</span>
          </Link>

          <Link
            to="/upload-files"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${isActive('/upload-files')
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
          >
            <UploadCloud className={`w-5 h-5 ${isActive('/upload-files') ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
            <span>Ingest Data Files</span>
          </Link>

          <Link
            to="/review"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${isActive('/review')
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`}
          >
            <FileSpreadsheet className={`w-5 h-5 ${isActive('/review') ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
            <span>Audit Review Ledger</span>
          </Link>
        </nav>

        {/* Footer Tenant Info Tag */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 font-medium">
          Logged in as: <span className="text-slate-300 block font-mono">esg_analyst_01</span>
        </div>
      </aside>

      {/* 2. MAIN PREMIUM BLUE-GREEN WORKSPACE WINDOW */}
      <main className="flex-1 overflow-y-auto px-8 py-10 bg-gradient-to-tr from-slate-200 via-cyan-100/50 to-emerald-100/60">
        <div className="max-w-6xl mx-auto backdrop-blur-sm rounded-3xl p-2">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/upload-files" element={<UploadPage />} />
          </Routes>
        </div>
      </main>

    </div>
  );
}