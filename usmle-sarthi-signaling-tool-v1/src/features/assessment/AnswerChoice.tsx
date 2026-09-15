function AnswerChoice({
  program,
  answerMode,
  onEdit,
  onCalculate,
  onBack,
  message
}: any) {
  return (
    <>
      <div className="pageTitle">
        <div>
          <div className="eyebrow">
            SAVED ANSWERS
          </div>

          <h1>
            {program?.program_name}
          </h1>

          <p className="muted">
            {answerMode === 'program'
              ? 'This program already has saved answers.'
              : 'Your answers from the first assessed program are ready to reuse.'}
          </p>
        </div>
      </div>

      {message && (
        <div className="notice danger">
          {message}
        </div>
      )}

      <div className="card">
        <h3>
          How would you like to continue?
        </h3>

        <p className="muted">
          You do not need to answer every question again. Calculate with the saved answers, or edit them first for this program.
        </p>

        <div className="actions">
          <button
            className="ghost"
            onClick={onBack}
          >
            Back
          </button>

          <button
            className="secondary"
            onClick={onEdit}
          >
            Edit answers for this program
          </button>

          <button
            onClick={onCalculate}
          >
            Calculate result
          </button>
        </div>
      </div>
    </>
  );
}


/*
 * Assessment
 */


export default AnswerChoice;
