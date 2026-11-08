function computeKpis(leads) {
  const activeLeads = leads.filter(
    (lead) => lead.stage !== "נסגר בהצלחה" && lead.stage !== "לא רלוונטי"
  );
  const activeCount = activeLeads.length;
  const pipelineValue = activeLeads.reduce((sum, lead) => sum + lead.estimatedValue, 0);

  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const consultationsThisMonth = leads.filter(
    (lead) => lead.consultationDate && lead.consultationDate.slice(0, 7) === currentYearMonth
  ).length;

  const closedCount = leads.filter((lead) => lead.stage === "נסגר בהצלחה").length;
  const relevantCount = leads.filter((lead) => lead.stage !== "לא רלוונטי").length;
  const conversionRate = relevantCount === 0 ? 0 : Math.round((closedCount / relevantCount) * 100);

  return { activeCount, pipelineValue, consultationsThisMonth, conversionRate };
}

function renderKpis() {
  const kpis = computeKpis(LEADS);
  const currencyFormatter = new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  });

  document.getElementById("kpi-active-value").textContent = kpis.activeCount;
  document.getElementById("kpi-pipeline-value").textContent = currencyFormatter.format(kpis.pipelineValue);
  document.getElementById("kpi-consultations-value").textContent = kpis.consultationsThisMonth;
  document.getElementById("kpi-conversion-value").textContent = `${kpis.conversionRate}%`;
}

const STAGE_ORDER = [
  "פנייה חדשה",
  "שיחת היכרות טלפונית",
  "פגישת ייעוץ בשטח (בתשלום)",
  "הצעת מחיר בהמתנה",
  "נסגר בהצלחה",
  "לא רלוונטי",
];

const STAGE_COLORS = {
  "פנייה חדשה": "#A6A08F",
  "שיחת היכרות טלפונית": "#8FBAC9",
  "פגישת ייעוץ בשטח (בתשלום)": "#5E85A8",
  "הצעת מחיר בהמתנה": "#C9A355",
  "נסגר בהצלחה": "#7E9680",
  "לא רלוונטי": "#C4BFB8",
};

const SERVICE_COLORS = {
  "תכנון ועיצוב מלא": "#AD8A64",
  "הלבשת הבית (Home Styling)": "#8FBAC9",
  "חבילת שינויי דיירים": "#C9A355",
  "יום קניות מרוכז": "#8B8178",
  "פגישת ייעוץ ממוקדת": "#5E85A8",
};

let funnelChartInstance = null;
let servicesChartInstance = null;

function toFunnelLabel(stage) {
  const parenIndex = stage.indexOf("(");
  if (parenIndex === -1) return [stage];
  return [stage.slice(0, parenIndex).trim(), stage.slice(parenIndex)];
}

function renderCharts() {
  const funnelContainer = document.getElementById("chart-funnel-container");
  const servicesContainer = document.getElementById("chart-services-container");

  if (typeof Chart === "undefined") {
    const message = "לא ניתן לטעון את ספריית הגרפים כרגע";
    funnelContainer.innerHTML = `<p class="text-sm text-taupe/70 text-center mt-8">${message}</p>`;
    servicesContainer.innerHTML = `<p class="text-sm text-taupe/70 text-center mt-8">${message}</p>`;
    return;
  }

  const stageCounts = STAGE_ORDER.map(
    (stage) => LEADS.filter((lead) => lead.stage === stage).length
  );
  const stageColors = STAGE_ORDER.map((stage) => STAGE_COLORS[stage]);
  const stageLabels = STAGE_ORDER.map(toFunnelLabel);

  if (funnelChartInstance) {
    funnelChartInstance.data.labels = stageLabels;
    funnelChartInstance.data.datasets[0].data = stageCounts;
    funnelChartInstance.data.datasets[0].backgroundColor = stageColors;
    funnelChartInstance.update();
  } else {
    funnelChartInstance = new Chart(document.getElementById("chart-funnel"), {
      type: "bar",
      data: {
        labels: stageLabels,
        datasets: [
          {
            label: "מספר לידים",
            data: stageCounts,
            backgroundColor: stageColors,
          },
        ],
      },
      options: {
        indexAxis: "y",
        maintainAspectRatio: false,
        locale: "he-IL",
        scales: {
          x: {
            beginAtZero: true,
            reverse: true,
            ticks: { precision: 0, font: { family: "Heebo" } },
          },
          y: {
            position: "right",
            ticks: { font: { family: "Heebo" } },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            rtl: true,
            titleFont: { family: "Heebo" },
            bodyFont: { family: "Heebo" },
            callbacks: {
              title: (items) => STAGE_ORDER[items[0].dataIndex],
              label: (context) => `${context.parsed.x} לידים`,
            },
          },
        },
      },
    });
  }

  const serviceTypes = Object.keys(SERVICE_COLORS);
  const serviceCounts = serviceTypes.map(
    (service) => LEADS.filter((lead) => lead.serviceType === service).length
  );
  const serviceColorList = serviceTypes.map((service) => SERVICE_COLORS[service]);

  if (servicesChartInstance) {
    servicesChartInstance.data.labels = serviceTypes;
    servicesChartInstance.data.datasets[0].data = serviceCounts;
    servicesChartInstance.data.datasets[0].backgroundColor = serviceColorList;
    servicesChartInstance.update();
  } else {
    servicesChartInstance = new Chart(document.getElementById("chart-services"), {
      type: "doughnut",
      data: {
        labels: serviceTypes,
        datasets: [
          {
            data: serviceCounts,
            backgroundColor: serviceColorList,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        rtl: true,
        locale: "he-IL",
        plugins: {
          legend: {
            position: "bottom",
            rtl: true,
            labels: { font: { family: "Heebo" } },
          },
          tooltip: {
            rtl: true,
            titleFont: { family: "Heebo" },
            bodyFont: { family: "Heebo" },
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed} לידים`,
            },
          },
        },
      },
    });
  }
}

renderKpis();
renderCharts();
