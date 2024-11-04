document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('identityForm');
    const emailInput = document.getElementById('email');
    const errorMessage = document.getElementById('errorMessage');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = emailInput.value.trim();

        if (!email) {
            showError('Email is required');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            showError('Invalid email format');
            return;
        }

        // Here you would typically send the email to your backend
        console.log('Email submitted:', email);

        // Reset form
        emailInput.value = '';
        hideError();
    });

    function showError(message) {
        errorMessage.querySelector('span').textContent = message;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }
});
