function computeKpis(leads) {
  const activeLeads = leads.filter(
    (lead) => lead.stage !== "נסגר בהצלחה" && lead.stage !== "לא רלוונטי"
  );
  const activeCount = activeLeads.length;
  const pipelineValue = activeLeads.reduce((sum, lead) => sum + (lead.estimatedValue ?? 0), 0);

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

const currencyFormatter = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

function renderKpis() {
  const kpis = computeKpis(LEADS);

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

// צבעי השלבים בפלטה הסגולה: "נסגר בהצלחה" נשאר ירוק מעודן, "לא רלוונטי" נשאר אפור,
// ו"הצעת מחיר בהמתנה" מקבל את נגיעת הזהב הרכה של העיצוב.
const STAGE_COLORS = {
  "פנייה חדשה": "#C9BFD1",
  "שיחת היכרות טלפונית": "#A98FB8",
  "פגישת ייעוץ בשטח (בתשלום)": "#7C5A92",
  "הצעת מחיר בהמתנה": "#C9A355",
  "נסגר בהצלחה": "#7E9680",
  "לא רלוונטי": "#B3A8B8",
};

const SERVICE_COLORS = {
  "תכנון ועיצוב מלא": "#5B3E6E",
  "הלבשת הבית (Home Styling)": "#C9B8D6",
  "חבילת שינויי דיירים": "#B08FC2",
  "יום קניות מרוכז": "#6E5A7E",
  "פגישת ייעוץ ממוקדת": "#C9A355",
};

const PROPERTY_TYPES = [
  "דירת קבלן",
  "שיפוץ כולל",
  "בית פרטי / וילה",
  "חלל מסחרי / קליניקה",
  "ריענון חלל בודד",
];

const SOURCES = ["אינסטגרם", "המלצה מלקוח עבר", "אתר הסטודיו", "פייסבוק"];

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
    funnelContainer.innerHTML = `<p class="text-sm text-taupe text-center mt-8">${message}</p>`;
    servicesContainer.innerHTML = `<p class="text-sm text-taupe text-center mt-8">${message}</p>`;
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

// ----- טלפון -----

function normalizePhone(raw) {
  let digits = raw.replace(/[\s\-()]/g, "");

  if (digits.startsWith("+972")) {
    digits = `0${digits.slice(4)}`;
  } else if (digits.startsWith("972")) {
    digits = `0${digits.slice(3)}`;
  }

  if (!/^\d+$/.test(digits)) return null;
  if (!digits.startsWith("0")) return null;

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 9) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  return null;
}

// ----- טבלת לידים -----

const tableState = {
  search: "",
  stageFilter: "all",
  serviceFilter: "all",
  sortField: "createdAt",
  sortDirection: "desc",
};

function formatDateDMY(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function getReadableTextColor(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#2E1F38" : "#FFFFFF";
}

function getFilteredSortedLeads() {
  const searchTerm = tableState.search.trim().toLowerCase();
  const strippedSearch = searchTerm.replace(/[\s-]/g, "");

  const filtered = LEADS.filter((lead) => {
    const strippedPhone = lead.phone.replace(/[\s-]/g, "").toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      lead.clientName.toLowerCase().includes(searchTerm) ||
      strippedPhone.includes(strippedSearch);
    const matchesStage = tableState.stageFilter === "all" || lead.stage === tableState.stageFilter;
    const matchesService =
      tableState.serviceFilter === "all" || lead.serviceType === tableState.serviceFilter;
    return matchesSearch && matchesStage && matchesService;
  });

  const directionMultiplier = tableState.sortDirection === "asc" ? 1 : -1;
  filtered.sort((a, b) => {
    if (tableState.sortField === "estimatedValue") {
      return ((a.estimatedValue ?? 0) - (b.estimatedValue ?? 0)) * directionMultiplier;
    }
    if (a.createdAt < b.createdAt) return -1 * directionMultiplier;
    if (a.createdAt > b.createdAt) return 1 * directionMultiplier;
    return 0;
  });

  return filtered;
}

function createCell(text) {
  const td = document.createElement("td");
  td.className = "py-2 px-3 border-b border-sand/60";
  td.textContent = text;
  return td;
}

function createActionsCell(lead) {
  const td = document.createElement("td");
  td.className = "py-2 px-3 border-b border-sand/60";

  if (!addedLeadIds.has(lead.id)) {
    return td;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "flex items-center justify-end gap-3";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "עריכה";
  editButton.className = "text-xs text-sage hover:underline";
  editButton.setAttribute("aria-label", `עריכת הליד של ${lead.clientName}`);
  editButton.addEventListener("click", () => openEditLeadModal(lead.id));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "מחיקה";
  deleteButton.className = "text-xs text-red-700 hover:underline";
  deleteButton.setAttribute("aria-label", `מחיקת הליד של ${lead.clientName}`);
  deleteButton.addEventListener("click", () => handleDeleteLead(lead.id));

  wrapper.appendChild(editButton);
  wrapper.appendChild(deleteButton);
  td.appendChild(wrapper);
  return td;
}

function createLeadRow(lead) {
  const tr = document.createElement("tr");
  tr.className = "hover:bg-cream/60";

  tr.appendChild(createCell(lead.clientName));
  tr.appendChild(createCell(lead.phone));
  tr.appendChild(createCell(lead.serviceType));
  tr.appendChild(createCell(lead.propertyType));
  tr.appendChild(createCell(lead.source));

  const stageTd = document.createElement("td");
  stageTd.className = "py-2 px-3 border-b border-sand/60";
  const badge = document.createElement("span");
  badge.className = "inline-block px-2 py-1 rounded-full text-xs font-medium";
  badge.style.backgroundColor = STAGE_COLORS[lead.stage];
  badge.style.color = getReadableTextColor(STAGE_COLORS[lead.stage]);
  badge.textContent = lead.stage;
  stageTd.appendChild(badge);
  tr.appendChild(stageTd);

  tr.appendChild(
    createCell(lead.estimatedValue === null ? "-" : currencyFormatter.format(lead.estimatedValue))
  );
  tr.appendChild(createCell(formatDateDMY(lead.createdAt)));
  tr.appendChild(createActionsCell(lead));

  return tr;
}

const sortableHeaders = {
  estimatedValue: document.getElementById("th-value"),
  createdAt: document.getElementById("th-date"),
};

function updateSortIndicators() {
  Object.entries(sortableHeaders).forEach(([field, th]) => {
    const arrow = th.querySelector(".sort-arrow");
    if (field === tableState.sortField) {
      th.setAttribute("aria-sort", tableState.sortDirection === "asc" ? "ascending" : "descending");
      arrow.textContent = tableState.sortDirection === "asc" ? "▲" : "▼";
    } else {
      th.setAttribute("aria-sort", "none");
      arrow.textContent = "";
    }
  });
}

function handleHeaderSort(field) {
  if (tableState.sortField === field) {
    tableState.sortDirection = tableState.sortDirection === "asc" ? "desc" : "asc";
  } else {
    tableState.sortField = field;
    tableState.sortDirection = "desc";
  }
  renderTable();
}

function renderTable() {
  const tableBody = document.getElementById("table-body");
  const countEl = document.getElementById("table-count");
  const leads = getFilteredSortedLeads();

  tableBody.textContent = "";

  if (leads.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 9;
    td.className = "py-6 text-center text-taupe";
    td.textContent = "לא נמצאו לידים מתאימים לחיפוש או לסינון";
    tr.appendChild(td);
    tableBody.appendChild(tr);
  } else {
    leads.forEach((lead) => tableBody.appendChild(createLeadRow(lead)));
  }

  countEl.textContent = `מוצגים ${leads.length} מתוך ${LEADS.length} לידים`;
  updateSortIndicators();
}

function populateSelectOptions(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function initTableControls() {
  const searchInput = document.getElementById("table-search");
  const stageSelect = document.getElementById("table-filter-stage");
  const serviceSelect = document.getElementById("table-filter-service");

  populateSelectOptions(stageSelect, STAGE_ORDER);
  populateSelectOptions(serviceSelect, Object.keys(SERVICE_COLORS));

  searchInput.addEventListener("input", () => {
    tableState.search = searchInput.value;
    renderTable();
  });
  stageSelect.addEventListener("change", () => {
    tableState.stageFilter = stageSelect.value;
    renderTable();
  });
  serviceSelect.addEventListener("change", () => {
    tableState.serviceFilter = serviceSelect.value;
    renderTable();
  });

  Object.entries(sortableHeaders).forEach(([field, th]) => {
    th.addEventListener("click", () => handleHeaderSort(field));
    th.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleHeaderSort(field);
      }
    });
  });
}

// ----- הוספה, עריכה, מחיקה ושמירת נתונים -----

const STORAGE_KEY = "studio-leads-dashboard:added-leads";
let addedLeadCounter = 0;
const addedLeadIds = new Set();

function readStoredAddedLeadsRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeStoredAddedLeads(leads) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch (error) {
    // אין גישה לאחסון - הדף ממשיך לעבוד בלי שמירה
  }
}

