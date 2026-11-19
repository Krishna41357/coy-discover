import { useRef, useState } from "react";

const SWIPE_THRESHOLD = 90;

export default function ProfileCard({ profile, onSwipe }) {
  const startX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [leaving, setLeaving] = useState("");

  function pointerDown(event) {
    startX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    setOffset(event.clientX - startX.current);
  }

  function pointerUp(event) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (Math.abs(offset) >= SWIPE_THRESHOLD) complete(offset > 0 ? "like" : "pass");
    else setOffset(0);
  }

  function complete(action) {
    setLeaving(action);
    setOffset(action === "like" ? 520 : -520);
    window.setTimeout(() => onSwipe(action), 230);
  }

  const rotation = offset / 18;
  const feedback = offset > 35 ? "LIKE" : offset < -35 ? "PASS" : "";

  return (
    <div className="deck">
      <article
        className={`profile-card ${leaving}`}
        style={{ transform: `translateX(${offset}px) rotate(${rotation}deg)` }}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={() => setOffset(0)}
      >
        <img src={profile.photo} alt={profile.name} draggable="false" />
        {feedback && <div className={`swipe-feedback ${feedback.toLowerCase()}`}>{feedback}</div>}
        <div className="photo-shade" />
        <div className="profile-copy">
          <h2>{profile.name}, <span>{profile.age}</span></h2>
          <p className="location">⌖ {profile.cityOrCollege}</p>
          <p className="bio">{profile.bio}</p>
          <div className="interests">
            {profile.interests.map((interest) => <span key={interest}>{interest}</span>)}
          </div>
        </div>
      </article>

      <div className="swipe-actions">
        <button className="pass-button" aria-label="Pass" onClick={() => complete("pass")}>×</button>
        <button className="like-button" aria-label="Like" onClick={() => complete("like")}>♥</button>
      </div>
      <p className="swipe-hint">Drag left to pass · Drag right to like</p>
    </div>
  );
}
