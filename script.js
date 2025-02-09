import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA-r4tepj52PQvxfvL5lFl0yHVy-X60kZU",
  authDomain: "anlet-c703b.firebaseapp.com",
  projectId: "anlet-c703b",
  storageBucket: "anlet-c703b.firebasestorage.app",
  messagingSenderId: "792145828805",
  appId: "1:792145828805:web:a80d2199f2136fa575c9ac",
  measurementId: "G-5EEBKMJ414"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("🔥 Firebase berhasil terhubung.");

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ JavaScript dimuat!");

  // Dom elements
  const lettersContainer = document.getElementById("letters-container");
  const latestLettersContainer = document.getElementById("latest-letters-container");
  const totalLettersElement = document.getElementById("total-letters");
  const messageForm = document.getElementById("messageForm");
  const searchInput = document.getElementById("searchInput");
  const hamburgerMenu = document.querySelector('.hamburger-menu');

  // Toggle menu visibility
  function toggleMenu() {
    console.log("☰ Menu di-toggle");
    const menu = document.getElementById("menu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  }

  // Event listener for hamburger menu
  if (hamburgerMenu) {
    hamburgerMenu.addEventListener('click', toggleMenu);
  }

  // Function to save message to Firebase
  async function saveMessage(to, message) {
    try {
      await addDoc(collection(db, "letters"), {
        to,
        message,
        date: new Date().toISOString(),
      });
      showPopup("✅ Pesan berhasil dikirim!");
      messageForm.reset();
      window.location.href = "main.html";
    } catch (error) {
      console.error("❌ Gagal menyimpan pesan: ", error);
      showPopup("❌ Gagal menyimpan pesan!");
    }
  }

  // Fetch letters from Firebase
  async function fetchLetters() {
    console.log("📥 Mengambil surat dari Firebase...");
    if (!lettersContainer) return;
    lettersContainer.innerHTML = "<p>Memuat surat...</p>";

    try {
      const querySnapshot = await getDocs(query(collection(db, "letters"), orderBy("date", "desc")));
      console.log("🔍 Data surat berhasil diambil:", querySnapshot);

      lettersContainer.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const letter = doc.data();
        const dateString = new Date(letter.date).toLocaleString("id-ID");
        const letterElement = document.createElement("div");
        letterElement.classList.add("letter");
        letterElement.innerHTML = `
          <h3>${letter.to}</h3>
          <p>"${letter.message.length > 100 ? letter.message.substring(0, 100) + "..." : letter.message}"</p>
          <span class="date">${dateString}</span>
          <a href="main.html?id=${doc.id}" class="read-letter">📩 Baca Selengkapnya</a>
        `;
        lettersContainer.appendChild(letterElement);
      });

    } catch (error) {
      console.error("❌ Gagal mengambil surat:", error);
      lettersContainer.innerHTML = "<p>Gagal memuat surat.</p>";
    }
  }

  // Fetch latest letters from Firebase
  async function fetchLatestLetters() {
    console.log("📥 Mengambil surat terbaru dari Firebase...");
    if (!latestLettersContainer) return;
    latestLettersContainer.innerHTML = "<p>Memuat surat...</p>";

    try {
      const querySnapshot = await getDocs(query(collection(db, "letters"), orderBy("date", "desc")));
      console.log("🔍 Surat terbaru berhasil diambil:", querySnapshot);

      latestLettersContainer.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const letter = doc.data();
        const dateString = new Date(letter.date).toLocaleString("id-ID");
        const letterElement = document.createElement("div");
        letterElement.classList.add("letter");
        letterElement.innerHTML = `
          <h3>${letter.to}</h3>
          <p>"${letter.message.length > 100 ? letter.message.substring(0, 100) + "..." : letter.message}"</p>
          <span class="date">${dateString}</span>
          <a href="main.html?id=${doc.id}" class="read-letter">📩 Baca Selengkapnya</a>
        `;
        latestLettersContainer.appendChild(letterElement);
      });

      startCarousel();

    } catch (error) {
      console.error("❌ Gagal mengambil surat terbaru:", error);
      latestLettersContainer.innerHTML = "<p>Gagal memuat surat.</p>";
    }
  }

  // Start carousel effect for latest letters
  function startCarousel() {
    let scrollAmount = 0;
    const step = 1;
    const speed = 20;

    function scrollCarousel() {
      if (scrollAmount >= latestLettersContainer.scrollWidth - latestLettersContainer.clientWidth) {
        scrollAmount = 0;
        latestLettersContainer.scrollLeft = 0;
      } else {
        scrollAmount += step;
        latestLettersContainer.scrollLeft += step;
      }
      setTimeout(scrollCarousel, speed);
    }
    scrollCarousel();
  }

  // Fetch total letters count
  async function fetchTotalLetters() {
    console.log("📊 Menghitung jumlah surat...");
    if (!totalLettersElement) return;

    try {
      const querySnapshot = await getDocs(collection(db, "letters"));
      const totalLetters = querySnapshot.size;
      totalLettersElement.textContent = totalLetters;
    } catch (error) {
      console.error("❌ Gagal menghitung surat:", error);
      totalLettersElement.textContent = "Gagal memuat";
    }
  }

  // Check for a specific letter ID in the URL and show its details
  function checkForLetterPopup() {
    const urlParams = new URLSearchParams(window.location.search);
    const suratId = urlParams.get("id");
    if (suratId) {
      showLetterPopup(suratId);
    }
  }

  // Show the letter details in a popup
  async function showLetterPopup(suratId) {
    console.log("📩 Membuka surat dengan ID:", suratId);

    try {
      const suratRef = doc(db, "letters", suratId);
      const suratSnap = await getDoc(suratRef);

      if (!suratSnap.exists()) {
        alert("❌ Surat tidak ditemukan.");
        return;
      }

      const surat = suratSnap.data();
      const popup = document.createElement("div");
      popup.classList.add("popup-surat");
      popup.innerHTML = `
        <div class="popup-content">
          <h2>Untuk: ${surat.to}</h2>
          <p>${surat.message}</p>
          <small>${new Date(surat.date).toLocaleString("id-ID")}</small>
          <button class="close-popup">Tutup</button>
        </div>
      `;
      document.body.appendChild(popup);

      popup.querySelector(".close-popup").addEventListener("click", function () {
        popup.remove();
      });

    } catch (error) {
      console.error("❌ Gagal mengambil surat:", error);
    }
  }

  // Show popup messages
  function showPopup(message) {
    let popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerHTML = `<div class="popup-content">${message}</div>`;

    document.body.appendChild(popup);

    setTimeout(() => {
      popup.classList.add("fade-out");
      setTimeout(() => popup.remove(), 500);
    }, 2000);
  }

  // Handle form submission for sending a message
  if (messageForm) {
    messageForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const to = document.getElementById("to").value.trim();
      const message = document.getElementById("message").value.trim();
      if (!to || !message) {
        showPopup("⚠ Harap masukkan semua data!");
        return;
      }
      saveMessage(to, message);
    });
  }

  // Implement search functionality
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = searchInput.value.toLowerCase().trim();
      searchLetters(searchTerm);
    });
  }

  // Search letters function
  async function searchLetters(searchTerm) {
    console.log("🔍 Mencari surat...");
    const lettersContainer = document.getElementById("letters-container");
    lettersContainer.innerHTML = "<p>Memuat surat...</p>";
  
    try {
      const querySnapshot = await getDocs(collection(db, "letters"));
      lettersContainer.innerHTML = "";
  
      querySnapshot.forEach((doc) => {
        const letter = doc.data();
        const dateString = new Date(letter.date).toLocaleString("id-ID");
  
        // Pencarian berdasarkan nama (to) atau pesan (message)
        if (letter.to.toLowerCase().includes(searchTerm) || letter.message.toLowerCase().includes(searchTerm)) {
          const letterElement = document.createElement("div");
          letterElement.classList.add("letter");
          letterElement.innerHTML = `
            <h3>${letter.to}</h3>
            <p>"${letter.message.length > 100 ? letter.message.substring(0, 100) + "..." : letter.message}"</p>
            <span class="date">${dateString}</span>
            <a href="main.html?id=${doc.id}" class="read-letter">📩 Baca Selengkapnya</a>
          `;
          lettersContainer.appendChild(letterElement);
        }
      });
  
    } catch (error) {
      console.error("❌ Gagal mencari surat:", error);
      lettersContainer.innerHTML = "<p>Gagal memuat surat.</p>";
    }
  }

  // Initialize app functions
  fetchLatestLetters();
  fetchLetters();
  fetchTotalLetters();
  checkForLetterPopup();
});
