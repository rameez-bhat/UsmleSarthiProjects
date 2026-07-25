// AdminReviewPage.jsx - Updated with dynamic search

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Rating,
  Autocomplete,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { db } from '../../firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  startAt,
  endAt
} from 'firebase/firestore';
import { useLoading } from '../../layout/LoadingContext';
import JoditEditor from 'jodit-react';

export default function AdminReviewPage() {
  const { showLoading, hideLoading, TooltipsPopovers } = useLoading();
  
  // State for dropdown options
  const [rotations, setRotations] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingRotations, setLoadingRotations] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearchInput, setStudentSearchInput] = useState('');
  const [studentHasMore, setStudentHasMore] = useState(true);
  const [studentLastDoc, setStudentLastDoc] = useState(null);
  const [studentInitialLoaded, setStudentInitialLoaded] = useState(false);
  
  // Selected values
  const [selectedRotation, setSelectedRotation] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Review form fields
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewDate, setReviewDate] = useState(dayjs());
  const [hover, setHover] = useState(-1);
  
  // Editor config
  const editorConfig = {
    readonly: false,
    height: 300,
    toolbarAdaptive: false,
    placeholder: 'Write your detailed review here...',
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough',
      '|',
      'ul', 'ol',
      '|',
      'link', 'image',
      '|',
      'undo', 'redo'
    ]
  };
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Submit loading state
  const [submitting, setSubmitting] = useState(false);
  
  // Debounce timer for search
  const searchTimeout = useRef(null);

  // Load rotations
  useEffect(() => {
    loadRotations();
    loadInitialStudents();
  }, []);

  // Search students when input changes (debounced)
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (studentSearchInput.length >= 1) {
        searchStudents(studentSearchInput);
      } else if (studentSearchInput.length === 0 && !studentInitialLoaded) {
        loadInitialStudents();
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [studentSearchInput]);

  const loadRotations = async () => {
    setLoadingRotations(true);
    try {
      const rotationsRef = collection(db, 'Rotations');
      const q = query(rotationsRef, orderBy('location_code'));
      const snapshot = await getDocs(q);
      const rotationList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRotations(rotationList);
    } catch (error) {
      console.error('Error loading rotations:', error);
      TooltipsPopovers('Error', 'Failed to load rotations', 'Error');
    } finally {
      setLoadingRotations(false);
    }
  };

  // Load initial 100 students
  const loadInitialStudents = async () => {
    if (studentInitialLoaded) return;
    
    setLoadingStudents(true);
    try {
      const studentsRef = collection(db, 'Users');
      const q = query(
        studentsRef, 
        orderBy('updatedAt', 'desc'), 
        limit(100)
      );
      const snapshot = await getDocs(q);
      const studentList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStudents(studentList);
      setStudentLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setStudentHasMore(snapshot.docs.length === 100);
      setStudentInitialLoaded(true);
    } catch (error) {
      console.error('Error loading students:', error);
      TooltipsPopovers('Error', 'Failed to load students', 'Error');
    } finally {
      setLoadingStudents(false);
    }
  };

  // Dynamic search students by email from database
  const searchStudents = async (searchText) => {
    if (!searchText || searchText.trim().length < 1) {
      if (!studentInitialLoaded) {
        loadInitialStudents();
      }
      return;
    }

    setLoadingStudents(true);
    try {
      const searchTerm = searchText.trim().toLowerCase();
      const studentsRef = collection(db, 'Users');
      
      // Query for students with email containing the search text
      // Note: Firestore doesn't support case-insensitive contains directly
      // Using startAt/endAt for prefix matching
      const q = query(
        studentsRef,
        orderBy('email'),
        startAt(searchTerm),
        endAt(searchTerm + '\uf8ff'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const studentList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStudents(studentList);
      setStudentHasMore(snapshot.docs.length === 50);
      setStudentLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    } catch (error) {
      console.error('Error searching students:', error);
      
      // Fallback: Try a more flexible search approach
      try {
        // If the indexed search fails, try to get all and filter (for development)
        const studentsRef = collection(db, 'Users');
        const q = query(studentsRef, orderBy('updatedAt', 'desc'), limit(200));
        const snapshot = await getDocs(q);
        const allStudents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter client-side for contains search
        const filtered = allStudents.filter(student => 
          student.email?.toLowerCase().includes(searchTerm)
        );
        
        setStudents(filtered);
        setStudentHasMore(false);
      } catch (fallbackError) {
        console.error('Fallback search error:', fallbackError);
        TooltipsPopovers('Error', 'Failed to search students', 'Error');
      }
    } finally {
      setLoadingStudents(false);
    }
  };

  // Load more students (pagination)
  const loadMoreStudents = async () => {
    if (!studentHasMore || !studentLastDoc) return;
    
    setLoadingStudents(true);
    try {
      const studentsRef = collection(db, 'Users');
      const q = query(
        studentsRef,
        where('email', '!=', 'student'),
        orderBy('email'),
        startAfter(studentLastDoc),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      const newStudents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStudents(prev => [...prev, ...newStudents]);
      setStudentLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setStudentHasMore(snapshot.docs.length === 100);
    } catch (error) {
      console.error('Error loading more students:', error);
      TooltipsPopovers('Error', 'Failed to load more students', 'Error');
    } finally {
      setLoadingStudents(false);
    }
  };

  // Custom filter for Autocomplete
  const filterStudents = (options, { inputValue }) => {
    // For the Autocomplete component, we handle search via the API
    // This is just for display filtering if needed
    if (!inputValue) return options;
    return options;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedRotation) {
      newErrors.rotation = 'Please select a rotation';
    }
    
    if (!selectedStudent) {
      newErrors.student = 'Please select a student';
    }
    
    if (rating === 0) {
      newErrors.rating = 'Please provide a rating';
    }
    
    if (!reviewText || reviewText.replace(/<[^>]*>/g, '').trim() === '') {
      newErrors.reviewText = 'Please write a review';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const formatDateTime = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');

  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    ' ' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds())
  );
};
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      TooltipsPopovers('Error', 'Please fill all required fields', 'Error');
      return;
    }
    
    setSubmitting(true);
    showLoading();
    
    try {
      const reviewData = {
        rotationId: selectedRotation.id,
        location_code: selectedRotation.location_code,
        studentId: selectedStudent.id,
        studentEmail: selectedStudent.email,
        student_name: selectedStudent.displayName || selectedStudent.email,
        ratings: rating,
        feedback: reviewText,
        Date: reviewDate ? formatDateTime(reviewDate.toDate()): formatDateTime(),
        reviewDate: reviewDate ? Timestamp.fromDate(reviewDate.toDate()) : serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      };
      console.log("reviewData----->",reviewData)
      const reviewsRef = collection(db, 'RotationReviews');
      const docRef = await addDoc(reviewsRef, reviewData);
      await updateDoc(docRef, {
  id: docRef.id
});
      //await updateRotationStats(selectedRotation.id);*/
      
      TooltipsPopovers('Success', 'Review submitted successfully!', 'Success');
      
      // Reset form
      setSelectedRotation(null);
      setSelectedStudent(null);
      setRating(0);
      setReviewText('');
      setErrors({});
      
    } catch (error) {
      console.error('Error submitting review:', error);
      TooltipsPopovers('Error', 'Failed to submit review', 'Error');
    } finally {
      setSubmitting(false);
      hideLoading();
    }
  };

  // Update rotation stats
  const updateRotationStats = async (rotationId) => {
    try {
      const reviewsRef = collection(db, 'Reviews');
      const q = query(reviewsRef, where('rotationId', '==', rotationId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return;
      
      let totalRating = 0;
      let reviewCount = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.rating) {
          totalRating += data.rating;
          reviewCount++;
        }
      });
      
      const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
      
      const rotationRef = doc(db, 'Rotations', rotationId);
      await updateDoc(rotationRef, {
        averageRating: averageRating,
        reviewCount: reviewCount,
        lastReviewDate: serverTimestamp()
      });
      
    } catch (error) {
      console.error('Error updating rotation stats:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={3} maxWidth="lg" mx="auto">
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Add Review
        </Typography>
        
        <Card sx={{ mt: 3, p: 3, boxShadow: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              
              {/* Rotation Dropdown */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  value={selectedRotation}
                  onChange={(event, newValue) => {
                    setSelectedRotation(newValue);
                    setErrors(prev => ({ ...prev, rotation: '' }));
                  }}
                  options={rotations}
                  getOptionLabel={(option) => `${option.location_code} - ${option.type || ''}`}
                  loading={loadingRotations}
                  loadingText="Loading rotations..."
                  noOptionsText="No rotations found"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Rotation"
                      required
                      error={!!errors.rotation}
                      helperText={errors.rotation}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingRotations ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              
              {/* Student Dropdown - Dynamic Search by Email */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  value={selectedStudent}
                  onChange={(event, newValue) => {
                    setSelectedStudent(newValue);
                    setErrors(prev => ({ ...prev, student: '' }));
                  }}
                  inputValue={studentSearchInput}
                  onInputChange={(event, newInputValue) => {
                    setStudentSearchInput(newInputValue);
                  }}
                  options={students}
                  getOptionLabel={(option) => `${option.email} (${option.displayName || 'No name'})`}
                  filterOptions={filterStudents}
                  loading={loadingStudents}
                  loadingText="Searching students..."
                  noOptionsText="No students found. Try searching by email."
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Student by Email"
                      required
                      error={!!errors.student}
                      helperText={errors.student}
                      placeholder="Type at least 1 character to search..."
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingStudents ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  ListboxProps={{
                    onScroll: (event) => {
                      const listboxNode = event.currentTarget;
                      if (listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 50) {
                        if (studentHasMore && !loadingStudents && studentSearchInput.length < 1) {
                          loadMoreStudents();
                        }
                      }
                    }
                  }}
                />
                {studentSearchInput.length < 1 && students.length > 0 && (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                    Showing first {students.length} students. Type to search more.
                  </Typography>
                )}
              </Grid>
              
              {/* Rating Field */}
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 2,
                  bgcolor: '#f5f5f5',
                  borderRadius: 1
                }}>
                  <Typography variant="body1" fontWeight="bold">
                    Rating:
                  </Typography>
                  <Rating
                    name="review-rating"
                    value={rating}
                    precision={1}
                    onChange={(event, newValue) => {
                      setRating(newValue || 0);
                      setErrors(prev => ({ ...prev, rating: '' }));
                    }}
                    onChangeActive={(event, newHover) => {
                      setHover(newHover);
                    }}
                    size="large"
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: '#ff6d00',
                      },
                      '& .MuiRating-iconHover': {
                        color: '#ff3d00',
                      },
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {hover !== -1 ? hover : rating} / 5
                  </Typography>
                  {errors.rating && (
                    <Typography color="error" variant="caption">
                      {errors.rating}
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              {/* Review Date */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Review Date"
                  value={reviewDate}
                  onChange={(newValue) => setReviewDate(newValue)}
                  sx={{ width: '100%' }}
                />
              </Grid>
              
              {/* Review Text Editor */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Review Content
                </Typography>
                <Box sx={{ border: errors.reviewText ? '2px solid red' : '1px solid #ccc', borderRadius: 1 }}>
                  <JoditEditor
                    value={reviewText}
                    onBlur={(newContent) => {
                      setReviewText(newContent);
                      setErrors(prev => ({ ...prev, reviewText: '' }));
                    }}
                    config={editorConfig}
                  />
                </Box>
                {errors.reviewText && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {errors.reviewText}
                  </Typography>
                )}
              </Grid>
              
              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedRotation(null);
                      setSelectedStudent(null);
                      setStudentSearchInput('');
                      setRating(0);
                      setReviewText('');
                      setErrors({});
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting}
                    sx={{ minWidth: 150 }}
                  >
                    {submitting ? <CircularProgress size={24} /> : 'Submit Review'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Display selected info */}
        {selectedRotation && selectedStudent && (
          <Paper sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd' }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Chip 
                label={`Rotation: ${selectedRotation.location_code}`}
                color="primary"
                variant="outlined"
              />
              <Chip 
                label={`Student: ${selectedStudent.email}`}
                color="secondary"
                variant="outlined"
              />
              <Chip 
                label={`Rating: ${rating} / 5`}
                color={rating > 3 ? 'success' : rating > 2 ? 'warning' : 'error'}
              />
            </Stack>
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
}