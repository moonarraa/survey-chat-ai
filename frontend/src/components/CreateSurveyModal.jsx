import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { BACKEND_URL } from '../config';
import { useTranslation } from 'react-i18next';

const TEMPLATES = [
  {
    segment: 'product_feedback',
    templates: [
      {
        name: 'product_feedback',
        context: 'product_feedback_context'
      },
      {
        name: 'support_quality_assessment',
        context: 'support_quality_assessment_context'
      },
      {
        name: 'interface_evaluation',
        context: 'interface_evaluation_context'
      }
    ]
  },
  {
    segment: 'hr_employee_evaluation',
    templates: [
      {
        name: 'employee_engagement_assessment',
        context: 'employee_engagement_assessment_context'
      },
      {
        name: 'new_employee_adaptation_assessment',
        context: 'new_employee_adaptation_assessment_context'
      },
      {
        name: 'work_conditions_satisfaction_assessment',
        context: 'work_conditions_satisfaction_assessment_context'
      }
    ]
  },
  {
    segment: 'education_course_evaluation',
    templates: [
      {
        name: 'course_evaluation_by_students',
        context: 'course_evaluation_by_students_context'
      },
      {
        name: 'teacher_evaluation',
        context: 'teacher_evaluation_context'
      },
      {
        name: 'educational_materials_evaluation',
        context: 'educational_materials_evaluation_context'
      }
    ]
  },
  {
    segment: 'sales_customer_survey',
    templates: [
      {
        name: 'customer_satisfaction_assessment',
        context: 'customer_satisfaction_assessment_context'
      },
      {
        name: 'purchase_refusal_reasons_research',
        context: 'purchase_refusal_reasons_research_context'
      }
    ]
  },
  {
    segment: 'medicine_patient_survey',
    templates: [
      {
        name: 'medical_services_quality_assessment',
        context: 'medical_services_quality_assessment_context'
      },
      {
        name: 'staff_performance_assessment',
        context: 'staff_performance_assessment_context'
      }
    ]
  },
  {
    segment: 'it_process_evaluation',
    templates: [
      {
        name: 'development_process_efficiency_assessment',
        context: 'development_process_efficiency_assessment_context'
      },
      {
        name: 'tool_satisfaction_assessment',
        context: 'tool_satisfaction_assessment_context'
      }
    ]
  },
  {
    segment: 'marketing_market_research',
    templates: [
      {
        name: 'brand_awareness_analysis',
        context: 'brand_awareness_analysis_context'
      },
      {
        name: 'advertising_campaign_effectiveness_assessment',
        context: 'advertising_campaign_effectiveness_assessment_context'
      }
    ]
  },
  {
    segment: 'event_event_evaluation',
    templates: [
      {
        name: 'event_evaluation_by_participants',
        context: 'event_evaluation_by_participants_context'
      },
      {
        name: 'speaker_evaluation',
        context: 'speaker_evaluation_context'
      }
    ]
  }
];

