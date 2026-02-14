const API = "http://localhost:3000";

/* ---------------- ADD BOOK ---------------- */
function addBook() {
  const name = document.getElementById("name").value;
  const author = document.getElementById("author").value;
  const qty = document.getElementById("qty").value;

  fetch(API + "/addBook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, author, qty })
  })
  .then(() => {
    loadBooks();
    loadStats();
  });
}

/* ---------------- LOAD BOOKS ---------------- */
function loadBooks() {
  fetch(API + "/books")
    .then(res => res.json())
    .then(data => {
      const table = document.getElementById("bookTable");
      if (!table) return;

      table.innerHTML = "";
      data.forEach((book, index) => {
        table.innerHTML += `
          <tr>
            <td>${book.name}</td>
            <td>${book.author}</td>
            <td>${book.qty}</td>
            <td>
              <button onclick="deleteBook(${index})">❌</button>
            </td>
          </tr>
        `;
      });
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
    loadBooks();
    loadStats();
  });
}

/* ---------------- SEARCH BOOK ---------------- */
function searchBook(value) {
  fetch(API + "/books")
    .then(res => res.json())
    .then(data => {
      const table = document.getElementById("bookTable");
      table.innerHTML = "";

      data
        .filter(b => b.name.toLowerCase().includes(value.toLowerCase()))
        .forEach((book, index) => {
          table.innerHTML += `
            <tr>
              <td>${book.name}</td>
              <td>${book.author}</td>
              <td>${book.qty}</td>
              <td>
                <button onclick="deleteBook(${index})">❌</button>
              </td>
            </tr>
          `;
        });
    });
}

/* ---------------- ISSUE BOOK ---------------- */
function issueBook() {
  const student = document.getElementById("student").value;
  const book = document.getElementById("book").value;
  const returnDate = document.getElementById("returnDate").value;

  fetch(API + "/issueBook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student, book, returnDate })
  })
  .then(res => res.json())
   .then(data => {
   loadStats();
   alert(data.message);
  });

}

/* ---------------- DASHBOARD ---------------- */
function loadStats() {
  fetch(API + "/books")
    .then(res => res.json())
    .then(data => {
      const el = document.getElementById("totalBooks");
      if (el) el.innerText = data.length;
    });

  fetch(API + "/issued")
    .then(res => res.json())
    .then(data => {
      const el = document.getElementById("issuedBooks");
      if (el) el.innerText = data.length;
    });
}

loadBooks();
loadStats();
