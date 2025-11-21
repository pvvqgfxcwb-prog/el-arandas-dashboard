document.getElementById("fileInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsArrayBuffer(file);

    reader.onload = function (ev) {
        try {
            const data = new Uint8Array(ev.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convierte Excel a JSON
            let json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

            // FILTRA filas vacías
            json = json.filter(row =>
                row.semana || row.Semana || row.SEMANA
            );

            if (json.length === 0) {
                throw new Error("Archivo sin datos válidos");
            }

            // Normaliza columnas (quita espacios y convierte minúsculas)
            const normalize = (txt) =>
                String(txt || "")
                    .trim()
                    .toLowerCase();

            // Extrae columnas
            const labels = json.map(r => normalize(r.semana || r.Semana || r.SEMANA));
            const ventas = json.map(r => Number(r.ventas || r.Ventas || r.VENTAS) || 0);
            const inversion = json.map(r => Number(r.inversion || r.Inversion || r.INVERSION) || 0);

            const ganancia = ventas.map((v, i) => v - inversion[i]);

            // Totales
            const totalVentas = ventas.reduce((a, b) => a + b, 0);
            const totalInversion = inversion.reduce((a, b) => a + b, 0);
            const totalGanancia = ganancia.reduce((a, b) => a + b, 0);
            const pct = totalVentas > 0 ? ((totalGanancia / totalVentas) * 100).toFixed(2) : "0.00";

            // Imprime en pantalla
            document.getElementById("ventasTotal").innerText = formatCurrency(totalVentas);
            document.getElementById("inversionTotal").innerText = formatCurrency(totalInversion);
            document.getElementById("gananciaTotal").innerText = formatCurrency(totalGanancia);
            document.getElementById("porcentajeTotal").innerText = pct + "%";

            // Dibuja gráficas
            drawCharts(labels, ventas, inversion, ganancia);

        } catch (err) {
            alert("Error leyendo el archivo. Asegúrate de que las columnas sean: semana, ventas, inversion.");
            console.error(err);
        }
    };
});
