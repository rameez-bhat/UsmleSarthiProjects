// EditRotation.jsx
import React, { useEffect,useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  InputLabel,
  Paper
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import  '../../components/css/style.css';
import { useLoading } from '../../layout/LoadingContext';

import { db } from "../../firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  updateDoc,
  where,
} from "firebase/firestore";


import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import JoditEditor from "jodit-react";

export default function EditRotation() {
  const { match_id } = useParams();
  const navigate = useNavigate();
 const { TooltipsPopovers, showLoading, hideLoading,Timestamp } = useLoading();
  const [loading, setLoading] = useState(true);
  const [formdata, setformdata] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadRotation();
  }, []);
  const editorConfig = useMemo(() => ({

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
  }), []);

  const loadRotation = async () => {
    try {
      const q = query(collection(db, "MatchPlans"), where("Pid", "==", match_id));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        if(!docData?.hasDiscount)
        {
        	docData.hasDiscount="no";
        }
        if (!docData.Features) 
        {
  			docData.Features = [];
		}
		setformdata(docData);
      }
    } catch (error) {
      console.error("Error loading rotation:", error);
    }
    setLoading(false);
  };

  // -------------------------------
  // FEATURE HANDLERS
  // -------------------------------
const onchangeForm = (event,name) =>
{ 
  let value; 
  if(typeof event.target!="undefined")
  { 
    value=event.target.value; 
  } 
  else if(typeof event.$d!="undefined") 
  { 
    if(name=="discountFrom")
    {
      let dt = new Date(event);
      dt.setHours(0, 0, 0, 0); 
      value=Timestamp.fromDate(dt);
    }
    else if(name=="discountTo")
    {
      let dt = new Date(event);
      dt.setHours(23, 59, 59, 999); 
      value=Timestamp.fromDate(dt);
    }
    
  }
  else if(typeof event.label!="undefined") 
  { 
    value=event; 
  } 
  else if(typeof event[0]!="undefined") 
  { 
    value=event; 
  } 
  if(name=="rank")
  {
  	value=Number(event.target.value); 
  }
  setformdata((prevValues) => ({ ...prevValues, [name]: value, })); 
}
 const addFeature = () => {
  setformdata((prev) => ({
    ...prev,
    Features: [
      ...(prev.Features || []),
      { title: "", contentHtml: "" }
    ]
  }));
};

  /*const updateFeature = (index, field, value) => {
    const updated = [...rotationFeatures];
    updated[index][field] = value;
    setRotationFeatures(updated);
  };*/
  const updateFeature = (index, field, value) => {
  setformdata((prev) => {
    const updated = [...prev.Features];
    updated[index][field] = value;
    return { ...prev, Features: updated };
  });
};

  /*const deleteFeature = (index) => {
    const updated = rotationFeatures.filter((_, i) => i !== index);
    setRotationFeatures(updated);
  };*/
 const deleteFeature = (index) => {
  setformdata((prev) => ({
    ...prev,
    Features: prev.Features.filter((_, i) => i !== index)
  }));
};

  // -------------------------------
  // DRAG & DROP
  // -------------------------------

  const onDragEnd = (result) => {
    if (!result.destination) return;

    setformdata((prev) => {
    const updated = [...prev.Features];
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);

    return { ...prev, Features: updated };
  });
  };

  // -------------------------------
  // SAVE DATA
  // -------------------------------
