import { Trash2 } from "lucide-react";
import React from "react";
export const questionTypes = [
  ["text", "Short text"],
  ["textarea", "Long text"],
  ["dropdown", "Dropdown"],
  ["radio", "Multiple choice (one answer)"],
  ["email", "Email"],
  ["number", "Number"],
  ["date", "Date"],
];
export function QuestionEditor({ question: q, index, onChange, onRemove }) {
  const choices = ["dropdown", "radio"].includes(q.type);
  return (
    <fieldset className="host-schedule-card">
      <legend>Question {index + 1}</legend>
      <div className="form-row">
        <label>
          Question text
          <input
            aria-label="Question text"
            placeholder="Your question"
            value={q.label}
            required
            onChange={(e) => onChange({ ...q, label: e.target.value })}
          />
        </label>
        <label>
          Question type
          <select
            aria-label={`Question ${index + 1} type`}
            value={q.type || "text"}
            onChange={(e) =>
              onChange({ ...q, type: e.target.value, options: q.options || [] })
            }
          >
            {questionTypes.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {choices && (
        <label>
          Options (one per line)
          <textarea
            aria-label={`Question ${index + 1} options`}
            required
            rows={4}
            placeholder={"Option 1\nOption 2"}
            value={(q.options || []).join("\n")}
            onChange={(e) =>
              onChange({ ...q, options: e.target.value.split("\n") })
            }
          />
          <span className="small-text">
            Each line becomes one selectable option.
          </span>
        </label>
      )}
      <div className="question-actions">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={!!q.required}
            onChange={(e) => onChange({ ...q, required: e.target.checked })}
          />
          Required
        </label>
        <button
          type="button"
          className="question-remove-button"
          title="Remove question"
          aria-label="Remove question"
          onClick={onRemove}
        >
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </div>
    </fieldset>
  );
}
export function BookingQuestion({ question: q, index, value }) {
  const name = `answer_${index}`;
  if (q.type === "radio")
    return (
      <fieldset className="host-schedule-card">
        <legend>
          {q.label}
          {q.required ? " *" : ""}
        </legend>
        {(q.options || []).filter(Boolean).map((option) => (
          <label className="checkbox-label" key={option}>
            <input
              type="radio"
              name={name}
              value={option}
              required={q.required}
              defaultChecked={value === option}
            />
            {option}
          </label>
        ))}
      </fieldset>
    );
  return (
    <label>
      {q.label}
      {q.type === "dropdown" ? (
        <select name={name} required={q.required} defaultValue={value || ""}>
          <option value="">Choose an option</option>
          {(q.options || []).filter(Boolean).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : q.type === "textarea" ? (
        <textarea
          name={name}
          required={q.required}
          maxLength={1500}
          defaultValue={value || ""}
        />
      ) : (
        <input
          name={name}
          type={["email", "number", "date"].includes(q.type) ? q.type : "text"}
          required={q.required}
          maxLength={1500}
          step={q.type === "number" ? "any" : undefined}
          defaultValue={value || ""}
        />
      )}
    </label>
  );
}
