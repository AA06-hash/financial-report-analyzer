// ================================
// Financial Report Analyzer Script
// ================================

document.addEventListener("DOMContentLoaded", () => {

  // ---------- Dark Mode ----------
  const toggleBtn = document.getElementById("toggleDark");

  if (toggleBtn) {

    if (localStorage.getItem("darkMode") === "true") {
      document.documentElement.classList.add("dark");
    }

    updateDarkButton();

    toggleBtn.addEventListener("click", () => {

      document.documentElement.classList.toggle("dark");

      const dark =
        document.documentElement.classList.contains("dark");

      localStorage.setItem("darkMode", dark);

      updateDarkButton();
    });
  }

  function updateDarkButton() {

    if (!toggleBtn) return;

    toggleBtn.textContent =
      document.documentElement.classList.contains("dark")
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";
  }



  // ---------- Timestamp ----------
  const lastUpdated = document.getElementById("lastUpdated");

  if (lastUpdated) {

    function updateTime() {

      lastUpdated.textContent =
        `Last Updated: ${new Date().toLocaleTimeString()}`;
    }

    updateTime();

    setInterval(updateTime, 60000);
  }



  // ---------- Company Selector ----------
  const companySelect =
    document.getElementById("companySelect");

  let charts = {};



  // ---------- Data ----------
  const companies = ["AAPL", "MSFT", "GOOGL", "AMZN"];

  const companyData = {};



  // ---------- Load JSON ----------
  async function loadData() {

    try {

      for (const ticker of companies) {

        const res =
          await fetch(`data/${ticker}.json`);

        if (!res.ok) {
          throw new Error(`Missing ${ticker}.json`);
        }

        const json = await res.json();

        companyData[ticker] = json;

        if (companySelect) {

          const option =
            document.createElement("option");

          option.value = ticker;

          option.textContent = json.name;

          companySelect.appendChild(option);
        }
      }

      updateDashboard("AAPL");

    } catch (err) {

      console.error("Data Load Error:", err);

      alert("Failed to load company data.");
    }
  }

  loadData();



  // ---------- Update Dashboard ----------
  function updateDashboard(ticker) {

    const data = companyData[ticker];

    if (!data) return;



    // ----- Metrics -----
    const metricsContainer =
      document.getElementById("metricsContainer");

    if (!metricsContainer) return;

    metricsContainer.innerHTML = `

      <div class="metric-card border-blue-500">
        <div class="text-sm font-semibold">
          Revenue (TTM)
        </div>
        <div class="text-xl font-bold mono">
          ${data.revenue}
        </div>
        <div class="text-sm">
          ${data.revenueChange}
        </div>
      </div>

      <div class="metric-card border-green-500">
        <div class="text-sm font-semibold">
          Net Income
        </div>
        <div class="text-xl font-bold mono">
          ${data.netIncome}
        </div>
        <div class="text-sm">
          ${data.incomeChange}
        </div>
      </div>

      <div class="metric-card border-purple-500">
        <div class="text-sm font-semibold">
          EPS
        </div>
        <div class="text-xl font-bold mono">
          ${data.eps}
        </div>
        <div class="text-sm">
          ${data.epsChange}
        </div>
      </div>

      <div class="metric-card border-yellow-500">
        <div class="text-sm font-semibold">
          Sentiment
        </div>
        <div class="text-xl font-bold">
          ${data.sentiment}
        </div>
        <div class="text-sm text-gray-500">
          ${data.sentimentText}
        </div>
      </div>

    `;



    // ----- Charts -----
    drawCharts(data);
  }



  // ---------- Charts ----------
  function drawCharts(data) {

    // ----- Trend Chart -----
    const ctx =
      document.getElementById("trendsChart");

    if (ctx) {

      if (charts.trends) charts.trends.destroy();

      charts.trends = new Chart(ctx, {

        type: "line",

        data: {

          labels: ["2019", "2020", "2021", "2022", "2023"],

          datasets: [

            {
              label: "Revenue ($B)",
              data: data.trends,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59,130,246,0.1)",
              fill: true,
              tension: 0.3
            },

            {
              label: "Net Income ($B)",
              data: data.earnings,
              borderColor: "#10b981",
              backgroundColor: "rgba(16,185,129,0.1)",
              fill: true,
              tension: 0.3
            }
          ]
        },

        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }



    // ----- Comparison Chart -----
    const ctx2 =
      document.getElementById("comparisonChart");

    if (ctx2) {

      if (charts.comparison) charts.comparison.destroy();

      charts.comparison = new Chart(ctx2, {

        type: "bar",

        data: {

          labels: ["Apple", "Microsoft", "Google", "Amazon"],

          datasets: [
            {
              label: "Revenue ($B)",
              data: data.peer,
              backgroundColor: [
                "#3b82f6",
                "#10b981",
                "#8b5cf6",
                "#f59e0b"
              ]
            }
          ]
        },

        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }



    // ----- Sentiment Chart -----
    const ctx3 =
      document.getElementById("sentimentChart");

    if (ctx3) {

      if (charts.sentiment) charts.sentiment.destroy();

      charts.sentiment = new Chart(ctx3, {

        type: "doughnut",

        data: {

          labels: ["Apple", "Microsoft", "Google", "Amazon"],

          datasets: [
            {
              data: data.sentimentScores,
              backgroundColor: [
                "#3b82f6",
                "#10b981",
                "#8b5cf6",
                "#f59e0b"
              ]
            }
          ]
        },

        options: {
          responsive: true
        }
      });
    }
  }



  // ---------- Tabs ----------
  const tabs =
    document.querySelectorAll(".tab");

  const tabContents =
    document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {

    tab.addEventListener("click", () => {

      tabs.forEach(t => t.classList.remove("active"));

      tab.classList.add("active");

      const target =
        tab.dataset.tab + "Tab";

      tabContents.forEach(c =>
        c.classList.add("hidden")
      );

      const active =
        document.getElementById(target);

      if (active) active.classList.remove("hidden");
    });
  });



  // ---------- Selector Change ----------
  if (companySelect) {

    companySelect.addEventListener("change", e => {

      updateDashboard(e.target.value);

    });
  }



  // ---------- Voice Summary ----------
  const voiceBtn =
    document.getElementById("voiceBtn");

  if (voiceBtn) {

    voiceBtn.addEventListener("click", () => {

      const ticker =
        companySelect.value;

      speakSummary(ticker);
    });
  }



  function speakSummary(ticker) {

    const data = companyData[ticker];

    if (!data) return;

    const text = `
      Financial summary for ${ticker}.
      Revenue is ${data.revenue}.
      Net income is ${data.netIncome}.
      Earnings per share is ${data.eps}.
      Overall sentiment is ${data.sentimentText}.
    `;

    const speech =
      new SpeechSynthesisUtterance(text);

    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);
  }

});
