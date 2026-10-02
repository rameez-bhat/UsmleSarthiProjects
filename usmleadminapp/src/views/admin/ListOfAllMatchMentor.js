import React, {

  useEffect,

  useMemo,

  useState

} from "react";

import dayjs from "dayjs";

import {

  Box,

  Button,

  Typography,

  Grid,

  Paper,

  TableContainer,

  Table,

  TableHead,

  InputLabel,

  TableRow,

  TableCell,

  TableBody,

  TextField,

  MenuItem,

  Checkbox,

  ListItemText

} from "@mui/material";

import { DatePicker } from "antd";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import { Timestamp } from "firebase/firestore";

import { useLoading } from "../../layout/LoadingContext";

const { RangePicker } = DatePicker;

const dateFormat = "MM/DD/YYYY";

let MatchPlanLists = {};

const UserDetails = () => {

  const {

    showLoading,

    hideLoading,

    SelectWithComplexConditions,

    FetchDataFromCollection,

    handleUpdate

  } = useLoading();

  /*

  |--------------------------------------------------------------------------

  | STATE

  |--------------------------------------------------------------------------

  */

  const [

    MatchPlanListObject,

    setMatchPlanListObject

  ] = useState({});

  const [

    filtersReady,

    setFiltersReady

  ] = useState(false);

  const [

    data,

    setData

  ] = useState([]);

  const [

    sortConfig,

    setSortConfig

  ] = useState({

    key: "EnrollmentDate",

    direction: "ascending"

  });

  const [

    filters,

    setFilters

  ] = useState({});

  /*

  |--------------------------------------------------------------------------

  | YEAR OPTIONS

  |--------------------------------------------------------------------------

  */

  const currentYear =

    new Date().getFullYear();

  const startYear =

    currentYear - 7;

  const yearOptions =

    Array.from(

      { length: 20 },

      (_, i) => startYear + i

    );

  const validYearOptionsTo =

    yearOptions.filter(

      year =>

        !filters.SeasonFrom ||

        year >= filters.SeasonFrom

    );

  /*

  |--------------------------------------------------------------------------

  | DATE HELPER

  |--------------------------------------------------------------------------

  |

  | Ant Design RangePicker MUST receive Dayjs.

  |

  | This function safely handles:

  |

  | - Dayjs

  | - Firebase Timestamp

  | - Serialized Firebase Timestamp

  | - JavaScript Date

  | - Date string

  |

  |--------------------------------------------------------------------------

  */

  const toDayjs = value => {

    if (!value) {

      return null;

    }

    /*

     \* Already Dayjs

     */

    if (dayjs.isDayjs(value)) {

      return value;

    }

    /*

     \* Firebase Timestamp

     */

    if (

      typeof value?.toDate === "function"

    ) {

      const converted =

        dayjs(value.toDate());

      return converted.isValid()

        ? converted

        : null;

    }

    /*

     \* Serialized Firestore timestamp

     */

    if (

      value?.seconds !== undefined &&

      value?.seconds !== null

    ) {

      const converted =

        dayjs(

          Number(value.seconds) * 1000

        );

      return converted.isValid()

        ? converted

        : null;

    }

    /*

     \* Normal Date/string/etc.

     */

    const converted =

      dayjs(value);

    return converted.isValid()

      ? converted

      : null;

  };

  /*

  |--------------------------------------------------------------------------

  | RANGE PICKER VALUE

  |--------------------------------------------------------------------------

  |

  | Never pass Firebase Timestamp directly

  | into Ant Design RangePicker.

  |

  |--------------------------------------------------------------------------

  */

  const meetingDateValue =

    useMemo(() => {

      if (

        !Array.isArray(

          filters?.meetingsDate

        ) ||

        filters.meetingsDate.length !== 2

      ) {

        return null;

      }

      const start =

        toDayjs(

          filters.meetingsDate[0]

        );

      const end =

        toDayjs(

          filters.meetingsDate[1]

        );

      if (

        !start ||

        !end

      ) {

        return null;

      }

      return [

        start,

        end

      ];

    }, [filters?.meetingsDate]);

  /*

  |--------------------------------------------------------------------------

  | INITIAL LOAD

  |--------------------------------------------------------------------------

  */

  useEffect(() => {

    initializePage();

  }, []);

  /*

  |--------------------------------------------------------------------------

  | LOAD DATA WHEN FILTERS ARE READY

  |--------------------------------------------------------------------------

  */

  useEffect(() => {

    if (!filtersReady) {

      return;

    }

    loadData();

  }, [

    filters,

    filtersReady

  ]);

  /*

  |--------------------------------------------------------------------------

  | INITIALIZE PAGE

  |--------------------------------------------------------------------------

  */

  const initializePage =

    async () => {

      showLoading();

      try {

        /*

         \* Load Match Plans

         */

        const MatchPlanList =

          await FetchDataFromCollection(

            "MatchPlans",

            200,

            "Type",

            "==",

            "Match",

            0

          );

        const obj = {};

        MatchPlanList.forEach(

          item => {

            obj[item.id] =

              item;

          }

        );

        setMatchPlanListObject(

          obj

        );

        MatchPlanLists =

          obj;

        /*

         \* Load saved filters

         */

        const saved =

          await FetchDataFromCollection(

            "SavedFilters",

            20,

            "filtertype",

            "==",

            "listofallmatchmentor",

            0

          );

        console.log(

          "saved======>",

          saved

        );

        if (saved.length) {

          const savedFilters = {

            ...saved[0]

          };

          /*

           \* Convert saved Firebase timestamps

           \* to Dayjs BEFORE storing in UI state.

           */

          if (

            Array.isArray(

              savedFilters.meetingsDate

            ) &&

            savedFilters.meetingsDate.length === 2

          ) {

            const start =

              toDayjs(

                savedFilters

                  .meetingsDate[0]

              );

            const end =

              toDayjs(

                savedFilters

                  .meetingsDate[1]

              );

            savedFilters.meetingsDate =

              start && end

                ? [

                    start,

                    end

                  ]

                : null;

          }

          setFilters(

            savedFilters

          );

        } else {

          /*

           \* No saved filters. The filtersReady effect

           \* will perform the initial load once.

           */

          setFilters({});

        }

      } catch (error) {

        console.error(

          "initializePage error:",

          error

        );

      } finally {

        setFiltersReady(true);

        hideLoading();

      }

    };

  /*

  |--------------------------------------------------------------------------

  | BUILD FIRESTORE CONDITIONS

  |--------------------------------------------------------------------------

  */

  const buildConditions = () => {
    const baseConditions = [];
    console.log("filters=======>", filters);

    if (filters.Plan) {
      const plans = Array.isArray(filters.Plan) ? filters.Plan : [filters.Plan];
      if (plans.length === 1) {
        baseConditions.push({ name: "Match.Plan.Name", condition: "==", value: plans[0] });
      } else if (plans.length > 1) {
        baseConditions.push({ name: "Match.Plan.Name", condition: "in", value: plans });
      }
    }

    // Meeting date filtering is done locally because MeetingDate and
    // CompletionDate can be stored in different date formats.
    if (!baseConditions.length) {
      baseConditions.push({ name: "Match.Notes", condition: "!=", value: "Rameez" });
    }

    return [baseConditions];
  };

  /*

  |--------------------------------------------------------------------------

  | APPLY / SAVE FILTERS

  |--------------------------------------------------------------------------

  */

  const FilterData =

    async () => {

      try {

        console.log(

          "filters======>",

          filters

        );

        /*

         \* IMPORTANT:

         \*

         \* Do not modify filters directly.

         \*

         \* Make a copy for Firestore.

         */

        const filtersToSave = {

          ...filters

        };

        /*

         \* Convert dates only in saved copy.

         */

        if (

          Array.isArray(

            filters.meetingsDate

          ) &&

          filters.meetingsDate.length === 2

        ) {

          const start =

            toDayjs(

              filters.meetingsDate[0]

            );

          const end =

            toDayjs(

              filters.meetingsDate[1]

            );

          if (

            start &&

            end

          ) {

            filtersToSave.meetingsDate = [

              Timestamp.fromDate(

                start

                  .startOf("day")

                  .toDate()

              ),

              Timestamp.fromDate(

                end

                  .endOf("day")

                  .toDate()

              )

            ];

          } else {

            filtersToSave.meetingsDate =

              null;

          }

        }

        console.log(

          "filtersToSave======>",

          filtersToSave

        );

        /*

         \* Save filters

         */

        const resF =

          await handleUpdate(

            "SavedFilters",

            "listofallmatchmentor",

            filtersToSave

          );

        console.log(

          "resF======>",

          resF

        );

        /*

         \* Trigger reload.

         \*

         \* React state still contains Dayjs.

         */

        setFiltersReady(true);

      } catch (error) {

        console.error(

          "FilterData error:",

          error

        );

      }

    };

  /*

  |--------------------------------------------------------------------------

  | LOAD DATA

  |--------------------------------------------------------------------------

  */

  const getMeetingDates = meeting => {
    const relation = meeting?.MeetingWithPhysicianMentor?.Relation;
    if (!relation) return [];

    const meetingDate = toDayjs(relation?.MeetingDate);
    const completionDate = toDayjs(relation?.CompletionDate);
    return [meetingDate, completionDate].filter(Boolean);
  };

  const isMeetingInSelectedDateRange = (meeting, start, end) => {
    const mentorMeeting = meeting?.MeetingWithPhysicianMentor;
    if (mentorMeeting?.Value !== "Completed") return false;

    return getMeetingDates(meeting).some(
      date => !date.isBefore(start) && !date.isAfter(end)
    );
  };

  const filterUsersByMeetingDate = users => {
    if (!Array.isArray(filters?.meetingsDate) || filters.meetingsDate.length !== 2) {
      return users;
    }

    const start = toDayjs(filters.meetingsDate[0])?.startOf("day");
    const end = toDayjs(filters.meetingsDate[1])?.endOf("day");
    if (!start || !end) return users;

    return users.filter(user => {
      const meetings = Array.isArray(user?.Match?.Platinum?.Meetings)
        ? user.Match.Platinum.Meetings
        : [];
      return meetings.some(meeting => isMeetingInSelectedDateRange(meeting, start, end));
    });
  };

  const processUserWithoutNotes = user => {
    const meetings = Array.isArray(user?.Match?.Platinum?.Meetings)
      ? user.Match.Platinum.Meetings
      : [];

    let totalMentorMeetings = 0;
    let lastMeetingDate = null;

    meetings.forEach(meeting => {
      const mentorMeeting = meeting?.MeetingWithPhysicianMentor;
      if (mentorMeeting?.Value !== "Completed") return;

      totalMentorMeetings++;
      getMeetingDates(meeting).forEach(date => {
        if (!lastMeetingDate || date.isAfter(lastMeetingDate)) {
          lastMeetingDate = date;
        }
      });
    });

    return {
      ...user,
      NotesCount: {},
      TotalNotes: 0,
      TotalMentorMeetings: totalMentorMeetings,
      LastMentorMeetingDate: lastMeetingDate ? lastMeetingDate.toDate() : null
    };
  };

  const loadData = async () => {
    try {
      showLoading();
      const conditions = buildConditions();
      console.log("conditions=======>", conditions);

      const result = await SelectWithComplexConditions("UserServices", conditions, "Users");
      if (result?.status !== "success") {
        setData([]);
        return;
      }

      const users = Array.isArray(result?.data) ? result.data : [];
      console.log("UserServices loaded:", users.length);

      // A user matches if EITHER MeetingDate OR CompletionDate of any
      // completed physician-mentor meeting is inside the selected range.
      const meetingFilteredUsers = filterUsersByMeetingDate(users);
      const processedUsers = meetingFilteredUsers.map(processUserWithoutNotes);

      console.log("Users after meeting date filter:", processedUsers.length);
      setData(processedUsers);
    } catch (err) {
      console.error("loadData error:", err);
      setData([]);
    } finally {
      setFiltersReady(false);
      hideLoading();
    }
  };

  /*

  |--------------------------------------------------------------------------

  | FORMAT SEASON

  |--------------------------------------------------------------------------

  */

  const formatSeason =

    season => {

      if (

        !season ||

        isNaN(

          Number(season)

        )

      ) {

        return season;

      }

      const numericSeason =

        Number(season);

      return (

        `Match Season ${numericSeason} ` +

        `(Sept ${numericSeason - 1})`

      );

    };

  /*

  |--------------------------------------------------------------------------

  | CLEAR SINGLE FILTER

  |--------------------------------------------------------------------------

  */

  const resetSingleFilter =

    async key => {

      const updatedFilters = {

        ...filters,

        [key]: null

      };

      if (

        key === "status"

      ) {

        updatedFilters.status =

          "";

      }

      setFilters(

        updatedFilters

      );

      /*

       \* Convert dates if required before

       \* saving.

       */

      const filtersToSave = {

        ...updatedFilters

      };

      if (

        Array.isArray(

          filtersToSave.meetingsDate

        ) &&

        filtersToSave.meetingsDate

          .length === 2

      ) {

        const start =

          toDayjs(

            filtersToSave

              .meetingsDate[0]

          );

        const end =

          toDayjs(

            filtersToSave

              .meetingsDate[1]

          );

        if (

          start &&

          end

        ) {

          filtersToSave.meetingsDate = [

            Timestamp.fromDate(

              start

                .startOf("day")

                .toDate()

            ),

            Timestamp.fromDate(

              end

                .endOf("day")

                .toDate()

            )

          ];

        }

      }

      await handleUpdate(

        "SavedFilters",

        "listofallmatchmentor",

        filtersToSave

      );

    };

  /*

  |--------------------------------------------------------------------------

  | CLEAR FILTER

  |--------------------------------------------------------------------------

  */

  const clearFilter =

    async key => {

      const updatedFilters = {

        ...filters,

        [key]: null

      };

      setFilters(

        updatedFilters

      );

      const filtersToSave = {

        ...updatedFilters

      };

      /*

       \* Convert any remaining meeting

       \* dates before save.

       */

      if (

        Array.isArray(

          filtersToSave.meetingsDate

        ) &&

        filtersToSave.meetingsDate

          .length === 2

      ) {

        const start =

          toDayjs(

            filtersToSave

              .meetingsDate[0]

          );

        const end =

          toDayjs(

            filtersToSave

              .meetingsDate[1]

          );

        if (

          start &&

          end

        ) {

          filtersToSave.meetingsDate = [

            Timestamp.fromDate(

              start

                .startOf("day")

                .toDate()

            ),

            Timestamp.fromDate(

              end

                .endOf("day")

                .toDate()

            )

          ];

        }

      }

      await handleUpdate(

        "SavedFilters",

        "listofallmatchmentor",

        filtersToSave

      );

      setFiltersReady(true);

    };

  /*

  |--------------------------------------------------------------------------

  | PAYMENT HELPERS

  |--------------------------------------------------------------------------

  */

  const getLatestPaymentDate =

    user => {

      const payments =

        user?.Match

          ?.Payments ||

        {};

      const dates =

        Object.values(

          payments

        )

          .filter(

            p =>

              p?.PaymentDate

                ?.seconds

          )

          .map(

            p =>

              p.PaymentDate

                .seconds

          );

      if (

        !dates.length

      ) {

        return null;

      }

      return Math.max(

        ...dates

      );

    };

  const getTotalPaymentAmount =

    user => {

      const payments =

        user?.Match

          ?.Payments ||

        {};

      const total =

        Object.values(

          payments

        ).reduce(

          (sum, p) =>

            sum +

            (

              Number(

                p?.Amount

              ) ||

              0

            ),

          0

        );

      return (

        Math.round(

          (

            total +

            Number.EPSILON

          ) *

            100

        ) /

        100

      );

    };

  /*

  |--------------------------------------------------------------------------

  | SORTING

  |--------------------------------------------------------------------------

  */

  const requestSort =

    key => {

      let direction =

        "ascending";

      if (

        sortConfig.key ===

          key &&

        sortConfig.direction ===

          "ascending"

      ) {

        direction =

          "descending";

      }

      setSortConfig({

        key,

        direction

      });

    };

  const sortedData =

    useMemo(() => {

      const sortable = [

        ...data

      ];

      sortable.sort(

        (a, b) => {

          let aVal;

          let bVal;

          switch (

            sortConfig.key

          ) {

            case "EnrollmentDate":

              aVal =

                a?.Match

                  ?.EnrollmentDate

                  ?.seconds ||

                0;

              bVal =

                b?.Match

                  ?.EnrollmentDate

                  ?.seconds ||

                0;

              break;

            case "Season":

              aVal =

                a?.Match

                  ?.Season ||

                0;

              bVal =

                b?.Match

                  ?.Season ||

                0;

              break;

            case "PaymentDate":

              aVal =

                getLatestPaymentDate(

                  a

                ) ||

                0;

              bVal =

                getLatestPaymentDate(

                  b

                ) ||

                0;

              break;

            case "PaymentAmount":

              aVal =

                getTotalPaymentAmount(

                  a

                );

              bVal =

                getTotalPaymentAmount(

                  b

                );

              break;

            case "Notes":

              aVal =

                a?.TotalNotes ||

                0;

              bVal =

                b?.TotalNotes ||

                0;

              break;

            case "MentorMeetings":

              aVal =

                a?.TotalMentorMeetings ||

                0;

              bVal =

                b?.TotalMentorMeetings ||

                0;

              break;

            case "email":

              aVal =

                a?.profile

                  ?.email ||

                "";

              bVal =

                b?.profile

                  ?.email ||

                "";

              break;

            case "StudentUniqueId":

              aVal =

                a?.profile

                  ?.StudentUniqueId ||

                "";

              bVal =

                b?.profile

                  ?.StudentUniqueId ||

                "";

              break;

            case "displayName":

              aVal =

                a?.profile

                  ?.displayName ||

                "";

              bVal =

                b?.profile

                  ?.displayName ||

                "";

              break;

            case "Plan":

              aVal =

                a?.Match

                  ?.Plan

                  ?.Relation

                  ?.Value ||

                MatchPlanLists?.[

                  a?.Match

                    ?.Plan

                    ?.Name

                ]?.Name ||

                "";

              bVal =

                b?.Match

                  ?.Plan

                  ?.Relation

                  ?.Value ||

                MatchPlanLists?.[

                  b?.Match

                    ?.Plan

                    ?.Name

                ]?.Name ||

                "";

              break;

            case "Status":

              aVal =

                a?.Match

                  ?.Status

                  ?.Relation

                  ?.Value ||

                a?.Match

                  ?.Status

                  ?.Name ||

                "";

              bVal =

                b?.Match

                  ?.Status

                  ?.Relation

                  ?.Value ||

                b?.Match

                  ?.Status

                  ?.Name ||

                "";

              break;

            default:

              aVal =

                a?.profile

                  ?.displayName ||

                "";

              bVal =

                b?.profile

                  ?.displayName ||

                "";

          }

          if (

            typeof aVal ===

            "string"

          ) {

            aVal =

              aVal.toLowerCase();

          }

          if (

            typeof bVal ===

            "string"

          ) {

            bVal =

              bVal.toLowerCase();

          }

          if (

            aVal < bVal

          ) {

            return (

              sortConfig.direction ===

              "ascending"

                ? -1

                : 1

            );

          }

          if (

            aVal > bVal

          ) {

            return (

              sortConfig.direction ===

              "ascending"

                ? 1

                : -1

            );

          }

          return 0;

        }

      );

      return sortable;

    }, [

      data,

      sortConfig

    ]);

  /*

  |--------------------------------------------------------------------------

  | FORMAT FIREBASE DATE

  |--------------------------------------------------------------------------

  */

  const convertDate =

    timestamp => {

      if (!timestamp) {

        return "";

      }

      /*

       \* Numeric seconds

       */

      if (

        typeof timestamp ===

        "number"

      ) {

        return dayjs(

          timestamp * 1000

        ).format(

          "MM-DD-YYYY"

        );

      }

      /*

       \* Firebase Timestamp

       */

      if (

        typeof timestamp?.toDate ===

        "function"

      ) {

        return dayjs(

          timestamp.toDate()

        ).format(

          "MM-DD-YYYY"

        );

      }

      /*

       \* Serialized timestamp

       */

      if (

        timestamp?.seconds

      ) {

        return dayjs(

          timestamp.seconds *

            1000

        ).format(

          "MM-DD-YYYY"

        );

      }

      const date =

        dayjs(timestamp);

      return date.isValid()

        ? date.format(

            "MM-DD-YYYY"

          )

        : "";

    };

  /*

  |--------------------------------------------------------------------------

  | RENDER

  |--------------------------------------------------------------------------

  */

  return (

    <Box p={3}>

      <Paper

        sx={{

          p: 3,

          mb: 4

        }}

      >

        <Typography

          variant="h6"

          mb={2}

        >

          Filters

        </Typography>

        <Grid

          container

          spacing={2}

        >

          {/* PLAN */}

          <Grid

            item

            xs={12}

            md={3}

          >

            <TextField

              select

              fullWidth

              label="Plan"

              value={

                Array.isArray(

                  filters.Plan

                )

                  ? filters.Plan

                  : filters.Plan

                  ? [

                      filters.Plan

                    ]

                  : []

              }

              onChange={e =>

                setFilters(

                  prev => ({

                    ...prev,

                    Plan:

                      e.target

                        .value

                  })

                )

              }

              SelectProps={{

                multiple: true,

                renderValue:

                  selected =>

                    (

                      Array.isArray(

                        selected

                      )

                        ? selected

                        : [

                            selected

                          ]

                    )

                      .map(

                        pid => {

                          if (

                            pid ===

                            "Custom"

                          ) {

                            return "Custom";

                          }

                          const plan =

                            Object.values(

                              MatchPlanListObject ||

                                {}

                            ).find(

                              p =>

                                p.Pid ===

                                pid

                            );

                          return (

                            plan?.Name ||

                            pid

                          );

                        }

                      )

                      .join(", ")

              }}

            >

              {Object.entries(

                MatchPlanListObject ||

                  {}

              ).map(

                ([

                  key,

                  value

                ]) => (

                  <MenuItem

                    key={key}

                    value={

                      value.Pid

                    }

                  >

                    <Checkbox

                      checked={

                        (

                          Array.isArray(

                            filters.Plan

                          )

                            ? filters.Plan

                            : filters.Plan

                            ? [

                                filters.Plan

                              ]

                            : []

                        ).indexOf(

                          value.Pid

                        ) >

                        -1

                      }

                    />

                    <ListItemText

                      primary={

                        value.Name

                      }

                    />

                  </MenuItem>

                )

              )}

              <MenuItem

                value="Custom"

              >

                <Checkbox

                  checked={

                    (

                      Array.isArray(

                        filters.Plan

                      )

                        ? filters.Plan

                        : filters.Plan

                        ? [

                            filters.Plan

                          ]

                        : []

                    ).indexOf(

                      "Custom"

                    ) >

                    -1

                  }

                />

                <ListItemText

                  primary="Custom"

                />

              </MenuItem>

            </TextField>

            {(Array.isArray(

              filters.Plan

            )

              ? filters.Plan

                  .length > 0

              : !!filters.Plan) && (

              <Button

                size="small"

                color="error"

                onClick={() =>

                  resetSingleFilter(

                    "Plan"

                  )

                }

              >

                Clear

              </Button>

            )}

          </Grid>

          {/* MEETING DATE */}

          <Grid

            item

            xs={12}

            md={6}

          >

            <InputLabel>

              Meeting Date

            </InputLabel>

            <RangePicker

              style={{

                width: "100%"

              }}

              name="MeetingDate"

              value={

                meetingDateValue

              }

              format={

                dateFormat

              }

              onChange={

                dates => {

                  if (

                    !dates ||

                    dates.length !==

                      2

                  ) {

                    setFilters(

                      prev => ({

                        ...prev,

                        meetingsDate:

                          null

                      })

                    );

                    return;

                  }

                  const start =

                    dates[0]

                      .startOf(

                        "day"

                      );

                  const end =

                    dates[1]

                      .endOf(

                        "day"

                      );

                  setFilters(

                    prev => ({

                      ...prev,

                      /*

                       \* IMPORTANT:

                       \*

                       \* Keep Dayjs in

                       \* React state.

                       */

                      meetingsDate: [

                        start,

                        end

                      ]

                    })

                  );

                }

              }

              allowClear={

                false

              }

            />

            {filters.meetingsDate && (

              <Button

                size="small"

                color="error"

                onClick={() =>

                  clearFilter(

                    "meetingsDate"

                  )

                }

                sx={{

                  mt: 1

                }}

              >

                Clear

              </Button>

            )}

          </Grid>

          {/* APPLY */}

          <Grid

            item

            xs={12}

          >

            <Button

              variant="contained"

              onClick={

                FilterData

              }

            >

              Apply Filters

            </Button>

          </Grid>

        </Grid>

      </Paper>

      {/* TOTAL */}

      <Typography

        variant="h6"

        mb={2}

      >

        Match Users Total ={" "}

        {sortedData.length}

      </Typography>

      {/* TABLE */}

      <TableContainer

        component={Paper}

      >

        <Table>

          <TableHead>

            <TableRow>

              <TableCell

                onClick={() =>

                  requestSort(

                    "StudentUniqueId"

                  )

                }

              >

                Student ID{" "}

                {sortConfig.key ===

                  "StudentUniqueId" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon />

                      )

                      : (

                        <ArrowDownwardIcon />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "email"

                  )

                }

              >

                Email{" "}

                {sortConfig.key ===

                  "email" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon />

                      )

                      : (

                        <ArrowDownwardIcon />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "displayName"

                  )

                }

              >

                Name{" "}

                {sortConfig.key ===

                  "displayName" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon />

                      )

                      : (

                        <ArrowDownwardIcon />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "EnrollmentDate"

                  )

                }

              >

                Enrollment Date{" "}

                {sortConfig.key ===

                  "EnrollmentDate" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon />

                      )

                      : (

                        <ArrowDownwardIcon />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "Plan"

                  )

                }

              >

                Plan{" "}

                {sortConfig.key ===

                  "Plan" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon />

                      )

                      : (

                        <ArrowDownwardIcon />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "Status"

                  )

                }

              >

                Status{" "}

                {sortConfig.key ===

                  "Status" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon />

                      )

                      : (

                        <ArrowDownwardIcon />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "Season"

                  )

                }

              >

                Match Season{" "}

                {sortConfig.key ===

                  "Season" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon />

                      )

                      : (

                        <ArrowDownwardIcon />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "PaymentDate"

                  )

                }

              >

                Latest Payment Date

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "Notes"

                  )

                }

                sx={{

                  whiteSpace:

                    "nowrap",

                  width: "1%"

                }}

              >

                Notes{" "}

                {sortConfig.key ===

                  "Notes" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon

                          fontSize="small"

                        />

                      )

                      : (

                        <ArrowDownwardIcon

                          fontSize="small"

                        />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "MentorMeetings"

                  )

                }

                sx={{

                  whiteSpace:

                    "nowrap",

                  width: "1%"

                }}

              >

                Mentor Meetings{" "}

                {sortConfig.key ===

                  "MentorMeetings" &&

                  (

                    sortConfig.direction ===

                    "ascending"

                      ? (

                        <ArrowUpwardIcon

                          fontSize="small"

                        />

                      )

                      : (

                        <ArrowDownwardIcon

                          fontSize="small"

                        />

                      )

                  )}

              </TableCell>

              <TableCell

                onClick={() =>

                  requestSort(

                    "PaymentAmount"

                  )

                }

              >

                Total Payment Amount

              </TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {sortedData.map(

              (

                user,

                index

              ) => (

                <TableRow

                  key={

                    user?.uid ||

                    index

                  }

                >

                  <TableCell>

                    S

                    {

                      user

                        ?.profile

                        ?.StudentUniqueId

                    }

                  </TableCell>

                  <TableCell>

                    <a

                      href={

                        `/admin/userdetails/${user?.profile?.uid}`

                      }

                      target="\_blank"

                      rel="noreferrer"

                      style={{

                        padding:

                          "2px 20px",

                        backgroundColor:

                          "#af4cab",

                        marginBottom:

                          "3px",

                        marginRight:

                          "3px",

                        color:

                          "white",

                        textDecoration:

                          "none",

                        borderRadius:

                          "5px",

                        display:

                          "inline-block",

                        fontWeight:

                          "bold"

                      }}

                    >

                      {

                        user

                          ?.profile

                          ?.email

                      }

                    </a>

                  </TableCell>

                  <TableCell>

                    {

                      user

                        ?.profile

                        ?.displayName

                    }

                  </TableCell>

                  <TableCell>

                    {convertDate(

                      user

                        ?.Match

                        ?.EnrollmentDate

                    )}

                  </TableCell>

                  <TableCell>

                    {

                      user

                        ?.Match

                        ?.Plan

                        ?.Relation

                        ?.Value ||

                      MatchPlanLists?.[

                        user

                          ?.Match

                          ?.Plan

                          ?.Name

                      ]?.Name

                    }

                  </TableCell>

                  <TableCell>

                    {

                      user

                        ?.Match

                        ?.Status

                        ?.Relation

                        ?.Value ||

                      user

                        ?.Match

                        ?.Status

                        ?.Name

                    }

                  </TableCell>

                  <TableCell>

                    {formatSeason(

                      user

                        ?.Match

                        ?.Season

                    )}

                  </TableCell>

                  <TableCell>

                    {convertDate(

                      getLatestPaymentDate(

                        user

                      )

                    )}

                  </TableCell>

                  {/* NOTES */}

                  <TableCell

                    sx={{

                      whiteSpace:

                        "nowrap",

                      width: "1%",

                      verticalAlign:

                        "top"

                    }}

                  >

                    {user?.NotesCount

                      ? Object.entries(

                          user.NotesCount

                        )

                          .sort(

                            (

                              a,

                              b

                            ) =>

                              b[1]

                                .Count -

                              a[1]

                                .Count

                          )

                          .map(

                            ([

                              email,

                              info

                            ]) => (

                              <div

                                key={

                                  email

                                }

                                style={{

                                  marginBottom:

                                    6

                                }}

                              >

                                <strong>

                                  {email}

                                </strong>

                                : (

                                {

                                  info.Count

                                }

                                )

                                <br />

                                {info.NoteDate

                                  ? convertDate(

                                      info.NoteDate

                                    )

                                  : "-"}

                              </div>

                            )

                          )

                      : "-"}

                  </TableCell>

                  {/* MENTOR MEETINGS */}

                  <TableCell

                    sx={{

                      whiteSpace:

                        "nowrap",

                      width: "1%",

                      verticalAlign:

                        "top"

                    }}

                  >

                    {user?.TotalMentorMeetings

                      ? (

                        <>

                          <strong>

                            {

                              user

                                ?.Match

                                ?.Platinum

                                ?.AssignedMentor

                                ?.label

                            }

                            (

                            {

                              user.TotalMentorMeetings

                            }

                            )

                          </strong>

                          <br />

                          {user.LastMentorMeetingDate

                            ? dayjs(

                                user.LastMentorMeetingDate

                              ).format(

                                "MM/DD/YYYY"

                              )

                            : "-"}

                        </>

                      )

                      : "-"}

                  </TableCell>

                  <TableCell>

                    ₹{" "}

                    {getTotalPaymentAmount(

                      user

                    )}

                  </TableCell>

                </TableRow>

              )

            )}

          </TableBody>

        </Table>

      </TableContainer>

    </Box>

  );

};

export default UserDetails;