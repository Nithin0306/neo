document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const mainContent = document.querySelector(".main-content");
  const themeToggle = document.getElementById("theme-toggle");
  const contactLink = document.getElementById("contact-link");
  const dashboardContent = document.getElementById("dashboard-content");
  const contactContainer = document.getElementById("contact-container");
  const backToDashboard = document.getElementById("back-to-dashboard");
  const createTodoBtn = document.getElementById("create-todo-btn");
  const todoModal = document.getElementById("todo-modal");
  const closeTodoModal = document.getElementById("close-todo-modal");
  const todoInput = document.getElementById("todo-input");
  const addTodoBtn = document.getElementById("add-todo-btn");
  const todoList = document.getElementById("todo-list");
  const clearTodosBtn = document.getElementById("clear-todos-btn");
  const saveTodosBtn = document.getElementById("save-todos-btn");
  const flashcardInput = document.getElementById("flashcard-input");
  const generateBtn = document.getElementById("generate-btn");
  const clearBtn = document.getElementById("clear-btn");
  const flashcardsContainer = document.getElementById("flashcards-container");
  const logo = document.querySelector(".main-header .logo");

  // Method switching in contact form
  const methodBtns = document.querySelectorAll(".method-btn");
  const contactDetails = document.getElementById("contact-details");
  const contactForm = document.getElementById("contact-form");
  const mapContainer = document.getElementById("map-container");

  // Form elements
  const form = document.getElementById("inquiry-form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const subjectSelect = document.getElementById("subject");
  const messageInput = document.getElementById("message");
  const submitBtn = document.getElementById("submit-btn");
  const successMessage = document.getElementById("success-message");

  // Toggle sidebar
  sidebarToggle.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
  });

  // Toggle theme
  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");

    if (document.body.classList.contains("dark-theme")) {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
  });

  // Office status indicator
  function updateOfficeStatus() {
    const statusElement = document.getElementById("office-status");
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hours = now.getHours();

    let isOpen = false;
    let openUntil = "";

    if (day === 0) {
      // Sunday
      isOpen = hours >= 10 && hours < 19;
      openUntil = "7:00 PM";
    } else {
      // Monday-Saturday
      isOpen = hours >= 10 && hours < 21;
      openUntil = "9:00 PM";
    }

    if (isOpen) {
      statusElement.innerHTML =
        '<span style="color: var(--secondary-color); font-weight: bold;">● OPEN NOW</span> (until ' +
        openUntil +
        ")";
    } else {
      statusElement.innerHTML =
        '<span style="color: #ef4444; font-weight: bold;">● CLOSED</span> (opens at 10:00 AM)';
    }
  }

  // Copy address to clipboard
  const addressElement = document.querySelector(".contact-item[data-tooltip]");
  const addressText = document.getElementById("address");

  if (addressElement && addressText) {
    addressElement.addEventListener("click", function () {
      navigator.clipboard.writeText(addressText.textContent).then(() => {
        // Create and show tooltip
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip-text";
        tooltip.textContent = "Address copied to clipboard!";
        tooltip.style.position = "absolute";
        tooltip.style.backgroundColor = "var(--text-primary)";
        tooltip.style.color = "var(--bg-primary)";
        tooltip.style.padding = "5px 10px";
        tooltip.style.borderRadius = "4px";
        tooltip.style.top = "-30px";
        tooltip.style.left = "50%";
        tooltip.style.transform = "translateX(-50%)";
        tooltip.style.zIndex = "100";

        this.style.position = "relative";
        this.appendChild(tooltip);

        // Remove tooltip after 2 seconds
        setTimeout(() => {
          tooltip.remove();
        }, 2000);
      });
    });
  }

  // "Let's talk" link
  const talkLink = document.getElementById("talk-link");
  if (talkLink) {
    talkLink.addEventListener("click", function (e) {
      e.preventDefault();

      // Switch to contact form
      methodBtns.forEach((btn) => {
        if (btn.getAttribute("data-method") === "form") {
          btn.click();
        }
      });

      // Focus on the name field
      if (nameInput) nameInput.focus();
    });
  }

  // Form validation
  if (form) {
    // Real-time validation
    nameInput.addEventListener("input", validateName);
    emailInput.addEventListener("input", validateEmail);
    phoneInput.addEventListener("input", validatePhone);
    subjectSelect.addEventListener("change", validateSubject);
    messageInput.addEventListener("input", validateMessage);

    // Form submission
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validate all fields
      const isNameValid = validateName();
      const isEmailValid = validateEmail();
      const isPhoneValid = validatePhone();
      const isSubjectValid = validateSubject();
      const isMessageValid = validateMessage();

      if (
        isNameValid &&
        isEmailValid &&
        isPhoneValid &&
        isSubjectValid &&
        isMessageValid
      ) {
        // Disable submit button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";

        // Simulate form submission (would be an API call in a real application)
        setTimeout(() => {
          form.reset();
          form.style.display = "none";
          successMessage.style.display = "block";
        }, 1500);
      }
    });
  }

  // Validation functions
  function validateName() {
    const nameError = document.getElementById("name-error");
    if (!nameInput.value.trim()) {
      nameInput.classList.add("error");
      nameError.style.display = "block";
      return false;
    } else {
      nameInput.classList.remove("error");
      nameError.style.display = "none";
      return true;
    }
  }

  function validateEmail() {
    const emailError = document.getElementById("email-error");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value)) {
      emailInput.classList.add("error");
      emailError.style.display = "block";
      return false;
    } else {
      emailInput.classList.remove("error");
      emailError.style.display = "none";
      return true;
    }
  }

  function validatePhone() {
    const phoneError = document.getElementById("phone-error");
    // Only validate if something is entered (phone is optional)
    if (phoneInput.value.trim()) {
      const phoneRegex = /^\+?[0-9]{10,15}$/;

      if (!phoneRegex.test(phoneInput.value.replace(/\s|-/g, ""))) {
        phoneInput.classList.add("error");
        phoneError.style.display = "block";
        return false;
      }
    }

    phoneInput.classList.remove("error");
    phoneError.style.display = "none";
    return true;
  }

  function validateSubject() {
    const subjectError = document.getElementById("subject-error");

    if (!subjectSelect.value) {
      subjectSelect.classList.add("error");
      subjectError.style.display = "block";
      return false;
    } else {
      subjectSelect.classList.remove("error");
      subjectError.style.display = "none";
      return true;
    }
  }

  function validateMessage() {
    const messageError = document.getElementById("message-error");

    if (!messageInput.value.trim()) {
      messageInput.classList.add("error");
      messageError.style.display = "block";
      return false;
    } else {
      messageInput.classList.remove("error");
      messageError.style.display = "none";
      return true;
    }
  }

  // Method buttons event listeners
  if (methodBtns) {
    methodBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        // Remove active class from all buttons
        methodBtns.forEach((b) => b.classList.remove("active"));

        // Add active class to clicked button
        this.classList.add("active");

        // Hide all content sections
        contactDetails.style.display = "none";
        contactForm.style.display = "none";
        mapContainer.style.display = "none";

        // Show the selected content section
        const method = this.getAttribute("data-method");
        if (method === "details") {
          contactDetails.style.display = "flex";
        } else if (method === "form") {
          contactForm.style.display = "block";
        } else if (method === "map") {
          mapContainer.style.display = "block";
        }
      });
    });
  }

  // Todo Modal
  createTodoBtn.addEventListener("click", function () {
    todoModal.style.display = "flex";
  });

  closeTodoModal.addEventListener("click", function () {
    todoModal.style.display = "none";
  });

  // Close modal when clicking outside
  todoModal.addEventListener("click", function (e) {
    if (e.target === todoModal) {
      todoModal.style.display = "none";
    }
  });

  // Add todo item
  addTodoBtn.addEventListener("click", function () {
    addTodoItem();
  });

  todoInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addTodoItem();
    }
  });

  function addTodoItem() {
    const todoText = todoInput.value.trim();

    if (todoText) {
      const todoItem = document.createElement("li");
      todoItem.className = "todo-item";

      const checkbox = document.createElement("div");
      checkbox.className = "todo-checkbox";
      checkbox.addEventListener("click", function () {
        this.classList.toggle("checked");
        this.innerHTML = this.classList.contains("checked")
          ? '<i class="fas fa-check"></i>'
          : "";
        todoTextElement.classList.toggle("completed");
      });

      const todoTextElement = document.createElement("div");
      todoTextElement.className = "todo-text";
      todoTextElement.textContent = todoText;

      const deleteBtn = document.createElement("div");
      deleteBtn.className = "delete-todo";
      deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
      deleteBtn.addEventListener("click", function () {
        todoItem.remove();
      });

      todoItem.appendChild(checkbox);
      todoItem.appendChild(todoTextElement);
      todoItem.appendChild(deleteBtn);

      todoList.appendChild(todoItem);
      todoInput.value = "";
      todoInput.focus();
    }
  }

  // Clear all todos
  clearTodosBtn.addEventListener("click", function () {
    todoList.innerHTML = "";
  });

  // Save todos (simulated)
  saveTodosBtn.addEventListener("click", function () {
    todoModal.style.display = "none";

    // Show a notification (could be implemented)
    alert("Todo list saved successfully!");
  });

  // Flashcards functionality
  generateBtn.addEventListener("click", function () {
    const text = flashcardInput.value.trim();

    if (text) {
      // Clear empty state
      flashcardsContainer.innerHTML = "";

      // Split text into sentences or paragraphs
      const sentences = text
        .split(/[.!?]+/)
        .filter((sentence) => sentence.trim().length > 0);

      // Create flashcards
      sentences.forEach((sentence, index) => {
        if (sentence.trim().length > 5) {
          // Avoid very short sentences
          createFlashcard(sentence.trim(), index);
        }
      });
    }
  });

  clearBtn.addEventListener("click", function () {
    flashcardInput.value = "";
    flashcardsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-lightbulb"></i>
                <p>Your flashcards will appear here</p>
            </div>
        `;
  });

  function createFlashcard(text, index) {
    // Create a question from the text
    const words = text.split(" ");
    let question = text;
    let answer = "";

    // For simplicity, we'll just hide a random word for the question
    if (words.length > 3) {
      const randomIndex = Math.floor(Math.random() * words.length);
      answer = words[randomIndex];
      words[randomIndex] = "_______";
      question = words.join(" ");
    } else {
      // For short sentences, just use the whole sentence as answer
      answer = text;
      question = "What comes next in your notes?";
    }

    const flashcard = document.createElement("div");
    flashcard.className = "flashcard";
    flashcard.dataset.index = index;

    const front = document.createElement("div");
    front.className = "flashcard-front";
    front.innerHTML = `
            <h3>Question ${index + 1}</h3>
            <p>${question}</p>
        `;

    const back = document.createElement("div");
    back.className = "flashcard-back";
    back.innerHTML = `
            <h3>Answer</h3>
            <p>${answer}</p>
        `;

    const actions = document.createElement("div");
    actions.className = "flashcard-actions";
    actions.innerHTML = `
            <button class="flashcard-btn flip-btn" title="Flip Card"><i class="fas fa-sync-alt"></i></button>
            <button class="flashcard-btn edit-btn" title="Edit Card"><i class="fas fa-edit"></i></button>
            <button class="flashcard-btn delete-btn" title="Delete Card"><i class="fas fa-trash"></i></button>
        `;

    flashcard.appendChild(front);
    flashcard.appendChild(back);
    flashcard.appendChild(actions);

    // Add event listeners
    const flipBtn = actions.querySelector(".flip-btn");
    flipBtn.addEventListener("click", function () {
      flashcard.classList.toggle("flipped");
    });

    const editBtn = actions.querySelector(".edit-btn");
    editBtn.addEventListener("click", function () {
      // Simple edit functionality
      const newText = prompt("Edit your flashcard:", text);
      if (newText && newText.trim()) {
        // Recreate the flashcard with new text
        createFlashcard(newText.trim(), index);
        flashcard.remove();
      }
    });

    const deleteBtn = actions.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", function () {
      flashcard.remove();

      // Show empty state if no flashcards left
      if (flashcardsContainer.children.length === 0) {
        flashcardsContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-lightbulb"></i>
                        <p>Your flashcards will appear here</p>
                    </div>
                `;
      }
    });

    flashcardsContainer.appendChild(flashcard);
  }

  // Mobile sidebar toggle
  function setupMobileNav() {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      sidebar.classList.remove("collapsed");
      sidebar.classList.add("mobile-hidden");
      mainContent.classList.remove("expanded");

      // Create mobile menu button if it doesn't exist
      if (!document.getElementById("mobile-menu-btn")) {
        const mobileMenuBtn = document.createElement("button");
        mobileMenuBtn.id = "mobile-menu-btn";
        mobileMenuBtn.className = "mobile-menu-btn";
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuBtn.style.position = "fixed";
        mobileMenuBtn.style.top = "15px";
        mobileMenuBtn.style.left = "15px";
        mobileMenuBtn.style.zIndex = "1001";
        mobileMenuBtn.style.backgroundColor = "var(--primary-color)";
        mobileMenuBtn.style.color = "white";
        mobileMenuBtn.style.width = "40px";
        mobileMenuBtn.style.height = "40px";
        mobileMenuBtn.style.borderRadius = "50%";
        mobileMenuBtn.style.display = "flex";
        mobileMenuBtn.style.alignItems = "center";
        mobileMenuBtn.style.justifyContent = "center";
        mobileMenuBtn.style.boxShadow = "var(--shadow-md)";

        mobileMenuBtn.addEventListener("click", function () {
          sidebar.classList.toggle("mobile-visible");
        });

        document.body.appendChild(mobileMenuBtn);
      }
    } else {
      // Remove mobile menu button if it exists
      const mobileMenuBtn = document.getElementById("mobile-menu-btn");
      if (mobileMenuBtn) {
        mobileMenuBtn.remove();
      }

      sidebar.classList.remove("mobile-hidden", "mobile-visible");
    }
  }

  // Initial setup
  setupMobileNav();

  // Update on resize
  window.addEventListener("resize", setupMobileNav);

  // Initialize contact form display
  contactDetails.style.display = "flex";
  contactForm.style.display = "none";
  mapContainer.style.display = "none";
});

