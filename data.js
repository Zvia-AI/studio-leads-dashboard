// נתוני דמה בלבד - כל השמות, המיילים והטלפונים בדויים (ראו SPEC.md סעיף 3).

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysAgoThisMonth(n) {
  const today = new Date();
  return daysAgo(Math.min(n, today.getDate() - 1));
}

const LEADS = [
  { id: "lead-01", clientName: "נועה כהן", phone: "050-000-0001", email: "lead01@example.com", serviceType: "תכנון ועיצוב מלא", propertyType: "חלל מסחרי / קליניקה", source: "המלצה מלקוח עבר", stage: "פנייה חדשה", estimatedValue: 68000, createdAt: daysAgo(1), consultationDate: null },
  { id: "lead-02", clientName: "איתי לוי", phone: "050-000-0002", email: "lead02@example.com", serviceType: "הלבשת הבית (Home Styling)", propertyType: "ריענון חלל בודד", source: "אתר הסטודיו", stage: "פנייה חדשה", estimatedValue: 12000, createdAt: daysAgo(2), consultationDate: null },
  { id: "lead-03", clientName: "מיכל אברהם", phone: "050-000-0003", email: "lead03@example.com", serviceType: "חבילת שינויי דיירים", propertyType: "דירת קבלן", source: "פייסבוק", stage: "פנייה חדשה", estimatedValue: 22000, createdAt: daysAgo(0), consultationDate: null },
  { id: "lead-04", clientName: "דניאל שרון", phone: "050-000-0004", email: "lead04@example.com", serviceType: "יום קניות מרוכז", propertyType: "שיפוץ כולל", source: "אינסטגרם", stage: "פנייה חדשה", estimatedValue: 3200, createdAt: daysAgo(3), consultationDate: null },

  { id: "lead-05", clientName: "תמר גולן", phone: "050-000-0005", email: "lead05@example.com", serviceType: "פגישת ייעוץ ממוקדת", propertyType: "בית פרטי / וילה", source: "אתר הסטודיו", stage: "שיחת היכרות טלפונית", estimatedValue: 450, createdAt: daysAgo(5), consultationDate: null },
  { id: "lead-06", clientName: "יונתן פרץ", phone: "050-000-0006", email: "lead06@example.com", serviceType: "תכנון ועיצוב מלא", propertyType: "חלל מסחרי / קליניקה", source: "פייסבוק", stage: "שיחת היכרות טלפונית", estimatedValue: 95000, createdAt: daysAgo(6), consultationDate: null },
  { id: "lead-07", clientName: "שירה מזרחי", phone: "050-000-0007", email: "lead07@example.com", serviceType: "הלבשת הבית (Home Styling)", propertyType: "ריענון חלל בודד", source: "אינסטגרם", stage: "שיחת היכרות טלפונית", estimatedValue: 18500, createdAt: daysAgo(4), consultationDate: null },
  { id: "lead-08", clientName: "אורי בן-דוד", phone: "050-000-0008", email: "lead08@example.com", serviceType: "חבילת שינויי דיירים", propertyType: "דירת קבלן", source: "המלצה מלקוח עבר", stage: "שיחת היכרות טלפונית", estimatedValue: 31000, createdAt: daysAgo(8), consultationDate: null },

  { id: "lead-09", clientName: "רוני אשכנזי", phone: "050-000-0009", email: "lead09@example.com", serviceType: "יום קניות מרוכז", propertyType: "שיפוץ כולל", source: "אתר הסטודיו", stage: "פגישת ייעוץ בשטח (בתשלום)", estimatedValue: 4500, createdAt: daysAgo(20), consultationDate: daysAgoThisMonth(10) },
  { id: "lead-10", clientName: "הדר צדוק", phone: "050-000-0010", email: "lead10@example.com", serviceType: "פגישת ייעוץ ממוקדת", propertyType: "בית פרטי / וילה", source: "פייסבוק", stage: "פגישת ייעוץ בשטח (בתשלום)", estimatedValue: 900, createdAt: daysAgo(15), consultationDate: daysAgoThisMonth(3) },
  { id: "lead-11", clientName: "עומר וקנין", phone: "050-000-0011", email: "lead11@example.com", serviceType: "תכנון ועיצוב מלא", propertyType: "חלל מסחרי / קליניקה", source: "אינסטגרם", stage: "פגישת ייעוץ בשטח (בתשלום)", estimatedValue: 54000, createdAt: daysAgo(25), consultationDate: daysAgoThisMonth(18) },
  { id: "lead-12", clientName: "ליאת דהן", phone: "050-000-0012", email: "lead12@example.com", serviceType: "הלבשת הבית (Home Styling)", propertyType: "ריענון חלל בודד", source: "המלצה מלקוח עבר", stage: "פגישת ייעוץ בשטח (בתשלום)", estimatedValue: 9800, createdAt: daysAgo(12), consultationDate: daysAgoThisMonth(2) },

  { id: "lead-13", clientName: "גיל שפירא", phone: "050-000-0013", email: "lead13@example.com", serviceType: "חבילת שינויי דיירים", propertyType: "דירת קבלן", source: "אתר הסטודיו", stage: "הצעת מחיר בהמתנה", estimatedValue: 16500, createdAt: daysAgo(35), consultationDate: daysAgo(20) },
  { id: "lead-14", clientName: "נטע רוזן", phone: "050-000-0014", email: "lead14@example.com", serviceType: "יום קניות מרוכז", propertyType: "שיפוץ כולל", source: "פייסבוק", stage: "הצעת מחיר בהמתנה", estimatedValue: 2600, createdAt: daysAgo(40), consultationDate: daysAgo(25) },
  { id: "lead-15", clientName: "אסף ברק", phone: "050-000-0015", email: "lead15@example.com", serviceType: "פגישת ייעוץ ממוקדת", propertyType: "בית פרטי / וילה", source: "אינסטגרם", stage: "הצעת מחיר בהמתנה", estimatedValue: 650, createdAt: daysAgo(28), consultationDate: daysAgo(14) },

  { id: "lead-16", clientName: "מאיה סבג", phone: "050-000-0016", email: "lead16@example.com", serviceType: "תכנון ועיצוב מלא", propertyType: "חלל מסחרי / קליניקה", source: "המלצה מלקוח עבר", stage: "נסגר בהצלחה", estimatedValue: 120000, createdAt: daysAgo(90), consultationDate: daysAgo(60) },
  { id: "lead-17", clientName: "רועי אוחנה", phone: "050-000-0017", email: "lead17@example.com", serviceType: "הלבשת הבית (Home Styling)", propertyType: "ריענון חלל בודד", source: "אתר הסטודיו", stage: "נסגר בהצלחה", estimatedValue: 24000, createdAt: daysAgo(75), consultationDate: daysAgo(50) },
  { id: "lead-18", clientName: "קרן עמר", phone: "050-000-0018", email: "lead18@example.com", serviceType: "חבילת שינויי דיירים", propertyType: "דירת קבלן", source: "פייסבוק", stage: "נסגר בהצלחה", estimatedValue: 38000, createdAt: daysAgo(110), consultationDate: daysAgo(80) },

  { id: "lead-19", clientName: "יובל גבאי", phone: "050-000-0019", email: "lead19@example.com", serviceType: "יום קניות מרוכז", propertyType: "שיפוץ כולל", source: "אינסטגרם", stage: "לא רלוונטי", estimatedValue: 5800, createdAt: daysAgo(60), consultationDate: null },
  { id: "lead-20", clientName: "שני אזולאי", phone: "050-000-0020", email: "lead20@example.com", serviceType: "פגישת ייעוץ ממוקדת", propertyType: "בית פרטי / וילה", source: "המלצה מלקוח עבר", stage: "לא רלוונטי", estimatedValue: 1200, createdAt: daysAgo(95), consultationDate: daysAgo(45) },
];
