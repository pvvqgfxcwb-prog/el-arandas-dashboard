/* app.js for El Arandas Dashboard PWA
   Reads an .xlsx file (exported from Numbers), computes totals and draws charts.
*/
const fileInput = document.getElementById('fileInput');

let chart1, chart2, chart3;

function formatCurrency(n){
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function safeNumber(v){
  if (v === undefined || v === null || v === '') return 0;
  if (typeof v === 'number') return v;
  let s = v.toString().replace(/[^0-9.-]+/g,'');
  let parsed = parseFloat(s);
  return isNaN(parsed) ? 0 : parsed;
}

function renderTotals(totalVentas, totalInversion, totalGanancia){
  document.getElementById('ventas').innerText = formatCurrency(totalVentas);
  document.getElementById('inversion').innerText = formatCurrency(totalInversion);
  document.getElementById('ganancia').innerText = formatCurrency(totalGanancia);
  let pct = totalVentas > 0 ? (totalGanancia / totalVentas * 100) : 0;
  document.getElementById('porcentaje').innerText = pct.toFixed(2) + '%';
}

function destroyCharts(){
  if (chart1) { chart1.destroy(); chart1 = null; }
  if (chart2) { chart2.destroy(); chart2 = null; }
  if (chart3) { chart3.destroy(); chart3 = null; }
}

function drawCharts(labels, ventas, inversion, ganancia){
  destroyCharts();
  const ctx1 = document.getElementById('chart1').getContext('2d');
  chart1 = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Ventas', data: ventas, backgroundColor: '#C73A29' },
        { label: 'Inversión', data: inversion, backgroundColor: '#F4C76D' }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false }
  });

  const ctx2 = document.getElementById('chart2').getContext('2d');
  chart2 = new Chart(ctx2, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: 'Ganancia', data: ganancia, borderColor:'#C73A29', fill:false, tension:0.3 }
      ]
    },
    options:{ responsive:true, maintainAspectRatio:false }
  });

  const ctx3 = document.getElementById('chart3').getContext('2d');
  chart3 = new Chart(ctx3, {
    type: 'pie',
    data: {
      labels:['Ganancia','Inversión'],
      datasets:[{ data:[ganancia.reduce((a,b)=>a+b,0), inversion.reduce((a,b)=>a+b,0)], backgroundColor:['#C73A29','#F4C76D'] }]
    },
    options:{ responsive:true, maintainAspectRatio:false }
  });
}

fileInput.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    const data = new Uint8Array(ev.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const first = workbook.SheetNames[0];
    const sheet = workbook.Sheets[first];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: null });

    if (!json || json.length === 0) {
      alert('El archivo está vacío o no tiene datos en la primera hoja.');
      return;
    }

    // attempt to detect column names (case-insensitive)
    const row0 = Object.keys(json[0]).map(k => k.toLowerCase());
    // map keys
    function keyFor(possible){
      for (let p of possible){
        let idx = row0.findIndex(r => r === p.toLowerCase());
        if (idx !== -1) return Object.keys(json[0])[idx];
      }
      return null;
    }
    const kFecha = keyFor(['fecha','date']);
    const kVentas = keyFor(['ventas','venta','sales']);
    const kInversion = keyFor(['inversion','inversión','investment']);
    const kCostos = keyFor(['costos','costo','cost']);
    const kGanancia = keyFor(['ganancianeta','ganancia','profit','netprofit']);

    let labels = [];
    let ventas = [];
    let inversion = [];
    let ganancia = [];

    json.forEach(row=>{
      let vVentas = kVentas ? safeNumber(row[kVentas]) : 0;
      let vInversion = kInversion ? safeNumber(row[kInversion]) : 0;
      let vGanancia = 0;
      if (kGanancia && row[kGanancia] != null) vGanancia = safeNumber(row[kGanancia]);
      else if (kCostos && row[kCostos] != null) vGanancia = vVentas - safeNumber(row[kCostos]);
      else vGanancia = vVentas - vInversion;

      let label = kFecha && row[kFecha] ? row[kFecha].toString() : '';
      labels.push(label);
      ventas.push(vVentas);
      inversion.push(vInversion);
      ganancia.push(vGanancia);
    });

    const totalVentas = ventas.reduce((a,b)=>a+b,0);
    const totalInversion = inversion.reduce((a,b)=>a+b,0);
    const totalGanancia = ganancia.reduce((a,b)=>a+b,0);

    renderTotals(totalVentas, totalInversion, totalGanancia);
    drawCharts(labels, ventas, inversion, ganancia);
    // save the file to cache for offline use (optional)
    if ('caches' in window) {
      caches.open('el-arandas-cache').then(cache=>{
        cache.put('last-data', new Response(JSON.stringify({labels,ventas,inversion,ganancia,totals:{totalVentas,totalInversion,totalGanancia}})));
      });
    }
  };
  reader.readAsArrayBuffer(file);
});