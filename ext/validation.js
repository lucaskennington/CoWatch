const form = document.getElementById('form')
const firstname_input = document.getElementById('firstname-input')
const username_input = document.getElementById('username-input')
const password_input = document.getElementById('password-input')
const repeat_password_input = document.getElementById('repeat-password-input')
const error_message = document.getElementById('error-message')
var currentUser = "";

chrome.storage.local.get(["loggedInUser"])
.then((result) => {
    currentUser = result.loggedInUser;
    error_message.innerText = currentUser;
    console.log("Value is " + currentUser);
    if (currentUser != null){
        window.location.replace("cowatchMenu.html");
    }
})
.catch((error) => {
    console.log(error);
});

form.addEventListener('submit', async (e) => {
    let errors = []
    let signup = true;
    if(firstname_input){
        errors = getSignupFormErrors(firstname_input.value, username_input.value, password_input.value, repeat_password_input.value)
        signup = true;
    }
    else{
        errors = getLoginFormErrors(username_input.value, password_input.value)
        signup = false;
    }

    if(errors.length > 0){
        e.preventDefault()
        error_message.innerText = errors.join(". ")
    } else if (signup){
        e.preventDefault()
        const formData = new FormData(form);
        console.log(formData.entries());
        response = await fetch('http://localhost:3000/newUsers', {
            method: "POST",
            headers: {
                "Content-Type":"application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(formData).toString()
        })
        const result = await response.json();
        if (result.success){
            console.log(result.username)
        } else {
            error_message.innerText = "Problem creating new account"
        }

    } else {
        e.preventDefault()
        const formData = new FormData(form);
        console.log(formData.entries);
        response = await fetch('http://localhost:3000/existingUsers', {
            method: "POST",
            headers: {
                "Content-Type":"application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(formData).toString()
        })
        const result = await response.json();
        if (result.success){
            error_message.innerText = "";
            chrome.storage.local.set({loggedInUser: result.currentUser})
            .then(() => {
                console.log("Value is set");
                window.location.replace("cowatchMenu.html");
            });
        } else {
            error_message.innerText = result.errorDetail;
        }
    }
})

function getSignupFormErrors(firstname, username, password, repeatPassword){
    let errors = []

    if (firstname === '' || firstname == null){
        errors.push('Display name is required')
        firstname_input.parentElement.classList.add('incorrect')
    }
    if (username === '' || username == null){
        errors.push('Username is required')
        username_input.parentElement.classList.add('incorrect')
    }
    if (password === '' || password == null){
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
    }
    if (password.length < 8){
        errors.push('Password must have at least 8 characters')
        password_input.parentElement.classList.add('incorrect')
    }
    if (password != repeatPassword){
        errors.push('Passwords do not match')
        repeat_password_input.parentElement.classList.add('incorrect')
    }

    return errors;
}

function getLoginFormErrors(username, password){
    let errors = []

    if (username === '' || username == null){
        errors.push('Username is required')
        username_input.parentElement.classList.add('incorrect')
    }
    if (password === '' || password == null){
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
    }

    return errors;
}

const allInputs = [firstname_input, username_input, password_input, repeat_password_input].filter(input => input != null)

allInputs.forEach(input => {
    input.addEventListener('input', () => {
        if(input.parentElement.classList.contains('incorrect')){
            input.parentElement.classList.remove('incorrect')
            error_message.innerText = ''
        }
    })
})