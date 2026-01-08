  const usdInput = document.getElementById("usd");
  const eurInput = document.getElementById("eur");
  const brlInput = document.getElementById("brl");

  let isUpdating = false;

  let rates = {
    USD: 1,
    EUR: null,
    BRL: null
  };

  // ===============================
  // BUSCA DE TAXAS REAIS (API OK)
  // ===============================
  async function fetchRates() {
    try {
      const response = await fetch(
        "https://api.frankfurter.app/latest?from=USD&to=EUR,BRL"
      );

      if (!response.ok) throw new Error("Falha na API");

      const data = await response.json();

      rates.EUR = data.rates.EUR;
      rates.BRL = data.rates.BRL;

      localStorage.setItem("currencyRates", JSON.stringify(rates));

      console.log("✅ Taxas atualizadas:", rates);
    } catch (error) {
      console.error("❌ Erro ao buscar taxas:", error);

      const cached = localStorage.getItem("currencyRates");
      if (cached) {
        rates = JSON.parse(cached);
        console.warn("⚠️ Usando taxas em cache");
      }
    }
  }

  fetchRates();
  setInterval(fetchRates, 1000 * 60 * 60); // 60 minutos

  // ===============================
  // CONVERSÕES
  // ===============================
  function clearAll() {
    usdInput.value = "";
    eurInput.value = "";
    brlInput.value = "";
  }

  function fromUSD(value) {
    eurInput.value = (value * rates.EUR).toFixed(2);
    brlInput.value = (value * rates.BRL).toFixed(2);
  }

  function fromEUR(value) {
    const usdValue = value / rates.EUR;
    usdInput.value = usdValue.toFixed(2);
    brlInput.value = (usdValue * rates.BRL).toFixed(2);
  }

  function fromBRL(value) {
    const usdValue = value / rates.BRL;
    usdInput.value = usdValue.toFixed(2);
    eurInput.value = (usdValue * rates.EUR).toFixed(2);
  }

  // ===============================
  // EVENTOS TRIDIRECIONAIS
  // ===============================
  usdInput.addEventListener("input", () => {
    if (isUpdating || !rates.EUR || !rates.BRL) return;
    if (usdInput.value === "") return clearAll();

    isUpdating = true;
    fromUSD(parseFloat(usdInput.value));
    isUpdating = false;
  });

  eurInput.addEventListener("input", () => {
    if (isUpdating || !rates.EUR || !rates.BRL) return;
    if (eurInput.value === "") return clearAll();

    isUpdating = true;
    fromEUR(parseFloat(eurInput.value));
    isUpdating = false;
  });

  brlInput.addEventListener("input", () => {
    if (isUpdating || !rates.EUR || !rates.BRL) return;
    if (brlInput.value === "") return clearAll();

    isUpdating = true;
    fromBRL(parseFloat(brlInput.value));
    isUpdating = false;
  });