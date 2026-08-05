import React, { useState, useEffect } from 'react';
import { db } from '../db/db.js';
import { GitFork, UserPlus, Trash2, ShieldCheck, Plus, ZoomIn, ZoomOut, RotateCcw, Link, Edit3, Check } from 'lucide-react';

export default function PedigreeTree() {
  const [members, setMembers] = useState([]);
  const [alias, setAlias] = useState('');
  const [relation, setRelation] = useState('Mother');
  const [gender, setGender] = useState('Female');
  const [status, setStatus] = useState('Living');
  const [fatherId, setFatherId] = useState('');
  const [motherId, setMotherId] = useState('');
  
  const [conditionInput, setConditionInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [diagnoses, setDiagnoses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Zoom State
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Relationship Editing State
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editFatherId, setEditFatherId] = useState('');
  const [editMotherId, setEditMotherId] = useState('');

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

  // Add individual condition to local list
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
      let generationTier = 2; // Default: Self / Sibling
      if (relation.includes('Grandmother') || relation.includes('Grandfather')) generationTier = 0;
      else if (relation.includes('Mother') || relation.includes('Father') || relation.includes('Aunt') || relation.includes('Uncle')) generationTier = 1;
      else if (relation.includes('Daughter') || relation.includes('Son')) generationTier = 3;

      await db.familyMembers.add({
        alias: alias || relation,
        relation,
        gender,
        status,
        generationTier,
        fatherId: fatherId ? parseInt(fatherId, 10) : null,
        motherId: motherId ? parseInt(motherId, 10) : null,
        diagnoses
      });

      // Reset Form
      setAlias('');
      setFatherId('');
      setMotherId('');
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

  // Update Relationship Connections
  const handleSaveRelationships = async (memberId) => {
    try {
      await db.familyMembers.update(memberId, {
        fatherId: editFatherId ? parseInt(editFatherId, 10) : null,
        motherId: editMotherId ? parseInt(editMotherId, 10) : null
      });
      setEditingMemberId(null);
      await loadFamily();
    } catch (err) {
      alert("Failed to update parent connections.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this relative from your pedigree tree?")) {
      await db.familyMembers.delete(id);
      await loadFamily();
    }
  };

  // --- PEDIGREE CALCULATIONS & POSITIONS ---
  const nodeMap = {};
  const generations = [[], [], [], []]; // Gen 0, 1, 2, 3

  members.forEach(m => {
    const tier = m.generationTier ?? 2;
    generations[tier].push(m);
  });

  // Calculate (x, y) coordinates for each node
  const ySpacing = 220;
  const xSpacing = 180;

  generations.forEach((genMembers, gIdx) => {
    const y = 80 + gIdx * ySpacing;
    genMembers.forEach((m, mIdx) => {
      const x = 120 + mIdx * xSpacing;
      nodeMap[m.id] = { ...m, x, y };
    });
  });

  // Find Parent Couples & Child Connections
  const connections = [];
  members.forEach(child => {
    if (child.fatherId || child.motherId) {
      const childPos = nodeMap[child.id];
      const fatherPos = child.fatherId ? nodeMap[child.fatherId] : null;
      const motherPos = child.motherId ? nodeMap[child.motherId] : null;

      if (childPos) {
        connections.push({
          childId: child.id,
          childPos,
          fatherPos,
          motherPos
        });
      }
    }
  });

  const maleMembers = members.filter(m => m.gender === 'Male');
  const femaleMembers = members.filter(m => m.gender === 'Female');

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="inline-flex items-center space-x-1 text-xs font-semibold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full mb-1">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Dynamic Pedigree Engine
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">Connected Family Pedigree Map</h2>
          <p className="text-slate-600 text-sm mt-0.5">Real connection lines, custom parent links, zoom controls, and red triangle disease symbols.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Relationship Links Editor */}
        <div className="lg:col-span-1 space-y-6">
          {/* Add Relative Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
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

              {/* Optional Parent Selectors upon creation */}
              {members.length > 0 && (
                <div className="border-t border-slate-200 pt-3 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Connect Parents (Optional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={fatherId}
                      onChange={(e) => setFatherId(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-slate-300 bg-slate-50"
                    >
                      <option value="">Select Father...</option>
                      {maleMembers.map(m => <option key={m.id} value={m.id}>{m.alias} ({m.relation})</option>)}
                    </select>

                    <select
                      value={motherId}
                      onChange={(e) => setMotherId(e.target.value)}
                      className="text-xs p-2 rounded-lg border border-slate-300 bg-slate-50"
                    >
                      <option value="">Select Mother...</option>
                      {femaleMembers.map(m => <option key={m.id} value={m.id}>{m.alias} ({m.relation})</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Multiple Diagnoses Adder */}
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <label className="block text-xs font-bold text-slate-700">Diagnoses & Diseases</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                    placeholder="Disease (e.g. Ovarian Cancer)"
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
                  <span>Add Disease to List</span>
                </button>

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
                Add Relative
              </button>
            </form>
          </div>

          {/* Edit Relationship Connections Manager */}
          {members.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Link className="w-4 h-4 text-purple-600 mr-2" /> Edit Relationship Connections
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {members.map((m) => {
                  const father = members.find(f => f.id === m.fatherId);
                  const mother = members.find(mo => mo.id === m.motherId);
                  const isEditing = editingMemberId === m.id;

                  return (
                    <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{m.alias} ({m.relation})</span>
                        {!isEditing ? (
                          <button
                            onClick={() => {
                              setEditingMemberId(m.id);
                              setEditFatherId(m.fatherId || '');
                              setEditMotherId(m.motherId || '');
                            }}
                            className="text-purple-600 hover:text-purple-800 font-semibold flex items-center space-x-1"
                          >
                            <Edit3 className="w-3 h-3 mr-0.5" /> Edit Links
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSaveRelationships(m.id)}
                            className="text-emerald-600 hover:text-emerald-800 font-bold flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                          >
                            <Check className="w-3 h-3 mr-0.5" /> Save
                          </button>
                        )}
                      </div>

                      {!isEditing ? (
                        <div className="text-[11px] text-slate-500">
                          Parents: {father ? father.alias : 'None'} & {mother ? mother.alias : 'None'}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600">Father</label>
                            <select
                              value={editFatherId}
                              onChange={(e) => setEditFatherId(e.target.value)}
                              className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
                            >
                              <option value="">None</option>
                              {maleMembers.filter(f => f.id !== m.id).map(f => (
                                <option key={f.id} value={f.id}>{f.alias}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600">Mother</label>
                            <select
                              value={editMotherId}
                              onChange={(e) => setEditMotherId(e.target.value)}
                              className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
                            >
                              <option value="">None</option>
                              {femaleMembers.filter(f => f.id !== m.id).map(f => (
                                <option key={f.id} value={f.id}>{f.alias}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Canvas: Connected Pedigree Chart & Zoom Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            {/* Controls Bar: Zoom & Legend */}
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700 mr-1">Zoom:</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 2.0))}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.4))}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1.0)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 text-xs font-medium flex items-center space-x-1"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>{Math.round(zoomLevel * 100)}%</span>
                </button>
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-3 text-[11px] text-slate-600 font-medium">
                <span className="flex items-center"><span className="w-3 h-3 bg-white border-2 border-slate-800 mr-1"></span> Male</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-white border-2 border-slate-800 rounded-full mr-1"></span> Female</span>
                <span className="flex items-center"><span className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[9px] border-b-rose-500 mr-1"></span> Diagnosed</span>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-auto min-h-[420px] relative">
              {members.length === 0 ? (
                <div className="text-center text-slate-400 py-16 space-y-2">
                  <GitFork className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">No family members added yet.</p>
                  <p className="text-xs">Add yourself and family members to render connected lines.</p>
                </div>
              ) : (
                <div
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'top left',
                    transition: 'transform 0.2s ease-out',
                    width: '900px',
                    height: '650px'
                  }}
                  className="relative"
                >
                  {/* SVG Layer for Real Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {connections.map((conn, idx) => {
                      const { childPos, fatherPos, motherPos } = conn;
                      const childX = childPos.x + 25;
                      const childY = childPos.y;

                      if (fatherPos && motherPos) {
                        const fatherX = fatherPos.x + 25;
                        const fatherY = fatherPos.y + 25;
                        const motherX = motherPos.x + 25;
                        const motherY = motherPos.y + 25;
                        const midX = (fatherX + motherX) / 2;
                        const midY = fatherY;
                        const dropY = childY - 30;

                        return (
                          <g key={idx}>
                            {/* Union line between Father and Mother */}
                            <line x1={fatherX} y1={fatherY} x2={motherX} y2={motherY} className="stroke-slate-700 stroke-[2]" />
                            {/* Line dropping down from parents midpoint */}
                            <line x1={midX} y1={midY} x2={midX} y2={dropY} className="stroke-slate-700 stroke-[2]" />
                            {/* Line connecting down to child */}
                            <line x1={midX} y1={dropY} x2={childX} y2={dropY} className="stroke-slate-700 stroke-[2]" />
                            <line x1={childX} y1={dropY} x2={childX} y2={childY} className="stroke-slate-700 stroke-[2]" />
                          </g>
                        );
                      } else if (fatherPos || motherPos) {
                        const p = fatherPos || motherPos;
                        const parentX = p.x + 25;
                        const parentY = p.y + 50;
                        const dropY = childY - 30;

                        return (
                          <g key={idx}>
                            <line x1={parentX} y1={parentY} x2={parentX} y2={dropY} className="stroke-slate-700 stroke-[2]" />
                            <line x1={parentX} y1={dropY} x2={childX} y2={dropY} className="stroke-slate-700 stroke-[2]" />
                            <line x1={childX} y1={dropY} x2={childX} y2={childY} className="stroke-slate-700 stroke-[2]" />
                          </g>
                        );
                      }
                      return null;
                    })}
                  </svg>

                  {/* Render Relative Nodes */}
                  {Object.values(nodeMap).map((m) => {
                    const hasDiagnoses = m.diagnoses && m.diagnoses.length > 0;
                    const isMale = m.gender === 'Male';
                    const isDeceased = m.status === 'Deceased';

                    return (
                      <div
                        key={m.id}
                        style={{ left: `${m.x}px`, top: `${m.y}px` }}
                        className="absolute flex flex-col items-center group min-w-[120px] z-10"
                      >
                        {/* Clinical Symbol */}
                        <div className="relative mb-1">
                          <svg width="50" height="50" className="drop-shadow-xs">
                            {/* Main Outline (Square = Male, Circle = Female) */}
                            {isMale ? (
                              <rect
                                x="5"
                                y="5"
                                width="40"
                                height="40"
                                className="fill-white stroke-slate-900 stroke-[2.5]"
                              />
                            ) : (
                              <circle
                                cx="25"
                                cy="25"
                                r="20"
                                className="fill-white stroke-slate-900 stroke-[2.5]"
                              />
                            )}

                            {/* Fresh Red Filled Triangle for Diagnosed Conditions */}
                            {hasDiagnoses && (
                              <polygon
                                points="25,12 13,35 37,35"
                                className="fill-rose-500 stroke-rose-700 stroke-[1]"
                              />
                            )}

                            {/* Deceased Slash */}
                            {isDeceased && (
                              <line x1="2" y1="48" x2="48" y2="2" className="stroke-slate-900 stroke-[2.5]" />
                            )}
                          </svg>
                        </div>

                        {/* Person Name & Relation */}
                        <span className="text-xs font-bold text-slate-900 text-center leading-tight">{m.alias}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{m.relation}</span>

                        {/* Stacked Diseases List with Onset Age */}
                        {hasDiagnoses && (
                          <div className="mt-1 space-y-1 w-full text-center">
                            {m.diagnoses.map((d, dIdx) => (
                              <div key={dIdx} className="text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 leading-tight">
                                <div>{d.condition}</div>
                                {d.ageOfOnset && <div className="text-[9px] text-rose-600 font-normal">Onset: Age {d.ageOfOnset}</div>}
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => handleDelete(m.id)}
                          className="mt-1 text-slate-300 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-all"
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
