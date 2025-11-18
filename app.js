// === FUNCIONES ===
function formatCurrency(num) {
  return "$" + num.toLocaleString("en-US");
}

function drawCharts(labels, ventas, inversion, ganancia) {
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
        },
        {
          label: "Inversión",
          data: inversion,
        },
        {
          label: "Ganancia",
          data: ganancia,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } },
    },
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
            ganancia.reduce((a, b) => a + b, 0),
          ],
        },
      ],
    },
    options: {
      responsive: true,
    },
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

    const labels = json.map((r) => r.semana);
    const ventas = json.map((r) => Number(r.ventas) || 0);
    const inversion = json.map((r) => Number(r.inversion) || 0);
    const ganancia = ventas.map((v, i) => v - inversion[i]);

    const totalVentas = ventas.reduce((a, b) => a + b, 0);
    const totalInversion = inversion.reduce((a, b) => a + b, 0);
    const totalGanancia = ganancia.reduce((a, b) => a + b, 0);

    document.getElementById("ventas").innerText = formatCurrency(totalVentas);
    document.getElementById("inversion").innerText = formatCurrency(totalInversion);
    document.getElementById("ganancia").innerText = formatCurrency(totalGanancia);

    const pct = totalVentas > 0 ? ((totalGanancia / totalVentas) * 100).toFixed(2) : "0.00";
    document.getElementById("porcentaje").innerText = pct + "%";

    drawCharts(labels, ventas, inversion, ganancia);
  };
});
