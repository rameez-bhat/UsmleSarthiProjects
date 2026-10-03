import React, { useEffect, useMemo, useState } from "react";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";

import JoditEditor from "jodit-react";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";

import { db } from "../../firebase";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import { useLoading } from "../../layout/LoadingContext";

export default function StudentUpdates() {
  const {
    TooltipsPopovers,
    showLoading,
    hideLoading,
  } = useLoading();

  const [updates, setUpdates] = useState([]);
  const [filter, setFilter] = useState("active");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const [errors, setErrors] = useState({});

  const emptyForm = {
    title: "",
    contentHtml: "",
    publishAt: Timestamp.fromDate(new Date()),
    expiresAt: null,
  };

  const [formdata, setformdata] = useState(emptyForm);

  // -----------------------------------------------------
  // JODIT
  // -----------------------------------------------------

  const editorConfig = useMemo(
    () => ({
      readonly: false,
      height: 400,
      toolbarAdaptive: false,
      toolbarSticky: true,
      iframe: false,
      allowResizeY: true,
      allowResizeX: false,

      uploader: {
        insertImageAsBase64URI: true,
        imagesExtensions: ["jpg", "png", "jpeg", "gif", "webp"],
      },

      pasteHTML: true,
      pasteFromWord: true,

      cleanHTML: {
        replaceNBSP: true,
        fillEmptyParagraph: false,
        removeEmptyElements: true,
      },

      link: {
        followOnDblClick: true,
        autoShorten: true,
      },

      video: {
        useVideoControls: true,
        controls: true,
      },

      useSearch: true,

      table: {
        allowCellMerge: true,
        allowCellSplit: true,
        cellMinWidth: 40,
        className: "jodit-table",
      },

      buttons: [
        "source",
        "|",

        "bold",
        "italic",
        "underline",
        "strikethrough",

        "|",

        "font",
        "fontsize",
        "brush",
        "paragraph",

        "|",

        "left",
        "center",
        "right",
        "justify",

        "|",

        "ul",
        "ol",
        "indent",
        "outdent",

        "|",

        "table",

        "|",

        "link",
        "image",
        "video",
        "file",
        "hr",

        "|",

        "fullsize",
        "preview",

        "|",

        "undo",
        "redo",
      ],

      style: `
        table {
          border-collapse: collapse;
          width: 100%;
        }

        table td,
        table th {
          border: 1px solid #333;
          padding: 6px;
        }

        img {
          max-width: 100%;
          height: auto;
        }
      `,
    }),
    []
  );

  // -----------------------------------------------------
  // LOAD UPDATES
  // -----------------------------------------------------

  const loadUpdates = async () => {
    showLoading();

    try {
      const q = query(
        collection(db, "StudentUpdates"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const list = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setUpdates(list);
    } catch (error) {
      console.error("Error loading updates:", error);

      TooltipsPopovers(
        "Error",
        error.message || "Unable to load student updates.",
        "Status"
      );
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  // -----------------------------------------------------
  // DATE HELPERS
  // -----------------------------------------------------

  const convertToDayjs = (value) => {
    if (!value) return null;

    if (value?.toDate) {
      return dayjs(value.toDate());
    }

    return dayjs(value);
  };

  const getStatus = (item) => {
    const now = dayjs();

    const publishAt = convertToDayjs(item.publishAt);
    const expiresAt = convertToDayjs(item.expiresAt);

    if (publishAt && now.isBefore(publishAt)) {
      return "scheduled";
    }

    if (expiresAt && now.isAfter(expiresAt)) {
      return "expired";
    }

    return "active";
  };

  const formatDate = (value) => {
    const date = convertToDayjs(value);

    if (!date) {
      return "-";
    }

    return date.format("DD-MM-YYYY hh:mm A");
  };

  // -----------------------------------------------------
  // FILTER
  // -----------------------------------------------------

  const filteredUpdates = useMemo(() => {
    if (filter === "all") {
      return updates;
    }

    return updates.filter((item) => getStatus(item) === filter);
  }, [updates, filter]);

  // -----------------------------------------------------
  // OPEN ADD
  // -----------------------------------------------------

  const handleAdd = () => {
    setEditingId(null);

    setformdata({
      title: "",
      contentHtml: "",
      publishAt: Timestamp.fromDate(new Date()),
      expiresAt: null,
    });

    setErrors({});
    setOpen(true);
  };

  // -----------------------------------------------------
  // OPEN EDIT
  // -----------------------------------------------------

  const handleEdit = (item) => {
    setEditingId(item.id);

    setformdata({
      title: item.title || "",
      contentHtml: item.contentHtml || "",
      publishAt:
        item.publishAt || Timestamp.fromDate(new Date()),
      expiresAt: item.expiresAt || null,
    });

    setErrors({});
    setOpen(true);
  };

  // -----------------------------------------------------
  // CLOSE DIALOG
  // -----------------------------------------------------

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setErrors({});
  };

  // -----------------------------------------------------
  // EMPTY HTML
  // -----------------------------------------------------

  const isEmptyHtml = (html) => {
    if (!html) return true;

    const text = html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, "")
      .trim();

    return text === "";
  };

  // -----------------------------------------------------
  // VALIDATION
  // -----------------------------------------------------

  const validateForm = () => {
    const newErrors = {};

    if (!formdata.title?.trim()) {
      newErrors.title = "Title is required.";
    }

    if (isEmptyHtml(formdata.contentHtml)) {
      newErrors.contentHtml = "Update content is required.";
    }

    if (!formdata.publishAt) {
      newErrors.publishAt = "Publish date is required.";
    }

    if (!formdata.expiresAt) {
      newErrors.expiresAt = "Expiry date is required.";
    }

    if (formdata.publishAt && formdata.expiresAt) {
      const publishAt = convertToDayjs(formdata.publishAt);
      const expiresAt = convertToDayjs(formdata.expiresAt);

      if (
        expiresAt.isBefore(publishAt) ||
        expiresAt.isSame(publishAt)
      ) {
        newErrors.expiresAt =
          "Expiry date/time must be after publish date/time.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // -----------------------------------------------------
  // SAVE
  // -----------------------------------------------------

  const saveUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    showLoading();

    try {
      const data = {
        title: formdata.title.trim(),
        contentHtml: formdata.contentHtml,
        publishAt: formdata.publishAt,
        expiresAt: formdata.expiresAt,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(
          doc(db, "StudentUpdates", editingId),
          data
        );

        TooltipsPopovers(
          "Success",
          "Student update updated successfully.",
          "Status"
        );
      } else {
        await addDoc(collection(db, "StudentUpdates"), {
          ...data,
          createdAt: serverTimestamp(),
        });

        TooltipsPopovers(
          "Success",
          "Student update added successfully.",
          "Status"
        );
      }

      handleClose();
      await loadUpdates();
    } catch (error) {
      console.error("Error saving update:", error);

      TooltipsPopovers(
        "Error",
        error.message || "Unable to save update.",
        "Status"
      );
    } finally {
      hideLoading();
    }
  };

  // -----------------------------------------------------
  // DELETE
  // -----------------------------------------------------

  const askDelete = (item) => {
    setDeleteItem(item);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteItem?.id) return;

    showLoading();

    try {
      await deleteDoc(
        doc(db, "StudentUpdates", deleteItem.id)
      );

      TooltipsPopovers(
        "Success",
        "Student update deleted successfully.",
        "Status"
      );

      setDeleteOpen(false);
      setDeleteItem(null);

      await loadUpdates();
    } catch (error) {
      console.error("Delete error:", error);

      TooltipsPopovers(
        "Error",
        error.message || "Unable to delete update.",
        "Status"
      );
    } finally {
      hideLoading();
    }
  };

  // -----------------------------------------------------
  // STATUS CHIP
  // -----------------------------------------------------

  const renderStatus = (item) => {
    const status = getStatus(item);

    if (status === "active") {
      return (
        <Chip
          label="Active"
          color="success"
          size="small"
        />
      );
    }

    if (status === "scheduled") {
      return (
        <Chip
          label="Scheduled"
          color="warning"
          size="small"
        />
      );
    }

    return (
      <Chip
        label="Expired"
        color="error"
        size="small"
      />
    );
  };

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------

  return (
    <Box p={{ xs: 1, md: 1 }}>
      {/* HEADER */}

      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Box flexGrow={1}>
            <Typography variant="h5" fontWeight="bold">
              Student Updates
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              mt={0.5}
            >
              Create and manage announcements and updates
              displayed to students.
            </Typography>
          </Box>

          <TextField
            select
            size="small"
            label="Show Updates"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{
              minWidth: {
                xs: "100%",
                md: 190,
              },
            }}
          >
            <MenuItem value="active">
              Active
            </MenuItem>

            <MenuItem value="scheduled">
              Scheduled
            </MenuItem>

            <MenuItem value="expired">
              Expired / Old
            </MenuItem>

            <MenuItem value="all">
              All Updates
            </MenuItem>
          </TextField>

          <Tooltip title="Refresh">
            <IconButton onClick={loadUpdates}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Update
          </Button>
        </Stack>
      </Paper>

      {/* EMPTY STATE */}

      {filteredUpdates.length === 0 && (
        <Paper
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            color="text.secondary"
          >
            No updates found
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            mt={1}
          >
            There are no updates matching the selected
            filter.
          </Typography>
        </Paper>
      )}

      {/* UPDATE LIST */}

      <Stack spacing={2}>
        {filteredUpdates.map((item) => (
          <Paper
            key={item.id}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              spacing={2}
              alignItems={{
                xs: "flex-start",
                md: "center",
              }}
            >
              <Box flexGrow={1}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                  >
                    {item.title}
                  </Typography>

                  {renderStatus(item)}
                </Stack>

                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={{ xs: 0.5, sm: 3 }}
                  mt={1}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    <strong>Publish:</strong>{" "}
                    {formatDate(item.publishAt)}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    <strong>Expires:</strong>{" "}
                    {formatDate(item.expiresAt)}
                  </Typography>
                </Stack>
              </Box>

              <Stack direction="row" spacing={1}>
                <Tooltip title="Edit">
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(item)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete">
                  <IconButton
                    color="error"
                    onClick={() => askDelete(item)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                maxHeight: 150,
                overflow: "hidden",

                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                },

                "& table": {
                  borderCollapse: "collapse",
                },

                "& td, & th": {
                  border: "1px solid #ddd",
                  p: 0.5,
                },
              }}
              dangerouslySetInnerHTML={{
                __html: item.contentHtml || "",
              }}
            />
          </Paper>
        ))}
      </Stack>

      {/* ADD / EDIT DIALOG */}

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              flexGrow={1}
            >
              {editingId
                ? "Edit Student Update"
                : "Add Student Update"}
            </Typography>

            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <TextField
            label="Update Title"
            value={formdata.title}
            onChange={(e) =>
              setformdata((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            sx={{ mt: 1, mb: 3 }}
          />

          <LocalizationProvider
            dateAdapter={AdapterDayjs}
          >
            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              spacing={2}
              mb={3}
            >
              <DateTimePicker
                label="Publish Date & Time"
                value={convertToDayjs(
                  formdata.publishAt
                )}
                onChange={(value) => {
                  setformdata((prev) => ({
                    ...prev,

                    publishAt: value
                      ? Timestamp.fromDate(
                          value.toDate()
                        )
                      : null,
                  }));
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.publishAt,
                    helperText: errors.publishAt,
                  },
                }}
              />

              <DateTimePicker
                label="Expiry Date & Time"
                value={convertToDayjs(
                  formdata.expiresAt
                )}
                minDateTime={convertToDayjs(
                  formdata.publishAt
                )}
                onChange={(value) => {
                  setformdata((prev) => ({
                    ...prev,

                    expiresAt: value
                      ? Timestamp.fromDate(
                          value.toDate()
                        )
                      : null,
                  }));
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.expiresAt,
                    helperText: errors.expiresAt,
                  },
                }}
              />
            </Stack>
          </LocalizationProvider>

          <Typography
            fontWeight="bold"
            mb={1}
          >
            Update Details
          </Typography>

          <Box
            sx={{
              border: errors.contentHtml
                ? "1px solid"
                : "none",

              borderColor: "error.main",
            }}
          >
            <JoditEditor
              value={formdata.contentHtml}
              config={editorConfig}
              onBlur={(newContent) => {
                setformdata((prev) => ({
                  ...prev,
                  contentHtml: newContent,
                }));
              }}
            />
          </Box>

          {errors.contentHtml && (
            <Typography
              color="error"
              variant="caption"
              mt={1}
              display="block"
            >
              {errors.contentHtml}
            </Typography>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2 }}>
          <Button
            color="inherit"
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={saveUpdate}
          >
            {editingId
              ? "Update"
              : "Publish Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE DIALOG */}

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Delete Update
        </DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete
            <strong>
              {" "}
              {deleteItem?.title}
            </strong>
            ?
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            mt={1}
          >
            This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            color="inherit"
            onClick={() =>
              setDeleteOpen(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}