function clearStoredAddedLeads() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // אין גישה לאחסון - אין מה לנקות
  }
}

function isValidStoredLead(item) {
  if (!item || typeof item !== "object") return false;
  if (typeof item.id !== "string" || item.id.length === 0 || item.id.length > 120) return false;
  if (typeof item.clientName !== "string" || item.clientName.length === 0 || item.clientName.length > 60) {
    return false;
  }
  if (typeof item.phone !== "string" || item.phone.length === 0 || item.phone.length > 80) return false;
  if (typeof item.email !== "string" || item.email.length > 80) return false;
  if (!Object.prototype.hasOwnProperty.call(SERVICE_COLORS, item.serviceType)) return false;
  if (!PROPERTY_TYPES.includes(item.propertyType)) return false;
  if (item.source !== "" && !SOURCES.includes(item.source)) return false;
  if (!STAGE_ORDER.includes(item.stage)) return false;
  if (
    item.estimatedValue !== null &&
    (typeof item.estimatedValue !== "number" || Number.isNaN(item.estimatedValue) || item.estimatedValue < 0)
  ) {
    return false;
  }
  if (typeof item.createdAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(item.createdAt)) return false;
  if (
    item.consultationDate !== null &&
    (typeof item.consultationDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(item.consultationDate))
  ) {
    return false;
  }
  return true;
}

