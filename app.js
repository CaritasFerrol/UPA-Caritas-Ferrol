let geojsonData;
let infoUPA;
const map = L.map('map').setView([43.483, -8.236], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

fetch('upas.geojson')
.then(response => response.json())
.then(data => {

    geojsonData = data;

    infoUPA = {

        "UPA CENTRO": {
            direccion: "Rúa María 55, 2º 15402 Ferrol",
            telefono: "SOLO POR WHATSAPP 624424470",
            atencion: "CITA PREVIA Lunes de 9:00h a 12:00h y Martes 16:30h a 18:00h"
        },

        "UPA CANIDOS": {
            direccion: "Rúa Poeta Pérez Parallé 1, 15401 Ferrol",
            telefono: "881936876 - 6048568422",
            atencion: "CITA REVIA"
        },

        "UPA EL PILAR": {
            direccion: "Calle Ramón y Cajal 14, 15403 Ferrol",
            telefono: "638300350",
            atencion: "CITA PREVIA jueves de 17:00h a 18:30h"
        },

        "UPA CARANZA": {
            direccion: "Rúa Castelao 36 15406 Ferrol",
            telefono: "694305377 puede ser por Whatsapp",
            atencion: "CITA PREVIA jueves de 17:00h a 19:00h"
        },

        "UPA ENSANCHE": {
            direccion: "Calle Río Lérez, 21 bajo 15404 Ferrol",
            telefono: "604052893",
            atencion: "CITA PREVIA"
        },

        "UPA RURAL": {
            direccion: "AV. De Santa Mariña Esquina con Camiño Laxeiro 15401 Ferrol",
            telefono: "663894678",
            atencion: "CITA PREVIA"
        },

        "NARON": {
            direccion: "AYUNTAMIENTO DE NARÓN Plaza de Galicia, s/n, 15570 Narón",
            telefono: "981337700 - 981 111 024",
            atencion: "Usualmente derivados desde el ayuntamiento"
        }

    };

    L.geoJSON(data, {

        style: function(feature) {

            const colores = {
                "UPA CENTRO": "#fe8f1af7",
                "UPA CANIDOS": "#4CAF50",
                "UPA EL PILAR": "#d807fd",
                "UPA CARANZA": "#0040ff",
                "UPA ENSANCHE": "#F44336",
                "NARON": "#ffd900",
                "UPA RURAL": "#02cffdef"
            };

            return {
                color: colores[feature.properties.name] || "#000",
                fillColor: colores[feature.properties.name] || "#3388ff",
                fillOpacity: 0.4,
                weight: 2
            };
        },

        onEachFeature: function(feature, layer) {

            const upa = infoUPA[feature.properties.name];

            layer.bindPopup(`
                <h3>${feature.properties.name}</h3>

                <b>Dirección:</b><br>
                ${upa?.direccion || "No disponible"}

                <br><br>

                <b>Teléfono:</b><br>
                ${upa?.telefono || "No disponible"}

                <br><br>

                <b>Atención:</b><br>
                ${upa?.atencion || "No disponible"}
            `);

        }

    }).addTo(map);

});document.getElementById("buscarBtn").addEventListener("click", buscarDireccion);

document.getElementById("direccion").addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        buscarDireccion();
    }

});

let marcadorBusqueda;

async function buscarDireccion() {

    const direccion = document.getElementById("direccion").value;

    if (!direccion) {
        alert("Escriba una dirección");
        return;
    }

    const url =
        "https://nominatim.openstreetmap.org/search?format=json&q=" +
        encodeURIComponent(direccion);

    const respuesta = await fetch(url);

    const datos = await respuesta.json();

    if (datos.length === 0) {

        document.getElementById("resultado").innerHTML = `
            <h2>Resultado</h2>
            <p>No se encontró la dirección.</p>
        `;

        return;
    }

    const lat = parseFloat(datos[0].lat);
    const lon = parseFloat(datos[0].lon);

    map.setView([lat, lon], 16);

    if (marcadorBusqueda) {
        map.removeLayer(marcadorBusqueda);
    }

    marcadorBusqueda = L.marker([lat, lon]).addTo(map);
    const punto = turf.point([lon, lat]);

let upaEncontrada = null;

for (const feature of geojsonData.features) {

    console.log(feature.properties.name);

    if (turf.booleanPointInPolygon(punto, feature)) {
        const capaUPA = L.geoJSON(feature);
map.fitBounds(capaUPA.getBounds());

        upaEncontrada = feature.properties.name;
        console.log("UPA encontrada:", upaEncontrada);

        break;
    }

}

  if (upaEncontrada) {

    const datosUPA = infoUPA[upaEncontrada];

    document.getElementById("resultado").innerHTML = `

<div class="card-upa">

    <div class="upa-titulo">

        <div class="icono-upa">
            <i class="fa-solid fa-house"></i>
        </div>

        <h2>${upaEncontrada}</h2>

    </div>

    <div class="info-item">

        <div class="icono rojo">
            <i class="fa-solid fa-location-dot"></i>
        </div>

        <div>
            <strong>Dirección encontrada:</strong><br>
            ${datos[0].display_name}
        </div>

    </div>

    <hr>

    <div class="info-item">

        <div class="icono azul">
            <i class="fa-solid fa-building"></i>
        </div>

        <div>
            <strong>Dirección UPA:</strong><br>
            ${datosUPA.direccion}
        </div>

    </div>

    <div class="info-item">

        <div class="icono verde">
            <i class="fa-solid fa-phone"></i>
        </div>

        <div>
            <strong>Teléfono:</strong><br>
            ${datosUPA.telefono}
        </div>

    </div>

    <div class="info-item">

        <div class="icono morado">
            <i class="fa-regular fa-clock"></i>
        </div>

        <div>
            <strong>Atención:</strong><br>
            ${datosUPA.atencion}
        </div>

    </div>

    <div class="aviso-upa">

        <i class="fa-solid fa-circle-info"></i>

        La dirección buscada pertenece a la zona de
        <strong>${upaEncontrada}</strong>

    </div>

</div>

`;

} else {

    document.getElementById("resultado").innerHTML = `
        <h2>Resultado</h2>
        <p>Dirección localizada, pero fuera de las zonas UPA definidas.</p>
    `;
}
}