document.addEventListener("DOMContentLoaded", function () {
  let links = document.querySelectorAll(".sidebar-nav ul li a");
  let currentUrl = window.location.pathname.split("/").pop(); // Get current page filename

  links.forEach((link) => {
    if (link.getAttribute("href") === currentUrl) {
      link.parentElement.classList.add("active"); // Add 'active' to the <li>
    }
  });
});

 const playlistButtons = document.querySelectorAll('.playlist-btn');
        const iframe = document.getElementById('playlist-iframe');
        const coursesSection = document.getElementById('courses-section');
        const backButton = document.getElementById('back-button');
        
        playlistButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const playlistUrl = this.getAttribute('data-playlist');
                
                // Show iframe and back button, hide courses
                iframe.src = playlistUrl;
                iframe.style.display = 'block';
                coursesSection.classList.add('hidden');
                backButton.style.display = 'block';
            });
        });
        
        // Back button functionality
        backButton.addEventListener('click', function() {
            // Hide iframe and back button, show courses
            iframe.style.display = 'none';
            iframe.src = '';
            coursesSection.classList.remove('hidden');
            backButton.style.display = 'none';
        });

// Check for saved theme preference in localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    logo.src = '../images/logo-dark.png'; // Dark mode logo
    themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");

  // Check if dark mode is active after toggle
  const isDarkMode = document.body.classList.contains("dark-theme");

  // Update logo based on theme
  logo.src = isDarkMode ? "../images/logo-dark.jpg" : "../images/logo.png";

  // Update icon (moon to sun or vice versa)
  const icon = themeToggle.querySelector("i");
  if (isDarkMode) {
    icon.classList.replace("fa-moon", "fa-sun");
  } else {
    icon.classList.replace("fa-sun", "fa-moon");
  }

  // Save theme preference to localStorage
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
});