export default function CreateSurveyModal({ onSuccess }) {
  const { t } = useTranslation();
  const [context, setContext] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);

  // Pre-fill context from localStorage if available and context is empty
  useEffect(() => {
    if (!context) {
      const savedTopic = localStorage.getItem('surveyTopic');
      if (savedTopic) {
        setContext(savedTopic);
        localStorage.removeItem('surveyTopic');
      }
    }
  }, [context]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!context.trim()) {
      setError(t('Please fill in the survey goal/context.'));
      return;
    }
    if (context.trim().split(/\s+/).length < 3) {
      setError(t('Please describe the survey goal in more detail. At least 3 words are required for AI to understand the task.'));
      return;
    }
    setIsSubmitting(true);
    try {
      // Generate questions
      const resGen = await fetch(`/api/surveys/generate-questions-advanced`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, n: 6 })
      });
      if (!resGen.ok) {
        setError(t('Error generating questions. Please try again later.'));
        setIsSubmitting(false);
        return;
      }
      const dataGen = await resGen.json();
      const questions = dataGen.questions;
      if (!questions || questions.length === 0) {
        setError(t('AI could not generate questions. Try a different wording.'));
        setIsSubmitting(false);
        return;
      }
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/surveys/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ topic: context, questions })
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.detail && data.detail.includes("active survey")) {
          setError(t('You already have an active survey. Please archive it in the "Current" section before creating a new one.'));
        } else {
          setError(data.detail || t('Error creating survey'));
        }
        setIsSubmitting(false);
        return;
      }
      const created = await res.json();
      if (onSuccess) {
        onSuccess();
      }
      navigate(`/dashboard/surveys/${created.id}/edit`);
    } catch {
      setError(t('Network error. Please try again later.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  // In the component, before rendering, map TEMPLATES to translatedTemplates:
  const translatedTemplates = TEMPLATES.map(seg => ({
    segment: t(seg.segment),
    templates: seg.templates.map(tpl => ({
      name: t(tpl.name),
      context: t(tpl.context)
    }))
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-2xl w-fit mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('Create new survey')}</h2>
        <p className="text-gray-600">{t('AI will automatically generate questions based on your goal')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-3 text-sm font-medium text-gray-700">
            {t('Survey goal/context')}
          </label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400 min-h-[120px] resize-none"
            placeholder={t('For example: Student satisfaction assessment, customer needs research, team performance analysis...')}
            rows={4}
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-2">
            {t('The more detailed the goal, the better the questions will be')}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting || !context.trim()}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('AI is creating questions...')}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              {t('Create survey with AI')}
            </>
          )}
        </motion.button>
      </form>

      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-[98vw] w-full max-h-[80vh] flex flex-col"
            style={{ overflow: 'hidden' }}
          >
            {/* Back button for templates */}
            {selectedSegment !== null && (
              <button
                onClick={() => setSelectedSegment(null)}
                className="absolute top-6 left-6 z-10 bg-white/80 backdrop-blur rounded-full p-2 shadow hover:bg-gray-100 transition"
                aria-label={t('Back')}
                type="button"
              >
                <ArrowLeft className="h-7 w-7 text-gray-500" />
              </button>
            )}
            {selectedSegment === null && (
              <button
                onClick={() => setShowTemplateModal(false)}
                className="absolute top-6 left-6 z-10 bg-white/80 backdrop-blur rounded-full p-2 shadow hover:bg-gray-100 transition"
                aria-label={t('Back')}
                type="button"
              >
                <ArrowLeft className="h-7 w-7 text-gray-500" />
              </button>
            )}
            {/* Title */}
            <div className="pt-10 pb-2 px-8 text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {selectedSegment === null ? t('Choose a segment') : t('Choose a template')}
              </h3>
              <p className="text-gray-500 text-lg">
                {selectedSegment === null
                  ? t('AI will help you get started quickly with ready-made scenarios')
                  : translatedTemplates[selectedSegment].segment}
              </p>
            </div>
            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 overflow-y-auto">
              {selectedSegment === null ? (
                <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                  {translatedTemplates.map((seg, idx) => (
                    <button
                      key={seg.segment}
                      className="w-full px-6 py-5 rounded-3xl bg-white text-primary-900 text-base font-semibold shadow-sm border border-gray-200 hover:bg-purple-50 hover:border-purple-200 hover:shadow-lg transition focus:ring-2 focus:ring-purple-100 focus:outline-none"
                      onClick={() => setSelectedSegment(idx)}
                      type="button"
                    >
                      {seg.segment}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="w-full max-w-2xl flex flex-col gap-4 mt-6">
                  {translatedTemplates[selectedSegment].templates.map((tpl) => (
                    <div
                      key={tpl.name}
                      className="w-full flex flex-col items-start border rounded-2xl p-4 bg-gray-50 shadow-md transition hover:shadow-xl border-gray-200"
                    >
                      <div className="font-semibold text-gray-900 text-base mb-1">{tpl.name}</div>
                      <div className="text-gray-600 text-sm mb-3">{tpl.context}</div>
                      <button
                        className="w-full px-6 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg text-sm"
                        onClick={() => {
                          setContext(tpl.context);
                          setShowTemplateModal(false);
                        }}
                        type="button"
                      >
                        {t('Use this template')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <button
        type="button"
        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition mx-auto flex justify-center"
        onClick={() => setShowTemplateModal(true)}
        tabIndex={-1}
      >
        {t('Choose a template')}
      </button>
    </motion.div>
  );
}