import Metric from './Metric';
import Reasons from './Reasons';

function Result({
  result,
  program,
  onBack,
  onEdit
}: any) {

  if (!result) {
    return null;
  }


  return (
    <>

      <div className="pageTitle">

        <div>

          <div className="eyebrow">
            PROGRAM RESULT
          </div>


          <h1>

            {
              program &&
              program.program_name
            }

          </h1>

        </div>

      </div>


      <div className="resultGrid">

        <div className="scoreHero card">

          <span>
            Final Priority
          </span>


          <strong>

            {
              result.final_priority

                ? Number(
                    result
                      .final_priority
                      .score
                  ).toFixed(1)

                : '—'
            }

          </strong>


          <b>

            {
              result
                .final_priority
                ?.label ||

              result
                .recommendation_code
            }

          </b>

        </div>


        <Metric

          title="Eligibility"

          value={
            result
              .eligibility
              ?.status
          }

        />


        <Metric

          title="Application Fit"

          value={
            result
              .application_fit

              ? `${Number(
                  result
                    .application_fit
                    .score
                ).toFixed(1)} · ${
                  result
                    .application_fit
                    .label
                }`

              : '—'
          }

        />


        <Metric

          title="Signal Value"

          value={
            result
              .signal_value

              ? `${Number(
                  result
                    .signal_value
                    .score
                ).toFixed(1)} · ${
                  result
                    .signal_value
                    .label
                }`

              : '—'
          }

        />


        <Metric

          title="Confidence"

          value={
            result.confidence ||
            '—'
          }

        />


        <Metric

          title="Recommendation"

          value={
            result
              .recommendation_code ||
            '—'
          }

        />

      </div>


      <div className="twoCol">

        <Reasons

          title="Top positive reasons"

          items={
            result
              .positive_reasons ||
            []
          }

        />


        <Reasons

          title="Warnings / negatives"

          items={[

            ...(
              result
                .negative_reasons ||
              []
            ),

            ...(
              result
                .warnings ||
              []
            )

          ]}

        />

      </div>


      <div className="actions">

        <button

          className="ghost"

          onClick={
            onBack
          }

        >
          Program workspace
        </button>


        <button
          onClick={
            onEdit
          }
        >
          Edit answers
        </button>

      </div>

    </>
  );

}




export default Result;
