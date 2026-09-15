import { useEffect, useState } from 'react';
import { specialties } from '../../config/app';

function Dashboard({
  assessments,
  createAssessment,
  resume,
  message
}: any) {

  const existingSpecialties =
    new Set(
      assessments
        .map(
          (item: any) =>
            String(
              item.specialty || ''
            )
        )
        .filter(Boolean)
    );

  const firstAvailable =
    specialties.find(
      specialty =>
        !existingSpecialties.has(
          specialty
        )
    ) || '';

  const [newSpecialty, setNewSpecialty] =
    useState(firstAvailable);

  useEffect(
    () => {
      if (
        !newSpecialty ||
        existingSpecialties.has(
          newSpecialty
        )
      ) {
        setNewSpecialty(
          specialties.find(
            specialty =>
              !existingSpecialties.has(
                specialty
              )
          ) || ''
        );
      }
    }, [assessments]);

  return (
    <>
      <div className="pageTitle">
        <div>
          <div className="eyebrow">
            ASSESSMENTS
          </div>

          <h1>
            Your signaling workspace
          </h1>

          <p className="muted">
            One assessment is allowed per specialty.
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
          Start a specialty assessment
        </h3>

        <div className="actions">
          <select
            value={newSpecialty}
            onChange={
              e =>
                setNewSpecialty(
                  e.target.value
                )
            }
          >
            <option value="">
              Select specialty
            </option>

            {specialties.map(
              specialty => (
                <option
                  key={specialty}
                  value={specialty}
                  disabled={
                    existingSpecialties.has(
                      specialty
                    )
                  }
                >
                  {specialty}
                  {existingSpecialties.has(specialty)
                    ? ' — already started'
                    : ''}
                </option>
              )
            )}
          </select>

          <button
            disabled={!newSpecialty}
            onClick={() =>
              createAssessment(
                newSpecialty
              )
            }
          >
            Start assessment
          </button>
        </div>
      </div>

      <div className="grid">
        {assessments.map(
          (a: any) => (
            <div
              className="card"
              key={a.id}
            >
              <span className="badge">
                {a.status || 'DRAFT'}
              </span>

              <h3>
                {a.specialty || 'Assessment'}
              </h3>

              <p className="muted">
                Match season {a.season || 2027}
              </p>

              <button
                className="secondary"
                onClick={() =>
                  resume(a)
                }
              >
                Resume
              </button>
            </div>
          )
        )}
      </div>

      {!assessments.length && (
        <div className="card empty">
          No assessments yet.
        </div>
      )}
    </>
  );
}



/*
 * Applicant profile
 */


export default Dashboard;
