
/*--- Client Vehicles Initialization ---*/
document.addEventListener("DOMContentLoaded", function () {
  const root = document.querySelector(".cs-cv");
  if (!root) return;

  const $ = selector => root.querySelector(selector);
  const pageSize = 6;
  let currentPage = 1;

  /*--- Sample Vehicle Records ---*/
  const vehicles = [
    {id:"VEH-2001",make:"Honda",model:"City",registration:"TN01AB1234",year:2023,fuel:"Petrol",status:"Active",lastService:"2026-10-10",serviceDue:false},
    {id:"VEH-2002",make:"Hyundai",model:"Creta",registration:"TN09CD4567",year:2022,fuel:"Diesel",status:"Active",lastService:"2026-08-12",serviceDue:true},
    {id:"VEH-2003",make:"Toyota",model:"Hyryder",registration:"TN22EF7890",year:2024,fuel:"Hybrid",status:"Active",lastService:"2026-09-18",serviceDue:false},
    {id:"VEH-2004",make:"Tata",model:"Nexon EV",registration:"TN37GH1234",year:2025,fuel:"Electric",status:"In Service",lastService:"2026-10-20",serviceDue:false},
    {id:"VEH-2005",make:"Maruti Suzuki",model:"Swift",registration:"TN45JK5678",year:2021,fuel:"Petrol",status:"Inactive",lastService:"2026-06-05",serviceDue:true},
    {id:"VEH-2006",make:"Mahindra",model:"XUV700",registration:"TN18LM9012",year:2023,fuel:"Diesel",status:"Active",lastService:"2026-09-25",serviceDue:false},
    {id:"VEH-2007",make:"Honda",model:"Activa",registration:"TN20NP3456",year:2022,fuel:"Petrol",status:"Active",lastService:"2026-10-02",serviceDue:false}
  ];

  /*--- Safe Rendering Helpers ---*/
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[char]);
  }

  function formatDate(value) {
    if (!value) return "Not recorded";
    const parts = value.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return value;
    return new Intl.DateTimeFormat("en-IN", {
      day:"2-digit",month:"short",year:"numeric"
    }).format(new Date(parts[0],parts[1]-1,parts[2]));
  }

  function statusClass(status) {
    return status.toLowerCase().replace(/\s+/g,"-");
  }

  /*--- Update Garage Statistics ---*/
  function renderStats() {
    $("#cs-cv-total").textContent = vehicles.length;
    $("#cs-cv-active").textContent = vehicles.filter(v => v.status === "Active").length;
    $("#cs-cv-electric").textContent = vehicles.filter(v => ["Electric","Hybrid"].includes(v.fuel)).length;
    $("#cs-cv-due").textContent = vehicles.filter(v => v.serviceDue).length;
  }

  /*--- Search and Filters ---*/
  function getFilteredVehicles() {
    const query = $("#cs-cv-search").value.trim().toLowerCase();
    const status = $("#cs-cv-status").value;
    const fuel = $("#cs-cv-fuel").value;

    return vehicles.filter(vehicle => {
      const searchable = [
        vehicle.id,vehicle.make,vehicle.model,vehicle.registration,
        vehicle.year,vehicle.fuel,vehicle.status
      ].join(" ").toLowerCase();

      return (!query || searchable.includes(query)) &&
        (!status || vehicle.status === status) &&
        (!fuel || vehicle.fuel === fuel);
    }).sort((a,b) => b.id.localeCompare(a.id,undefined,{numeric:true}));
  }

  /*--- Render Vehicle Cards ---*/
  function renderVehicles() {
    const filtered = getFilteredVehicles();
    const totalPages = Math.max(1,Math.ceil(filtered.length/pageSize));
    currentPage = Math.min(currentPage,totalPages);

    const start = (currentPage-1)*pageSize;
    const visible = filtered.slice(start,start+pageSize);

    $("#cs-cv-count").textContent = `${filtered.length} vehicle${filtered.length === 1 ? "" : "s"}`;
    $("#cs-cv-results").textContent = filtered.length
      ? `Showing ${start+1}–${start+visible.length} of ${filtered.length} vehicles`
      : "Showing 0 vehicles";
    $("#cs-cv-page").textContent = `${currentPage} / ${totalPages}`;
    $("#cs-cv-prev").disabled = currentPage <= 1;
    $("#cs-cv-next").disabled = currentPage >= totalPages;

    $("#cs-cv-empty").hidden = filtered.length > 0;
    $("#cs-cv-grid").hidden = filtered.length === 0;
    $("#cs-cv-footer").hidden = filtered.length === 0;

    $("#cs-cv-grid").innerHTML = visible.map(vehicle => `
      <article class="cs-cv-card">
        <div class="cs-cv-card-top">
          <span class="cs-cv-car-art"><i class="bi bi-car-front-fill"></i></span>
          <span class="cs-cv-status cs-cv-status-${statusClass(vehicle.status)}">${escapeHTML(vehicle.status)}</span>
        </div>
        <div class="cs-cv-card-body">
          <h4>${escapeHTML(vehicle.make)} ${escapeHTML(vehicle.model)}</h4>
          <span class="cs-cv-registration"><i class="bi bi-card-text"></i>${escapeHTML(vehicle.registration)}</span>
          <div class="cs-cv-details">
            <div class="cs-cv-detail"><span>Vehicle ID</span><strong>${escapeHTML(vehicle.id)}</strong></div>
            <div class="cs-cv-detail"><span>Manufacturing year</span><strong>${escapeHTML(vehicle.year)}</strong></div>
            <div class="cs-cv-detail"><span>Fuel type</span><strong class="cs-cv-fuel"><i class="bi bi-fuel-pump"></i>${escapeHTML(vehicle.fuel)}</strong></div>
            <div class="cs-cv-detail"><span>Last service</span><strong>${escapeHTML(formatDate(vehicle.lastService))}</strong></div>
          </div>
        </div>
        <div class="cs-cv-card-footer">
          <span>${vehicle.serviceDue ? "Maintenance may be due" : "Vehicle record"}</span>
          <a href="404.html" class="cs-cv-card-action" aria-label="View ${escapeHTML(vehicle.id)}">View Details <i class="bi bi-arrow-up-right"></i></a>
        </div>
      </article>
    `).join("");
  }

  /*--- Reset Filters ---*/
  function resetFilters() {
    $("#cs-cv-search").value = "";
    $("#cs-cv-status").value = "";
    $("#cs-cv-fuel").value = "";
    currentPage = 1;
    renderVehicles();
  }

  /*--- Search and Filter Events ---*/
  $("#cs-cv-search").addEventListener("input",function () {
    currentPage = 1;
    renderVehicles();
  });

  ["cs-cv-status","cs-cv-fuel"].forEach(id => {
    $("#"+id).addEventListener("change",function () {
      currentPage = 1;
      renderVehicles();
    });
  });

  $("#cs-cv-reset").addEventListener("click",resetFilters);
  $("#cs-cv-empty-reset").addEventListener("click",resetFilters);

  /*--- Pagination ---*/
  $("#cs-cv-prev").addEventListener("click",function () {
    if (currentPage > 1) {
      currentPage--;
      renderVehicles();
    }
  });

  $("#cs-cv-next").addEventListener("click",function () {
    const pages = Math.max(1,Math.ceil(getFilteredVehicles().length/pageSize));
    if (currentPage < pages) {
      currentPage++;
      renderVehicles();
    }
  });

  /*--- Initial Render ---*/
  renderStats();
  renderVehicles();
});
/*--- Client Vehicles Initialization End ---*/
