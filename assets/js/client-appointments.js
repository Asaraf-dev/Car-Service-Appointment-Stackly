
/*--- Client Appointments Initialization ---*/
document.addEventListener("DOMContentLoaded", function () {
  const root = document.querySelector(".cs-ca");
  if (!root) return;

  const $ = selector => root.querySelector(selector);
  const pageSize = 6;
  let currentPage = 1;

  /*--- Sample Appointment Data ---*/
  const appointments = [
    {id:"APT-2001",vehicle:"Honda City",registration:"TN01AB1234",service:"General Service",date:"2026-11-03",time:"10:30",status:"Confirmed"},
    {id:"APT-2002",vehicle:"Hyundai Creta",registration:"TN09CD4567",service:"AC Service",date:"2026-11-08",time:"12:00",status:"Pending"},
    {id:"APT-2003",vehicle:"Honda City",registration:"TN01AB1234",service:"Oil Change",date:"2026-10-10",time:"09:30",status:"Completed"},
    {id:"APT-2004",vehicle:"Hyundai Creta",registration:"TN09CD4567",service:"Brake Inspection",date:"2026-10-15",time:"11:00",status:"Cancelled"},
    {id:"APT-2005",vehicle:"Honda City",registration:"TN01AB1234",service:"Wheel Alignment",date:"2026-11-15",time:"14:00",status:"Confirmed"},
    {id:"APT-2006",vehicle:"Hyundai Creta",registration:"TN09CD4567",service:"Engine Diagnostics",date:"2026-10-20",time:"09:00",status:"Completed"},
    {id:"APT-2007",vehicle:"Honda City",registration:"TN01AB1234",service:"Battery Inspection",date:"2026-11-20",time:"10:00",status:"Pending"}
  ];

  /*--- Safe HTML Rendering ---*/
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[char]);
  }

  function formatDate(value) {
    const parts = value.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return value;
    return new Intl.DateTimeFormat("en-IN", {
      day:"2-digit",month:"short",year:"numeric"
    }).format(new Date(parts[0],parts[1]-1,parts[2]));
  }

  function formatTime(value) {
    const parts = value.split(":").map(Number);
    if (parts.length !== 2 || parts.some(Number.isNaN)) return value;
    return new Intl.DateTimeFormat("en-IN", {
      hour:"2-digit",minute:"2-digit",hour12:true
    }).format(new Date(2000,0,1,parts[0],parts[1]));
  }

  function statusClass(status) {
    return status.toLowerCase().replace(/\s+/g,"-");
  }

  function isUpcoming(item) {
    const parts = item.date.split("-").map(Number);
    const date = new Date(parts[0],parts[1]-1,parts[2]);
    date.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    return date >= today && ["Pending","Confirmed","In Progress"].includes(item.status);
  }

  /*--- Update Statistics ---*/
  function renderStats() {
    $("#cs-ca-total").textContent = appointments.length;
    $("#cs-ca-upcoming").textContent = appointments.filter(isUpcoming).length;
    $("#cs-ca-completed").textContent = appointments.filter(item => item.status === "Completed").length;
    $("#cs-ca-cancelled").textContent = appointments.filter(item => item.status === "Cancelled").length;
  }

  /*--- Search and Filter Appointments ---*/
  function getFilteredAppointments() {
    const query = $("#cs-ca-search").value.trim().toLowerCase();
    const status = $("#cs-ca-status-filter").value;
    const date = $("#cs-ca-date-filter").value;

    return appointments.filter(item => {
      const searchable = [
        item.id,item.vehicle,item.registration,item.service,item.date,item.time,item.status
      ].join(" ").toLowerCase();

      return (!query || searchable.includes(query)) &&
        (!status || item.status === status) &&
        (!date || item.date === date);
    }).sort((a,b) => b.date.localeCompare(a.date));
  }

  /*--- Render Appointment Table and Mobile Cards ---*/
  function renderAppointments() {
    const filtered = getFilteredAppointments();
    const totalPages = Math.max(1,Math.ceil(filtered.length/pageSize));
    currentPage = Math.min(currentPage,totalPages);

    const start = (currentPage-1)*pageSize;
    const visible = filtered.slice(start,start+pageSize);

    $("#cs-ca-count").textContent = `${filtered.length} appointment${filtered.length === 1 ? "" : "s"}`;
    $("#cs-ca-results").textContent = filtered.length
      ? `Showing ${start+1}–${start+visible.length} of ${filtered.length} appointments`
      : "Showing 0 appointments";
    $("#cs-ca-page").textContent = `${currentPage} / ${totalPages}`;
    $("#cs-ca-prev").disabled = currentPage <= 1;
    $("#cs-ca-next").disabled = currentPage >= totalPages;

    $("#cs-ca-empty").hidden = filtered.length !== 0;
    $(".cs-ca-table-wrap").hidden = filtered.length === 0;
    $(".cs-ca-mobile-list").hidden = filtered.length === 0;
    $(".cs-ca-footer").hidden = filtered.length === 0;

    $("#cs-ca-table-body").innerHTML = visible.map(item => `
      <tr>
        <td><span class="cs-ca-id">${escapeHTML(item.id)}</span><span class="cs-ca-subtext">Service booking</span></td>
        <td><div class="cs-ca-vehicle"><span class="cs-ca-vehicle-icon"><i class="bi bi-car-front-fill"></i></span><div><strong>${escapeHTML(item.vehicle)}</strong><span class="cs-ca-subtext">${escapeHTML(item.registration)}</span></div></div></td>
        <td><span class="cs-ca-service">${escapeHTML(item.service)}</span></td>
        <td><span class="cs-ca-date">${escapeHTML(formatDate(item.date))}</span><span class="cs-ca-time">${escapeHTML(formatTime(item.time))}</span></td>
        <td><span class="cs-ca-status cs-ca-status-${statusClass(item.status)}">${escapeHTML(item.status)}</span></td>
        <td><a href="404.html" class="cs-ca-action-link" aria-label="View ${escapeHTML(item.id)}">View details <i class="bi bi-arrow-up-right"></i></a></td>
      </tr>
    `).join("");

    $("#cs-ca-mobile-list").innerHTML = visible.map(item => `
      <article class="cs-ca-mobile-card">
        <div class="cs-ca-mobile-card-top">
          <div><strong>${escapeHTML(item.id)}</strong><small>Service appointment</small></div>
          <span class="cs-ca-status cs-ca-status-${statusClass(item.status)}">${escapeHTML(item.status)}</span>
        </div>
        <div class="cs-ca-mobile-card-details">
          <div><span>Vehicle</span><strong>${escapeHTML(item.vehicle)}<br>${escapeHTML(item.registration)}</strong></div>
          <div><span>Service</span><strong>${escapeHTML(item.service)}</strong></div>
          <div><span>Date</span><strong>${escapeHTML(formatDate(item.date))}</strong></div>
          <div><span>Time</span><strong>${escapeHTML(formatTime(item.time))}</strong></div>
        </div>
        <div class="cs-ca-mobile-card-actions"><a href="404.html" class="cs-ca-action-link">View details <i class="bi bi-arrow-up-right"></i></a></div>
      </article>
    `).join("");
  }

  /*--- Reset Filters ---*/
  function resetFilters() {
    $("#cs-ca-search").value = "";
    $("#cs-ca-status-filter").value = "";
    $("#cs-ca-date-filter").value = "";
    currentPage = 1;
    renderAppointments();
  }

  /*--- Filter Events ---*/
  $("#cs-ca-search").addEventListener("input",function() {
    currentPage = 1;
    renderAppointments();
  });

  ["cs-ca-status-filter","cs-ca-date-filter"].forEach(id => {
    $("#"+id).addEventListener("change",function() {
      currentPage = 1;
      renderAppointments();
    });
  });

  $("#cs-ca-reset").addEventListener("click",resetFilters);
  $("#cs-ca-empty-reset").addEventListener("click",resetFilters);

  /*--- Pagination ---*/
  $("#cs-ca-prev").addEventListener("click",function() {
    if (currentPage > 1) {
      currentPage--;
      renderAppointments();
    }
  });

  $("#cs-ca-next").addEventListener("click",function() {
    const totalPages = Math.max(1,Math.ceil(getFilteredAppointments().length/pageSize));
    if (currentPage < totalPages) {
      currentPage++;
      renderAppointments();
    }
  });

  /*--- Initial Render ---*/
  renderStats();
  renderAppointments();
});
/*--- Client Appointments Initialization End ---*/
