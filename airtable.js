// שכבת תקשורת עם Airtable: שמירת פרטי החיבור ב-localStorage (במכשיר הזה בלבד),
// ובניית קריאות ה-REST API לטבלה שהוגדרה בחיבור. אין טוקן קבוע בקוד.

const AIRTABLE_CREDENTIALS_KEY = "studio-leads-dashboard:airtable-credentials";
const AIRTABLE_DEFAULT_TABLE_NAME = "Leads";

class AirtableError extends Error {
  constructor(message) {
    super(message);
    this.name = "AirtableError";
  }
}

function getStoredCredentials() {
  try {
    const raw = localStorage.getItem(AIRTABLE_CREDENTIALS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.token !== "string" ||
      typeof parsed.baseId !== "string" ||
      typeof parsed.table !== "string"
    ) {
      return null;
    }
    if (!parsed.token || !parsed.baseId || !parsed.table) return null;
    return parsed;
  } catch (error) {
    return null;
  }
}

function saveCredentials(token, baseId, table) {
  try {
    localStorage.setItem(AIRTABLE_CREDENTIALS_KEY, JSON.stringify({ token, baseId, table }));
  } catch (error) {
    // אין גישה לאחסון - החיבור יישמר רק עד רענון הדף
  }
}

function clearCredentials() {
  try {
    localStorage.removeItem(AIRTABLE_CREDENTIALS_KEY);
  } catch (error) {
    // אין גישה לאחסון - אין מה לנקות
  }
}

function buildApiUrl(baseId, table, pathSuffix) {
  return `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(table)}${pathSuffix}`;
}

async function airtableRequest(method, pathSuffix, body) {
  const credentials = getStoredCredentials();
  if (!credentials) throw new AirtableError("אין חיבור פעיל ל-Airtable");

  let response;
  try {
    response = await fetch(buildApiUrl(credentials.baseId, credentials.table, pathSuffix), {
      method,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new AirtableError("שגיאת תקשורת מול Airtable - יש לבדוק את החיבור לאינטרנט ולנסות שוב");
  }

  if (response.status === 401 || response.status === 403) {
    throw new AirtableError(
      "אסימון הגישה (Personal Access Token) שגוי או שאין לו הרשאה מתאימה - יש לבדוק את ה-Token"
    );
  }
  if (response.status === 404) {
    throw new AirtableError(
      `לא נמצא מאגר (Base) או טבלה בשם "${credentials.table}" - יש לבדוק את ה-Base ID ואת שם/מזהה הטבלה ב-Airtable`
    );
  }
  if (response.status === 429) {
    throw new AirtableError("חריגה ממכסת הבקשות ל-Airtable (Rate Limit) - יש להמתין מעט ולנסות שוב");
  }
  if (!response.ok) {
    let detail = "";
    try {
      const data = await response.json();
      if (data && data.error && data.error.message) detail = ` (${data.error.message})`;
    } catch (parseError) {
      // אין פרטי שגיאה קריאים בתשובה
    }
    throw new AirtableError(`שגיאה בתקשורת עם Airtable${detail}`);
  }

  return response.json();
}

function mapRecordToLead(record) {
  const fields = record.fields || {};
  return {
    id: record.id,
    clientName: typeof fields.clientName === "string" ? fields.clientName : "",
    phone: typeof fields.phone === "string" ? fields.phone : "",
    email: typeof fields.email === "string" ? fields.email : "",
    serviceType: typeof fields.serviceType === "string" ? fields.serviceType : "",
    propertyType: typeof fields.propertyType === "string" ? fields.propertyType : "",
    source: typeof fields.source === "string" ? fields.source : "",
    stage: typeof fields.stage === "string" ? fields.stage : "",
    estimatedValue: typeof fields.estimatedValue === "number" ? fields.estimatedValue : null,
    createdAt: typeof fields.createdAt === "string" ? fields.createdAt : "",
    consultationDate: typeof fields.consultationDate === "string" ? fields.consultationDate : null,
  };
}

async function fetchLeadsFromAirtable() {
  let records = [];
  let offset;
  do {
    const query = offset ? `?pageSize=100&offset=${encodeURIComponent(offset)}` : "?pageSize=100";
    const data = await airtableRequest("GET", query);
    records = records.concat(data.records);
    offset = data.offset;
  } while (offset);
  return records.map(mapRecordToLead);
}

async function createLeadInAirtable(fields) {
  const data = await airtableRequest("POST", "", { fields });
  return mapRecordToLead(data);
}

async function updateLeadInAirtable(recordId, fields) {
  const data = await airtableRequest("PATCH", `/${encodeURIComponent(recordId)}`, { fields });
  return mapRecordToLead(data);
}

async function deleteLeadInAirtable(recordId) {
  await airtableRequest("DELETE", `/${encodeURIComponent(recordId)}`);
}
