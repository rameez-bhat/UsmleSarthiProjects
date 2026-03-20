import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../layout/LoadingContext";

const ReferralList = () => {
  const { FetchDataFromCollection, handleUpdate, deletedocumentfromid } = useLoading();
  const navigate = useNavigate();

  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      setLoading(true);

      const result = await FetchDataFromCollection(
        "ReferralDiscounts",
        200,      // limit
        "service",
        "!=",     // get all docs
        "",
        0
      );

      setReferrals(result || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    const docId = service.replace(/\s+/g, "");
    navigate(`/admin/referraledit/${docId}`);
  };

  const confirmDelete = (service) => {
    const docId = service.replace(/\s+/g, "");
    setDeleteId(docId);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);

      await deletedocumentfromid("ReferralDiscounts", deleteId);

      alert("Referral deleted successfully");

      setDeleteId(null);
      loadReferrals();
    } catch (err) {
      console.error(err);
      alert("Failed to delete referral");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Referral List</Typography>

        <Button
          variant="contained"
          onClick={() => navigate("/admin/addreferral")}
        >
          ➕ Add Referral
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Service</b></TableCell>
              <TableCell><b>Discount On </b></TableCell>
              <TableCell><b>Referral Discount</b></TableCell>
              <TableCell><b>User Discount</b></TableCell>
              <TableCell align="center"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!loading && referrals.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No referrals found.
                </TableCell>
              </TableRow>
            )}

            {referrals.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.service}</TableCell>
                 <TableCell>
                  {row.discountFeeType=="ServiceFee"?"Service Fee Only": row.discountFeeType=="ApplicationFee"?"Application Fee Only":"Both Fee"}
                </TableCell>

                <TableCell>
                  {row.referralDiscountType=="Value"?"$"+row.referralDiscountValue:row.referralDiscountValue+"%"}
                </TableCell>

                <TableCell>
                   { row.userDiscountType=="Value"?"$"+row.userDiscountValue:row.userDiscountValue+"%"}
                </TableCell>

                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(row.service)}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => confirmDelete(row.service)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ✅ DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this referral?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReferralList;
