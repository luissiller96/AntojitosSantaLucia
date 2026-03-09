document.addEventListener('DOMContentLoaded', () => {

  const controllerPath = '../controller/controller_comanda.php';
  const refreshInterval = 10000;

  const columnContainers = {
    pendiente: document.querySelector('#columna-pendiente .tasks-container'),
    en_preparacion: document.querySelector('#columna-preparacion .tasks-container'),
    lista: document.querySelector('#columna-lista .tasks-container')
  };

   let activeTicketsData = []; 

  // --- NUEVO: Elementos del Modal ---
  const modal = document.getElementById('detalle-modal');
  const modalContent = document.getElementById('modal-body-content');
  const closeModalBtn = document.querySelector('.modal-close-btn');

 async function fetchAndDisplayComandas() {
    try {
      const response = await fetch(`${controllerPath}?op=listar_activas`);
      const ticketsAgrupados = await response.json();
      
      // Ahora esta línea funcionará porque la variable ya existe
      activeTicketsData = ticketsAgrupados; 
      
      renderBoard(ticketsAgrupados); 

    } catch (error) {
      console.error('Error al obtener comandas:', error);
    }
  }

  function renderBoard(tickets) {
    Object.values(columnContainers).forEach(container => container.innerHTML = '');

    tickets.forEach(ticket => {
      const ticketHTML = createTicketHTML(ticket);
      const status = ticket.com_estatus;
      if (columnContainers[status]) {
        columnContainers[status].insertAdjacentHTML('beforeend', ticketHTML);
      }
    });

    addEventListenersToButtons();
  }
 function createTicketHTML(ticket) {
    const itemsHTML = ticket.items.map(item => `
        <div class="ticket-item-detail">
            <span class="item-qty">(${item.com_cantidad})</span>
            <span class="item-name">${item.pr_nombre}</span>
            ${item.com_ingredientes_omitir ? `<small class="item-notes">Sin: ${item.com_ingredientes_omitir}</small>` : ''}
            ${item.com_comentarios ? `<small class="item-notes">Nota: ${item.com_comentarios}</small>` : ''}
        </div>
    `).join('');

    const botonHTML = ticket.com_estatus !== 'lista' ? `<div class="note-actions"><button class="advance-btn">Avanzar →</button></div>` : '';
    const clienteHTML = ticket.cliente ? `<h2 class="client-name">👤 ${ticket.cliente}</h2>` : '';

    return `
        <div class="order-note-container" data-id="${ticket.ticket_id}" data-status="${ticket.com_estatus}">
            <div class="status-badge status-${ticket.com_estatus}"><span>${ticket.com_estatus.replace('_', ' ')}</span></div>
            <div class="note-header">
                <button class="info-btn" data-ticket-id="${ticket.ticket_id}">i</button>
                <h1>Orden #<span class="ticket-id">${ticket.ticket_id}</span></h1>
                ${clienteHTML}
            </div>
            <div class="note-body">
                ${itemsHTML}
            </div>
            ${botonHTML}
        </div>
    `;
  }


  function addEventListenersToButtons() {
    document.querySelectorAll('.advance-btn').forEach(button => {
      button.addEventListener('click', handleAdvanceClick);
    });

    document.querySelectorAll('.info-btn').forEach(button => {
      button.addEventListener('click', handleInfoClick);
    });
  }


  function handleInfoClick(event) {
    const ticketId = event.target.dataset.ticketId;
    const ticketData = activeTicketsData.find(t => t.ticket_id == ticketId);

    if (ticketData) {
      showDetailsModal(ticketData);
    }
  }
  // --- NUEVO: Función para poblar y mostrar el modal ---
   function showDetailsModal(ticket) {
    const clienteHTML = ticket.cliente ? `<h2>Cliente: ${ticket.cliente}</h2>` : '';

    const itemsModalHTML = ticket.items.map(item => `
      <div class="modal-item">
        <div class="modal-item-header">
          <span class="qty">(${item.com_cantidad})</span>
          <span class="name">${item.pr_nombre}</span>
        </div>
        ${(item.com_ingredientes_omitir || item.com_comentarios) ? `
        <div class="modal-item-details">
          ${item.com_ingredientes_omitir ? `<p><span class="label">Sin:</span> ${item.com_ingredientes_omitir}</p>` : ''}
          ${item.com_comentarios ? `<p><span class="label">Nota:</span> ${item.com_comentarios}</p>` : ''}
        </div>
        ` : ''}
      </div>
    `).join('');

    modalContent.innerHTML = `
      <h1>Orden #${ticket.ticket_id}</h1>
      ${clienteHTML}
      ${itemsModalHTML}
    `;

    modal.style.display = 'flex';
  }

  function closeModal() {
    modal.style.display = 'none';
  }


    async function handleAdvanceClick(event) {
    const ticketElement = event.target.closest('.order-note-container');
    const ticketId = ticketElement.dataset.id;
    const currentStatus = ticketElement.dataset.status;

    const nextStatusMap = { 'pendiente': 'en_preparacion', 'en_preparacion': 'lista' };
    const newStatus = nextStatusMap[currentStatus];

    if (newStatus) {
      event.target.disabled = true;
      event.target.textContent = 'Avanzando...';

      const formData = new FormData();
      formData.append('ticket_id', ticketId);
      formData.append('estatus', newStatus);

      try {
        const response = await fetch(`${controllerPath}?op=actualizar_estatus_ticket`, {
          method: 'POST',
          body: formData
        });
        const result = await response.json();
        if (result.status === 'success') {
          fetchAndDisplayComandas();
        }
      } catch (error) {
        console.error('Error de red:', error);
      }
    }
  }


  closeModalBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });



  fetchAndDisplayComandas();
  setInterval(fetchAndDisplayComandas, refreshInterval);
});