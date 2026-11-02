// Hamburger navigation, interactive menu, form validation, date/time, accordions.

document.addEventListener("DOMContentLoaded", function () {
    // 1. Hamburger navigation (available on desktop and mobile)
    const hamburger = document.querySelector(".hamburger");
    const nav = document.querySelector(".nav-links");

    if (hamburger && nav) {
        function setNavigationOpen(isOpen) {
            nav.classList.toggle("active", isOpen);
            hamburger.classList.toggle("active", isOpen);
            hamburger.setAttribute("aria-expanded", String(isOpen));
            hamburger.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
        }
        hamburger.addEventListener("click", function () {
            setNavigationOpen(hamburger.getAttribute("aria-expanded") !== "true");
        });
        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () { setNavigationOpen(false); });
        });
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") setNavigationOpen(false);
        });
        document.addEventListener("click", function (event) {
            if (!event.target.closest(".site-header")) setNavigationOpen(false);
        });
    }

    // 2. Interactive menu search, categories and reset button
    const searchInput = document.getElementById("menuSearch");
    const menuCards = Array.from(document.querySelectorAll(".menu-card"));
    const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
    const menuCount = document.getElementById("menuCount");
    const noResults = document.getElementById("noResults");
    const resetButton = document.getElementById("resetMenu");

    if (searchInput && menuCards.length && menuCount && noResults) {
        let selectedCategory = "all";
        function filterMenu() {
            const searchText = searchInput.value.trim().toLocaleLowerCase();
            let visibleItems = 0;
            menuCards.forEach(function (card) {
                const searchableText = (card.dataset.name || card.textContent).toLocaleLowerCase();
                const matchesSearch = searchableText.includes(searchText);
                const matchesCategory = selectedCategory === "all" || card.dataset.category === selectedCategory;
                const shouldShow = matchesSearch && matchesCategory;
                card.hidden = !shouldShow;
                if (shouldShow) visibleItems += 1;
            });
            menuCount.textContent = visibleItems + (visibleItems === 1 ? " menu item found" : " menu items found");
            noResults.hidden = visibleItems !== 0;
        }
        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                selectedCategory = button.dataset.category || "all";
                filterButtons.forEach(function (otherButton) {
                    const active = otherButton === button;
                    otherButton.classList.toggle("active", active);
                    otherButton.setAttribute("aria-pressed", String(active));
                });
                filterMenu();
            });
        });
        searchInput.addEventListener("input", filterMenu);
        if (resetButton) {
            resetButton.addEventListener("click", function () {
                searchInput.value = "";
                selectedCategory = "all";
                filterButtons.forEach(function (button) {
                    const active = button.dataset.category === "all";
                    button.classList.toggle("active", active);
                    button.setAttribute("aria-pressed", String(active));
                });
                filterMenu();
                searchInput.focus();
            });
        }
        filterMenu();
    }

    // 3. Dynamic South African date and time
    const dateElement = document.getElementById("currentDate");
    const timeElement = document.getElementById("time");
    if (dateElement || timeElement) {
        function updateDateTime() {
            const now = new Date();
            const zone = { timeZone: "Africa/Johannesburg" };
            if (dateElement) {
                dateElement.textContent = new Intl.DateTimeFormat("en-ZA", {
                    ...zone, weekday: "long", year: "numeric", month: "long", day: "numeric"
                }).format(now);
            }
            if (timeElement) {
                timeElement.textContent = new Intl.DateTimeFormat("en-ZA", {
                    ...zone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
                }).format(now);
            }
        }
        updateDateTime();
        if (timeElement) window.setInterval(updateDateTime, 1000);
    }

    // 4. Enquiry and contact form validation
    document.querySelectorAll("form").forEach(function (form) {
        const fields = Array.from(form.querySelectorAll("input, select, textarea"));
        if (!fields.length) return;
        form.noValidate = true;
        let feedback = form.querySelector(".form-feedback");
        if (!feedback) {
            feedback = document.createElement("p");
            feedback.className = "form-feedback";
            feedback.setAttribute("role", "status");
            feedback.setAttribute("aria-live", "polite");
            form.appendChild(feedback);
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            feedback.textContent = "";
            feedback.className = "form-feedback";
            fields.forEach(function (field) { field.setCustomValidity(""); });

            const nameField = form.querySelector('#fullname, #contactName, [name="name"]');
            const emailField = form.querySelector('input[type="email"]');
            const phoneField = form.querySelector('input[type="tel"]');
            const messageField = form.querySelector("textarea");
            const dateField = form.querySelector('input[type="date"]');

            if (nameField && nameField.value.trim().length < 2) {
                nameField.setCustomValidity("Please enter a name with at least 2 characters.");
            }
            if (emailField && !emailField.validity.valid) {
                emailField.setCustomValidity("Please enter a valid email address, for example name@example.com.");
            }
            if (phoneField && phoneField.value.trim() && !/^[+()\d\s-]{7,20}$/.test(phoneField.value.trim())) {
                phoneField.setCustomValidity("Please enter a valid phone number.");
            }
            if (messageField && messageField.value.trim().length < 10) {
                messageField.setCustomValidity("Please enter a message ");
            }
            if (dateField && dateField.value) {
                const chosenDate = new Date(dateField.value + "T00:00:00");
                const todayString = new Intl.DateTimeFormat("en-CA", {
                    timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit", day: "2-digit"
                }).format(new Date());
                const today = new Date(todayString + "T00:00:00");
                if (chosenDate < today) dateField.setCustomValidity("Please choose today or a future date.");
            }
            const invalidField = fields.find(function (field) {
                return field.willValidate && !field.checkValidity();
            });
            if (invalidField) {
                feedback.textContent = "Please check the highlighted fields and correct the information before submitting.";
                feedback.classList.add("form-feedback-error");
                invalidField.reportValidity();
                invalidField.focus();
                return;
            }
            feedback.textContent = "Your form passed validation. Thank you for your submission!";
            feedback.classList.add("form-feedback-success");
            feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
        form.addEventListener("reset", function () {
            window.setTimeout(function () {
                fields.forEach(function (field) { field.setCustomValidity(""); });
                feedback.textContent = "";
                feedback.className = "form-feedback";
            }, 0);
        });
    });

    // 5. Expandable About page sections
    document.querySelectorAll("button.accordion").forEach(function (button) {
        const panel = button.nextElementSibling;
        if (!panel || !panel.classList.contains("panel")) return;
        button.setAttribute("aria-expanded", "false");
        panel.hidden = true;
        button.addEventListener("click", function () {
            const willOpen = panel.hidden;
            panel.hidden = !willOpen;
            button.setAttribute("aria-expanded", String(willOpen));
            button.classList.toggle("expanded", willOpen);
        });
    });
});

        
// 6. Image lightbox gallery
const galleryImages = document.querySelectorAll(".lightbox-img");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const closeLightbox = document.querySelector(".close-lightbox");

if (lightbox && lightboxImage && closeLightbox) {

    galleryImages.forEach(function (image) {
        image.addEventListener("click", function () {
            lightboxImage.src = image.src;
            lightboxImage.alt = image.alt;

            if (lightboxCaption) {
                lightboxCaption.textContent = image.alt;
            }

            lightbox.classList.add("active");
            lightbox.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
            closeLightbox.focus();
        });
    });

    function hideLightbox() {
        lightbox.classList.remove("active");
        lightbox.setAttribute("aria-hidden", "true");
        lightboxImage.src = "";
        document.body.style.overflow = "";
    }

    closeLightbox.addEventListener("click", hideLightbox);

    lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox) {
            hideLightbox();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && lightbox.classList.contains("active")) {
            hideLightbox();
        }
    });
}