// Нэвтрэх (client-side гэнэн хамгаалалт)
(function () {
  var USER = "admin_khorshoo", PASS = "khorshoo_2026";
  var ov = document.getElementById("login-overlay");
  var form = document.getElementById("login-form");
  if (!ov || !form) return;
  if (sessionStorage.getItem("khorshoo_auth") === "1") ov.classList.add("hidden");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var u = (document.getElementById("login-user").value || "").trim();
    var p = document.getElementById("login-pass").value || "";
    if (u === USER && p === PASS) {
      sessionStorage.setItem("khorshoo_auth", "1");
      ov.classList.add("hidden");
      document.getElementById("login-err").textContent = "";
    } else {
      document.getElementById("login-err").textContent = "Нэр эсвэл нууц үг буруу байна.";
    }
  });
})();
