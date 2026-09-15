import { useMemo, useState } from 'react';
import { getProgramName, getProgramCity, getProgramState } from './programUtils';
import './programs.css';

function formatScore(value: any) {
  if (value === undefined || value === null || value === '') return '—';
  const score = Number(value);
  return Number.isNaN(score) ? String(value) : score.toFixed(1);
}

function ProgramSelection({
  programs,
  programLoading,
  selected,
  addProgram,
  openProgram,
  viewProgramResult,
  removeProgram,
  message,
  specialty
}: any) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return programs;

    return programs.filter((p: any) =>
      [
        getProgramName(p),
        getProgramCity(p),
        getProgramState(p),
        p.Frieda || '',
        p.PId || ''
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [programs, search]);

  const pendingPrograms = selected.filter((p: any) => !p.has_result);
  const assessedPrograms = selected.filter((p: any) => p.has_result);

  return (
    <>
      <div className="pageTitle">
        <div>
          <div className="eyebrow">STEP 2</div>
          <h1>Select programs</h1>
          <p className="muted">
            {specialty} · {selected.length}/50 selected
          </p>
        </div>
      </div>

      {message && <div className="notice danger">{message}</div>}

      <div className="twoCol">
        <div className="card">
          <h3>Available programs</h3>

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by program, city, state or FREIDA ID"
          />

          {programLoading && (
            <div className="notice">Loading reference programs…</div>
          )}

          {!programLoading && programs.length > 0 && (
            <p className="muted">{programs.length} programs available</p>
          )}

          <div className="list">
            {filtered.slice(0, 100).map((p: any) => {
              const name = getProgramName(p);
              const city = getProgramCity(p);
              const state = getProgramState(p);
              const programId = `${String(p.Frieda)}_${String(p.PId)}`;

              const alreadySelected = selected.some(
                (x: any) => x.program_id === programId
              );

              return (
                <div className="row" key={p.id || programId}>
                  <div>
                    <b>{name}</b>
                    {(city || state) && (
                      <small>
                        {city}
                        {city && state ? ', ' : ''}
                        {state}
                      </small>
                    )}
                    {p.Frieda && <small>FREIDA: {p.Frieda}</small>}
                  </div>

                  <button
                    className="secondary"
                    disabled={alreadySelected}
                    onClick={() =>
                      addProgram({
                        ...p,
                        name,
                        program_name: name,
                        city,
                        state
                      })
                    }
                  >
                    {alreadySelected ? 'Added' : 'Add'}
                  </button>
                </div>
              );
            })}
          </div>

          {!programLoading && programs.length === 0 && (
            <div className="notice">
              No verified programs found for this specialty.
            </div>
          )}

          {!programLoading && programs.length > 0 && filtered.length === 0 && (
            <div className="notice">No programs match your search.</div>
          )}
        </div>

        <div className="card">
          <h3>Programs to assess</h3>

          {pendingPrograms.map((p: any) => (
            <div className="row" key={p.program_id}>
              <div>
                <b>{p.program_name}</b>
                {(p.city || p.state) && (
                  <small>
                    {p.city}
                    {p.city && p.state ? ', ' : ''}
                    {p.state}
                  </small>
                )}
                {p.Frieda && <small>FREIDA: {p.Frieda}</small>}
              </div>

              <div className="actions">
                <button onClick={() => openProgram(p)}>Assess</button>
                <button className="ghost" onClick={() => removeProgram(p)}>
                  Remove
                </button>
              </div>
            </div>
          ))}

          {!pendingPrograms.length && (
            <p className="muted">No programs waiting for assessment.</p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="pageTitle compactTitle">
          <div>
            <div className="eyebrow">COMPLETED</div>
            <h2>Assessed programs</h2>
          </div>
        </div>

        {assessedPrograms.length ? (
          <div className="tableWrap">
            <table className="programTable">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Location</th>
                  <th>Final Priority</th>
                  <th>Category</th>
                  <th>Application Fit</th>
                  <th>Signal Value</th>
                  <th>Result</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assessedPrograms.map((p: any) => {
                  const savedResult = p.result || p.result_data || null;

                  return (
                    <tr key={p.program_id}>
                      <td>
                        <b>{p.program_name}</b>
                        {p.Frieda && <small>FREIDA: {p.Frieda}</small>}
                      </td>
                      <td>
                        {[p.city, p.state].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td>
                        {formatScore(savedResult?.final_priority?.score)}
                      </td>
                      <td>
                        {savedResult?.final_priority?.label ||
                          savedResult?.recommendation_code ||
                          '—'}
                      </td>
                      <td>
                        {savedResult?.application_fit
                          ? `${formatScore(savedResult.application_fit.score)} · ${savedResult.application_fit.label || ''}`
                          : '—'}
                      </td>
                      <td>
                        {savedResult?.signal_value
                          ? `${formatScore(savedResult.signal_value.score)} · ${savedResult.signal_value.label || ''}`
                          : '—'}
                      </td>
                      <td>
                        <button
                          className="secondary"
                          onClick={() => viewProgramResult(p)}
                        >
                          View Result
                        </button>
                      </td>
                      <td>
                        <button
                          className="ghost dangerButton"
                          onClick={() => removeProgram(p)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">No assessed programs yet.</p>
        )}
      </div>
    </>
  );
}

export default ProgramSelection;