function loadValidAddedLeads() {
  return readStoredAddedLeadsRaw().filter(isValidStoredLead);
}

function persistAddedLeads() {
  const addedLeads = LEADS.filter((lead) => addedLeadIds.has(lead.id));
  writeStoredAddedLeads(addedLeads);
}

function buildLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildNewLead(values) {
  const id = `lead-u-${Date.now()}-${addedLeadCounter++}`;
  return {
    id,
    clientName: values.name,
    phone: values.phone,
    email: values.email,
    serviceType: values.serviceType,
    propertyType: values.propertyType,
    source: values.source,
    stage: "פנייה חדשה",
    estimatedValue: values.estimatedValue,
    createdAt: buildLocalDateString(),
    consultationDate: null,
  };
}

function findLeadById(id) {
  return LEADS.find((lead) => lead.id === id);
}

const FIELD_ERROR_IDS = {
  name: "lead-name-error",
  phone: "lead-phone-error",
  serviceType: "lead-service-error",
  propertyType: "lead-property-error",
  estimatedValue: "lead-value-error",
};

function clearFormErrors() {
  Object.values(FIELD_ERROR_IDS).forEach((id) => {
    const el = document.getElementById(id);
    el.textContent = "";
    el.classList.add("hidden");
  });
}

function showFormErrors(errors) {
  Object.entries(errors).forEach(([field, message]) => {
    const el = document.getElementById(FIELD_ERROR_IDS[field]);
    el.textContent = message;
    el.classList.remove("hidden");
  });
}

