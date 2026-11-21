import React from "react";
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { QuestionEditor, BookingQuestion } from "./components/QuestionFields";
afterEach(cleanup);
test("choosing Dropdown exposes the per-question option editor", () => {
  const change = vi.fn();
  const { rerender } = render(
    <QuestionEditor
      question={{ label: "Exam", required: true }}
      index={0}
      onChange={change}
      onRemove={vi.fn()}
    />,
  );
  fireEvent.change(screen.getByLabelText("Question 1 type"), {
    target: { value: "dropdown" },
  });
  expect(change.mock.calls[0][0]).toMatchObject({
    type: "dropdown",
    options: [],
    required: true,
  });
  rerender(
    <QuestionEditor
      question={{
        label: "Exam",
        type: "dropdown",
        options: ["Step 1", "Step 2"],
      }}
      index={0}
      onChange={change}
      onRemove={vi.fn()}
    />,
  );
  expect(screen.getByLabelText("Question 1 options").value).toBe(
    "Step 1\nStep 2",
  );
});
test("booking form submits dropdown and radio answers as the existing ordered answer strings", () => {
  const { container } = render(
    <form>
      <BookingQuestion
        question={{
          label: "Exam",
          type: "dropdown",
          options: ["Step 1", "Step 2"],
          required: true,
        }}
        index={0}
      />
      <BookingQuestion
        question={{
          label: "Format",
          type: "radio",
          options: ["Online", "In person"],
        }}
        index={1}
      />
    </form>,
  );
  fireEvent.change(screen.getByLabelText("Exam"), {
    target: { value: "Step 2" },
  });
  fireEvent.click(screen.getByLabelText("Online"));
  const data = new FormData(container.querySelector("form"));
  expect(data.get("answer_0")).toBe("Step 2");
  expect(data.get("answer_1")).toBe("Online");
});
