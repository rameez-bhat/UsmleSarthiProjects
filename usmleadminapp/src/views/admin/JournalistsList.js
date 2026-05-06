import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,increment,getDocs
  
} from "firebase/firestore";
import { db } from "../../firebase";
import  '../../components/css/Journalist.css';
import { useLoading } from "../../layout/LoadingContext";

const JournalistsDashboard = () => {
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("desc");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { fetchAdminDataWithJoin } = useLoading();

  useEffect(() => {
    loadData();
  }, []);
const Card = ({ title, value }) => (
  <div className="summaryCard">
    <div className="title">{title}</div>
    <div className="value">{value}</div>
  </div>
);
  const loadData = async () => {
    setLoading(true);

    try {
      // 🔥 1. Get all mentors
      const resData = await fetchAdminDataWithJoin(
        "UsersRoles",
        "Users",
        3000,
        null,
        "Role",
        "==",
        "Mentor"
      );

      const mentorsList = resData?.data || [];

      // 🔥 2. Compute earnings from source of truth
      const enriched = await Promise.all(
        mentorsList.map(async (mentor) => {
          const earningsSnap = await getDocs(
            collection(db, "Users", mentor.id, "Earnings")
          );

          let total = 0;

          earningsSnap.forEach((doc) => {
            const data = doc.data();
            const services = data.services || {};

            Object.values(services).forEach((s) => {
              total += s.amount || 0;
            });
          });

          return {
            id: mentor.id,
            displayName: mentor.displayName,
            email: mentor.email,
            total,
            status: total > 0 ? "active" : "inactive"
          };
        })
      );

      setMentors(enriched);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }

    setLoading(false);
  };

  // 🔍 FILTER + SORT
  const filtered = useMemo(() => {
    let data = [...mentors];

    if (search) {
      data = data.filter(
        (m) =>
          m.displayName?.toLowerCase().includes(search.toLowerCase()) ||
          m.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    data.sort((a, b) =>
      sort === "desc" ? b.total - a.total : a.total - b.total
    );

    return data;
  }, [mentors, search, sort]);

  // 📊 SUMMARY
  const totalAll = filtered.reduce((sum, m) => sum + m.total, 0);
  const activeCount = filtered.filter((m) => m.total > 0).length;

  return (
    <div className="container">
      <h2>Journalists Dashboard</h2>

      {/* SUMMARY */}
      <div className="summary">
        <Card title="Total Earnings" value={`$${totalAll}`} />
        <Card title="Active Journalists" value={activeCount} />
        <Card title="Total Journalists" value={filtered.length} />
      </div>

      {/* CONTROLS */}
      <div className="controls">
        <input
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="desc">High → Low</option>
          <option value="asc">Low → High</option>
        </select>

        <button onClick={loadData}>Refresh</button>
      </div>

      {loading && <p>Loading...</p>}

      {/* GRID */}
      <div className="grid">
        {filtered.map((m) => (
          <div key={m.id} className="card">
            <div>
              <b>{m.displayName}</b>
              <div className="email">{m.email}</div>
            </div>

            <div className="status">
              {m.status === "active" ? "Active" : "Inactive"}
            </div>

            <div className="amount">${m.total}</div>

            <button onClick={() => navigate(`/admin/journalist/${m.id}`)}>
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalistsDashboard;