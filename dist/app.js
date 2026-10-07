const bookingDialog = document.querySelector(".booking-dialog");
const serviceSelect = document.querySelector("#booking-service");
const noteField = document.querySelector("#booking-note");
const statusLine = document.querySelector("#booking-status");
const prepareButton = document.querySelector("#prepare-request");

function openBooking(service = "") {
  if (service) serviceSelect.value = service;
  statusLine.textContent = "Studio booking details will be added here.";
  statusLine.classList.remove("is-ready");
  bookingDialog.showModal();
}

document.querySelectorAll("[data-open-booking]").forEach((button) => {
  button.addEventListener("click", () => openBooking());
});

document.querySelectorAll("[data-service]").forEach((button) => {
  button.addEventListener("click", () => openBooking(button.dataset.service));
});

prepareButton.addEventListener("click", async () => {
  const service = serviceSelect.value;
  if (!service) {
    statusLine.textContent = "Choose a starting point and we’ll put your note together.";
    serviceSelect.focus();
    return;
  }

  const note = noteField.value.trim();
  const request = [`FWD/01 session request — ${service}`, note && `A note from me: ${note}`]
    .filter(Boolean)
    .join("\n");

  try {
    await navigator.clipboard.writeText(request);
    statusLine.textContent = "Your session note is copied. Studio contact and booking details can be connected here.";
  } catch {
    statusLine.textContent = `${request} — Studio contact and booking details can be connected here.`;
  }
  statusLine.classList.add("is-ready");
});

bookingDialog.addEventListener("click", (event) => {
  if (event.target === bookingDialog) bookingDialog.close();
});
