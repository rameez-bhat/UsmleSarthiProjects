import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Rating,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Autocomplete,
  TextField,
  Paper,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";

import { db } from "../../firebase";

import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { useLoading } from "../../layout/LoadingContext";

export default function ReviewListPage() {
  const {
    showLoading,
    hideLoading,
    TooltipsPopovers,
  } = useLoading();

  const [reviews, setReviews] = useState([]);
  const [rotations, setRotations] = useState([]);

  const [selectedRotation, setSelectedRotation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingRotations, setLoadingRotations] = useState(false);

  const [deleteReview, setDeleteReview] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // --------------------------------------------------
  // LOAD LOCATION CODES
  // --------------------------------------------------

  useEffect(() => {
    loadRotations();
  }, []);

  const loadRotations = async () => {
    setLoadingRotations(true);

    try {
      const rotationsRef = collection(db, "Rotations");

      const q = query(
        rotationsRef,
        orderBy("location_code")
      );

      const snapshot = await getDocs(q);

      const rotationList = snapshot.docs.map((rotationDoc) => ({
        id: rotationDoc.id,
        ...rotationDoc.data(),
      }));

      setRotations(rotationList);
    } catch (error) {
      console.error("Error loading rotations:", error);

      TooltipsPopovers(
        "Error",
        "Failed to load location codes",
        "Error"
      );
    } finally {
      setLoadingRotations(false);
    }
  };

  // --------------------------------------------------
  // FETCH REVIEWS BY LOCATION CODE
  // --------------------------------------------------

  const loadReviews = async () => {
    if (!selectedRotation?.location_code) {
      TooltipsPopovers(
        "Error",
        "Please select a location code",
        "Error"
      );

      return;
    }

    setLoading(true);
    showLoading();

    try {
      const reviewsRef = collection(
        db,
        "RotationReviews"
      );

      const q = query(
        reviewsRef,
        where(
          "location_code",
          "==",
          selectedRotation.location_code
        )
      );

      const snapshot = await getDocs(q);

      const reviewList = snapshot.docs.map((reviewDoc) => ({
        id: reviewDoc.id,
        ...reviewDoc.data(),
      }));

      // Sort newest first using createdAt
      reviewList.sort((a, b) => {
        const aTime =
          a.createdAt?.seconds ||
          a.reviewDate?.seconds ||
          0;

        const bTime =
          b.createdAt?.seconds ||
          b.reviewDate?.seconds ||
          0;

        return bTime - aTime;
      });

      setReviews(reviewList);
    } catch (error) {
      console.error("Error loading reviews:", error);

      TooltipsPopovers(
        "Error",
        "Failed to load reviews",
        "Error"
      );
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  // --------------------------------------------------
  // CLEAR FILTER
  // --------------------------------------------------

  const clearFilter = () => {
    setSelectedRotation(null);
    setReviews([]);
  };

  // --------------------------------------------------
  // DELETE REVIEW
  // --------------------------------------------------

  const handleDelete = async () => {
    if (!deleteReview?.id) return;

    setDeleting(true);
    showLoading();

    try {
      await deleteDoc(
        doc(
          db,
          "RotationReviews",
          deleteReview.id
        )
      );

      setReviews((previousReviews) =>
        previousReviews.filter(
          (review) =>
            review.id !== deleteReview.id
        )
      );

      TooltipsPopovers(
        "Success",
        "Review deleted successfully",
        "Success"
      );

      setDeleteReview(null);
    } catch (error) {
      console.error(
        "Error deleting review:",
        error
      );

      TooltipsPopovers(
        "Error",
        "Failed to delete review",
        "Error"
      );
    } finally {
      setDeleting(false);
      hideLoading();
    }
  };

  // --------------------------------------------------
  // STRIP HTML
  // --------------------------------------------------

  const stripHtml = (html = "") => {
    const div = document.createElement("div");

    div.innerHTML = html;

    return (
      div.textContent ||
      div.innerText ||
      ""
    );
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <Box
      p={3}
      maxWidth="lg"
      mx="auto"
    >
      {/* HEADER */}

      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#1976d2",
          mb: 3,
        }}
      >
        Reviews
      </Typography>

      {/* LOCATION FILTER */}

      <Paper
        sx={{
          p: 3,
          mb: 3,
          boxShadow: 2,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          mb={2}
        >
          Filter Reviews
        </Typography>

        <Grid
          container
          spacing={2}
          alignItems="center"
        >
          <Grid
            item
            xs={12}
            md={7}
          >
            <Autocomplete
              value={selectedRotation}
              onChange={(event, newValue) => {
                setSelectedRotation(newValue);

                // Clear previous location reviews
                setReviews([]);
              }}
              options={rotations}
              getOptionLabel={(option) =>
                `${option.location_code || ""}${
                  option.type
                    ? ` - ${option.type}`
                    : ""
                }`
              }
              isOptionEqualToValue={(
                option,
                value
              ) => option.id === value.id}
              loading={loadingRotations}
              loadingText="Loading location codes..."
              noOptionsText="No location codes found"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Location Code"
                  placeholder="Search location code..."
                  InputProps={{
                    ...params.InputProps,

                    endAdornment: (
                      <>
                        {loadingRotations ? (
                          <CircularProgress
                            color="inherit"
                            size={20}
                          />
                        ) : null}

                        {
                          params.InputProps
                            .endAdornment
                        }
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid
            item
            xs={12}
            md={5}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1,
              }}
            >
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={loadReviews}
                disabled={
                  !selectedRotation ||
                  loading
                }
                sx={{
                  minWidth: 150,
                  height: 56,
                }}
              >
                {loading
                  ? "Fetching..."
                  : "Fetch Reviews"}
              </Button>

              <Button
                variant="outlined"
                onClick={clearFilter}
                disabled={loading}
                sx={{
                  height: 56,
                }}
              >
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* SELECT LOCATION MESSAGE */}

      {!selectedRotation &&
        reviews.length === 0 && (
          <Card>
            <CardContent>
              <Typography
                align="center"
                color="text.secondary"
              >
                Select a location code and click
                "Fetch Reviews" to view reviews.
              </Typography>
            </CardContent>
          </Card>
        )}

      {/* LOADING */}

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* RESULTS HEADER */}

      {!loading &&
        selectedRotation &&
        reviews.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight="bold"
              >
                {
                  selectedRotation.location_code
                }
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {reviews.length} review
                {reviews.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadReviews}
            >
              Refresh
            </Button>
          </Box>
        )}

      {/* NO REVIEWS FOUND */}

      {!loading &&
        selectedRotation &&
        reviews.length === 0 && (
          <Card>
            <CardContent>
              <Typography
                align="center"
                color="text.secondary"
              >
                No reviews found for{" "}
                <strong>
                  {
                    selectedRotation.location_code
                  }
                </strong>
                .
              </Typography>
            </CardContent>
          </Card>
        )}

      {/* REVIEWS */}

      {!loading && (
        <Grid
          container
          spacing={2}
        >
          {reviews.map((review) => (
            <Grid
              item
              xs={12}
              key={review.id}
            >
              <Card
                sx={{
                  boxShadow: 2,
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  {/* STUDENT + DELETE */}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "flex-start",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                      >
                        {review.student_name ||
                          review.studentEmail ||
                          "Unknown Student"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {review.studentEmail}
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={
                        <DeleteIcon />
                      }
                      onClick={() =>
                        setDeleteReview(
                          review
                        )
                      }
                    >
                      Delete
                    </Button>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* DETAILS */}

                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid
                      item
                      xs={12}
                      sm={4}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Location Code
                      </Typography>

                      <Box mt={0.5}>
                        <Chip
                          label={
                            review.location_code ||
                            "N/A"
                          }
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={4}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Rating
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: 1,
                          mt: 0.5,
                        }}
                      >
                        <Rating
                          value={Number(
                            review.ratings ||
                              0
                          )}
                          readOnly
                          size="small"
                        />

                        <Typography variant="body2">
                          {review.ratings ||
                            0}
                          /5
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={4}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Review Date
                      </Typography>

                      <Typography
                        variant="body2"
                        mt={0.5}
                      >
                        {review.Date ||
                          "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* REVIEW */}

                  <Box mt={2}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Review
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        mt: 0.5,
                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {stripHtml(
                        review.feedback
                      )}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* DELETE DIALOG */}

      <Dialog
        open={Boolean(deleteReview)}
        onClose={() => {
          if (!deleting) {
            setDeleteReview(null);
          }
        }}
      >
        <DialogTitle>
          Delete Review
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to
            delete this review
            {deleteReview?.studentEmail
              ? ` for ${deleteReview.studentEmail}`
              : ""}
            ? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setDeleteReview(null)
            }
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={
              deleting ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {deleting
              ? "Deleting..."
              : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}