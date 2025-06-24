import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { BACKEND_URL } from '../config';

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
  const [context, setContext] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!context.trim()) {
      setError("Заполните цель/контекст опроса.");
      return;
    }
    if (context.trim().split(/\s+/).length < 3) {
      setError("Пожалуйста, опишите цель опроса более подробно. Нужно как минимум 3 слова, чтобы AI понял задачу.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Generate questions
      const resGen = await fetch(`${BACKEND_URL}/surveys/generate-questions-advanced`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, n: 6 })
      });
      if (!resGen.ok) {
        setError("Ошибка генерации вопросов. Попробуйте позже.");
        setIsSubmitting(false);
        return;
      }
      const dataGen = await resGen.json();
      const questions = dataGen.questions;
      if (!questions || questions.length === 0) {
        setError("AI не смог сгенерировать вопросы. Попробуйте другую формулировку.");
        setIsSubmitting(false);
        return;
      }
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/surveys/`, {
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
          setError("У вас уже есть активный опрос. Пожалуйста, архивируйте его в разделе 'Текущие' перед созданием нового.");
        } else {
          setError(data.detail || "Ошибка создания опроса");
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
      setError("Ошибка сети. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-2xl w-fit mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Создать новый опрос</h2>
        <p className="text-gray-600">AI автоматически сгенерирует вопросы на основе вашей цели</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-3 text-sm font-medium text-gray-700">
            Цель/контекст опроса
          </label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400 min-h-[120px] resize-none"
            placeholder="Например: Оценка удовлетворенности студентов университетом, исследование потребностей клиентов, анализ работы команды..."
            rows={4}
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-2">
            Чем подробнее опишете цель, тем лучше будут вопросы
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
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              AI создает вопросы...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Создать опрос с AI
            </>
          )}
        </motion.button>
      </form>

      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl p-8 sm:p-14 shadow-2xl relative w-full flex flex-col"
            style={{ minHeight: 600, maxWidth: '1400px' }}
          >
            <div className="flex items-center mb-10">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="mr-4 p-3 rounded-full hover:bg-gray-100 transition"
                aria-label="Назад"
                type="button"
              >
                <ArrowLeft className="h-7 w-7 text-gray-500" />
              </button>
              <h3 className="text-3xl font-bold flex-1 text-gray-900">Выберите сегмент и шаблон</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="ml-auto text-gray-400 hover:text-gray-700 text-3xl font-bold px-2"
                aria-label="Закрыть"
                type="button"
              >×</button>
            </div>
            <div className="flex flex-col md:flex-row gap-12 h-full">
              <div className="md:w-1/3">
                <div className="font-semibold mb-4 text-gray-700 text-lg">Сегменты:</div>
                <ul className="space-y-4">
                  {TEMPLATES.map((seg, idx) => (
                    <li key={seg.segment}>
                      <button
                        className={`w-full text-left px-6 py-4 rounded-2xl transition font-semibold border border-transparent shadow-md text-lg
                          ${selectedSegment === idx ? 'bg-primary-100 text-primary-700 border-primary-300 ring-2 ring-primary-200 scale-105' : 'hover:bg-gray-100 hover:border-gray-200'}
                        `}
                        onClick={() => setSelectedSegment(idx)}
                        type="button"
                      >
                        {seg.segment}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:w-2/3">
                <div className="font-semibold mb-4 text-gray-700 text-lg">Шаблоны:</div>
                {selectedSegment === null ? (
                  <div className="text-gray-400 text-center mt-20 text-lg">Сначала выберите сегмент</div>
                ) : (
                  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TEMPLATES[selectedSegment].templates.map((tpl, tIdx) => (
                      <li key={tpl.name} className={`border rounded-2xl p-6 flex flex-col gap-3 bg-gray-50 shadow-md transition
                        hover:shadow-xl ${context === tpl.context ? 'border-primary-400 ring-2 ring-primary-200 scale-105' : 'border-gray-200'}`}
                      >
                        <div className="font-semibold text-gray-900 text-xl flex items-center gap-2">
                          {tpl.name}
                          {context === tpl.context && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700">Выбрано</span>
                          )}
                        </div>
                        <div className="text-gray-600 text-base mb-2">{tpl.context}</div>
                        <button
                          className="self-start px-6 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition shadow-lg mt-2 text-base"
                          onClick={() => {
                            setContext(tpl.context);
                            setShowTemplateModal(false);
                          }}
                          type="button"
                        >
                          Использовать этот шаблон
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}