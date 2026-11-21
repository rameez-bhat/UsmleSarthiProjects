import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeQuestions, validateQuestionAnswers } from "../questions.js";
test("legacy text questions and choice options normalize without losing required settings", () => {
  assert.deepEqual(normalizeQuestions([{ label: " Goal ", required: true }]), [
    { label: "Goal", type: "text", required: true },
  ]);
  assert.deepEqual(
    normalizeQuestions([
      { label: "Level", type: "dropdown", options: [" A ", "B", "A", ""] },
    ])[0].options,
    ["A", "B"],
  );
  assert.throws(
    () =>
      normalizeQuestions([{ label: "Level", type: "dropdown", options: [] }]),
    /options/,
  );
  assert.throws(
    () => normalizeQuestions([{ label: "Level", type: "unsupported" }]),
    /type/,
  );
});
test("server validates dropdown and radio choices and required answers", () => {
  const questions = normalizeQuestions([
    {
      label: "Exam",
      type: "dropdown",
      required: true,
      options: ["Step 1", "Step 2"],
    },
    { label: "Format", type: "radio", options: ["Online", "In person"] },
  ]);
  assert.doesNotThrow(() =>
    validateQuestionAnswers(questions, ["Step 2", "Online"]),
  );
  assert.throws(
    () => validateQuestionAnswers(questions, ["Step 3", "Online"]),
    /available option/,
  );
  assert.throws(
    () => validateQuestionAnswers(questions, ["", ""]),
    /Please answer/,
  );
  assert.throws(
    () => validateQuestionAnswers(questions, ["Step 1", "Invented"]),
    /available option/,
  );
});
test("typed answers accept real values and reject malformed dates, numbers and emails", () => {
  const questions = [
    { label: "Email", type: "email" },
    { label: "Attempts", type: "number" },
    { label: "Date", type: "date" },
  ];
  assert.doesNotThrow(() =>
    validateQuestionAnswers(questions, ["a@example.com", "2", "2026-12-01"]),
  );
  assert.throws(
    () => validateQuestionAnswers(questions, ["bad", "2", "2026-12-01"]),
    /valid email/,
  );
  assert.throws(
    () =>
      validateQuestionAnswers(questions, [
        "a@example.com",
        "NaN",
        "2026-12-01",
      ]),
    /valid number/,
  );
  assert.throws(
    () =>
      validateQuestionAnswers(questions, ["a@example.com", "2", "2026-02-31"]),
    /valid date/,
  );
});
