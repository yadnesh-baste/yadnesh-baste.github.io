(function () {
  // ---------- Tabs (each tab has its own link: #about, #projects, #cv, #skills, #contact)
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const ids = tabs.map(t => t.getAttribute("aria-controls"));
  const ALIASES = { work: "projects", experience: "cv", toolkit: "skills" };
  function show(id, focus) {
    id = ALIASES[id] || id;
    if (!ids.includes(id)) id = "about";
    tabs.forEach(t => {
      const on = t.getAttribute("aria-controls") === id;
      t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
      const p = document.getElementById(t.getAttribute("aria-controls"));
      if (on && p.hidden) { p.hidden = false; p.classList.remove("enter"); void p.offsetWidth; p.classList.add("enter"); }
      if (!on) p.hidden = true;
      if (on && focus) t.focus();
    });
    document.title = (id === "about" ? "" : tabs[ids.indexOf(id)].textContent + " – ") + "Yadnesh Baste – Data Analyst and Data Scientist, Berlin";
  }
  function go(id) { if (location.hash.slice(1) !== id) location.hash = id; else show(id); window.scrollTo({ top: 0 }); }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => go(ids[i]));
    t.addEventListener("keydown", e => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); const n = (i + k + tabs.length) % tabs.length; go(ids[n]); tabs[n].focus(); }
      if (e.key === "Home") { e.preventDefault(); go(ids[0]); tabs[0].focus(); }
      if (e.key === "End") { e.preventDefault(); go(ids.at(-1)); tabs.at(-1).focus(); }
    });
  });
  document.querySelectorAll("[data-goto]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); go(b.dataset.goto); }));
  window.addEventListener("hashchange", () => show(location.hash.slice(1)));
  show(location.hash.slice(1));

  const top = document.getElementById("top");
  window.addEventListener("scroll", () => top.classList.toggle("scrolled", window.scrollY > 8), { passive: true });

  // ---------- Avatar / photo switch
  const av = document.getElementById("avatar"), ph = document.getElementById("photo"), sw = document.getElementById("portrait-switch");
  sw.addEventListener("click", () => {
    const toPhoto = ph.hidden; ph.hidden = !toPhoto; av.style.display = toPhoto ? "none" : "";
    sw.textContent = toPhoto ? "Show my avatar" : "Show my photo";
  });

  // ---------- Signal strip: real sensor values, failed runs marked
  (function () {
    const t = SECOM.trace, n = t.length, W = 1600, H = 200, svg = document.getElementById("strip");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const pts = t.map((v, i) => `${(i / (n - 1) * W).toFixed(1)},${(H - 18 - v * (H - 36)).toFixed(1)}`).join(" ");
    const marks = SECOM.fails.map(i => { const x = (i / (n - 1) * W).toFixed(1); return `<line class="fail" x1="${x}" x2="${x}" y1="${H - 14}" y2="${H}"/>`; }).join("");
    svg.innerHTML = `<polyline class="trace" pathLength="1" points="${pts}"/>${marks}`;
  })();

  // ---------- Project charts
  const c = SECOM.curves;
  Charts.line(document.getElementById("fig-secom"), [
    { name: "LightGBM", color: "blue", points: c["LightGBM"], width: 2.6 },
    { name: "Logistic regression", color: "slate", points: c["Logistic regression"], width: 1.5 }],
    { xLabel: "% of runs inspected, riskiest first", yLabel: "% of failing runs caught", ref: true, vline: 10, title: "Failures caught vs. inspection effort" });
  const ranked = CHURN.ranked, total = ranked.reduce((a, b) => a + b, 0), pts = [[0, 0]];
  for (let p = 5; p <= 100; p += 5) { const k = Math.round(ranked.length * p / 100); pts.push([p, +(ranked.slice(0, k).reduce((a, b) => a + b, 0) / total * 100).toFixed(1)]); }
  Charts.line(document.getElementById("fig-churn"), [{ name: "Risk ranking", color: "blue", points: pts, width: 2.6 }],
    { xLabel: "% of customers called, riskiest first", yLabel: "% of leavers reached", ref: true, marker: pts[4], markerLabel: "20% called, 65% reached", title: "Retention calls ranked by churn risk" });

  // ---------- "Hiring? Pick the role"
  const ROLES = {
    da: { text: "At Bajaj Finance I built the KPI and reporting framework for sales and marketing and automated 80% of recurring reporting. At PowerCo I built Power BI and Grafana dashboards on data from 200+ production sensors.", link: "projects/churn.html", label: "Start with the bank churn dashboard" },
    ds: { text: "At Bajaj Finance I built a model predicting next month's likely customers and ran the churn analysis behind a retention rise from 15% to 50%. My master's thesis builds a hybrid RAG system over documents and SQL.", link: "projects/secom.html", label: "Start with the SECOM failure-prediction study" },
    ba: { text: "At PowerCo I designed the IT demand lifecycle in BPMN 2.0, assessed 15+ demands across 7 departments and acted as ServiceNow product owner. At Bajaj Finance I ran the market research for a new loan product across 2+ states.", link: "projects/process.html", label: "Start with the BPMN process case study" },
  };
  const note = document.getElementById("role-note");
  document.querySelectorAll("#roles button").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll("#roles button").forEach(x => x.setAttribute("aria-pressed", x === b));
    const r = ROLES[b.dataset.role]; note.innerHTML = `<p>${r.text}</p><a href="${r.link}">${r.label}</a>`;
  }));

  // ---------- CV filter
  document.querySelectorAll(".cv-filter button").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll(".cv-filter button").forEach(x => x.setAttribute("aria-pressed", x === b));
    const t = b.dataset.track;
    document.querySelectorAll("#cv-list [data-track]").forEach(li => li.classList.toggle("dim", t !== "all" && li.dataset.track !== t));
  }));

  // ---------- Skills with evidence (facts from my career history only)
  const SKILLS = {
    "Analysis and BI": {
      "SQL": "Daily at Bajaj Finance (Microsoft SQL Server, SOQL in Salesforce) and at PowerCo in Databricks; used in every project here.",
      "Power BI": "Automated reporting at Bajaj Finance; production KPI dashboards at PowerCo; DAX measures in the bank churn project.",
      "Tableau": "Management reporting at Bajaj Finance, part of the automated reporting stack.",
      "Grafana": "Machine-status dashboards for battery production at PowerCo.",
      "Excel": "Management reporting for the rural two-wheeler loan at Bajaj Finance.",
      "Market research": "Competitor and sales analysis across 2+ Indian states before a loan product launch.",
    },
    "Data engineering": {
      "Databricks": "Reporting workflows at Bajaj Finance (80% automated); data model for 200+ sensors at PowerCo; thesis pipelines.",
      "PySpark": "Data preparation in Databricks pipelines.",
      "Data migration": "Moved 300+ tables from the data warehouse to the data lake at Bajaj Finance, keeping integrity and pipelines intact.",
      "Data quality": "Cross-checked sensor data for machine readiness at PowerCo; corrected Salesforce entries at Bajaj Finance.",
      "Salesforce": "UAT and CUG testing, and SOQL-based data corrections with admin access at Bajaj Finance.",
    },
    "Machine learning and AI": {
      "Python": "Prediction model at Bajaj Finance; SECOM and churn projects; master's thesis.",
      "Classification models": "Next-month customer prediction at Bajaj Finance; SECOM failure ranking; bank churn risk model.",
      "RAG and LLMs": "Master's thesis at PowerCo: hybrid retrieval over documents and SQL.",
      "LangGraph": "Orchestrating document, database and hybrid retrieval in the thesis.",
      "Vector search": "Document retrieval in the thesis.",
    },
    "Process and delivery": {
      "BPMN 2.0": "Designed the DPL process at PowerCo; demand-to-portfolio case study here.",
      "Requirements analysis": "Assessed 15+ IT demands with stakeholders from 7 departments.",
      "ServiceNow": "Product owner at PowerCo: release testing and backlog refinement.",
      "Scrum": "Refinements and retrospectives as ServiceNow product owner.",
      "Jira, Confluence, Azure DevOps": "Demand and process documentation at PowerCo.",
      "Training": "Trained 3 juniors at Bajaj Finance; created DPL training for product owners at PowerCo.",
    },
  };
  const g = document.getElementById("skill-groups"), det = document.getElementById("skill-detail");
  Object.entries(SKILLS).forEach(([group, items]) => {
    const s = document.createElement("section");
    s.innerHTML = `<h3>${group}</h3><ul>${Object.keys(items).map(k => `<li><button type="button" aria-pressed="false">${k}</button></li>`).join("")}</ul>`;
    g.appendChild(s);
  });
  g.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    g.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
    const grp = b.closest("section").querySelector("h3").textContent;
    det.innerHTML = `<b>${b.textContent}</b>${SKILLS[grp][b.textContent]}`;
  });

  // ---------- Copy email
  const toast = document.getElementById("toast");
  document.getElementById("copy-email").addEventListener("click", async () => {
    const mail = "yadneshgbaste@gmail.com";
    try { await navigator.clipboard.writeText(mail); toast.textContent = "Email copied"; }
    catch (e) { location.href = "mailto:" + mail; toast.textContent = "Opening your email app"; }
    toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 1800);
  });
})();
