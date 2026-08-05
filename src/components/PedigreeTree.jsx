import React, { useState, useEffect } from 'react';
import { db } from '../db/db.js';
import { GitFork, UserPlus, Trash2, ShieldCheck, Heart, Info, AlertCircle } from 'lucide-react';

export default function PedigreeTree() {
  const [members, setMembers] = useState([]);
  const [alias, setAlias] = useState('');
  const [relation, setRelation] = useState('Mother');
  const [gender, setGender] = useState('Female');
  const [status, setStatus] = useState('Living');
  const [cancerTypes, setCancerTypes] = useState('');
  const [ageOfOnset, setAgeOfOnset] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load family members from Dexie IndexedDB
  const loadFamily = async () => {
    try {
      const data = await db.familyMembers.toArray();
      setMembers(data);
    } catch (err) {
      console.error("Failed to load family pedigree data:", err);
    }
  };

  useEffect(() => {
    loadFamily();
  }, []);

  // Add family member
  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await db.familyMembers.add({
        alias: alias || relation,
        relation,
        gender,
        status,
        cancerTypes: cancerTypes ? cancerTypes.trim() : 'None',
        ageOfOnset: ageOfOnset ? parseInt(ageOfOnset, 10) : null
      });

      // Reset Form
      setAlias('');
      setCancerTypes('');
      setAgeOfOnset('');
      await loadFamily();
    } catch (err) {
      alert("Failed to save family member locally.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete family member
  const handleDelete = async (id) => {
    if (window.confirm("Remove this relative from your pedigree tree?")) {
      await db.familyMembers.delete(id);
      await loadFamily();
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="inline-flex items-center space-x-1 text-xs font-semibold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full mb-1">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Standardized Clinical Symbols
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">Family Medical Pedigree Map</h2>
          <p className="text-slate-600 text-sm mt-0.5">Map hereditary health risks across generations. 100% saved in browser memory.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Form: Add Relatives */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
            <UserPlus className="w-5 h-5 text-sky-600 mr-2" /> Add Relative
          </h3>

          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Relation / Role</label>
              <select
                value={relation}
                onChange={(e) => {
                  const rel = e.target.value;
                  setRelation(rel);
                  if (['Father', 'Maternal Grandfather', 'Paternal Grandfather', 'Brother', 'Son', 'Maternal Uncle', 'Paternal Uncle'].includes(rel)) {
                    setGender('Male');
                  } else if (['Mother', 'Maternal Grandmother', 'Paternal Grandmother', 'Sister', 'Daughter', 'Maternal Aunt', 'Paternal Aunt'].includes(rel)) {
                    setGender('Female');
                  }
                }}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50"
              >
                <option value="Self">Self (Proband)</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Maternal Grandmother">Maternal Grandmother</option>
                <option value="Maternal Grandfather">Maternal Grandfather</option>
                <option value="Paternal Grandmother">Paternal Grandmother</option>
                <option value="Paternal Grandfather">Paternal Grandfather</option>
                <option value="Maternal Aunt">Maternal Aunt</option>
                <option value="Maternal Uncle">Maternal Uncle</option>
                <option value="Paternal Aunt">Paternal Aunt</option>
                <option value="Paternal Uncle">Paternal Uncle</option>
                <option value="Sister">Sister</option>
                <option value="Brother">Brother</option>
                <option value="Daughter">Daughter</option>
                <option value="Son">Son</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alias / Initials (Optional for Privacy)</label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="e.g., Aunt Mary or M.S."
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Biological Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50"
                >
                  <option value="Female">Female (Circle)</option>
                  <option value="Male">Male (Square)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vital Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50"
                >
                  <option value="Living">Living</option>
                  <option value="Deceased">Deceased (Slashed)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Known Cancer Diagnoses</label>
              <input
                type="text"
                value={cancerTypes}
                onChange={(e) => setCancerTypes(e.target.value)}
                placeholder="e.g., Breast Cancer, Colon Cancer (or Leave blank)"
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age of Onset / Diagnosis (If known)</label>
              <input
                type="number"
                value={ageOfOnset}
                onChange={(e) => setAgeOfOnset(e.target.value)}
                placeholder="e.g., 48"
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-md transition-all text-sm"
            >
              Add Relative to Pedigree
            </button>
          </form>
        </div>

        {/* Right Canvas: SVG Pedigree Tree Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <GitFork className="w-5 h-5 text-purple-600 mr-2" /> Clinical Pedigree Visualizer
              </h3>
              
              {/* Legend */}
              <div className="flex items-center space-x-3 text-[11px] text-slate-600 font-medium">
                <span className="flex items-center"><span className="w-3 h-3 bg-white border-2 border-slate-700 mr-1"></span> Male</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-white border-2 border-slate-700 rounded-full mr-1"></span> Female</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-rose-500 border-2 border-slate-700 mr-1"></span> Cancer Diagnosed</span>
              </div>
            </div>

            {/* SVG Pedigree Chart Canvas */}
            <div id="pedigree-svg-container" className="bg-slate-50 border border-slate-200 rounded-xl p-6 overflow-x-auto min-h-[280px] flex items-center justify-center">
              {members.length === 0 ? (
                <div className="text-center text-slate-400 space-y-2">
                  <GitFork className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm">No family members added yet.</p>
                  <p className="text-xs">Add yourself or relatives using the form on the left to generate the clinical tree.</p>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-6 py-4">
                  {members.map((m) => {
                    const hasCancer = m.cancerTypes && m.cancerTypes.toLowerCase() !== 'none';
                    const isMale = m.gender === 'Male';
                    const isDeceased = m.status === 'Deceased';

                    return (
                      <div key={m.id} className="flex flex-col items-center group relative min-w-[100px]">
                        {/* SVG Standard Symbol */}
                        <div className="relative mb-2">
                          <svg width="50" height="50" className="drop-shadow-xs">
                            {isMale ? (
                              <rect
                                x="5"
                                y="5"
                                width="40"
                                height="40"
                                className={`${hasCancer ? 'fill-rose-500' : 'fill-white'} stroke-slate-800 stroke-[2.5]`}
                              />
                            ) : (
                              <circle
                                cx="25"
                                cy="25"
                                r="20"
                                className={`${hasCancer ? 'fill-rose-500' : 'fill-white'} stroke-slate-800 stroke-[2.5]`}
                              />
                            )}

                            {/* Slash through for Deceased */}
                            {isDeceased && (
                              <line x1="2" y1="48" x2="48" y2="2" className="stroke-slate-900 stroke-[2.5]" />
                            )}
                          </svg>
                        </div>

                        {/* Relative Details */}
                        <span className="text-xs font-bold text-slate-900 text-center leading-tight">{m.alias}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{m.relation}</span>
                        
                        {hasCancer && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mt-1 text-center">
                            {m.cancerTypes} {m.ageOfOnset ? `(${m.ageOfOnset}y)` : ''}
                          </span>
                        )}

                        <button
                          onClick={() => handleDelete(m.id)}
                          className="mt-2 text-slate-300 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete Relative"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
