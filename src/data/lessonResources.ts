export interface LessonResource { label: string; url: string; source: string; }

export const lessonResources: Record<number, LessonResource[]> = {
  1: [
    { label: "Machine Learning Crash Course", url: "https://developers.google.com/machine-learning/crash-course", source: "Google for Developers" },
    { label: "NIST AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework", source: "NIST" },
  ],
  2: [
    { label: "Google Machine Learning learning resources", url: "https://developers.google.com/machine-learning", source: "Google for Developers" },
    { label: "NIST AI Resource Center", url: "https://airc.nist.gov/", source: "NIST" },
  ],
  3: [
    { label: "Hugging Face LLM Course", url: "https://huggingface.co/learn/llm-course/en/chapter1/1", source: "Hugging Face" },
    { label: "OWASP GenAI Security resources", url: "https://genai.owasp.org/", source: "OWASP" },
  ],
  4: [
    { label: "Google Search Central: Sitemaps", url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap", source: "Google Search Central" },
    { label: "NIST AI Resource Center", url: "https://airc.nist.gov/", source: "NIST" },
  ],
  5: [
    { label: "NIST AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework", source: "NIST" },
    { label: "OWASP GenAI Security Project", url: "https://genai.owasp.org/", source: "OWASP" },
  ],
  6: [
    { label: "Google Machine Learning Crash Course", url: "https://developers.google.com/machine-learning/crash-course", source: "Google for Developers" },
    { label: "NIST AI Resource Center", url: "https://airc.nist.gov/", source: "NIST" },
  ],
  7: [
    { label: "Production ML Systems", url: "https://developers.google.com/machine-learning/crash-course/production-ml-systems", source: "Google for Developers" },
    { label: "OWASP GenAI Security Project", url: "https://genai.owasp.org/", source: "OWASP" },
  ],
  8: [
    { label: "NIST AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework", source: "NIST" },
    { label: "OWASP Top 10 for LLM and GenAI", url: "https://genai.owasp.org/llm-top-10/", source: "OWASP" },
  ],
};
