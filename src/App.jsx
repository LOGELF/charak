import React, { useState } from 'react';
import { Shield, BookOpen, Activity, GitFork, FileText, Lock, EyeOff, HardDrive } from 'lucide-react';
import OrganGuides from './components/OrganGuides.jsx';
import SymptomTracker from './components/SymptomTracker.jsx';
import PedigreeTree from './components/PedigreeTree.jsx';
import DoctorExport from './components/DoctorExport.jsx'; // <-- 1. Import DoctorExport
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Zero-Tracking Privacy Header */}
      <div className="bg-emerald-900 text-emerald-100 text-xs px-4 py-2 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>100% Privacy Guaranteed:</strong> No tracking cookies, no accounts, and zero remote servers.
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
              <div className="bg-sky-600 text-white p-2 rounded-xl shadow-md">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">Charak</span>
                <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full ml-2">Health</span>
              </div>
            </div>

            {/* Navigation Tabs (Including Step 5 Doctor Export) */}
            <nav className="flex space-x-1 sm:space-x-2">
              <button
                onClick={() => setActiveTab('guides')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'guides' ? 'bg-sky-50 text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Organ Guides</span>
              </button>

              <button
                onClick={() => setActiveTab('tracker')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'tracker' ? 'bg-sky-50 text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Symptom Tracker</span>
              </button>

              <button
                onClick={() => setActiveTab('pedigree')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'pedigree' ? 'bg-purple-50 text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <GitFork className="w-4 h-4" />
                <span className="hidden sm:inline">Pedigree Tree</span>
              </button>

              {/* Step 5: Doctor Export Navigation Button */}
              <button
                onClick={() => setActiveTab('export')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'export' ? 'bg-emerald-100 text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Doctor Export</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'landing' && (
          <div className="space-y-12 py-6">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="inline-flex items-center text-xs font-bold bg-sky-100 text-sky-800 px-3 py-1 rounded-full">
                Empowering Patient Self-Advocacy
              </span>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Private Health & Hereditary Intelligence
              </h1>
              <p className="text-slate-600 text-base sm:text-lg">
                Track symptoms, analyze organ risks, build clinical family pedigree trees, and export physician reports—100% offline and stored in your browser.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <button
                  onClick={() => setActiveTab('tracker')}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-sm flex items-center space-x-2"
                >
                  <Activity className="w-4 h-4" />
                  <span>Start Symptom Tracker</span>
                </button>
                <button
                  onClick={() => setActiveTab('export')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-sm flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Build Doctor Report</span>
                </button>
              </div>
            </div>

            {/* Privacy Feature Highlights */}
            <div className="grid sm:grid-cols-3 gap-6 pt-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
                <HardDrive className="w-8 h-8 text-sky-600" />
                <h3 className="font-bold text-slate-900">100% Local Storage</h3>
                <p className="text-xs text-slate-600">All data is saved locally on your device via IndexedDB. Nothing touches a cloud server.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
                <EyeOff className="w-8 h-8 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Zero Analytics or Tracking</h3>
                <p className="text-xs text-slate-600">No telemetry, pixel tracking, or user identification. Completely private health logging.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
                <Lock className="w-8 h-8 text-purple-600" />
                <h3 className="font-bold text-slate-900">Physician PDF Export</h3>
                <p className="text-xs text-slate-600">Filter key symptoms and family histories into printable summaries for clinical visits.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'guides' && <OrganGuides />}
        {activeTab === 'tracker' && <SymptomTracker />}
        {activeTab === 'pedigree' && <PedigreeTree />}
        {activeTab === 'export' && <DoctorExport />}
      </main>
    </div>
  );
}
