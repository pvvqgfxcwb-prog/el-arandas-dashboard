// ================================
//  EL ARANDAS DASHBOARD - APP.JS
//  Versión: Lectura de data.xlsx
// ================================

// Formato de moneda
function formatCurrency(value) {
    return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

// Función principal al seleccionar archivo .xlsx
document.getElementById("fileInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = function (ev) {
        const data = new Uint8Array(ev.target.result);

        // === Leer Excel con SheetJS ===
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convertir hoja a JSON
        const registros = XLSX.utils.sheet_to_json(worksheet, { defval: null });

        if (registros.length === 0) {
            alert("El archivo Excel está vacío.");
            return;
        }

        // Extraer columnas
        const semanas = registros.map(r => r.semana);
        const ventas = registros.map(r => Number(r.ventas) || 0);
        const inversion = registros.map(r => Number(r.inversion) || 0);
        const comentarios = registros.map(r => r.comentario || "");

        // Calcular ganancia
        const ganancia = ventas.map((v, i) => v - inversion[i]);

        // Totales
        const totalVentas = ventas.reduce((a, b) => a + b, 0);
        const totalInversion = inversion.reduce((a, b) => a + b, 0);
        const totalGanancia = ganancia.reduce((a, b) => a + b, 0);
        const porcentaje = totalVentas > 0 ? ((totalGanancia / totalVentas) * 100).toFixed(2) : 0;

        // Actualizar tarjetas
        document.getElementById("ventas").innerText = formatCurrency(totalVentas);
        document.getElementById("inversion").innerText = formatCurrency(totalInversion);
        document.getElementById("ganancia").innerText = formatCurrency(totalGanancia);
        document.getElementById("porcentaje").innerText = porcentaje + "%";

        // Dibujar gráficas
        drawCharts(semanas, ventas, inversion, ganancia);
    };
});

// ================================
//        GRÁFICAS CHART.JS
// ================================

let chart1, chart2;

function drawCharts(semanas, ventas, inversion, ganancia) {
    if (chart1) chart1.destroy();
    if (chart2) chart2.destroy();

    // Comparación ventas vs inversión
    chart1 = new Chart(document.getElementById("chart1"), {
        type: "line",
        data: {
            labels: semanas,
            datasets: [
                {
                    label: "Ventas",
                    data: ventas,
                    borderWidth: 3,
                    tension: 0.3
                },
                {
                    label: "Inversión",
                    data: inversion,
                    borderWidth: 3,
                    tension: 0.3
                }
            ]
        }
    });

    // Ganancia por semana
    chart2 = new Chart(document.getElementById("chart2"), {
        type: "bar",
        data: {
            labels: semanas,
            datasets: [
                {
                    label: "Ganancia",
                    data: ganancia,
                    borderWidth: 2
                }
            ]
        }
    });
}
