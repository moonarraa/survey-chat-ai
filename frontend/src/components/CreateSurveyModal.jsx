import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { BACKEND_URL } from '../config';
import { useTranslation } from 'react-i18next';

const TEMPLATES = [
  {
    segment: 'Обратная связь по продукту',
    templates: [
      {
        name: 'Обратная связь по продукту',
        context: 'Сбор отзывов пользователей о новом мобильном приложении для выявления сильных и слабых сторон продукта.'
      },
      {
        name: 'Оценка качества поддержки',
        context: 'Оценка удовлетворенности клиентов качеством технической поддержки.'
      },
      {
        name: 'Оценка интерфейса',
        context: 'Собрать мнения пользователей о простоте и удобстве интерфейса продукта.'
      }
    ]
  },
  {
    segment: 'HR / Оценка сотрудников',
    templates: [
      {
        name: 'Оценка вовлеченности сотрудников',
        context: 'Провести опрос для оценки вовлеченности сотрудников компании и выявления зон для улучшения корпоративной культуры.'
      },
      {
        name: 'Оценка адаптации новых сотрудников',
        context: 'Собрать обратную связь от новых сотрудников о процессе адаптации в компании.'
      },
      {
        name: 'Оценка удовлетворенности условиями труда',
        context: 'Провести опрос среди сотрудников для оценки условий труда и выявления потребностей.'
      }
    ]
  },
  {
    segment: 'Образование / Оценка курса',
    templates: [
      {
        name: 'Оценка курса студентами',
        context: 'Провести опрос среди студентов для оценки качества учебного курса и преподавания.'
      },
      {
        name: 'Оценка преподавателя',
        context: 'Собрать обратную связь о работе преподавателя по итогам семестра.'
      },
      {
        name: 'Оценка учебных материалов',
        context: 'Провести опрос для оценки полезности и доступности учебных материалов.'
      }
    ]
  },
  {
    segment: 'Продажи / Опрос клиентов',
    templates: [
      {
        name: 'Оценка удовлетворенности клиентов',
        context: 'Провести опрос среди клиентов для оценки их удовлетворенности сервисом и выявления потребностей.'
      },
      {
        name: 'Исследование причин отказа от покупки',
        context: 'Собрать мнения клиентов, которые не совершили покупку, чтобы понять причины отказа.'
      }
    ]
  },
  {
    segment: 'Медицина / Опрос пациентов',
    templates: [
      {
        name: 'Оценка качества медицинских услуг',
        context: 'Собрать обратную связь от пациентов о качестве оказанных медицинских услуг.'
      },
      {
        name: 'Оценка работы персонала',
        context: 'Провести опрос среди пациентов для оценки работы медицинского персонала.'
      }
    ]
  },
  {
    segment: 'IT / Оценка процессов',
    templates: [
      {
        name: 'Оценка эффективности процессов разработки',
        context: 'Провести опрос среди команды разработки для выявления узких мест и улучшения процессов.'
      },
      {
        name: 'Оценка удовлетворенности инструментами',
        context: 'Собрать мнения сотрудников о качестве и удобстве используемых IT-инструментов.'
      }
    ]
  },
  {
    segment: 'Маркетинг / Исследование рынка',
    templates: [
      {
        name: 'Анализ узнаваемости бренда',
        context: 'Провести опрос для оценки узнаваемости бренда среди целевой аудитории.'
      },
      {
        name: 'Оценка эффективности рекламной кампании',
        context: 'Собрать мнения клиентов о новой рекламной кампании.'
      }
    ]
  },
  {
    segment: 'Event / Оценка мероприятия',
    templates: [
      {
        name: 'Оценка мероприятия участниками',
        context: 'Провести опрос среди участников для оценки организации и содержания мероприятия.'
      },
      {
        name: 'Оценка спикеров',
        context: 'Собрать обратную связь о выступлениях спикеров на мероприятии.'
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
        if (data.detail && data.detail.includes("уже есть активный опрос")) {
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