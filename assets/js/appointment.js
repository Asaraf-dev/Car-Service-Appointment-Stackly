/*--- Service Selection Section Start ---*/
document.addEventListener("DOMContentLoaded", function () {
    const section = document.querySelector("#service-selection");
    if (!section) return;

    const cards = Array.from(section.querySelectorAll(".cs-apt-service-card"));
    const count = section.querySelector("#cs-apt-service-count");
    const selectedName = section.querySelector("#cs-apt-service-selected-name");
    const selectedHelp = section.querySelector("#cs-apt-service-selected-help");
    const continueButton = section.querySelector("#cs-apt-service-continue");
    const status = section.querySelector("#cs-apt-service-status");
    const hiddenInput = section.querySelector("#cs-apt-selected-service");
    let selectedService = "";

    function selectService(serviceName, announce = true) {
        const matchingCard = cards.find(card => card.dataset.service === serviceName);
        if (!matchingCard) return false;

        selectedService = serviceName;

        cards.forEach(card => {
            const isSelected = card === matchingCard;
            card.setAttribute("aria-pressed", String(isSelected));
            const actionText = card.querySelector(".cs-apt-service-card-action");
            if (actionText) {
                actionText.innerHTML = isSelected
                    ? 'Selected <i class="bi bi-check2"></i>'
                    : 'Select service <i class="bi bi-arrow-up-right"></i>';
            }
        });

        count.textContent = "1";
        selectedName.textContent = selectedService;
        selectedHelp.textContent = "Your service selection is ready.";
        hiddenInput.value = selectedService;
        continueButton.disabled = false;
        status.textContent = announce ? selectedService + " selected." : "";
        return true;
    }

    cards.forEach(card => {
        card.addEventListener("click", function () {
            selectService(card.dataset.service);
        });
    });

    /*--- Preselect Service From URL ---*/
    const params = new URLSearchParams(window.location.search);
    const serviceFromUrl = params.get("service");

    if (serviceFromUrl && selectService(serviceFromUrl, false)) {
        selectedHelp.textContent = "Selected from your previous page. You can change it here.";
    }

    /*--- Continue To Vehicle Details ---*/
    continueButton.addEventListener("click", function () {
        if (!selectedService) {
            status.textContent = "Please select a service before continuing.";
            return;
        }

        hiddenInput.value = selectedService;

        const vehicleSection = document.querySelector("#vehicle-information");

        if (vehicleSection) {
            vehicleSection.scrollIntoView({ behavior: "smooth", block: "start" });
            status.textContent = "Service selected. Continue with your vehicle details.";
            return;
        }

        status.textContent = "Service selected: " + selectedService + ". Add the vehicle details section with id=\"vehicle-information\" to continue.";
        section.dispatchEvent(new CustomEvent("cs:service-selected", {
            bubbles: true,
            detail: { service: selectedService }
        }));
    });
});
/*--- Service Selection Section End ---*/

