//gestorventas/js/ventasHoy.js

document.addEventListener('DOMContentLoaded', function() {
    cargarTotalVentasHoy();
});

function cargarTotalVentasHoy() {
    fetch('../api/get_ventas_hoy.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error("Error en la API:", data.error);
            } else {
                document.getElementById('totalVentasHoy').textContent = data.total_hoy;
            }
        })
        .catch(error => console.error('Error:', error));
}
