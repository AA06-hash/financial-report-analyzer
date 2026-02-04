document.addEventListener("DOMContentLoaded", () => {

  // ---------------- DARK MODE ----------------

  const toggleBtn = document.getElementById("toggleDark");

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



  // ---------------- TIME ----------------

  const lastUpdated = document.getElementById("lastUpdated");

  function updateTime() {

    lastUpdated.textContent =
      "Last Updated: " + new Date().toLocaleTimeString();
  }

  updateTime();
  setInterval(updateTime, 60000);



  // ---------------- DATA ----------------

  const companies = ["AAPL", "MSFT", "GOOGL", "AMZN"];

  const companyData = {};

  const companySelect =
    document.getElementById("companySelect");

  let charts = {};



  async function loadData() {

    for (let ticker of companies) {

      const res = await fetch(`./data/${ticker}.json`);

      const data = await res.json();

      companyData[ticker] = data;

      const option = document.createElement("option");

      option.value = ticker;
      option.textContent = data.name;

      companySelect.appendChild(option);
    }

    updateDashboard("AAPL");
  }

  loadData();



  // ---------------- DASHBOARD ----------------

  function updateDashboard(ticker) {

    const data = companyData[ticker];

    if (!data) return;



    // Metrics

    const metrics =
      document.getElementById("metricsContainer");

    metrics.innerHTML = `

      <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h3>Revenue</h3>
        <p class="text-xl">${data.revenue}</p>
        <p>${data.revenueChange}</p>
      </div>

      <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h3>Net Income</h3>
        <p class="text-xl">${data.netIncome}</p>
        <p>${data.incomeChange}</p>
      </div>

      <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h3>EPS</h3>
        <p class="text-xl">${data.eps}</p>
        <p>${data.epsChange}</p>
      </div>

      <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h3>Sentiment</h3>
        <p class="text-xl">${data.sentiment}</p>
        <p>${data.sentimentText}</p>
      </div>

    `;



    // Charts

    drawTrends(data);
    drawCompare(data);
    drawSentiment(data);
  }



  function drawTrends(data) {

    const ctx =
      document.getElementById("trendsChart");

    if (charts.trends) charts.trends.destroy();

    charts.trends = new Chart(ctx, {

      type: "line",

      data: {

        labels: ["2019", "2020", "2021", "2022", "2023"],

        datasets: [

          {
            label: "Revenue",
            data: data.trends,
            borderColor: "blue",
            fill: false
          },

          {
            label: "Earnings",
            data: data.earnings,
            borderColor: "green",
            fill: false
          }

        ]
      }

    });
  }



  function drawCompare(data) {

    const ctx =
      document.getElementById("comparisonChart");

    if (charts.compare) charts.compare.destroy();

    charts.compare = new Chart(ctx, {

      type: "bar",

      data: {

        labels: ["Apple", "Microsoft", "Google", "Amazon"],

        datasets: [
          {
            label: "Revenue",
            data: data.peer,
            backgroundColor: "orange"
          }
        ]
      }

    });
  }



  function drawSentiment(data) {

    const ctx =
      document.getElementById("sentimentChart");

    if (charts.sentiment) charts.sentiment.destroy();

    charts.sentiment = new Chart(ctx, {

      type: "doughnut",

      data: {

        labels: ["Apple", "Microsoft", "Google", "Amazon"],

        datasets: [
          {
            data: data.sentimentScores,
            backgroundColor: [
              "blue",
              "green",
              "purple",
              "orange"
            ]
          }
        ]
      }

    });
  }



  // ---------------- TABS ----------------

  const tabs = document.querySelectorAll(".tab");
  const contents =
    document.querySelectorAll(".tab-content");


  tabs.forEach(tab => {

    tab.addEventListener("click", () => {

      tabs.forEach(t => t.classList.remove("active"));

      tab.classList.add("active");

      const target = tab.dataset.tab + "Tab";

      contents.forEach(c => c.classList.add("hidden"));

      document
        .getElementById(target)
        .classList.remove("hidden");
    });
  });



  // ---------------- SELECT ----------------

  companySelect.addEventListener("change", e => {

    updateDashboard(e.target.value);
  });



  // ---------------- VOICE ----------------

  const voiceBtn =
    document.getElementById("voiceBtn");


  voiceBtn.addEventListener("click", () => {

    const ticker = companySelect.value;

    const data = companyData[ticker];

    if (!data) return;

    const text = `
      Financial report for ${ticker}.
      Revenue ${data.revenue}.
      Net income ${data.netIncome}.
      Earnings per share ${data.eps}.
      Sentiment ${data.sentimentText}.
    `;

    const speech =
      new SpeechSynthesisUtterance(text);

    window.speechSynthesis.speak(speech);
  });

});
