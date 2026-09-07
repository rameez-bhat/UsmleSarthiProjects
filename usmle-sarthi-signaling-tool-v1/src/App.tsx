import { useEffect, useState } from 'react';

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

import {
  addDoc,
  collection,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';

import {
  auth,
  db
} from './lib/firebase';

import {
  publicConfig
} from './scoring/config';

import {
  calculateProgram
} from './scoring/scoring';


const specialties = [
  'Internal Medicine',
  'Family Medicine',
  'Pediatrics',
  'Neurology',
  'Psychiatry',
  'Pathology'
];


const blankProfile: any = {
  specialty: 'Internal Medicine',
  match_season: 2027,

  medical_school_name: '',
  medical_school_country: '',

  yog: '',

  visa_requirement: '',

  step1_status: 'Pass',
  step1_attempts: 0,

  step2_score: '',
  step2_attempts: 1,

  step3_status: 'not taken',
  step3_score: '',

  ecfmg_status: 'pending',

  usce_months: 0,
  usce_types: '',

  specialty_usce_level: 'adequate',

  research_level: '3',

  repeat_applicant: false,

  prior_seasons_notes: ''
};


export default function App() {
  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [screen, setScreen] = useState('dashboard');

  const [assessments, setAssessments] = useState<any[]>([]);

  const [assessment, setAssessment] = useState<any>(null);

  const [profile, setProfile] = useState<any>({
    ...blankProfile
  });

  const [programs, setPrograms] = useState<any[]>([]);

  const [programLoading, setProgramLoading] = useState(false);

  const [selected, setSelected] = useState<any[]>([]);

  const [activeProgram, setActiveProgram] = useState<any>(null);

  const [config] = useState<any>(() => publicConfig());

  const [answers, setAnswers] = useState<any>({});

  const [override, setOverride] = useState<any>({
    note: '',
    date: '',
    reason_code: ''
  });

  const [result, setResult] = useState<any>(null);

  const [message, setMessage] = useState('');


  /*
   * Specialty -> existing Sarthi PId
   */
  const getSpecialtyPId = (specialty: string) => {
    const map: any = {
      'Internal Medicine': '1',
      'Family Medicine': '2',
      'Pediatrics': '3',
      'Psychiatry': '4',
      'Neurology': '5',
      'Pathology': '7'
    };

    return map[specialty] || '';
  };


  /*
   * Load HospitalProgramInfo from the existing
   * Sarthi reference-list database.
   */
  const loadReferencePrograms = async (
    specialty: string
  ) => {
    setProgramLoading(true);
    setMessage('');
    setPrograms([]);

    try {
      const pid = getSpecialtyPId(
        specialty
      );

      console.log(
        '--------------------------------'
      );

      console.log(
        'Loading Sarthi reference list'
      );

      console.log(
        'Specialty:',
        specialty
      );

      console.log(
        'PId:',
        pid
      );

      if (!pid) {
        setMessage(
          `No PId configured for ${specialty}.`
        );

        return;
      }

      /*
       * Keep the Firestore query simple.
       *
       * DisplayProgram and sorting are handled
       * client-side so that we do not require
       * another composite index while developing.
       */
      const programQuery = query(
        collection(
          db,
          'HospitalProgramInfo'
        ),

        where(
          'Verified',
          '==',
          'Yes'
        ),

        where(
          'PId',
          '==',
          pid
        )
      );

      const snapshot = await getDocs(
        programQuery
      );

      console.log(
        'HospitalProgramInfo snapshot size:',
        snapshot.size
      );

      const latestByProgram: any = {};

      snapshot.docs.forEach(
        (document: any) => {
          const data: any =
            document.data();

          if (
            typeof data.Frieda === 'undefined' ||
            data.Frieda === null ||
            String(data.Frieda).trim() === '' ||
            Number(data.Frieda) === -149
          ) {
            return;
          }

          const key =
            `${String(data.Frieda)}_${String(data.PId)}`;

          const existing =
            latestByProgram[key];

          const currentTimestamp =
            getTimestampNumber(
              data.TimeStamp
            );

          const existingTimestamp =
            getTimestampNumber(
              existing
                ? existing.TimeStamp
                : null
            );

          if (
            !existing ||
            currentTimestamp >
              existingTimestamp
          ) {
            latestByProgram[key] = {
              ...data,

              id: key,

              program_id: key,

              HPInfoId:
                document.id,

              Frieda:
                data.Frieda,

              PId:
                data.PId,

              HId:
                data.HId
            };
          }
        }
      );

      let list: any[] =
        Object.values(
          latestByProgram
        );

      const residencyExplorerPrograms = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '7'
      ];

      /*
       * Same behavior as the existing
       * Sarthi reference-list logic.
       */
      if (
        residencyExplorerPrograms.indexOf(
          String(pid)
        ) !== -1
      ) {
        list = list.filter(
          (p: any) =>
            Number(
              p.DisplayProgram
            ) === 1
        );
      }

      list.sort(
        (a: any, b: any) =>
          getTimestampNumber(
            b.TimeStamp
          ) -
          getTimestampNumber(
            a.TimeStamp
          )
      );

      console.log(
        'Programs after processing:',
        list.length
      );

      console.log(
        'Programs:',
        list
      );

      setPrograms(
        list
      );

      if (
        list.length === 0
      ) {
        setMessage(
          `No verified programs found for ${specialty}.`
        );
      }
    } catch (e: any) {
      console.error(
        'Program load error:',
        e
      );

      setPrograms([]);

      if (
        e &&
        e.code ===
          'permission-denied'
      ) {
        setMessage(
          'Firestore permission denied while loading HospitalProgramInfo.'
        );

        return;
      }

      setMessage(
        e?.message ||
        'Unable to load the Sarthi reference program list.'
      );
    } finally {
      setProgramLoading(false);
    }
  };


  /*
   * Firebase auth listener.
   *
   * No Firebase Functions are used.
   */
  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (currentUser: any) => {
        setUser(
          currentUser
        );

        setLoading(
          false
        );
      }
    );
  }, []);


  /*
   * Load user's assessments.
   */
  useEffect(() => {
    if (!user) {
      setAssessments([]);
      return;
    }

    const assessmentQuery = query(
      collection(
        db,
        'assessments'
      ),

      where(
        'user_id',
        '==',
        user.uid
      )
    );

    return onSnapshot(
      assessmentQuery,

      snapshot => {
        const list =
          snapshot.docs.map(
            d => ({
              id: d.id,
              ...d.data()
            })
          );

        setAssessments(
          list
        );
      },

      (error: any) => {
        console.error(
          'Assessment listener error:',
          error
        );
      }
    );
  }, [user]);


  /*
   * Load Sarthi reference programs
   * whenever specialty changes.
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    if (
      !profile.specialty
    ) {
      return;
    }

    loadReferencePrograms(
      profile.specialty
    );
  }, [
    user,
    profile.specialty
  ]);


  /*
   * Login/loading screen.
   */
  if (loading) {
    return (
      <Shell>
        <div className="card">
          Loading…
        </div>
      </Shell>
    );
  }


  if (!user) {
    return (
      <Login />
    );
  }


  /*
   * Create new assessment.
   */
  const createAssessment =
    async () => {
      setMessage('');

      try {
        const ref =
          await addDoc(
            collection(
              db,
              'assessments'
            ),

            {
              user_id:
                user.uid,

              specialty:
                'Internal Medicine',

              season:
                2027,

              status:
                'DRAFT',

              algorithm_version:
                'v1.0',

              specialty_config_version:
                'v1.0',

              created_at:
                serverTimestamp(),

              updated_at:
                serverTimestamp()
            }
          );

        setAssessment({
          id: ref.id
        });

        setProfile({
          ...blankProfile
        });

        setSelected([]);

        setActiveProgram(
          null
        );

        setAnswers({});

        setResult(null);

        setScreen(
          'profile'
        );
      } catch (e: any) {
        console.error(
          'Create assessment error:',
          e
        );

        setMessage(
          e?.message ||
          'Unable to create assessment.'
        );
      }
    };


  /*
   * Resume existing assessment.
   */
  const resume =
    async (a: any) => {
      setMessage('');

      try {
        setAssessment(
          a
        );

        /*
         * Load saved applicant profile.
         */
        const profileRef = doc(
          db,
          'assessments',
          a.id,
          'profile',
          'current'
        );

        const profileSnapshot =
          await getDoc(
            profileRef
          );

        if (
          profileSnapshot.exists()
        ) {
          setProfile({
            ...blankProfile,
            ...profileSnapshot.data()
          });
        } else {
          setProfile({
            ...blankProfile,

            specialty:
              a.specialty ||
              blankProfile.specialty,

            match_season:
              a.season ||
              blankProfile.match_season
          });
        }

        /*
         * Load previously selected programs.
         */
        const selectedSnapshot =
          await getDocs(
            collection(
              db,
              'assessments',
              a.id,
              'programs'
            )
          );

        const selectedPrograms =
          selectedSnapshot.docs
            .map(
              d => ({
                id: d.id,
                ...d.data()
              })
            )
            .filter(
              (p: any) =>
                !p.deleted_at
            );

        setSelected(
          selectedPrograms
        );

        setScreen(
          'profile'
        );
      } catch (e: any) {
        console.error(
          'Resume assessment error:',
          e
        );

        setMessage(
          e?.message ||
          'Unable to resume assessment.'
        );
      }
    };


  /*
   * Save applicant profile.
   */
  const saveProfile =
    async () => {
      if (!assessment) {
        setMessage(
          'Assessment is missing.'
        );

        return;
      }

      setMessage('');

      try {
        await setDoc(
          doc(
            db,
            'assessments',
            assessment.id,
            'profile',
            'current'
          ),

          {
            ...profile,

            profile_confirmed_at:
              serverTimestamp()
          },

          {
            merge: true
          }
        );

        await updateDoc(
          doc(
            db,
            'assessments',
            assessment.id
          ),

          {
            specialty:
              profile.specialty,

            season:
              Number(
                profile.match_season
              ),

            updated_at:
              serverTimestamp()
          }
        );

        await loadReferencePrograms(
          profile.specialty
        );

        setScreen(
          'programs'
        );
      } catch (e: any) {
        console.error(
          'Save profile error:',
          e
        );

        setMessage(
          e?.message ||
          'Unable to save applicant profile.'
        );
      }
    };


  /*
   * Add program to assessment.
   */
  const addProgram =
    async (p: any) => {
      setMessage('');

      if (!assessment) {
        setMessage(
          'Please create or resume an assessment first.'
        );

        return;
      }

      if (
        selected.length >= 50
      ) {
        setMessage(
          'Maximum 50 programs allowed.'
        );

        return;
      }

      const programId =
        `${String(p.Frieda)}_${String(p.PId)}`;

      const alreadySelected =
        selected.some(
          (x: any) =>
            x.program_id ===
            programId
        );

      if (
        alreadySelected
      ) {
        return;
      }

      const programName =
        getProgramName(
          p
        );

      const city =
        getProgramCity(
          p
        );

      const state =
        getProgramState(
          p
        );

      const item: any = {
        program_id:
          programId,

        Frieda:
          p.Frieda || '',

        PId:
          p.PId || '',

        HId:
          p.HId || '',

        HPInfoId:
          p.HPInfoId || '',

        program_name:
          programName,

        city,

        state,

        source_updated_at:
          p.TimeStamp ||
          p.source_updated_at ||
          '',

        student_preference:
          false,

        deleted_at:
          null
      };

      try {
        await setDoc(
          doc(
            db,
            'assessments',
            assessment.id,
            'programs',
            programId
          ),

          item,

          {
            merge: true
          }
        );

        setSelected(
          (current: any[]) => [
            ...current,
            item
          ]
        );
      } catch (e: any) {
        console.error(
          'Add program error:',
          e
        );

        setMessage(
          e?.message ||
          'Unable to add program.'
        );
      }
    };


  /*
   * Remove program from assessment.
   *
   * Soft delete as required by the implementation.
   */
  const removeProgram =
    async (p: any) => {
      if (
        !assessment ||
        !p.program_id
      ) {
        return;
      }

      setMessage('');

      try {
        await setDoc(
          doc(
            db,
            'assessments',
            assessment.id,
            'programs',
            p.program_id
          ),

          {
            deleted_at:
              serverTimestamp()
          },

          {
            merge: true
          }
        );

        setSelected(
          (current: any[]) =>
            current.filter(
              (x: any) =>
                x.program_id !==
                p.program_id
            )
        );
      } catch (e: any) {
        console.error(
          'Remove program error:',
          e
        );

        setMessage(
          e?.message ||
          'Unable to remove program.'
        );
      }
    };


  /*
   * Open selected program.
   */
  const openProgram =
    async (p: any) => {
      setMessage('');

      setActiveProgram(
        p
      );

      setAnswers({});

      setOverride({
        note: '',
        date: '',
        reason_code: ''
      });

      setResult(
        null
      );

      /*
       * Load existing answers/result
       * if the program was previously assessed.
       */
      if (
        assessment &&
        p.program_id
      ) {
        try {
          const answerSnapshot =
            await getDoc(
              doc(
                db,
                'assessments',
                assessment.id,
                'programs',
                p.program_id,
                'answers',
                'current'
              )
            );

          if (
            answerSnapshot.exists()
          ) {
            const saved: any =
              answerSnapshot.data();

            setAnswers(
              saved.answers || {}
            );

            setOverride(
              saved.override || {
                note: '',
                date: '',
                reason_code: ''
              }
            );
          }

          const resultSnapshot =
            await getDoc(
              doc(
                db,
                'assessments',
                assessment.id,
                'programs',
                p.program_id,
                'result',
                'current'
              )
            );

          if (
            resultSnapshot.exists()
          ) {
            setResult(
              resultSnapshot.data()
            );
          }
        } catch (e: any) {
          console.error(
            'Load program assessment error:',
            e
          );
        }
      }

      setScreen(
        'assessment'
      );
    };


  /*
   * Save answer into React state.
   */
  const setAnswer =
    (
      questionCode: string,
      answerCode: string
    ) => {
      setAnswers(
        (current: any) => ({
          ...current,

          [questionCode]:
            answerCode
        })
      );
    };


  /*
   * CLIENT-SIDE PROGRAM CALCULATION
   *
   * No Firebase Functions.
   */
  const calculate =
    async () => {
      setMessage('');

      if (!assessment) {
        setMessage(
          'Assessment is missing.'
        );

        return;
      }

      if (!activeProgram) {
        setMessage(
          'Program is missing.'
        );

        return;
      }

      try {
        /*
         * Save raw answers first.
         */
        await setDoc(
          doc(
            db,
            'assessments',
            assessment.id,
            'programs',
            activeProgram.program_id,
            'answers',
            'current'
          ),

          {
            answers,

            override,

            algorithm_version:
              'v1.0',

            updated_at:
              serverTimestamp()
          },

          {
            merge: true
          }
        );

        /*
         * Calculate entirely in the browser.
         */
        const data: any =
          calculateProgram({
            answers,
            override
          });

        console.log(
          'Calculated result:',
          data
        );

        setResult(
          data
        );

        /*
         * Store calculated snapshot.
         */
        await setDoc(
          doc(
            db,
            'assessments',
            assessment.id,
            'programs',
            activeProgram.program_id,
            'result',
            'current'
          ),

          {
            ...data,

            algorithm_version:
              data.algorithm_version ||
              'v1.0',

            calculated_at:
              serverTimestamp()
          },

          {
            merge: true
          }
        );

        setScreen(
          'result'
        );
      } catch (e: any) {
        console.error(
          'Calculation failed:',
          e
        );

        setMessage(
          e?.message ||
          'Calculation failed.'
        );
      }
    };


  /*
   * THIS RETURN WAS MISSING IN YOUR FILE.
   */
  return (
    <Shell
      user={user}
      onLogout={() =>
        signOut(auth)
      }
    >
      {screen ===
        'dashboard' && (
        <Dashboard
          assessments={
            assessments
          }

          createAssessment={
            createAssessment
          }

          resume={
            resume
          }
        />
      )}


      {screen ===
        'profile' && (
        <Profile
          profile={
            profile
          }

          setProfile={
            setProfile
          }

          onContinue={
            saveProfile
          }

          onBack={() =>
            setScreen(
              'dashboard'
            )
          }

          message={
            message
          }
        />
      )}


      {screen ===
        'programs' && (
        <ProgramSelection
          programs={
            programs
          }

          programLoading={
            programLoading
          }

          selected={
            selected
          }

          addProgram={
            addProgram
          }

          removeProgram={
            removeProgram
          }

          openProgram={
            openProgram
          }

          message={
            message
          }

          specialty={
            profile.specialty
          }

          onBack={() =>
            setScreen(
              'profile'
            )
          }
        />
      )}


      {screen ===
        'assessment' && (
        <Assessment
          config={
            config
          }

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

          program={
            activeProgram
          }

          onCalculate={
            calculate
          }

          onBack={() =>
            setScreen(
              'programs'
            )
          }

          message={
            message
          }
        />
      )}


      {screen ===
        'result' && (
        <Result
          result={
            result
          }

          program={
            activeProgram
          }

          onBack={() =>
            setScreen(
              'programs'
            )
          }

          onEdit={() =>
            setScreen(
              'assessment'
            )
          }
        />
      )}
    </Shell>
  );
}


