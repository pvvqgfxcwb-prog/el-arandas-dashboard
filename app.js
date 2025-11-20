// === FUNCIONES ===
function formatCurrency(num) {
  return "$" + num.toLocaleString("en-US");
}

function normalizeKeys(row) {
  const fixed = {};
  Object.keys(row).forEach(k => {
    fixed[k.trim().toLowerCase()] = row[k];
  });
  return fixed;
}

function drawCharts(labels, ventas, inversion, ganancia) {
  const strongColors = ["#ffcc00", "#ff4444", "#00e5ff"];

  // BARRAS
  const bar = document.getElementById("barChart").getContext("2d");
  new Chart(bar, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Ventas",
          data: ventas,
          backgroundColor: strongColors[0],
        },
        {
          label: "Inversión",
          data: inversion,
          backgroundColor: strongColors[1],
        },
        {
          label: "Ganancia",
          data: ganancia,
          backgroundColor: strongColors[2],
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#fff" } } },
      scales: {
        x: { ticks: { color: "#fff" } },
        y: { ticks: { color: "#fff" } }
      }
    }
  });

  // PASTEL
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
      plugins: { legend: { labels: { color: "#fff" } } }
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
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let json = XLSX.utils.sheet_to_json(worksheet, { defval: 0 });

    // Normalizamos claves
    json = json.map(r => normalizeKeys(r));

    const labels = json.map(r => r.semana);
    const ventas = json.map(r => Number(r.ventas) || 0);
    const inversion = json.map(r => Number(r.inversion) || 0);
    const ganancia = ventas.map((v, i) => v - inversion[i]);

    // Totales
    const totalVentas = ventas.reduce((a, b) => a + b, 0);
    const totalInversion = inversion.reduce((a, b) => a + b, 0);
    const totalGanancia = ganancia.reduce((a, b) => a + b, 0);

    document.getElementById("ventasTotal").innerText = formatCurrency(totalVentas);
    document.getElementById("inversionTotal").innerText = formatCurrency(totalInversion);
    document.getElementById("gananciaTotal").innerText = formatCurrency(totalGanancia);
    document.getElementById("porcentajeTotal").innerText =
      tot
