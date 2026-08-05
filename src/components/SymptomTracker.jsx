import React, { useState, useEffect } from 'react';
import { db } from '../db/db.js';
import { PlusCircle, Calendar, AlertCircle, Camera, Trash2, Download, Upload, ShieldCheck, Activity, Tag } from 'lucide-react';

export default function SymptomTracker() {
  const [symptoms, setSymptoms] = useState([]);
  const [organ, setOrgan] = useState('Skin');
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
  const [severity, setSeverity] = useState('1');
  const [notes, setNotes] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load symptom logs from local IndexedDB
  const loadSymptoms = async () => {
    try {
      const allLogs = await db.symptoms.orderBy('checkDate').reverse().toArray();
      setSymptoms(allLogs);
    } catch (err) {
      console.error("Failed to load local logs:", err);
    }
  };

  useEffect(() => {
    loadSymptoms();
  }, []);

  // Handle image conversion to Base64 (kept completely on-device)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Save new symptom log to IndexedDB
  const handleAddSymptom = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await db.symptoms.add({
        organ,
        checkDate,
        severity: parseInt(severity, 10),
        notes,
        photoBase64
      });

      // Reset Form
      setNotes('');
      setPhotoBase64('');
      setSeverity('1');
      await loadSymptoms();
    } catch (err) {
      alert("Failed to save entry to local database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete entry from IndexedDB
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this local record?")) {
      await db.symptoms.delete(id);
      await loadSymptoms();
    }
  };

  // Data Loss Safeguard: Export JSON Backup
  const exportBackup = async () => {
    const allData = await db.symptoms.toArray();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `charak_health_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Data Loss Safeguard: Restore JSON Backup
  const importBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (Array.isArray(importedData)) {
          await db.symptoms.clear();
          await db.symptoms.bulkAdd(importedData);
          await loadSymptoms();
          alert("Backup restored successfully into browser memory!");
        }
      } catch (err) {
        alert("Invalid backup file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Module Title Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="inline-flex items-center space-x-1 text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full mb-1">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Encrypted Local DB
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">Personal Symptom & Exam Logger</h2>
          <p className="text-slate-600 text-sm mt-0.5">Track subtle bodily changes over time completely offline.</p>
        </div>

        {/* Local Backup / Restore Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={exportBackup}
            className="flex items-center space-x-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl border border-slate-300 transition-all"
            title="Download JSON backup to preserve data"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup</span>
          </button>

          <label className="flex items-center space-x-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl border border-slate-300 transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Restore Backup</span>
            <input type="file" accept=".json" onChange={importBackup} className="hidden" />
          </label>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Entry Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
            <PlusCircle className="w-5 h-5 text-sky-600 mr-2" /> Log New Exam / Spot
          </h3>

          <form onSubmit={handleAddSymptom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Organ / Area</label>
              <select
                value={organ}
                onChange={(e) => setOrgan(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50"
              >
                <option value="Skin">Skin & Moles</option>
                <option value="Breast">Breast / Chest</option>
                <option value="Testicular">Testicular</option>
                <option value="Lymph Nodes">Lymph Nodes</option>
                <option value="Oral">Oral & Mouth</option>
                <option value="Other">Other Observation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Check Date</label>
              <input
                type="date"
                value={checkDate}
                onChange={(e) => setCheckDate(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Noticeable Change Level (1 = Minor/Normal, 5 = Flagged/Consult Doctor)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                <span>1 (Baseline)</span>
                <span>3 (Noticeable)</span>
                <span>5 (Flagged)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Description</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Small 4mm mole on left forearm, smooth edges..."
                rows="3"
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Attach Photo (Local Only)</label>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl cursor-pointer text-xs font-medium text-slate-700 hover:bg-slate-200">
                  <Camera className="w-4 h-4 text-slate-600" />
                  <span>{photoBase64 ? 'Change Photo' : 'Choose File'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                {photoBase64 && <span className="text-xs text-emerald-600 font-semibold">Photo Attached ✓</span>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl shadow-md transition-all text-sm"
            >
              Save Entry Locally
            </button>
          </form>
        </div>

        {/* Right Column: Timeline Log View */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
            <Activity className="w-5 h-5 text-sky-600 mr-2" /> Symptom Timeline ({symptoms.length})
          </h3>

          {symptoms.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500 space-y-2">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-medium">No symptoms logged yet.</p>
              <p className="text-xs text-slate-400">Use the form on the left to add your first self-examination entry.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {symptoms.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 flex items-center">
                        <Tag className="w-3 h-3 mr-1 text-sky-600" /> {item.organ}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{item.checkDate}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.severity >= 4 ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                      }`}>
                        Severity: {item.severity}/5
                      </span>
                    </div>

                    {item.notes && <p className="text-sm text-slate-700 leading-relaxed">{item.notes}</p>}

                    {item.photoBase64 && (
                      <div className="mt-2">
                        <img
                          src={item.photoBase64}
                          alt="Local symptom visual"
                          className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-xs"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="self-start text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-all"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