/*--- Vehicle Information Section Start ---*/
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("cs-apt-vehicle-form");
    if (!form) return;

    const section = document.getElementById("vehicle-information");
    const serviceSection = document.getElementById("service-selection");
    const serviceDisplay = document.getElementById("cs-apt-vehicle-service-display");
    const changeService = document.getElementById("cs-apt-vehicle-change-service");
    const backButton = document.getElementById("cs-apt-vehicle-back");
    const status = document.getElementById("cs-apt-vehicle-status");
    const notes = document.getElementById("cs-apt-vehicle-notes");
    const notesCount = document.getElementById("cs-apt-vehicle-notes-count");
    const yearSelect = document.getElementById("cs-apt-vehicle-year");

    /*--- Generate Manufacturing Years ---*/
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1980; year--) {
        const option = document.createElement("option");
        option.value = String(year);
        option.textContent = String(year);
        yearSelect.appendChild(option);
    }

    /*--- Service Selection Sync ---*/
    function getSelectedService() {
        const selectedCard = serviceSection?.querySelector('.cs-apt-service-card[aria-pressed="true"]');
        const hiddenService = document.getElementById("cs-apt-selected-service");
        const urlService = new URLSearchParams(window.location.search).get("service");

        return selectedCard?.dataset.service ||
            hiddenService?.value ||
            urlService ||
            "";
    }

    function updateServiceDisplay() {
        const service = getSelectedService();
        serviceDisplay.value = service;
        serviceDisplay.placeholder = service ? "" : "Select a service in Step 01";
    }

    updateServiceDisplay();

    serviceSection?.addEventListener("click", function (event) {
        if (event.target.closest(".cs-apt-service-card")) {
            window.setTimeout(updateServiceDisplay, 0);
        }
    });

    window.addEventListener("popstate", updateServiceDisplay);

    /*--- Navigate Back To Services ---*/
    function goToServices() {
        if (serviceSection) {
            serviceSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    backButton.addEventListener("click", goToServices);
    changeService.addEventListener("click", goToServices);

    /*--- Notes Character Counter ---*/
    notes.addEventListener("input", function () {
        notesCount.textContent = String(notes.value.length);
    });

    /*--- Field Validation ---*/
    const validationRules = {
        vehicleMake: {
            id: "cs-apt-vehicle-make",
            message: "Enter your vehicle make."
        },
        vehicleModel: {
            id: "cs-apt-vehicle-model",
            message: "Enter your vehicle model."
        },
        vehicleRegistration: {
            id: "cs-apt-vehicle-registration",
            message: "Enter your vehicle registration number."
        },
        vehicleYear: {
            id: "cs-apt-vehicle-year",
            message: "Select your vehicle's manufacturing year."
        },
        vehicleFuel: {
            id: "cs-apt-vehicle-fuel",
            message: "Select your vehicle's fuel type."
        },
        vehicleTransmission: {
            id: "cs-apt-vehicle-transmission",
            message: "Select your vehicle's transmission."
        }
    };

    function showError(field, message) {
        const error = section.querySelector('[data-error-for="' + field.name + '"]');
        field.setAttribute("aria-invalid", "true");
        if (error) error.textContent = message;
    }

    function clearError(field) {
        const error = section.querySelector('[data-error-for="' + field.name + '"]');
        field.removeAttribute("aria-invalid");
        if (error) error.textContent = "";
    }

    function validateField(field) {
        clearError(field);
        const name = field.name;
        const value = field.value.trim();

        if (field.required && !value) {
            showError(field, validationRules[name]?.message || "This field is required.");
            return false;
        }

        if (name === "vehicleRegistration" && value &&
            !/^[A-Za-z0-9 -]{2,20}$/.test(value)) {
            showError(field, "Enter a valid registration number.");
            return false;
        }

        if (name === "vehicleMileage" && value &&
            (!Number.isSafeInteger(Number(value)) || Number(value) < 0 || Number(value) > 9999999)) {
            showError(field, "Enter a valid mileage in kilometres.");
            return false;
        }

        if (name === "vehicleYear" && value &&
            (!/^\d{4}$/.test(value) || Number(value) < 1980 || Number(value) > currentYear)) {
            showError(field, "Select a valid manufacturing year.");
            return false;
        }

        return true;
    }

    form.querySelectorAll("input, select, textarea").forEach(function (field) {
        field.addEventListener("input", function () {
            if (field.getAttribute("aria-invalid") === "true") validateField(field);
            status.textContent = "";
        });

        field.addEventListener("change", function () {
            if (field.getAttribute("aria-invalid") === "true") validateField(field);
            status.textContent = "";
        });
    });

    /*--- Continue To Date And Time ---*/
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        status.textContent = "";

        const fields = Array.from(form.querySelectorAll(
            'input[required], select[required]'
        ));

        let isValid = true;
        let firstInvalidField = null;

        fields.forEach(function (field) {
            if (!validateField(field)) {
                isValid = false;
                if (!firstInvalidField) firstInvalidField = field;
            }
        });

        const selectedService = getSelectedService();

        if (!selectedService) {
            status.textContent = "Please select a service in Step 01 before continuing.";
            isValid = false;
        }

        if (!isValid) {
            if (firstInvalidField) {
                firstInvalidField.focus();
                firstInvalidField.scrollIntoView({ behavior: "smooth", block: "center" });
            } else {
                status.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        const vehicleData = {
            service: selectedService,
            make: document.getElementById("cs-apt-vehicle-make").value.trim(),
            model: document.getElementById("cs-apt-vehicle-model").value.trim(),
            registration: document.getElementById("cs-apt-vehicle-registration").value.trim().toUpperCase(),
            year: yearSelect.value,
            fuel: document.getElementById("cs-apt-vehicle-fuel").value,
            transmission: document.getElementById("cs-apt-vehicle-transmission").value,
            mileage: document.getElementById("cs-apt-vehicle-mileage").value,
            notes: notes.value.trim()
        };

        /*--- Pass Data To The Next Step ---*/
        form.dispatchEvent(new CustomEvent("cs:vehicle-details-complete", {
            bubbles: true,
            detail: vehicleData
        }));

        const dateSection = document.getElementById("appointment-datetime");

        if (dateSection) {
            dateSection.scrollIntoView({ behavior: "smooth", block: "start" });
            status.textContent = "Vehicle details validated. Continue with your appointment date and time.";
        } else {
            status.textContent = "Vehicle details validated. Add the date and time section with id=\"appointment-datetime\" to continue.";
        }
    });
});
/*--- Vehicle Information Section End ---*/

