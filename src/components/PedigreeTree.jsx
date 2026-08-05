import React, { useState, useEffect, useRef } from 'react';
import { db } from '../db/db.js';
import { GitFork, UserPlus, Trash2, ShieldCheck, Plus, ZoomIn, ZoomOut, RotateCcw, Link, Edit3, Check, Wand2, MousePointer, Activity, X } from 'lucide-react';

export default function PedigreeTree() {
  const [members, setMembers] = useState([]);
  const [alias, setAlias] = useState('');
  const [relation, setRelation] = useState('Mother');
  const [gender, setGender] = useState('Female');
  const [status, setStatus] = useState('Living');
  const [age, setAge] = useState('');
  const [fatherId, setFatherId] = useState('');
  const [motherId, setMotherId] = useState('');
  
  // New Member Diagnoses Form State
  const [conditionInput, setConditionInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [newMemberDiagnoses, setNewMemberDiagnoses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Per-Member Disease Addition State
  const [addingDiseaseMemberId, setAddingDiseaseMemberId] = useState(null);
  const [memberConditionInput, setMemberConditionInput] = useState('');
  const [memberAgeInput, setMemberAgeInput] = useState('');

  // Zoom State
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Relationship Editing State
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editFatherId, setEditFatherId] = useState('');
  const [editMotherId, setEditMotherId] = useState('');

  // Interactive Line Dragging State
  const [activeDrag, setActiveDrag] = useState(null);
  const [hoveredDock, setHoveredDock] = useState(null);
  const canvasRef = useRef(null);

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

  // Standard 3-Gen Pedigree Template
  const generateStandardTemplate = async () => {
    if (members.length > 0) {
      if (!window.confirm("This will reset current members to the standard 3-Gen pedigree structure. Continue?")) {
        return;
      }
    }

    await db.familyMembers.clear();

    const mGf = await db.familyMembers.add({ alias: 'Maternal GF', relation: 'Maternal Grandfather', gender: 'Male', status: 'Living', age: 78, generationTier: 0, diagnoses: [] });
    const mGm = await db.familyMembers.add({ alias: 'Maternal GM', relation: 'Maternal Grandmother', gender: 'Female', status: 'Deceased', age: 74, generationTier: 0, diagnoses: [{ condition: 'Ovarian Cancer', ageOfOnset: 62 }] });
    const pGf = await db.familyMembers.add({ alias: 'Paternal GF', relation: 'Paternal Grandfather', gender: 'Male', status: 'Deceased', age: 80, generationTier: 0, diagnoses: [{ condition: 'Heart Disease', ageOfOnset: 68 }] });
    const pGm = await db.familyMembers.add({ alias: 'Paternal GM', relation: 'Paternal Grandmother', gender: 'Female', status: 'Living', age: 82, generationTier: 0, diagnoses: [] });

    const mother = await db.familyMembers.add({ alias: 'Mother', relation: 'Mother', gender: 'Female', status: 'Living', age: 52, generationTier: 1, fatherId: mGf, motherId: mGm, diagnoses: [{ condition: 'Breast Cancer', ageOfOnset: 45 }] });
    const father = await db.familyMembers.add({ alias: 'Father', relation: 'Father', gender: 'Male', status: 'Living', age: 55, generationTier: 1, fatherId: pGf, motherId: pGm, diagnoses: [] });

    await db.familyMembers.add({ alias: 'Self', relation: 'Self', gender: 'Male', status: 'Living', age: 26, generationTier: 2, fatherId: father, motherId: mother, diagnoses: [] });

    await loadFamily();
  };

  // Add condition during NEW relative creation
  const handleAddNewMemberCondition = () => {
    if (!conditionInput.trim()) return;
    setNewMemberDiagnoses(prev => [
      ...prev, 
      { condition: conditionInput.trim(), ageOfOnset: ageInput ? parseInt(ageInput, 10) : null }
    ]);
    setConditionInput('');
    setAgeInput('');
  };

  const handleRemoveNewMemberCondition = (index) => {
    setNewMemberDiagnoses(prev => prev.filter((_, i) => i !== index));
  };

  // Add condition directly to an EXISTING relative
  const handleAddConditionToMember = async (memberId) => {
    if (!memberConditionInput.trim()) return;
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;

    const updatedDiagnoses = [
      ...(targetMember.diagnoses || []),
      { condition: memberConditionInput.trim(), ageOfOnset: memberAgeInput ? parseInt(memberAgeInput, 10) : null }
    ];

    await db.familyMembers.update(memberId, { diagnoses: updatedDiagnoses });
    setMemberConditionInput('');
    setMemberAgeInput('');
    setAddingDiseaseMemberId(null);
    await loadFamily();
  };

  const handleRemoveMemberCondition = async (memberId, diagIndex) => {
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;

    const updatedDiagnoses = (targetMember.diagnoses || []).filter((_, i) => i !== diagIndex);
    await db.familyMembers.update(memberId, { diagnoses: updatedDiagnoses });
    await loadFamily();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let generationTier = 2;
      if (relation.includes('Grandmother') || relation.includes('Grandfather')) generationTier = 0;
      else if (relation.includes('Mother') || relation.includes('Father') || relation.includes('Aunt') || relation.includes('Uncle')) generationTier = 1;
      else if (relation.includes('Daughter') || relation.includes('Son')) generationTier = 3;

      await db.familyMembers.add({
        alias: alias || relation,
        relation,
        gender,
        status,
        age: age ? parseInt(age, 10) : null,
        generationTier,
        fatherId: fatherId ? parseInt(fatherId, 10) : null,
        motherId: motherId ? parseInt(motherId, 10) : null,
        diagnoses: newMemberDiagnoses
      });

      setAlias('');
      setAge('');
      setFatherId('');
      setMotherId('');
      setNewMemberDiagnoses([]);
      setConditionInput('');
      setAgeInput('');
      await loadFamily();
    } catch (err) {
      alert("Failed to save family member.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // --- LINEAGE SIDE CATEGORIZATION & VALIDATION ---
  const getLineageSide = (member) => {
    const rel = member.relation || '';
    if (rel.startsWith('Maternal') || rel === 'Mother') return 'maternal';
    if (rel.startsWith('Paternal') || rel === 'Father') return 'paternal';
    return 'central';
  };

  const validateRelationshipLine = (source, target) => {
    if (source.id === target.id) {
      return { valid: false, reason: "Cannot connect a member to themselves." };
    }

    const sourceTier = source.generationTier ?? 2;
    const targetTier = target.generationTier ?? 2;
    const sourceSide = getLineageSide(source);
    const targetSide = getLineageSide(target);

    // Rule 1: Same Generation Pairing (Spouse / Mating Connection)
    if (sourceTier === targetTier) {
      if (source.gender === target.gender) {
        return { valid: false, reason: "Coupling connections require opposite genders." };
      }
      
      // Valid Mother + Father pairing
      if ((source.relation === 'Mother' && target.relation === 'Father') ||
          (source.relation === 'Father' && target.relation === 'Mother')) {
        return { valid: true };
      }

      // Valid Maternal Grandparents
      if (sourceSide === 'maternal' && targetSide === 'maternal') {
        return { valid: true };
      }

      // Valid Paternal Grandparents
      if (sourceSide === 'paternal' && targetSide === 'paternal') {
        return { valid: true };
      }

      // Invalid cross-lineage pairings (e.g., Mother to Paternal Uncle, Maternal GF to Paternal GM)
      return { valid: false, reason: `Invalid pairing: Cannot connect ${source.relation} with ${target.relation}.` };
    }

    // Rule 2: Parent-to-Child (Tier N -> Tier N+1)
    if (targetTier - sourceTier === 1) {
      // Maternal Grandparents can only connect to Maternal side (Mother, Maternal Aunt/Uncle)
      if (sourceSide === 'maternal' && sourceTier === 0) {
        if (targetSide !== 'maternal') {
          return { valid: false, reason: "Maternal Grandparents can only connect to Maternal offspring (Mother, Maternal Aunt/Uncle)." };
        }
      }

      // Paternal Grandparents can only connect to Paternal side (Father, Paternal Aunt/Uncle)
      if (sourceSide === 'paternal' && sourceTier === 0) {
        if (targetSide !== 'paternal') {
          return { valid: false, reason: "Paternal Grandparents can only connect to Paternal offspring (Father, Paternal Aunt/Uncle)." };
        }
      }

      return { valid: true };
    }

    if (sourceTier > targetTier) {
      return { valid: false, reason: "Parents must be placed in a generation tier above the child." };
    }

    if (targetTier - sourceTier > 1) {
      return { valid: false, reason: "Cannot skip generations in a single direct connection line." };
    }

    return { valid: false, reason: "Invalid pedigree relationship." };
  };

  // --- POSITIONING ENGINE ---
  const nodeMap = {};
  members.forEach(m => {
    let x = 120;
    let y = 60;

    if (m.relation === 'Maternal Grandfather') { x = 80; y = 60; }
    else if (m.relation === 'Maternal Grandmother') { x = 240; y = 60; }
    else if (m.relation === 'Paternal Grandfather') { x = 520; y = 60; }
    else if (m.relation === 'Paternal Grandmother') { x = 680; y = 60; }
    else if (m.relation === 'Mother') { x = 160; y = 240; }
    else if (m.relation === 'Father') { x = 600; y = 240; }
    else if (m.relation === 'Self') { x = 380; y = 420; }
    else {
      const tier = m.generationTier ?? 2;
      const count = Object.values(nodeMap).filter(node => node.generationTier === tier).length;
      x = 100 + count * 160;
      y = 60 + tier * 180;
    }

    nodeMap[m.id] = {
      ...m,
      x,
      y,
      ports: {
        top: { x: x + 25, y: y },
        bottom: { x: x + 25, y: y + 50 },
        left: { x: x, y: y + 25 },
        right: { x: x + 50, y: y + 25 }
      }
    };
  });

  // Calculate Unique Parent-Child Connections (Prevents Duplicate Lines)
  const connections = [];
  const processedKeys = new Set();

  members.forEach(child => {
    if (child.fatherId || child.motherId) {
      const key = `${child.fatherId || 'x'}-${child.motherId || 'x'}-${child.id}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
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
    }
  });

  // Dragging Handlers
  const getCanvasCoordinates = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoomLevel,
      y: (e.clientY - rect.top) / zoomLevel
    };
  };

  const handleStartDrag = (memberId, dockType, e) => {
    e.stopPropagation();
    const sourceNode = nodeMap[memberId];
    if (!sourceNode) return;

    const startPos = sourceNode.ports[dockType];
    setActiveDrag({
      sourceId: memberId,
      dockType,
      startX: startPos.x,
      startY: startPos.y,
      currentX: startPos.x,
      currentY: startPos.y
    });
  };

  const handleMouseMove = (e) => {
    if (!activeDrag) return;
    const { x, y } = getCanvasCoordinates(e);

    let closestTarget = null;
    let minDistance = 35;

    Object.values(nodeMap).forEach(node => {
      if (node.id === activeDrag.sourceId) return;

      Object.entries(node.ports).forEach(([dockKey, portPos]) => {
        const dist = Math.hypot(portPos.x - x, portPos.y - y);
        if (dist < minDistance) {
          minDistance = dist;
          closestTarget = { targetId: node.id, dockType: dockKey, x: portPos.x, y: portPos.y };
        }
      });
    });

    if (closestTarget) {
      setHoveredDock(closestTarget);
      setActiveDrag(prev => ({ ...prev, currentX: closestTarget.x, currentY: closestTarget.y }));
    } else {
      setHoveredDock(null);
      setActiveDrag(prev => ({ ...prev, currentX: x, currentY: y }));
    }
  };

  const handleMouseUp = async () => {
    if (activeDrag && hoveredDock) {
      const source = nodeMap[activeDrag.sourceId];
      const target = nodeMap[hoveredDock.targetId];

      if (source && target) {
        // Validate relationship line logic
        const validation = validateRelationshipLine(source, target);

        if (!validation.valid) {
          alert(`🚫 ${validation.reason}`);
          setActiveDrag(null);
          setHoveredDock(null);
          return;
        }

        // Prevent Duplicate Connections
        if (target.fatherId === source.id || target.motherId === source.id) {
          alert(`Connection already exists between ${source.alias} and ${target.alias}.`);
          setActiveDrag(null);
          setHoveredDock(null);
          return;
        }

        // Apply Parent Relationship
        if (source.gender === 'Male' && source.generationTier < target.generationTier) {
          await db.familyMembers.update(target.id, { fatherId: source.id });
        } else if (source.gender === 'Female' && source.generationTier < target.generationTier) {
          await db.familyMembers.update(target.id, { motherId: source.id });
        }

        await loadFamily();
      }
    }

    setActiveDrag(null);
    setHoveredDock(null);
  };

  const maleMembers = members.filter(m => m.gender === 'Male');
  const femaleMembers = members.filter(m => m.gender === 'Female');

  return (
    <div className="space-y-8 max-w-6xl mx-auto select-none">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="inline-flex items-center space-x-1 text-xs font-semibold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full mb-1">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Validated Pedigree Engine
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">Clinical Pedigree Editor</h2>
          <p className="text-slate-600 text-sm mt-0.5">Drag lines between docking ports with strict genetic lineage rules.</p>
        </div>

        <button
          onClick={generateStandardTemplate}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0"
        >
          <Wand2 className="w-4 h-4" />
          <span>Auto-Build Standard Template</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Relative Manager */}
        <div className="lg:col-span-1 space-y-6">
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alias / Name</label>
                  <input
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="e.g., Jane Doe"
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g., 54"
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-slate-50"
                  />
                </div>
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

              {/* Diseases / Conditions for New Member */}
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <label className="block text-xs font-bold text-slate-700">Add Disease during Entry</label>
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
                    placeholder="Onset Age"
                    className="w-1/3 text-xs p-2 rounded-lg border border-slate-300 bg-slate-50"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddNewMemberCondition}
                  className="w-full flex items-center justify-center space-x-1 text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 py-1.5 rounded-lg border border-purple-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Disease to Entry</span>
                </button>

                {newMemberDiagnoses.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {newMemberDiagnoses.map((d, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-rose-50 border border-rose-200 text-rose-800 px-2 py-1 rounded-md">
                        <span>{d.condition} {d.ageOfOnset ? `(@ Age ${d.ageOfOnset})` : ''}</span>
                        <button type="button" onClick={() => handleRemoveNewMemberCondition(idx)} className="text-rose-500 font-bold hover:text-rose-700">×</button>
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
                Save Relative
              </button>
            </form>
          </div>

          {/* Connection & Disease Manager List */}
          {members.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Link className="w-4 h-4 text-purple-600 mr-2" /> Relative Manager
              </h3>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {members.map((m) => {
                  const father = members.find(f => f.id === m.fatherId);
                  const mother = members.find(mo => mo.id === m.motherId);
                  const isEditing = editingMemberId === m.id;
                  const isAddingDisease = addingDiseaseMemberId === m.id;

                  return (
                    <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{m.relation} - {m.alias} {m.age ? `(Age ${m.age})` : ''}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setAddingDiseaseMemberId(isAddingDisease ? null : m.id)}
                            className="text-rose-600 hover:text-rose-800 font-semibold flex items-center space-x-1 text-[11px]"
                            title="Add Disease to Person"
                          >
                            <Activity className="w-3 h-3" />
                            <span>+ Disease</span>
                          </button>
                          {!isEditing ? (
                            <button
                              onClick={() => {
                                setEditingMemberId(m.id);
                                setEditFatherId(m.fatherId || '');
                                setEditMotherId(m.motherId || '');
                              }}
                              className="text-purple-600 hover:text-purple-800 font-semibold flex items-center space-x-1 text-[11px]"
                            >
                              <Edit3 className="w-3 h-3" /> Edit
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSaveRelationships(m.id)}
                              className="text-emerald-600 hover:text-emerald-800 font-bold flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]"
                            >
                              <Check className="w-3 h-3" /> Save
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inline Disease Adder for Existing Relative */}
                      {isAddingDisease && (
                        <div className="bg-rose-50/80 p-2 rounded-lg border border-rose-200 space-y-2">
                          <div className="text-[11px] font-bold text-rose-800">Add Disease to {m.alias}</div>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Disease Name"
                              value={memberConditionInput}
                              onChange={(e) => setMemberConditionInput(e.target.value)}
                              className="w-2/3 text-[11px] p-1.5 rounded border border-slate-300 bg-white"
                            />
                            <input
                              type="number"
                              placeholder="Onset Age"
                              value={memberAgeInput}
                              onChange={(e) => setMemberAgeInput(e.target.value)}
                              className="w-1/3 text-[11px] p-1.5 rounded border border-slate-300 bg-white"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setAddingDiseaseMemberId(null)}
                              className="text-[10px] text-slate-500 hover:text-slate-700 px-2 py-1"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleAddConditionToMember(m.id)}
                              className="text-[10px] bg-rose-600 text-white font-bold px-2 py-1 rounded shadow-xs"
                            >
                              Add Disease
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display Diagnoses List under Relative */}
                      {m.diagnoses && m.diagnoses.length > 0 && (
                        <div className="space-y-1">
                          {m.diagnoses.map((d, dIdx) => (
                            <div key={dIdx} className="flex justify-between items-center text-[10px] bg-rose-100/70 text-rose-900 px-2 py-0.5 rounded">
                              <span>• {d.condition} {d.ageOfOnset ? `(@ Age ${d.ageOfOnset})` : ''}</span>
                              <button
                                onClick={() => handleRemoveMemberCondition(m.id, dIdx)}
                                className="text-rose-600 font-bold hover:text-rose-800 ml-1"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

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

        {/* Right Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            {/* Controls Bar */}
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

              <div className="flex items-center space-x-3 text-[11px] text-slate-600 font-medium">
                <span className="flex items-center text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-200">
                  <MousePointer className="w-3 h-3 mr-1" /> Drag lines between ports
                </span>
              </div>
            </div>

            {/* Interactive Canvas Area */}
            <div
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-auto min-h-[520px] relative cursor-crosshair"
            >
              {members.length === 0 ? (
                <div className="text-center text-slate-400 py-20 space-y-3">
                  <GitFork className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">No family members added.</p>
                  <button
                    onClick={generateStandardTemplate}
                    className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-all"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Click Here to Auto-Build 3-Gen Tree</span>
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'top left',
                    transition: activeDrag ? 'none' : 'transform 0.2s ease-out',
                    width: '880px',
                    height: '620px'
                  }}
                  className="relative"
                >
                  {/* SVG Layer for Pedigree Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {connections.map((conn, idx) => {
                      const { childPos, fatherPos, motherPos } = conn;
                      const childX = childPos.ports.top.x;
                      const childY = childPos.ports.top.y;

                      if (fatherPos && motherPos) {
                        const fatherX = fatherPos.ports.right.x;
                        const fatherY = fatherPos.ports.right.y;
                        const motherX = motherPos.ports.left.x;
                        const motherY = motherPos.ports.left.y;
                        const midX = (fatherX + motherX) / 2;
                        const midY = fatherY;
                        const dropY = childY - 35;

                        return (
                          <g key={idx}>
                            <line x1={fatherX} y1={fatherY} x2={motherX} y2={motherY} className="stroke-slate-800 stroke-[2.5]" />
                            <line x1={midX} y1={midY} x2={midX} y2={dropY} className="stroke-slate-800 stroke-[2.5]" />
                            <line x1={midX} y1={dropY} x2={childX} y2={dropY} className="stroke-slate-800 stroke-[2.5]" />
                            <line x1={childX} y1={dropY} x2={childX} y2={childY} className="stroke-slate-800 stroke-[2.5]" />
                          </g>
                        );
                      } else if (fatherPos || motherPos) {
                        const p = fatherPos || motherPos;
                        const parentX = p.ports.bottom.x;
                        const parentY = p.ports.bottom.y;
                        const dropY = childY - 35;

                        return (
                          <g key={idx}>
                            <line x1={parentX} y1={parentY} x2={parentX} y2={dropY} className="stroke-slate-800 stroke-[2.5]" />
                            <line x1={parentX} y1={dropY} x2={childX} y2={dropY} className="stroke-slate-800 stroke-[2.5]" />
                            <line x1={childX} y1={dropY} x2={childX} y2={childY} className="stroke-slate-800 stroke-[2.5]" />
                          </g>
                        );
                      }
                      return null;
                    })}

                    {/* Active Drag Line */}
                    {activeDrag && (
                      <g>
                        <line
                          x1={activeDrag.startX}
                          y1={activeDrag.startY}
                          x2={activeDrag.currentX}
                          y2={activeDrag.currentY}
                          className="stroke-purple-600 stroke-[3]"
                          strokeDasharray="5,5"
                        />
                        <circle
                          cx={activeDrag.currentX}
                          cy={activeDrag.currentY}
                          r="6"
                          className="fill-purple-600 animate-ping"
                        />
                      </g>
                    )}
                  </svg>

                  {/* Render Member Nodes */}
                  {Object.values(nodeMap).map((m) => {
                    const hasDiagnoses = m.diagnoses && m.diagnoses.length > 0;
                    const isMale = m.gender === 'Male';
                    const isDeceased = m.status === 'Deceased';

                    return (
                      <div
                        key={m.id}
                        style={{ left: `${m.x}px`, top: `${m.y}px` }}
                        className="absolute flex flex-col items-center group w-[60px] z-10"
                      >
                        {/* Symbol Box */}
                        <div className="relative w-[50px] h-[50px]">
                          <svg width="50" height="50" className="drop-shadow-xs">
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

                            {/* Red Clinical Disease Indicator */}
                            {hasDiagnoses && (
                              <polygon
                                points="25,12 13,35 37,35"
                                className="fill-rose-500 stroke-rose-700 stroke-[1]"
                              />
                            )}

                            {/* Deceased Diagonal Slash */}
                            {isDeceased && (
                              <line x1="2" y1="48" x2="48" y2="2" className="stroke-slate-900 stroke-[2.5]" />
                            )}
                          </svg>

                          {/* 4 Magnetic Docking Ports */}
                          {['top', 'bottom', 'left', 'right'].map((dockKey) => {
                            const isHovered = hoveredDock?.targetId === m.id && hoveredDock?.dockType === dockKey;
                            
                            let portStyle = "";
                            if (dockKey === 'top') portStyle = "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2";
                            if (dockKey === 'bottom') portStyle = "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2";
                            if (dockKey === 'left') portStyle = "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2";
                            if (dockKey === 'right') portStyle = "right-0 top-1/2 -translate-y-1/2 translate-x-1/2";

                            return (
                              <div
                                key={dockKey}
                                onMouseDown={(e) => handleStartDrag(m.id, dockKey, e)}
                                className={`absolute w-3 h-3 rounded-full border-2 cursor-pointer transition-all ${portStyle} ${
                                  isHovered
                                    ? 'bg-emerald-500 border-white scale-150 shadow-lg z-30 ring-2 ring-emerald-400'
                                    : 'bg-purple-600 border-white opacity-40 group-hover:opacity-100 hover:scale-125 z-20'
                                }`}
                                title={`Connect from ${dockKey} port`}
                              />
                            );
                          })}
                        </div>

                        {/* Orderly Pedigree Label Stack (1. Title -> 2. Name -> 3. Age/Status -> 4. Diseases) */}
                        <div className="mt-1 text-center min-w-[120px]">
                          {/* 1. Title / Role */}
                          <span className="text-[11px] font-extrabold text-slate-900 block leading-tight">{m.relation}</span>

                          {/* 2. Name / Alias */}
                          <span className="text-[10px] text-purple-800 font-bold block">{m.alias}</span>

                          {/* 3. Age & Status */}
                          <span className="text-[9px] text-slate-500 font-medium block">
                            {m.age ? `Age ${m.age}` : 'Age -'} • {isDeceased ? 'Deceased' : 'Living'}
                          </span>

                          {/* 4. Diseases & Onset Age List */}
                          {hasDiagnoses && (
                            <div className="mt-1 space-y-0.5 w-full text-center">
                              {m.diagnoses.map((d, dIdx) => (
                                <div key={dIdx} className="text-[9px] font-bold text-rose-800 bg-rose-50 px-1 py-0.5 rounded border border-rose-200 leading-tight">
                                  <span>{d.condition}</span>
                                  {d.ageOfOnset && <span className="text-rose-600 font-normal block text-[8px]">Onset: Age {d.ageOfOnset}</span>}
                                </div>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => handleDelete(m.id)}
                            className="mt-1 text-slate-300 hover:text-rose-600 p-0.5 opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete Relative"
                          >
                            <Trash2 className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        </div>
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
