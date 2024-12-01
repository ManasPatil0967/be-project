const passwordField = document.querySelector('input[type="password"]' || 'input[name="password"]' || 'input[name="pass"]');
if (passwordField) {
    const password = '6747f552ff63feca79a5ac8b01c1b25ec6e8c2ed34e841fe958c6d77baf46480';
    passwordField.value = password;

    // Trigger input and change events to ensure the webpage detects the update
    passwordField.dispatchEvent(new Event('input', { bubbles: true }));
    passwordField.dispatchEvent(new Event('change', { bubbles: true }));
} else {
    console.error("Password field not found!");
}
