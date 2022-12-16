document.getElementById("createUser").addEventListener("click", (e) => {
  let Emailvalue = document.getElementById("email").value;
  let Passwordvalue = document.getElementById("password").value;
  let user = {
    email: Emailvalue,
    password: Passwordvalue,
  };
  e.preventDefault();
  fetch("http://localhost:8080/register/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  }).then((res) => {
    //hvis respons var status 200 sendes man til login.html
    if (res.status == 200) {
      location.href = "/login.html";
    } else {
      window.alert("Email er allerede i brug");
    }
  });
});
