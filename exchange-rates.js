// שליפת שערי חליפין (ILS -> USD, EUR) מה-API החינמי Frankfurter, בלי מפתח.
// נכשל בעדינות: קריאה שנכשלת מחזירה שגיאה ברורה, ואינה פוגעת בשאר הדאשבורד.

const FRANKFURTER_API_URL = "https://api.frankfurter.dev/v1/latest?base=ILS&symbols=USD,EUR";
const EXCHANGE_RATE_SOURCE_LABEL = "Frankfurter API";

class ExchangeRateError extends Error {
  constructor(message) {
    super(message);
    this.name = "ExchangeRateError";
  }
}

async function fetchExchangeRates() {
  let response;
  try {
    response = await fetch(FRANKFURTER_API_URL);
  } catch (networkError) {
    throw new ExchangeRateError("שגיאת תקשורת בטעינת שערי החליפין - ניתן לנסות שוב בלחיצה על רענון");
  }

  if (!response.ok) {
    throw new ExchangeRateError("שירות שערי החליפין אינו זמין כרגע - ניתן לנסות שוב בלחיצה על רענון");
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new ExchangeRateError("תשובה לא תקינה משירות שערי החליפין");
  }

  if (
    !data ||
    typeof data.date !== "string" ||
    !data.rates ||
    typeof data.rates.USD !== "number" ||
    typeof data.rates.EUR !== "number"
  ) {
    throw new ExchangeRateError("תשובה לא תקינה משירות שערי החליפין");
  }

  return {
    date: data.date,
    usdRate: data.rates.USD,
    eurRate: data.rates.EUR,
    source: EXCHANGE_RATE_SOURCE_LABEL,
  };
}