/*
 * LOGIN
 */
function Login() {
  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [msg, setMsg] =
    useState('');

  const [loggingIn, setLoggingIn] =
    useState(false);


  const login =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      if (!cleanEmail) {
        setMsg(
          'Please enter your email address.'
        );

        return;
      }

      if (!password) {
        setMsg(
          'Please enter your password.'
        );

        return;
      }

      setMsg('');

      setLoggingIn(
        true
      );

      try {
        await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );
      } catch (e: any) {
        console.error(
          'Login error:',
          e
        );

        switch (
          e.code
        ) {
          case 'auth/invalid-email':
            setMsg(
              'Please enter a valid email address.'
            );
            break;

          case 'auth/invalid-credential':
            setMsg(
              'Invalid email or password.'
            );
            break;

          case 'auth/user-disabled':
            setMsg(
              'This account has been disabled.'
            );
            break;

          case 'auth/too-many-requests':
            setMsg(
              'Too many failed login attempts. Please try again later.'
            );
            break;

          case 'auth/network-request-failed':
            setMsg(
              'Network error. Please check your internet connection.'
            );
            break;

          case 'auth/operation-not-allowed':
            setMsg(
              'Email/password login is not enabled in Firebase.'
            );
            break;

          default:
            setMsg(
              e?.message ||
              'Unable to sign in.'
            );
        }
      } finally {
        setLoggingIn(
          false
        );
      }
    };


  return (
    <Shell>
      <div className="login card">

        <div className="eyebrow">
          USMLE SARTHI
        </div>

        <h1>
          Program Signaling Tool
        </h1>

        <p className="muted">
          Sign in using your existing Sarthi account.
        </p>

        <form
          onSubmit={
            login
          }
        >
          <label>
            Email
          </label>

          <input
            type="email"

            value={
              email
            }

            onChange={
              e =>
                setEmail(
                  e.target.value
                )
            }

            placeholder="you@example.com"

            autoComplete="email"

            disabled={
              loggingIn
            }
          />


          <label>
            Password
          </label>

          <input
            type="password"

            value={
              password
            }

            onChange={
              e =>
                setPassword(
                  e.target.value
                )
            }

            placeholder="Enter your password"

            autoComplete="current-password"

            disabled={
              loggingIn
            }
          />


          <button
            type="submit"

            disabled={
              loggingIn
            }
          >
            {
              loggingIn
                ? 'Signing in...'
                : 'Sign In'
            }
          </button>
        </form>


        {msg && (
          <div className="notice danger">
            {msg}
          </div>
        )}

      </div>
    </Shell>
  );
}


