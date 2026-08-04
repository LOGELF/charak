import React, { useState } from 'react';
import { Eye, ShieldAlert, HeartHandshake, Sparkles, AlertCircle, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function OrganGuides() {
  const [selectedOrgan, setSelectedOrgan] = useState('skin');
  const [completedSteps, setCompletedSteps] = useState({});

  const toggleStep = (stepId) => {
    setCompletedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const guides = {
    skin: {
      title: 'Skin & Mole Examination',
      frequency: 'Monthly',
      badge: 'ABCDE Rule',
      color: 'amber',
      warningTitle: 'What to Look For (ABCDEs)',
      warnings: [
        'A - Asymmetry: One half of the mole does not match the other.',
        'B - Border: Irregular, scalloped, or poorly defined edges.',
        'C - Color: Varying shades of brown, black, pink, or red.',
        'D - Diameter: Larger than 6mm (approx. pencil eraser size).',
        'E - Evolving: Changing in size, shape, color, or starting to bleed/itch.'
      ],
      steps: [
        { id: 's1', title: 'Full Front & Back Check', desc: 'Examine face, neck, chest, abdomen, and back in a full-length mirror.' },
        { id: 's2', title: 'Underarms & Arms', desc: 'Raise arms and inspect underarms, forearms, palms, and nail beds.' },
        { id: 's3', title: 'Lower Body & Feet', desc: 'Check legs, buttocks, tops/soles of feet, and between toes.' },
        { id: 's4', title: 'Scalp Inspection', desc: 'Use a blow dryer or comb to part hair and inspect the scalp.' }
      ]
    },
    breast: {
      title: 'Breast Self-Examination',
      frequency: 'Monthly (3–5 days after cycle)',
      badge: 'Visual & Tactile',
      color: 'rose',
      warningTitle: 'Key Warning Signs',
      warnings: [
        'Hard, painless lumps or thickening in breast or underarm area.',
        'Dimpling, puckering, or redness of the skin.',
        'Changes in nipple shape, inversion, or spontaneous discharge.',
        'Unexplained changes in breast size or contour.'
      ],
      steps: [
        { id: 'b1', title: 'Mirror Visual Inspection', desc: 'Stand with hands on hips, then raised high; check for visual dimpling or asymmetry.' },
        { id: 'b2', title: 'Shower Tactile Exam', desc: 'Use flat finger pads in a circular motion (light, medium, firm pressure) covering the entire breast.' },
        { id: 'b3', title: 'Underarm & Collarbone', desc: 'Feel for swollen lymph nodes along the collarbone and deep underarm area.' },
        { id: 'b4', title: 'Lying Down Check', desc: 'Lie down with a pillow under right shoulder and right arm behind head to repeat tactile check.' }
      ]
    },
    testicular: {
      title: 'Testicular Self-Examination',
      frequency: 'Monthly (Best after a warm shower)',
      badge: 'Tactile Check',
      color: 'sky',
      warningTitle: 'Key Warning Signs',
      warnings: [
        'Painless lump, hard nodule, or swelling on either testicle.',
        'A feeling of heaviness or dull ache in the lower abdomen or scrotum.',
        'Sudden fluid collection or notable enlargement of one testicle.'
      ],
      steps: [
        { id: 't1', title: 'Warm Shower Relaxer', desc: 'Warm water relaxes the scrotal skin, making internal palpation easier.' },
        { id: 't2', title: 'Roll Between Thumb & Fingers', desc: 'Gently roll each testicle between thumbs and fingers of both hands.' },
        { id: 't3', title: 'Locate Epididymis', desc: 'Identify the soft, cord-like tube at the back of each testicle (normal structure, do not confuse with a lump).' },
        { id: 't4', title: 'Check for Hard Nodules', desc: 'Feel for any pea-sized hard lumps along the front or side surface.' }
      ]
    },
    lymph: {
      title: 'Lymph Node Inspection',
      frequency: 'Bi-Monthly / As Needed',
      badge: 'Immune System Check',
      color: 'emerald',
      warningTitle: 'Key Warning Signs',
      warnings: [
        'Nodes that are hard, fixed (don\'t move when pressed), and growing larger.',
        'Swelling lasting longer than 2 to 4 weeks.',
        'Accompanied by unexplained fever, night sweats, or rapid weight loss.'
      ],
      steps: [
        { id: 'l1', title: 'Cervical (Neck) Nodes', desc: 'Gently press three fingers along the side of neck and base of skull.' },
        { id: 'l2', title: 'Supraclavicular (Collarbone)', desc: 'Press into the hollow area just above your collarbone.' },
        { id: 'l3', title: 'Axillary (Underarm) Nodes', desc: 'Relax your arm and reach high into the armpit with opposite hand fingers.' },
        { id: 'l4', title: 'Inguinal (Groin) Nodes', desc: 'Press along the crease where your thigh meets your pelvis.' }
      ]
    },
    oral: {
      title: 'Oral Health & Cavity Exam',
      frequency: 'Monthly',
      badge: 'Visual & Soft Tissue',
      color: 'purple',
      warningTitle: 'Key Warning Signs',
      warnings: [
        'Red or white patches on tongue, gums, or lining of mouth.',
        'Sores or ulcers that fail to heal after 14 days.',
        'Unexplained numbness, difficulty swallowing, or persistent sore throat.'
      ],
      steps: [
        { id: 'o1', title: 'Lips & Gums Inspection', desc: 'Pull lips outward to view inner gums and lining under bright light.' },
        { id: 'o2', title: 'Tongue - All Sides', desc: 'Extend tongue; examine top, underside, and pull sides with gauze/tissue.' },
        { id: 'o3', title: 'Roof & Floor of Mouth', desc: 'Tilt head back to inspect palate; press thumb under chin while finger feels floor of mouth.' },
        { id: 'o4', title: 'Cheeks & Throat', desc: 'Pull cheeks outward to inspect soft lining and look at back of throat.' }
      ]
    }
  };

  const current = guides[selectedOrgan];
  const currentCompletedCount = current.steps.filter(s => completedSteps[s.id]).length;
  const progressPercentage = Math.round((currentCompletedCount / current.steps.length) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Organ Selector Tabs */}
      <div className="flex flex-wrap gap-2 justify-center bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        {Object.keys(guides).map((key) => {
          const item = guides[key];
          const isActive = selectedOrgan === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedOrgan(key)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.title.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Main Selected Guide Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {current.badge}
              </span>
              <span className="flex items-center text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 mr-1" /> {current.frequency}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{current.title}</h3>
          </div>

          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-right">
            <span className="text-xs text-slate-400 block font-medium">Guide Progress</span>
            <span className="text-xl font-bold text-sky-400">{progressPercentage}% Done</span>
          </div>
        </div>

        {/* Clinical Red Flags Warning Panel */}
        <div className="p-6 bg-amber-50/60 border-b border-amber-100">
          <h4 className="text-sm font-bold text-amber-900 flex items-center mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600 mr-2" />
            {current.warningTitle}
          </h4>
          <ul className="grid sm:grid-cols-2 gap-2 text-xs text-amber-900">
            {current.warnings.map((warn, i) => (
              <li key={i} className="flex items-start space-x-2 bg-white/80 p-2.5 rounded-lg border border-amber-200/50">
                <span className="text-amber-600 font-bold">•</span>
                <span>{warn}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Step-by-Step Interactive Checklist */}
        <div className="p-6 sm:p-8 space-y-4">
          <h4 className="text-base font-bold text-slate-900">Step-by-Step Examination Flow</h4>

          <div className="space-y-3">
            {current.steps.map((step, index) => {
              const isChecked = !!completedSteps[step.id];
              return (
                <div
                  key={step.id}
                  onClick={() => toggleStep(step.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-4 ${
                    isChecked
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-1 h-5 w-5 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className={`text-sm sm:text-base font-bold ${isChecked ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>
                      Step {index + 1}: {step.title}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion Celebration Message */}
          {progressPercentage === 100 && (
            <div className="mt-6 p-4 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center space-x-3 text-emerald-900 text-sm font-semibold">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>Great job! You completed all steps for this self-examination. Use the Symptom Tracker tab to log any observations locally.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
