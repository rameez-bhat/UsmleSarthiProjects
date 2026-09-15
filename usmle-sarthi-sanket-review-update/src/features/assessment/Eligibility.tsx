const options = [
  ['ALIGNED', 'Yes — I checked and I meet this requirement'],
  ['NOT_ALIGNED', 'No — I checked and I do not meet this requirement'],
  ['NOT_VERIFIED', 'Not sure — I have not confirmed this requirement'],
  ['SOURCE_NA', 'Information unavailable — no reliable source states the requirement']
];

const items = [
  ['E1', 'Visa/work authorization', 'Based on the program’s current policy, does it sponsor or accept the visa or work authorization you will use?'],
  ['E2', 'Year of graduation', 'Does your year of graduation meet the program’s stated graduation-year requirement?'],
  ['E3A', 'Exam score minimums', 'Do your USMLE/COMLEX scores meet the program’s stated minimum-score requirements?'],
  ['E3B', 'Exam attempts', 'Does your USMLE/COMLEX attempt history meet the program’s stated attempt policy?'],
  ['E4', 'Other requirements', 'Do you meet all other published application requirements for this program?']
];

const otherRequirements = [
  'Step 3', 'ECFMG status/timing', 'USCE amount/type', 'LOR count/type',
  'Language requirement', 'Application deadline', 'Correct NRMP/program track', 'Other'
];

export default function Eligibility({ answers, setAnswer, override, setOverride }: any) {
  const mismatches = items.filter(([code]) => answers[code] === 'NOT_ALIGNED');
  const unresolvedE4 = ['NOT_ALIGNED', 'NOT_VERIFIED'].includes(answers.E4);

  return <div className="questionStack">
    <div className="notice info">
      <b>Eligibility is applicant-reported.</b> Review the Sarthi List first and confirm time-sensitive policies from current program sources. Choose “Not sure” when you have not confirmed an item; choose “Information unavailable” only after reliable sources do not state it.
    </div>

    {items.map(([code, component, prompt]) => <div className="card question" key={code}>
      <div className="questionHead">
        <span className="code">{code}</span>
        <div><small>Eligibility · {component}</small><h3>{prompt}</h3></div>
      </div>
      <div className="options">
        {options.map(([value, label]) => <label className={'option ' + (answers[code] === value ? 'selected' : '')} key={value}>
          <input type="radio" name={code} checked={answers[code] === value} onChange={() => setAnswer(code, value)} />
          <span>{label}</span>
        </label>)}
      </div>

      {code === 'E4' && unresolvedE4 && <div className="subQuestion">
        <b>Which requirement needs attention?</b>
        <div className="checkGrid">
          {otherRequirements.map(item => {
            const values = answers.E4_ITEMS || [];
            return <label key={item} className="checkOption">
              <input type="checkbox" checked={values.includes(item)} onChange={e => {
                const next = e.target.checked ? [...values, item] : values.filter((x: string) => x !== item);
                setAnswer('E4_ITEMS', next);
              }} /> {item}
            </label>;
          })}
        </div>
      </div>}
    </div>)}

    {!!mismatches.length && <div className="card question overrideCard">
      <div className="questionHead">
        <span className="code">E5</span>
        <div><small>Eligibility · Documented override</small><h3>Is there a documented program-specific reason to continue despite the mismatch?</h3></div>
      </div>
      <div className="options">
        {[
          ['NO_OVERRIDE', 'No documented override'],
          ['PROGRAM_CONFIRMED_EXCEPTION', 'Program confirmed exception'],
          ['PD_APD_ENCOURAGEMENT', 'PD/APD encouragement'],
          ['FAVORABLE_ROTATION', 'Favorable program rotation/research relationship'],
          ['INTERNAL_ADVOCATE', 'Credible internal advocate'],
          ['OTHER', 'Other documented exception']
        ].map(([value, label]) => <label className={'option ' + (answers.E5 === value ? 'selected' : '')} key={value}>
          <input type="radio" name="E5" checked={answers.E5 === value} onChange={() => setAnswer('E5', value)} />
          <span>{label}</span>
        </label>)}
      </div>
      {answers.E5 && answers.E5 !== 'NO_OVERRIDE' && <div className="overrideGrid">
        <input placeholder="Reason / source" value={override.reason_code || ''} onChange={e => setOverride({...override, reason_code:e.target.value})}/>
        <input type="date" value={override.date || ''} onChange={e => setOverride({...override, date:e.target.value})}/>
        <textarea placeholder="Required note describing the documented exception" value={override.note || ''} onChange={e => setOverride({...override, note:e.target.value})}/>
      </div>}
    </div>}
  </div>;
}
