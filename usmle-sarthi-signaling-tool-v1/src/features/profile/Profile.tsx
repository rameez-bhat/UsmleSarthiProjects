import { countryData } from '../../apis/countryData';
import { medicalSchoolOptions } from '../../apis/MedicalSchools';

const signalingCountryOptions = Array.from(
  new Set(
    (countryData || [])
      .map((country: any) => country?.label || country?.value || '')
      .filter(Boolean)
  )
).sort();

function Profile({
  profile,
  setProfile,
  onContinue,
  onBack,
  message
}: any) {

  const field =
    (
      key: string,
      label: string,
      type = 'text',
      options?: string[]
    ) => (

      <div>

        <label>
          {label}
        </label>


        {options ? (

          <select

            value={
              profile[key]
            }

            onChange={
              e =>
                setProfile({
                  ...profile,

                  [key]:
                    e.target.value
                })
            }

          >

            {options.map(
              option => (

                <option
                  key={option}
                  value={option}
                >

                  {option}

                </option>

              )
            )}

          </select>

        ) : (

          <input

            type={type}

            value={
              profile[key]
            }

            onChange={
              e =>
                setProfile({
                  ...profile,

                  [key]:
                    e.target.value
                })
            }

          />

        )}

      </div>

    );


  return (
    <>

      <div className="pageTitle">

        <div>

          <div className="eyebrow">
            STEP 1
          </div>

          <h1>
            Applicant profile
          </h1>

        </div>

      </div>


      {message && (

        <div className="notice danger">
          {message}
        </div>

      )}


      <div className="card formGrid">

        <div>
          <label>
            Specialty
          </label>
          <input
            value={profile.specialty || ''}
            disabled
          />
        </div>


        {
          field(
            'match_season',
            'Match season',
            'number'
          )
        }


        <div>
          <label>
            Country of medical school
          </label>
          <select
            value={profile.medical_school_country || ''}
            onChange={e =>
              setProfile({
                ...profile,
                medical_school_country:
                  e.target.value,
                medical_school_name: ''
              })
            }
          >
            <option value="">
              Select country
            </option>

            {profile.medical_school_country &&
              !signalingCountryOptions.includes(
                profile.medical_school_country
              ) && (
                <option
                  value={profile.medical_school_country}
                >
                  {profile.medical_school_country}
                </option>
              )}

            {signalingCountryOptions.map(
              country => (
                <option
                  key={country}
                  value={country}
                >
                  {country}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label>
            Medical school
          </label>
          <select
            value={profile.medical_school_name || ''}
            onChange={e =>
              setProfile({
                ...profile,
                medical_school_name:
                  e.target.value
              })
            }
          >
            <option value="">
              Select medical school
            </option>

            {profile.medical_school_name &&
              !medicalSchoolOptions.includes(
                profile.medical_school_name
              ) && (
                <option
                  value={profile.medical_school_name}
                >
                  {profile.medical_school_name}
                </option>
              )}

            {medicalSchoolOptions
              .filter(
                (school: string) =>
                  !profile.medical_school_country ||
                  school.includes(
                    `, ${profile.medical_school_country}`
                  )
              )
              .map(
                (school: string) => (
                  <option
                    key={school}
                    value={school}
                  >
                    {school}
                  </option>
                )
              )}
          </select>
        </div>


        {
          field(
            'yog',
            'Year of graduation',
            'number'
          )
        }


        {
          field(
            'visa_requirement',
            'Visa requirement'
          )
        }


        {
          field(
            'step1_status',
            'Step 1 status',
            'text',
            [
              'Pass',
              'fail',
              'not taken'
            ]
          )
        }


        {
          field(
            'step1_attempts',
            'Step 1 attempts',
            'number'
          )
        }


        {
          field(
            'step2_score',
            'Step 2 CK score',
            'number'
          )
        }


        {
          field(
            'step2_attempts',
            'Step 2 attempts',
            'number'
          )
        }


        {
          field(
            'step3_status',
            'Step 3 status',
            'text',
            [
              'passed',
              'failed',
              'not taken',
              'pending'
            ]
          )
        }


        {
          field(
            'step3_score',
            'Step 3 score',
            'number'
          )
        }


        {
          field(
            'ecfmg_status',
            'ECFMG status',
            'text',
            [
              'Certified',
              'not certified',
              'pending'
            ]
          )
        }


        {
          field(
            'usce_months',
            'USCE months',
            'number'
          )
        }


        {
          field(
            'usce_types',
            'USCE types'
          )
        }


        {
          field(
            'specialty_usce_level',
            'Specialty USCE',
            'text',
            [
              'Strong',
              'adequate',
              'limited',
              'none'
            ]
          )
        }


        {
          field(
            'research_level',
            'Research level',
            'text',
            [
              '1',
              '2',
              '3',
              '4',
              '5'
            ]
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
            onContinue
          }
        >
          Confirm and continue
        </button>

      </div>

    </>
  );

}


/*
 * Program helpers
 */


export default Profile;
