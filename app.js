// === FUNCIONES ===
function formatCurrency(num) {
  return "$" + num.toLocaleString("en-US");
}

// Normaliza claves del Excel (quita espacios y pone minúsculas)
function normalizeRow(row) {
  const normalized = {};
  for (let key in row) {
    const cleanKey = key.toString().trim().toLowerCase();
    normalized[cleanKey] = row[key];
  }
  return normalized;
}

function drawCharts(labels, ventas, inversion, ganancia) {
  const strongColors = ["#ffcc00", "#ff4444", "#00e5ff"];

  // === GRÁFICA DE BARRAS ===
  const bar = document.getElementById("barChart").getContext("2d");
  new Chart(bar, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        { label: "Ventas", data: ventas, backgroundColor: strongColors[0] },
        { label: "Inversión", data: inversion, backgroundColor: strongColors[1] },
        { label: "Ganancia", data: ganancia, backgroundColor: strongColors[2] }
      ]
    },
    options: {
      responsive: true,
      animation: { duration: 1500, easing: "easeOutQuart" },
      plugins: { legend: { labels: { color: "#fff" } } },
      scales: {
        x: { ticks: { color: "#fff" } },
        y: { ticks: { color: "#fff" } }
      }
    }
  });

  // === GRÁFICA DE PASTEL ===
  const pie = document.getElementById("pieChart").getContext("2d");
  new Chart(pie, {
    type: "pie",
    data: {
      labels: ["Ventas", "Inversión", "Ganancia"],
      datasets: [
        {
          data: [
            ventas.reduce((a, b) => a + b, 0),
            inversion.reduce((a, b) => a + b, 0),
            ganancia.reduce((a, b) => a + b, 0)
          ],
          backgroundColor: strongColors
        }
      ]
    },
    options: {
      responsive: true,
      animation: { duration: 1400, easing: "easeOutBounce" },
      plugins: {
        legend: {
          labels: { color: "#fff" }
        }
      }
    }
  });
}

// === PROCESAR ARCHIVO EXCEL ===
document.getElementById("fileInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.readAsArrayBuffer(file);

  reader.onload = function (ev) {
    const data = new Uint8Array(ev.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    let json = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    // NORMALIZAR TODAS LAS FILAS
    json = json.map(normalizeRow);

    const labels = json.map((r) => r.semana);
    const ventas = json.map((r) => Number(r.ventas) || 0);
    const inversion = json.map((r) => Number(r.inversion) || 0);
    const ganancia = ventas.map((v, i) => v - inversion[i]);

    const totalVentas = ventas.reduce((a, b) => a + b, 0);
    const totalInversion = inversion.reduce((a, b) => a + b, 0);
    const totalGanancia = ganancia.reduce((a, b) => a + b, 0);
    const pct = totalVentas ? ((totalGanancia / totalVentas) * 100).toFixed(2) : "0.00";

    document.getElementById("ventasTotal").innerText = formatCurrency(totalVentas);
    document.getElementById("inversionTotal").innerText = formatCurrency(totalInversion);
    document.getElementById("gananciaTotal").innerText = formatCurrency(totalGanancia);
    document.getElementById("porcentajeTotal").innerText = pct + "%";

    drawCharts(labels, ventas, inversion, ganancia);
  };
});