const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storage = getStorage();
    const storageRef = ref(storage, `matchs/${match_id}/${file.name}`);
    showLoading();
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setformdata((prevValues) => ({ ...prevValues, ['display_image']: url, })); 
      TooltipsPopovers('Success', 'Image uploaded successfully!', 'Status');
    } catch (err) {
      console.error('Image upload error:', err);
      TooltipsPopovers('Error', err.message, 'Status');
    } finally {
      hideLoading();
    }
  };
  const validateRotation = () => {
  const errors = {};

  if (formdata.hasDiscount === "yes") {
    if (!formdata.discountType) errors.discountType="Discount Type is required.";
    if (!formdata.discountValue) errors.discountValue="Discount Value is required.";
    if (!formdata.discountFrom) errors.discountFrom="Discount From Date is required.";
    if (!formdata.discountTo) errors.discountFrom="Discount To Date is required.";
  }

  if (!formdata.Name || formdata.Name.trim() === "") {
    errors.Name="Plan name is required.";
  }
   if (!formdata.ActiveInActive || formdata.ActiveInActive.trim() === "") {
    errors.ActiveInActive="Status is required.";
  }
  if (!formdata.rank || isNaN(formdata.rank)) {
    errors.rank="Please Enter View Order Number.";
  }
  if (!formdata.Type || formdata.Type.trim() === "") {
    errors.Type="Please Select The Service.";
  }
if (!formdata.TotalInstallements || isNaN(formdata.TotalInstallements)) {
    errors.TotalInstallements="Plan Total Installements must be a valid number.";
  }
  if (!formdata.fee || isNaN(formdata.fee)) {
    errors.fee="Plan fee must be a valid number.";
  }


  return errors;
};
  const saveRotation = async () => {
  const vErrors = validateRotation();
  if (Object.keys(vErrors).length) {
  setErrors(vErrors);

  //TooltipsPopovers("error", "Please Fill All Required Fields.", "Status");
  scrollToFirstError(vErrors);

  return;
}
else
{
	showLoading();
    try {
    if(typeof match_id!="undefined")
    {
    	const q = query(collection(db, "MatchPlans"), where("Pid", "==", match_id));
      	const snapshot = await getDocs(q);
      	if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;

        await updateDoc(docRef, formdata);
		hideLoading();
        alert("Plan updated successfully!");
        navigate(`/admin/editmatch/${match_id}`);
      }
      else {
    //const MatchId = formdata.Name.replace(/\s+/g, '');
    const MatchId = formdata.Name
  .trim()
  .replace(/\s+/g, '')   // remove spaces
  .replace(/\//g, '_');
    await setDoc(
  doc(db, "MatchPlans", MatchId),
  {
    ...formdata,
    Pid: MatchId,
    createdAt: new Date()
  },
  { merge: true } // ✅ upsert
);

    hideLoading();
    alert("Plan added successfully!");
    navigate(`/admin/editmatch/${match_id}`);
  }
    }
    else
    {
    	 //const MatchId = formdata.Name.replace(/\s+/g, '');
    	 const MatchId = formdata.Name
  .trim()
  .replace(/\s+/g, '')   // remove spaces
  .replace(/\//g, '_');
    await setDoc(
  doc(db, "MatchPlans", MatchId),
  {
    ...formdata,
    Pid: MatchId,
    createdAt: new Date()
  },
  { merge: true } // ✅ upsert
);

    hideLoading();
    alert("Plan added successfully!");
    navigate(`/admin/editmatch/${match_id}`);
    }
      

      
      
    } catch (error) {
      console.error("Saving error:", error);
      hideLoading();
      alert("Error saving rotation.");
    }
}
  	
  };
  const scrollToFirstError = (errors) => {
  const firstErrorKey = Object.keys(errors)[0];
  const el = document.getElementById(firstErrorKey);

  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => el.focus(), 150);
  }
};

  if (loading) return <h3>Loading…</h3>;

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Edit/Add Plan ({match_id})
      </Typography>

      {/* ROTATION FEE */}
      <Grid item xs={12} sm={6}>
            <InputLabel>Service</InputLabel>
            <Select
              fullWidth
              id="Type"
              value={formdata?.Type || ''}
              onChange={(event) => onchangeForm(event, 'Type')}
            >
              <MenuItem value="Match">Match</MenuItem>
              <MenuItem value="Research">Research</MenuItem>
            </Select>
            {errors.Type  && <span className="validationerror">{errors.Type }</span>}
          </Grid>
      <Grid item xs={12} sm={6}>
            <Box mt={3}>
        <TextField
          label="Plan Name"
          type="text"
          id="Name"
          disabled={!!match_id}
          fullWidth
          value={formdata.Name}
          onChange={(event) => onchangeForm(event, "Name" )}
        />
         {errors.Name  && <span className="validationerror">{errors.Name }</span>}
      </Box>
    </Grid>
     <Grid item xs={12} sm={6}>
     <Box mt={3}>
            <InputLabel>Status Active/Inactive</InputLabel>
            <Select
              fullWidth
              value={formdata?.ActiveInActive || ''}
              onChange={(event) => onchangeForm(event, 'ActiveInActive')}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
            {errors[`ActiveInActive`]  && <span className="validationerror">{errors[`ActiveInActive`] }</span>}
        </Box>
          </Grid>
            
      <Box mt={3}>
        <TextField
          label="Plan Fee"
          type="number"
          id="fee"
          fullWidth
          value={formdata.fee}
          onChange={(event) => onchangeForm(event, "fee" )}
        />
         {errors.fee  && <span className="validationerror">{errors.fee }</span>}
      </Box>
       <Box mt={3}>
       <InputLabel>Processing Fee Percentage(Without Installements)</InputLabel>
        <TextField
          label=""
          type="number"
          id="fee"
          fullWidth
          value={formdata.processingFeePercentage}
          onChange={(event) => onchangeForm(event, "processingFeePercentage" )}
          onWheel={(e) => e.target.blur()} 
        />
         {errors.fee  && <span className="validationerror">{errors.fee }</span>}
      </Box>
      <Box mt={3}>
       <InputLabel>Processing Fee Percentage(With Installements)</InputLabel>
        <TextField
          label=""
          type="number"
          id="fee"
          fullWidth
          onWheel={(e) => e.target.blur()} 
          value={formdata.processingFeePercentageWI}
          onChange={(event) => onchangeForm(event, "processingFeePercentageWI" )}
        />
         {errors.fee  && <span className="validationerror">{errors.fee }</span>}
      </Box>
      <Grid item xs={12} sm={6}>
            <InputLabel>Maximum Number Of Installements</InputLabel>
            <Select
              fullWidth
              id="TotalInstallements"
              value={formdata?.TotalInstallements || ''}
              onChange={(event) => onchangeForm(event, 'TotalInstallements')}
            >
              <MenuItem value="1">1</MenuItem>
              <MenuItem value="2">2</MenuItem>
              <MenuItem value="3">3</MenuItem>
              <MenuItem value="4">4</MenuItem>
              <MenuItem value="5">5</MenuItem>
              <MenuItem value="6">6</MenuItem>
              <MenuItem value="7">7</MenuItem>
              <MenuItem value="8">8</MenuItem>
              <MenuItem value="9">9</MenuItem>
              <MenuItem value="10">10</MenuItem>
            </Select>
            {errors.TotalInstallements  && <span className="validationerror">{errors.TotalInstallements }</span>}
          </Grid>
           <Grid item xs={12} sm={6}>
            <InputLabel>View(Frontend) Order Number</InputLabel>
            <TextField
        type="number"
        fullWidth
        value={formdata.rank}
        onChange={(event) => onchangeForm(event, "rank")}
      />
       {errors.rank  && <span className="validationerror">{errors.rank }</span>}
          </Grid>
       <Grid item xs={12} sm={6}  mt={3}>
            <InputLabel>Match Image</InputLabel>
            <Button variant="outlined" component="label" fullWidth>
              Upload Image
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </Button>

            {formdata.display_image && (
              <Box mt={2} textAlign="center">
                <Typography variant="subtitle2" gutterBottom>Preview:</Typography>
                <img
                  src={formdata.display_image}
                  alt="Rotation"
                  style={{
                    width: "120px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                />
              </Box>
            )}
                      {/* ------------- DISCOUNT SECTION ----------------- */}
<Grid item xs={12} sm={6}>
  <InputLabel>Add Discount?</InputLabel>
  <Select
    fullWidth
    value={formdata.hasDiscount}
    id="hasDiscount"
    onChange={(event) => onchangeForm(event, "hasDiscount" )}
  >
    <MenuItem value="no">No</MenuItem>
    <MenuItem value="yes">Yes</MenuItem>
  </Select>
</Grid>

{formdata.hasDiscount === "yes" && (
  <>
    <Grid item xs={12} sm={6}>
      <InputLabel>Discount Type</InputLabel>
      <Select
        fullWidth
        id="discountType"
        value={formdata.discountType}
        onChange={(event) => onchangeForm(event, "discountType" )}
      >
        <MenuItem value="amount">Amount</MenuItem>
        <MenuItem value="percentage">Percentage</MenuItem>
      </Select>
      {errors.discountType  && <span className="validationerror">{errors.discountType }</span>}
    </Grid>

    <Grid item xs={12} sm={6}>
      <InputLabel>Discount Value</InputLabel>
      <TextField
        type="number"
        fullWidth
        id="discountValue"
        value={formdata.discountValue}
        onChange={(event) => onchangeForm(event, "discountValue")}
      />
      {errors.discountValue  && <span className="validationerror">{errors.discountValue }</span>}
    </Grid>

    <Grid item xs={12} sm={6}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <InputLabel>Discount From</InputLabel>
        <DatePicker
        id="discountFrom"
          value={formdata.discountFrom ? dayjs(formdata.discountFrom.toDate?.() || formdata.discountFrom) : null}
          onChange={(event) => onchangeForm(event, "discountFrom")}
          slotProps={{ textField: { fullWidth: true } }}
        />
      </LocalizationProvider>
      {errors.discountFrom  && <span className="validationerror">{errors.discountFrom }</span>}
    </Grid>

    <Grid item xs={12} sm={6}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <InputLabel>Discount To</InputLabel>
        <DatePicker
        	id="discountTo"
          value={formdata.discountTo ? dayjs(formdata.discountTo.toDate?.() || formdata.discountTo) : null}
          onChange={(event) => onchangeForm(event, "discountTo")}
          slotProps={{ textField: { fullWidth: true } }}
        />
      </LocalizationProvider>
      {errors.discountTo  && <span className="validationerror">{errors.discountTo }</span>}
    </Grid>
  </>
)}

          </Grid>

      {/* ADD FEATURE BUTTON */}
      <Box mt={4} display="flex" justifyContent="flex-end">
        <Tooltip title="Add New Feature">
          <IconButton color="primary" onClick={addFeature}>
            <div><AddIcon />Add Features</div>
          </IconButton>
        </Tooltip>
      </Box>

      {/* FEATURES LIST WITH DRAG & DROP */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="features">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {formdata?.Features?.map((feat, index) => (
                <Draggable key={index} draggableId={`feat-${index}`} index={index}>
                  {(provided) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      sx={{
                        p: 2,
                        my: 2,
                        borderRadius: 2,
                        background: "#fafafa",
                        border: "1px solid #ddd",
                      }}
                    >
                      <Box display="flex" alignItems="center">
                        <Box {...provided.dragHandleProps} mr={1}>
                          <DragIndicatorIcon />
                        </Box>
                        <Typography variant="h6">
                          Feature #{index + 1}
                        </Typography>
                        <Box flexGrow={1} />
                        <Tooltip title="Delete Feature">
                          <IconButton color="error" onClick={() => deleteFeature(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* FEATURE TITLE */}
                      <TextField
                        label="Title"
                        fullWidth
                        sx={{ my: 2 }}
                        value={feat.title}
                        onChange={(e) => updateFeature(index, "title", e.target.value)}
                      />

                      {/* FEATURE CONTENT (Jodit Editor) */}
                      <Typography fontWeight="bold" mb={1}>
                        Content (HTML Allowed)
                      </Typography>

                    <JoditEditor
  value={feat.contentHtml}
  //onChange={(newContent) => updateFeature(index, "contentHtml", newContent)}
    onBlur={(newContent) => {
        //setContent(newContent); // internal update
        updateFeature(index, "contentHtml", newContent); // parent update
      }}
  config={editorConfig}
/>
                    </Paper>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      {/* SAVE BUTTON */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 4 }}
        onClick={saveRotation}
      >
        Save Changes
      </Button>
    </Box>
  );
}
