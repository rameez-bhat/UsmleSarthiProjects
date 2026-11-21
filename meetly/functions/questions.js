import { HttpsError } from "firebase-functions/v2/https";
const invalid = (message) => {
  throw new HttpsError("invalid-argument", message);
};
const types = [
  "text",
  "textarea",
  "dropdown",
  "radio",
  "email",
  "number",
  "date",
];
export function normalizeQuestions(input) {
  if (input === undefined) return [];
  if (!Array.isArray(input) || input.length > 10)
    invalid("Add at most 10 questions.");
  return input.map((q, i) => {
    if (!q || typeof q !== "object") invalid(`Invalid question ${i + 1}.`);
    const label = String(q.label || "")
        .trim()
        .slice(0, 160),
      type = q.type || "text";
    if (!label || !types.includes(type))
      invalid(`Choose valid text and type for question ${i + 1}.`);
    const result = { label, type, required: !!q.required };
    if (["dropdown", "radio"].includes(type)) {
      if (
        !Array.isArray(q.options) ||
        q.options.some((o) => typeof o !== "string")
      )
        invalid(`Add options for question ${i + 1}.`);
      const options = [
        ...new Set(q.options.map((o) => o.trim()).filter(Boolean)),
      ];
      if (
        !options.length ||
        options.length > 50 ||
        options.some((o) => o.length > 200)
      )
        invalid(
          `Question ${i + 1} needs 1–50 options, each up to 200 characters.`,
        );
      result.options = options;
    }
    return result;
  });
}
export function validateQuestionAnswers(questions = [], answers = []) {
  for (const [i, q] of questions.entries()) {
    const value = answers[i] || "";
    if (!value) {
      if (q.required) invalid(`Please answer: ${q.label}`);
      continue;
    }
    if (
      ["dropdown", "radio"].includes(q.type) &&
      !(q.options || []).includes(value)
    )
      invalid(`Choose an available option for: ${q.label}`);
    if (q.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      invalid(`Enter a valid email for: ${q.label}`);
    if (q.type === "number" && !Number.isFinite(Number(value)))
      invalid(`Enter a valid number for: ${q.label}`);
    if (
      q.type === "date" &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        !Number.isFinite(Date.parse(value + "T00:00:00Z")) ||
        new Date(value + "T00:00:00Z").toISOString().slice(0, 10) !== value)
    )
      invalid(`Enter a valid date for: ${q.label}`);
  }
}
