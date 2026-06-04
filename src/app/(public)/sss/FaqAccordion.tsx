"use client";

import { useState } from "react";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    id: "faq-1",
    question: "Platform nedir?",
    answer: "Platformumuz, öğrenci ve eğitmenleri bir araya getiren, dijital materyallerin güvenle paylaşıldığı yenilikçi bir eğitim ekosistemidir."
  },
  {
    id: "faq-2",
    question: "Nasıl kayıt olunur?",
    answer: "Platform kayıt gerektirmez. Doğrudan materyalleri keşfedebilir ve indirebilirsiniz. İçerik yüklemek için gerekli bilgileri doldurmanız yeterlidir."
  },
  {
    id: "faq-3",
    question: "İçerikler güvenli mi?",
    answer: "Evet, platforma yüklenen tüm içerikler uzman moderatörlerimiz tarafından incelenir ve otomatik güvenlik taramalarından geçirildikten sonra yayına alınır."
  }
];

export default function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId((prevId) => (prevId === id ? null : id));
  };

  return (
    <div className="divide-y divide-gray-200">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;

        return (
          <div key={faq.id} className="py-4 first:pt-0 last:pb-0">
            <h3>
              <button
                type="button"
                id={`accordion-button-${faq.id}`}
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${faq.id}`}
                onClick={() => toggleItem(faq.id)}
                className="flex w-full items-center justify-between text-left text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4 rounded-md transition-colors"
              >
                <span className="font-medium text-base sm:text-lg">{faq.question}</span>
                <span className="ml-6 flex h-7 items-center">
                  <svg
                    className={`h-5 w-5 transform transition-transform duration-200 text-gray-500 ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={`accordion-panel-${faq.id}`}
              role="region"
              aria-labelledby={`accordion-button-${faq.id}`}
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="pt-3 pb-2 text-gray-600 sm:text-base text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}