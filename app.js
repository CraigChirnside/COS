(function () {
  const { el, raw, patch } = window.COSDom;

  // Schedule merged from the uploaded timesheet (Wednesday column), 15-min slots collapsed.
  const SCHED = [
    { id: 'getup', block: 'Morning', min: 270, dur: 15, title: 'Get Up', pillar: 'Health', type: 'time', measure: 'Actual wake time vs 4:30', timeLabel: 'Out of bed at', coach: 'On the floor, not in the bed. Every block after this is priced off it.' },
    { id: 'exercise', block: 'Morning', min: 285, dur: 30, title: 'Exercise', pillar: 'Health', type: 'program', measure: 'Programme completed — per exercise', coach: 'Wednesday is abs, arms and back. Tick the lifts as you go; reps get recorded.' },
    { id: 'read_am', block: 'Morning', min: 315, dur: 30, title: 'Reading', pillar: 'Learning', type: 'reading', measure: '10 pages + notes recorded', coach: 'Ten pages and what you took from them. Pages without notes do not count.' },
    { id: 'breakfast', block: 'Morning', min: 345, dur: 15, title: 'Breakfast', pillar: 'Health', type: 'bool', measure: 'Completed — yes / no', coach: 'Eat. The days you skip it are the days 3pm costs you an hour.' },
    { id: 'shower', block: 'Morning', min: 360, dur: 15, title: 'Shower', pillar: 'Health', type: 'bool', measure: 'Completed — yes / no', coach: 'Thirty minutes to the car from here.' },
    { id: 't4g', block: 'Morning', min: 375, dur: 15, title: 'Shower — T4G', pillar: 'Health', type: 'bool', measure: 'Completed — yes / no', coach: 'Cold finish. Fifteen minutes, then you are moving.' },
    { id: 'drive', block: 'Morning', min: 390, dur: 30, title: 'Drive to Work', pillar: 'Business', type: 'bool', measure: 'Left on time — yes / no', coach: 'Out the door at 6:30 puts you at the desk before anyone needs you.' },
    { id: 'travel_home', block: 'Evening', min: 1005, dur: 15, title: 'Travel Home', pillar: 'Family', type: 'bool', measure: 'Left the office — yes / no', coach: 'Leave at 4:45. The last email will still be there tomorrow.' },
    { id: 'family', block: 'Evening', min: 1020, dur: 45, title: 'Family Time', pillar: 'Family', type: 'bool', measure: 'Completed — yes / no', coach: 'Forty-five minutes, phone in the kitchen. This is the block you defend hardest.' },
    { id: 'tea', block: 'Evening', min: 1065, dur: 30, title: 'Tea', pillar: 'Family', type: 'bool', measure: 'Completed — yes / no', coach: 'At the table, together.' },
    { id: 'prep', block: 'Evening', min: 1095, dur: 15, title: 'Prep for Meeting', pillar: 'Business', type: 'bool', measure: 'Completed — yes / no', coach: 'Fifteen minutes of prep is the difference between running the meeting and attending it.' },
    { id: 'travel_mtg', block: 'Evening', min: 1110, dur: 30, title: 'Travel to Meeting', pillar: 'Business', type: 'bool', measure: 'Completed — yes / no', coach: 'Leave at 6:30.' },
    { id: 'meeting', block: 'Evening', min: 1140, dur: 45, title: 'Meeting', pillar: 'Business', type: 'bool', measure: 'Attended — yes / no', coach: 'Show up with the numbers, not the opinions.' },
    { id: 'kids', block: 'Evening', min: 1185, dur: 30, title: 'Time with S&E', pillar: 'Family', type: 'bool', measure: 'Completed — yes / no', coach: 'Thirty minutes that they will remember longer than you will.' },
    { id: 'bedtime', block: 'Evening', min: 1215, dur: 15, title: 'Put S&E to Bed', pillar: 'Family', type: 'bool', measure: 'Completed — yes / no', coach: 'You do the bedtime. Every night you can.' },
    { id: 'duties', block: 'Evening', min: 1230, dur: 15, title: 'Duties', pillar: 'Business', type: 'bool', measure: 'Completed — yes / no', coach: 'Clear the decks so tomorrow starts clean.' },
    { id: 'read_pm', block: 'Evening', min: 1245, dur: 30, title: 'Reading', pillar: 'Learning', type: 'reading', measure: 'Pages + notes recorded', coach: 'Second session. Notes here are where the week actually compounds.' },
    { id: 'shower_pm', block: 'Evening', min: 1275, dur: 15, title: 'Shower', pillar: 'Health', type: 'bool', measure: 'Completed — yes / no', coach: 'Wind down. Screens off after this.' },
    { id: 'bed', block: 'Evening', min: 1290, dur: 15, title: 'Bed', pillar: 'Health', type: 'time', timeLabel: 'Lights out at', measure: 'Lights out vs 9:30', coach: 'Lights out at 9:30 is what makes 4:30 possible. This is the real habit.' },
  ];

  // Wednesday — Abs / Arms / Back, quantities and weights from the uploaded program
  const PROGRAM = [
    { name: 'Plank', target: '50 sec', qty: 50, unit: 'sec' },
    { name: 'Russian Twist', target: '5kg × 14', qty: 14 },
    { name: 'Bicep Curls', target: '10kg ea × 14', qty: 14 },
    { name: 'Triceps', target: '22kg × 14', qty: 14 },
    { name: 'Weighted Row', target: '20kg × 14', qty: 14 },
    { name: 'Tricep Pull Down', target: '20kg × 14', qty: 14 },
    { name: 'Left Side Plank', target: '50 sec', qty: 50, unit: 'sec' },
    { name: 'Sit Ups', target: '× 20', qty: 20 },
    { name: 'Back Pull Down', target: '30kg × 14', qty: 14 },
    { name: 'Bicycle Crunch', target: '× 20', qty: 20 },
    { name: 'Right Side Plank', target: '50 sec', qty: 50, unit: 'sec' },
  ];

  // Six prior days this week — strong, with a late Monday.
  // `read` counts closed sessions; `deepNotes` counts those whose note was an
  // actual takeaway rather than the few words needed to unlock the button.
  const HISTORY = [
    { day: 'Thu', pct: 100, getup: 1, exercise: 1, read: 2, pages: 24, deepNotes: 2, family: 1, bed: 1 },
    { day: 'Fri', pct: 95, getup: 1, exercise: 1, read: 2, pages: 21, deepNotes: 2, family: 1, bed: 1 },
    { day: 'Sat', pct: 89, getup: 1, exercise: 1, read: 1, pages: 18, deepNotes: 1, family: 1, bed: 1 },
    { day: 'Sun', pct: 95, getup: 1, exercise: 0, read: 2, pages: 22, deepNotes: 1, family: 1, bed: 1 },
    { day: 'Mon', pct: 74, getup: 0, exercise: 0, read: 1, pages: 12, deepNotes: 0, family: 1, bed: 0 },
    { day: 'Tue', pct: 100, getup: 1, exercise: 1, read: 2, pages: 20, deepNotes: 2, family: 1, bed: 1 },
  ];
  const PRIOR = [78, 84, 88, 91, 90];
  const TABS = [
    { key: 'today', label: 'Today' }, { key: 'log', label: 'Log' }, { key: 'dash', label: 'Data' },
    { key: 'reports', label: 'Report' }, { key: 'coach', label: 'Coach' },
  ];
  const KEY = 'craig-os-v2';
  // Characters of note required to close a reading session, and the starting
  // value for the adjustable bar a note has to clear to count as a real
  // takeaway. The gap between them is the whole point: the low bar unlocks the
  // button, the high bar is the habit being measured. NOTE_MIN is fixed —
  // it is a gate, not a goal; the keeper bar lives in targets.noteDepth.
  const NOTE_MIN = 10;
  const NOTE_DEEP_DEFAULT = 120;
  const ACCENT = 'var(--color-accent)';
  const DARK = 'var(--color-accent-900)';
  const MUTED = 'var(--color-neutral-700)';

  function fmt(min) {
    const m = ((min % 1440) + 1440) % 1440;
    const h24 = Math.floor(m / 60), mm = m % 60;
    const h = h24 % 12 === 0 ? 12 : h24 % 12;
    return h + ':' + String(mm).padStart(2, '0') + (h24 < 12 ? 'am' : 'pm');
  }
  function hhmm(min) { return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0'); }

  const Component = {
    state: {
      screen: 'today', clock: 270, focus: null, log: {}, sets: {}, runKm: 0,
      reading: { read_am: { pages: 0, notes: '' }, read_pm: { pages: 0, notes: '' } },
      times: {}, off: {}, actual: {},
      metrics: { weight: 88.4, sleep: 6.2, water: 1.2 },
      targets: { pages: 10, exercise: 5, family: 7, noteDepth: NOTE_DEEP_DEFAULT },
      toast: null, seen: {}, saved: false, asked: [],
      reasons: {}, excusing: false, excusePanel: false,
    },

    setState(next) {
      const delta = typeof next === 'function' ? next(this.state) : next;
      if (!delta) return;
      this.state = Object.assign({}, this.state, delta);
      this.render();
      this.componentDidUpdate();
    },

    componentDidMount() {
      try {
        const stored = localStorage.getItem(KEY);
        if (!stored) return;
        const saved = JSON.parse(stored);
        // A save written before a target existed would come back missing it and
        // replace the default with undefined. Merge so new targets survive an
        // old save — noteDepth undefined would mark every note thin.
        if (saved.targets) saved.targets = Object.assign({}, this.state.targets, saved.targets);
        this.setState(saved);
      } catch (e) {}
    },
    componentDidUpdate() {
      try {
        const s = this.state;
        localStorage.setItem(KEY, JSON.stringify({
          screen: s.screen, clock: s.clock, focus: s.focus, log: s.log, sets: s.sets, runKm: s.runKm,
          reading: s.reading, times: s.times, off: s.off, actual: s.actual, metrics: s.metrics,
          targets: s.targets, seen: s.seen, asked: s.asked, reasons: s.reasons,
        }));
      } catch (e) {}
    },

    items() {
      const s = this.state;
      return SCHED.filter((h) => !s.off[h.id])
        .map((h) => Object.assign({}, h, { min: s.times[h.id] ?? h.min }))
        .sort((a, b) => a.min - b.min);
    },
    currentId() {
      const s = this.state, list = this.items();
      if (s.focus && list.some((h) => h.id === s.focus)) return s.focus;
      const due = list.filter((h) => !s.log[h.id] && h.min <= s.clock).pop();
      if (due) return due.id;
      const next = list.find((h) => !s.log[h.id]);
      return next ? next.id : null;
    },
    programDone() { const s = this.state; return PROGRAM.filter((e) => s.sets[e.name] > 0).length; },
    readingOk(id) {
      const r = this.state.reading[id] || { pages: 0, notes: '' };
      return r.pages >= this.state.targets.pages && this.noteLen(id) >= NOTE_MIN;
    },
    noteLen(id) {
      return ((this.state.reading[id] || {}).notes || '').trim().length;
    },
    mark(id, st) {
      this.setState((s) => ({ log: Object.assign({}, s.log, { [id]: st }), focus: null, toast: null, excusing: false }));
    },
    excuse(id, reason) {
      this.setState((s) => ({
        log: Object.assign({}, s.log, { [id]: 'skip' }),
        reasons: Object.assign({}, s.reasons, { [id]: reason }),
        focus: null, toast: null, excusing: false,
      }));
    },
    excuseBlock(block, reason) {
      this.setState((s) => {
        const log = Object.assign({}, s.log), reasons = Object.assign({}, s.reasons);
        SCHED.filter((h) => h.block === block && !s.off[h.id] && !s.log[h.id]).forEach((h) => {
          log[h.id] = 'skip'; reasons[h.id] = reason;
        });
        return { log, reasons, focus: null, toast: null, excusing: false, excusePanel: false };
      });
    },
    bump(key, delta, min, max, dp) {
      this.setState((s) => {
        const v = Math.max(min, Math.min(max, +((s.metrics[key] + delta).toFixed(dp))));
        return { metrics: Object.assign({}, s.metrics, { [key]: v }) };
      });
    },

    weekPct() {
      const s = this.state, list = this.items().filter((h) => s.log[h.id] !== 'skip');
      const todayDone = list.filter((h) => s.log[h.id] === 'done').length;
      const hist = HISTORY.reduce((n, d) => n + d.pct, 0);
      return Math.round((hist + Math.round((todayDone / Math.max(list.length, 1)) * 100)) / 7);
    },
    count(k) {
      const s = this.state;
      const today = k === 'read' ? ['read_am', 'read_pm'].filter((i) => s.log[i] === 'done').length
        : (s.log[k === 'getup' ? 'getup' : k] === 'done' ? 1 : 0);
      return HISTORY.reduce((n, d) => n + (d[k] || 0), 0) + today;
    },
    pagesWeek() {
      const s = this.state;
      const today = ['read_am', 'read_pm'].reduce((n, i) => n + (s.log[i] === 'done' ? (s.reading[i] || {}).pages || 0 : 0), 0);
      return HISTORY.reduce((n, d) => n + d.pages, 0) + today;
    },
    // Closed sessions whose note was a real takeaway, not the ten characters
    // that unlock the button. Deliberately a different measure from
    // count('read') — a session you showed up for but scribbled through should
    // be visible as a gap between those two rows, not hidden by them.
    deepNotesWeek() {
      const s = this.state;
      const today = ['read_am', 'read_pm'].filter((i) =>
        s.log[i] === 'done' && this.noteLen(i) >= s.targets.noteDepth).length;
      return HISTORY.reduce((n, d) => n + d.deepNotes, 0) + today;
    },

    renderVals() {
      const s = this.state;
      const list = this.items();
      const curId = this.currentId();
      const c = list.find((h) => h.id === curId);
      const st = c ? s.log[c.id] : null;
      const active = list.filter((h) => s.log[h.id] !== 'skip');
      const excused = list.filter((h) => s.log[h.id] === 'skip');
      const doneCount = active.filter((h) => s.log[h.id] === 'done').length;
      const loggedCount = active.filter((h) => s.log[h.id]).length;
      const excusedFor = (key) => excused.filter((h) => (key === 'read' ? h.type === 'reading' : h.id === key)).length;
      const progDone = this.programDone();
      const readId = c && c.type === 'reading' ? c.id : 'read_am';
      const rd = s.reading[readId] || { pages: 0, notes: '' };
      const actualMin = c && c.type === 'time' ? (s.actual[c.id] ?? c.min + 2) : 0;

      let blocked = false, blockedWhy = '';
      if (c && c.type === 'reading' && !this.readingOk(c.id)) {
        blocked = true;
        blockedWhy = rd.pages < s.targets.pages
          ? (s.targets.pages - rd.pages) + ' pages short of the daily ' + s.targets.pages + '.'
          : 'Notes are the second half of the habit — write them and it closes.';
      }
      if (c && c.type === 'program' && progDone < PROGRAM.length) {
        blocked = true;
        blockedWhy = (PROGRAM.length - progDone) + ' exercises still unticked. Open the programme.';
      }

      const setPages = (id, d) => () => this.setState((x) => {
        const cur = x.reading[id] || { pages: 0, notes: '' };
        return { reading: Object.assign({}, x.reading, { [id]: { pages: Math.max(0, cur.pages + d), notes: cur.notes } }), saved: false };
      });
      const typePages = (id) => (e) => {
        const n = parseInt(String(e.target.value).replace(/[^0-9]/g, ''), 10);
        this.setState((x) => {
          const cur = x.reading[id] || { pages: 0, notes: '' };
          return { reading: Object.assign({}, x.reading, { [id]: { pages: isNaN(n) ? 0 : Math.min(999, n), notes: cur.notes } }), saved: false };
        });
      };
      const setNotes = (id) => (e) => this.setState((x) => {
        const cur = x.reading[id] || { pages: 0, notes: '' };
        return { reading: Object.assign({}, x.reading, { [id]: { pages: cur.pages, notes: e.target.value } }), saved: false };
      });

      const groups = ['Morning', 'Evening'].map((name) => {
        const rows = list.filter((h) => h.block === name);
        const counted = rows.filter((h) => s.log[h.id] !== 'skip');
        const d = counted.filter((h) => s.log[h.id] === 'done').length;
        const skipped = rows.length - counted.length;
        return {
          name: name + ' block',
          count: d + ' / ' + counted.length + (skipped ? ' · ' + skipped + ' excused' : ''),
          rows: rows.map((h) => {
            const state = s.log[h.id];
            const isCur = h.id === curId;
            return {
              id: h.id,
              time: fmt(h.min).replace(':00', ''),
              title: h.title,
              note: state === 'done' ? 'logged' : state === 'missed' ? 'missed' : state === 'skip' ? (s.reasons[h.id] || 'excused') : h.min <= s.clock ? 'due' : '',
              dot: state === 'done' ? ACCENT : state === 'missed' ? 'var(--color-neutral-400)' : 'transparent',
              dotBorder: state === 'skip' ? 'var(--color-neutral-400)' : isCur ? DARK : 'var(--color-accent-500)',
              bg: isCur ? 'var(--color-accent-200)' : 'transparent',
              ink: state === 'missed' || state === 'skip' ? MUTED : 'var(--color-text)',
              jump: () => this.setState({ focus: h.id, screen: 'today' }),
            };
          }),
        };
      });

      const report = [
        { habit: 'Up at 4:30', base: 7, exc: excusedFor('getup'), n: this.count('getup'), unit: ' ×' },
        { habit: 'Exercise', base: s.targets.exercise, exc: excusedFor('exercise'), n: this.count('exercise'), unit: ' ×' },
        { habit: 'Reading sessions', base: 14, exc: excusedFor('read'), n: this.count('read'), unit: '' },
        { habit: 'Pages', base: s.targets.pages * 14, exc: excusedFor('read') * s.targets.pages, n: this.pagesWeek(), unit: ' pp' },
        { habit: 'Notes worth keeping', base: 14, exc: excusedFor('read'), n: this.deepNotesWeek(), unit: '' },
        { habit: 'Family time', base: s.targets.family, exc: excusedFor('family'), n: this.count('family'), unit: ' ×' },
        { habit: 'Lights out 9:30', base: 7, exc: excusedFor('bed'), n: this.count('bed'), unit: ' ×' },
      ].map((r) => {
        const t = Math.max(1, r.base - r.exc);
        const pct = Math.round((r.n / t) * 100);
        return {
          habit: r.habit,
          target: t + r.unit + (r.exc ? ' *' : ''),
          actual: r.n + r.unit,
          pct: pct + '%',
          ink: pct >= 100 ? DARK : MUTED,
        };
      });
      const excusedNote = excused.length
        ? excused.length + ' block' + (excused.length > 1 ? 's' : '') + ' excused today (' + (s.reasons[excused[0].id] || 'excused').toLowerCase() + ') — targets adjusted, marked *'
        : '';

      const streakDefs = [
        { k: 'read', name: 'Reading — both sessions', seq: HISTORY.map((d) => (d.read >= 2 ? 'd' : 'm')) },
        { k: 'getup', name: 'Up at 4:30', seq: HISTORY.map((d) => (d.getup ? 'd' : 'm')) },
        { k: 'exercise', name: 'Exercise', seq: HISTORY.map((d) => (d.exercise ? 'd' : 'm')) },
        { k: 'bed', name: 'Lights out 9:30', seq: HISTORY.map((d) => (d.bed ? 'd' : 'm')) },
      ];
      const todayMark = (k) => {
        if (k === 'read') {
          const both = ['read_am', 'read_pm'];
          if (both.every((i) => s.log[i] === 'done')) return 'd';
          if (both.some((i) => s.log[i] === 'missed')) return 'm';
          return 'p';
        }
        const id = k === 'getup' ? 'getup' : k === 'bed' ? 'bed' : 'exercise';
        return s.log[id] === 'done' ? 'd' : s.log[id] === 'missed' ? 'm' : 'p';
      };
      const skipMark = (k) => {
        if (k === 'read') return ['read_am', 'read_pm'].every((i) => s.log[i] === 'skip');
        return s.log[k === 'getup' ? 'getup' : k === 'bed' ? 'bed' : 'exercise'] === 'skip';
      };
      const streaks = streakDefs.map((d) => {
        const seq = d.seq.concat([skipMark(d.k) ? 'x' : todayMark(d.k)]);
        let run = 0;
        for (let i = seq.length - 1; i >= 0; i--) {
          if (seq[i] === 'p' || seq[i] === 'x') continue;
          if (seq[i] === 'd') run++; else break;
        }
        return {
          name: d.name,
          label: skipMark(d.k) ? 'excused' : run === 0 ? 'reset' : run + ' d',
          ink: run === 0 ? MUTED : DARK,
          days: seq.map((ch) => ({
            bg: ch === 'd' ? ACCENT : ch === 'm' ? 'var(--color-neutral-300)' : ch === 'x' ? 'var(--color-accent-200)' : 'transparent',
            border: ch === 'p' ? 'var(--color-accent-400)' : 'var(--color-accent-600)',
          })),
        };
      });

      const pillarNames = ['Health', 'Learning', 'Business', 'Family'];
      const pillars = pillarNames.map((p) => {
        const rows = active.filter((h) => h.pillar === p);
        const d = rows.filter((h) => s.log[h.id] === 'done').length;
        const pct = Math.round((d / Math.max(rows.length, 1)) * 100);
        return { name: p, pct: pct + '%', fill: pct >= 80 ? ACCENT : 'var(--color-accent-400)' };
      });

      const weekPct = this.weekPct();
      const missedToday = list.filter((h) => s.log[h.id] === 'missed');
      const flag = missedToday.length
        ? { kicker: 'Flagged today', title: missedToday.map((h) => h.title).join(', ') + ' missed', body: 'Recorded against ' + fmt(missedToday[0].min) + '. It will show in the week 38 report and break the streak it belongs to.' }
        : this.count('getup') < 7
          ? { kicker: 'Streak broken', title: 'Up at 4:30 — Monday', body: 'Up at 5:02 Monday. Exercise went, breakfast went, lights out slipped to 10:15. The wake-up is the domino.' }
          : null;

      const askable = [
        { label: 'How is the week?', text: 'Week 38 is running at ' + weekPct + '%. Reading is carrying it at ' + this.pagesWeek() + ' pages. Exercise is ' + this.count('exercise') + ' of ' + s.targets.exercise + '.' },
        { label: 'What am I worst at?', text: 'Lights out. ' + this.count('bed') + ' of 7 this week — and every late wake-up followed a late night. Fix 9:30 and 4:30 fixes itself.' },
        { label: 'Fix Monday', text: 'Monday is the weak day: one reading session, no exercise, up at 5:02. Shift Monday exercise to the evening Duties slot and protect the 9:30 lights-out on Sunday.' },
      ];
      const coachLines = [
        { text: 'Craig — ' + this.pagesWeek() + ' pages against a target of ' + (s.targets.pages * 14) + ' this week. Reading is the strongest thing you do.', me: false },
        { text: 'Exercise sits at ' + this.count('exercise') + ' of ' + s.targets.exercise + '. The miss was Monday, after a 5:02 wake-up.', me: false },
      ].concat(s.asked.map((i) => ({ text: askable[i].text, me: false })));

      return {
        clockLabel: fmt(s.clock),
        blockLabel: s.clock < 720 ? 'Morning block' : 'Evening block',
        clockBack: () => this.setState((x) => ({ clock: Math.max(240, x.clock - 15), focus: null })),
        clockFwd: () => this.setState((x) => {
          const clock = Math.min(1320, x.clock + 15);
          const due = SCHED.filter((h) => !x.off[h.id])
            .map((h) => Object.assign({}, h, { min: x.times[h.id] ?? h.min }))
            .filter((h) => h.min <= clock && !x.log[h.id] && !x.seen[h.id])
            .sort((a, b) => a.min - b.min)[0];
          if (!due) return { clock, focus: null };
          return {
            clock, focus: null,
            toast: { time: fmt(due.min), text: due.title + ' — ' + due.measure.toLowerCase() + '. Log it now, not later.' },
            seen: Object.assign({}, x.seen, { [due.id]: 1 }),
          };
        }),
        toast: s.toast,
        dismissToast: () => this.setState({ toast: null }),
        isToday: s.screen === 'today', isProgram: s.screen === 'program', isLog: s.screen === 'log',
        isDash: s.screen === 'dash', isReports: s.screen === 'reports', isSettings: s.screen === 'settings',
        isCoach: s.screen === 'coach',
        goToday: () => this.setState({ screen: 'today' }),
        goProgram: () => this.setState({ screen: 'program' }),
        goSettings: () => this.setState({ screen: 'settings' }),
        goDash: () => this.setState({ screen: 'dash' }),
        tabs: TABS.map((t) => ({
          label: t.label, go: () => this.setState({ screen: t.key }),
          mark: s.screen === t.key || (t.key === 'today' && s.screen === 'program') ? ACCENT : 'transparent',
          ink: s.screen === t.key || (t.key === 'today' && s.screen === 'program') ? DARK : 'var(--color-neutral-600)',
        })),
        progressLabel: loggedCount + ' / ' + active.length + ' logged' + (excused.length ? ' · ' + excused.length + ' excused' : ''),
        progressPct: Math.round((doneCount / Math.max(active.length, 1)) * 100) + '%',
        hasCurrent: !!c,
        dayClosed: !c,
        closeHead: doneCount === active.length ? 'Clean sweep — 100%.' : doneCount + ' of ' + active.length + ' done.',
        closeBody: doneCount === active.length
          ? 'Every block logged, both reading sessions closed with notes. That is the day the system is built for.'
          : 'The misses are recorded and will show in the week 38 report. Nothing to do now but the next 4:30.',
        cur: c ? {
          window: fmt(c.min).replace(':00', '') + '–' + fmt(c.min + c.dur).replace(':00', ''),
          title: c.title, pillar: c.pillar, measure: c.measure, coach: c.coach,
          timeLabel: c.timeLabel || '',
          stateLabel: st === 'done' ? 'LOGGED' : st === 'missed' ? 'MISSED' : st === 'skip' ? 'EXCUSED' : c.min <= s.clock ? 'DUE NOW' : 'UPCOMING',
          stateInk: st === 'missed' || st === 'skip' ? MUTED : 'var(--color-accent-700)',
          isProgram: c.type === 'program' && !st,
          isReading: c.type === 'reading' && !st,
          isTime: c.type === 'time' && !st,
          isLogged: !!st,
          isOpen: !st,
          loggedLabel: st === 'done'
            ? (c.type === 'reading' ? 'Logged — ' + rd.pages + ' pages + notes' : c.type === 'time' ? 'Logged at ' + fmt(actualMin) : 'Logged — done')
            : st === 'skip' ? 'Excused — ' + (s.reasons[c.id] || 'not applicable') + ', not counted'
              : 'Recorded as missed',
          doneLabel: c.type === 'time' ? 'Log ' + fmt(actualMin) : 'Mark done',
          doneOpacity: blocked ? 0.45 : 1,
          donePointer: blocked ? 'none' : 'auto',
          blocked, blockedWhy,
        } : null,
        markDone: () => this.mark(curId, 'done'),
        markMissed: () => this.mark(curId, 'missed'),
        undo: () => this.setState((x) => {
          const log = Object.assign({}, x.log), reasons = Object.assign({}, x.reasons);
          delete log[curId]; delete reasons[curId];
          return { log, reasons, focus: curId };
        }),
        excusing: s.excusing,
        notExcusing: !s.excusing,
        openExcuse: () => this.setState({ excusing: true }),
        closeExcuse: () => this.setState({ excusing: false }),
        reasonChips: ['Travelling', 'Sick', 'Rest day', 'Family'].map((r) => ({
          label: r, pick: () => this.excuse(curId, r),
        })),
        excusePanel: s.excusePanel,
        toggleExcusePanel: () => this.setState((x) => ({ excusePanel: !x.excusePanel })),
        excuseBlocks: ['Morning', 'Evening'].map((b) => ({
          label: 'Excuse rest of ' + b.toLowerCase() + ' — travelling',
          run: () => this.excuseBlock(b, 'Travelling'),
        })),
        excusedNote,
        groups,
        pages: rd.pages, notes: rd.notes, readKey: readId,
        pagesUp: setPages(readId, 1), pagesDown: setPages(readId, -1), setNotes: setNotes(readId),
        typePages: typePages(readId),
        actualTime: fmt(actualMin),
        actualUp: () => this.setState((x) => ({ actual: Object.assign({}, x.actual, { [curId]: (x.actual[curId] ?? c.min + 2) + 1 }) })),
        actualDown: () => this.setState((x) => ({ actual: Object.assign({}, x.actual, { [curId]: (x.actual[curId] ?? c.min + 2) - 1 }) })),
        programName: 'Abs / Arms / Back circuit',
        programProgress: progDone + ' / ' + PROGRAM.length + ' ticked',
        runKm: s.runKm.toFixed(1),
        typeRun: (e) => {
          const n = parseFloat(String(e.target.value).replace(/[^0-9.]/g, ''));
          this.setState({ runKm: isNaN(n) ? 0 : Math.min(99, n) });
        },
        runUp: () => this.setState((x) => ({ runKm: +(x.runKm + 0.1).toFixed(1) })),
        runDown: () => this.setState((x) => ({ runKm: Math.max(0, +(x.runKm - 0.1).toFixed(1)) })),
        exercises: PROGRAM.map((e) => {
          const v = s.sets[e.name] || 0;
          return {
            key: e.name,
            name: e.name, target: e.target + (e.unit === 'sec' ? '' : ' reps'),
            actual: v ? String(v) : '',
            type: (ev) => {
              const n = parseInt(String(ev.target.value).replace(/[^0-9]/g, ''), 10);
              this.setState((x) => ({ sets: Object.assign({}, x.sets, { [e.name]: isNaN(n) ? 0 : Math.min(999, n) }) }));
            },
            ink: v === 0 ? 'var(--color-neutral-500)' : v >= e.qty ? DARK : MUTED,
            bg: v >= e.qty ? 'var(--color-accent-100)' : 'transparent',
            tick: v > 0 ? '✓' : '',
            tickBg: v > 0 ? ACCENT : 'transparent',
            toggle: () => this.setState((x) => ({ sets: Object.assign({}, x.sets, { [e.name]: x.sets[e.name] ? 0 : e.qty }) })),
            up: () => this.setState((x) => ({ sets: Object.assign({}, x.sets, { [e.name]: (x.sets[e.name] || 0) + (e.unit === 'sec' ? 5 : 1) }) })),
            down: () => this.setState((x) => ({ sets: Object.assign({}, x.sets, { [e.name]: Math.max(0, (x.sets[e.name] || 0) - (e.unit === 'sec' ? 5 : 1)) }) })),
          };
        }),
        volumeLabel: PROGRAM.reduce((n, e) => n + (s.sets[e.name] || 0), 0) + ' / ' + PROGRAM.reduce((n, e) => n + e.qty, 0),
        finishProgram: () => this.setState((x) => ({
          screen: 'today',
          focus: null,
          log: this.programDone() === PROGRAM.length ? Object.assign({}, x.log, { exercise: 'done' }) : x.log,
        })),
        metrics: [
          { k: 'weight', label: 'Weight', unit: 'kg', max: 140, value: s.metrics.weight.toFixed(1), step: 0.1 },
          { k: 'sleep', label: 'Sleep', unit: 'hrs', max: 12, value: s.metrics.sleep.toFixed(1), step: 0.1 },
          { k: 'water', label: 'Water', unit: '/ 3 L', max: 6, value: s.metrics.water.toFixed(1), step: 0.2 },
          { k: 'reps', label: 'Exercise reps', unit: 'logged', max: 9999, value: String(PROGRAM.reduce((n, e) => n + (s.sets[e.name] || 0), 0)), step: 0 },
        ].map((m) => ({
          key: m.k,
          label: m.label, unit: m.unit, value: m.value,
          readOnly: m.step === 0,
          up: () => (m.step ? this.bump(m.k, m.step, 0, m.max, 1) : this.setState({ screen: 'program' })),
          down: () => (m.step ? this.bump(m.k, -m.step, 0, m.max, 1) : this.setState({ screen: 'program' })),
          type: (e) => {
            if (!m.step) return;
            const n = parseFloat(String(e.target.value).replace(/[^0-9.]/g, ''));
            this.setState((x) => ({ metrics: Object.assign({}, x.metrics, { [m.k]: isNaN(n) ? 0 : Math.min(m.max, n) }) }));
          },
        })),
        readingCards: [
          { id: 'read_am', label: 'Morning · 5:15' },
          { id: 'read_pm', label: 'Evening · 8:45' },
        ].map((r) => {
          const v = s.reading[r.id] || { pages: 0, notes: '' };
          const ok = this.readingOk(r.id);
          const deep = this.noteLen(r.id) >= s.targets.noteDepth;
          return {
            key: r.id,
            label: r.label, inputId: 'cos-' + r.id, pages: v.pages, notes: v.notes,
            // Three states, not two: a session can close on a thin note, and you
            // should see that here while you can still do something about it.
            state: !ok ? 'open' : deep ? 'complete' : 'thin note',
            ink: !ok ? MUTED : deep ? DARK : 'var(--color-accent-700)',
            up: setPages(r.id, 1), down: setPages(r.id, -1), setNotes: setNotes(r.id), type: typePages(r.id),
          };
        }),
        saveLog: () => this.setState({ saved: true }),
        saveLabel: s.saved ? 'Saved to Lists ✓' : 'Save entry',
        kpis: [
          { label: 'Today', value: Math.round((doneCount / Math.max(active.length, 1)) * 100) + '%', sub: doneCount + ' of ' + active.length + (excused.length ? ' · ' + excused.length + ' exc.' : '') },
          { label: 'Week', value: weekPct + '%', sub: 'week 38' },
          { label: 'Month', value: Math.round((PRIOR.reduce((a, b) => a + b, 0) + weekPct) / 6) + '%', sub: 'rolling 6 wk' },
        ],
        flag, pillars, streaks, report,
        verdictHead: weekPct >= 90 ? 'Strong week. ' + weekPct + '% overall.' : weekPct + '% — below the line.',
        verdictBody: 'Reading is ahead of target at ' + this.pagesWeek() + ' pages. The misses cluster on Monday — one late wake-up took exercise, a reading session and lights out with it. Fix Monday and this is a 100% week.',
        trend: PRIOR.concat([weekPct]).map((p, i) => ({
          pct: p + '%', wk: 'W' + (33 + i), h: Math.round((p / 100) * 74) + 'px',
          bg: i === 5 ? ACCENT : 'var(--color-accent-200)',
        })),
        settingRows: SCHED.map((h) => {
          const on = !s.off[h.id];
          return {
            key: h.id,
            title: h.title,
            measureShort: h.block + ' · ' + (h.type === 'program' ? 'Programme' : h.type === 'reading' ? 'Pages + notes' : h.type === 'time' ? 'Actual time' : 'Yes / No'),
            timeValue: hhmm(s.times[h.id] ?? h.min),
            setTime: (e) => {
              const parts = String(e.target.value || '').split(':');
              if (parts.length !== 2) return;
              const mins = (+parts[0]) * 60 + (+parts[1]);
              if (isNaN(mins)) return;
              this.setState((x) => ({ times: Object.assign({}, x.times, { [h.id]: mins }) }));
            },
            toggle: () => this.setState((x) => ({ off: Object.assign({}, x.off, { [h.id]: !x.off[h.id] }) })),
            opacity: on ? 1 : 0.45,
            switchBg: on ? ACCENT : 'transparent',
            switchAlign: on ? 'flex-end' : 'flex-start',
            knob: on ? '#f2f2f3' : 'var(--color-accent-600)',
          };
        }),
        targetRows: [
          { k: 'pages', label: 'Pages per session', value: s.targets.pages, step: 1 },
          { k: 'exercise', label: 'Exercise sessions / week', value: s.targets.exercise + ' ×', step: 1 },
          { k: 'family', label: 'Family blocks / week', value: s.targets.family + ' ×', step: 1 },
          // Floored at NOTE_MIN: a note that counts can never be easier to write
          // than one that merely closes the session.
          { k: 'noteDepth', label: 'Note length to count', value: s.targets.noteDepth + ' chars', step: 20, min: NOTE_MIN },
        ].map((t) => ({
          key: t.k,
          label: t.label, value: t.value,
          up: () => this.setState((x) => ({ targets: Object.assign({}, x.targets, { [t.k]: x.targets[t.k] + t.step }) })),
          down: () => this.setState((x) => ({ targets: Object.assign({}, x.targets, { [t.k]: Math.max(t.min ?? 1, x.targets[t.k] - t.step) }) })),
        })),
        resetDay: () => this.setState({
          log: {}, sets: {}, runKm: 0, actual: {}, focus: null, clock: 270, seen: {}, toast: null, saved: false, asked: [],
          reasons: {}, excusing: false, excusePanel: false,
          reading: { read_am: { pages: 0, notes: '' }, read_pm: { pages: 0, notes: '' } },
        }),
        coachLines: coachLines.map((l, i) => ({
          key: 'line-' + i,
          text: l.text,
          align: l.me ? 'flex-end' : 'flex-start',
          bg: l.me ? 'transparent' : DARK,
          ink: l.me ? 'var(--color-text)' : '#f2f2f3',
          border: l.me ? 'var(--color-accent-500)' : DARK,
        })),
        coachPrompts: askable.map((a, i) => ({
          key: 'prompt-' + i,
          label: a.label,
          ask: () => this.setState((x) => ({ asked: x.asked.indexOf(i) === -1 ? x.asked.concat([i]) : x.asked })),
        })),
      };
    },

    render() {
      patch(this.mount, [view(this.renderVals())]);
    },
  };

  const SETTINGS_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="21" y1="4" x2="14" y2="4"></line><line x1="10" y1="4" x2="3" y2="4"></line><line x1="21" y1="12" x2="12" y2="12"></line><line x1="8" y1="12" x2="3" y2="12"></line><line x1="21" y1="20" x2="16" y2="20"></line><line x1="12" y1="20" x2="3" y2="20"></line><line x1="14" y1="2" x2="14" y2="6"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="16" y1="18" x2="16" y2="22"></line></svg>';
  const corners = () => [
    el('i', { class: 'corner tl' }), el('i', { class: 'corner tr' }),
    el('i', { class: 'corner bl' }), el('i', { class: 'corner br' }),
  ];
  const KICKER = 'font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:var(--color-neutral-700)';

  function view(v) {
    return el('div', { style: 'min-height:100%;display:flex;flex-direction:column;background:var(--color-bg);font-family:var(--font-body);color:var(--color-text)' },

      el('div', { style: 'display:flex;align-items:center;gap:7px;padding:9px 12px 8px;border-bottom:1px solid var(--color-divider)' },
        el('span', { style: 'font-family:var(--font-heading);font-weight:700;font-size:17px;letter-spacing:-0.01em' }, 'CRAIG OS'),
        el('span', { style: 'font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--color-neutral-700)' }, 'Wed'),
        el('div', { style: 'margin-left:auto;display:flex;align-items:center;border:1px solid var(--color-divider)' },
          el('button', { onClick: v.clockBack, class: 'cos-nudge', 'aria-label': 'Back 15 minutes', style: 'appearance:none;background:none;border:0;width:28px;height:30px;cursor:pointer;color:var(--color-accent-700);font-family:var(--font-heading);font-size:16px;padding:0' }, '‹'),
          el('span', { style: 'font-family:var(--font-heading);font-size:15px;width:60px;text-align:center;color:var(--color-accent-900)' }, v.clockLabel),
          el('button', { onClick: v.clockFwd, class: 'cos-nudge', 'aria-label': 'Forward 15 minutes', style: 'appearance:none;background:none;border:0;width:28px;height:30px;cursor:pointer;color:var(--color-accent-700);font-family:var(--font-heading);font-size:16px;padding:0' }, '›')
        ),
        el('button', { onClick: v.goSettings, 'aria-label': 'Routine settings', style: 'appearance:none;background:none;border:1px solid var(--color-divider);width:30px;height:30px;display:grid;place-items:center;cursor:pointer;color:var(--color-accent-700);padding:0' },
          raw(SETTINGS_ICON)
        )
      ),

      v.toast && el('div', { key: 'toast', style: 'margin:10px 12px 0;background:var(--color-accent-900);color:#f2f2f3;padding:11px 12px;display:flex;align-items:center;gap:10px' },
        el('span', { style: 'font-family:var(--font-heading);font-size:15px;color:var(--color-accent-300)' }, v.toast.time),
        el('span', { style: 'font-size:14px;line-height:1.35;flex:1' }, v.toast.text),
        el('button', { onClick: v.dismissToast, 'aria-label': 'Dismiss', style: 'appearance:none;background:none;border:1px solid var(--color-accent-700);color:#f2f2f3;width:26px;height:26px;cursor:pointer;font-size:13px;padding:0' }, '×')
      ),

      el('div', { style: 'flex:1;padding:13px 12px;display:flex;flex-direction:column;gap:13px' },
        v.isToday && screenToday(v),
        v.isProgram && screenProgram(v),
        v.isLog && screenLog(v),
        v.isDash && screenDash(v),
        v.isReports && screenReports(v),
        v.isSettings && screenSettings(v),
        v.isCoach && screenCoach(v)
      ),

      el('div', { style: 'position:sticky;bottom:0;display:grid;grid-template-columns:repeat(5,1fr);border-top:1px solid var(--color-divider);background:var(--color-bg)' },
        v.tabs.map((tab) => el('button', {
          key: tab.label, onClick: tab.go, class: 'cos-tab',
          style: 'appearance:none;border:0;border-top:3px solid ' + tab.mark + ';background:none;cursor:pointer;padding:10px 2px 12px;font-family:var(--font-heading);font-size:13px;letter-spacing:0.07em;text-transform:uppercase;color:' + tab.ink,
        }, tab.label))
      )
    );
  }

  function screenToday(v) {
    const cur = v.cur;
    return el('div', { key: 's-today', style: 'display:flex;flex-direction:column;gap:13px' },
      el('div', { key: 'progress' },
        el('div', { style: 'display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px' },
          el('span', { style: KICKER }, 'Wed 16 Sep · ' + v.blockLabel),
          el('span', { style: 'font-family:var(--font-heading);font-size:15px' }, v.progressLabel)
        ),
        el('div', { style: 'height:6px;background:var(--color-neutral-200);display:flex' },
          el('div', { style: 'background:var(--color-accent);width:' + v.progressPct })
        )
      ),

      v.hasCurrent && [
        el('div', { key: 'cur-card', class: 'card blueprint', style: 'padding:15px;display:flex;flex-direction:column;gap:10px' },
          corners(),
          el('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
            el('span', { class: 'tag tag-outline', style: 'font-size:10px' }, cur.pillar),
            el('span', { style: 'font-family:var(--font-heading);font-size:14px;letter-spacing:0.06em;color:' + cur.stateInk }, cur.stateLabel)
          ),
          el('div', null,
            el('div', { style: 'font-family:var(--font-heading);font-size:38px;line-height:1;letter-spacing:-0.02em' }, cur.window),
            el('div', { style: 'font-family:var(--font-heading);font-size:25px;line-height:1.1;margin-top:2px' }, cur.title)
          ),
          el('div', { style: 'font-size:14px;color:var(--color-neutral-800);border-top:1px solid var(--color-divider);padding-top:8px' }, cur.measure),

          cur.isProgram && el('div', { key: 'sec-program', style: 'display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--color-divider);padding-top:9px' },
            el('div', { style: 'display:flex;justify-content:space-between;font-size:14px' },
              el('span', null, v.programName),
              el('span', { style: 'font-family:var(--font-heading);color:var(--color-accent-800)' }, v.programProgress)
            ),
            el('button', { onClick: v.goProgram, class: 'btn btn-secondary', style: 'height:44px;font-size:14px' }, 'Open programme')
          ),

          cur.isReading && el('div', { key: 'sec-reading', style: 'display:flex;flex-direction:column;gap:10px;border-top:1px solid var(--color-divider);padding-top:9px' },
            el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:10px' },
              el('span', { style: 'font-size:14px' }, 'Pages read'),
              el('div', { style: 'display:flex;align-items:center;gap:8px' },
                el('button', { onClick: v.pagesDown, class: 'btn btn-secondary', style: 'width:44px;height:44px;font-size:18px' }, '–'),
                el('input', { type: 'text', inputMode: 'numeric', 'aria-label': 'Pages read', class: 'input', value: v.pages, onInput: v.typePages, style: 'width:62px;height:44px;text-align:center;font-family:var(--font-heading);font-size:24px;padding:0' }),
                el('button', { onClick: v.pagesUp, class: 'btn btn-secondary', style: 'width:44px;height:44px;font-size:18px' }, '+')
              )
            ),
            el('div', { class: 'field' },
              el('label', { htmlFor: 'cos-notes' }, 'Notes — required to close reading'),
              el('textarea', { id: 'cos-notes', key: v.readKey, rows: 4, class: 'input', value: v.notes, onInput: v.setNotes, placeholder: 'What will you actually use from those pages?', style: 'resize:none;font-family:var(--font-body);font-size:14px;line-height:1.45' })
            )
          ),

          cur.isTime && el('div', { key: 'sec-time', style: 'display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid var(--color-divider);padding-top:9px' },
            el('span', { style: 'font-size:14px' }, cur.timeLabel),
            el('div', { style: 'display:flex;align-items:center;gap:8px' },
              el('button', { onClick: v.actualDown, class: 'btn btn-secondary', style: 'width:44px;height:44px;font-size:18px' }, '–'),
              el('span', { style: 'font-family:var(--font-heading);font-size:24px;width:78px;text-align:center' }, v.actualTime),
              el('button', { onClick: v.actualUp, class: 'btn btn-secondary', style: 'width:44px;height:44px;font-size:18px' }, '+')
            )
          ),

          el('div', { key: 'sec-coach', style: 'font-size:14px;line-height:1.4;color:var(--color-accent-800)' }, cur.coach)
        ),

        cur.isLogged && el('div', { key: 'cur-logged', style: 'display:flex;gap:8px' },
          el('div', { class: 'card blueprint', style: 'flex:1;padding:12px 14px;display:flex;align-items:center' },
            corners(),
            el('span', { style: 'font-family:var(--font-heading);font-size:16px;color:' + cur.stateInk }, cur.loggedLabel)
          ),
          el('button', { onClick: v.undo, class: 'btn btn-secondary', style: 'width:112px;height:48px;font-size:15px' }, 'Undo')
        ),

        cur.isOpen && el('div', { key: 'cur-open', style: 'display:flex;flex-direction:column;gap:7px' },
          el('div', { key: 'actions', style: 'display:flex;gap:8px' },
            el('button', { onClick: v.markDone, class: 'btn btn-primary blueprint', style: 'flex:1;height:48px;font-size:15px;opacity:' + cur.doneOpacity + ';pointer-events:' + cur.donePointer },
              corners(),
              cur.doneLabel
            ),
            el('button', { onClick: v.markMissed, class: 'btn btn-secondary', style: 'width:112px;height:48px;font-size:15px' }, 'Missed')
          ),
          cur.blocked && el('div', { key: 'blocked', style: 'font-size:13px;color:var(--color-neutral-700)' }, cur.blockedWhy),
          v.excusing && el('div', { key: 'excuse-panel', style: 'display:flex;flex-direction:column;gap:7px;border-top:1px solid var(--color-divider);padding-top:9px' },
            el('div', { style: 'font-size:13px;color:var(--color-neutral-700)' }, 'Why is it not applicable? Excused blocks come out of the target — no penalty.'),
            el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' },
              v.reasonChips.map((rc) => el('button', { key: rc.label, onClick: rc.pick, class: 'btn btn-secondary', style: 'height:44px;font-size:14px' }, rc.label))
            ),
            el('div', { style: 'display:flex;flex-direction:column;gap:5px' },
              v.excuseBlocks.map((eb) => el('button', { key: eb.label, onClick: eb.run, class: 'btn btn-ghost', style: 'height:40px;font-size:13px;justify-content:flex-start;padding-left:0' }, eb.label))
            ),
            el('button', { onClick: v.closeExcuse, class: 'btn btn-ghost', style: 'height:36px;font-size:13px;align-self:flex-start;padding-left:0' }, 'Cancel')
          ),
          v.notExcusing && el('button', { key: 'excuse-open', onClick: v.openExcuse, class: 'btn btn-ghost', style: 'height:40px;font-size:13px;align-self:flex-start;padding-left:0' }, 'Not applicable today — excuse it')
        ),
      ],

      v.dayClosed && el('div', { key: 'day-closed', class: 'card blueprint', style: 'padding:15px;display:flex;flex-direction:column;gap:8px' },
        corners(),
        el('div', { class: 'card-kicker' }, 'Day closed'),
        el('div', { style: 'font-family:var(--font-heading);font-size:23px;line-height:1.1' }, v.closeHead),
        el('div', { style: 'font-size:14px;line-height:1.45;color:var(--color-neutral-800)' }, v.closeBody),
        el('button', { onClick: v.goDash, class: 'btn btn-secondary', style: 'height:44px;font-size:14px;align-self:flex-start' }, 'Open dashboard')
      ),

      el('div', { key: 'groups', style: 'display:flex;flex-direction:column;gap:2px' },
        v.groups.map((g) => [
          el('div', { key: g.name + '-head', style: 'display:flex;justify-content:space-between;align-items:baseline;margin:8px 0 3px' },
            el('span', { style: KICKER }, g.name),
            el('span', { style: 'font-family:var(--font-heading);font-size:13px;color:var(--color-accent-700)' }, g.count)
          ),
          el('div', { key: g.name + '-rows', style: 'display:flex;flex-direction:column' },
            g.rows.map((r) => el('button', {
              key: r.id, onClick: r.jump, class: 'cos-row',
              style: 'appearance:none;border:0;border-top:1px solid var(--color-divider);background:' + r.bg + ';cursor:pointer;display:flex;gap:9px;align-items:center;padding:8px 5px;text-align:left;font-family:var(--font-body);min-height:44px',
            },
              el('span', { style: 'width:9px;height:9px;flex:0 0 auto;background:' + r.dot + ';border:1px solid ' + r.dotBorder }),
              el('span', { style: 'font-family:var(--font-heading);font-size:14px;width:50px;color:var(--color-accent-700)' }, r.time),
              el('span', { style: 'font-size:14px;flex:1;color:' + r.ink }, r.title),
              el('span', { style: 'font-size:12px;color:var(--color-neutral-600)' }, r.note)
            ))
          ),
        ])
      )
    );
  }

  function screenProgram(v) {
    return el('div', { key: 's-program', style: 'display:flex;flex-direction:column;gap:12px' },
      el('div', { style: 'display:flex;align-items:baseline;gap:8px' },
        el('button', { onClick: v.goToday, class: 'btn btn-ghost', style: 'height:36px;font-size:13px;padding-left:0' }, '← Today'),
        el('span', { style: 'margin-left:auto;font-family:var(--font-heading);font-size:15px;color:var(--color-accent-800)' }, v.programProgress)
      ),
      el('div', null,
        el('div', { class: 'card-kicker' }, 'Wednesday · Abs / Arms / Back'),
        el('div', { style: 'font-family:var(--font-heading);font-size:27px;line-height:1.05' }, v.programName)
      ),
      el('div', { class: 'card blueprint', style: 'padding:12px;display:flex;align-items:center;justify-content:space-between;gap:10px' },
        corners(),
        el('span', { style: 'display:flex;flex-direction:column' },
          el('span', { style: 'font-size:14px' }, '10 min Run — 6, 6, 12, 14'),
          el('span', { style: 'font-size:12px;color:var(--color-neutral-600)' }, 'Warm-up, distance in km')
        ),
        el('span', { style: 'display:flex;align-items:center;gap:8px' },
          el('button', { onClick: v.runDown, class: 'btn btn-secondary', style: 'width:36px;height:36px;font-size:15px' }, '–'),
          el('input', { type: 'text', inputMode: 'decimal', 'aria-label': 'Run distance in km', class: 'input', value: v.runKm, onInput: v.typeRun, style: 'width:54px;height:36px;text-align:center;font-family:var(--font-heading);font-size:18px;padding:0' }),
          el('span', { style: 'font-size:12px;color:var(--color-neutral-700)' }, 'km'),
          el('button', { onClick: v.runUp, class: 'btn btn-secondary', style: 'width:36px;height:36px;font-size:15px' }, '+')
        )
      ),

      el('div', { style: 'display:flex;flex-direction:column' },
        v.exercises.map((e) => el('div', { key: e.key, style: 'display:flex;align-items:center;gap:8px;padding:8px 2px;border-top:1px solid var(--color-divider);background:' + e.bg },
          el('button', { onClick: e.toggle, 'aria-label': 'Tick exercise', style: 'appearance:none;cursor:pointer;width:26px;height:26px;flex:0 0 auto;padding:0;border:1px solid var(--color-accent-600);background:' + e.tickBg + ';color:#f2f2f3;font-size:14px;line-height:1' }, e.tick),
          el('span', { style: 'display:flex;flex-direction:column;flex:1;min-width:0' },
            el('span', { style: 'font-size:14px;line-height:1.2' }, e.name),
            el('span', { style: 'font-size:12px;color:var(--color-neutral-600)' }, e.target)
          ),
          el('span', { style: 'display:flex;align-items:center;gap:6px' },
            el('button', { onClick: e.down, class: 'btn btn-secondary', style: 'width:32px;height:32px;font-size:15px' }, '–'),
            el('input', { type: 'text', inputMode: 'numeric', 'aria-label': 'Actual', class: 'input', value: e.actual, onInput: e.type, placeholder: '–', style: 'width:46px;height:36px;text-align:center;font-family:var(--font-heading);font-size:18px;padding:0;color:' + e.ink }),
            el('button', { onClick: e.up, class: 'btn btn-secondary', style: 'width:32px;height:32px;font-size:15px' }, '+')
          )
        ))
      ),

      el('div', { class: 'card blueprint', style: 'padding:12px;display:flex;justify-content:space-between;align-items:baseline' },
        corners(),
        el('span', { style: 'font-size:13px;color:var(--color-neutral-700)' }, 'Reps logged vs programme'),
        el('span', { style: 'font-family:var(--font-heading);font-size:22px' }, v.volumeLabel)
      ),
      el('button', { onClick: v.finishProgram, class: 'btn btn-primary blueprint', style: 'height:48px;font-size:15px' },
        corners(),
        'Finish session'
      )
    );
  }

  function screenLog(v) {
    return el('div', { key: 's-log', style: 'display:flex;flex-direction:column;gap:13px' },
      el('div', { style: 'font-family:var(--font-heading);font-size:27px;line-height:1' }, 'Log entry'),
      el('div', { style: KICKER }, 'Health metrics'),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:9px' },
        v.metrics.map((m) => el('div', { key: m.key, class: 'card blueprint', style: 'padding:11px' },
          corners(),
          el('div', { class: 'card-kicker' }, m.label),
          el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:2px' },
            el('span', { style: 'display:flex;align-items:baseline;gap:4px;min-width:0' },
              el('input', { type: 'text', inputMode: 'decimal', 'aria-label': m.label, class: 'input', value: m.value, onInput: m.type, readOnly: m.readOnly, style: 'width:56px;height:34px;text-align:center;font-family:var(--font-heading);font-size:19px;padding:0' }),
              el('span', { style: 'font-size:12px;color:var(--color-neutral-700)' }, m.unit)
            ),
            el('span', { style: 'display:flex;gap:4px' },
              el('button', { onClick: m.down, class: 'btn btn-secondary', style: 'width:31px;height:31px;font-size:15px' }, '–'),
              el('button', { onClick: m.up, class: 'btn btn-secondary', style: 'width:31px;height:31px;font-size:15px' }, '+')
            )
          )
        ))
      ),

      el('div', { style: KICKER }, 'Reading sessions'),
      v.readingCards.map((rc) => el('div', { key: rc.key, class: 'card blueprint', style: 'padding:12px;display:flex;flex-direction:column;gap:9px' },
        corners(),
        el('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
          el('span', { class: 'card-kicker' }, rc.label),
          el('span', { style: 'font-size:12px;color:' + rc.ink + ';font-family:var(--font-heading);font-size:13px' }, rc.state)
        ),
        el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:10px' },
          el('span', { style: 'font-size:14px' }, 'Pages'),
          el('span', { style: 'display:flex;align-items:center;gap:8px' },
            el('button', { onClick: rc.down, class: 'btn btn-secondary', style: 'width:40px;height:40px;font-size:17px' }, '–'),
            el('input', { type: 'text', inputMode: 'numeric', 'aria-label': 'Pages', class: 'input', value: rc.pages, onInput: rc.type, style: 'width:58px;height:40px;text-align:center;font-family:var(--font-heading);font-size:22px;padding:0' }),
            el('button', { onClick: rc.up, class: 'btn btn-secondary', style: 'width:40px;height:40px;font-size:17px' }, '+')
          )
        ),
        el('div', { class: 'field' },
          el('label', { htmlFor: rc.inputId }, 'Notes'),
          el('textarea', { id: rc.inputId, class: 'input', rows: 3, value: rc.notes, onInput: rc.setNotes, placeholder: 'Key learnings, insights, decisions.', style: 'resize:none;font-family:var(--font-body);font-size:14px;line-height:1.45' })
        )
      )),
      el('button', { onClick: v.saveLog, class: 'btn btn-primary blueprint', style: 'height:48px;font-size:15px' },
        corners(),
        v.saveLabel
      ),
      el('div', { style: 'font-size:12px;color:var(--color-neutral-600)' }, 'Phase 1 writes these rows to a Microsoft List via Power Automate.')
    );
  }

  function screenDash(v) {
    return el('div', { key: 's-dash', style: 'display:flex;flex-direction:column;gap:13px' },
      el('div', { style: 'font-family:var(--font-heading);font-size:27px;line-height:1' }, 'Dashboard'),
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px' },
        v.kpis.map((k) => el('div', { key: k.label, class: 'card blueprint', style: 'padding:11px 9px' },
          corners(),
          el('div', { class: 'card-kicker' }, k.label),
          el('div', { style: 'font-family:var(--font-heading);font-size:29px;line-height:1' }, k.value),
          el('div', { style: 'font-size:11px;color:var(--color-neutral-600)' }, k.sub)
        ))
      ),

      v.flag && el('div', { style: 'background:var(--color-accent-900);color:#f2f2f3;padding:13px;display:flex;flex-direction:column;gap:5px' },
        el('div', { style: 'font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:var(--color-accent-300)' }, v.flag.kicker),
        el('div', { style: 'font-family:var(--font-heading);font-size:21px;line-height:1.1' }, v.flag.title),
        el('div', { style: 'font-size:14px;line-height:1.4;color:#dfe7ef' }, v.flag.body)
      ),

      el('div', { style: KICKER }, 'Pillar completion — this week'),
      el('div', { style: 'display:flex;flex-direction:column' },
        v.pillars.map((p) => el('div', { key: p.name, style: 'display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--color-divider)' },
          el('span', { style: 'font-size:14px;width:74px' }, p.name),
          el('span', { style: 'flex:1;height:10px;background:var(--color-neutral-200);display:flex' },
            el('span', { style: 'background:' + p.fill + ';width:' + p.pct })
          ),
          el('span', { style: 'font-family:var(--font-heading);font-size:16px;width:44px;text-align:right' }, p.pct)
        ))
      ),

      el('div', { style: KICKER }, 'Streaks — last 7 days'),
      el('div', { style: 'display:flex;flex-direction:column' },
        v.streaks.map((s) => el('div', { key: s.name, style: 'display:flex;align-items:center;gap:9px;padding:9px 0;border-top:1px solid var(--color-divider)' },
          el('span', { style: 'font-size:14px;flex:1' }, s.name),
          el('span', { style: 'display:flex;gap:3px' },
            s.days.map((d, i) => el('span', { key: i, style: 'width:11px;height:16px;background:' + d.bg + ';border:1px solid ' + d.border }))
          ),
          el('span', { style: 'font-family:var(--font-heading);font-size:16px;width:58px;text-align:right;color:' + s.ink }, s.label)
        ))
      )
    );
  }

  function screenReports(v) {
    return el('div', { key: 's-reports', style: 'display:flex;flex-direction:column;gap:13px' },
      el('div', { style: 'font-family:var(--font-heading);font-size:27px;line-height:1' }, 'Week 38 report'),
      el('div', { class: 'card blueprint', style: 'padding:13px;display:flex;flex-direction:column;gap:6px' },
        corners(),
        el('div', { class: 'card-kicker' }, 'Verdict'),
        el('div', { style: 'font-family:var(--font-heading);font-size:20px;line-height:1.15' }, v.verdictHead),
        el('div', { style: 'font-size:14px;line-height:1.45;color:var(--color-neutral-800)' }, v.verdictBody)
      ),

      el('table', { class: 'table', style: 'font-size:13px' },
        el('thead', null,
          el('tr', null,
            el('th', { style: 'text-align:left' }, 'Habit'),
            el('th', null, 'Target'),
            el('th', null, 'Actual'),
            el('th', null, '%')
          )
        ),
        el('tbody', null,
          v.report.map((r) => el('tr', { key: r.habit },
            el('td', { style: 'text-align:left' }, r.habit),
            el('td', { style: 'text-align:center;color:var(--color-neutral-700)' }, r.target),
            el('td', { style: 'text-align:center' }, r.actual),
            el('td', { style: 'text-align:right;font-family:var(--font-heading);font-size:15px;color:' + r.ink }, r.pct)
          ))
        )
      ),

      v.excusedNote && el('div', { style: 'font-size:12px;line-height:1.45;color:var(--color-accent-800);border-left:2px solid var(--color-accent-500);padding-left:9px' }, v.excusedNote),

      el('div', { style: KICKER }, 'Completion trend — 6 weeks'),
      el('div', { class: 'card blueprint', style: 'padding:13px 11px 9px' },
        corners(),
        el('div', { style: 'display:flex;align-items:flex-end;gap:9px;height:110px' },
          v.trend.map((t) => el('div', { key: t.wk, style: 'flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;justify-content:flex-end' },
            el('span', { style: 'font-family:var(--font-heading);font-size:12px;color:var(--color-neutral-700)' }, t.pct),
            el('span', { style: 'width:100%;height:' + t.h + ';background:' + t.bg + ';border:1px solid var(--color-accent-700)' }),
            el('span', { style: 'font-size:11px;color:var(--color-neutral-600)' }, t.wk)
          ))
        )
      ),
      el('div', { style: 'font-size:12px;color:var(--color-neutral-600)' }, 'Power BI mirrors this view on desktop.')
    );
  }

  function screenSettings(v) {
    return el('div', { key: 's-settings', style: 'display:flex;flex-direction:column;gap:13px' },
      el('div', { style: 'font-family:var(--font-heading);font-size:27px;line-height:1' }, 'Routine & targets'),
      el('div', { style: KICKER }, 'Schedule — from your timesheet'),
      el('div', { style: 'display:flex;flex-direction:column' },
        v.settingRows.map((h) => el('div', { key: h.key, style: 'display:flex;align-items:center;gap:8px;padding:8px 2px;border-top:1px solid var(--color-divider);opacity:' + h.opacity },
          el('input', { type: 'time', class: 'input', value: h.timeValue, onInput: h.setTime, onChange: h.setTime, style: 'width:100px;font-family:var(--font-heading);font-size:14px;padding:5px 7px' }),
          el('span', { style: 'display:flex;flex-direction:column;flex:1;min-width:0' },
            el('span', { style: 'font-size:14px' }, h.title),
            el('span', { style: 'font-size:12px;color:var(--color-neutral-600)' }, h.measureShort)
          ),
          el('button', { onClick: h.toggle, 'aria-label': 'Toggle habit', style: 'appearance:none;cursor:pointer;background:' + h.switchBg + ';border:1px solid var(--color-accent-600);width:50px;height:28px;padding:2px;display:flex;justify-content:' + h.switchAlign },
            el('span', { style: 'width:21px;height:100%;background:' + h.knob })
          )
        ))
      ),

      el('div', { style: KICKER }, 'Weekly targets'),
      el('div', { style: 'display:flex;flex-direction:column' },
        v.targetRows.map((t) => el('div', { key: t.key, style: 'display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 2px;border-top:1px solid var(--color-divider)' },
          el('span', { style: 'font-size:14px;flex:1' }, t.label),
          el('span', { style: 'display:flex;align-items:center;gap:8px' },
            el('button', { onClick: t.down, class: 'btn btn-secondary', style: 'width:35px;height:35px;font-size:16px' }, '–'),
            el('span', { style: 'font-family:var(--font-heading);font-size:18px;min-width:64px;text-align:center' }, t.value),
            el('button', { onClick: t.up, class: 'btn btn-secondary', style: 'width:35px;height:35px;font-size:16px' }, '+')
          )
        ))
      ),

      el('div', { style: KICKER }, 'Pillars'),
      el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' },
        el('span', { class: 'tag tag-accent' }, 'Health'),
        el('span', { class: 'tag tag-accent' }, 'Learning'),
        el('span', { class: 'tag tag-accent' }, 'Business'),
        el('span', { class: 'tag tag-accent' }, 'Family')
      ),
      el('button', { onClick: v.resetDay, class: 'btn btn-ghost', style: 'height:44px;font-size:14px;align-self:flex-start;padding-left:0' }, 'Reset today & clock')
    );
  }

  function screenCoach(v) {
    return el('div', { key: 's-coach', style: 'display:flex;flex-direction:column;gap:13px' },
      el('div', { style: 'display:flex;align-items:baseline;gap:8px' },
        el('span', { style: 'font-family:var(--font-heading);font-size:27px;line-height:1' }, 'Coach'),
        el('span', { class: 'tag tag-outline', style: 'font-size:10px' }, 'Phase 2 · Copilot agent')
      ),
      el('div', { style: 'display:flex;flex-direction:column;gap:9px' },
        v.coachLines.map((c) => el('div', { key: c.key, style: 'align-self:' + c.align + ';max-width:88%;background:' + c.bg + ';color:' + c.ink + ';border:1px solid ' + c.border + ';padding:10px 12px;font-size:14px;line-height:1.45' }, c.text))
      ),
      el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' },
        v.coachPrompts.map((p) => el('button', { key: p.key, onClick: p.ask, class: 'btn btn-secondary', style: 'height:40px;font-size:13px' }, p.label))
      ),
      el('div', { style: 'font-size:12px;color:var(--color-neutral-600);line-height:1.45' }, 'Scripted answers reading your live numbers — the real agent sits on the same list once there is history worth coaching against.')
    );
  }

  // ── mount ──────────────────────────────────────────────────────────────
  Component.mount = document.getElementById('cos-app');
  Component.render();
  Component.componentDidMount();
})();
