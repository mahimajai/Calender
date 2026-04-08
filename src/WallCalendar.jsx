import { useState, useRef, useEffect } from "react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Unsplash monthly vibes - deterministic so it doesn't flicker
const MONTH_IMAGES = [
  "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=800&q=75", // Jan - mountain
  "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800&q=75", // Feb - snowy
  "https://images.unsplash.com/photo-1552083375-1447ce886485?w=800&q=75", // Mar - bloom
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&q=75", // Apr - flowers
  "https://images.unsplash.com/photo-1490682143684-14369e18dce8?w=800&q=75", // May - green
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=75", // Jun - beach
  "https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=800&q=75", // Jul - summer
  "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=75", // Aug - sunset
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=75", // Sep - autumn
  "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=800&q=75", // Oct - fall
  "https://images.unsplash.com/photo-1477414956360-3a04a48f62df?w=800&q=75", // Nov - fog
  "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=800&q=75", // Dec - snow
];

const INDIAN_HOLIDAYS = {
  "1-26": "Republic Day",
  "8-15": "Independence Day",
  "10-2": "Gandhi Jayanti",
  "12-25": "Christmas",
  "11-1": "Diwali (approx)",
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function isInRange(day, start, end) {
  if (!start || !end) return false;
  const [s, e] = start <= end ? [start, end] : [end, start];
  return day > s && day < e;
}

function formatDate(d) {
  if (!d) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

export default function WallCalendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [pickingEnd, setPickingEnd] = useState(false);
  const [notes, setNotes] = useState({});  // key: "YYYY-M-D" or "month-YYYY-M"
  const [noteMode, setNoteMode] = useState("range"); // "range" | "month"
  const [noteText, setNoteText] = useState("");
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState("next");
  const imgRef = useRef(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const noteKey = noteMode === "month"
    ? `month-${currentYear}-${currentMonth}`
    : rangeStart ? `${currentYear}-${currentMonth}-${rangeStart.getDate()}` : null;

  useEffect(() => {
    if (noteKey && notes[noteKey] !== undefined) {
      setNoteText(notes[noteKey]);
    } else {
      setNoteText("");
    }
  }, [noteKey, currentMonth, currentYear]);

  function navigate(dir) {
    setFlipDir(dir);
    setFlipping(true);
    setTimeout(() => {
      if (dir === "next") {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
        else setCurrentMonth(m => m + 1);
      } else {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
      }
      setRangeStart(null);
      setRangeEnd(null);
      setPickingEnd(false);
      setFlipping(false);
    }, 320);
  }

  function handleDayClick(dayNum) {
    const clicked = new Date(currentYear, currentMonth, dayNum);
    if (!pickingEnd || !rangeStart) {
      setRangeStart(clicked);
      setRangeEnd(null);
      setPickingEnd(true);
    } else {
      if (clicked < rangeStart) {
        setRangeEnd(rangeStart);
        setRangeStart(clicked);
      } else {
        setRangeEnd(clicked);
      }
      setPickingEnd(false);
    }
  }

  function handleNoteBlur() {
    if (!noteKey) return;
    setNotes(prev => ({ ...prev, [noteKey]: noteText }));
  }

  function clearSelection() {
    setRangeStart(null);
    setRangeEnd(null);
    setPickingEnd(false);
  }

  const effectiveEnd = pickingEnd && hoverDate ? hoverDate : rangeEnd;

  // Build calendar grid cells
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const imgSrc = MONTH_IMAGES[currentMonth];

  return (
    <div className="cal-root">
      <style>{`
        .cal-root {
          --blue: #1E88E5;
          --blue-light: #E3F2FD;
          --blue-mid: #BBDEFB;
          --blue-dark: #1565C0;
          --text: #1a1a2e;
          --text-muted: #6b7280;
          --bg: #ffffff;
          --bg-secondary: #f8faff;
          --border: #e5e7eb;
          --range-bg: #DBEAFE;
          --range-text: #1D4ED8;
          --holiday: #ef4444;
          --shadow: 0 8px 32px rgba(30,136,229,0.10), 0 2px 8px rgba(0,0,0,0.06);
          font-family: 'Georgia', serif;
          min-height: 100vh;
          background: #dde6f0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .cal-paper {
          background: var(--bg);
          border-radius: 4px;
          box-shadow: var(--shadow);
          width: 100%;
          max-width: 900px;
          overflow: hidden;
          position: relative;
        }

        /* Spiral holes at top */
        .cal-spiral {
          background: #e2e8f0;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          padding: 0 20px;
          position: relative;
          z-index: 2;
        }
        .cal-spiral::before {
          content: '';
          position: absolute;
          left: 0; right: 0; top: 50%;
          height: 2px;
          background: #c8d2dc;
        }
        .hole {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #b8c4ce;
          border: 2px solid #9eacb8;
          position: relative;
          z-index: 1;
        }

        /* Main layout - desktop: image left, content right */
        .cal-body {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          min-height: 480px;
        }

        @media (max-width: 680px) {
          .cal-body {
            grid-template-columns: 1fr;
          }
        }

        /* Image panel */
        .cal-image-panel {
          position: relative;
          overflow: hidden;
          min-height: 300px;
        }
        .cal-image-panel img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: opacity 0.4s ease;
        }
        .cal-image-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 1.5rem 1.25rem 1.25rem;
          background: linear-gradient(to top, rgba(21,101,192,0.82) 0%, transparent 100%);
          color: white;
        }
        .cal-month-label {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          line-height: 1;
          font-family: 'Georgia', serif;
          text-transform: uppercase;
        }
        .cal-year-label {
          font-size: 1rem;
          opacity: 0.85;
          font-family: 'Georgia', serif;
          letter-spacing: 0.12em;
        }

        /* Nav arrows */
        .cal-nav {
          position: absolute;
          top: 10px;
          display: flex;
          gap: 8px;
          right: 10px;
          z-index: 10;
        }
        .nav-btn {
          background: rgba(255,255,255,0.88);
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--blue-dark);
          transition: background 0.15s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.12);
        }
        .nav-btn:hover { background: white; }

        /* Calendar grid panel */
        .cal-grid-panel {
          display: flex;
          flex-direction: column;
          border-left: 1px solid var(--border);
        }

        @media (max-width: 680px) {
          .cal-grid-panel {
            border-left: none;
            border-top: 1px solid var(--border);
          }
        }

        /* Weekday header */
        .cal-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          padding: 0 12px;
        }
        .wd-cell {
          text-align: center;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          padding: 8px 0 6px;
          font-family: 'Helvetica Neue', sans-serif;
          text-transform: uppercase;
        }
        .wd-cell.sun, .wd-cell.sat { color: var(--blue); }

        /* Day grid */
        .cal-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          padding: 10px 12px 4px;
          flex: 1;
          gap: 1px;
        }

        .day-cell {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          border-radius: 50%;
          cursor: pointer;
          position: relative;
          font-family: 'Helvetica Neue', sans-serif;
          color: var(--text);
          transition: background 0.12s, color 0.12s, transform 0.1s;
          user-select: none;
        }
        .day-cell:hover:not(.empty) {
          background: var(--blue-mid);
          color: var(--blue-dark);
          transform: scale(1.08);
        }
        .day-cell.empty { cursor: default; }
        .day-cell.today {
          font-weight: 700;
          border: 1.5px solid var(--blue);
          color: var(--blue-dark);
        }
        .day-cell.start, .day-cell.end {
          background: var(--blue) !important;
          color: white !important;
          font-weight: 700;
          border-radius: 50%;
        }
        .day-cell.in-range {
          background: var(--range-bg);
          color: var(--range-text);
          border-radius: 0;
        }
        .day-cell.in-range:first-child { border-radius: 50% 0 0 50%; }
        .day-cell.holiday::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%; transform: translateX(-50%);
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--holiday);
        }
        .day-cell.sun-col { color: var(--holiday); }
        .day-cell.sat-col { color: var(--blue); }
        .day-cell.muted { color: #c8d2dc; }

        /* Range info bar */
        .range-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 14px;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          font-size: 12px;
          color: var(--text-muted);
          font-family: 'Helvetica Neue', sans-serif;
          min-height: 32px;
        }
        .range-text { color: var(--blue-dark); font-weight: 600; }
        .clear-btn {
          background: none;
          border: 1px solid var(--border);
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          color: var(--text-muted);
          padding: 2px 8px;
          transition: all 0.15s;
        }
        .clear-btn:hover { border-color: var(--blue); color: var(--blue); }

        /* Notes section */
        .cal-notes {
          border-top: 1px solid var(--border);
          padding: 12px 14px;
          background: var(--bg);
        }
        .notes-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .notes-label {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          font-family: 'Helvetica Neue', sans-serif;
          font-weight: 600;
        }
        .note-mode-toggle {
          display: flex;
          gap: 4px;
        }
        .mode-btn {
          font-size: 10px;
          padding: 2px 8px;
          border: 1px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          background: none;
          color: var(--text-muted);
          font-family: 'Helvetica Neue', sans-serif;
          transition: all 0.15s;
        }
        .mode-btn.active {
          background: var(--blue);
          color: white;
          border-color: var(--blue);
        }
        .notes-textarea {
          width: 100%;
          box-sizing: border-box;
          border: none;
          border-bottom: 1px solid var(--border);
          background: transparent;
          font-family: 'Georgia', serif;
          font-size: 13px;
          color: var(--text);
          resize: none;
          outline: none;
          line-height: 1.8;
          padding: 4px 0;
          height: 70px;
          transition: border-color 0.15s;
        }
        .notes-textarea:focus {
          border-bottom-color: var(--blue);
        }
        .notes-textarea::placeholder {
          color: #c4cdd6;
          font-style: italic;
        }

        /* Page flip animation */
        .cal-paper.flipping-next {
          animation: flipNext 0.32s ease-in-out;
        }
        .cal-paper.flipping-prev {
          animation: flipPrev 0.32s ease-in-out;
        }
        @keyframes flipNext {
          0% { transform: rotateX(0deg); opacity: 1; }
          50% { transform: rotateX(-8deg); opacity: 0.5; }
          100% { transform: rotateX(0deg); opacity: 1; }
        }
        @keyframes flipPrev {
          0% { transform: rotateX(0deg); opacity: 1; }
          50% { transform: rotateX(8deg); opacity: 0.5; }
          100% { transform: rotateX(0deg); opacity: 1; }
        }

        /* Legend */
        .cal-legend {
          display: flex;
          gap: 12px;
          padding: 8px 14px;
          border-top: 1px solid var(--border);
          background: var(--bg-secondary);
          font-size: 10px;
          color: var(--text-muted);
          font-family: 'Helvetica Neue', sans-serif;
          flex-wrap: wrap;
        }
        .legend-item { display: flex; align-items: center; gap: 4px; }
        .legend-dot {
          width: 8px; height: 8px; border-radius: 50%;
        }
      `}</style>

      <div
        className={`cal-paper ${flipping ? (flipDir === "next" ? "flipping-next" : "flipping-prev") : ""}`}
        style={{ perspective: "1000px" }}
      >
        {/* Spiral binding */}
        <div className="cal-spiral">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="hole" />
          ))}
        </div>

        <div className="cal-body">
          {/* LEFT: Image panel */}
          <div className="cal-image-panel">
            <div className="cal-nav">
              <button className="nav-btn" onClick={() => navigate("prev")} title="Previous month">‹</button>
              <button className="nav-btn" onClick={() => navigate("next")} title="Next month">›</button>
            </div>
            <img ref={imgRef} src={imgSrc} alt={MONTHS[currentMonth]} />
            <div className="cal-image-overlay">
              <div className="cal-year-label">{currentYear}</div>
              <div className="cal-month-label">{MONTHS[currentMonth]}</div>
            </div>
          </div>

          {/* RIGHT: Grid panel */}
          <div className="cal-grid-panel">
            {/* Weekday headers */}
            <div className="cal-weekdays">
              {WEEKDAYS.map((wd, i) => (
                <div key={wd} className={`wd-cell ${i === 0 ? "sun" : i === 6 ? "sat" : ""}`}>
                  {wd}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="cal-days">
              {cells.map((day, idx) => {
                if (!day) return <div key={`e-${idx}`} className="day-cell empty" />;

                const colIndex = idx % 7;
                const d = new Date(currentYear, currentMonth, day);
                const isToday = isSameDay(d, today);
                const isStart = isSameDay(d, rangeStart);
                const isEnd = effectiveEnd && isSameDay(d, effectiveEnd);
                const inRange = isInRange(d,
                  rangeStart,
                  effectiveEnd
                );
                const holidayKey = `${currentMonth + 1}-${day}`;
                const isHoliday = !!INDIAN_HOLIDAYS[holidayKey];

                let cls = "day-cell";
                if (colIndex === 0) cls += " sun-col";
                if (colIndex === 6) cls += " sat-col";
                if (isToday) cls += " today";
                if (isStart) cls += " start";
                else if (isEnd) cls += " end";
                else if (inRange) cls += " in-range";
                if (isHoliday) cls += " holiday";

                return (
                  <div
                    key={day}
                    className={cls}
                    onClick={() => handleDayClick(day)}
                    onMouseEnter={() => pickingEnd && setHoverDate(new Date(currentYear, currentMonth, day))}
                    onMouseLeave={() => setHoverDate(null)}
                    title={isHoliday ? INDIAN_HOLIDAYS[holidayKey] : undefined}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Range info bar */}
            <div className="range-bar">
              {rangeStart ? (
                <span className="range-text">
                  {formatDate(rangeStart)}
                  {rangeEnd ? ` → ${formatDate(rangeEnd)}` : " → pick end date"}
                </span>
              ) : (
                <span>Click a date to start selection</span>
              )}
              {rangeStart && (
                <button className="clear-btn" onClick={clearSelection}>Clear</button>
              )}
            </div>

            {/* Notes section */}
            <div className="cal-notes">
              <div className="notes-header">
                <span className="notes-label">Notes</span>
                <div className="note-mode-toggle">
                  <button
                    className={`mode-btn ${noteMode === "range" ? "active" : ""}`}
                    onClick={() => setNoteMode("range")}
                  >
                    For date
                  </button>
                  <button
                    className={`mode-btn ${noteMode === "month" ? "active" : ""}`}
                    onClick={() => setNoteMode("month")}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <textarea
                className="notes-textarea"
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                onBlur={handleNoteBlur}
                placeholder={
                  noteMode === "month"
                    ? `Notes for ${MONTHS[currentMonth]}...`
                    : rangeStart
                    ? `Notes for ${formatDate(rangeStart)}${rangeEnd ? " → " + formatDate(rangeEnd) : ""}...`
                    : "Select a date first, then add notes..."
                }
              />
            </div>

            {/* Legend */}
            <div className="cal-legend">
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#1E88E5" }} />
                <span>Selected</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#DBEAFE" }} />
                <span>In range</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "#ef4444" }} />
                <span>Holiday</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ border: "1.5px solid #1E88E5", background: "white" }} />
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
