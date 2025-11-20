// === FUNCIONES ===
function formatCurrency(num) {
  return "$" + num.toLocaleString("en-US");
}

function drawCharts(labels, ventas, inversion, ganancia) {
  const strongColors = ["#ffcc00", "#ff4444", "#00e5ff", "#66ff66", "#ff66ff", "#ff9933"];  

  // BARRAS
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
      plugins: { legend: { labels: { color: "#fff", font: { size: 14 } } } },
      scales: { x: { ticks: { color: "#fff" } }, y: { ticks: { color: "#fff" } } }
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
          backgroundColor: [strongColors[0], strongColors[1], strongColors[2]],
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#fff", font: { size: 14 } } } }
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

    const json = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    // Ajuste por si Excel trae columnas con mayúscula inicial
    const labels = json.map((r) => r.semana || r.Semana || r.SEMANA);
    const ventas = json.map((r) => Number(r.ventas || r.Ventas || r.VENTAS) || 0);
    const inversion = json.map((r) => Number(r.inversion || r.Inversion || r.INVERSION) || 0);
    const ganancia = ventas.map((v, i) => v - inversion[i]);

    const totalVentas = ventas.reduce((a, b) => a + b, 0);
    const totalInversion = inversion.reduce((a, b) => a + b, 0);
    const totalGanancia = ganancia.reduce((a, b) => a + b, 0);

    document.getElementById("ventasTotal").innerText = formatCurrency(totalVentas);
    document.getElementById("inversionTotal").innerText = formatCurrency(totalInversion);
    document.getElementById("gananciaTotal").innerText = formatCurrency(totalGanancia);

    const pct = totalVentas > 0 ? ((totalGanancia / totalVentas) * 100).toFixed(2) : "0.00";
    document.getElementById("porcentajeTotal").innerText = pct + "%";

    drawCharts(labels, ventas, inversion, ganancia);
  };
});
