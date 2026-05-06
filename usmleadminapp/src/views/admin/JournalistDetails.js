import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "../../components/css/Journalist.css";
import dayjs from "dayjs";

const JournalistDetails = () => {
  const { mentorId } = useParams();

  const [rawData, setRawData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [mentorId]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const snap = await getDocs(
        collection(db, "Users", mentorId, "Earnings")
      );

      const result = [];

      snap.forEach((doc) => {
        const d = doc.data();
        const services = d.services || {};

        Object.values(services).forEach((s) => {
          result.push({
            studentId: doc.id,
            displayName: d.displayName,
            service: s.service,
            amount: s.amount || 0,
            date: s.updatedAt?.toDate
              ? s.updatedAt.toDate()
              : new Date(s.updatedAt)
          });
        });
      });

      setRawData(result);
    } catch (err) {
      console.error("Error fetching earnings:", err);
    }

    setLoading(false);
  };

  // 🔥 FILTER (client-side, correct)
  const data = useMemo(() => {
    return rawData.filter((item) => {
      const d = dayjs(item.date);

      if (fromDate && d.isBefore(dayjs(fromDate))) return false;
      if (toDate && d.isAfter(dayjs(toDate).endOf("day"))) return false;

      return true;
    });
  }, [rawData, fromDate, toDate]);

  // 🔥 TOTAL
  const total = useMemo(() => {
    return data.reduce((sum, i) => sum + i.amount, 0);
  }, [data]);

  // 🔥 GROUPED
  const grouped = useMemo(() => {
    return data.reduce((acc, item) => {
      acc[item.service] = (acc[item.service] || 0) + item.amount;
      return acc;
    }, {});
  }, [data]);

  return (
  <div className="jd-container">
    <h2 className="jd-title">Earnings Details</h2>

    {/* FILTERS */}
    <div className="jd-filters">
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />

      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
      />

      <button onClick={fetchData}>Refresh</button>
    </div>

    {loading && <div className="jd-loading">Loading...</div>}

    {/* SUMMARY */}
    <div className="jd-summary">
      <div className="jd-card">
        <div className="jd-label">Total Earnings</div>
        <div className="jd-value">${total}</div>
      </div>

      <div className="jd-card">
        <div className="jd-label">Services</div>
        <div className="jd-services">
          {Object.entries(grouped).map(([k, v]) => (
            <div key={k} className="jd-service-row">
              <span>{k}</span>
              <span>${v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* TABLE */}
    <div className="jd-table-wrapper">
      <table className="jd-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Service</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row.displayName}</td>
              <td>{row.service}</td>
              <td className="amount">${row.amount}</td>
              <td>{dayjs(row.date).format("YYYY-MM-DD")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
};

export default JournalistDetails;