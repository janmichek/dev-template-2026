(ns diagram-page
  "Write the paper diagram-diff page: before, after, click a box to isolate arrows."
  (:require [clojure.edn :as edn]
            [clojure.string :as str])
  (:gen-class))

(defn- xml [s]
  (-> (str s)
      (str/replace "&" "&amp;")
      (str/replace "<" "&lt;")
      (str/replace ">" "&gt;")
      (str/replace "\"" "&quot;")))

(defn- json-escape [s]
  (-> (str s)
      (str/replace "\\" "\\\\")
      (str/replace "\"" "\\\"")
      (str/replace "\n" "\\n")))

(defn- json [x]
  (cond
    (nil? x) "null"
    (true? x) "true"
    (false? x) "false"
    (string? x) (str "\"" (json-escape x) "\"")
    (number? x) (str x)
    (keyword? x) (json (name x))
    (map? x) (str "{" (str/join "," (map (fn [[k v]]
                                           (str (json (name k)) ":" (json v)))
                                         x)) "}")
    (sequential? x) (str "[" (str/join "," (map json x)) "]")
    :else (json (str x))))

(defn- short-sha [s]
  (let [s (or s "")]
    (if (> (count s) 7) (subs s 0 7) s)))

(defn- kid [id]
  (let [parts (str/split (name id) #"\.")]
    {:seg (first parts)
     :grouped (> (count parts) 1)}))

(defn- listed-ranks
  "Policy `:levels` is inner-first. The group's index is the band."
  [doc]
  (into {}
        (mapcat (fn [i group]
                  (map (fn [seg] [(keyword (name seg)) i]) group))
                (range)
                (:levels doc))))

(defn- topo-ranks
  "Level 0 is innermost. A module sits one step outside the modules it depends on."
  [classes edges]
  (let [ids (set (map :id (remove :foreign classes)))
        outs (reduce (fn [m e]
                       (if (and (ids (:from e)) (ids (:to e)))
                         (update m (:from e) (fnil conj #{}) (:to e))
                         m))
                     {}
                     edges)]
    (letfn [(rank [id seen]
              (if (seen id)
                0
                (let [deps (get outs id)]
                  (if (empty? deps)
                    0
                    (inc (apply max (map #(rank % (conj seen id)) deps)))))))]
      (into {} (map (fn [id] [id (rank id #{})]) ids)))))

(defn- ranks
  "A listed segment uses the policy band. Anything else keeps the dependency rank."
  [level-doc classes edges]
  (let [listed (listed-ranks level-doc)
        topo (topo-ranks classes edges)
        seg (fn [id] (keyword (first (str/split (name id) #"\."))))]
    (into {}
          (map (fn [c]
                 (let [id (:id c)]
                   [id (or (get listed (seg id)) (get topo id 0))]))
               (remove :foreign classes)))))

(defn- class-view [c level change]
  (let [{:keys [seg grouped]} (kid (:id c))
        ops (mapv :name (:ops c))
        iface? (= :interface (:stereotype c))]
    (cond-> {:id (name (:id c))
             :name (or (:name c) (name (:id c)))
             :level (or level 0)
             :ops ops
             :change (name change)}
      (:file c) (assoc :file (:file c))
      grouped (assoc :group seg)
      iface? (assoc :stereotype "interface")
      (:foreign c) (assoc :foreign true)
      (and (not (:foreign c)) (not iface?) (empty? ops))
      (assoc :note "script, no exports"))))

(defn- edge-view [e violating?]
  (cond-> {:from (name (:from e))
           :to (name (:to e))
           :kind (name (or (:kind e) :dependency))}
    violating? (assoc :violating true)))

(defn- violating? [e levels]
  (let [from (get levels (:from e))
        to (get levels (:to e))]
    (and from to (< from to) (not= :implements (:kind e)))))

(defn- views [doc level-doc change-of]
  (let [classes (vec (:classes doc))
        edges (vec (:edges doc))
        levels (ranks level-doc classes edges)]
    {:classes (mapv (fn [c]
                      (class-view c
                                  (get levels (:id c) 0)
                                  (if (:foreign c) :foreign (change-of (:id c)))))
                    classes)
     :edges (mapv (fn [e] (edge-view e (violating? e levels))) edges)}))

(defn- edge-key [e]
  [(name (:from e)) (name (:to e)) (name (or (:kind e) :dependency))])

(defn- diff [before after]
  (let [old-ids (set (map :id (remove :foreign (:classes before))))
        new-ids (set (map :id (remove :foreign (:classes after))))
        change (fn [id]
                 (cond
                   (and (old-ids id) (new-ids id)) :unchanged
                   (new-ids id) :added
                   :else :removed))
        before-v (views before after (fn [id] (if (new-ids id) :unchanged :removed)))
        after-v (views after after change)
        old-edges (set (map edge-key (:edges before)))
        new-edges (set (map edge-key (:edges after)))]
    {:before (:classes before-v)
     :before-edges (:edges before-v)
     :after (:classes after-v)
     :after-edges (mapv (fn [e]
                          (assoc e :change (if (old-edges (edge-key e)) "unchanged" "added")))
                        (:edges after-v))
     :added (count (remove old-ids new-ids))
     :removed (count (remove new-ids old-ids))
     :unchanged (count (filter old-ids new-ids))
     :edges-added (count (remove old-edges new-edges))
     :violations (count (filter :violating (:edges after-v)))}))

(defn- page [{:keys [title after-ref after-sha before-ref before-sha diff order lang]}]
  (str "<!DOCTYPE html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\">
<title>" (xml title) " code review — " (xml after-ref) "</title>
<style>
  :root {
    --ink: #1c1915;
    --muted: #5c564c;
    --line: #c8c0b2;
    --paper: #f4f0e6;
    --card: #fffdf8;
    --added: #1f7a4d;
    --added-bg: #e7f6ee;
    --impl: #5b4b8a;
    --foreign: #6d6458;
    --bad: #a33b32;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--paper);
    color: var(--ink);
    font: 14px/1.45 \"Iowan Old Style\", Palatino, \"Palatino Linotype\", serif;
  }
  header.top {
    padding: 22px 28px 16px;
    border-bottom: 1px solid var(--line);
    background: #fffdf8;
  }
  h1 { margin: 0 0 4px; font-size: 22px; font-weight: 600; letter-spacing: -0.02em; }
  .sub { color: var(--muted); margin: 0; }
  .sub code, .meta code { font-family: ui-monospace, \"SF Mono\", Menlo, monospace; font-size: 12px; }
  .stats {
    display: flex; gap: 18px; flex-wrap: wrap;
    margin-top: 14px; padding: 0; list-style: none;
  }
  .stats li {
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 8px 12px;
    min-width: 108px;
  }
  .stats b { display: block; font-size: 18px; font-variant-numeric: tabular-nums; }
  .stats span { color: var(--muted); font-size: 12px; }
  .stats .good b { color: var(--added); }
  .stats .bad b { color: var(--bad); }
  main { padding: 18px 28px 40px; }
  .split { display: grid; grid-template-columns: minmax(220px, 34%) 1fr; gap: 16px; align-items: start; }
  .before, .after {
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 12px;
    min-height: 280px;
  }
  .pane-h {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 10px 14px;
    border-bottom: 1px solid var(--line);
    font-size: 13px;
  }
  .pane-h strong { font-size: 14px; }
  .empty {
    margin: 16px;
    border: 1px dashed var(--line);
    border-radius: 10px;
    min-height: 560px;
    display: flex; align-items: center; justify-content: center;
    text-align: center; color: var(--muted); padding: 16px;
  }
  .stage { position: relative; padding: 8px 8px 12px 44px; }
  svg.wires { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; }
  .chart { display: grid; grid-template-columns: minmax(0, 1fr) 120px; }
  .bands { padding: 12px 36px 8px 4px; }
  .side {
    display: flex; flex-direction: column; justify-content: space-between;
    align-items: center; padding: 64px 0 36px;
  }
  .band { margin: 0 0 52px; }
  .band:last-child { margin-bottom: 8px; padding-bottom: 28px; }
  .band-label { color: var(--muted); font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; margin: 0 0 14px; }
  .row { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-start; }
  .box, .oval {
    background: var(--card);
    border: 1px solid #2c2824;
    border-left: 4px solid #2c2824;
    border-radius: 4px;
    min-width: 168px;
    position: relative;
    cursor: pointer;
  }
  .box.added { border-left-color: var(--added); }
  .box.removed { border-left-color: var(--bad); }
  .box.hot, .oval.hot { outline: 2px solid var(--added); }
  .box header, .oval header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 4px 8px 0; font-size: 10px; color: var(--muted);
    font-family: ui-monospace, Menlo, monospace;
  }
  .box h2, .oval h2 { margin: 0; padding: 2px 8px 4px; font-size: 15px; font-weight: 600; }
  .box .file { margin: 0; padding: 0 8px 6px; color: var(--muted); font-size: 11px; font-family: ui-monospace, Menlo, monospace; }
  .box ul { list-style: none; margin: 0; padding: 4px 8px 6px; border-top: 1px solid var(--line); }
  .box li { font-family: ui-monospace, Menlo, monospace; font-size: 12px; }
  .box .none { color: var(--muted); font-style: italic; }
  .iface h2 { font-style: italic; font-weight: 500; }
  .mark {
    display: inline-block; margin-left: 6px; font-style: normal;
    border: 1px solid #2c2824; border-radius: 2px; padding: 0 4px; font-size: 11px;
  }
  .pkg {
    border: 1px solid #2c2824;
    border-radius: 6px;
    padding: 6px 8px 8px;
    background: #f7f4ee;
  }
  .pkg > span {
    display: block; font-style: italic; font-size: 12px; color: var(--muted); margin-bottom: 6px;
  }
  .pkg .stack { display: flex; flex-direction: column; gap: 8px; }
  .oval {
    border-radius: 999px;
    border-left-width: 1px;
    min-width: 88px;
    text-align: center;
    background: #f3f1ec;
  }
  .oval h2 { font-weight: 500; font-style: italic; }
  .pill {
    background: var(--added-bg); color: var(--added);
    border-radius: 999px; padding: 1px 6px; font-style: normal; font-size: 10px;
  }
  .pill.foreign { background: #f3f1ec; color: var(--foreign); }
  .pill.bad { background: #fdeceb; color: var(--bad); }
  section.detail { margin-top: 16px; }
  section.detail h2 { font-size: 16px; margin: 0 0 8px; }
  table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
  th, td { text-align: left; padding: 7px 10px; border-bottom: 1px solid var(--line); font-size: 13px; }
  th { color: var(--muted); font-weight: 600; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; }
  tr:last-child td { border-bottom: 0; }
  tr.off { opacity: 0.28; }
  td.mono, .mono { font-family: ui-monospace, Menlo, monospace; font-size: 12px; }
  .tag-add { color: var(--added); font-weight: 600; }
  .tag-same { color: var(--muted); }
  .tag-impl { color: var(--impl); }
  .tag-bad { color: var(--bad); font-weight: 600; }
  .note { color: var(--muted); font-size: 13px; max-width: 78ch; }
  path.wire { fill: none; stroke: var(--added); stroke-width: 1.4; }
  path.wire.same { stroke: #6d6458; }
  path.wire.impl { stroke: var(--impl); }
  path.wire.bad { stroke: var(--bad); }
  path.wire.dim { opacity: 0.12; }
  path.wire.hot { stroke-width: 2.4; }
</style>
</head>
<body>
<header class=\"top\">
  <h1>" (xml title) " · diagram diff</h1>
  <p class=\"sub\">Branch <code>" (xml after-ref) "</code> at <code>" (xml after-sha) "</code> against <code>" (xml before-ref) "</code> at <code>" (xml before-sha) "</code>. Chart from the " (xml lang) " scanner. Level 0 sits at the bottom. A dependency that pointed outward would be red.</p>
  <ul class=\"stats\">
    <li class=\"" (if (pos? (:added diff)) "good" "") "\"><b>" (:added diff) "</b><span>modules added</span></li>
    <li><b>" (:removed diff) "</b><span>removed</span></li>
    <li><b>" (:unchanged diff) "</b><span>unchanged</span></li>
    <li class=\"" (if (pos? (:edges-added diff)) "good" "") "\"><b>" (:edges-added diff) "</b><span>edges added</span></li>
    <li class=\"" (if (pos? (:violations diff)) "bad" "") "\"><b>" (:violations diff) "</b><span>dependency violations</span></li>
  </ul>
</header>
<main>
  <div class=\"split\">
    <div class=\"before\">
      <div class=\"pane-h\"><strong>" (xml before-ref) "</strong><span>before</span></div>
      <div id=\"before-host\"></div>
    </div>
    <div class=\"after\">
      <div class=\"pane-h\"><strong>" (xml after-ref) "</strong><span id=\"after-hint\">after</span></div>
      <div class=\"stage\" id=\"stage\">
        <svg class=\"wires\"></svg>
        <div class=\"chart\">
          <div class=\"bands\"></div>
          <div class=\"side\"></div>
        </div>
      </div>
    </div>
  </div>
  <section class=\"detail\">
    <h2>Edges on this branch</h2>
    <p class=\"note\" id=\"filter-note\">Click a box to isolate its arrows. Click again to show all. Tests and docs are not modules, so they are not on the chart.</p>
    <table>
      <thead><tr><th>Change</th><th>From</th><th>To</th><th>Kind</th></tr></thead>
      <tbody id=\"edges\"></tbody>
    </table>
  </section>
</main>
<script>
const order = " (json order) ";
const beforeRef = " (json before-ref) ";
const beforeClasses = " (json (:before diff)) ";
const beforeEdges = " (json (:before-edges diff)) ";
const afterClasses = " (json (:after diff)) ";
const afterEdges = " (json (:after-edges diff)) ";
const addedModules = " (:added diff) ";
const unchangedModules = " (:unchanged diff) ";

function esc(s) {
  return String(s == null ? \"\" : s).replace(/[&<>\"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch]));
}
function seg(id) { return String(id).split('.')[0]; }
function byOrder(a, b) {
  const ia = order.indexOf(seg(a.id));
  const ib = order.indexOf(seg(b.id));
  return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.name.localeCompare(b.name);
}
function labelOf(name) {
  return name.split('-').filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function boxHtml(c) {
  const ops = c.ops && c.ops.length
    ? `<ul>${c.ops.map(n => `<li>+ ${esc(n)}</li>`).join('')}</ul>`
    : (c.note ? `<ul><li class=\"none\">${esc(c.note)}</li></ul>` : '');
  const stereo = c.stereotype === 'interface' ? `<span class=\"mark\">I</span>` : '';
  const cls = ['box', c.change, c.stereotype === 'interface' ? 'iface' : ''].filter(Boolean).join(' ');
  const pill = c.change === 'added' ? `<span class=\"pill\">added</span>`
    : c.change === 'removed' ? `<span class=\"pill bad\">removed</span>` : '<span></span>';
  return `<article class=\"${cls}\" data-id=\"${esc(c.id)}\" data-level=\"${c.level}\">
    <header><span>${c.level}</span>${pill}</header>
    <h2>${esc(c.name)}${stereo}</h2>
    ${c.file ? `<p class=\"file\">${esc(c.file)}</p>` : ''}
    ${ops}
  </article>`;
}

function bandsOf(list) {
  const levels = [...new Set(list.filter(c => !c.foreign).map(c => c.level))].sort((a, b) => b - a);
  const top = levels[0];
  const bottom = levels[levels.length - 1];
  return levels.map(level => ({
    level,
    label: level === 0 ? 'Level 0 · inner'
      : (level === top && top !== bottom ? `Level ${level} · outer` : `Level ${level}`)
  }));
}

function mount(stage, list) {
  const project = list.filter(c => !c.foreign).slice().sort(byOrder);
  const foreign = list.filter(c => c.foreign).slice().sort(byOrder);
  const bands = stage.querySelector('.bands');
  bands.innerHTML = bandsOf(project).map(b => {
    const here = project.filter(c => c.level === b.level);
    const groups = new Map();
    here.forEach(c => {
      if (!c.group) return;
      const cur = groups.get(c.group) || [];
      cur.push(c);
      groups.set(c.group, cur);
    });
    const packed = new Set();
    groups.forEach((cs, group) => { if (cs.length >= 2) cs.forEach(c => packed.add(c.id)); });
    const loose = here.filter(c => !packed.has(c.id));
    const pkgs = [...groups.entries()].filter(([, cs]) => cs.length >= 2).map(([group, cs]) =>
      `<div class=\"pkg\"><span>${esc(labelOf(group))}</span><div class=\"stack\">${cs.map(boxHtml).join('')}</div></div>`);
    return `<div class=\"band\" data-level=\"${b.level}\">
      <div class=\"band-label\">${esc(b.label)}</div>
      <div class=\"row\">${loose.map(boxHtml).join('')}${pkgs.join('')}</div>
    </div>`;
  }).join('');
  stage.querySelector('.side').innerHTML = foreign.map(c =>
    `<div class=\"oval\" data-id=\"${esc(c.id)}\"><header><span class=\"pill foreign\">foreign</span></header><h2>${esc(c.name)}</h2></div>`).join('');
  return project.length > 0;
}

function sidePoint(stage, el, side) {
  const s = stage.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const x = r.left - s.left, y = r.top - s.top;
  if (side === 'top') return [x + r.width / 2, y];
  if (side === 'bottom') return [x + r.width / 2, y + r.height];
  if (side === 'left') return [x, y + r.height / 2];
  return [x + r.width, y + r.height / 2];
}

function draw(stage, list, edgeList, pinned) {
  const wires = stage.querySelector('svg.wires');
  const ns = 'http://www.w3.org/2000/svg';
  wires.innerHTML = '';
  const defs = document.createElementNS(ns, 'defs');
  defs.innerHTML = `
    <marker id=\"dep-${stage.id}\" viewBox=\"0 0 12 10\" refX=\"10\" refY=\"5\" markerWidth=\"8\" markerHeight=\"8\" orient=\"auto\">
      <path d=\"M1,1 L11,5 L1,9\" fill=\"none\" stroke=\"#1f7a4d\" stroke-width=\"1.4\"/>
    </marker>
    <marker id=\"same-${stage.id}\" viewBox=\"0 0 12 10\" refX=\"10\" refY=\"5\" markerWidth=\"8\" markerHeight=\"8\" orient=\"auto\">
      <path d=\"M1,1 L11,5 L1,9\" fill=\"none\" stroke=\"#6d6458\" stroke-width=\"1.4\"/>
    </marker>
    <marker id=\"impl-${stage.id}\" viewBox=\"0 0 12 10\" refX=\"10\" refY=\"5\" markerWidth=\"9\" markerHeight=\"9\" orient=\"auto\">
      <path d=\"M1,1 L11,5 L1,9 Z\" fill=\"#fffdf8\" stroke=\"#5b4b8a\" stroke-width=\"1.2\"/>
    </marker>
    <marker id=\"bad-${stage.id}\" viewBox=\"0 0 12 10\" refX=\"10\" refY=\"5\" markerWidth=\"8\" markerHeight=\"8\" orient=\"auto\">
      <path d=\"M1,1 L11,5 L1,9\" fill=\"none\" stroke=\"#a33b32\" stroke-width=\"1.6\"/>
    </marker>`;
  wires.appendChild(defs);
  const byId = Object.fromEntries([...stage.querySelectorAll('[data-id]')].map(el => [el.dataset.id, el]));
  const bandEl = level => stage.querySelector(`.band[data-level=\"${level}\"]`);
  const rowEl = level => bandEl(level) && bandEl(level).querySelector('.row');
  const rel = rect => {
    const s = stage.getBoundingClientRect();
    return { top: rect.top - s.top, bottom: rect.bottom - s.top, left: rect.left - s.left, right: rect.right - s.left };
  };
  const rows = [...stage.querySelectorAll('.row')];
  if (!rows.length) return;
  const contentRight = Math.max(...rows.map(el => rel(el.getBoundingClientRect()).right));
  const side = stage.querySelector('.side');
  const rightGutter = Math.min(contentRight + 16, rel(side.getBoundingClientRect()).left - 8);
  stage.querySelectorAll('[data-id]').forEach(el => el.classList.toggle('hot', pinned && el.dataset.id === pinned));
  const levelOf = id => Number(byId[id].dataset.level);
  const projectEdges = edgeList.filter(e => byId[e.from] && byId[e.to] && !byId[e.to].classList.contains('oval'));
  const gapEdges = projectEdges.filter(e => levelOf(e.from) - levelOf(e.to) === 1);
  const gutterEdges = projectEdges.filter(e => levelOf(e.from) - levelOf(e.to) > 1);
  edgeList.forEach(e => {
    const a = byId[e.from], b = byId[e.to];
    if (!a || !b) return;
    const foreign = b.classList.contains('oval');
    const fromLevel = Number(a.dataset.level);
    const toLevel = Number(b.dataset.level);
    const [x1, y1] = sidePoint(stage, a, 'bottom');
    const [x2, y2] = sidePoint(stage, b, foreign ? 'left' : 'top');
    let d;
    if (foreign) {
      const row = rel(rowEl(fromLevel).getBoundingClientRect());
      const mates = edgeList.filter(o => byId[o.to] && byId[o.to].classList.contains('oval') && Number(byId[o.from].dataset.level) === fromLevel);
      const lane = row.bottom + 22 + mates.indexOf(e) * 6;
      const [, ty] = sidePoint(stage, b, 'left');
      d = `M ${x1} ${y1} L ${x1} ${lane} L ${rightGutter} ${lane} L ${rightGutter} ${ty} L ${x2 - 2} ${ty}`;
    } else if (fromLevel === toLevel) {
      const row = rel(rowEl(fromLevel).getBoundingClientRect());
      const y = row.bottom + 14;
      const [bx1, by1] = sidePoint(stage, a, 'bottom');
      const [bx2, by2] = sidePoint(stage, b, 'bottom');
      d = `M ${bx1} ${by1} L ${bx1} ${y} L ${bx2} ${y} L ${bx2} ${by2}`;
    } else if (fromLevel - toLevel === 1) {
      const above = rel(rowEl(fromLevel).getBoundingClientRect());
      const below = rel(rowEl(toLevel).getBoundingClientRect());
      const slot = gapEdges.filter(o => o.from === e.from).indexOf(e);
      const y = Math.min(above.bottom + 16 + slot * 6, below.top - 8);
      const pkg = b.closest('.pkg');
      const pkgBox = pkg ? rel(pkg.getBoundingClientRect()) : null;
      const [rx, ry] = sidePoint(stage, b, 'right');
      if (pkgBox && ry > pkgBox.top + 40) {
        const x = pkgBox.right + 10;
        d = `M ${x1} ${y1} L ${x1} ${y} L ${x} ${y} L ${x} ${ry} L ${rx + 2} ${ry}`;
      } else {
        d = `M ${x1} ${y1} L ${x1} ${y} L ${x2} ${y} L ${x2} ${y2 - 2}`;
      }
    } else {
      const above = rel(rowEl(fromLevel).getBoundingClientRect());
      const below = rel(rowEl(toLevel).getBoundingClientRect());
      const slot = gutterEdges.indexOf(e);
      const gutter = 10 + Math.max(0, slot) * 6;
      const yLeave = above.bottom + 10;
      const yEnter = below.top - 4;
      d = `M ${x1} ${y1} L ${x1} ${yLeave} L ${gutter} ${yLeave} L ${gutter} ${yEnter} L ${x2} ${yEnter} L ${x2} ${y2 - 2}`;
    }
    const hot = !pinned || pinned === e.from || pinned === e.to;
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    const kind = e.violating ? 'bad' : (e.kind === 'implements' ? 'impl' : (e.change === 'unchanged' ? 'same' : ''));
    path.setAttribute('class', `wire ${kind} ${hot ? 'hot' : 'dim'}`);
    const marker = e.violating ? 'bad' : (e.kind === 'implements' ? 'impl' : (e.change === 'unchanged' ? 'same' : 'dep'));
    path.setAttribute('marker-end', `url(#${marker}-${stage.id})`);
    wires.appendChild(path);
  });
}

const stage = document.getElementById('stage');
stage.id = 'after';
let pinned = null;
mount(stage, afterClasses);

const beforeHost = document.getElementById('before-host');
const beforeProject = beforeClasses.filter(c => !c.foreign);
if (!beforeProject.length) {
  beforeHost.innerHTML = `<div class=\"empty\">No modules.<br>${esc(beforeRef)} has no modules on the chart.</div>`;
} else {
  beforeHost.innerHTML = `<div class=\"stage\" id=\"before\"><svg class=\"wires\"></svg><div class=\"chart\"><div class=\"bands\"></div><div class=\"side\"></div></div></div>`;
  mount(document.getElementById('before'), beforeClasses);
}

const hint = document.getElementById('after-hint');
hint.textContent = unchangedModules === 0 && addedModules > 0 ? 'after · every box is new' : 'after';

function fillTable() {
  const body = document.getElementById('edges');
  const note = document.getElementById('filter-note');
  note.textContent = pinned
    ? `Showing arrows for ${pinned}. Click the box again to show all. Tests and docs are not modules, so they are not on the chart.`
    : 'Click a box to isolate its arrows. Click again to show all. Tests and docs are not modules, so they are not on the chart.';
  body.innerHTML = afterEdges.map(e => {
    const on = !pinned || pinned === e.from || pinned === e.to;
    const kind = e.violating ? `<span class=\"tag-bad\">dependency · outward</span>`
      : (e.kind === 'implements' ? `<span class=\"tag-impl\">implements</span>` : 'dependency');
    const change = e.change === 'added' ? `<span class=\"tag-add\">added</span>` : `<span class=\"tag-same\">unchanged</span>`;
    return `<tr class=\"${on ? '' : 'off'}\"><td>${change}</td><td class=\"mono\">${esc(e.from)}</td><td class=\"mono\">${esc(e.to)}</td><td>${kind}</td></tr>`;
  }).join('');
}

function redraw() {
  draw(stage, afterClasses, afterEdges, pinned);
  const before = document.getElementById('before');
  if (before) draw(before, beforeClasses, beforeEdges, null);
  fillTable();
}

stage.querySelectorAll('[data-id]').forEach(el => {
  el.addEventListener('click', () => {
    pinned = pinned === el.dataset.id ? null : el.dataset.id;
    redraw();
  });
});
redraw();
addEventListener('resize', redraw);
</script>
</body>
</html>
"))

(defn- read-doc [path]
  (edn/read-string (slurp path)))

(defn- lang-name [lang]
  (case lang
    :typescript "TypeScript"
    :clojure "Clojure"
    :python "Python"
    :rust "Rust"
    (str/capitalize (name lang))))

(defn- lang-of [doc]
  (let [langs (->> (:classes doc) (keep :lang) distinct)]
    (case (count langs)
      0 "source"
      1 (lang-name (first langs))
      "source")))

(defn -main [& args]
  (let [[after-path before-path out after-ref after-sha before-ref before-sha] args
        after (read-doc after-path)
        before (if (and before-path (not= before-path "-"))
                 (read-doc before-path)
                 {:classes [] :edges []})
        order (mapv name (or (:order after) (:order before) []))]
    (spit out (page {:title (or (:title after) (:title before) "UML")
                     :after-ref (or after-ref "head")
                     :after-sha (short-sha after-sha)
                     :before-ref (or before-ref "base")
                     :before-sha (short-sha before-sha)
                     :order order
                     :lang (lang-of after)
                     :diff (diff before after)}))
    (println "Wrote" out)))
