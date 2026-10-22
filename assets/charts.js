// Minimal SVG charts that follow the page's light/dark colours (CSS variables).
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const COLORS = { blue: "var(--blue)", teal: "var(--teal)", slate: "var(--slate)", signal: "var(--signal)" };

  // series: [{name, color, points:[[x,y],...], width}], opts: {xLabel, yLabel, xMax, yMax, ref, vline, title}
  function line(el, series, o = {}) {
    const W = 560, H = 330, m = { l: 48, r: 14, t: o.title ? 30 : 12, b: 46 };
    const xMax = o.xMax ?? 100, yMax = o.yMax ?? 100;
    const X = v => m.l + (v / xMax) * (W - m.l - m.r), Y = v => H - m.b - (v / yMax) * (H - m.t - m.b);
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title || "Line chart")}">`;
    if (o.title) s += `<text class="title" x="${m.l}" y="16">${esc(o.title)}</text>`;
    for (let t = 0; t <= yMax; t += yMax / 5) s += `<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}"/><text x="${m.l - 8}" y="${Y(t) + 4}" text-anchor="end">${t}</text>`;
    for (let t = 0; t <= xMax; t += xMax / 5) s += `<text x="${X(t)}" y="${H - m.b + 18}" text-anchor="middle">${t}</text>`;
    s += `<line class="axis" x1="${m.l}" x2="${W - m.r}" y1="${Y(0)}" y2="${Y(0)}"/>`;
    if (o.ref) s += `<line class="ref" x1="${X(0)}" y1="${Y(0)}" x2="${X(xMax)}" y2="${Y(yMax)}"/>`;
    if (o.vline != null) s += `<line x1="${X(o.vline)}" x2="${X(o.vline)}" y1="${Y(0)}" y2="${Y(yMax)}" stroke="var(--signal)" stroke-dasharray="2 3"/>`;
    series.forEach(se => {
      s += `<polyline class="line" stroke="${COLORS[se.color] || se.color}" stroke-width="${se.width || 2}" points="${se.points.map(p => X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1)).join(" ")}"><title>${esc(se.name)}</title></polyline>`;
    });
    if (o.marker) s += `<circle cx="${X(o.marker[0])}" cy="${Y(o.marker[1])}" r="5" fill="var(--signal)"/><text class="lbl" x="${X(o.marker[0]) + 9}" y="${Y(o.marker[1]) + 16}">${esc(o.markerLabel || "")}</text>`;
    s += `<text x="${(m.l + W - m.r) / 2}" y="${H - 8}" text-anchor="middle">${esc(o.xLabel || "")}</text>`;
    s += `<text transform="translate(13 ${(m.t + H - m.b) / 2}) rotate(-90)" text-anchor="middle">${esc(o.yLabel || "")}</text>`;
    // legend
    let ly = H - m.b - 14 - (series.length - 1) * 18;
    if (series.length > 1) series.forEach(se => { s += `<line x1="${W - 190}" x2="${W - 172}" y1="${ly}" y2="${ly}" stroke="${COLORS[se.color] || se.color}" stroke-width="3"/><text x="${W - 166}" y="${ly + 4}">${esc(se.name)}</text>`; ly += 18; });
    el.innerHTML = s + "</svg>";
  }

  // data: [{label, value, highlight}], opts: {max, title, fmt, avg}
  function bars(el, data, o = {}) {
    const rowH = o.rowH || 30, W = o.width || 460, m = { l: o.labelW || 70, r: 52, t: o.title ? 28 : 6 }, H = m.t + data.length * rowH + 6;
    const max = o.max ?? Math.max(...data.map(d => d.value)), X = v => (v / max) * (W - m.l - m.r);
    const fmt = o.fmt || (v => v);
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title || "Bar chart")}">`;
    if (o.title) s += `<text class="title" x="0" y="15">${esc(o.title)}</text>`;
    data.forEach((d, i) => {
      const y = m.t + i * rowH;
      s += `<text x="${m.l - 8}" y="${y + 19}" text-anchor="end">${esc(d.label)}</text>`;
      s += `<rect x="${m.l}" y="${y + 6}" width="${Math.max(1, X(d.value))}" height="18" rx="3" fill="${d.highlight ? "var(--signal)" : "var(--blue)"}"/>`;
      s += `<text class="lbl" x="${m.l + X(d.value) + 6}" y="${y + 19}">${esc(fmt(d.value))}</text>`;
    });
    if (o.avg != null) s += `<line x1="${m.l + X(o.avg)}" x2="${m.l + X(o.avg)}" y1="${m.t}" y2="${H - 4}" class="ref"/>`;
    el.innerHTML = s + "</svg>";
  }
  window.Charts = { line, bars };
})();
