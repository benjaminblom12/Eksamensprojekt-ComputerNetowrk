document
  .getElementById("loginKnap")
  .addEventListener("click", async function (e) {
    // Generere token
    try {
      function generateToken() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (c) {
            var r = (Math.random() * 16) | 0,
              v = c == "x" ? r : (r & 0x3) | 0x8;

            return v.toString(16);
          }
        );
      }
      function generateSession(email) {
        let session = { email: email, token: generateToken() };
        return session;
      }
      //skriv her
      let email = document.getElementById("email").value;
      let password = document.getElementById("password").value;

      let bruger = {
        email: email,
        password: password,
      };

      let session = generateSession(email);
      e.preventDefault();

      // Opretter session og sender en videre til hovecsiden

      await fetch("http://localhost:8080/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(session),
      }).then((res) => {
        if (res.status == 200) {
          localStorage.setItem("SessionInfo", JSON.stringify(session));
        } else {
          window.alert("Der skete en fejl.");
        }
      });
      await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bruger),
      }).then((res) => {
        // console.log(res);
        if (res.status == 200) {
          location.href = "/chat.html";
        } else {
          window.alert("Der skete en fejl.");
        }
      });
    } catch {
      window.alert("fejl");
    }
  });
