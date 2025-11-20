// === FUNCIONES ===
function formatCurrency(num) {
  return "$" + num.toLocaleString("en-US");
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
        { label: "Ventas", data: ventas, backgroundColor: strongColors[0] },
        { label: "Inversión", data: inversion, backgroundColor: strongColors[1] },
        { label: "Ganancia", data: ganancia, backgroundColor: strongColors[2] }
      ]
    },
    options: {
      responsive: true,
      animation: { duration: 1200 },
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
      datasets: [{
        data: [
          ventas.reduce((a,b)=>a+b,0),
          inversion.reduce((a,b)=>a+b,0),
          ganancia.reduce((a,b)=>a+b,0),
        ],
        backgroundColor: strongColors
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 1500 },
      plugins: { 
        legend: { labels: { color: "#fff" } }
      }
    }
  });
}

// === PROCESAR EXCEL ===
document.getElementById("fileInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.readAsArrayBuffer(file);

  reader.onload = function (ev) {
    const workbook = XLSX.read(ev.target.result, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const json = XLSX.utils.sheet_to_json(sheet, { defval: 0 });

    // Detectar columnas reales
    const first = json[0];
    const colSemana = Object.keys(first).find(k => k.toLowerCase().includes("sem"));
    const colVentas = Object.keys(first).find(k => k.toLowerCase().includes("vent"));
    const colInv = Object.keys(first).find(k => k.toLowerCase().includes("inv"));

    const labels = json.map(r => r[colSemana]);
    const ventas = json.map(r => Number(r[colVentas]));
    const inversion = json.map(r => Number(r[colInv]));
    const ganancia = ventas.map((v, i) => v - inversion[i]);

    const totalVentas = ventas.reduce((a,b)=>a+b,0);
    const totalInversion = inversion.reduce((a,b)=>a+b,0);
    const totalGanancia = ganancia.reduce((a,b)=>a+b,0);

    document.getElementById("ventasTotal").innerText = formatCurrency(totalVentas);
    document.getElementById("inversionTotal").innerText = formatCurrency(totalInversion);
    document.getElementById("gananciaTotal").innerText = formatCurrency(totalGanancia);

    const pct = totalVentas > 0 ? ((totalGanancia / totalVentas) * 100).toFixed(2) : "0.00";
    document.getElementById("porcentajeTotal").innerText = pct + "%";

    drawCharts(labels, ventas, inversion, ganancia);
  };
});
