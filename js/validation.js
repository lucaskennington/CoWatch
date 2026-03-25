// Code for validation.js, which validates the login and signup menus
// Bibliography of sources can be found at bottom of file

const form = document.getElementById('form')
const display_name_input = document.getElementById('displayname-input')
const username_input = document.getElementById('username-input')
const password_input = document.getElementById('password-input')
const repeat_password_input = document.getElementById('repeat-password-input')
const error_message = document.getElementById('error-message')
var currentUser = "";

// This is the first script that runs by default
// If a user has stayed logged in their username should be in Chrome storage
// If so they are immediately redirected to the main menu
chrome.storage.local.get(["loggedInUser"])
.then((result) => {
    currentUser = result.loggedInUser;
    error_message.innerText = currentUser;
    console.log("Value is " + currentUser);
    if (currentUser != null){
        window.location.replace("emofeedbackMenu.html");
    }
})
.catch((error) => {
    console.log(error);
});
// Use of Chrome storage from [1]


// Form behaviour from validation tutorial by Coding2GO, [2]
form.addEventListener('submit', async (e) => {
    let errors = [] // store all issues with credentials
    let signup = true;
    if(display_name_input){
        errors = validateSignup(display_name_input.value, username_input.value, password_input.value, repeat_password_input.value)
        signup = true; // perform validation on signup (field unique to signup detected)
    }
    else{
        errors = validateLogin(username_input.value, password_input.value)
        signup = false; // perform validation on login (field unique to login detected)
    }

    // problem with credentials
    if(errors.length > 0){
        e.preventDefault() // overwrite form refresh
        error_message.innerText = errors.join(". ") // display problems

    // information is good (signup)
    } else if (signup){
        e.preventDefault()
        // fetch: standard web API function to send HTTP requests
        // fetch syntax obtained from [3]
        // formData syntax from [4]
        const formData = new FormData(form);
        console.log(formData.entries());
        response = await fetch('https://api-cowatch.onrender.com/newUsers', { // send to server
            method: "POST",
            headers: {
                "Content-Type":"application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(formData).toString()
        })
        const result = await response.json(); // get confirmation
        if (result.success){
            console.log(result.username)
        } else {
            error_message.innerText = "Problem creating new account"
        }
    // information is good (login)
    } else {
        e.preventDefault()
        // use formData again
        const formData = new FormData(form);
        console.log(formData.entries);
        response = await fetch('https://api-cowatch.onrender.com/existingUsers', {
            method: "POST",
            headers: {
                "Content-Type":"application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(formData).toString()
        })
        const result = await response.json();
        // passwords match; successful login
        if (result.success){
            error_message.innerText = "";
            // Set local Chrome storage to remember user between forms
            chrome.storage.local.set({loggedInUser: result.currentUser})
            .then(() => {
                console.log("Value is set");
                window.location.replace("emofeedbackMenu.html");
            });
        } else {
            error_message.innerText = result.errorDetail;
        }
    }
})

// Form behaviour from validation tutorial by Coding2GO [2]
function validateSignup(display_name, username, password, repeatPassword){
    let errors = []

    // check display name entered
    if (display_name === '' || display_name == null){
        errors.push('Display name is required')
        display_name_input.parentElement.classList.add('incorrect')
    }
    // check username entered
    if (username === '' || username == null){
        errors.push('Username is required')
        username_input.parentElement.classList.add('incorrect')
    }
    // check password entered
    if (password === '' || password == null){
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
    }
    // check min password length
    if (password.length < 8){
        errors.push('Password must have at least 8 characters')
        password_input.parentElement.classList.add('incorrect')
    }
    // check password entered correctly
    if (password != repeatPassword){
        errors.push('Passwords do not match')
        repeat_password_input.parentElement.classList.add('incorrect')
    }

    return errors;
}

// Form behaviour from validation tutorial by Coding2GO [2]]
function validateLogin(username, password){
    let errors = []

    // check username entered
    if (username === '' || username == null){
        errors.push('Username is required')
        username_input.parentElement.classList.add('incorrect')
    }

    // check password entered
    if (password === '' || password == null){
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
    }

    return errors;
}

// final feature entered from Code2GO tutorial [2]
const allInputs = [display_name_input, username_input, password_input, repeat_password_input].filter(input => input != null)
// remove existing error messages for new input
allInputs.forEach(input => {
    input.addEventListener('input', () => {
        if(input.parentElement.classList.contains('incorrect')){
            input.parentElement.classList.remove('incorrect')
            error_message.innerText = ''
        }
    })
})

// ---------------------------------------------------------------------------------------------------
// **CODE BIBLIOGRAPHY**

// [1] Chrome API documentation - "chrome.storage" - last updated 2025-12-19
// Available at https://developer.chrome.com/docs/extensions/mv2/reference/storage

// [2] Coding2GO (YouTube) - "Login & Signup with HTML, CSS, JavaScript (form validation)" - 2024-07-14
// Available at https://www.youtube.com/watch?v=bVl5_UdcAy0

// [3] Mozilla MDN - "Using the Fetch API" - last updated 2025-08-20
// Available at https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

// [4] Mozilla MDN - "Using FormData Objects" - last updated 2025-06-24
// Available at https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API/Using_FormData_Objects