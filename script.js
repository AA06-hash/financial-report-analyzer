document.addEventListener("DOMContentLoaded", () => {

  /* ================= DARK MODE ================= */

  const toggleBtn = document.getElementById("toggleDark");

  if (toggleBtn) {

    if (localStorage.getItem("darkMode") === "true") {
      document.documentElement.classList.add("dark");
    }

    updateDarkText();

    toggleBtn.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");

      const dark =
        document.documentElement.classList.contains("dark");

      localStorage.setItem("darkMode", dark);

      updateDarkText();
    });

    function updateDarkText() {
      toggleBtn.textContent =
        document.documentElement.classList.contains("dark")
          ? "☀️ Light Mode"
          : "🌙 Dark Mode";
    }
  }

  /* ================= TIMESTAMP ================= */

  const lastUpdated = document.getElementById("lastUpdated");

  if (lastUpdated) {

    function updateLastUpdated() {
      lastUpdated.textContent =
        "Last Updated: " +
        new Date().toLocaleTimeString();
    }

    updateLastUpdated();
    setInterval(updateLastUpdated, 60000);
  }

  /* ================= SELECT ================= */

  const companySelect =
    document.getElementById("companySelect");

  /* ================= DATA ================= */

  const companies = ["AAPL", "MSFT", "GOOGL", "AMZN"];

  const companyData = {};

  let charts = {};

  /* ================= LOAD DATA ================= */

  async function loadData() {

    for (const ticker of companies) {

      try {

        const res = await fetch(`data/${ticker}.json`);

        if (!res.ok) continue;

        const data = await res.json();

        companyData[ticker] = data;

        const option =
          document.createElement("option");

        option.value = ticker;
        option.textContent = data.name;

        companySelect.appendChild(option);

      } catch (err) {
        console.warn("Missing:", ticker);
      }
    }

    if (companySelect.value) {
      updateDashboard(companySelect.value);
    } else {
      updateDashboard("AAPL");
    }
  }

  loadData();


  /* ================= UPDATE DASHBOARD ================= */

  function updateDashboard(ticker) {

    const data = companyData[ticker];

    if (!data) return;

    /* ----- METRICS ----- */

    const metrics =
      document.getElementById("metricsContainer");

    metrics.innerHTML = `
      <div class="metric-card border-blue-500">
        <div>Revenue</div>
        <div class="mono">${data.revenue}</div>
        <div class="positive">${data.revenueChange}</div>
      </div>

      <div class="metric-card border-green-500">
        <div>Net Income</div>
        <div class="mono">${data.netIncome}</div>
        <div class="positive">${data.incomeChange}</div>
      </div>

      <div class="metric-card border-purple-500">
        <div>EPS</div>
        <div class="mono">${data.eps}</div>
        <div class="positive">${data.epsChange}</div>
      </div>

      <div class="metric-card border-yellow-500">
        <div>Sentiment</div>
        <div>${data.sentiment}</div>
        <div>${data.sentimentText}</div>
      </div>
    `;


    /* ----- LINE CHART ----- */

    const ctx =
      document.getElementById("trendsChart");

    if (charts.trends) charts.trends.destroy();

    charts.trends = new Chart(ctx, {
      type: "line",

      data: {
        labels: ["2019", "2020", "2021", "2022", "2023"],

        datasets: [
          {
            label: "Revenue ($B)",
            data: data.trends,
            fill: true
          },
          {
            label: "Net Income ($B)",
            data: data.earnings,
            fill: true
          }
        ]
      },

      options: {
        responsive: true
      }
    });


    /* ----- BAR CHART ----- */

    const ctx2 =
      document.getElementById("comparisonChart");

    if (charts.bar) charts.bar.destroy();

    charts.bar = new Chart(ctx2, {
      type: "bar",

      data: {
        labels: ["Apple", "Microsoft", "Google", "Amazon"],

        datasets: [
          {
            label: "Revenue",
            data: data.peer
          }
        ]
      },

      options: {
        responsive: true
      }
    });


    /* ----- DOUGHNUT ----- */

    const ctx3 =
      document.getElementById("sentimentChart");

    if (charts.doughnut) charts.doughnut.destroy();

    charts.doughnut = new Chart(ctx3, {
      type: "doughnut",

      data: {
        labels: ["Apple", "Microsoft", "Google", "Amazon"],

        datasets: [
          {
            data: data.sentimentScores
          }
        ]
      }
    });
  }


  /* ================= SELECT CHANGE ================= */

  companySelect.addEventListener("change", e => {
    updateDashboard(e.target.value);
  });


  /* ================= TABS ================= */

  document.querySelectorAll(".tab").forEach(tab => {

    tab.addEventListener("click", () => {

      document.querySelectorAll(".tab")
        .forEach(t => t.classList.remove("active"));

      tab.classList.add("active");

      const target = tab.dataset.tab + "Tab";

      document.querySelectorAll(".tab-content")
        .forEach(c => c.classList.add("hidden"));

      const targetEl = document.getElementById(target);

      if (targetEl) {
        targetEl.classList.remove("hidden");
      }

      // Resize charts after showing tab
      setTimeout(() => {
        Object.values(charts).forEach(chart => {
          chart.resize();
        });
      }, 100);

    });

  });


  /* ================= VOICE ================= */

  const voiceBtn =
    document.getElementById("voiceBtn");

  if (voiceBtn) {

    voiceBtn.addEventListener("click", () => {

      const ticker = companySelect.value;

      const data = companyData[ticker];

      if (!data) return;

      const text = `
        Financial summary for ${ticker}.
        Revenue ${data.revenue}.
        Net income ${data.netIncome}.
        EPS ${data.eps}.
        Sentiment ${data.sentimentText}.
      `;

      const speech =
        new SpeechSynthesisUtterance(text);

      speech.rate = 1;

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(speech);
    });
  }

});
