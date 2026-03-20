import React, { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  Divider,
  InputLabel,
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useLoading } from '../../layout/LoadingContext';

import JoditEditor from "jodit-react";

const planOptions = ["USCE", "Exam", "Research", "Job"];

const editorConfig = {

    readonly: false,
    height: 500,
    toolbarAdaptive: false,
    toolbarSticky: true,
    iframe: false,
    allowResizeY: true,
    allowResizeX: false,

    // Upload images as base64
    uploader: {
      insertImageAsBase64URI: true,
      imagesExtensions: ['jpg', 'png', 'jpeg', 'gif', 'webp']
    },

    // Paste settings (best for Word/Docs)
    pasteHTML: true,
    pasteFromWord: true,
    cleanHTML: {
      replaceNBSP: true,
      fillEmptyParagraph: false,
      removeEmptyElements: true,
    },

    // AUTO EMBED YOUTUBE / VIMEO / LINKS
    link: {
      followOnDblClick: true,
      autoShorten: true
    },
    video: {
      useVideoControls: true,
      controls: true,
    },
    media: {
      pasteReplaceTags: {
        iframe: 'video'
      }
    },

    // ADVANCED TABLE SYSTEM
    useSearch: true,
    table: {
      allowCellMerge: true,
      allowCellSplit: true,
      cellMinWidth: 40,
      className: 'jodit-table'
    },

    // ADVANCED BUTTON TOOLBAR
    buttons: [
      "source", "|",

      // FORMAT GROUP
      {
        group: "format",
        buttons: [
          "bold",
          "italic",
          "underline",
          "strikethrough",
          "superscript",
          "subscript",
        ]
      },

      // FONT GROUP
      {
        group: "font-style",
        buttons: ["font", "fontsize", "brush", "paragraph"]
      },

      "|",

      // ALIGN GROUP
      {
        group: "alignment",
        buttons: ["left", "center", "right", "justify"]
      },

      "|",

      // LISTS
      "ul",
      "ol",
      "indent",
      "outdent",
      "|",
"tableBorderThin",
    "tableBorderMedium",
    "tableBorderThick",
      // TABLES (PRO SET)
      {
        group: "table-group",
        buttons: ["table", "tableproperties", "tablecell", "tableheader"]
      },
      "|",

      // INSERT
      {
        group: "insert",
        buttons: ["link", "image", "video", "file", "hr", "emoji"]
      },

      "|",

      // VIEW
      "fullsize",
      "selectall",
      "preview",
      "print",
      "|",

      // HISTORY
      "undo",
      "redo",
    ],

    // Add Code Highlight Theme
    syntax: {
      theme: 'monokai'
    },

    // DARK MODE (optional)
    theme: "light", // change to "dark" if you want dark mode

    // CUSTOM CSS INSIDE THE EDITOR
style: `
    table, th, td {
      border-collapse: collapse !important;
    }
    .table-border-thin td, .table-border-thin th, .table-border-thin table {
      border: 1px solid #333 !important;
    }
    .table-border-medium td, .table-border-medium th, .table-border-medium table {
      border: 2px solid #333 !important;
    }
    .table-border-thick td, .table-border-thick th, .table-border-thick table {
      border: 4px solid #333 !important;
    }
  `,

  events: {
  afterInit: (editor) => {

    const getTable = () => {
      let node = editor.selection.sel?.anchorNode;
      if (!node) return null;
      if (node.nodeType === 3) node = node.parentNode;
      return node.closest("table");
    };

    const applyBorder = (width) => {
      const table = getTable();
      if (!table) {
        alert("Select a table cell first.");
        return;
      }

      // Apply border to table itself
      table.style.border = `${width} solid #333`;
      table.style.borderCollapse = "collapse";

      // Apply border to all rows and cells
      table.querySelectorAll("td, th").forEach(cell => {
        cell.style.border = `${width} solid #333`;
      });

      // Force Jodit content refresh
      editor.events.fire("change");
    };

    // THIN
    editor.registerButton({
      name: "tableBorderThin",
      iconURL: "https://img.icons8.com/ios/50/border.png",
      tooltip: "Thin Border",
      exec: () => applyBorder("1px")
    });

    // MEDIUM
    editor.registerButton({
      name: "tableBorderMedium",
      iconURL: "https://img.icons8.com/ios/50/border.png",
      tooltip: "Medium Border",
      exec: () => applyBorder("2px")
    });

    // THICK
    editor.registerButton({
      name: "tableBorderThick",
      iconURL: "https://img.icons8.com/ios/50/border.png",
      tooltip: "Thick Border",
      exec: () => applyBorder("4px")
    });
  }
}
  };
