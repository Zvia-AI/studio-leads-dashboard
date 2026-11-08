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

renderKpis();
