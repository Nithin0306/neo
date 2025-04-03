document
  .getElementById("generate-btn")
  .addEventListener("click", generateFlashcards);
document.getElementById("clear-btn").addEventListener("click", clearInput);

async function generateFlashcards() {
  const inputText = document.getElementById("flashcard-input").value.trim();
  if (!inputText) {
    alert("Please enter some text to summarize!");
    return;
  }

  try {
    // Show loading state
    const container = document.getElementById("flashcards-container");
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Generating summaries...</p>
      </div>
    `;

    // Call the backend API
    const response = await fetch("http://localhost:5000/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: inputText }),
    });

    // Handle the response properly
    let data;
    try {
      // Get the response as text first to inspect it
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      // Try to parse it as JSON
      data = JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse JSON response:", error);
      throw new Error("Invalid response format from server");
    }

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate summary");
    }

    // Clear the container
    container.innerHTML = "";

    // Check if we have cards with proper structure
    if (!data.cards || data.cards.length === 0) {
      throw new Error("No summary content was generated");
    }

    // Create flashcard deck
    const deck = document.createElement("div");
    deck.className = "flashcard-deck";

    // Add counter display
    const counter = document.createElement("div");
    counter.className = "flashcard-counter";
    counter.textContent = "Card 1 of " + data.cards.length;
    container.appendChild(counter);

    // Generate flashcards
    data.cards.forEach((card, index) => {
      const flashcard = document.createElement("div");
      flashcard.className = "flashcard";
      flashcard.dataset.index = index;

      if (index !== 0) {
        flashcard.style.display = "none"; // Hide all except first card
      }

      // Create card content
      const cardContent = document.createElement("div");
      cardContent.className = "flashcard-content";

      // Add card title if available
      if (card.title) {
        const cardTitle = document.createElement("h3");
        cardTitle.className = "card-title";
        cardTitle.textContent = card.title;
        cardContent.appendChild(cardTitle);
      }

      // Add points
      if (card.points && card.points.length > 0) {
        const pointsList = document.createElement("div");
        pointsList.className = "points-list";

        card.points.forEach((point) => {
          const pointItem = document.createElement("div");
          pointItem.className = "point-item";

          const pointConcept = document.createElement("h4");
          pointConcept.className = "point-concept";
          pointConcept.textContent = point.concept || "Key Point";
          pointItem.appendChild(pointConcept);

          if (point.explanation) {
            const pointExplanation = document.createElement("p");
            pointExplanation.className = "point-explanation";
            pointExplanation.textContent = point.explanation;
            pointItem.appendChild(pointExplanation);
          }

          pointsList.appendChild(pointItem);
        });

        cardContent.appendChild(pointsList);
      }

      flashcard.appendChild(cardContent);
      deck.appendChild(flashcard);
    });

    container.appendChild(deck);

    // Add navigation buttons
    const navButtons = document.createElement("div");
    navButtons.className = "flashcard-navigation";

    const prevBtn = document.createElement("button");
    prevBtn.className = "nav-btn prev-btn";
    prevBtn.textContent = "Previous";
    prevBtn.disabled = true; // Disabled initially

    const nextBtn = document.createElement("button");
    nextBtn.className = "nav-btn next-btn";
    nextBtn.textContent = "Next";
    if (data.cards.length <= 1) {
      nextBtn.disabled = true;
    }

    navButtons.appendChild(prevBtn);
    navButtons.appendChild(nextBtn);
    container.appendChild(navButtons);

    // Navigation functionality
    let currentCardIndex = 0;

    nextBtn.addEventListener("click", () => {
      if (currentCardIndex < data.cards.length - 1) {
        // Hide current card
        deck.querySelector(
          `.flashcard[data-index="${currentCardIndex}"]`
        ).style.display = "none";

        // Show next card
        currentCardIndex++;
        deck.querySelector(
          `.flashcard[data-index="${currentCardIndex}"]`
        ).style.display = "block";

        // Update buttons and counter
        prevBtn.disabled = false;
        nextBtn.disabled = currentCardIndex >= data.cards.length - 1;
        counter.textContent = `Card ${currentCardIndex + 1} of ${
          data.cards.length
        }`;
      }
    });

    prevBtn.addEventListener("click", () => {
      if (currentCardIndex > 0) {
        // Hide current card
        deck.querySelector(
          `.flashcard[data-index="${currentCardIndex}"]`
        ).style.display = "none";

        // Show previous card
        currentCardIndex--;
        deck.querySelector(
          `.flashcard[data-index="${currentCardIndex}"]`
        ).style.display = "block";

        // Update buttons and counter
        nextBtn.disabled = false;
        prevBtn.disabled = currentCardIndex <= 0;
        counter.textContent = `Card ${currentCardIndex + 1} of ${
          data.cards.length
        }`;
      }
    });
  } catch (error) {
    console.error("Error:", error);

    const container = document.getElementById("flashcards-container");
    container.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Error: ${error.message}</p>
        <p>Please try again with different text.</p>
      </div>
    `;
  }
}

function clearInput() {
  const textarea = document.getElementById("flashcard-input");
  textarea.value = "";

  const container = document.getElementById("flashcards-container");
  container.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-lightbulb"></i>
      <p>Your flashcards will appear here</p>
    </div>
  `;
}
