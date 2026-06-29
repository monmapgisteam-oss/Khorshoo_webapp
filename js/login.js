// Нэвтрэх (client-side гэнэн хамгаалалт)
// Нэвтрэх мэдээллийг .env файлаас уншина.
// АНХААР: Статик сайт тул эдгээр утга нь хөтөч дээр ил харагдана —
// жинхэнэ нууцлал болохгүй, зөвхөн эх кодноос салгасан хэлбэр.
(function () {
  var ov = document.getElementById("login-overlay");
  var form = document.getElementById("login-form");
  if (!ov || !form) return;

  var errEl = document.getElementById("login-err");
  var creds = null; // { user, pass } — .env ачаалагдсаны дараа бөглөгдөнө

  // Энгийн .env задлагч: KEY=VALUE мөрүүд, # тайлбар, хашилт авна
  function parseEnv(text) {
    var out = {};
    text.split(/\r?\n/).forEach(function (line) {
      line = line.trim();
      if (!line || line[0] === "#") return;
      var eq = line.indexOf("=");
      if (eq === -1) return;
      var key = line.slice(0, eq).trim();
      var val = line.slice(eq + 1).trim();
      if ((val[0] === '"' && val[val.length - 1] === '"') ||
          (val[0] === "'" && val[val.length - 1] === "'")) {
        val = val.slice(1, -1);
      }
      out[key] = val;
    });
    return out;
  }

  // .env-г ачаална (cache-гүй, учир нь login бүрт шинэ байх ёстой)
  fetch(".env", { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then(function (text) {
      var env = parseEnv(text);
      if (!env.KHORSHOO_USER || !env.KHORSHOO_PASS) {
        throw new Error("KHORSHOO_USER / KHORSHOO_PASS тодорхойлогдоогүй байна.");
      }
      creds = { user: env.KHORSHOO_USER, pass: env.KHORSHOO_PASS };
    })
    .catch(function (e) {
      if (errEl) errEl.textContent = "Тохиргоо ачаалж чадсангүй (.env). " + (e.message || e);
    });

  if (sessionStorage.getItem("khorshoo_auth") === "1") ov.classList.add("hidden");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!creds) {
      errEl.textContent = "Тохиргоо ачаалж байна, түр хүлээгээд дахин оролдоно уу.";
      return;
    }
    var u = (document.getElementById("login-user").value || "").trim();
    var p = document.getElementById("login-pass").value || "";
    if (u === creds.user && p === creds.pass) {
      sessionStorage.setItem("khorshoo_auth", "1");
      ov.classList.add("hidden");
      errEl.textContent = "";
    } else {
      errEl.textContent = "Нэр эсвэл нууц үг буруу байна.";
    }
  });
})();
