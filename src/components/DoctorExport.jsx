import React, { useState, useEffect, useRef } from 'react';
import { db } from '../db/db.js';
import { 
  FileText, 
  Printer, 
  CheckSquare, 
  Square, 
  Calendar, 
  User, 
  Activity, 
  GitFork, 
  HelpCircle, 
  Filter, 
  Download, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function DoctorExport() {
  // Data States
  const [symptoms, setSymptoms] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configuration States
  const [dateRange, setDateRange] = useState('30days'); // '7days', '30days', '90days', 'all'
  const [selectedSymptomIds, setSelectedSymptomIds] = useState(new Set());
  const [includePedigree, setIncludePedigree] = useState(true);
  const [includeProfile, setIncludeProfile] = useState(true);
  const [doctorQuestions, setDoctorQuestions] = useState('');

  // Patient Profile Information
  const [patientInfo, setPatientInfo] = useState({
    name: 'Jane Doe',
    age: '34',
    gender: 'Female',
    mrdNumber: 'MRN-882194'
  });

  const reportRef = useRef(null);

  // Load Data from IndexedDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load Symptoms
        let symptomData = [];
        if (db.symptoms) {
          symptomData = await db.symptoms.toArray();
        } else {
          // Fallback mock data if symptom table isn't populated yet
          symptomData = [
            { id: 1, date: '2026-08-01', symptom: 'Migraine', area: 'Head / Right Temple', severity: 8, duration: '4 hours', notes: 'Triggered by bright light during work.' },
            { id: 2, date: '2026-07-28', symptom: 'Joint Stiffness', area: 'Left Knee', severity: 5, duration: 'Morning', notes: 'Eased after light walking.' },
            { id: 3, date: '2026-07-25', symptom: 'Fatigue', area: 'General', severity: 6, duration: 'All day', notes: 'Disrupted sleep pattern.' },
            { id: 4, date: '2026-07-15', symptom: 'Migraine', area: 'Head / Frontal', severity: 9, duration: '6 hours', notes: 'Accompanied by mild nausea.' }
          ];
        }

        // Load Family Pedigree Members
        let pedigreeData = [];
        if (db.familyMembers) {
          pedigreeData = await db.familyMembers.toArray();
        }

        setSymptoms(symptomData);
        setFamilyMembers(pedigreeData);

        // Select all symptoms by default
        setSelectedSymptomIds(new Set(symptomData.map(s => s.id)));
      } catch (err) {
        console.error('Error loading export data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter Symptoms by Date Range
  const getFilteredSymptoms = () => {
    const now = new Date();
    return symptoms.filter(s => {
      if (!s.date) return true;
      const sDate = new Date(s.date);
      const diffDays = (now - sDate) / (1000 * 60 * 60 * 24);

      if (dateRange === '7days') return diffDays <= 7;
      if (dateRange === '30days') return diffDays <= 30;
      if (dateRange === '90days') return diffDays <= 90;
      return true; // 'all'
    });
  };

  const filteredSymptoms = getFilteredSymptoms();

  // Handle Symptom Checklist Toggles
  const toggleSymptomSelect = (id) => {
    setSelectedSymptomIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedSymptomIds.size === filteredSymptoms.length) {
      setSelectedSymptomIds(new Set());
    } else {
      setSelectedSymptomIds(new Set(filteredSymptoms.map(s => s.id)));
    }
  };

  // High-Risk Pedigree Summary (Filter family members with recorded diagnoses)
  const highRiskRelatives = familyMembers.filter(m => m.diagnoses && m.diagnoses.length > 0);

  // Print/Export Function
  const handlePrintExport = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <span className="inline-flex items-center text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full mb-1">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Step 5: Clinical Export
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">Doctor Report Builder</h2>
          <p className="text-slate-600 text-sm mt-0.5">Customize and compile your symptom logs and family history into a physician-ready report.</p>
        </div>

        <button
          onClick={handlePrintExport}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md transition-all shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-8 print:block">
        
        {/* Left Column: Customization Controls (Hidden during browser printing) */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          
          {/* Patient Details Input Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <User className="w-4 h-4 text-emerald-600 mr-2" /> Patient Profile
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={patientInfo.name}
                  onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Age / Gender</label>
                <input
                  type="text"
                  value={`${patientInfo.age} / ${patientInfo.gender}`}
                  onChange={(e) => {
                    const parts = e.target.value.split('/');
                    setPatientInfo({ ...patientInfo, age: parts[0]?.trim() || '', gender: parts[1]?.trim() || '' });
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Export Content Toggles */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Filter className="w-4 h-4 text-emerald-600 mr-2" /> Report Modules
            </h3>

            <div className="space-y-2 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includeProfile}
                  onChange={(e) => setIncludeProfile(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Include Patient Identification Header</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includePedigree}
                  onChange={(e) => setIncludePedigree(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Include High-Risk Pedigree / Family History Summary</span>
              </label>
            </div>
          </div>

          {/* Date Filter & Symptom Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Activity className="w-4 h-4 text-emerald-600 mr-2" /> Select Symptoms ({selectedSymptomIds.size})
              </h3>
              <button
                onClick={toggleSelectAll}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900"
              >
                {selectedSymptomIds.size === filteredSymptoms.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Date Range Options */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              {[
                { id: '7days', label: '7 Days' },
                { id: '30days', label: '30 Days' },
                { id: '90days', label: '90 Days' },
                { id: 'all', label: 'All Time' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDateRange(tab.id)}
                  className={`py-1.5 rounded-lg transition-all ${
                    dateRange === tab.id ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Symptom Checklist */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredSymptoms.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No symptoms logged for this timeframe.</p>
              ) : (
                filteredSymptoms.map((item) => {
                  const isChecked = selectedSymptomIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSymptomSelect(item.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        isChecked 
                          ? 'border-emerald-300 bg-emerald-50/60 text-slate-900' 
                          : 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold block">{item.symptom}</span>
                          <span className="text-[10px] text-slate-500">{item.date} • {item.area}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.severity >= 7 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Sev: {item.severity}/10
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Doctor Questions Input */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <HelpCircle className="w-4 h-4 text-emerald-600 mr-2" /> Questions for your Physician
            </h3>
            <textarea
              rows="3"
              value={doctorQuestions}
              onChange={(e) => setDoctorQuestions(e.target.value)}
              placeholder="e.g., Should I adjust my dosage when headaches persist longer than 4 hours?"
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
          </div>
        </div>

        {/* Right Column: Printable Document Preview */}
        <div className="lg:col-span-7 print:w-full print:block">
          <div 
            ref={reportRef}
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg space-y-6 text-slate-900 print:shadow-none print:border-none print:p-0"
          >
            {/* Clinical Document Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">Patient Clinical Summary</h1>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">Symptom Log & Family Pedigree Report</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p className="font-bold text-slate-800">Export Date:</p>
                <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Patient Header Block */}
            {includeProfile && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Patient Name</span>
                  <span className="font-bold text-slate-900 text-sm">{patientInfo.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Age / Gender</span>
                  <span className="font-bold text-slate-900 text-sm">{patientInfo.age} YRS / {patientInfo.gender}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">MRN / ID</span>
                  <span className="font-bold text-slate-900 text-sm">{patientInfo.mrdNumber}</span>
                </div>
              </div>
            )}

            {/* Questions for Doctor Section */}
            {doctorQuestions.trim() && (
              <div className="border-l-4 border-emerald-600 pl-4 py-1 space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Key Questions for Discussion</h4>
                <p className="text-xs text-slate-700 italic whitespace-pre-line">"{doctorQuestions}"</p>
              </div>
            )}

            {/* High-Risk Pedigree Summary Table */}
            {includePedigree && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center">
                  <GitFork className="w-3.5 h-3.5 mr-1 text-purple-600" /> High-Risk Family Hereditary Summary
                </h3>

                {highRiskRelatives.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                    No hereditary disease entries flagged in the pedigree chart.
                  </p>
                ) : (
                  <table className="w-full text-left text-xs border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-2 border-r border-slate-200">Relation</th>
                        <th className="p-2 border-r border-slate-200">Name</th>
                        <th className="p-2">Diagnosed Condition(s)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {highRiskRelatives.map((member) => (
                        <tr key={member.id} className="border-b border-slate-200">
                          <td className="p-2 font-bold border-r border-slate-200">{member.relation}</td>
                          <td className="p-2 border-r border-slate-200">{member.alias}</td>
                          <td className="p-2">
                            {member.diagnoses.map((d, i) => (
                              <span key={i} className="inline-block bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[10px] px-1.5 py-0.5 rounded mr-1 mb-0.5">
                                {d.condition} {d.ageOfOnset ? `(@ Age ${d.ageOfOnset})` : ''}
                              </span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Symptom Log Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                <span className="flex items-center">
                  <Activity className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Filtered Symptom Log
                </span>
                <span className="text-[10px] font-semibold text-slate-500 normal-case">
                  Showing {symptoms.filter(s => selectedSymptomIds.has(s.id)).length} selected records
                </span>
              </h3>

              {symptoms.filter(s => selectedSymptomIds.has(s.id)).length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-300 rounded-xl">
                  <p className="text-xs text-slate-500">No symptoms selected for export.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-2 border-r border-slate-200">Date</th>
                      <th className="p-2 border-r border-slate-200">Symptom</th>
                      <th className="p-2 border-r border-slate-200">Area</th>
                      <th className="p-2 border-r border-slate-200">Severity</th>
                      <th className="p-2">Clinical Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {symptoms
                      .filter(s => selectedSymptomIds.has(s.id))
                      .map((item) => (
                        <tr key={item.id} className="border-b border-slate-200 align-top">
                          <td className="p-2 font-mono text-[11px] border-r border-slate-200 shrink-0">{item.date}</td>
                          <td className="p-2 font-bold border-r border-slate-200">{item.symptom}</td>
                          <td className="p-2 border-r border-slate-200">{item.area}</td>
                          <td className="p-2 border-r border-slate-200 font-bold">
                            <span className={item.severity >= 7 ? 'text-rose-700' : 'text-slate-800'}>
                              {item.severity} / 10
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 italic">{item.notes || 'No notes provided.'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Document Footer */}
            <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-500">Confidential Medical Record — Generated for Physician Review</p>
              <p>This report is generated directly by the patient portal to facilitate clinical consultations.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
