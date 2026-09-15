import Eligibility from './Eligibility';


/* =========================================================
   HELP TEXT
========================================================= */

const help: any = {

  Q1:
    'Applicant type means U.S. IMG versus non-U.S. IMG / visa-requiring status as applicable.',


  Q2:
    'Compare your Step 2 CK score with the program’s reported interview-score distribution, not with a general national percentile.',


  Q3:
    'Use the relevant signal tier where tiered invitation data are available. Source N/A means the information is genuinely unavailable after checking.',


  Q4:
    'Compare the program’s interview invitation percentage with Internal Medicine norms rather than interpreting the percentage in isolation.',


  Q5:
    'Use recent application-volume information when available. Source N/A should be used only when reliable trend information cannot be found.',


  S1:
    'Compare visa/work authorization, YOG, Step 2 CK, attempts, USCE and recency using reliable evidence.',


  S2:
    'No comparable information available is neutral; it is not automatically a negative.',


  R1:
    'Program experience includes substantive clinical rotation or research relationships. Direct experience and active advocacy are scored separately.',


  R2:
    'Knowing someone is different from having someone who has actually agreed to advocate for you.',


  R3:
    'Select the strongest meaningful response or encouragement you personally received from the program.',


  A1:
    'Use the current resident roster or another reliable source. Absence from a resident list does not prove the program has never accepted graduates from that school or country.',


  A2:
    'Consider how your overall academic and research profile fits the program’s type and emphasis rather than publication count alone.',


  A3:
    'A credible geographic tie can include family, prior residence/work/training, or another durable connection; it is distinct from ERAS preference.',


  A4:
    'Consider specialty-specific USCE, letters, previous training/work, research and the overall consistency of your Internal Medicine profile.',


  P1:
    'Prior application history is informational and does not add scoring points in the current configuration.'

};


/* =========================================================
   COMPONENT
========================================================= */

