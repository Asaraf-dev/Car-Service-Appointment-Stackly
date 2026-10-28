
/*--- Admin Vehicles Initialization ---*/
document.addEventListener("DOMContentLoaded", function () {
  const root = document.querySelector(".cs-av");
  if (!root) return;
  const $ = selector => root.querySelector(selector);
  const pageSize = 6;
  let page = 1;
  let nextId = 1007;
  let toastTimer;
  let previousOverflow = "";

  /*--- Sample Vehicle Data ---*/
  const vehicles = [
    {id:"VEH-1001",owner:"James Reed",phone:"9876543210",make:"Ford",model:"Focus",registration:"TN01AB1234",year:2022,fuel:"Petrol",lastService:"2026-06-18",status:"Active",notes:"Regular maintenance."},
    {id:"VEH-1002",owner:"Amelia Moore",phone:"9876543211",make:"Honda",model:"Civic",registration:"TN09CD4567",year:2023,fuel:"Petrol",lastService:"2026-06-12",status:"Active",notes:"Customer prefers morning appointments."},
    {id:"VEH-1003",owner:"Daniel Lewis",phone:"9876543212",make:"Volkswagen",model:"Golf",registration:"TN22EF7890",year:2021,fuel:"Diesel",lastService:"2026-06-19",status:"In Service",notes:"Brake inspection requested."},
    {id:"VEH-1004",owner:"Sophia Patel",phone:"9876543213",make:"Toyota",model:"Corolla",registration:"TN37GH1234",year:2024,fuel:"Hybrid",lastService:"2026-05-25",status:"Active",notes:"Hybrid vehicle."},
    {id:"VEH-1005",owner:"Oliver Smith",phone:"9876543214",make:"Hyundai",model:"Creta",registration:"TN45JK5678",year:2020,fuel:"Diesel",lastService:"2026-04-15",status:"Inactive",notes:"Registration marked inactive in this demo."},
    {id:"VEH-1006",owner:"Isabella Brown",phone:"9876543215",make:"Tata",model:"Nexon EV",registration:"TN18LM9012",year:2025,fuel:"Electric",lastService:"2026-06-20",status:"Active",notes:"Electric vehicle."}
  ];

  /*--- Safe Rendering Helpers ---*/
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[c]);
  }

  function dateText(value) {
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

  function initials(name) {
    return String(name || "").trim().split(/\s+/).slice(0,2)
      .map(part => part[0] || "").join("").toUpperCase();
  }

  /*--- Toast Notification ---*/
  function toast(message, error = false) {
    const element = $("#cs-av-toast");
    element.textContent = message;
    element.classList.toggle("cs-av-toast-error",error);
    element.classList.add("cs-av-toast-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove("cs-av-toast-visible"),3000);
  }

  /*--- Statistics ---*/
  function updateStats() {
    $("#cs-av-total").textContent = vehicles.length.toLocaleString("en-IN");
    $("#cs-av-active").textContent = vehicles.filter(v => v.status === "Active").length.toLocaleString("en-IN");
    $("#cs-av-service").textContent = vehicles.filter(v => v.status === "In Service").length.toLocaleString("en-IN");
    $("#cs-av-attention").textContent = vehicles.filter(v => v.status === "Inactive").length.toLocaleString("en-IN");
  }

  /*--- Search and Filters ---*/
  function filteredVehicles() {
    const query = $("#cs-av-search").value.trim().toLowerCase();
    const status = $("#cs-av-status-filter").value;
    const fuel = $("#cs-av-fuel-filter").value;
    return vehicles.filter(v => {
      const text = [v.id,v.owner,v.phone,v.make,v.model,v.registration,v.year,v.fuel,v.status].join(" ").toLowerCase();
      return (!query || text.includes(query)) && (!status || v.status === status) && (!fuel || v.fuel === fuel);
    }).sort((a,b) => b.id.localeCompare(a.id,undefined,{numeric:true}));
  }

  /*--- Vehicle Table Rendering ---*/
  function render() {
    const filtered = filteredVehicles();
    const pages = Math.max(1,Math.ceil(filtered.length/pageSize));
    page = Math.min(page,pages);
    const start = (page-1)*pageSize;
    const visible = filtered.slice(start,start+pageSize);

    $("#cs-av-count").textContent = `${filtered.length} vehicle${filtered.length === 1 ? "" : "s"}`;
    $("#cs-av-results").textContent = filtered.length
      ? `Showing ${start+1}–${start+visible.length} of ${filtered.length} vehicles`
      : "Showing 0 vehicles";
    $("#cs-av-page").textContent = `${page} / ${pages}`;
    $("#cs-av-prev").disabled = page <= 1;
    $("#cs-av-next").disabled = page >= pages;
    $("#cs-av-empty").hidden = filtered.length > 0;
    $(".cs-av-table-wrap").hidden = filtered.length === 0;
    $(".cs-av-footer").hidden = filtered.length === 0;

    $("#cs-av-table-body").innerHTML = visible.map(v => `
      <tr>
        <td><div class="cs-av-vehicle"><span class="cs-av-car-icon"><i class="bi bi-car-front-fill"></i></span><div><strong>${esc(v.make)} ${esc(v.model)}</strong><span class="cs-av-muted">${esc(v.id)}</span></div></div></td>
        <td><span class="cs-av-registration">${esc(v.registration)}</span></td>
        <td><div class="cs-av-owner"><strong>${esc(v.owner)}</strong><span class="cs-av-muted">${esc(v.phone)}</span></div></td>
        <td><strong>${esc(v.fuel)}</strong><span class="cs-av-muted">Year ${esc(v.year)}</span></td>
        <td>${esc(dateText(v.lastService))}</td>
        <td><span class="cs-av-status cs-av-status-${statusClass(v.status)}">${esc(v.status)}</span></td>
        <td><div class="cs-av-actions">
          <button type="button" class="cs-av-icon-btn" data-av-view="${esc(v.id)}" aria-label="View ${esc(v.id)}" title="View details"><i class="bi bi-eye"></i></button>
          <button type="button" class="cs-av-icon-btn" data-av-status="${esc(v.id)}" aria-label="Change status for ${esc(v.id)}" title="Change status"><i class="bi bi-arrow-left-right"></i></button>
        </div></td>
      </tr>`).join("");
  }

  /*--- Modal Controls ---*/
  function openModal(modal) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal.classList.add("cs-av-open");
    modal.setAttribute("aria-hidden","false");
    modal.querySelector(".cs-av-close")?.focus();
  }

  function closeModal(modal) {
    modal.classList.remove("cs-av-open");
    modal.setAttribute("aria-hidden","true");
    document.body.style.overflow = previousOverflow;
  }

  function findVehicle(id) {
    return vehicles.find(v => v.id === id);
  }

  /*--- Vehicle Details ---*/
  function showDetails(id) {
    const v = findVehicle(id);
    if (!v) return;
    $("#cs-av-details-title").textContent = `${v.make} ${v.model}`;
    const fields = [
      ["Vehicle ID",v.id],["Registration",v.registration],["Owner",v.owner],
      ["Phone number",v.phone],["Make",v.make],["Model",v.model],
      ["Manufacturing year",v.year],["Fuel type",v.fuel],
      ["Last service",dateText(v.lastService)],["Status",v.status]
    ];
    $("#cs-av-details").innerHTML = fields.map(([label,value]) =>
      `<div class="cs-av-detail"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`
    ).join("") + `<div class="cs-av-detail" style="grid-column:1/-1"><span>Notes</span><strong>${esc(v.notes || "No notes added.")}</strong></div>`;
    openModal($("#cs-av-details-modal"));
  }

  /*--- Change Vehicle Status ---*/
  function changeStatus(id) {
    const v = findVehicle(id);
    if (!v) return;
    const options = ["Active","In Service","Inactive"];
    const choice = window.prompt(`Update status for ${v.registration}:\n1. Active\n2. In Service\n3. Inactive\n\nEnter 1, 2 or 3:`);
    if (choice === null) return;
    const selected = {"1":"Active","2":"In Service","3":"Inactive"}[choice.trim()];
    if (!selected) {
      toast("Choose 1, 2 or 3 to select a status.",true);
      return;
    }
    if (!options.includes(selected)) return;
    v.status = selected;
    updateStats();
    render();
    toast(`${v.registration} status updated to ${selected}.`);
  }

  /*--- Add Vehicle Form ---*/
  const form = $("#cs-av-form");
  const ownerInput = form.elements.owner;
  const phoneInput = form.elements.phone;
  const registrationInput = form.elements.registration;
  const yearInput = form.elements.year;
  const yearNow = new Date().getFullYear();
  yearInput.max = String(yearNow);
  yearInput.min = "1950";

  /*--- Strict Input Validation ---*/
  ownerInput.addEventListener("input",function() {
    this.value = this.value.replace(/[^A-Za-z ]/g,"").replace(/\s{2,}/g," ").replace(/^\s+/,"");
  });

  phoneInput.addEventListener("input",function() {
    this.value = this.value.replace(/\D/g,"").slice(0,10);
  });

  registrationInput.addEventListener("input",function() {
    this.value = this.value.replace(/[^A-Za-z0-9 -]/g,"").toUpperCase();
  });

  yearInput.addEventListener("input",function() {
    this.value = this.value.replace(/\D/g,"").slice(0,4);
  });

  /*--- Open Add Vehicle Form ---*/
  $("#cs-av-add-btn").addEventListener("click",function() {
    form.reset();
    yearInput.max = String(new Date().getFullYear());
    const dateInput = form.elements.lastService;
    dateInput.max = [
      new Date().getFullYear(),
      String(new Date().getMonth()+1).padStart(2,"0"),
      String(new Date().getDate()).padStart(2,"0")
    ].join("-");
    openModal($("#cs-av-form-modal"));
  });

  /*--- Save New Vehicle ---*/
  form.addEventListener("submit",function(event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const owner = String(data.get("owner") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const registration = String(data.get("registration") || "").trim().toUpperCase();
    const make = String(data.get("make") || "").trim();
    const model = String(data.get("model") || "").trim();
    const year = Number(data.get("year"));
    const lastService = String(data.get("lastService") || "");

    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(owner)) {
      toast("Owner name must contain letters and spaces only.",true);
      ownerInput.focus();
      return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      toast("Phone number must contain exactly 10 digits.",true);
      phoneInput.focus();
      return;
    }
    if (!/^[A-Za-z0-9 -]+$/.test(registration)) {
      toast("Enter a valid vehicle registration number.",true);
      registrationInput.focus();
      return;
    }
    if (vehicles.some(v => v.registration.toLowerCase() === registration.toLowerCase())) {
      toast("This registration number is already registered.",true);
      registrationInput.focus();
      return;
    }
    if (!Number.isInteger(year) || year < 1950 || year > new Date().getFullYear()) {
      toast("Enter a valid manufacturing year.",true);
      yearInput.focus();
      return;
    }

    const vehicle = {
      id:`VEH-${nextId++}`,
      owner,phone,make,model,registration,year,
      fuel:String(data.get("fuel")),
      status:String(data.get("status")),
      lastService,
      notes:String(data.get("notes") || "").trim()
    };

    vehicles.push(vehicle);
    updateStats();
    $("#cs-av-search").value = "";
    $("#cs-av-status-filter").value = "";
    $("#cs-av-fuel-filter").value = "";
    page = 1;
    render();
    closeModal($("#cs-av-form-modal"));
    form.reset();
    toast(`${vehicle.registration} added successfully.`);
  });

  /*--- Table Actions ---*/
  $("#cs-av-table-body").addEventListener("click",function(event) {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.avView) showDetails(button.dataset.avView);
    if (button.dataset.avStatus) changeStatus(button.dataset.avStatus);
  });

  /*--- Close Modals ---*/
  root.addEventListener("click",function(event) {
    if (event.target.closest("[data-av-close]")) closeModal($("#cs-av-details-modal"));
    if (event.target.closest("[data-av-form-close]")) closeModal($("#cs-av-form-modal"));
  });

  document.addEventListener("keydown",function(event) {
    if (event.key !== "Escape") return;
    [$("#cs-av-details-modal"),$("#cs-av-form-modal")].forEach(modal => {
      if (modal.classList.contains("cs-av-open")) closeModal(modal);
    });
  });

  /*--- Search and Filter Events ---*/
  ["cs-av-search","cs-av-status-filter","cs-av-fuel-filter"].forEach(id => {
    $("#" + id).addEventListener(id === "cs-av-search" ? "input" : "change",function() {
      page = 1;
      render();
    });
  });

  function resetFilters() {
    $("#cs-av-search").value = "";
    $("#cs-av-status-filter").value = "";
    $("#cs-av-fuel-filter").value = "";
    page = 1;
    render();
  }

  $("#cs-av-reset").addEventListener("click",resetFilters);
  $("#cs-av-empty-reset").addEventListener("click",resetFilters);
  $("#cs-av-prev").addEventListener("click",function() {
    if (page > 1) { page--; render(); }
  });
  $("#cs-av-next").addEventListener("click",function() {
    if (page < Math.ceil(filteredVehicles().length/pageSize)) { page++; render(); }
  });

  /*--- Initial Render ---*/
  updateStats();
  render();
});
/*--- Admin Vehicles Initialization End ---*/