function validateLeadForm(values) {
  const errors = {};
  if (values.name === "") errors.name = "שדה חובה - יש למלא שם";

  if (values.phone === "") {
    errors.phone = "שדה חובה - יש למלא טלפון";
  } else if (normalizePhone(values.phone) === null) {
    errors.phone = "מספר טלפון לא תקין - יש להזין מספר ישראלי, לדוגמה 050-123-4567";
  }

  if (values.serviceType === "") errors.serviceType = "שדה חובה - יש לבחור סוג שירות";
  if (values.propertyType === "") errors.propertyType = "שדה חובה - יש לבחור סוג נכס";
  if (values.estimatedValueRaw !== "" && Number(values.estimatedValueRaw) < 0) {
    errors.estimatedValue = "שווי משוער לא יכול להיות שלילי";
  }
  return errors;
}

const addLeadModal = document.getElementById("add-lead-modal");
const addLeadButton = document.getElementById("add-lead-button");
const addLeadForm = document.getElementById("add-lead-form");
const addLeadCancelButton = document.getElementById("add-lead-cancel");
const resetDemoButton = document.getElementById("reset-demo-button");
const leadFormTitle = document.getElementById("add-lead-title");
const leadFormSubmitButton = document.getElementById("lead-form-submit-button");
const leadStageField = document.getElementById("lead-stage-field");
const leadStageSelect = document.getElementById("lead-stage");

let lastFocusedBeforeModal = null;
let editingLeadId = null;

function handleModalKeydown(event) {
  if (event.key === "Escape") {
    closeAddLeadModal();
  }
}

function openAddLeadModal() {
  lastFocusedBeforeModal = document.activeElement;
  addLeadModal.classList.remove("hidden");
  addLeadModal.classList.add("flex");
  document.getElementById("lead-name").focus();
  document.addEventListener("keydown", handleModalKeydown);
}

function closeAddLeadModal() {
  addLeadModal.classList.add("hidden");
  addLeadModal.classList.remove("flex");
  addLeadForm.reset();
  clearFormErrors();
  editingLeadId = null;
  leadFormTitle.textContent = "הוספת ליד חדש";
  leadFormSubmitButton.textContent = "שמירת ליד";
  leadStageField.classList.add("hidden");
  document.removeEventListener("keydown", handleModalKeydown);
  if (lastFocusedBeforeModal) lastFocusedBeforeModal.focus();
}

function openModalForAdd() {
  editingLeadId = null;
  leadFormTitle.textContent = "הוספת ליד חדש";
  leadFormSubmitButton.textContent = "שמירת ליד";
  leadStageField.classList.add("hidden");
  openAddLeadModal();
}

function openEditLeadModal(leadId) {
  const lead = findLeadById(leadId);
  if (!lead) return;

  editingLeadId = leadId;
  leadFormTitle.textContent = "עריכת ליד";
  leadFormSubmitButton.textContent = "שמירת שינויים";
  leadStageField.classList.remove("hidden");

  document.getElementById("lead-name").value = lead.clientName;
  document.getElementById("lead-phone").value = lead.phone;
  document.getElementById("lead-service").value = lead.serviceType;
  document.getElementById("lead-property").value = lead.propertyType;
  document.getElementById("lead-email").value = lead.email;
  document.getElementById("lead-source").value = lead.source;
  document.getElementById("lead-value").value = lead.estimatedValue === null ? "" : lead.estimatedValue;
  leadStageSelect.value = lead.stage;

  openAddLeadModal();
}

function applyConsultationDateRule(lead, newStage) {
  if (newStage === "פגישת ייעוץ בשטח (בתשלום)" && lead.consultationDate === null) {
    lead.consultationDate = buildLocalDateString();
  } else if (newStage === "פנייה חדשה" || newStage === "שיחת היכרות טלפונית") {
    lead.consultationDate = null;
  }
}

