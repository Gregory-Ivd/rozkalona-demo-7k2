// Заявка з форми: відправляє дані в Google Apps Script (лист «Заявки» в таблиці + лист на пошту).
(function () {
  var ENDPOINT = "https://script.google.com/macros/s/AKfycbwpmpkZOygOoAytaGUEjua1lFG9uwHd2dvGCzsgg11Zc-23c_zPdI4Cj-51v1Vn73RG/exec";
  var MAP = { "Ім'я": "name", "Телефон": "phone", "Що потрібно": "what", "Розміри або опис": "details", "Місто або область": "where" };
  document.querySelectorAll("form.formbox").forEach(function (form) {
    var note = form.querySelector(".demo-note");
    var btn = form.querySelector("button[type=submit]");
    // пастка для ботів: людина це поле не бачить
    var trap = document.createElement("input");
    trap.type = "text"; trap.name = "website"; trap.tabIndex = -1; trap.autocomplete = "off";
    trap.style.cssText = "position:absolute;left:-9999px;opacity:0;height:0;width:0";
    form.appendChild(trap);
    form.removeAttribute("onsubmit");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var d = { type: "lead", page: location.pathname.split("/").pop() || "index.html", website: trap.value };
      form.querySelectorAll("label").forEach(function (l) {
        var f = l.nextElementSibling, k = MAP[l.textContent.trim()];
        if (k && f) d[k] = f.value.trim();
      });
      var digits = (d.phone || "").replace(/\D/g, "");
      note.style.display = "block";
      if (!d.name || digits.length < 9) { note.textContent = "Вкажіть ім'я й телефон (мінімум 9 цифр)."; return; }
      btn.disabled = true; note.textContent = "Надсилаємо…";
      fetch(ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(d) })
        .then(function () { note.textContent = "Дякуємо! Заявку отримано, передзвонимо."; form.reset(); })
        .catch(function () { note.textContent = "Не вдалося надіслати. Зателефонуйте нам або спробуйте ще раз."; })
        .then(function () { btn.disabled = false; });
    });
  });
})();
