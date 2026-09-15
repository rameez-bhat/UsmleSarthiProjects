import AnswerChoice from './AnswerChoice';

function Assessment({
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

  const eligibility =
    [
      'E1',
      'E2',
      'E3',
      'E4'
    ];


  const hasMismatch =
    eligibility.some(
      q =>
        answers[q] ===
        'NOT_ALIGNED'
    );


  const eligibilityResolved =
    eligibility.every(
      q =>

        answers[q] &&

        answers[q] !==
          'NOT_VERIFIED'
    ) &&

    (
      !hasMismatch ||

      (
        answers.E5 &&

        answers.E5 !==
          'NO_OVERRIDE'
      )
    );


  const visible =
    (q: any) => {

      if (
        q.question_code
          .startsWith('E')
      ) {

        return (

          q.question_code !==
            'E5' ||

          hasMismatch

        );

      }


      return (
        eligibilityResolved
      );

    };


  return (
    <>

      <div className="pageTitle">

        <div>

          <div className="eyebrow">
            PROGRAM ASSESSMENT
          </div>


          <h1>
            {
              program &&
              program.program_name
            }
          </h1>


          <p className="muted">
            Eligibility first, scoring second.
          </p>

        </div>

      </div>


      {message && (

        <div className="notice danger">
          {message}
        </div>

      )}


      {!config && (

        <div className="notice">
          Scoring configuration is still loading.
        </div>

      )}


      <div className="questionStack">

        {
          config &&
          config.questions &&
          config.questions
            .filter(
              visible
            )
            .map(
              (q: any) => (

                <div

                  className="card question"

                  key={
                    q.question_code
                  }

                >

                  <div className="questionHead">

                    <span className="code">

                      {
                        q.question_code
                      }

                    </span>


                    <div>

                      <small>

                        {
                          q.section
                        }

                        {' · '}

                        {
                          q.component
                        }

                      </small>


                      <h3>

                        {
                          q.prompt
                        }

                      </h3>

                    </div>

                  </div>


                  <div className="options">

                    {
                      (
                        config
                          .answer_options[
                            q.question_code
                          ] ||
                        []
                      )
                        .map(
                          (o: any) => (

                            <label

                              className={
                                'option ' +

                                (
                                  answers[
                                    q.question_code
                                  ] ===
                                  o.answer_code

                                    ? 'selected'

                                    : ''
                                )
                              }

                              key={
                                o.answer_code
                              }

                            >

                              <input

                                type="radio"

                                name={
                                  q.question_code
                                }

                                checked={
                                  answers[
                                    q.question_code
                                  ] ===
                                  o.answer_code
                                }

                                onChange={() =>
                                  setAnswer(
                                    q.question_code,
                                    o.answer_code
                                  )
                                }

                              />


                              <span>
                                {
                                  o.answer_label
                                }
                              </span>

                            </label>

                          )
                        )
                    }

                  </div>


                  {
                    q.question_code ===
                      'E5' &&

                    answers.E5 &&

                    answers.E5 !==
                      'NO_OVERRIDE' && (

                    <div className="overrideGrid">

                      <input

                        placeholder="Override reason code"

                        value={
                          override.reason_code
                        }

                        onChange={
                          e =>
                            setOverride({
                              ...override,

                              reason_code:
                                e.target.value
                            })
                        }

                      />


                      <input

                        type="date"

                        value={
                          override.date
                        }

                        onChange={
                          e =>
                            setOverride({
                              ...override,

                              date:
                                e.target.value
                            })
                        }

                      />


                      <textarea

                        placeholder="Mandatory override note"

                        value={
                          override.note
                        }

                        onChange={
                          e =>
                            setOverride({
                              ...override,

                              note:
                                e.target.value
                            })
                        }

                      />

                    </div>

                  )}

                </div>

              )
            )
        }

      </div>


      <div className="actions">

        <button

          className="ghost"

          onClick={
            onBack
          }

        >
          Back
        </button>


        <button
          onClick={
            onCalculate
          }
        >
          Calculate result
        </button>

      </div>

    </>
  );

}


/*
 * Result
 */


export default Assessment;