const MONTH_MAP = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sept: 8,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};
export default function MatchPlanAdmin() {
  const { id } = useParams();
  const [plans, setPlans] = useState([
    {
      startMonth: null,
      matchPlans: [],
      goals: "",
      needs: "",
      matchNotes: "",
    },
  ]);
  const { TooltipsPopovers, showLoading, hideLoading,Timestamp,FetchDataFromCollection,handleUpdate } = useLoading();
  /* ================= LOAD USER + PANELISTS ================= */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    showLoading();
    try {
      const docs = await FetchDataFromCollection(
        "MeetingNotes",
        20,
        "__name__",
        "==",
        id,
        0
      );

      if (docs.length > 0) 
      {
      const firestoreDoc = docs[0];
      const uiPlans = firestoreToPlans(firestoreDoc);
	console.log("uiPlans--->",uiPlans)
      setPlans(
        uiPlans.length
          ? uiPlans
          : [{
              startMonth: null,
              matchPlans: [],
              goals: "",
              needs: "",
              matchNotes: "",
            }]
      );
      }
    } catch (e) {
      console.error("Error loading data:", e);
    }
    hideLoading();
  };
  /* ================= USED YEAR-MONTHS ================= */
  const usedMonths = useMemo(() => {
    return plans
      .map((p) =>
        p.startMonth ? p.startMonth.format("YYYY-MM") : null
      )
      .filter(Boolean);
  }, [plans]);
  const firestoreToPlans = (doc) => {
  const plans = [];

  Object.entries(doc).forEach(([year, months]) => {
    if (!months || typeof months !== "object") return;

    Object.entries(months).forEach(([monthKey, data]) => {
      const monthIndex = MONTH_MAP[monthKey.toLowerCase()];

      if (monthIndex === undefined) return;

      plans.push({
        startMonth: dayjs()
          .year(Number(year))
          .month(monthIndex)
          .startOf("month"),

        matchPlans: data.matchPlans || [],
        goals: data.goals || "",
        needs: data.needs || "",
        matchNotes: data.matchNotes || "",
      });
    });
  });

  return plans.sort(
    (a, b) => a.startMonth.valueOf() - b.startMonth.valueOf()
  );
};
const buildFirestoreMatchPlan = (plans) => {
  const result = {};

  plans.forEach((plan) => {
    if (!plan.startMonth) return;

    const year = plan.startMonth.year().toString(); // "2026"
    const month = plan.startMonth.format("MMM").toLowerCase(); // "may"

    if (!result[year]) {
      result[year] = {};
    }

    result[year][month] = {};

    if (plan.goals?.trim()) {
      result[year][month].goals = plan.goals;
    }
     if (plan.needs?.trim()) {
      result[year][month].needs = plan.needs;
    }

    if (plan.matchNotes?.trim()) {
      result[year][month].matchNotes = plan.matchNotes;
    }

    if (Array.isArray(plan.matchPlans) && plan.matchPlans.length > 0) {
      result[year][month].matchPlans = plan.matchPlans;
    }
  });

  return result;
};
  /* ================= HELPERS ================= */
  const updatePlan = (index, field, value) => {
    setPlans((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const togglePlanOption = (index, value) => {
    setPlans((prev) => {
      const copy = [...prev];
      const exists = copy[index].matchPlans.includes(value);

      copy[index].matchPlans = exists
        ? copy[index].matchPlans.filter((v) => v !== value)
        : [...copy[index].matchPlans, value];

      return copy;
    });
  };

  const addPlan = () => {
    setPlans((prev) => [
      ...prev,
      {
        startMonth: null,
        matchPlans: [],
        goals: "",
        needs: "",
        matchNotes: "",
      },
    ]);
  };

  const removePlan = (index) => {
    setPlans((prev) => prev.filter((_, i) => i !== index));
  };

  const submitPlans = async () => {
  showLoading()
    const firestoreData = buildFirestoreMatchPlan(plans);
	firestoreData['id']=id;
	console.log("firestoreData===>",firestoreData)
 	const res=await handleUpdate("MeetingNotes", id, firestoreData);
    console.log("Submitted Match Plans:",res);
    hideLoading()
    TooltipsPopovers('Success', 'Plan saved successfully !', 'Status');
    // API / Firestore save here
  };

  /* ================= UI ================= */
  return (
    <Box  mx="auto">
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Match Planning
      </Typography>

      {plans.map((plan, index) => (
        <Paper key={index} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Box display="flex" alignItems="center">
            <Typography fontWeight="600">
              Plan #{index + 1}
            </Typography>

            <Box flexGrow={1} />

            {plans.length > 1 && (
              <Button
                color="error"
                size="small"
                onClick={() => removePlan(index)}
              >
                Remove
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            {/* YEAR + MONTH PICKER */}
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
  label="Plan Start (Year & Month)"
  views={["year", "month"]}
  value={plan.startMonth}
  onChange={(date) =>
    updatePlan(index, "startMonth", date)
  }
  shouldDisableMonth={(month) => {
    const key = month.format("YYYY-MM");

    if (
      plan.startMonth &&
      key === plan.startMonth.format("YYYY-MM")
    ) {
      return false;
    }

    return usedMonths.includes(key);
  }}
  sx={{
    "& .MuiPickersMonth-root.Mui-disabled": {
      color: "#9e9e9e",          // grey text
      opacity: 0.4,              // faded
      pointerEvents: "none",     // no hover
    },
  }}
  slotProps={{
    textField: { fullWidth: true },
  }}
/>
              </LocalizationProvider>
            </Grid>

            {/* USER PLAN */}
            <Grid item xs={12}>
              <InputLabel>User’s Plan</InputLabel>
              <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                {planOptions.map((opt) => (
                  <Chip
                    key={opt}
                    label={opt}
                    clickable
                    color={
                      plan.matchPlans.includes(opt)
                        ? "primary"
                        : "default"
                    }
                    onClick={() =>
                      togglePlanOption(index, opt)
                    }
                  />
                ))}
              </Box>
            </Grid>

            {/* GOALS */}
            <Grid item xs={12}>
              <InputLabel>Goals</InputLabel>
              <JoditEditor
                value={plan.goals}
                config={editorConfig}
                onBlur={(newContent) =>
                  updatePlan(index, "goals", newContent)
                }
              />
            </Grid>

            {/* NEEDS */}
            <Grid item xs={12}>
              <InputLabel>Needs</InputLabel>
              <JoditEditor
                value={plan.needs}
                config={editorConfig}
                onBlur={(newContent) =>
                  updatePlan(index, "needs", newContent)
                }
              />
            </Grid>

            {/* NOTES */}
            <Grid item xs={12}>
              <InputLabel>Other Notes</InputLabel>
              <JoditEditor
                value={plan.matchNotes}
                config={editorConfig}
                onBlur={(newContent) =>
                  updatePlan(index, "matchNotes", newContent)
                }
              />
            </Grid>
          </Grid>
        </Paper>
      ))}

      {/* ACTIONS */}
      <Box display="flex" gap={2} mt={3}>
        <Button variant="outlined" onClick={addPlan}>
          + Add Another Plan
        </Button>

        <Button variant="contained" onClick={submitPlans}>
          Save Match Plan
        </Button>
      </Box>
    </Box>
  );
}
