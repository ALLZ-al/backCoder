const form = document.getElementById("registerForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const dataForm = new FormData(form);

  const obj = {};
  dataForm.forEach((value, key) => {
    obj[key] = value;
  });
  fetch("/api/sessions/register", {
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((result) => {
    console.log("result.status", result.status);

    if (result.status === 200) {
      result.json();
      alert("Usuario creado con exito!");
      window.location.replace("/users/login");
    } else {
      alert("No se pudo crear el usuario!");
    }
  });
});
