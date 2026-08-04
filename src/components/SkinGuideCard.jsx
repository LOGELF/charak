import React, { useState } from 'react';
import { Eye, AlertTriangle, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

export default function SkinGuideCard() {
  const [completedSteps, setCompletedSteps] = useState({});

  const steps = [
    { id: 'step1', title: 'Full Front Check', desc: 'Examine face, neck, chest, abdomen, and front of legs in a well-lit full-length mirror.' },
    { id: 'step2', title: 'Underarms & Arms', desc: 'Raise arms and inspect underarms, both sides of arms, palms, back of hands, and nail beds.' },
    { id: 'step3', title: 'Back & Legs', desc: 'Use a hand mirror to inspect back of neck, shoulders, upper/lower back, buttocks, and back of legs.' },
    { id: 'step4', title: 'Scalp & Feet', desc: 'Part hair to check scalp. Finally, inspect tops, soles, and between toes of both feet.' }
  ];

  const toggleStep = (id) => {
    setCompletedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const progress = Math.round((Object.values(completedSteps).filter(Boolean).length / steps.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl mx-auto">
      {/* Card Header */}
      <div className="bg-amber-50 border-b border-amber-100 p-6 flex justify-between items-start">
        <div>
          <span className="inline-flex items-center space-x-1 text-xs font-semibold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full mb-2">
            <Eye className="w-3.5 h-3.5 mr-1" /> Skin Check (ABCDE Rule)
          </span>
          <h3 className="text-xl font-bold text-slate-900">Skin & Mole Examination</h3>
          <p className="text-sm text-slate-600 mt-1">Screen for melanoma and early skin changes.</p>
        </div>
        <div className="flex items-center space-x-1 text-slate-500 text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
          <Clock className="w-3.5 h-3.5" />
          <span>Monthly</span>
        </div>
      </div>

      {/* Warning Flags: The ABCDE Rule */}
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center">
          <AlertTriangle className="w-4 h-4 text-amber-500 mr-1.5" /> What to Look For (ABCDEs)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <strong>A - Asymmetry:</strong> One half doesn't match the other.
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <strong>B - Border:</strong> Irregular, scalloped, or poorly defined edges.
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <strong>C - Color:</strong> Uneven shades of brown, black, pink, or red.
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <strong>D - Diameter:</strong> Larger than 6mm (size of a pencil eraser).
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 sm:col-span-2">
            <strong>E - Evolving:</strong> Any mole changing in size, shape, color, or bleeding/itching.
          </div>
        </div>
      </div>

      {/* Step-by-Step Exam Checklist */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-bold text-slate-800">Guided Self-Check Steps</h4>
          <span className="text-xs font-medium text-sky-600">{progress}% Completed</span>
        </div>

        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div 
              key={step.id} 
              onClick={() => toggleStep(step.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                completedSteps[step.id] ? 'bg-emerald-50/60 border-emerald-200' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input 
                type="checkbox" 
                checked={!!completedSteps[step.id]} 
                onChange={() => {}} 
                className="mt-1 h-4 w-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <div className="flex-1">
                <p className={`text-sm font-semibold ${completedSteps[step.id] ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>
                  Step {idx + 1}: {step.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Completion Confirmation Banner */}
        {progress === 100 && (
          <div className="mt-4 p-3 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Skin self-examination complete! Log any unusual spots in your local tracker.</span>
          </div>
        )}
      </div>
    </div>
  );
}
