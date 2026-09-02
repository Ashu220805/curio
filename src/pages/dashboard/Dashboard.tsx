import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.ts";
import { lessons } from "../../data/lessons.ts";
import { useAllLessonProgress } from "../../hooks/useLessonProgress.ts";
import LearningOrbit from "../../components/visuals/LearningOrbit.tsx";
import "./Dashboard.css";

function guestMode() {
  try { return sessionStorage.getItem("curio_guest") === "true"; } catch { return false; }
}

function Dashboard() {
  const navigate = useNavigate();
  const isGuest = guestMode();
  const { progress, loading, reload } = useAllLessonProgress();
  const [userName, setUserName] = useState(isGuest ? "Guest" : "Learner");
  const [userEmail, setUserEmail] = useState(isGuest ? "Guest session" : "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (isGuest) return;
    let active = true;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) { navigate("/login", { replace: true }); return; }
      let profileName = "";
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      if (typeof profile?.full_name === "string") profileName = profile.full_name.trim();
      setUserName(profileName || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Learner");
      setUserEmail(user.email ?? "");
    })();
    return () => { active = false; };
  }, [isGuest, navigate]);

  useEffect(() => {
    const refresh = () => { if (!isGuest) void reload(); };
    globalThis.addEventListener("curio:lesson-progress-updated", refresh);
    globalThis.addEventListener("curio:lesson-completed", refresh);
    const visibility = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      globalThis.removeEventListener("curio:lesson-progress-updated", refresh);
      globalThis.removeEventListener("curio:lesson-completed", refresh);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [isGuest, reload]);

  const progressMap = useMemo(() => {
    const map = new Map<number, number>();
    progress.forEach((item) => {
      const total = Math.max(1, Number(item.totalSections) || 8);
      const done = Math.max(0, Math.min(Number(item.completedSections) || 0, total));
      map.set(item.lessonId, Math.round((done / total) * 100));
    });
    return map;
  }, [progress]);

  const cards = useMemo(() => lessons.map((lesson) => ({
    ...lesson,
    percent: isGuest ? 0 : (progressMap.get(lesson.id) ?? 0),
  })), [isGuest, progressMap]);

  const completedLessons = isGuest ? 0 : cards.filter((item) => item.percent >= 100).length;
  const overall = Math.round(cards.reduce((sum, item) => sum + item.percent, 0) / cards.length);
  const practiceUnlocked = !isGuest && completedLessons === lessons.length;
  const currentLesson = cards.find((item) => item.percent > 0 && item.percent < 100) ?? cards.find((item) => item.percent === 0) ?? cards[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const logout = async () => {
    setLoggingOut(true);
    if (isGuest) {
      sessionStorage.removeItem("curio_guest");
      navigate("/login", { replace: true });
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      setLoggingOut(false);
      return;
    }
    navigate("/login", { replace: true });
  };

  const changePassword = async () => {
    setPasswordMessage("");
    if (newPassword.length < 8) { setPasswordMessage("Use at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setPasswordMessage("Passwords do not match."); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) { setPasswordMessage(error.message); return; }
    setNewPassword(""); setConfirmPassword(""); setPasswordMessage("Password updated successfully.");
  };

  const openLesson = (id: number) => {
    if (isGuest && id !== 1) return;
    navigate(`/learn/lesson/${id}`);
  };

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return cards.filter((lesson) => [lesson.title, lesson.subtitle, lesson.description, ...lesson.skills].join(" ").toLowerCase().includes(query)).slice(0, 6);
  }, [cards, searchQuery]);

  const submitSearch = () => {
    if (searchResults[0]) openLesson(searchResults[0].id);
  };

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <img src="/curio-symbol.png" alt="CURIO" />
          <div><strong>CURIO</strong><span>Learn AI. Use AI. Question AI.</span></div>
        </div>

        <nav className="dashboard-nav" aria-label="Main navigation">
          <Link className="is-active" to="/dashboard"><span>01</span>Home</Link>
          <Link to="/learn"><span>02</span>Learn AI</Link>
          <Link to="/ai-simulation"><span>03</span>AI Simulation</Link>
          <Link to="/reality-check"><span>04</span>AI Literacy</Link>
          <button type="button" className={!practiceUnlocked ? "is-locked" : ""} onClick={() => practiceUnlocked ? navigate("/practice") : navigate("/learn")}><span>05</span>Practice</button>
        </nav>

        <div className="dashboard-side-footer">
          <div className="dashboard-side-progress">
            <span>LEARNING PATH</span>
            <strong>{overall}%</strong>
            <div><i style={{ width: `${overall}%` }} /></div>
            <small>{completedLessons} of {lessons.length} lessons complete</small>
          </div>
          <button type="button" onClick={logout} disabled={loggingOut}>{loggingOut ? "Signing out…" : "Sign out"}</button>
        </div>
      </aside>

      <div className="dashboard-main">
        <div className="dashboard-orbit-background" aria-hidden="true"><LearningOrbit compact decorative /></div>
        <header className="dashboard-header">
          <div className="dashboard-search">
            <span aria-hidden="true">Search</span>
            <input value={searchQuery} onFocus={() => setSearchOpen(true)} onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }} onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); if (e.key === "Escape") setSearchOpen(false); }} placeholder="Search lessons, skills or concepts" aria-label="Search CURIO" />
            {searchOpen && searchQuery.trim() && <div className="dashboard-search-results">{searchResults.length ? searchResults.map((lesson) => <button key={lesson.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { openLesson(lesson.id); setSearchOpen(false); }}><span>Lesson {lesson.id}</span><strong>{lesson.title}</strong><small>{lesson.skills.slice(0, 2).join(" · ")}</small></button>) : <p>No matching lesson or skill.</p>}</div>}
          </div>
          <div className="dashboard-tools">
            <button type="button" className="dashboard-profile-button" onClick={() => setProfileOpen((v) => !v)} aria-expanded={profileOpen}>
              <span className="dashboard-avatar">{userName.slice(0, 1).toUpperCase()}</span>
              <span><strong>{userName}</strong><small>{isGuest ? "Guest" : "Learner"}</small></span>
            </button>
          </div>
          {profileOpen && (
            <div className="dashboard-profile-panel">
              <div><strong>{userName}</strong><span>{userEmail}</span></div>
              {!isGuest && <button type="button" onClick={() => setPasswordOpen((v) => !v)}>Change password</button>}
              {passwordOpen && !isGuest && <div className="dashboard-password">
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" autoComplete="new-password" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" autoComplete="new-password" />
                <button type="button" onClick={changePassword} disabled={changingPassword}>{changingPassword ? "Updating…" : "Update password"}</button>
                {passwordMessage && <small>{passwordMessage}</small>}
              </div>}
              <button type="button" onClick={logout} disabled={loggingOut}>{loggingOut ? "Signing out…" : "Sign out"}</button>
            </div>
          )}
        </header>

        <main className="dashboard-content">
          <section className="dashboard-welcome">
            <div><span className="dashboard-eyebrow">YOUR AI LEARNING WORKSPACE</span><h1>{greeting}, {userName}.</h1><p>{isGuest ? "Explore the first CURIO lesson, then sign in when you are ready to continue." : "Build practical AI judgement through learning, practice, verification, and application."}</p></div>
            <div className="dashboard-overall"><span>COURSE PROGRESS</span><strong>{overall}%</strong><small>{completedLessons}/{lessons.length} complete</small></div>
          </section>

          <section className="dashboard-next-step">
            <div><span className="dashboard-eyebrow">NEXT STEP</span><h2>{currentLesson.title}</h2><p>{currentLesson.subtitle}</p><div className="dashboard-next-meta"><span>{currentLesson.difficulty}</span><span>{currentLesson.estimatedMinutes} min</span><span>{currentLesson.sections.length} sections</span></div></div>
            <button type="button" onClick={() => openLesson(currentLesson.id)}>{currentLesson.percent > 0 ? "Continue lesson" : "Start lesson"}<span>→</span></button>
          </section>

          <section className="dashboard-section">
            <div className="dashboard-section-head"><div><span className="dashboard-eyebrow">CURIO CURRICULUM</span><h2>Continue learning</h2></div><Link to="/learn">View all →</Link></div>
            {loading && !isGuest ? <div className="dashboard-loading">Refreshing progress…</div> : <div className="dashboard-learning-grid">
              {cards.map((lesson) => {
                const locked = isGuest && lesson.id !== 1;
                return <button key={lesson.id} type="button" className={`dashboard-learning-card ${locked ? "is-locked" : ""}`} onClick={() => locked ? navigate("/login") : openLesson(lesson.id)}>
                  <div className="dashboard-card-number">{String(lesson.id).padStart(2, "0")}</div>
                  <div className="dashboard-card-copy"><span>{lesson.difficulty} · {lesson.estimatedMinutes} min</span><h3>{lesson.title}</h3><p>{lesson.description}</p></div>
                  <div className="dashboard-card-progress"><div><i style={{ width: `${lesson.percent}%` }} /></div><span>{locked ? "Locked" : `${lesson.percent}%`}</span></div>
                </button>;
              })}
            </div>}
          </section>

          <section className="dashboard-section dashboard-action-section">
            <div className="dashboard-section-head"><div><span className="dashboard-eyebrow">PRACTICE & APPLICATION</span><h2>Choose what to do next</h2></div></div>
            <div className="dashboard-actions">
              <Link to="/learn"><strong>Learn AI</strong><span>Build the next concept</span><b>→</b></Link>
              <button type="button" onClick={() => practiceUnlocked ? navigate("/practice") : navigate("/learn")}><strong>Practice</strong><span>{practiceUnlocked ? "Test what you know" : `Complete all lessons · ${completedLessons}/${lessons.length}`}</span><b>→</b></button>
              <Link to="/reality-check"><strong>AI Literacy</strong><span>Verify, question, and think critically</span><b>→</b></Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
