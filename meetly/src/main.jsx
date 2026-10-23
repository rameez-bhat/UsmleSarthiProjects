import React, { useEffect, useState, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  CalendarDays,
  LayoutGrid,
  Clock,
  Users,
  Link2,
  ChevronRight,
  Settings,
  X,
  LogOut,
  Menu,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { live, auth, api } from "./firebase";
import { loadDemo, saveDemo, demoSlots } from "./demo";
import "./styles.css";
import { pagePaths, pageFromPath } from "./routes";
import { createUUID, wallTimeToMillis } from "./shared/utils";
import { MyMeetings } from "./components/MyMeetings";
import { RequestActivity } from "./components/RequestActivity";
import { Toast } from "./components/Toast";
import { AuthPanel } from "./components/AuthPanel";
import { ProfileForm } from "./components/ProfileForm";
const ManageBookingPage = loadPage(
  () => import("./pages/ManageBookingPage"),
  "ManageBookingPage",
);
const MeetlyRoom = loadPage(() => import("./pages/MeetlyRoom"), "MeetlyRoom");
const PublicRegistration = loadPage(
  () => import("./pages/PublicRegistration"),
  "PublicRegistration",
);
const BookingPage = loadPage(
  () => import("./pages/BookingPage"),
  "BookingPage",
);
const Modal = loadPage(() => import("./components/Modal"), "Modal");
const MyMeetingsPage = loadPage(
  () => import("./pages/MyMeetingsPage"),
  "MyMeetingsPage",
);
const EventTypesPage = loadPage(
  () => import("./pages/EventTypesPage"),
  "EventTypesPage",
);
const BookingsPage = loadPage(
  () => import("./pages/BookingsPage"),
  "BookingsPage",
);
const AdministrationPage = loadPage(
  () => import("./pages/AdministrationPage"),
  "AdministrationPage",
);
const AvailabilityPage = loadPage(
  () => import("./pages/AvailabilityPage"),
  "AvailabilityPage",
);
const IntegrationsPage = loadPage(
  () => import("./pages/IntegrationsPage"),
  "IntegrationsPage",
);
const HostsPage = loadPage(() => import("./pages/HostsPage"), "HostsPage");
const SettingsPage = loadPage(
  () => import("./pages/SettingsPage"),
  "SettingsPage",
);
function loadPage(loader, name) {
  const Component = lazy(() =>
    loader().then((module) => ({
      default: module[name],
    })),
  );
  return function LoadedPage(props) {
    return (
      <Suspense
        fallback={
          <div className="auth-card" role="status">
            Loading page…
          </div>
        }
      >
        <Component {...props} />
      </Suspense>
    );
  };
}
export function App() {
  return (
    <>
      <RequestActivity />
      {location.pathname.startsWith("/registration/") ? (
        <PublicRegistration />
      ) : (
        <WorkspaceApp />
      )}
    </>
  );
}
function WorkspaceApp() {
  const [authReady, setAuthReady] = useState(!live);
  const [demo, setDemo] = useState(loadDemo),
    [user, setUser] = useState(null),
    [profile, setProfile] = useState(live ? null : demo.profile),
    [events, setEvents] = useState(live ? [] : demo.events),
    [bookings, setBookings] = useState(live ? [] : demo.bookings),
    [connections, setConnections] = useState([]),
    [page, setPage] = useState(() => pageFromPath(location.pathname)),
    [modal, setModal] = useState(null),
    [notice, setNotice] = useState(""),
    [loading, setLoading] = useState(false),
    [mobile, setMobile] = useState(false);
  const [access, setAccess] = useState(null),
    [accessError, setAccessError] = useState(""),
    [refresh, setRefresh] = useState(0),
    [workspaceReady, setWorkspaceReady] = useState(!live);
  const [bookingPage, setBookingPage] = useState(null),
    [manage, setManage] = useState(null),
    [routeVersion, setRouteVersion] = useState(0);
  useEffect(() => {
    if (!mobile) return;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMobile(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobile]);
  const notify = (m) => {
    setNotice(m);
    setTimeout(() => setNotice(""), 7000);
  };
  useEffect(() => {
    if (live)
      return onAuthStateChanged(
        auth,
        (current) => {
          setModal(null);
          setMobile(false);
          setNotice("");
          setProfile(null);
          setEvents([]);
          setBookings([]);
          setConnections([]);
          setAccess(null);
          setWorkspaceReady(false);
          setUser(current);
          setAuthReady(true);
        },
        () => {
          setUser(null);
          setAuthReady(true);
          notify("Unable to check your session. Please sign in again.");
        },
      );
  }, []);
  const isWorkspaceRoute = ![
    "/book/",
    "/manage/",
    "/room/",
    "/registration/",
  ].some((prefix) => location.pathname.startsWith(prefix));
  useEffect(() => {
    if (!live) return;
    let active = true;
    setAccessError("");
    if (
      !user ||
      location.pathname.startsWith("/book/") ||
      location.pathname.startsWith("/manage/") ||
      location.pathname.startsWith("/room/")
    )
      return;
    const load = async () => {
      try {
        const permission = access || (await api("Access", {}));
        if (!active) return;
        setAccess(permission);
        if (!permission.canHost) {
          setProfile(null);
          setEvents([]);
          setBookings([]);
          setConnections([]);
          return;
        }
        const data = await api("Workspace", {});
        if (!active) return;
        setProfile(data.profile);
        setEvents(data.events);
        setBookings(data.bookings);
        setConnections(data.connections);
        setWorkspaceReady(true);
      } catch (e) {
        if (active) {
          setAccessError(e.message);
          setAccess(null);
          setProfile(null);
          setEvents([]);
          setBookings([]);
          setConnections([]);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [user, refresh, isWorkspaceRoute]);
  useEffect(() => {
    if (!live) {
      saveDemo(demo);
      setProfile(demo.profile);
      setEvents(demo.events);
      setBookings(demo.bookings);
    }
  }, [demo]);
  useEffect(() => {
    const pop = () => {
      setPage(pageFromPath(location.pathname));
      setMobile(false);
      setRouteVersion((v) => v + 1);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  const navigate = (path) => {
    if (location.pathname + location.search !== path)
      history.pushState({}, "", path);
    setPage(pageFromPath(path.split("?")[0]));
    setMobile(false);
    setRouteVersion((v) => v + 1);
  };
  const goPage = (label) => navigate(pagePaths[label] || "/");
  const followPage = (e, label) => {
    if (
      e.button === 0 &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey
    ) {
      e.preventDefault();
      goPage(label);
    }
  };
  useEffect(() => {
    let active = true;
    const paths = location.pathname.split("/").filter(Boolean);
    if (paths[0] === "book" && paths[1]) {
      setManage(null);
      setLoading(true);
      const load = live
        ? api("PublicPage", {
            slug: paths[1],
          })
        : Promise.resolve({
            host: demo.profile,
            events: demo.events.filter((e) => e.active),
          });
      load
        .then((data) => {
          if (active)
            setBookingPage({
              ...data,
              eventId: paths[2] || null,
            });
        })
        .catch((e) => notify(e.message))
        .finally(() => active && setLoading(false));
    } else if (paths[0] === "manage" && paths[1]) {
      setBookingPage(null);
      const token = new URLSearchParams(location.search).get("token");
      setLoading(true);
      (live
        ? api("GetBooking", {
            id: paths[1],
            token,
          })
        : Promise.resolve(
            demo.bookings.find((b) => b.id === paths[1] && b.token === token),
          )
      )
        .then((b) => {
          if (!b) throw Error("Booking not found.");
          if (active)
            setManage({
              ...b,
              token,
            });
        })
        .catch((e) => notify(e.message))
        .finally(() => active && setLoading(false));
    } else {
      setBookingPage(null);
      setManage(null);
    }
    return () => {
      active = false;
    };
  }, [routeVersion]);
  useEffect(() => {
    const result = new URLSearchParams(location.search).get("calendar");
    if (result)
      notify(
        result === "connected"
          ? "Calendar connected successfully."
          : "Calendar connection failed or was cancelled. Please try again.",
      );
  }, []);
  const act = async (fn) => {
    setLoading(true);
    try {
      await fn();
      if (live) setRefresh((v) => v + 1);
    } catch (e) {
      notify(e.message);
    } finally {
      setLoading(false);
    }
  };
  const deleteEvent = (event) =>
    setModal({
      type: "confirm",
      title: `Delete ${event.title}?`,
      body: "This removes the booking link. Upcoming bookings must be cancelled first. Past booking history is retained.",
      confirmLabel: "Delete event",
      cancelLabel: "Keep event",
      action: () =>
        act(async () => {
          if (live) await api("DeleteEvent", { id: event.id });
          else
            setDemo((old) => ({
              ...old,
              events: old.events.filter((e) => e.id !== event.id),
            }));
          setModal(null);
          notify("Event deleted.");
        }),
    });
  const eventLink = (e) => `${location.origin}/book/${profile?.slug}/${e.id}`;
  const copy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      notify("Link copied to clipboard.");
    } catch {
      setModal({
        type: "link",
        value,
      });
    }
  };
  const saveEvent = async (input) => {
    const e = {
      ...input,
    };
    if (!live && e.schedulingMode === "fixed") {
      if (!e.meetingDate || !e.meetingTime) {
        notify("Choose a meeting date and time.");
        return;
      }
      e.fixedStartAt = wallTimeToMillis(
        e.meetingDate,
        e.meetingTime,
        profile.timezone,
      );
      e.meetingTimezone = profile.timezone;
    }
    return saveEventValue(e);
  };
  const saveEventValue = async (e) =>
    act(async () => {
      if (live) await api("SaveEvent", e);
      else
        setDemo((d) => ({
          ...d,
          events: d.events.some((x) => x.id === e.id)
            ? d.events.map((x) => (x.id === e.id ? e : x))
            : [
                ...d.events,
                {
                  ...e,
                  id: createUUID(),
                },
              ],
        }));
      setModal(null);
      notify(
        e.participantUids?.length
          ? "Meeting saved. Calendar sync queued; check Bookings for status."
          : "Booking link saved. A calendar appointment is created when someone books.",
      );
    });
  const viewAttendee = async (booking) => {
    const requesterUid = user?.uid;
    setLoading(true);
    try {
      const details = live
        ? await api("AttendeeDetails", {
            id: booking.id,
          })
        : {
            booking: {
              ...booking,
              answers: (booking.answers || []).map((answer, index) => ({
                question:
                  booking.questionLabels?.[index] || `Question ${index + 1}`,
                answer,
              })),
            },
            profile: null,
            account: null,
            profileState: "not-linked",
          };
      if (live && auth.currentUser?.uid !== requesterUid) return;
      setModal({
        type: "attendee",
        details: {
          ...details,
          booking: {
            ...details.booking,
            id: booking.id,
          },
        },
      });
    } catch (error) {
      if (!live || auth.currentUser?.uid === requesterUid)
        notify(error.message);
    } finally {
      setLoading(false);
    }
  };
  const cancelBooking = (b) =>
    setModal({
      type: "confirm",
      title: "Cancel this meeting?",
      body: `${b.eventTitle} with ${b.attendeeName}. Both participants will be notified when email delivery is configured.`,
      action: () =>
        act(async () => {
          if (live)
            await api("Cancel", {
              id: b.id,
              token: b.token,
            });
          else
            setDemo((d) => ({
              ...d,
              bookings: d.bookings.map((x) =>
                x.id === b.id
                  ? {
                      ...x,
                      status: "cancelled",
                    }
                  : x,
              ),
            }));
          setManage((m) =>
            m?.id === b.id
              ? {
                  ...m,
                  status: "cancelled",
                }
              : m,
          );
          setModal(null);
          notify("Booking cancelled.");
        }),
    });
  const downloadICS = (b) => {
    const stamp = (v) =>
      new Date(v)
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    const escape = (v) =>
      String(v || "")
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/[,;]/g, "\\$&");
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Meetly//Scheduling//EN",
      "BEGIN:VEVENT",
      `UID:${b.id}@meetly`,
      `DTSTAMP:${stamp(Date.now())}`,
      `DTSTART:${stamp(b.startAt)}`,
      `DTEND:${stamp(b.endAt)}`,
      `SUMMARY:${escape(b.eventTitle)}`,
      `LOCATION:${escape(b.meetingUrl || b.locationValue)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const u = URL.createObjectURL(
        new Blob([body], {
          type: "text/calendar;charset=utf-8",
        }),
      ),
      a = document.createElement("a");
    a.href = u;
    a.download = "meeting.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  };
  const doBooking = async (data, event, old) => {
    if (live) {
      const result = await api(old ? "Reschedule" : "Book", {
        ...data,
        ...(old
          ? {
              id: old.id,
              token: old.token,
            }
          : {
              eventId: event.id,
            }),
      });
      navigate(`/manage/${result.id}?token=${result.token}`);
      return;
    }
    if (event.audience === "registered")
      throw new Error(
        "Registered-user verification requires your connected Firebase project.",
      );
    const id = old?.id || createUUID(),
      token = old?.token || createUUID();
    const b = {
      ...old,
      id,
      token,
      eventId: event.id,
      eventTitle: event.title,
      ownerId: "demo",
      hostName: profile.name,
      timezone: profile.timezone,
      attendeeTimezone: data.timezone,
      attendeeName: old?.attendeeName || data.name,
      attendeeEmail: old?.attendeeEmail || data.email,
      notes: data.notes,
      answers: data.answers,
      questionLabels: event.questions.map((question) => question.label),
      startAt: data.startAt,
      endAt: data.startAt + event.duration * 60000,
      lockStart: data.startAt - event.bufferBefore * 60000,
      lockEnd: data.startAt + (event.duration + event.bufferAfter) * 60000,
      status: "confirmed",
      syncStatus: "demo",
      location: event.location,
      locationValue: event.locationValue,
      meetingUrl: event.locationValue,
    };
    if (
      demo.bookings.some(
        (x) =>
          x.id !== id &&
          x.status === "confirmed" &&
          b.lockStart < x.lockEnd &&
          b.lockEnd > x.lockStart,
      )
    )
      throw Error("This time was just booked. Choose another.");
    setDemo((d) => ({
      ...d,
      bookings: old
        ? d.bookings.map((x) => (x.id === id ? b : x))
        : [...d.bookings, b],
    }));
    setManage(b);
    navigate(`/manage/${id}?token=${token}`);
  };
  const getSlots = async (date, event, host, old) => {
    if (live) {
      const result = await api("Slots", {
        ...(date.startsWith("month:") ? { month: date.slice(6) } : { date }),
        eventId: event.id,
      });
      return event.schedulingMode === "host-slots" || date.startsWith("month:")
        ? result
        : result.slots;
    }
    const booked = demo.bookings.filter((b) => b.id !== old?.id);
    if (date.startsWith("month:")) {
      const month = date.slice(6);
      const start = new Date(`${month}-01T12:00:00Z`);
      const count = new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0),
      ).getUTCDate();
      return {
        slots: Array.from({ length: count }, (_, i) =>
          demoSlots(
            `${month}-${String(i + 1).padStart(2, "0")}`,
            event,
            host,
            booked,
          ),
        )
          .flat()
          .map((slot) => ({
            ...slot,
            hostUid: host.id || "demo",
            hostName: host.name,
          })),
        hosts: [{ uid: host.id || "demo", name: host.name, organizer: true }],
      };
    }
    return demoSlots(date, event, host, booked);
  };
  const header = (
    <a
      className="brand"
      href="/"
      onClick={(e) => {
        e.preventDefault();
        navigate("/");
      }}
    >
      <span className="brand-mark">
        <CalendarDays size={23} />
      </span>
      meetly<span className="brand-dot">.</span>
    </a>
  );
  if (
    !live &&
    import.meta.env.MODE !== "test" &&
    import.meta.env.VITE_DEMO_MODE !== "true"
  ) {
    return (
      <div className="auth-screen">
        <header className="auth-screen-brand">{header}</header>
        <main className="auth-screen-main">
          <div className="auth-card" role="alert">
            <h1>Sign-in temporarily unavailable</h1>
            <p>
              The site's Firebase configuration could not be loaded. Please
              contact the site administrator.
            </p>
            <button className="primary" onClick={() => location.reload()}>
              Try again
            </button>
          </div>
        </main>
      </div>
    );
  }
  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && b.startAt >= Date.now(),
  );
  if (
    bookingPage ||
    manage ||
    location.pathname.startsWith("/book/") ||
    location.pathname.startsWith("/manage/")
  )
    return (
      <>
        <div className="public-top">
          {header}
          <span>
            {live
              ? "Simple scheduling. Meetly."
              : "Interactive demo · bookings stay in this browser"}
          </span>
        </div>
        {notice && <Toast text={notice} close={() => setNotice("")} />}
        {loading && !bookingPage && !manage ? (
          <div className="empty">Loading your meeting…</div>
        ) : bookingPage ? (
          <BookingPage
            data={bookingPage}
            getSlots={getSlots}
            book={doBooking}
            notify={notify}
            authUser={user}
          />
        ) : manage ? (
          <ManageBookingPage
            act={act}
            cancelBooking={cancelBooking}
            demo={demo}
            downloadICS={downloadICS}
            loading={loading}
            manage={manage}
            navigate={navigate}
            setBookingPage={setBookingPage}
            setManage={setManage}
          />
        ) : (
          <div className="empty">
            <AlertCircle />
            This booking page could not be loaded.
            <button onClick={() => navigate("/")}>Return home</button>
          </div>
        )}
        {modal && (
          <Modal modal={modal} close={() => setModal(null)} loading={loading} />
        )}
        <footer className="public-footer">
          Made for the moments that matter. <strong>meetly.</strong>
        </footer>
      </>
    );
  if (live && (!authReady || !user))
    return (
      <div className="auth-screen">
        <header className="auth-screen-brand">{header}</header>
        <main className="auth-screen-main">
          {!authReady ? (
            <div className="auth-card" role="status">
              Checking your sign-in…
            </div>
          ) : (
            <AuthPanel notify={notify} />
          )}
        </main>
        {notice && <Toast text={notice} close={() => setNotice("")} />}
      </div>
    );
  if (location.pathname.startsWith("/room/"))
    return (
      <div className="room-shell">
        <header className="public-top">
          {header}
          <a className="secondary" href="/my-meetings">
            Back to dashboard
          </a>
        </header>
        <MeetlyRoom key={user?.uid} id={location.pathname.split("/")[2]} />
      </div>
    );
  if (live && access && !access.canHost)
    return (
      <div className="auth-screen">
        <header className="auth-screen-brand">
          {header}
          <button className="secondary" onClick={() => signOut(auth)}>
            Sign out
          </button>
        </header>
        <main className="content">
          <MyMeetings key={user.uid} uid={user.uid} />
        </main>
      </div>
    );
  return (
    <div className="app-shell">
      {mobile && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Dismiss navigation"
          onClick={() => setMobile(false)}
          tabIndex={-1}
        />
      )}
      <aside
        id="workspace-navigation"
        className={mobile ? "sidebar open" : "sidebar"}
      >
        {header}
        <button
          type="button"
          className="sidebar-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        >
          <X size={20} />
        </button>
        <div className="workspace">
          <div className="avatar">
            {(profile?.name || "My workspace")
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <strong>{profile?.name || "Your workspace"}</strong>
            <span>
              {live
                ? access?.role || "Scheduling workspace"
                : "Personal workspace"}
            </span>
          </div>
        </div>
        <span className="nav-caption">WORKSPACE</span>
        <nav>
          {[
            ["My meetings", CalendarDays],
            ["Event types", LayoutGrid],
            ["Bookings", CalendarDays],
            ["Availability", Clock],
            ["Hosts & sharing", Users],
            ["Integrations", Link2],
            ...(access?.isAdmin ? [["Administration", Users]] : []),
          ].map(([label, Icon]) => (
            <a
              key={label}
              className={page === label ? "nav-item active" : "nav-item"}
              href={pagePaths[label]}
              aria-current={page === label ? "page" : undefined}
              onClick={(e) => followPage(e, label)}
            >
              <Icon size={19} />
              {label}
              {label === "Bookings" && upcoming.length > 0 && (
                <span className="nav-count">{upcoming.length}</span>
              )}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="little-star">✳</span>
            <strong>A calmer kind of calendar.</strong>
            <p>
              Less back-and-forth.
              <br />
              More time for good things.
            </p>
          </div>
          <a
            href="/settings"
            className={page === "Settings" ? "nav-item active" : "nav-item"}
            onClick={(e) => followPage(e, "Settings")}
          >
            <Settings size={18} />
            Settings
          </a>
          {live && user && (
            <button className="nav-item" onClick={() => signOut(auth)}>
              <LogOut size={18} />
              Sign out
            </button>
          )}
          <div className="version">
            <span className="status-dot" />
            {live ? "Firebase connected" : "Demo workspace"}
            <span>v1.11.3</span>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            aria-label="Open navigation"
            aria-controls="workspace-navigation"
            aria-expanded={mobile}
            onClick={() => setMobile(!mobile)}
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} />
            <strong>{page}</strong>
          </div>
          <div className="top-actions">
            {live && (
              <button
                type="button"
                className="icon-button"
                aria-label="Refresh dashboard"
                onClick={() => setRefresh((v) => v + 1)}
              >
                <RefreshCw size={18} />
              </button>
            )}
            {!live ? (
              <button
                className="demo-pill"
                onClick={() =>
                  setModal({
                    type: "setup",
                  })
                }
              >
                <span />
                Demo · Connect Firebase
              </button>
            ) : (
              <span className="connected-pill">
                <span />
                Firebase
              </span>
            )}
            <button
              className="avatar small"
              aria-label="Profile settings"
              onClick={() => goPage("Settings")}
            >
              {(profile?.name || "MY")
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")}
            </button>
          </div>
        </header>
        <div className="content">
          {live && !user ? (
            <AuthPanel notify={notify} />
          ) : live && !access ? (
            <div className="auth-card">
              <h1>
                {accessError
                  ? "Access could not be verified"
                  : "Checking your access…"}
              </h1>
              <p>
                {accessError || "Loading your existing account permissions."}
              </p>
              {accessError && (
                <button
                  className="primary"
                  onClick={() => setRefresh((v) => v + 1)}
                >
                  Retry
                </button>
              )}
            </div>
          ) : live && !access.canHost ? (
            <div className="auth-card">
              <h1>Host access required</h1>
              <p>
                Your existing account does not have a scheduling host role.
                Contact an administrator. Signing up does not grant host
                permissions.
              </p>
            </div>
          ) : live && !workspaceReady ? (
            <div className="empty" role="status">
              Loading your workspace…
            </div>
          ) : live && !profile ? (
            <ProfileForm
              profile={{
                name: user?.displayName || "",
                slug: "",
                timezone: "Asia/Kolkata",
                bio: "",
              }}
              save={(v) =>
                act(async () => {
                  await api("SaveProfile", v);
                  notify("Your workspace is ready.");
                })
              }
              onboarding
              user={user}
              notify={notify}
            />
          ) : (
            <>
              {page === "My meetings" && <MyMeetingsPage user={user} />}
              {page === "Not found" && (
                <div className="empty">
                  <h1>Page not found</h1>
                  <button
                    className="primary"
                    onClick={() => goPage("Event types")}
                  >
                    Go to event types
                  </button>
                </div>
              )}
              {page === "Administration" && !access?.isAdmin && (
                <div className="empty">Administrator access is required.</div>
              )}
              {page === "Event types" && (
                <EventTypesPage
                  deleteEvent={deleteEvent}
                  connections={connections}
                  copy={copy}
                  eventLink={eventLink}
                  events={events}
                  goPage={goPage}
                  navigate={navigate}
                  profile={profile}
                  saveEvent={saveEvent}
                  setModal={setModal}
                  upcoming={upcoming}
                />
              )}
              {page === "Bookings" && (
                <BookingsPage
                  act={act}
                  bookings={bookings}
                  cancelBooking={cancelBooking}
                  downloadICS={downloadICS}
                  notify={notify}
                  profile={profile}
                  viewAttendee={viewAttendee}
                />
              )}
              {page === "Administration" && access?.isAdmin && (
                <AdministrationPage
                  notify={notify}
                  viewAttendee={viewAttendee}
                />
              )}
              {page === "Availability" && (
                <AvailabilityPage
                  act={act}
                  notify={notify}
                  profile={profile}
                  setDemo={setDemo}
                />
              )}
              {page === "Integrations" && (
                <IntegrationsPage
                  act={act}
                  connections={connections}
                  notify={notify}
                />
              )}
              {page === "Hosts & sharing" && (
                <HostsPage copy={copy} profile={profile} />
              )}
              {page === "Settings" && (
                <SettingsPage
                  act={act}
                  notify={notify}
                  profile={profile}
                  setDemo={setDemo}
                  setModal={setModal}
                  user={user}
                />
              )}
            </>
          )}
        </div>
        <footer className="app-footer">
          <span>A little less scheduling. A little more living.</span>
          <span>
            Built around your time <span className="footer-flower">✳</span>
          </span>
        </footer>
      </main>
      {notice && <Toast text={notice} close={() => setNotice("")} />}
      {loading && <div className="loading-line" />}
      {modal && (
        <Modal
          modal={modal}
          close={() => setModal(null)}
          saveEvent={saveEvent}
          hostTimezone={profile?.timezone}
          organizer={{
            uid: user?.uid || "demo",
            name: profile?.name || "Organizer",
            email: user?.email,
          }}
          loading={loading}
        />
      )}
    </div>
  );
}
if (document.getElementById("root"))
  createRoot(document.getElementById("root")).render(<App />);
export { RequestActivity };