/*
 * SHELL
 */
function Shell({
  children,
  user,
  onLogout
}: any) {
  return (
    <>
      <header>
        <div>
          <b>
            USMLE SARTHI
          </b>

          <span>
            Signaling Tool · v1.0
          </span>
        </div>


        {user && (
          <div className="headerRight">
            <span>
              {user.email}
            </span>

            <button
              className="ghost"

              onClick={
                onLogout
              }
            >
              Sign out
            </button>
          </div>
        )}
      </header>


      <main>
        {children}
      </main>
    </>
  );
}


/*
 * DASHBOARD
 */
function Dashboard({
  assessments,
  createAssessment,
  resume
}: any) {
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
            Start a new assessment or resume saved work.
          </p>
        </div>


        <button
          onClick={
            createAssessment
          }
        >
          Start new
        </button>
      </div>


      <div className="grid">
        {assessments.map(
          (a: any) => (
            <div
              className="card"
              key={a.id}
            >
              <span className="badge">
                {
                  a.status ||
                  'DRAFT'
                }
              </span>

              <h3>
                {
                  a.specialty ||
                  'New assessment'
                }
              </h3>

              <p className="muted">
                Match season{' '}
                {
                  a.season ||
                  2027
                }
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
 * APPLICANT PROFILE
 */
function Profile({
  profile,
  setProfile,
  onContinue,
  onBack,
  message
}: any) {
  const field = (
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
                key={
                  option
                }

                value={
                  option
                }
              >
                {option}
              </option>
            )
          )}
        </select>
      ) : (
        <input
          type={
            type
          }

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

        {
          field(
            'specialty',
            'Specialty',
            'text',
            specialties
          )
        }

        {
          field(
            'match_season',
            'Match season',
            'number'
          )
        }

        {
          field(
            'medical_school_name',
            'Medical school'
          )
        }

        {
          field(
            'medical_school_country',
            'Country'
          )
        }

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
 * PROGRAM DISPLAY HELPERS
 */
function getProgramName(
  p: any
) {
  return (
    p.HName ||

    p.HospitalName ||

    p.ProgramName ||

    p.program_name ||

    p.name ||

    (
      p.hospital &&
      p.hospital.HName
    ) ||

    (
      p.Frieda
        ? `FREIDA ${p.Frieda}`
        : 'Unnamed program'
    )
  );
}


function getProgramCity(
  p: any
) {
  return (
    p.City ||

    p.city ||

    (
      p.hospital &&
      p.hospital.City
    ) ||

    ''
  );
}


function getProgramState(
  p: any
) {
  return (
    p.State ||

    p.state ||

    (
      p.hospital &&
      p.hospital.State
    ) ||

    ''
  );
}


/*
 * PROGRAM SELECTION
 */
function ProgramSelection({
  programs,
  programLoading,
  selected,
  addProgram,
  removeProgram,
  openProgram,
  message,
  specialty,
  onBack
}: any) {
  const [search, setSearch] =
    useState('');


  const filtered =
    programs.filter(
      (p: any) => {
        const term =
          search
            .trim()
            .toLowerCase();

        if (!term) {
          return true;
        }

        const text = [
          getProgramName(p),

          getProgramCity(p),

          getProgramState(p),

          p.Frieda || '',

          p.PId || ''
        ]
          .join(' ')
          .toLowerCase();

        return (
          text.indexOf(
            term
          ) !== -1
        );
      }
    );


  return (
    <>
      <div className="pageTitle">
        <div>
          <div className="eyebrow">
            STEP 2
          </div>

          <h1>
            Select programs
          </h1>

          <p className="muted">
            {specialty}
            {' · '}
            {selected.length}/50 selected
          </p>
        </div>
      </div>


      {message && (
        <div className="notice danger">
          {message}
        </div>
      )}


      <div className="twoCol">
        <div className="card">

          <input
            value={
              search
            }

            onChange={
              e =>
                setSearch(
                  e.target.value
                )
            }

            placeholder="Search by program, city, state or FREIDA ID"
          />


          {programLoading && (
            <div className="notice">
              Loading reference programs…
            </div>
          )}


          {
            !programLoading &&
            programs.length > 0 && (
              <p className="muted">
                {programs.length} programs available
              </p>
            )
          }


          <div className="list">
            {
              filtered
                .slice(
                  0,
                  100
                )
                .map(
                  (p: any) => {
                    const name =
                      getProgramName(
                        p
                      );

                    const city =
                      getProgramCity(
                        p
                      );

                    const state =
                      getProgramState(
                        p
                      );

                    const programId =
                      `${String(
                        p.Frieda
                      )}_${String(
                        p.PId
                      )}`;

                    const alreadySelected =
                      selected.some(
                        (x: any) =>
                          x.program_id ===
                          programId
                      );

                    return (
                      <div
                        className="row"

                        key={
                          p.id ||
                          programId
                        }
                      >
                        <div>
                          <b>
                            {name}
                          </b>

                          {
                            (
                              city ||
                              state
                            ) && (
                              <small>
                                {city}

                                {
                                  city &&
                                  state
                                    ? ', '
                                    : ''
                                }

                                {state}
                              </small>
                            )
                          }

                          {p.Frieda && (
                            <small>
                              FREIDA: {p.Frieda}
                            </small>
                          )}
                        </div>


                        <button
                          className="secondary"

                          disabled={
                            alreadySelected
                          }

                          onClick={() =>
                            addProgram({
                              ...p,

                              name,

                              program_name:
                                name,

                              city,

                              state
                            })
                          }
                        >
                          {
                            alreadySelected
                              ? 'Added'
                              : 'Add'
                          }
                        </button>
                      </div>
                    );
                  }
                )
            }
          </div>


          {
            !programLoading &&
            programs.length === 0 && (
              <div className="notice">
                No verified programs found for this specialty.
              </div>
            )
          }


          {
            !programLoading &&
            programs.length > 0 &&
            filtered.length === 0 && (
              <div className="notice">
                No programs match your search.
              </div>
            )
          }

        </div>


        <div className="card">

          <h3>
            Selected programs
          </h3>


          {selected.map(
            (p: any) => (
              <div
                className="row"

                key={
                  p.program_id
                }
              >
                <div>
                  <b>
                    {
                      p.program_name
                    }
                  </b>

                  {
                    (
                      p.city ||
                      p.state
                    ) && (
                      <small>
                        {p.city}

                        {
                          p.city &&
                          p.state
                            ? ', '
                            : ''
                        }

                        {p.state}
                      </small>
                    )
                  }

                  {p.Frieda && (
                    <small>
                      FREIDA: {p.Frieda}
                    </small>
                  )}
                </div>


                <div className="rowActions">
                  <button
                    onClick={() =>
                      openProgram(
                        p
                      )
                    }
                  >
                    Assess
                  </button>

                  <button
                    className="ghost"

                    onClick={() =>
                      removeProgram(
                        p
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          )}


          {!selected.length && (
            <p className="muted">
              No programs selected yet.
            </p>
          )}

        </div>
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
      </div>
    </>
  );
}


/*
 * PROGRAM ASSESSMENT
 */
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
  const eligibility = [
    'E1',
    'E2',
    'E3',
    'E4'
  ];


  const hasMismatch =
    eligibility.some(
      questionCode =>
        answers[
          questionCode
        ] ===
        'NOT_ALIGNED'
    );


  const eligibilityResolved =
    eligibility.every(
      questionCode =>
        answers[
          questionCode
        ] &&
        answers[
          questionCode
        ] !==
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


  const overrideReasons = [
    {
      code:
        'PROGRAM_CONFIRMED_EXCEPTION',

      label:
        'Program-confirmed exception'
    },

    {
      code:
        'PD_APD_ENCOURAGEMENT',

      label:
        'PD/APD encouragement'
    },

    {
      code:
        'FAVORABLE_ROTATION',

      label:
        'Favorable rotation'
    },

    {
      code:
        'INTERNAL_ADVOCATE',

      label:
        'Credible internal advocate'
    },

    {
      code:
        'OTHER',

      label:
        'Other'
    }
  ];


  return (
    <>
      <div className="pageTitle">
        <div>
          <div className="eyebrow">
            PROGRAM ASSESSMENT
          </div>

          <h1>
            {
              program
                ? program.program_name
                : ''
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
          Scoring configuration is unavailable.
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

                        <div>
                          <label>
                            Override reason
                          </label>

                          <select
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
                          >
                            <option value="">
                              Select reason
                            </option>

                            {
                              overrideReasons.map(
                                item => (
                                  <option
                                    key={
                                      item.code
                                    }

                                    value={
                                      item.code
                                    }
                                  >
                                    {
                                      item.label
                                    }
                                  </option>
                                )
                              )
                            }
                          </select>
                        </div>


                        <div>
                          <label>
                            Override date
                          </label>

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
                        </div>


                        <div>
                          <label>
                            Override note
                          </label>

                          <textarea
                            placeholder="Explain the documented override"

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

                      </div>
                    )
                  }

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
 * RESULT
 */
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
              program
                ? program.program_name
                : ''
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
              (
                result.final_priority &&
                result.final_priority.label
              ) ||
              result.recommendation_code ||
              '—'
            }
          </b>
        </div>


        <Metric
          title="Eligibility"

          value={
            result.eligibility
              ? result.eligibility.status
              : '—'
          }
        />


        <Metric
          title="Application Fit"

          value={
            result.application_fit
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
            result.signal_value
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
            result.recommendation_code ||
            '—'
          }
        />

      </div>


      <div className="twoCol">

        <Reasons
          title="Top positive reasons"

          items={
            result.positive_reasons ||
            []
          }
        />


        <Reasons
          title="Warnings / negatives"

          items={[
            ...(
              result.negative_reasons ||
              []
            ),

            ...(
              result.warnings ||
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


/*
 * SMALL UI COMPONENTS
 */
function Metric({
  title,
  value
}: any) {
  return (
    <div className="card metric">
      <small>
        {title}
      </small>

      <b>
        {value || '—'}
      </b>
    </div>
  );
}


function Reasons({
  title,
  items = []
}: any) {
  return (
    <div className="card">

      <h3>
        {title}
      </h3>

      {
        items.length > 0
          ? items.map(
              (
                item: any,
                index: number
              ) => (
                <p
                  key={
                    index
                  }
                >
                  • {String(item)}
                </p>
              )
            )
          : (
            <p className="muted">
              None
            </p>
          )
      }

    </div>
  );
}


/*
 * TIMESTAMP HELPER
 *
 * Supports:
 * - Firebase Timestamp
 * - milliseconds
 * - normal date strings
 */
function getTimestampNumber(
  value: any
) {
  if (!value) {
    return 0;
  }

  if (
    typeof value.toMillis ===
    'function'
  ) {
    return value.toMillis();
  }

  if (
    value.seconds !==
      undefined
  ) {
    return (
      Number(
        value.seconds
      ) * 1000
    );
  }

  if (
    typeof value ===
    'number'
  ) {
    return value;
  }

  const date =
    new Date(
      value
    );

  const timestamp =
    date.getTime();

  if (
    Number.isNaN(
      timestamp
    )
  ) {
    return 0;
  }

  return timestamp;
}