/*--- Date & Time Selection Section Start ---*/
document.addEventListener("DOMContentLoaded", function () {
    const section = document.getElementById("appointment-datetime");
    if (!section) return;

    const calendar = document.getElementById("cs-apt-datetime-calendar");
    const monthLabel = document.getElementById("cs-apt-datetime-month");
    const prevButton = document.getElementById("cs-apt-datetime-prev");
    const nextButton = document.getElementById("cs-apt-datetime-next");
    const slotsContainer = document.getElementById("cs-apt-datetime-slots");
    const dateLabel = document.getElementById("cs-apt-datetime-date-label");
    const slotCount = document.getElementById("cs-apt-datetime-slot-count");
    const slotStatus = document.getElementById("cs-apt-datetime-slot-status");
    const summaryDate = document.getElementById("cs-apt-datetime-summary-date");
    const summaryTime = document.getElementById("cs-apt-datetime-summary-time");
    const selectedDateInput = document.getElementById("cs-apt-selected-date");
    const selectedTimeInput = document.getElementById("cs-apt-selected-time");
    const continueButton = document.getElementById("cs-apt-datetime-continue");
    const backButton = document.getElementById("cs-apt-datetime-back");
    const status = document.getElementById("cs-apt-datetime-status");

    /*--- Local Date Helpers ---*/
    function dateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function startOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function addDays(date, amount) {
        const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        result.setDate(result.getDate() + amount);
        return result;
    }

    function formatDate(date, options = {}) {
        return new Intl.DateTimeFormat("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
            ...options
        }).format(date);
    }

    const today = startOfDay(new Date());
    const lastBookableDate = addDays(today, 60);
    let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    let selectedDate = "";
    let selectedTime = "";

    const demoTimes = [
        { value: "09:00", label: "09:00 AM" },
        { value: "10:30", label: "10:30 AM" },
        { value: "12:00", label: "12:00 PM" },
        { value: "14:00", label: "02:00 PM" },
        { value: "15:30", label: "03:30 PM" },
        { value: "17:00", label: "05:00 PM" }
    ];

    /*--- Calendar Rendering ---*/
    function renderCalendar() {
        calendar.replaceChildren();

        monthLabel.textContent = new Intl.DateTimeFormat("en-IN", {
            month: "long",
            year: "numeric"
        }).format(visibleMonth);

        const firstDay = new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth(),
            1
        );

        const daysInMonth = new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth() + 1,
            0
        ).getDate();

        const mondayFirstOffset = (firstDay.getDay() + 6) % 7;

        for (let i = 0; i < mondayFirstOffset; i++) {
            const emptyCell = document.createElement("span");
            emptyCell.className = "cs-apt-datetime-day cs-apt-datetime-day-empty";
            emptyCell.setAttribute("aria-hidden", "true");
            calendar.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(
                visibleMonth.getFullYear(),
                visibleMonth.getMonth(),
                day
            );

            const key = dateKey(date);
            const isPast = date < today;
            const isBeyondRange = date > lastBookableDate;
            const isSelected = key === selectedDate;
            const isToday = key === dateKey(today);
            const button = document.createElement("button");

            button.type = "button";
            button.className = "cs-apt-datetime-day";
            button.textContent = String(day);
            button.dataset.date = key;
            button.disabled = isPast || isBeyondRange;
            button.setAttribute("aria-pressed", String(isSelected));
            button.setAttribute("aria-label", formatDate(date));

            if (isToday) button.classList.add("cs-apt-datetime-day-today");
            if (isSelected) button.classList.add("cs-apt-datetime-day-selected");

            button.addEventListener("click", function () {
                selectDate(key);
            });

            calendar.appendChild(button);
        }

        const firstBookableMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastBookableMonth = new Date(
            lastBookableDate.getFullYear(),
            lastBookableDate.getMonth(),
            1
        );

        prevButton.disabled = visibleMonth <= firstBookableMonth;
        nextButton.disabled = visibleMonth >= lastBookableMonth;
    }

    /*--- Date Navigation ---*/
    prevButton.addEventListener("click", function () {
        if (prevButton.disabled) return;

        visibleMonth = new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth() - 1,
            1
        );

        renderCalendar();
    });

    nextButton.addEventListener("click", function () {
        if (nextButton.disabled) return;

        visibleMonth = new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth() + 1,
            1
        );

        renderCalendar();
    });

    /*--- Time Slot Rendering ---*/
    function renderTimeSlots() {
        slotsContainer.replaceChildren();

        if (!selectedDate) {
            dateLabel.textContent = "Choose a date first";
            slotCount.textContent = "Select a date";
            showEmptyMessage("Select a date on the calendar to view time slots.");
            return;
        }

        const parsedDate = new Date(selectedDate + "T12:00:00");
        dateLabel.textContent = formatDate(parsedDate);
        slotCount.textContent = `${demoTimes.length} demo slots`;

        demoTimes.forEach(function (time) {
            const button = document.createElement("button");
            const isSelected = selectedTime === time.value;

            button.type = "button";
            button.className = "cs-apt-datetime-slot";
            button.dataset.time = time.value;
            button.setAttribute("aria-pressed", String(isSelected));

            if (isSelected) {
                button.classList.add("cs-apt-datetime-slot-selected");
            }

            const label = document.createElement("span");
            label.textContent = time.label;

            const icon = document.createElement("i");
            icon.className = isSelected ? "bi bi-check-circle-fill" : "bi bi-clock";

            button.append(label, icon);

            button.addEventListener("click", function () {
                selectTime(time.value);
            });

            slotsContainer.appendChild(button);
        });
    }

    function showEmptyMessage(message) {
        const paragraph = document.createElement("p");
        paragraph.className = "cs-apt-datetime-slot-empty";
        paragraph.textContent = message;
        slotsContainer.appendChild(paragraph);
    }

    /*--- Select Date ---*/
    function selectDate(key) {
        const candidate = new Date(key + "T12:00:00");
        const normalized = startOfDay(candidate);

        if (normalized < today || normalized > lastBookableDate) return;

        selectedDate = key;
        selectedTime = "";

        selectedDateInput.value = selectedDate;
        selectedTimeInput.value = "";

        summaryDate.textContent = formatDate(candidate);
        summaryTime.textContent = "Not selected";
        slotStatus.textContent = "";
        status.textContent = "";
        continueButton.disabled = true;

        renderCalendar();
        renderTimeSlots();
    }

    /*--- Select Time ---*/
    function selectTime(value) {
        const chosen = demoTimes.find(time => time.value === value);
        if (!chosen || !selectedDate) return;

        selectedTime = value;
        selectedDateInput.value = selectedDate;
        selectedTimeInput.value = selectedTime;

        summaryTime.textContent = chosen.label;
        slotStatus.textContent = `${chosen.label} selected.`;
        status.textContent = "";
        continueButton.disabled = false;

        renderTimeSlots();
    }

    /*--- Back To Vehicle Details ---*/
    backButton.addEventListener("click", function () {
        const vehicleSection = document.getElementById("vehicle-information");

        if (vehicleSection) {
            vehicleSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });

    /*--- Continue To Customer Details ---*/
    continueButton.addEventListener("click", function () {
        if (!selectedDate || !selectedTime) {
            status.textContent = "Please choose both a date and a time.";
            return;
        }

        const chosenDate = new Date(selectedDate + "T12:00:00");

        if (startOfDay(chosenDate) < startOfDay(new Date()) ||
            chosenDate > lastBookableDate) {
            selectedDate = "";
            selectedTime = "";
            selectedDateInput.value = "";
            selectedTimeInput.value = "";
            summaryDate.textContent = "Not selected";
            summaryTime.textContent = "Not selected";
            continueButton.disabled = true;
            renderCalendar();
            renderTimeSlots();
            status.textContent = "This date is no longer selectable. Please choose another date.";
            return;
        }

        const appointmentData = {
            date: selectedDate,
            time: selectedTime,
            dateLabel: formatDate(chosenDate),
            timeLabel: demoTimes.find(time => time.value === selectedTime).label
        };

        section.dispatchEvent(new CustomEvent("cs:datetime-complete", {
            bubbles: true,
            detail: appointmentData
        }));

        const customerSection = document.getElementById("customer-details");

        if (customerSection) {
            customerSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
            status.textContent = "Date and time selected. Continue with your contact details.";
        } else {
            status.textContent = "Date and time selected. Add your customer details section with id=\"customer-details\" to continue.";
        }
    });

    /*--- Initialize Calendar ---*/
    renderCalendar();
    renderTimeSlots();
});
/*--- Date & Time Selection Section End ---*/

