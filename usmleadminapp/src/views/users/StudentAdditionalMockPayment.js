import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Checkbox,
  FormControlLabel,
  Divider,
  TextField,
  Stack,
} from "@mui/material";

export default function StudentAdditionalMockPayment({ studentData }) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentType, setPaymentType] = useState(null);
  const [payOtherAmount, setPayOtherAmount] = useState(false);
  const [enterOtherAmount, setEnterOtherAmount] = useState("");

  const ApplicationFee =
    studentData?.studentMocksConfig?.additionalMockPrice || 0;

  const processingFee = (ApplicationFee * 4) / 100 + 0.3;
  const totalStripe =
    (payOtherAmount && enterOtherAmount
      ? Number(enterOtherAmount)
      : ApplicationFee) + processingFee;

  const openGmail = () => {
    window.open(
      "mailto:enroll@usmlesarthi.com?subject=Additional Mock Payment",
      "_blank"
    );
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/919999999999", "_blank");
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Payments Selection
      </Typography>

      <FormControlLabel
        control={
          <Checkbox
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
        }
        label="I agree with the above terms"
      />

      {/* PAYMENT BUTTONS */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mt={2}>
        <Button
          variant="contained"
          disabled={!termsAccepted}
          onClick={() => setPaymentType("stripe")}
        >
          💳 Credit / Debit Card
        </Button>

        <Button
          variant="contained"
          color="warning"
          disabled={!termsAccepted}
          onClick={() => setPaymentType("zelle")}
        >
          🟣 Pay via Zelle
        </Button>

        <Button
          variant="contained"
          color="secondary"
          disabled={!termsAccepted}
          onClick={() => setPaymentType("wire")}
        >
          🏦 Pay via Wire Transfer
        </Button>
      </Stack>

      {/* ZELLE */}
      {paymentType === "zelle" && (
        <PaymentInfoBlock title="💜 Zelle Payment Details">
          <InfoRow label="Name" value="MedSarthi LLC" />
          <InfoRow label="Email for Zelle" value="pawankhera@usmlesarthi.com" />
          <InfoRow
            label="Instructions"
            value="Include the student's name in notes and send a screenshot to enroll@usmlesarthi.com"
          />
          <InfoRow
            label="Application Fee"
            value={`$${ApplicationFee}`}
          />

          <SupportActions
            openGmail={openGmail}
            openWhatsApp={openWhatsApp}
          />
        </PaymentInfoBlock>
      )}

      {/* STRIPE */}
      {paymentType === "stripe" && (
        <PaymentInfoBlock title="💳 Stripe Payment Details">
          <InfoRow label="Name" value="MedSarthi LLC" />
          <InfoRow
            label="Application Fee"
            value={`$${ApplicationFee}`}
          />
          <InfoRow
            label="Processing Fee (4% + $0.30)"
            value={`$${processingFee.toFixed(2)}`}
          />
          <InfoRow
            label="Total Payment"
            value={`$${totalStripe.toFixed(2)}`}
            bold
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={payOtherAmount}
                onChange={(e) => setPayOtherAmount(e.target.checked)}
              />
            }
            label="Pay Other Amount"
          />

          {payOtherAmount && (
            <TextField
              fullWidth
              type="number"
              label="Enter Amount You Want To Pay"
              value={enterOtherAmount}
              onChange={(e) => setEnterOtherAmount(e.target.value)}
              sx={{ my: 2 }}
            />
          )}

          <Button variant="contained" fullWidth sx={{ mt: 2 }}>
            💼 Proceed To Pay
          </Button>

          <SupportActions
            openGmail={openGmail}
            openWhatsApp={openWhatsApp}
          />
        </PaymentInfoBlock>
      )}

      {/* WIRE */}
      {paymentType === "wire" && (
        <PaymentInfoBlock title="🏦 Wire Transfer Details">
          <InfoRow label="Wire To" value="Medsarthi LLC" />
          <InfoRow label="Bank Name" value="Bank of America" />
          <InfoRow label="Account Number" value="4570-4639-8400" />
          <InfoRow label="SWIFT Code" value="BOFAUS3N" />
          <InfoRow
            label="Application Fee"
            value={`$${ApplicationFee}`}
          />
          <InfoRow label="Processing Fee" value="$35" />

          <SupportActions
            openGmail={openGmail}
            openWhatsApp={openWhatsApp}
          />
        </PaymentInfoBlock>
      )}
    </Paper>
  );
}

/* ----------------- REUSABLE UI COMPONENTS ----------------- */

const PaymentInfoBlock = ({ title, children }) => (
  <Box mt={4}>
    <Typography variant="h6" mb={2}>
      {title}
    </Typography>
    <Divider sx={{ mb: 2 }} />
    {children}
  </Box>
);

const InfoRow = ({ label, value, bold }) => (
  <Box display="flex" justifyContent="space-between" mb={1}>
    <Typography>{label}:</Typography>
    <Typography fontWeight={bold ? "bold" : "normal"}>
      {value}
    </Typography>
  </Box>
);

const SupportActions = ({ openGmail, openWhatsApp }) => (
  <Stack direction="row" spacing={2} mt={3}>
    <Button variant="outlined" color="error" onClick={openGmail}>
      Email Support
    </Button>
    <Button variant="outlined" color="success" onClick={openWhatsApp}>
      WhatsApp Support
    </Button>
  </Stack>
);
