import React, { useState } from 'react';
import { Shield, BookOpen, Activity, GitFork, FileText, Lock, EyeOff, HardDrive } from 'lucide-react';
import OrganGuides from './components/OrganGuides.jsx';
import SymptomTracker from './components/SymptomTracker.jsx';
import PedigreeTree from './components/PedigreeTree.jsx';
import React from 'react';
import './App.css'; // <-- Add this line

export default function App() {
  return (
    <div>
      {/* Your app components */}
    </div>
  );
}
export default function App() {
  const [activeTab, setActiveTab] = useState('landing');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Zero-Tracking Privacy Header */}
      <div className="bg-emerald-900 text-emerald-100 text-xs px-4 py-2 flex items-center justify-between shadow-inner">
        <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>100% Privacy Guaranteed:</strong> No tracking cookies, no accounts, and zero remote servers. All data stays inside your browser.
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
              <div className="bg-sky-600 text-white p-2 rounded-xl shadow-md">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-none">Charak</h1>
                <span className="text-xs text-slate-500 font-medium">Local Self-Exam & History</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex space-x-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('guides')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'guides' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Self-Exam Guides</span>
              </button>

              <button
                onClick={() => setActiveTab('tracker')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'tracker' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Symptom Tracker</span>
              </button>

              <button
                onClick={() => setActiveTab('pedigree')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'pedigree' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitFork className="w-4 h-4" />
                <span>Family Tree</span>
              </button>

              <button
                onClick={() => setActiveTab('export')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'export' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Doctor Export</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'landing' && (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8 max-w-3xl mx-auto">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                Open Source • Offline First • Zero Tracking
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                Proactive Health Monitoring Without Sacrificing Privacy
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Learn organ self-examinations, log local body changes securely, and map your family medical pedigree—100% saved in your browser's private memory.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={() => setActiveTab('guides')}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-sky-200 transition-all"
                >
                  Start Self-Exam Guides
                </button>
                <button
                  onClick={() => setActiveTab('pedigree')}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-xl border border-slate-300 shadow-sm transition-all"
                >
                  Build Family Tree
                </button>
              </div>
            </div>

            {/* Privacy Guarantee Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="bg-emerald-100 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                  <HardDrive className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Local-First Storage</h3>
                <p className="text-slate-600 text-sm">
                  Your symptom logs, photos, and medical history never leave your phone or computer. Everything is stored in IndexedDB.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="bg-sky-100 w-12 h-12 rounded-xl flex items-center justify-center text-sky-600 mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No Accounts Required</h3>
                <p className="text-slate-600 text-sm">
                  No sign-ups, passwords, or emails. Open the web app and use it instantly without handing over identifiable data.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                  <EyeOff className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Zero Tracking</h3>
                <p className="text-slate-600 text-sm">
                  Free of Google Analytics, ad pixels, or telemetry scripts. Built purely for accessibility and patient safety.
                </p>
              </div>
            </div>
          </div>
        )}

{/* Render Self-Exam Organ Guides */}
{activeTab === 'guides' && <OrganGuides />}

{/* Render Local Symptom Tracker */}
{activeTab === 'tracker' && <SymptomTracker />}

{/* Render Family Medical Pedigree Tree */}
{activeTab === 'pedigree' && <PedigreeTree />}

{/* Modules Coming Next */}
{activeTab !== 'landing' && activeTab !== 'guides' && activeTab !== 'tracker' && activeTab !== 'pedigree' && (
  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
    <div className="inline-flex p-4 rounded-full bg-sky-50 text-sky-600">
      <Shield className="w-8 h-8" />
    </div>
    <h3 className="text-2xl font-bold text-slate-900 capitalize">{activeTab} Module Ready For Next Step</h3>
    <p className="text-slate-600 max-w-md mx-auto">
      Phase 4 active! Paste Phase 5 (jsPDF Doctor Summary Export & Anonymized AI Prompt Bridge) next.
    </p>
  </div>
)}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 z-50 flex justify-around p-2">
        <button onClick={() => setActiveTab('guides')} className={`p-2 flex flex-col items-center ${activeTab === 'guides' ? 'text-sky-600' : 'text-slate-500'}`}>
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Guides</span>
        </button>
        <button onClick={() => setActiveTab('tracker')} className={`p-2 flex flex-col items-center ${activeTab === 'tracker' ? 'text-sky-600' : 'text-slate-500'}`}>
          <Activity className="w-5 h-5" />
          <span className="text-[10px]">Tracker</span>
        </button>
        <button onClick={() => setActiveTab('pedigree')} className={`p-2 flex flex-col items-center ${activeTab === 'pedigree' ? 'text-sky-600' : 'text-slate-500'}`}>
          <GitFork className="w-5 h-5" />
          <span className="text-[10px]">Tree</span>
        </button>
        <button onClick={() => setActiveTab('export')} className={`p-2 flex flex-col items-center ${activeTab === 'export' ? 'text-sky-600' : 'text-slate-500'}`}>
          <FileText className="w-5 h-5" />
          <span className="text-[10px]">Export</span>
        </button>
      </div>
    </div>
  );
}
