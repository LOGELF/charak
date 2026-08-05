import React, { useState, useEffect } from 'react';
import { db } from '../db/db.js';
import { GitFork, UserPlus, Trash2, ShieldCheck, Plus, AlertCircle } from 'lucide-react';

export default function PedigreeTree() {
  const [members, setMembers] = useState([]);
  const [alias, setAlias] = useState('');
  const [relation, setRelation] = useState('Mother');
  const [gender, setGender] = useState('Female');
  const [status, setStatus] = useState('Living');
  const [conditionInput, setConditionInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [diagnoses, setDiagnoses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Add individual condition to local list before submitting
  const handleAddCondition = () => {
    if (!conditionInput.trim()) return;
    setDiagnoses(prev => [
      ...prev, 
      { condition: conditionInput.trim(), ageOfOnset: ageInput ? parseInt(ageInput, 10) : null }
    ]);
    setConditionInput('');
    setAgeInput('');
  };

  const handleRemoveCondition = (index) => {
    setDiagnoses(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Determine generation tier for hierarchical positioning
      let generationTier = 2; // Default (Self, Sibling)
      if (relation.includes('Grandmother') || relation.includes('Grandfather')) generationTier = 0;
      else if (relation.includes('Mother') || relation.includes('Father') || relation.includes('Aunt') || relation.includes('Uncle')) generationTier = 1;
      else if (relation.includes('Daughter') || relation.includes('Son')) generationTier = 3;

      await db.familyMembers.add({
        alias: alias || relation,
        relation,
        gender,
        status,
        generationTier,
        diagnoses // Array of multiple conditions: [{condition: 'Breast Cancer', ageOfOnset: 48}, ...]
      });

      // Reset Form
      setAlias('');
      setDiagnoses([]);
      setConditionInput('');
      setAgeInput('');
      await loadFamily();
    } catch (err) {
      alert("Failed to save family member locally.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this relative from your pedigree tree?")) {
      await db.familyMembers.delete(id);
      await loadFamily();
    }
  };

  // Group family members by generation level
  const grandparents = members.filter(m => m.generationTier === 0);
  const parentsAuntsUncles = members.filter(m => m.generationTier === 1);
  const probandSiblings = members.filter(m => m.generationTier === 2);
  const childrenLevel = members.filter(m => m.generationTier === 3);

  const generations = [
    { title: 'Generation I (Grandparents)', members: grandparents },
    { title: 'Generation II (Parents, Aunts & Uncles)', members: parentsAuntsUncles },
    { title: 'Generation III (Self & Siblings)', members: probandSiblings },
    { title: 'Generation IV (Children)', members: childrenLevel }
  ].filter(gen => gen.members.length > 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="inline-flex items-center space-x-1 text-xs font-semibold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full mb-1">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Hierarchical Pedigree Engine
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">Family Medical Pedigree Map</h2>
          <p className="text-slate-600 text-sm mt-0.5">Hierarchical tree view with vertical condition stacks and clinical symbols.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
            <UserPlus className="w-5 h-5 text-purple-600 mr-2" /> Add Relative
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
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-slate-50"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Alias / Name</label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="e.g., Mother or M.S."
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender Symbol</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-slate-50"
                >
                  <option value="Female">Female (Circle)</option>
                  <option value="Male">Male (Square)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-slate-50"
                >
                  <option value="Living">Living</option>
                  <option value="Deceased">Deceased (Slash)</option>
                </select>
              </div>
            </div>

            {/* Multiple Condition Adder */}
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Diagnoses & Diseases</label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={conditionInput}
                  onChange={(e) => setConditionInput(e.target.value)}
                  placeholder="Condition (e.g. Ovarian Cancer)"
                  className="w-2/3 text-xs p-2 rounded-lg border border-slate-300 bg-slate-50"
                />
                <input
                  type="number"
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  placeholder="Age"
                  className="w-1/3 text-xs p-2 rounded-lg border border-slate-300 bg-slate-50"
                />
              </div>

              <button
                type="button"
                onClick={handleAddCondition}
                className="w-full flex items-center justify-center space-x-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-lg border border-slate-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Condition to List</span>
              </button>

              {/* Stacked Condition Chips Preview */}
              {diagnoses.length > 0 && (
                <div className="space-y-1 pt-1">
                  {diagnoses.map((d, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-rose-50 border border-rose-200 text-rose-800 px-2 py-1 rounded-md">
                      <span>{d.condition} {d.ageOfOnset ? `(Age ${d.ageOfOnset})` : ''}</span>
                      <button type="button" onClick={() => handleRemoveCondition(idx)} className="text-rose-500 font-bold hover:text-rose-700">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-md transition-all text-sm"
            >
              Add Relative to Pedigree Tree
            </button>
          </form>
        </div>

        {/* Right Canvas: True Generational Pedigree Tree */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <GitFork className="w-5 h-5 text-purple-600 mr-2" /> Hierarchical Family Map
              </h3>

              <div className="flex items-center space-x-3 text-[11px] text-slate-600 font-medium">
                <span className="flex items-center"><span className="w-3 h-3 bg-white border-2 border-slate-700 mr-1"></span> Male</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-white border-2 border-slate-700 rounded-full mr-1"></span> Female</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-rose-500 border-2 border-slate-700 mr-1"></span> Diagnosed</span>
              </div>
            </div>

            {/* Generational Tree Canvas */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 overflow-x-auto min-h-[320px]">
              {members.length === 0 ? (
                <div className="text-center text-slate-400 py-12 space-y-2">
                  <GitFork className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm">No family members added yet.</p>
                  <p className="text-xs">Add yourself or relatives to render the tree.</p>
                </div>
              ) : (
                <div className="space-y-10 relative">
                  {generations.map((gen, gIdx) => (
                    <div key={gIdx} className="relative space-y-3">
                      {/* Generation Indicator Header */}
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1">
                        {gen.title}
                      </div>

                      {/* Generational Row */}
                      <div className="flex flex-wrap justify-center gap-8 sm:gap-12 relative z-10">
                        {gen.members.map((m) => {
                          const hasDiagnoses = m.diagnoses && m.diagnoses.length > 0;
                          const isMale = m.gender === 'Male';
                          const isDeceased = m.status === 'Deceased';

                          return (
                            <div key={m.id} className="flex flex-col items-center group relative min-w-[110px]">
                              {/* Clinical Symbol */}
                              <div className="relative mb-1">
                                <svg width="50" height="50" className="drop-shadow-xs">
                                  {isMale ? (
                                    <rect
                                      x="5"
                                      y="5"
                                      width="40"
                                      height="40"
                                      className={`${hasDiagnoses ? 'fill-rose-500' : 'fill-white'} stroke-slate-800 stroke-[2.5]`}
                                    />
                                  ) : (
                                    <circle
                                      cx="25"
                                      cy="25"
                                      r="20"
                                      className={`${hasDiagnoses ? 'fill-rose-500' : 'fill-white'} stroke-slate-800 stroke-[2.5]`}
                                    />
                                  )}

                                  {/* Deceased Slash */}
                                  {isDeceased && (
                                    <line x1="2" y1="48" x2="48" y2="2" className="stroke-slate-900 stroke-[2.5]" />
                                  )}
                                </svg>
                              </div>

                              {/* Relative Metadata */}
                              <span className="text-xs font-bold text-slate-900 text-center leading-tight">{m.alias}</span>
                              <span className="text-[10px] text-slate-500 font-medium">{m.relation}</span>

                              {/* Stacked Diagnoses List below */}
                              {hasDiagnoses && (
                                <div className="mt-1.5 space-y-1 w-full text-center">
                                  {m.diagnoses.map((d, dIdx) => (
                                    <div key={dIdx} className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/80 leading-tight">
                                      <div>{d.condition}</div>
                                      {d.ageOfOnset && <div className="text-[9px] text-rose-500 font-normal">Onset: Age {d.ageOfOnset}</div>}
                                    </div>
                                  ))}
                                </div>
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

                      {/* Generational Connector Line */}
                      {gIdx < generations.length - 1 && (
                        <div className="w-1/2 mx-auto border-b-2 border-slate-300 my-4 relative">
                          <div className="w-0.5 h-6 bg-slate-300 mx-auto -bottom-6 absolute left-1/2 transform -translate-x-1/2"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