export default function Assessment({

  config,

  answers,

  setAnswer,

  override,

  setOverride,

  program,

  onCalculate,

  onBack,

  message

}: any) {


  /* =======================================================
     ELIGIBILITY
  ======================================================= */

  const requiredEligibility = [
    'E1',
    'E2',
    'E3A',
    'E3B',
    'E4'
  ];


  const allAnswered =
    requiredEligibility.every(
      code =>
        Boolean(
          answers?.[code]
        )
    );


  const researchNeeded =
    requiredEligibility.some(
      code =>
        answers?.[code] ===
        'NOT_VERIFIED'
    );


  const mismatched =
    requiredEligibility.some(
      code =>
        answers?.[code] ===
        'NOT_ALIGNED'
    );


  const validOverride =
    mismatched &&
    answers?.E5 &&
    answers.E5 !==
      'NO_OVERRIDE' &&
    override?.note &&
    override?.date;


  const scoringUnlocked =
    allAnswered &&
    !researchNeeded &&
    (
      !mismatched ||
      validOverride
    );


  const unresolved =
    requiredEligibility.find(
      code =>
        !answers?.[code] ||
        answers?.[code] ===
          'NOT_VERIFIED'
    );


  /* =======================================================
     PROGRAM QUESTIONS
  ======================================================= */

  const programSpecificQuestions =
    config?.programSpecificQuestions ||
    [];


  const answerOptions =
    config?.answer_options ||
    {};


  /* =======================================================
     FIND INTERNAL ANSWER CODE FROM DISPLAY LABEL

     Example:

     visible:
       "Very strong"

     saved:
       "VERY_STRONG"
  ======================================================= */

  const getAnswerByLabel = (
    questionCode: string,
    label: string
  ) => {

    return (
      answerOptions?.[
        questionCode
      ] || []
    ).find(
      (option: any) =>
        option.answer_label ===
        label
    );

  };


  /* =======================================================
     FIND SECTION FROM MAIN QUESTIONS CONFIG

     Keeps programSpecificQuestions clean in your
     preferred structure.
  ======================================================= */

  const getQuestionMeta = (
    code: string
  ) => {

    return (
      config?.questions ||
      []
    ).find(
      (question: any) =>
        question.question_code ===
        code
    );

  };


  /* =======================================================
     SELECT ANSWER

     UI works from answer_label.
     Firestore/scoring saves answer_code.
  ======================================================= */

  const selectAnswer = (
    question: any,
    label: string
  ) => {

    const option =
      getAnswerByLabel(
        question.code,
        label
      );


    /*
     * Do not save the visible string if the scoring
     * mapping cannot be found.
     *
     * This protects the scoring engine from invalid
     * answer values.
     */
    if (!option?.answer_code) {

      console.error(
        `No answer code found for ${question.code}: ${label}`
      );

      return;
    }


    setAnswer(
      question.code,
      option.answer_code
    );

  };


  /* =======================================================
     CHECK SELECTED STATE
  ======================================================= */

  const isSelected = (
    question: any,
    label: string
  ) => {

    const option =
      getAnswerByLabel(
        question.code,
        label
      );


    return (
      option?.answer_code &&
      answers?.[
        question.code
      ] ===
        option.answer_code
    );

  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="pageTitle">

        <div>

          <div className="eyebrow">
            PROGRAM ASSESSMENT
          </div>


          <h1>
            {program?.program_name ||
              'Program'}
          </h1>


          <p className="muted">

            {[
              program?.city,
              program?.state
            ]
              .filter(Boolean)
              .join(', ')}


            {program?.Frieda
              ? ` · FREIDA ${program.Frieda}`
              : ''}

          </p>

        </div>

      </div>


      {/* ===================================================
          ERROR MESSAGE
      =================================================== */}

      {message && (

        <div className="notice danger">
          {message}
        </div>

      )}


      {/* ===================================================
          RESEARCH GUIDE
      =================================================== */}

      <div className="notice info">

        <b>
          Research guide:
        </b>

        {' '}

        Review the Sarthi List first.

        Confirm unclear or
        time-sensitive policies using
        the official program website,
        Residency Explorer and FREIDA.

      </div>


      {/* ===================================================
          ELIGIBILITY
      =================================================== */}

      <Eligibility

        answers={
          answers
        }

        setAnswer={
          setAnswer
        }

        override={
          override
        }

        setOverride={
          setOverride
        }

      />


      {/* ===================================================
          RESEARCH NEEDED
      =================================================== */}

      {researchNeeded && (

        <div className="notice warning">

          <b>
            Research needed before scoring.
          </b>

          {' '}

          {unresolved
            ? `${unresolved} has not been confirmed.`
            : 'One or more eligibility requirements have not been confirmed.'}

          {' '}

          Resolve the eligibility item
          before a reliable recommendation
          can be calculated.

        </div>

      )}


      {/* ===================================================
          ELIGIBILITY MISMATCH
      =================================================== */}

      {mismatched &&
        !validOverride && (

          <div className="notice danger">

            <b>
              Eligibility mismatch.
            </b>

            {' '}

            A reported requirement is not
            aligned.

            Without a documented override,
            the recommendation is
            Do not signal.

          </div>

        )}


      {/* ===================================================
          PROGRAM-SPECIFIC EVIDENCE
      =================================================== */}

      {(scoringUnlocked || 1) && (

        <>

          <div className="sectionTitle">

            <div className="eyebrow">
              PROGRAM SCORING
            </div>

            <h2>
              Program-specific evidence
            </h2>

            <p className="muted">
              Answer each item using the strongest
              reliable evidence available for this
              specific program.
            </p>

          </div>


          <div className="questionStack">

            {programSpecificQuestions.map(
              (question: any) => {


                const meta =
                  getQuestionMeta(
                    question.code
                  );


                return (

                  <div
                    className="card question"
                    key={
                      question.code
                    }
                  >

                    {/* ===============================
                        QUESTION HEADER
                    =============================== */}

                    <div className="questionHead">


                      <span className="code">
                        {question.code}
                      </span>


                      <div>


                        <small>

                          {meta?.section
                            ? `${meta.section} · `
                            : ''}

                          {
                            question.component
                          }

                        </small>


                        <h3>
                          {
                            question.prompt
                          }
                        </h3>


                        {help[
                          question.code
                        ] && (

                          <p className="helpText">

                            ⓘ{' '}

                            {
                              help[
                                question.code
                              ]
                            }

                          </p>

                        )}

                      </div>

                    </div>


                    {/* ===============================
                        OPTIONS
                    =============================== */}

                    <div className="options">


                      {(
                        question.options ||
                        []
                      ).map(
                        (
                          label: string
                        ) => {


                          const selected =
                            isSelected(
                              question,
                              label
                            );


                          return (

                            <label

                              key={
                                `${question.code}-${label}`
                              }

                              className={
                                'option ' +
                                (
                                  selected
                                    ? 'selected'
                                    : ''
                                )
                              }

                            >


                              <input

                                type="radio"

                                name={
                                  question.code
                                }

                                checked={
                                  Boolean(
                                    selected
                                  )
                                }

                                onChange={() =>
                                  selectAnswer(
                                    question,
                                    label
                                  )
                                }

                              />


                              <span>
                                {label}
                              </span>


                            </label>

                          );

                        }
                      )}


                    </div>

                  </div>

                );

              }
            )}

          </div>

        </>

      )}


      {/* ===================================================
          ACTIONS
      =================================================== */}

      <div className="actions">


        <button

          type="button"

          className="ghost"

          onClick={
            onBack
          }

        >

          Back to selected programs

        </button>


        <button

          type="button"

          onClick={
            onCalculate
          }

        >

          {
            scoringUnlocked
              ? 'Calculate result'
              : mismatched
                ? 'Save eligibility state'
                : 'Save progress'
          }

        </button>


      </div>

    </>
  );

}