function handleLeadFormSubmit(event) {
  event.preventDefault();
  clearFormErrors();

  const values = {
    name: document.getElementById("lead-name").value.trim(),
    phone: document.getElementById("lead-phone").value.trim(),
    serviceType: document.getElementById("lead-service").value,
    propertyType: document.getElementById("lead-property").value,
    email: document.getElementById("lead-email").value.trim(),
    source: document.getElementById("lead-source").value,
    estimatedValueRaw: document.getElementById("lead-value").value,
  };

  const errors = validateLeadForm(values);
  if (Object.keys(errors).length > 0) {
    showFormErrors(errors);
    return;
  }

  const normalizedPhone = normalizePhone(values.phone);
  const estimatedValue = values.estimatedValueRaw === "" ? null : Number(values.estimatedValueRaw);

  if (editingLeadId) {
    const lead = findLeadById(editingLeadId);
    if (lead) {
      const newStage = leadStageSelect.value;
      lead.clientName = values.name;
      lead.phone = normalizedPhone;
      lead.serviceType = values.serviceType;
      lead.propertyType = values.propertyType;
      lead.email = values.email;
      lead.source = values.source;
      lead.estimatedValue = estimatedValue;
      applyConsultationDateRule(lead, newStage);
      lead.stage = newStage;
      persistAddedLeads();
    }
  } else {
    const newLead = buildNewLead({
      name: values.name,
      phone: normalizedPhone,
      serviceType: values.serviceType,
      propertyType: values.propertyType,
      email: values.email,
      source: values.source,
      estimatedValue,
    });
    LEADS.push(newLead);
    addedLeadIds.add(newLead.id);
    persistAddedLeads();
  }

  closeAddLeadModal();
  renderKpis();
  renderCharts();
  renderTable();
}

function handleDeleteLead(leadId) {
  const lead = findLeadById(leadId);
  if (!lead) return;

  const confirmed = confirm(`למחוק את הליד של ${lead.clientName}? הפעולה אינה הפיכה.`);
  if (!confirmed) return;

  const index = LEADS.findIndex((item) => item.id === leadId);
  if (index !== -1) LEADS.splice(index, 1);
  addedLeadIds.delete(leadId);
  persistAddedLeads();

  renderKpis();
  renderCharts();
  renderTable();
}

function handleResetDemo() {
  const confirmed = confirm("לאפס את נתוני הדמה? הפעולה תמחק את כל הלידים שנוספו ואינה הפיכה.");
  if (!confirmed) return;

  clearStoredAddedLeads();
  for (let i = LEADS.length - 1; i >= 0; i -= 1) {
    if (addedLeadIds.has(LEADS[i].id)) {
      LEADS.splice(i, 1);
    }
  }
  addedLeadIds.clear();

  renderKpis();
  renderCharts();
  renderTable();
}

function initAddLeadModal() {
  populateSelectOptions(document.getElementById("lead-service"), Object.keys(SERVICE_COLORS));
  populateSelectOptions(document.getElementById("lead-property"), PROPERTY_TYPES);
  populateSelectOptions(document.getElementById("lead-source"), SOURCES);
  populateSelectOptions(leadStageSelect, STAGE_ORDER);

  addLeadButton.addEventListener("click", openModalForAdd);
  addLeadCancelButton.addEventListener("click", closeAddLeadModal);
  addLeadModal.addEventListener("click", (event) => {
    if (event.target === addLeadModal) closeAddLeadModal();
  });
  addLeadForm.addEventListener("submit", handleLeadFormSubmit);
  resetDemoButton.addEventListener("click", handleResetDemo);
}

loadValidAddedLeads().forEach((lead) => {
  LEADS.push(lead);
  addedLeadIds.add(lead.id);
});

renderKpis();
renderCharts();

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    if (funnelChartInstance) funnelChartInstance.update();
    if (servicesChartInstance) servicesChartInstance.update();
  });
}

initTableControls();
initAddLeadModal();
renderTable();
