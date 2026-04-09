const API = "http://localhost:3000";

/* ---------------- VALIDATION HELPER ---------------- */
function showError(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.classList.add("shake-error", "border-error");
  setTimeout(() => {
    el.classList.remove("shake-error");
    setTimeout(() => {
      el.classList.remove("border-error");
    }, 2000); // Remove red border after 2s
  }, 400); // Shake animation lasts 400ms
}

function renderEmptyState(table, message) {
  table.innerHTML = `
    <tr>
      <td colspan="5">
        <div class="empty-state fade-in">
          <div class="icon">📁</div>
          <h3>No Books Found</h3>
          <p>${message}</p>
        </div>
      </td>
    </tr>
  `;
}

function getStatusBadge(qty) {
  // If the user's backend supplies custom statuses later, those can be injected here.
  // For now, based on qty:
  if (parseInt(qty) > 0) {
    return `<span class="badge badge-success">Available</span>`;
  }
  return `<span class="badge badge-warning">Out of Stock</span>`;
}

function renderBooks(data, table) {
  table.innerHTML = "";
  if (!data || data.length === 0) {
    renderEmptyState(table, "Try adding a new book or adjusting your search.");
    updateDashboardStats();
    return;
  }

  data.forEach((book, index) => {
    // stagger fade-in slightly based on index
    const delay = index < 10 ? index * 0.05 : 0; 
    
    // If book actually has a "status" property in the future, we prioritize that, else fallback to qty calculation.
    let statusHTML = book.status ? `<span class="badge">${book.status}</span>` : getStatusBadge(book.qty);

    table.innerHTML += `
      <tr class="fade-in" style="animation-delay: ${delay}s">
        <td><strong>${book.name}</strong></td>
        <td>${book.author}</td>
        <td>${book.qty}</td>
        <td>${statusHTML}</td>
        <td>
          <button class="action-btn" title="Edit" onclick="alert('Edit coming soon!')">✏️</button>
          <button class="action-btn" title="Delete" onclick="deleteBook(${index})">🗑️</button>
        </td>
      </tr>
    `;
  });
  
  // Call updateDashboardStats automatically once rendering finishes
  updateDashboardStats();
}

/* ---------------- DASHBOARD STATS ---------------- */
function updateDashboardStats() {
  const tableRows = document.querySelectorAll("#bookTable tr");
  let totalBooks = 0;
  let issuedCount = 0;
  let overdueCount = 0;

  tableRows.forEach(row => {
    // Check if it's the empty state row
    if (row.querySelector(".empty-state")) return;
    
    totalBooks++;
    
    const statusCell = row.cells[3]; // 'Status' is the 4th column (index 3)
    if (statusCell) {
      const statusText = statusCell.innerText.toLowerCase();
      if (statusText.includes("issued")) issuedCount++;
      if (statusText.includes("overdue")) overdueCount++;
    }
  });

  const totalEl = document.getElementById("totalBooks");
  if (totalEl) totalEl.innerText = totalBooks;

  const issuedEl = document.getElementById("issuedBooks");
  if (issuedEl) issuedEl.innerText = issuedCount;

  const overdueEl = document.getElementById("overdueBooks");
  if (overdueEl) overdueEl.innerText = overdueCount;

  const memberEl = document.getElementById("memberCount");
  if (memberEl) memberEl.innerText = "14"; // Still mocked as requested
}

/* ---------------- ADD BOOK ---------------- */
function addBook() {
  const name = document.getElementById("name").value.trim();
  const author = document.getElementById("author").value.trim();
  const qty = document.getElementById("qty").value.trim();

  let hasError = false;
  if (!name) { showError("name"); hasError = true; }
  if (!author) { showError("author"); hasError = true; }
  if (!qty) { showError("qty"); hasError = true; }

  if (hasError) return;

  fetch(API + "/addBook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, author, qty })
  })
  .then(() => {
    // Clear inputs upon success
    document.getElementById("name").value = "";
    document.getElementById("author").value = "";
    document.getElementById("qty").value = "";
    loadBooks(); // this will call updateDashboardStats
  })
  .catch(err => console.error("Error adding book:", err));
}

/* ---------------- LOAD BOOKS ---------------- */
function loadBooks() {
  fetch(API + "/books")
    .then(res => res.json())
    .then(data => {
      const table = document.getElementById("bookTable");
      if (!table) return;
      renderBooks(data, table);
    })
    .catch(err => {
      const table = document.getElementById("bookTable");
      if (table) renderEmptyState(table, "Failed to load data. Ensure backend is running.");
      console.error(err);
    });
}

/* ---------------- DELETE BOOK ---------------- */
function deleteBook(index) {
  fetch(API + "/deleteBook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ index })
  })
  .then(() => {
    loadBooks(); // this will call updateDashboardStats
  })
  .catch(err => console.error("Error deleting book:", err));
}

/* ---------------- SEARCH BOOK ---------------- */
function searchBook(value) {
  fetch(API + "/books")
    .then(res => res.json())
    .then(data => {
      const table = document.getElementById("bookTable");
      if (!table) return;
      
      const filtered = data.filter(b => 
        b.name.toLowerCase().includes(value.toLowerCase()) || 
        b.author.toLowerCase().includes(value.toLowerCase())
      );
      
      renderBooks(filtered, table);
    })
    .catch(err => console.error("Error searching books:", err));
}

/* ---------------- ISSUE BOOK ---------------- */
function issueBook() {
  const student = document.getElementById("student").value.trim();
  const book = document.getElementById("book").value.trim();
  const returnDate = document.getElementById("returnDate").value.trim();

  let hasError = false;
  if (!student) { showError("student"); hasError = true; }
  if (!book) { showError("book"); hasError = true; }
  if (!returnDate) { showError("returnDate"); hasError = true; }

  if (hasError) return;

  fetch(API + "/issueBook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student, book, returnDate })
  })
  .then(res => res.json())
  .then(data => {
    // Clear inputs
    document.getElementById("student").value = "";
    document.getElementById("book").value = "";
    document.getElementById("returnDate").value = "";
    alert(data.message || "Book issued successfully");
    if(window.location.pathname.includes("index.html")) {
      updateDashboardStats();
    }
  })
  .catch(err => console.error("Error issuing book:", err));
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("bookTable")) {
    loadBooks();
  } else {
    // If on a page other than dashboard without a table, but with stats
    updateDashboardStats();
  }
});
