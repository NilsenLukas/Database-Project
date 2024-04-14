const form = document.querySelector("form");
const firstN = document.getElementById("fname");
const lastN = document.getElementById("lname");
const email = document.getElementById("email");
const subject = document.getElementById("subject");
const message = document.getElementById("message");

function sendEmail(){
    const bodyMessage = `Full Name: ${firstN.value} ${lastN.value}<br>
    Email: ${email.value} <br>
    Message: ${message.value}`;
    Email.send({
        Host : "smtp.elasticemail.com",
        Username : "Lagt123456@gmail.com",
        Password : "AAFE1126720711413AED86CDE6C35F972545",
        To : 'Lagt123456@gmail.com',
        From : "lagt123456@gmail.com",
        Subject : subject.value,
        Body : bodyMessage
    }).then(
        message => {
            if (message == "OK"){
                Swal.fire({
                    title: "Thank you for youre feedback",
                    text: "Your message has been sent!",
                    icon: "success"
                });  
            }
        }
    );
    //console.log('testing1');
}

function checkError(){
    const items = document.querySelectorAll(".item");
    
    for (const item of items){
        if (item.value == ""){
            item.classList.add("error");
            item.parentElement.classList.add("error");
            //console.log("1");
        }

        if (items[2].value != ""){
            checkEmail();
            //console.log("2");
        }
        items[2].addEventListener("keyup", () => {
            checkEmail();
            //console.log("3");
        });

        item.addEventListener("keyup", () => {
            if (item.value != ""){
                item.classList.remove("error");
                item.parentElement.classList.remove("error");
                //console.log("4");
            }
            else{
                item.classList.add("error");
                item.parentElement.classList.add("error");
                //console.log("5");
            }
        });
    }
}

function checkEmail(){
    const emailRegex = /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,3})(\•[a-z]{2,3})?$/;
    const errorTxtEmail = document.querySelector(".error-txt.email");

    if (!email.value.match(emailRegex)){
        email.classList.add("error");
        email.parentElement.classList.add("error");
        //console.log("6");

        if (email.value != ""){
            errorTxtEmail.innerText = "Enter a valid email address";
            //console.log("9");
        }
        else{
            errorTxtEmail.innerText = "Email address can't be blank";
            //console.log("10");
        }
    }
    else{
        email.classList.remove("error");
        email.parentElement.classList.remove("error");
        //console.log("7");
    }
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    //console.log('testing');
    checkError();

    if (!firstN.classList.contains("error") && !lastN.classList.contains("error") && !email.classList.contains("error") && !subject.classList.contains("error") &&!firstN.classList.contains("error") &&!firstN.classList.contains("error") && !message.classList.contains("error")){
        sendEmail();
    }
    
    //console.log('testing1');
});

