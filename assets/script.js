const endpoint = "https://mindicador.cl/api/";
const resultadoCambio = document.querySelector(".resultado");
const botonResultado = document.querySelector(".buscar");
const inputCLP = document.querySelector(".inputCLP");
const selectMoneda = document.getElementById("moneda");
let monedaSeleccionada = null;

async function getMonedas() {
  try {
    const res = await fetch(endpoint);
    const monedas = await res.json();
    return monedas;
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    resultadoCambio.textContent =
      "Ocurrió un error al recuperar los datos de las monedas.";
    return {};
  }
}

async function renderResultado() {
  try {
    const monedas = await getMonedas();
    monedaSeleccionada = selectMoneda.value.toLowerCase();
    const valorCLP = parseFloat(inputCLP.value);
    getDataToChart();

    if (monedas[monedaSeleccionada] && !isNaN(valorCLP)) {
      const valorMoneda = monedas[monedaSeleccionada].valor;
      const resultado = valorCLP / valorMoneda;
      resultadoCambio.textContent = `Resultado: ${resultado.toFixed(2)} ${
        monedas[monedaSeleccionada].nombre
      }`;
    } else {
      resultadoCambio.textContent = "Ingrese un valor válido.";
    }
  } catch (error) {
    console.error("Error en el procesamiento:", error);
    resultadoCambio.textContent = "Ocurrió un error al procesar la solicitud.";
  }
}

botonResultado.addEventListener("click", renderResultado);

async function getDataToChart() {
  const fechaActual = new Date();

  let fechas = [];
  let arrayObjetosParaGraficar = [];

  for (let i = 1; i <= 10; i++) {
    let nuevaFecha = fechaActual.setDate(fechaActual.getDate() - 1);
    fechas.push(nuevaFecha);
  }

  for (let fecha of fechas) {
    const fechaYaFormateada = formatearFecha(fecha);

    const valor = await getFechas(monedaSeleccionada, fechaYaFormateada);
    arrayObjetosParaGraficar.push({
      fecha: fechaYaFormateada,
      valor: Number(valor),
    });
  }
  pintarGrafico(arrayObjetosParaGraficar);
}

async function getFechas(moneda, fecha) {
  const endpointFechas = "https://mindicador.cl/api/" + moneda + "/" + fecha;
  try {
    const res = await fetch(endpointFechas);
    const resFechas = await res.json();
    return resFechas.serie[0]?.valor ? resFechas.serie[0].valor : 0;
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    resultadoCambio.textContent =
      "Ocurrió un error al recuperar los datos de las monedas.";
    return {};
  }
}

function pintarGrafico(lista) {
  const labels = lista.map((item) => item.fecha);
  const data = lista.map((item) => Number(item.valor));

  const datasets = [
    {
      label: "Historial últimos 10 días",
      borderColor: "rgb(255, 99, 132)",
      data,
    },
  ];
  const config = {
    type: "line",
    data: { labels, datasets },
  };

  const myChart = document.getElementById("my-chart");
  myChart.style.backgroundColor = "white";
  new Chart(myChart, config);
}

function formatearFecha(fechaInput) {
  let fecha = new Date(fechaInput);
  let dia = fecha.getDate();
  let mes = fecha.getMonth() + 1;
  let anio = fecha.getFullYear();

  if (dia < 10) dia = "0" + dia;
  if (mes < 10) mes = "0" + mes;

  let fechaFormateada = `${dia}-${mes}-${anio}`;

  return fechaFormateada;
}
