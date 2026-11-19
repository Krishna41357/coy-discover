import { useCallback, useEffect, useState } from "react";
import ProfileCard from "./ProfileCard.jsx";

const api = {
  feed: () => fetch("/feed").then(check),
  matches: () => fetch("/matches").then(check),
  swipe: (profileId, action) =>
    fetch("/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, action })
    }).then(check)
};

async function check(response) {
  if (!response.ok) throw new Error((await response.json()).error || "Request failed");
  return response.json();
}

export default function App() {
  const [tab, setTab] = useState("discover");
  const [view, setView] = useState("feed");
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [feedData, matchData] = await Promise.all([api.feed(), api.matches()]);
      setProfiles(feedData.profiles);
      setMatches(matchData.matches);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSwipe(action) {
    const current = profiles[0];
    if (!current) return;

    setProfiles((items) => items.slice(1));
    try {
      const result = await api.swipe(current.id, action);
      if (result.match) {
        setMatch(result.profile);
        setMatches((items) => [...items, result.profile]);
      }
    } catch (err) {
      setProfiles((items) => [current, ...items]);
      setError(err.message);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">c</div>
        <div>
          <p className="eyebrow">COY</p>
          <h1>{tab === "home" ? "Home" : "Discover"}</h1>
        </div>
        {tab === "discover" && (
          <button className="matches-link" onClick={() => setView(view === "feed" ? "matches" : "feed")}>
            {view === "feed" ? `Matches (${matches.length})` : "Discover"}
          </button>
        )}
      </header>

      <section className="content">
        {tab === "home" && <div className="home-placeholder" aria-label="Home tab" />}

        {tab === "discover" && view === "feed" && (
          <>
            {loading && <Status title="Finding people nearby..." />}
            {error && <Status title="Something went wrong" detail={error} action={load} />}
            {!loading && !error && profiles.length > 0 && (
              <ProfileCard key={profiles[0].id} profile={profiles[0]} onSwipe={handleSwipe} />
            )}
            {!loading && !error && profiles.length === 0 && (
              <Status title="You’re all caught up" detail="There are no new profiles to discover right now." />
            )}
          </>
        )}

        {tab === "discover" && view === "matches" && (
          <div className="matches-view">
            <h2>Your matches</h2>
            <p>Only people who liked you back appear here.</p>
            {matches.length === 0 ? (
              <Status title="No matches yet" detail="Keep discovering. A mutual like will appear here." />
            ) : (
              <div className="match-list">
                {matches.map((person) => (
                  <article className="match-row" key={person.id}>
                    <img src={person.photo} alt={person.name} />
                    <div><strong>{person.name}, {person.age}</strong><span>{person.cityOrCollege}</span></div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <nav className="tabbar" aria-label="Main navigation">
        <button className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}>
          <span>⌂</span>Home
        </button>
        <button className={tab === "discover" ? "active" : ""} onClick={() => setTab("discover")}>
          <span>♡</span>Discover
        </button>
      </nav>

      {match && (
        <div className="match-overlay" role="dialog" aria-modal="true" aria-label="New match">
          <div className="match-modal">
            <div className="match-hearts">♥ ♥</div>
            <h2>It’s a match!</h2>
            <p>You and {match.name} liked each other.</p>
            <img src={match.photo} alt={match.name} />
            <button onClick={() => setMatch(null)}>Keep discovering</button>
            <button className="secondary" onClick={() => { setMatch(null); setView("matches"); }}>View matches</button>
          </div>
        </div>
      )}
    </main>
  );
}

function Status({ title, detail, action }) {
  return (
    <div className="status-card">
      <div className="status-icon">♡</div>
      <h2>{title}</h2>
      {detail && <p>{detail}</p>}
      {action && <button onClick={action}>Try again</button>}
    </div>
  );
}
