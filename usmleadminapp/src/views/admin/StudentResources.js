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
      //const q = query(collection(db, "StudentResources"), where("Pid", "==", match_id));
      const q = query(collection(db, "StudentResources"));
      const snapshot = await getDocs(q);
      let  docData={};
	let DoNeedLoad=false;
      if (!snapshot.empty) {
         docData = snapshot.docs[0].data();
       
        if (!docData.Features) 
        {
  			docData.Features = [];
  			DoNeedLoad=true;
		}
		
      }
      else
      {
      	 docData={};
      	
  			docData.Features = [];
  			DoNeedLoad=true;
      }
      setformdata(docData);
      if(DoNeedLoad)
      {
      	await addFeature()
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


  if (formdata.Features?.length) {
    formdata.Features.forEach((feature, index) => {
      if (!feature.title || feature.title.trim() === "") {
        errors[`Features_${index}_title`] =
          `Feature #${index + 1}: Title is required.`;
      }

      if (isEmptyHtml(feature.contentHtml)) {
        errors[`Features_${index}_content`] =
          `Feature #${index + 1}: Content cannot be empty.`;
      }
    });
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
    const MatchId = "resource1"
    await setDoc(
  doc(db, "StudentResources", MatchId),
  {
    ...formdata,
    Pid: MatchId,
    createdAt: new Date()
  },
  { merge: true } // ✅ upsert
);

    hideLoading();
    alert("Resource added successfully!");
      

      
      
    } catch (error) {
      console.error("Saving error:", error);
      hideLoading();
      alert("Error saving rotation.");
    }
}
  	
  };
  const isEmptyHtml = (html) => {
  if (!html) return true;
  const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
  return text === '';
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
        Edit/Add Resources
      </Typography>

      

      {/* ADD FEATURE BUTTON */}
      <Box mt={4} display="flex" justifyContent="flex-end">
        <Tooltip title="Add New Feature">
          <IconButton color="primary" onClick={addFeature}>
            <div><AddIcon />Add Resources</div>
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
                          Resource #{index + 1}
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
                        error={!!errors[`Features_${index}_title`]}
  						helperText={errors[`Features_${index}_title`]}
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
{errors[`Features_${index}_content`] && (
  <Typography color="error" mt={1}>
    {errors[`Features_${index}_content`]}
  </Typography>
)}
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
