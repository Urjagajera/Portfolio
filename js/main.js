// filepath: c:\vs code\html\portfolio\js\main.js
document.addEventListener("DOMContentLoaded", function() {
    // Form submission handler for the contact form in me.html
    const contactForm = document.querySelector("form");
    if (contactForm) {
        contactForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Prevent the default form submission

            const name = contactForm.querySelector("input[type='text']").value;
            const email = contactForm.querySelector("input[type='email']").value;
            const queries = contactForm.querySelector("textarea").value;

            if (validateForm(name, email, queries)) {
                alert(`Thank you, ${name}! Your message has been sent.`);
                contactForm.reset(); // Reset the form after submission
            }
        });
    }

    // Function to validate the contact form
    function validateForm(name, email, queries) {
        if (!name || !email || !queries) {
            alert("Please fill in all fields.");
            return false;
        }
        if (!validateEmail(email)) {
            alert("Please enter a valid email address.");
            return false;
        }
        return true;
    }

    // Function to validate email format
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll("nav a");
    navLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            // Only intercept fragment/anchor links (e.g. "#about") for smooth scrolling.
            // Links that point to other pages (e.g. "me.html") should navigate normally.
            const href = this.getAttribute("href");
            if (href && href.startsWith('#')) {
                event.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: "smooth" });
                }
            }
        });
    });
});