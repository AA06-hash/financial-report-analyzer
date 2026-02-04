// ---------- Dark Mode ----------
const toggleBtn = document.getElementById('toggleDark');
if(localStorage.getItem('darkMode')==='true') document.documentElement.classList.add('dark');
toggleBtn.textContent = document.documentElement.classList.contains('dark') ? '☀️ Light Mode' : '🌙 Dark Mode';

toggleBtn.addEventListener('click', ()=>{
  document.documentElement.classList.toggle('dark');
  const dark = document.documentElement.classList.contains('dark');
  toggleBtn.textContent = dark ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('darkMode', dark);
});

// ---------- Timestamp ----------
const lastUpdated = document.getElementById('lastUpdated');
function updateLastUpdated(){ lastUpdated.textContent = `Last Updated: ${new Date().toLocaleTimeString()}`; }
updateLastUpdated();
setInterval(updateLastUpdated,60000);

// ---------- Company Selector ----------
const companySelect = document.getElementById('companySelect');
let charts = {};

// ---------- Fetch JSON Data ----------
const companies = ["AAPL","MSFT","GOOGL","AMZN"];
const companyData = {};

async function loadData(){
  for(const ticker of companies){
    const res = await fetch(`data/${ticker}.json`);
    companyData[ticker] = await res.json();
    const option = document.createElement('option');
    option.value = ticker;
    option.textContent = companyData[ticker].name;
    companySelect.appendChild(option);
  }
  updateDashboard('AAPL');
}

loadData();

// ---------- Helper Function ----------
function updateChangeColor(element, value){
  element.className = value.startsWith('↑') ? 'text-sm positive' : value.startsWith('↓') ? 'text-sm negative' : 'text-sm neutral';
  element.textContent = value;
}

// ---------- Update Dashboard ----------
function updateDashboard(ticker){
  const data = companyData[ticker];
  
  // Metrics
  const metricsContainer = document.getElementById('metricsContainer');
  metricsContainer.innerHTML = `
    <div class="metric-card border-blue-500">
      <div class="text-sm font-semibold">Revenue (TTM)</div>
      <div class="text-xl font-bold mono">${data.revenue}</div>
      <div class="text-sm ${data.revenueChange.startsWith('↑')?'positive':'negative'}">${data.revenueChange}</div>
    </div>
    <div class="metric-card border-green-500">
      <div class="text-sm font-semibold">Net Income</div>
      <div class="text-xl font-bold mono">${data.netIncome}</div>
      <div class="text-sm ${data.incomeChange.startsWith('↑')?'positive':'negative'}">${data.incomeChange}</div>
    </div>
    <div class="metric-card border-purple-500">
      <div class="text-sm font-semibold">EPS</div>
      <div class="text-xl font-bold mono">${data.eps}</div>
      <div class="text-sm ${data.epsChange.startsWith('↑')?'positive':'negative'}">${data.epsChange}</div>
    </div>
    <div class="metric-card border-yellow-500">
      <div class="text-sm font-semibold">Sentiment Score</div>
      <div class="text-xl font-bold">${data.sentiment}</div>
      <div class="text-sm text-gray-500 dark:text-gray-300">${data.sentimentText}</div>
    </div>
  `;

  // Charts
  const ctx = document.getElementById('trendsChart');
  if(charts.trends) charts.trends.destroy();
  charts.trends = new Chart(ctx,{
    type:'line',
    data:{
      labels:['2019','2020','2021','2022','2023'],
      datasets:[
        {label:'Revenue ($B)', data:data.trends, borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.1)', fill:true, tension:0.3, borderWidth:2},
        {label:'Net Income ($B)', data:data.earnings, borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0.1)', fill:true, tension:0.3, borderWidth:2}
      ]
    },
    options:{responsive:true, plugins:{legend:{position:'top'}}, scales:{y:{beginAtZero:true}}}
  });

  const ctx2 = document.getElementById('comparisonChart');
  if(charts.comparison) charts.comparison.destroy();
  charts.comparison = new Chart(ctx2,{
    type:'bar',
    data:{
      labels:['Apple','Microsoft','Google','Amazon'],
      datasets:[{label:'Revenue ($B)', data:data.peer, backgroundColor:['#3b82f6','#10b981','#8b5cf6','#f59e0b'] }]
    },
    options:{responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}}}
  });

  const ctx3 = document.getElementById('sentimentChart');
  if(charts.sentiment) charts.sentiment.destroy();
  charts.sentiment = new Chart(ctx3,{
    type:'doughnut',
    data:{labels:['Apple','Microsoft','Google','Amazon'], datasets:[{data:data.sentimentScores, backgroundColor:['#3b82f6','#10b981','#8b5cf6','#f59e0b']}]},
    options:{responsive:true, plugins:{legend:{position:'bottom'}}}
  });
}

// ---------- Tabs ----------
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
tabs.forEach(tab=>{
  tab.addEventListener('click',()=>{
    tabs.forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const target=tab.dataset.tab+'Tab';
    tabContents.forEach(c=>c.classList.add('hidden'));
    document.getElementById(target).classList.remove('hidden');
  });
});

companySelect.addEventListener('change', e=>updateDashboard(e.target.value));

// ---------- Voice Summary ----------
const voiceBtn = document.getElementById('voiceBtn');
function speakSummary(ticker){
  const data = companyData[ticker];
  const text = `
    Financial summary for ${ticker}.
    Revenue is ${data.revenue}.
    Net income is ${data.netIncome}.
    Earnings per share is ${data.eps}.
    Overall sentiment is ${data.sentimentText}.
  `;
  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 1;
  speech.pitch = 1;
  speech.volume = 1;
  window.speechSynthesis.speak(speech);
}
voiceBtn.addEventListener('click', ()=>{
  const ticker = companySelect.value;
  speakSummary(ticker);
});