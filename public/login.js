
function setFormMesage(formElement, type, message){
    const messageElement = formElement.querySelector(".form__message");

    messageElement.textContent = message;
    messageElement.classList.remove("form__message--success", "form__message--error");
    messageElement.classList.add(`form__message--${type}`);
}

function setInputError(inputElement, message){
    inputElement.classList.add("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = message;
}

function clearImputError(inputElement){
    inputElement.classList.remove("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = "";

}

//switching between login and create account
document.addEventListener("DOMContentLoaded", () =>{
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");

    document.querySelector("#linkCreateAccount").addEventListener("click", e=> {
        e.preventDefault();
        loginForm.classList.add("form--hidden");
        createAccountForm.classList.remove("form--hidden");
    });

    document.querySelector("#linkLogin").addEventListener("click", e=> {
        e.preventDefault();
        createAccountForm.classList.add("form--hidden");
        loginForm.classList.remove("form--hidden");
    });

    
    loginForm.addEventListener("submit", async e=>{
        e.preventDefault();

        const loginData = {
            email: document.querySelector("#loginEmail").value,
            password: document.querySelector("#loginPassword").value
        };

        try{
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });
            const data = await response.json();

            if (response.ok){
                setFormMesage(loginForm, "success", "Login successful");
                window.location.href = 'AboutUs.html';
            } else{
                throw new Error(data.message);
            }
        }catch (error){
            setFormMesage(loginForm, "error", error.message);
        }
    });
    

    document.querySelector("#createAccount").addEventListener("submit", async e => {
        e.preventDefault();

        const formData = {
            email: document.querySelector("#signUpEmail").value,
            password: document.querySelector("#signUpPassword").value, 
            fName: document.querySelector("#signUpFName").value,
            lName: document.querySelector("#signUpLName").value
        };

        try{
            const response = await fetch('/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (response.ok){
                setFormMesage(createAccountForm, "success", data.message);
                window.location.href = 'AboutUs.html';
            }
            else{
                throw new Error(data.message);
            }
        } catch (error){
            setFormMesage(createAccountForm, "error", error.message);
        }
    });

    document.querySelectorAll(".form__input").forEach(inputElement =>{
        inputElement.addEventListener("blur", e =>{
            if (e.target.id === "signUpPassword" && e.target.value.length > 0 && e.target.value.length < 8){
                setInputError(inputElement, "Password must be atlease 8 characters")
            }
            if (e.target.id === "signUpConfirmPassword" && e.target.value.length > 0 && e.target.value.length < 8){
                setInputError(inputElement, "Password must be atlease 8 characters")
            }

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if ((e.target.id === "loginEmail" || e.target.id === "signUpEmail") && e.target.value.length > 0 && !emailRegex.test(e.target.value)){
                setInputError(inputElement, "Must enter a valid email address")
            }
        });
        inputElement.addEventListener("input", e=>{
            clearImputError(inputElement);
        });
    });
});



