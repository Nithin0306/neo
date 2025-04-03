// Get the modal
var modal = document.getElementById("myModal");
var modalTitle = document.getElementById("modalTitle");
var modalDescription = document.getElementById("modalDescription");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// Function to show modal with custom content
function showModal(title, description) {
  modalTitle.textContent = title;
  modalDescription.textContent = description;
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// Filter by subject
function filterSubject(subject) {
  // Update active tab
  const tabs = document.querySelectorAll(".subject-tab");
  tabs.forEach((tab) => {
    tab.classList.remove("active");
    if (
      tab.textContent.toLowerCase().includes(subject) ||
      (subject === "all" && tab.textContent === "All")
    ) {
      tab.classList.add("active");
    }
  });

  // Filter cards
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    if (subject === "all" || card.dataset.subject.includes(subject)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

// Search functionality
function search() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();

  if (!searchTerm) {
    filterSubject("all");
    return;
  }

  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    const cardText = card.textContent.toLowerCase();
    if (cardText.includes(searchTerm)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

// Search on Enter key
document
  .getElementById("searchInput")
  .addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      search();
    }
  });
