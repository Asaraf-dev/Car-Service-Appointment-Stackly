
/*--- Admin Appointments Data ---*/
document.addEventListener("DOMContentLoaded", function () {
  const root = document.querySelector(".cs-aa");
  if (!root) return;

  const $ = (selector) => root.querySelector(selector);
  const pageSize = 6;
  let currentPage = 1;
  let nextId = 1007;
  let activeAppointmentId = null;
  let toastTimer;
  let previousOverflow = "";

  const appointments = [
    {id:"APT-1001",customer:"James Reed",email:"james.reed@example.com",phone:"9876543210",vehicle:"Ford Focus",registration:"TN01AB1234",service:"General Service",date:"2026-06-18",time:"09:30",status:"Pending",notes:"Please check the engine oil and filters."},
    {id:"APT-1002",customer:"Amelia Moore",email:"amelia.moore@example.com",phone:"9876543211",vehicle:"Honda Civic",registration:"TN09CD4567",service:"Oil Change",date:"2026-06-18",time:"10:30",status:"Confirmed",notes:"Use the recommended engine oil."},
    {id:"APT-1003",customer:"Daniel Lewis",email:"daniel.lewis@example.com",phone:"9876543212",vehicle:"Volkswagen Golf",registration:"TN22EF7890",service:"Brake Inspection",date:"2026-06-19",time:"11:00",status:"In Progress",notes:"Customer reported a noise while braking."},
    {id:"APT-1004",customer:"Sophia Patel",email:"sophia.patel@example.com",phone:"9876543213",vehicle:"Toyota Corolla",registration:"TN37GH1234",service:"AC Service",date:"2026-06-19",time:"12:30",status:"Completed",notes:"AC inspection and service completed."},
    {id:"APT-1005",customer:"Oliver Smith",email:"oliver.smith@example.com",phone:"9876543214",vehicle:"Hyundai Creta",registration:"TN45JK5678",service:"Engine Diagnostics",date:"2026-06-20",time:"09:00",status:"Confirmed",notes:"Check engine warning light."},
    {id:"APT-1006",customer:"Isabella Brown",email:"isabella.brown@example.com",phone:"9876543215",vehicle:"Maruti Baleno",registration:"TN18LM9012",service:"Wheel Alignment",date:"2026-06-20",time:"14:00",status:"Cancelled",notes:"Appointment cancelled by customer."}
  ];

  const statusClasses = {
    "Pending":"pending",
    "Confirmed":"confirmed",
    "In Progress":"in-progress",
    "Completed":"completed",
    "Cancelled":"cancelled"
  };

  /*--- Safe Text Rendering ---*/
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
    });
  }

  function formatDate(value) {
    if (!value) return "Not set";
    const parts = value.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return value;
    return new Intl.DateTimeFormat("en-IN", {
      day:"2-digit",month:"short",year:"numeric"
    }).format(new Date(parts[0], parts[1] - 1, parts[2]));
  }

  function formatTime(value) {
    if (!value) return "Not set";
    const parts = value.split(":").map(Number);
    if (parts.length !== 2 || parts.some(Number.isNaN)) return value;
    return new Intl.DateTimeFormat("en-IN", {
      hour:"2-digit",minute:"2-digit",hour12:true
    }).format(new Date(2000, 0, 1, parts[0], parts[1]));
  }

  function getStatusClass(status) {
    return statusClasses[status] || "pending";
  }

  function initials(name) {
    return String(name || "?").trim().split(/\s+/).slice(0, 2)
      .map(part => part.charAt(0).toUpperCase()).join("");
  }

  /*--- Notifications ---*/
  function showToast(message, isError = false) {
    const toast = $("#cs-aa-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle("cs-aa-toast-error", isError);
    toast.classList.add("cs-aa-toast-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("cs-aa-toast-visible");
    }, 3000);
  }

  /*--- Summary Cards ---*/
  function updateStats() {
    const count = status => appointments.filter(item => item.status === status).length;
    $("#cs-aa-total").textContent = appointments.length.toLocaleString("en-IN");
    $("#cs-aa-pending").textContent = count("Pending").toLocaleString("en-IN");
    $("#cs-aa-confirmed").textContent = count("Confirmed").toLocaleString("en-IN");
    $("#cs-aa-progress").textContent = count("In Progress").toLocaleString("en-IN");
    $("#cs-aa-completed").textContent = count("Completed").toLocaleString("en-IN");
  }

  /*--- Service Filter Options ---*/
  function populateServices() {
    const select = $("#cs-aa-service-filter");
    const selected = select.value;
    const services = [...new Set(appointments.map(item => item.service))].sort();
    select.innerHTML = '<option value="">All services</option>' +
      services.map(service => `<option value="${escapeHTML(service)}">${escapeHTML(service)}</option>`).join("");
    if (services.includes(selected)) select.value = selected;
  }

  /*--- Search and Filter Results ---*/
  function getFilteredAppointments() {
    const search = $("#cs-aa-search").value.trim().toLowerCase();
    const status = $("#cs-aa-status-filter").value;
    const service = $("#cs-aa-service-filter").value;
    const date = $("#cs-aa-date-filter").value;

    return appointments.filter(item => {
      const searchable = [
        item.id,item.customer,item.email,item.phone,item.vehicle,
        item.registration,item.service,item.date,item.time,item.status
      ].join(" ").toLowerCase();

      return (!search || searchable.includes(search)) &&
        (!status || item.status === status) &&
        (!service || item.service === service) &&
        (!date || item.date === date);
    }).sort((a, b) => b.id.localeCompare(a.id, undefined, {numeric:true}));
  }

  /*--- Appointment Table Rendering ---*/
  function renderAppointments() {
    const filtered = getFilteredAppointments();
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * pageSize;
    const visible = filtered.slice(start, start + pageSize);

    $("#cs-aa-record-count").textContent = `${filtered.length} record${filtered.length === 1 ? "" : "s"}`;
    $("#cs-aa-results-label").textContent = filtered.length
      ? `Showing ${start + 1}–${start + visible.length} of ${filtered.length} appointments`
      : "Showing 0 appointments";
    $("#cs-aa-page-label").textContent = `${currentPage} / ${totalPages}`;
    $("#cs-aa-prev").disabled = currentPage <= 1;
    $("#cs-aa-next").disabled = currentPage >= totalPages;
    $("#cs-aa-empty").hidden = filtered.length !== 0;
    $(".cs-aa-table-wrap").hidden = filtered.length === 0;
    $(".cs-aa-table-footer").hidden = filtered.length === 0;

    $("#cs-aa-table-body").innerHTML = visible.map(item => `
      <tr>
        <td><span class="cs-aa-id">${escapeHTML(item.id)}</span><span class="cs-aa-subtext">Service booking</span></td>
        <td>
          <div class="cs-aa-customer">
            <span class="cs-aa-customer-avatar">${escapeHTML(initials(item.customer))}</span>
            <div><strong>${escapeHTML(item.customer)}</strong><span class="cs-aa-subtext">${escapeHTML(item.phone)}</span></div>
          </div>
        </td>
        <td><div class="cs-aa-vehicle"><strong>${escapeHTML(item.vehicle)}</strong><span class="cs-aa-subtext">${escapeHTML(item.registration)}</span></div></td>
        <td><span class="cs-aa-service">${escapeHTML(item.service)}</span></td>
        <td><span class="cs-aa-date">${escapeHTML(formatDate(item.date))}</span><span class="cs-aa-time">${escapeHTML(formatTime(item.time))}</span></td>
        <td><span class="cs-aa-status cs-aa-status-${getStatusClass(item.status)}">${escapeHTML(item.status)}</span></td>
        <td>
          <div class="cs-aa-row-actions">
            <button type="button" class="cs-aa-icon-btn" data-aa-view="${escapeHTML(item.id)}" aria-label="View ${escapeHTML(item.id)}" title="View details"><i class="bi bi-eye"></i></button>
            ${item.status === "Pending" ? `<button type="button" class="cs-aa-icon-btn" data-aa-confirm="${escapeHTML(item.id)}" aria-label="Confirm ${escapeHTML(item.id)}" title="Confirm appointment"><i class="bi bi-check2"></i></button>` : ""}
            ${item.status === "Confirmed" ? `<button type="button" class="cs-aa-icon-btn" data-aa-start="${escapeHTML(item.id)}" aria-label="Start ${escapeHTML(item.id)}" title="Start service"><i class="bi bi-tools"></i></button>` : ""}
            ${item.status === "In Progress" ? `<button type="button" class="cs-aa-icon-btn" data-aa-complete="${escapeHTML(item.id)}" aria-label="Complete ${escapeHTML(item.id)}" title="Mark completed"><i class="bi bi-check2-all"></i></button>` : ""}
            ${["Pending","Confirmed","In Progress"].includes(item.status) ? `<button type="button" class="cs-aa-icon-btn" data-aa-cancel="${escapeHTML(item.id)}" aria-label="Cancel ${escapeHTML(item.id)}" title="Cancel appointment"><i class="bi bi-x-lg"></i></button>` : ""}
          </div>
        </td>
      </tr>
    `).join("");
  }

  /*--- Modal Scroll Lock ---*/
  function openModal(modal) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal.classList.add("cs-aa-modal-open");
    modal.setAttribute("aria-hidden", "false");
    const closeButton = modal.querySelector(".cs-aa-modal-close");
    if (closeButton) closeButton.focus();
  }

  function closeModal(modal) {
    modal.classList.remove("cs-aa-modal-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousOverflow;
  }

  function findAppointment(id) {
    return appointments.find(item => item.id === id);
  }

  /*--- Appointment Details ---*/
  function showAppointment(id) {
    const item = findAppointment(id);
    if (!item) return;

    activeAppointmentId = id;
    $("#cs-aa-modal-title").textContent = item.id;
    $("#cs-aa-modal-body").innerHTML = `
      <div class="cs-aa-detail-grid">
        <div class="cs-aa-detail-item"><span>Customer</span><strong>${escapeHTML(item.customer)}</strong></div>
        <div class="cs-aa-detail-item"><span>Status</span><strong><span class="cs-aa-status cs-aa-status-${getStatusClass(item.status)}">${escapeHTML(item.status)}</span></strong></div>
        <div class="cs-aa-detail-item"><span>Email</span><strong>${escapeHTML(item.email)}</strong></div>
        <div class="cs-aa-detail-item"><span>Phone</span><strong>${escapeHTML(item.phone)}</strong></div>
        <div class="cs-aa-detail-item"><span>Vehicle</span><strong>${escapeHTML(item.vehicle)}</strong></div>
        <div class="cs-aa-detail-item"><span>Registration</span><strong>${escapeHTML(item.registration)}</strong></div>
        <div class="cs-aa-detail-item"><span>Service</span><strong>${escapeHTML(item.service)}</strong></div>
        <div class="cs-aa-detail-item"><span>Date and time</span><strong>${escapeHTML(formatDate(item.date))}<br>${escapeHTML(formatTime(item.time))}</strong></div>
      </div>
      <div class="cs-aa-detail-note"><strong>Customer notes</strong>${escapeHTML(item.notes || "No additional notes.")}</div>
    `;

    let actions = '<button type="button" class="cs-aa-secondary-btn" data-aa-close>Close</button>';
    if (item.status === "Pending") actions += '<button type="button" class="cs-aa-primary-btn" data-aa-modal-action="Confirmed"><i class="bi bi-check2"></i> Confirm</button>';
    if (item.status === "Confirmed") actions += '<button type="button" class="cs-aa-primary-btn" data-aa-modal-action="In Progress"><i class="bi bi-tools"></i> Start Service</button>';
    if (item.status === "In Progress") actions += '<button type="button" class="cs-aa-primary-btn" data-aa-modal-action="Completed"><i class="bi bi-check2-all"></i> Complete</button>';
    if (["Pending","Confirmed","In Progress"].includes(item.status)) actions += '<button type="button" class="cs-aa-secondary-btn" data-aa-modal-action="Cancelled">Cancel Appointment</button>';
    $("#cs-aa-modal-footer").innerHTML = actions;
    openModal($("#cs-aa-modal"));
  }

  /*--- Update Appointment Status ---*/
  function updateStatus(id, newStatus) {
    const item = findAppointment(id);
    if (!item) return;

    const allowed = {
      "Pending":["Confirmed","Cancelled"],
      "Confirmed":["In Progress","Cancelled"],
      "In Progress":["Completed","Cancelled"],
      "Completed":[],
      "Cancelled":[]
    };

    if (!allowed[item.status]?.includes(newStatus)) {
      showToast("This status change is not available.", true);
      return;
    }

    const message = newStatus === "Cancelled"
      ? `Cancel appointment ${item.id}?`
      : `Change ${item.id} to "${newStatus}"?`;

    if (!window.confirm(message)) return;

    item.status = newStatus;
    updateStats();
    renderAppointments();
    showToast(`${item.id} updated to ${newStatus}.`);

    if ($("#cs-aa-modal").classList.contains("cs-aa-modal-open")) {
      closeModal($("#cs-aa-modal"));
    }
  }

  /*--- Create Appointment Modal ---*/
  function openCreateModal() {
    const form = $("#cs-aa-create-form");
    form.reset();
    const dateInput = $("#cs-aa-create-date");
    const today = new Date();
    dateInput.min = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0")
    ].join("-");
    openModal($("#cs-aa-create-modal"));
  }

  $("#cs-aa-create-form").addEventListener("submit", function (event) {
    event.preventDefault();
    if (!this.reportValidity()) return;

    const data = new FormData(this);
    const phone = String(data.get("phone") || "").trim();
    if (!/^\d{10}$/.test(phone)) {
      showToast("Enter a valid 10-digit phone number.", true);
      return;
    }

    const date = String(data.get("date") || "");
    const time = String(data.get("time") || "");
    if (!date || !time) {
      showToast("Please select an appointment date and time.", true);
      return;
    }

    const item = {
      id:`APT-${nextId++}`,
      customer:String(data.get("customer")).trim(),
      email:String(data.get("email")).trim(),
      phone,
      vehicle:String(data.get("vehicle")).trim(),
      registration:String(data.get("registration")).trim().toUpperCase(),
      service:String(data.get("service")),
      date,
      time,
      status:"Pending",
      notes:String(data.get("notes") || "").trim()
    };

    appointments.push(item);
    populateServices();
    updateStats();
    $("#cs-aa-search").value = "";
    $("#cs-aa-status-filter").value = "";
    $("#cs-aa-service-filter").value = "";
    $("#cs-aa-date-filter").value = "";
    currentPage = 1;
    renderAppointments();
    closeModal($("#cs-aa-create-modal"));
    showToast(`${item.id} created successfully.`);
    this.reset();
  });

  /*--- Table Actions ---*/
  $("#cs-aa-table-body").addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.aaView) showAppointment(button.dataset.aaView);
    if (button.dataset.aaConfirm) updateStatus(button.dataset.aaConfirm, "Confirmed");
    if (button.dataset.aaStart) updateStatus(button.dataset.aaStart, "In Progress");
    if (button.dataset.aaComplete) updateStatus(button.dataset.aaComplete, "Completed");
    if (button.dataset.aaCancel) updateStatus(button.dataset.aaCancel, "Cancelled");
  });

  /*--- Modal Actions ---*/
  $("#cs-aa-modal-footer").addEventListener("click", function (event) {
    const button = event.target.closest("[data-aa-modal-action]");
    if (button && activeAppointmentId) {
      updateStatus(activeAppointmentId, button.dataset.aaModalAction);
      return;
    }
    if (event.target.closest("[data-aa-close]")) closeModal($("#cs-aa-modal"));
  });

  root.addEventListener("click", function (event) {
    if (event.target.closest("[data-aa-close]")) closeModal($("#cs-aa-modal"));
    if (event.target.closest("[data-aa-create-close]")) closeModal($("#cs-aa-create-modal"));
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    [$("#cs-aa-modal"), $("#cs-aa-create-modal")].forEach(modal => {
      if (modal.classList.contains("cs-aa-modal-open")) closeModal(modal);
    });
  });

  /*--- Search and Filter Events ---*/
  ["cs-aa-search","cs-aa-status-filter","cs-aa-service-filter","cs-aa-date-filter"].forEach(id => {
    $("#" + id).addEventListener(id === "cs-aa-search" ? "input" : "change", function () {
      currentPage = 1;
      renderAppointments();
    });
  });

  function resetFilters() {
    $("#cs-aa-search").value = "";
    $("#cs-aa-status-filter").value = "";
    $("#cs-aa-service-filter").value = "";
    $("#cs-aa-date-filter").value = "";
    currentPage = 1;
    renderAppointments();
  }

  $("#cs-aa-reset").addEventListener("click", resetFilters);
  $("#cs-aa-empty-reset").addEventListener("click", resetFilters);
  $("#cs-aa-prev").addEventListener("click", function () {
    if (currentPage > 1) { currentPage--; renderAppointments(); }
  });
  $("#cs-aa-next").addEventListener("click", function () {
    const total = Math.max(1, Math.ceil(getFilteredAppointments().length / pageSize));
    if (currentPage < total) { currentPage++; renderAppointments(); }
  });
  $("#cs-aa-add-btn").addEventListener("click", openCreateModal);

  /*--- Form Input Validation ---*/
const customerNameInput = $('#cs-aa-create-form [name="customer"]');
const phoneInput = $('#cs-aa-create-form [name="phone"]');

customerNameInput.addEventListener("input", function () {
  this.value = this.value
    .replace(/[^A-Za-z ]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+/, "");
});

phoneInput.addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 10);
});

  /*--- Initial Render ---*/
  populateServices();
  updateStats();
  renderAppointments();
});
/*--- Admin Appointments Initialization End ---*/
