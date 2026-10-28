
/*--- Client Overview Initialization ---*/
document.addEventListener("DOMContentLoaded", function () {
  const root = document.querySelector(".cs-co");
  if (!root) return;

  /*--- Read Saved Client Account ---*/
  const name = (localStorage.getItem("cs-auth-name") || "").trim();
  const email = sessionStorage.getItem("cs-auth-email") ||
    localStorage.getItem("cs-auth-email") || "";
  const role = sessionStorage.getItem("cs-auth-role") ||
    localStorage.getItem("cs-auth-role") || "";

  const displayName = name || "there";
  const firstName = name ? name.split(/\s+/)[0] : "there";

  /*--- Populate Dashboard Account Information ---*/
  const welcomeName = document.getElementById("cs-co-customer-name");
  const welcomeEmail = document.getElementById("cs-co-customer-email");

  if (welcomeName) welcomeName.textContent = firstName;
  if (welcomeEmail) welcomeEmail.textContent = email || "No login email found";

  const topbarEmail = document.getElementById("cs-db-topbar-email");
  const mobileEmail = document.getElementById("cs-db-mobile-user-email");
  const mobileName = document.getElementById("cs-db-mobile-user-name");

  if (topbarEmail) topbarEmail.textContent = email || "No login email found";
  if (mobileEmail) mobileEmail.textContent = email || "No login email found";
  if (mobileName) mobileName.textContent = name || "My Account";

  /*--- Protect Against Unexpected Account Role ---*/
  if (role && role !== "client") {
    console.warn("The stored account role is not client.");
  }

  /*--- Sample Client Appointments ---*/
  const appointments = [
    {id:"APT-2001",service:"General Service",vehicle:"Honda City",registration:"TN01AB1234",date:"2026-11-03",time:"10:30",status:"Confirmed"},
    {id:"APT-2002",service:"AC Service",vehicle:"Hyundai Creta",registration:"TN09CD4567",date:"2026-11-08",time:"12:00",status:"Pending"},
    {id:"APT-2003",service:"Oil Change",vehicle:"Honda City",registration:"TN01AB1234",date:"2026-10-10",time:"09:30",status:"Completed"}
  ];

  /*--- Sample Client Vehicles ---*/
  const vehicles = [
    {make:"Honda",model:"City",registration:"TN01AB1234",year:2023,status:"Active"},
    {make:"Hyundai",model:"Creta",registration:"TN09CD4567",year:2022,status:"Active"}
  ];

  /*--- Safe HTML Rendering ---*/
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
    });
  }

  function formatDate(value) {
    const parts = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en-IN", {
      day:"2-digit",month:"short",year:"numeric"
    }).format(new Date(parts[0],parts[1]-1,parts[2]));
  }

  function formatTime(value) {
    const parts = value.split(":").map(Number);
    return new Intl.DateTimeFormat("en-IN", {
      hour:"2-digit",minute:"2-digit",hour12:true
    }).format(new Date(2000,0,1,parts[0],parts[1]));
  }

  function statusClass(status) {
    return status.toLowerCase().replace(/\s+/g,"-");
  }

  /*--- Upcoming Appointment List ---*/
  function renderUpcoming() {
    const today = new Date();
    today.setHours(0,0,0,0);

    const upcoming = appointments
      .filter(item => {
        const parts = item.date.split("-").map(Number);
        const date = new Date(parts[0],parts[1]-1,parts[2]);
        return date >= today && ["Pending","Confirmed","In Progress"].includes(item.status);
      })
      .sort((a,b) => a.date.localeCompare(b.date))
      .slice(0,3);

    const list = document.getElementById("cs-co-upcoming-list");
    const empty = document.getElementById("cs-co-no-appointments");

    document.getElementById("cs-co-upcoming").textContent = appointments.filter(item => {
      const parts = item.date.split("-").map(Number);
      const date = new Date(parts[0],parts[1]-1,parts[2]);
      date.setHours(0,0,0,0);
      return date >= today && ["Pending","Confirmed","In Progress"].includes(item.status);
    }).length;

    empty.hidden = upcoming.length > 0;
    list.innerHTML = upcoming.map(item => {
      const parts = item.date.split("-").map(Number);
      const date = new Date(parts[0],parts[1]-1,parts[2]);
      return `
        <div class="cs-co-appointment">
          <div class="cs-co-date-box">
            <strong>${String(parts[2]).padStart(2,"0")}</strong>
            <span>${new Intl.DateTimeFormat("en-IN",{month:"short"}).format(date)}</span>
          </div>
          <div class="cs-co-appointment-info">
            <h4>${escapeHTML(item.service)}</h4>
            <p>${escapeHTML(item.vehicle)} · ${escapeHTML(item.registration)}</p>
            <p>${escapeHTML(formatTime(item.time))} · ${escapeHTML(item.id)}</p>
          </div>
          <span class="cs-co-status cs-co-status-${statusClass(item.status)}">${escapeHTML(item.status)}</span>
        </div>`;
    }).join("");
  }

  /*--- Vehicle Summary ---*/
  function renderVehicles() {
    const list = document.getElementById("cs-co-vehicle-list");
    document.getElementById("cs-co-total-vehicles").textContent = vehicles.length;

    list.innerHTML = vehicles.slice(0,3).map(vehicle => `
      <div class="cs-co-vehicle">
        <span class="cs-co-vehicle-icon"><i class="bi bi-car-front-fill"></i></span>
        <div class="cs-co-vehicle-info">
          <strong>${escapeHTML(vehicle.make)} ${escapeHTML(vehicle.model)}</strong>
          <small>${escapeHTML(vehicle.registration)} · ${escapeHTML(vehicle.year)}</small>
        </div>
        <span class="cs-co-vehicle-tag">${escapeHTML(vehicle.status)}</span>
      </div>
    `).join("");
  }

  /*--- Recent Service Activity ---*/
  function renderActivity() {
    const recent = [...appointments].sort((a,b) => b.date.localeCompare(a.date));
    const table = document.getElementById("cs-co-activity-body");
    const mobile = document.getElementById("cs-co-mobile-activity");

    table.innerHTML = recent.map(item => `
      <tr>
        <td><strong>${escapeHTML(item.id)}</strong></td>
        <td>${escapeHTML(item.vehicle)}<br><span style="color:#8d97a5">${escapeHTML(item.registration)}</span></td>
        <td>${escapeHTML(item.service)}</td>
        <td>${escapeHTML(formatDate(item.date))}</td>
        <td><span class="cs-co-status cs-co-status-${statusClass(item.status)}">${escapeHTML(item.status)}</span></td>
      </tr>
    `).join("");

    mobile.innerHTML = recent.map(item => `
      <div class="cs-co-mobile-record">
        <div>
          <strong>${escapeHTML(item.service)}</strong>
          <p>${escapeHTML(item.id)} · ${escapeHTML(item.vehicle)}<br>${escapeHTML(formatDate(item.date))}</p>
        </div>
        <span class="cs-co-status cs-co-status-${statusClass(item.status)}">${escapeHTML(item.status)}</span>
      </div>
    `).join("");

    document.getElementById("cs-co-total-appointments").textContent = appointments.length;
    document.getElementById("cs-co-completed").textContent =
      appointments.filter(item => item.status === "Completed").length;
  }

  /*--- Initialize Overview ---*/
  renderUpcoming();
  renderVehicles();
  renderActivity();
});
/*--- Client Overview Initialization End ---*/
