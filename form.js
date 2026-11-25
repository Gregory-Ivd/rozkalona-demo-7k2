// Заявка з форми: відправляє дані в Google Apps Script (лист «Заявки» в таблиці + лист на пошту).
(function () {
  // Лише українські номери: 0XXXXXXXXX, 380XXXXXXXXX, +380XXXXXXXXX (пробіли, дужки, дефіси дозволені). Повертає +380XXXXXXXXX або null.
  function uaPhone(raw) {
    var s = (raw || "").replace(/[\s\-().]/g, "");
    var m = s.match(/^(?:\+?38)?(0\d{9})$/);
    return m ? "+38" + m[1] : null;
  }
  var ENDPOINT = "https://script.google.com/macros/s/AKfycbycP3Tdwf7Us-5VkDC5uXWlJs9_Cn8TNtYk2g1tvB9Ry_ugOCZnBWQWJ8bWy96x38P8/exec";
  var MAP = { "Ім'я": "name", "Телефон": "phone", "Що потрібно": "what", "Розміри або опис": "details", "Коментар (необов'язково)": "details", "Місто або область": "where", "Для чого": "extra", "Довжина, м": "extra", "Ширина, м": "extra", "Висота, м": "extra" };
  document.querySelectorAll("form.formbox").forEach(function (form) {
    var note = form.querySelector(".demo-note");
    var btn = form.querySelector("button[type=submit]");
    form.querySelectorAll("label").forEach(function (l) {
      var f = l.nextElementSibling;
      if (l.textContent.trim() === "Телефон" && f) { f.placeholder = "0XX XXX XX XX"; f.maxLength = 17; }
    });
    // пастка для ботів: людина це поле не бачить
    var trap = document.createElement("input");
    trap.type = "text"; trap.name = "website"; trap.tabIndex = -1; trap.autocomplete = "off";
    trap.style.cssText = "position:absolute;left:-9999px;opacity:0;height:0;width:0";
    form.appendChild(trap);
    form.removeAttribute("onsubmit");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var d = { type: "lead", page: location.pathname.split("/").pop() || "index.html", website: trap.value };
      var extra = [];
      form.querySelectorAll("label").forEach(function (l) {
        var f = l.nextElementSibling, name = l.textContent.trim(), k = MAP[name];
        if (!k || !f || !("value" in f)) return;
        var v = f.value.trim();
        if (k === "extra") { if (v) extra.push(name + ": " + v); } else d[k] = v;
      });
      if (!d.what && form.dataset.what) d.what = form.dataset.what;
      if (extra.length) d.details = extra.join("; ") + (d.details ? " | " + d.details : "");
      var phone = uaPhone(d.phone);
      note.style.display = "block";
      if (!d.name) { note.textContent = "Вкажіть ім'я."; return; }
      if (!phone) { note.textContent = "Вкажіть український номер телефону: 0XX XXX XX XX або +380 XX XXX XX XX."; return; }
      d.phone = phone;
      btn.disabled = true; note.textContent = "Надсилаємо…";
      fetch(ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(d) })
        .then(function () { note.textContent = "Дякуємо! Заявку отримано, передзвонимо."; form.reset(); })
        .catch(function () { note.textContent = "Не вдалося надіслати. Зателефонуйте нам або спробуйте ще раз."; })
        .then(function () { btn.disabled = false; });
    });
  });
})();
