document.getElementById("fileInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (evt) {
    try {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(worksheet, { defval: 0 });

      console.log("JSON leído:", json);

      const labels = json.map(r => r.semana);
      const ventas = json.map(r => Number(r.ventas));
      const inversion = json.map(r => Number(r.inversion));
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

    } catch (error) {
      console.error("Error procesando Excel:", error);
      alert("Error leyendo el archivo. Asegúrate de que las columnas sean: semana, ventas, inversion.");
    }
  };

  reader.readAsArrayBuffer(file);
});