/*--- Customer Details Section Start ---*/
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("cs-apt-customer-form");
    if (!form) return;

    const nameInput = document.getElementById("cs-apt-customer-name");
    const emailInput = document.getElementById("cs-apt-customer-email");
    const phoneInput = document.getElementById("cs-apt-customer-phone");
    const contactInput = document.getElementById("cs-apt-customer-contact");
    const notesInput = document.getElementById("cs-apt-customer-notes");
    const charCount = document.getElementById("cs-apt-customer-char-count");
    const status = document.getElementById("cs-apt-customer-status");
    const backButton = document.getElementById("cs-apt-customer-back");

    const fields = [
        { input: nameInput, error: "cs-apt-customer-name-error" },
        { input: emailInput, error: "cs-apt-customer-email-error" },
        { input: phoneInput, error: "cs-apt-customer-phone-error" },
        { input: contactInput, error: "cs-apt-customer-contact-error" }
    ];

    function setError(input, message) {
        const errorElement = document.getElementById(input.id + "-error");
        input.classList.toggle("cs-apt-customer-invalid", Boolean(message));
        input.classList.toggle("cs-apt-customer-valid", !message && Boolean(input.value.trim()));
        input.setAttribute("aria-invalid", message ? "true" : "false");
        if (errorElement) errorElement.textContent = message;
        return !message;
    }

    function validateField(input) {
        const value = input.value.trim();
        let message = "";

        if (!value) {
            message = "This field is required.";
        } else if (input === nameInput && !/^[\p{L}][\p{L}\p{M}\s.'’-]{1,79}$/u.test(value)) {
            message = "Enter a valid full name using letters.";
        } else if (input === emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
            message = "Enter a valid email address.";
        } else if (input === phoneInput && !/^\d{10}$/.test(value)) {
            message = "Enter a valid 10-digit phone number.";
        } else if (input === phoneInput && value.replace(/\D/g, "").length < 7) {
            message = "Your phone number must contain at least 7 digits.";
        } else if (input === contactInput && !["email", "phone", "sms"].includes(value)) {
            message = "Choose a contact method.";
        }

        return setError(input, message);
    }

    function updateCharacterCount() {
        charCount.textContent = notesInput.value.length;
    }

    function updateAppointmentSummary() {
        const service = document.getElementById("cs-apt-selected-service");
        const serviceCard = document.querySelector(".cs-apt-service-card.is-selected, .cs-apt-service-card.active, .cs-apt-service-card[aria-pressed='true']");
        const serviceName = serviceCard?.querySelector("h3, h4, .cs-apt-service-card-title")?.textContent.trim()
            || service?.value
            || "Not selected yet";

        const make = document.getElementById("cs-apt-vehicle-make");
        const model = document.getElementById("cs-apt-vehicle-model");
        const vehicleMake = make?.value.trim() || "";
        const vehicleModel = model?.value.trim() || "";

        const date = document.getElementById("cs-apt-selected-date");
        const time = document.getElementById("cs-apt-selected-time");

        document.getElementById("cs-apt-customer-summary-service").textContent = serviceName;
        document.getElementById("cs-apt-customer-summary-vehicle").textContent =
            [vehicleMake, vehicleModel].filter(Boolean).join(" ") || "Not entered yet";
        document.getElementById("cs-apt-customer-summary-date").textContent =
            date?.value || "Not selected yet";
        document.getElementById("cs-apt-customer-summary-time").textContent =
            time?.value || "Not selected yet";
    }

    function focusFirstInvalid() {
        const firstInvalid = fields.find(({ input }) => input.getAttribute("aria-invalid") === "true");
        if (firstInvalid) firstInvalid.input.focus();
    }

    fields.forEach(({ input }) => {

        /*--- Customer Input Restrictions ---*/

        // Full name: allow letters, spaces, apostrophes, periods and hyphens only.
        nameInput.addEventListener("input", function () {
            this.value = this.value.replace(/[^\p{L}\p{M}\s.'’-]/gu, "");
            if (this.getAttribute("aria-invalid") === "true" || this.classList.contains("cs-apt-customer-valid")) {
                validateField(this);
            }
            status.textContent = "";
        });

        // Phone: allow digits only.
        phoneInput.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "").slice(0, 10);
            if (this.getAttribute("aria-invalid") === "true" || this.classList.contains("cs-apt-customer-valid")) {
                validateField(this);
            }
            status.textContent = "";
        });

        // Email: retain normal email characters and validate the address.
        emailInput.addEventListener("input", function () {
            if (this.getAttribute("aria-invalid") === "true" || this.classList.contains("cs-apt-customer-valid")) {
                validateField(this);
            }
            status.textContent = "";
        });

        // Preferred contact method.
        contactInput.addEventListener("change", function () {
            validateField(this);
            status.textContent = "";
        });

        notesInput.addEventListener("input", updateCharacterCount);

    });

    notesInput.addEventListener("input", updateCharacterCount);

    [nameInput, emailInput, phoneInput, contactInput].forEach(input => {
        input.addEventListener("change", updateAppointmentSummary);
    });

    backButton.addEventListener("click", function () {
        const dateSection = document.getElementById("appointment-datetime");
        if (dateSection) dateSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        status.textContent = "";

        const valid = fields.map(({ input }) => validateField(input)).every(Boolean);
        if (!valid) {
            status.textContent = "Please check the highlighted fields before continuing.";
            focusFirstInvalid();
            return;
        }

        const customerDetails = {
            fullName: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            preferredContact: contactInput.value,
            additionalInstructions: notesInput.value.trim()
        };

        form.dispatchEvent(new CustomEvent("cs:customer-details-complete", {
            bubbles: true,
            detail: customerDetails
        }));

        const summarySection = document.getElementById("booking-summary");
        if (summarySection) {
            summarySection.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            status.textContent = "Your details are validated. Add the booking summary section with id=\"booking-summary\" to continue.";
        }
    });

    updateCharacterCount();
    updateAppointmentSummary();
});
/*--- Customer Details Section End ---*/

