// FORMATO DE MONEDA
function formatCurrency(num) {
    return "$" + num.toLocaleString("en-US");
}

// EVENTO PARA CARGAR ARCHIVO
document.getElementById("fileInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = function (ev) {
        const data = new Uint8Array(ev.target.result);

        // Leemos Excel con SheetJS
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheet];

        // Convertimos a JSON
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        // Extraemos columnas
        const semanas = rows.map(r => r.semana);
        const ventas = rows.map(r => Number(r.ventas) || 0);
        const inversion = rows.map(r => Number(r.inversion) || 0);
        const comentarios = rows.map(r => r.comentario || "");

        // GANANCIA por semana
        const ganancia = ventas.map((v, i) => v - inversion[i]);

        // TOTALES
        const totalVentas = ventas.reduce((a, b) => a + b, 0);
        const totalInversion = inversion.reduce((a, b) => a + b, 0);
        const totalGanancia = ganancia.reduce((a, b) => a + b, 0);

        // Actualizamos la UI
        document.getElementById("ventas").innerText = formatCurrency(totalVentas);
        document.getElementById("inversion").innerText = formatCurrency(totalInversion);
        document.getElementById("ganancia").innerText = formatCurrency(totalGanancia);

        const pct = totalVentas > 0 ? ((totalGanancia / totalVentas) * 100).toFixed(2) : "0.00";
        document.getElementById("porcentaje").innerText = pct + "%";

        // Dibujar gráfica
        drawChart(semanas, ventas, inversion, ganancia);
    };
});

// GRAFICAR
let chartInstance = null;

function drawChart(labels, ventas, inversion, ganancia) {
    const ctx = document.getElementById("mainChart").getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Ventas",
                    data: ventas,
                    borderWidth: 3
                },
                {
                    label: "Inversión",
                    data: inversion,
                    borderWidth: 3
                },
                {
                    label: "Ganancia",
                    data: ganancia,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "top" }
            }
        }
    });
}