/*--- Booking Summary Section Start ---*/

/*--- Booking Summary Section ---*/
document.addEventListener("DOMContentLoaded", function () {
  const section = document.getElementById("booking-summary");
  const form = document.getElementById("cs-apt-summary-confirm-form");
  if (!section || !form) return;

  const status = document.getElementById("cs-apt-summary-status");
  const agree = document.getElementById("cs-apt-summary-agree");
  const consentError = document.getElementById("cs-apt-summary-consent-error");
  const modal = document.getElementById("cs-apt-confirm-modal");
  const dialog = modal?.querySelector(".cs-apt-confirm-dialog");
  const confirmSubmit = document.getElementById("cs-apt-confirm-submit");
  const confirmError = document.getElementById("cs-apt-confirm-error");

  let pendingBookingDetails = null;
  let previousFocus = null;

  /*--- Read Form Values ---*/
  function getValue(ids, fallback = "") {
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element && typeof element.value === "string" && element.value.trim()) {
        return element.value.trim();
      }
    }
    return fallback;
  }

  function getSelectedOption(ids) {
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element && element.tagName === "SELECT" && element.value) {
        return element.options[element.selectedIndex]?.text.trim() || element.value;
      }
    }
    return "Not entered";
  }

  function setText(id, value, fallback = "Not entered") {
    const element = document.getElementById(id);
    if (element) element.textContent = value || fallback;
  }

  /*--- Selected Service ---*/
  function getService() {
    const hiddenValue = getValue(["cs-apt-selected-service"]);
    const selectedCard = document.querySelector(
      ".cs-apt-service-card.is-selected, .cs-apt-service-card.active, .cs-apt-service-card[aria-pressed='true']"
    );
    const cardName = selectedCard?.querySelector("h3, h4, .cs-apt-service-card-title")?.textContent.trim();
    return cardName || hiddenValue || "Not selected";
  }

  /*--- Vehicle Details ---*/
  function getVehicle() {
    const make = getValue(["cs-apt-vehicle-make"]);
    const model = getValue(["cs-apt-vehicle-model"]);
    return [make, model].filter(Boolean).join(" ") || "Not entered";
  }

  /*--- Readable Appointment Date ---*/
  function getReadableDate() {
    const dateValue = getValue(["cs-apt-selected-date"]);
    if (!dateValue) return "Not selected";

    const parsedDate = new Date(dateValue + "T12:00:00");
    if (Number.isNaN(parsedDate.getTime())) return dateValue;

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(parsedDate);
  }

  /*--- Preferred Contact Method ---*/
  function getContactMethod() {
    const element = document.getElementById("cs-apt-customer-contact");
    if (!element || !element.value) return "Not selected";
    return element.options[element.selectedIndex]?.text.trim() || element.value;
  }

  /*--- Update Booking Summary ---*/
  function updateSummary() {
    const service = getService();
    const vehicle = getVehicle();
    const date = getReadableDate();
    const time = getValue(["cs-apt-selected-time"], "Not selected");
    const name = getValue(["cs-apt-customer-name"], "Not entered");
    const email = getValue(["cs-apt-customer-email"], "Not entered");
    const phone = getValue(["cs-apt-customer-phone"], "Not entered");
    const registration = getValue(
      ["cs-apt-vehicle-registration", "cs-apt-registration"],
      "Not entered"
    );
    const year = getSelectedOption(["cs-apt-vehicle-year"]);
    const fuel = getSelectedOption(["cs-apt-vehicle-fuel"]);
    const transmission = getSelectedOption(["cs-apt-vehicle-transmission"]);
    const mileage = getValue(["cs-apt-vehicle-mileage"], "Not provided");
    const notes = getValue(["cs-apt-customer-notes"]);

    setText("cs-apt-summary-service-name", service, "Not selected");
    setText("cs-apt-summary-service-description", "Review the selected service before confirming.");
    setText("cs-apt-summary-vehicle", vehicle);
    setText("cs-apt-summary-registration", registration);
    setText("cs-apt-summary-year", year);
    setText("cs-apt-summary-fuel", fuel);
    setText("cs-apt-summary-transmission", transmission);
    setText("cs-apt-summary-mileage", mileage === "Not provided" ? mileage : mileage + " km");
    setText("cs-apt-summary-date", date, "Not selected");
    setText("cs-apt-summary-time", time, "Not selected");
    setText("cs-apt-summary-name", name);
    setText("cs-apt-summary-email", email);
    setText("cs-apt-summary-phone", phone);
    setText("cs-apt-summary-contact-method", getContactMethod());

    setText("cs-apt-summary-overview-service", service, "Not selected");
    setText("cs-apt-summary-overview-date", date, "Not selected");
    setText("cs-apt-summary-overview-time", time, "Not selected");
    setText("cs-apt-summary-overview-vehicle", vehicle);

    const notesWrap = document.getElementById("cs-apt-summary-notes-wrap");
    const notesElement = document.getElementById("cs-apt-summary-notes");

    if (notesWrap && notesElement) {
      notesElement.textContent = notes;
      notesWrap.hidden = !notes;
    }
  }

  /*--- Open Confirmation Popup ---*/
  function openConfirmationPopup(bookingDetails) {
    if (!modal) {
      status.textContent = "Confirmation popup not found. Check that its HTML is included in appointment.html.";
      return;
    }

    pendingBookingDetails = bookingDetails;
    previousFocus = document.activeElement;

    setText("cs-apt-confirm-service", bookingDetails.service, "Not selected");
    setText("cs-apt-confirm-date", getReadableDate(), "Not selected");
    setText("cs-apt-confirm-time", bookingDetails.time, "Not selected");

    if (confirmError) confirmError.textContent = "";
    if (confirmSubmit) {
      confirmSubmit.disabled = false;
      const label = confirmSubmit.querySelector("span");
      if (label) label.textContent = "Yes, confirm booking";
    }

    modal.classList.add("cs-apt-confirm-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("cs-apt-confirm-scroll-lock");

    if (dialog) dialog.focus();
  }

  /*--- Close Confirmation Popup ---*/
  function closeConfirmationPopup() {
    if (!modal) return;

    modal.classList.remove("cs-apt-confirm-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cs-apt-confirm-scroll-lock");
    pendingBookingDetails = null;

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  /*--- Edit Previous Appointment Steps ---*/
  section.querySelectorAll("[data-cs-summary-edit]").forEach(button => {
    button.addEventListener("click", function () {
      const target = document.getElementById(this.dataset.csSummaryEdit);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /*--- Back to Customer Details ---*/
  const backButton = document.getElementById("cs-apt-summary-back");

  if (backButton) {
    backButton.addEventListener("click", function () {
      const target = document.getElementById("customer-details");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /*--- Consent Checkbox ---*/
  agree.addEventListener("change", function () {
    consentError.textContent = "";
    status.textContent = "";
  });

  /*--- Show Popup on Confirm Request ---*/
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    updateSummary();
    status.textContent = "";

    if (!agree.checked) {
      consentError.textContent = "Please confirm that you have reviewed your booking details.";
      agree.focus();
      return;
    }

    consentError.textContent = "";

    const bookingDetails = {
      service: getService(),
      vehicle: getVehicle(),
      registration: getValue(["cs-apt-vehicle-registration", "cs-apt-registration"]),
      year: getValue(["cs-apt-vehicle-year"]),
      fuel: getValue(["cs-apt-vehicle-fuel"]),
      transmission: getValue(["cs-apt-vehicle-transmission"]),
      mileage: getValue(["cs-apt-vehicle-mileage"]),
      date: getValue(["cs-apt-selected-date"]),
      time: getValue(["cs-apt-selected-time"]),
      fullName: getValue(["cs-apt-customer-name"]),
      email: getValue(["cs-apt-customer-email"]),
      phone: getValue(["cs-apt-customer-phone"]),
      preferredContact: getValue(["cs-apt-customer-contact"]),
      additionalInstructions: getValue(["cs-apt-customer-notes"]),
      customerConfirmedReview: true
    };

    if (!bookingDetails.service || bookingDetails.service === "Not selected" ||
        !bookingDetails.date || !bookingDetails.time ||
        !bookingDetails.fullName || !bookingDetails.email || !bookingDetails.phone) {
      status.textContent = "Some booking details are missing. Please revisit the previous steps.";
      return;
    }

    openConfirmationPopup(bookingDetails);
  });

  /*--- Popup Close Buttons ---*/
  if (modal) {
    modal.querySelectorAll("[data-cs-confirm-close]").forEach(button => {
      button.addEventListener("click", closeConfirmationPopup);
    });
  }

  /*--- Keyboard Controls ---*/
  document.addEventListener("keydown", function (event) {
    if (!modal?.classList.contains("cs-apt-confirm-open")) return;

    if (event.key === "Escape") {
      closeConfirmationPopup();
      return;
    }

    if (event.key === "Tab" && dialog) {
      const focusable = [...dialog.querySelectorAll(
        "button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex='-1'])"
      )].filter(element => element.offsetParent !== null);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  /*--- Final Confirmation Button ---*/
  if (confirmSubmit) {
    confirmSubmit.addEventListener("click", function () {
      if (!pendingBookingDetails) return;

      if (confirmError) confirmError.textContent = "";

      const bookingDetails = pendingBookingDetails;

      const confirmationEvent = new CustomEvent("cs:booking-confirm-requested", {
        bubbles: true,
        cancelable: true,
        detail: bookingDetails
      });

      const accepted = section.dispatchEvent(confirmationEvent);

      if (accepted) {
        closeConfirmationPopup();
        status.textContent = "Your booking request is confirm";
      } else if (confirmError) {
        confirmError.textContent = "The booking request could not be started. Please try again.";
      }
    });
  }

  /*--- Refresh Summary from Previous Steps ---*/
  const customerForm = document.getElementById("cs-apt-customer-form");

  if (customerForm) {
    customerForm.addEventListener("input", updateSummary);
    customerForm.addEventListener("change", updateSummary);
  }

  const vehicleSection = document.getElementById("vehicle-information");

  if (vehicleSection) {
    vehicleSection.addEventListener("input", updateSummary);
    vehicleSection.addEventListener("change", updateSummary);
  }

  const dateSection = document.getElementById("appointment-datetime");

  if (dateSection) {
    dateSection.addEventListener("change", updateSummary);
  }

  const serviceSection = document.getElementById("service-selection");

  if (serviceSection) {
    serviceSection.addEventListener("click", function () {
      window.setTimeout(updateSummary, 0);
    });
  }

  section.addEventListener("pointerenter", updateSummary, { once: true });

  updateSummary();
});

/*--- Booking Summary Section End ---*/

/*--- Booking Summary Required Fields Validation ---*/
document.addEventListener("DOMContentLoaded", function () {
  const summary = document.getElementById("booking-summary");
  const form = document.getElementById("cs-apt-summary-confirm-form");
  const confirmButton = document.querySelector(".cs-apt-summary-confirm");
  const status = document.getElementById("cs-apt-summary-status");
  const consent = document.getElementById("cs-apt-summary-agree");
  const consentError = document.getElementById("cs-apt-summary-consent-error");

  if (!summary || !confirmButton) return;

  /*--- Required Appointment Fields ---*/
  const requiredFields = [
    { ids: ["cs-apt-vehicle-make"], label: "Vehicle make" },
    { ids: ["cs-apt-vehicle-model"], label: "Vehicle model" },
    { ids: ["cs-apt-vehicle-registration", "cs-apt-registration"], label: "Vehicle registration" },
    { ids: ["cs-apt-vehicle-year"], label: "Vehicle year" },
    { ids: ["cs-apt-vehicle-fuel"], label: "Fuel type" },
    { ids: ["cs-apt-vehicle-transmission"], label: "Transmission" },
    { ids: ["cs-apt-customer-name"], label: "Full name" },
    { ids: ["cs-apt-customer-email"], label: "Email address" },
    { ids: ["cs-apt-customer-phone"], label: "Phone number" },
    { ids: ["cs-apt-selected-service"], label: "Service selection" },
    { ids: ["cs-apt-selected-date"], label: "Appointment date" },
    { ids: ["cs-apt-selected-time"], label: "Appointment time" }
  ];

  /*--- Check Field Values ---*/
  function getField(ids) {
    for (const id of ids) {
      const field = document.getElementById(id);
      if (field) return field;
    }
    return null;
  }

  function isFieldComplete(field) {
    if (!field || !field.value || !field.value.trim()) return false;
    if (field.tagName === "SELECT" && field.selectedIndex <= 0) return false;
    return true;
  }

  function getMissingFields() {
    return requiredFields.filter(item => {
      const field = getField(item.ids);
      return !isFieldComplete(field);
    });
  }

  /*--- Validate Email and Phone ---*/
  function getInvalidContactFields() {
    const invalid = [];
    const email = getField(["cs-apt-customer-email"]);
    const phone = getField(["cs-apt-customer-phone"]);

    if (email && email.value.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      invalid.push("Enter a valid email address");
    }

    if (phone && phone.value.trim() &&
        !/^[0-9+\s()-]{7,20}$/.test(phone.value.trim())) {
      invalid.push("Enter a valid phone number");
    }

    return invalid;
  }

  /*--- Update Button State ---*/
  function validateBooking() {
    const missing = getMissingFields();
    const invalid = getInvalidContactFields();
    const consentChecked = !consent || consent.checked;
    const isValid = missing.length === 0 && invalid.length === 0 && consentChecked;

    confirmButton.disabled = !isValid;
    confirmButton.setAttribute("aria-disabled", String(!isValid));

    if (missing.length > 0) {
      confirmButton.title = "Complete all required appointment details first.";
    } else if (invalid.length > 0) {
      confirmButton.title = "Correct the invalid contact details first.";
    } else if (!consentChecked) {
      confirmButton.title = "Confirm that you have reviewed your booking details.";
    } else {
      confirmButton.title = "Confirm appointment request";
    }

    return { isValid, missing, invalid, consentChecked };
  }

  /*--- Show Validation Message ---*/
  function showValidationMessage(result) {
    if (result.missing.length) {
      status.textContent = "Please complete all required details above. Missing: " +
        result.missing.map(item => item.label).join(", ") + ".";
    } else if (result.invalid.length) {
      status.textContent = result.invalid.join(". ") + ".";
    } else if (!result.consentChecked) {
      status.textContent = "Please tick the confirmation checkbox before proceeding.";
    } else {
      status.textContent = "";
    }
  }

  /*--- Validate on User Input ---*/
  document.addEventListener("input", function (event) {
    if (event.target.closest("#booking-summary, #vehicle-information, #customer-details")) {
      validateBooking();
    }
  });

  document.addEventListener("change", function (event) {
    if (event.target.closest("#booking-summary, #vehicle-information, #customer-details, #service-selection, #appointment-datetime")) {
      validateBooking();
    }
  });

  if (consent) {
    consent.addEventListener("change", function () {
      if (consentError) consentError.textContent = "";
      validateBooking();
    });
  }

  /*--- Block Invalid Confirmation ---*/
  confirmButton.addEventListener("click", function (event) {
    const result = validateBooking();

    if (!result.isValid) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showValidationMessage(result);

      if (result.missing.length) {
        const firstMissing = getField(result.missing[0].ids);
        const targetSection = firstMissing?.closest("section");
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

      return;
    }

    if (status) status.textContent = "";
  }, true);

  /*--- Initial Validation ---*/
  validateBooking();
});

/*--- Booking Success Popup Logic ---*/
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("cs-apt-success-modal");
  const doneButton = document.getElementById("cs-apt-success-done");
  const confirmButton = document.getElementById("cs-apt-confirm-submit");
  if (!modal || !doneButton || !confirmButton) {
    console.error("Booking success popup: Required HTML elements are missing.");
    return;
  }

  let previousFocus = null;

  /*--- Open Success Popup ---*/
  function openSuccessPopup(booking) {
    previousFocus = document.activeElement;

    const setText = (id, value, fallback = "Not provided") => {
      const element = document.getElementById(id);
      if (element) element.textContent = value || fallback;
    };

    setText("cs-apt-success-service", booking.service, "Selected service");
    setText("cs-apt-success-date", booking.dateLabel || booking.date, "Selected date");
    setText("cs-apt-success-time", booking.timeLabel || booking.time, "Selected time");

    modal.classList.add("cs-apt-success-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("cs-apt-success-lock");
    doneButton.focus();
  }

  /*--- Close Success Popup ---*/
  function closeSuccessPopup() {
    modal.classList.remove("cs-apt-success-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cs-apt-success-lock");

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  /*--- Listen for Final Booking Confirmation ---*/
  document.addEventListener("cs:booking-confirm-requested", function (event) {
    const booking = event.detail;
    if (!booking) return;

    /* Let the existing confirmation handler finish closing its popup first. */
    window.setTimeout(function () {
      openSuccessPopup(booking);
    }, 100);
  });

  /*--- Popup Close Controls ---*/
  doneButton.addEventListener("click", closeSuccessPopup);

  modal.querySelectorAll("[data-cs-success-close]").forEach(button => {
    button.addEventListener("click", closeSuccessPopup);
  });

  /*--- Keyboard Controls ---*/
  document.addEventListener("keydown", function (event) {
    if (!modal.classList.contains("cs-apt-success-open")) return;

    if (event.key === "Escape") {
      closeSuccessPopup();
    }

    if (event.key === "Tab") {
      event.preventDefault();
      doneButton.focus();
    }
  });
});
/*--- Booking Success Popup Logic End ---*/
