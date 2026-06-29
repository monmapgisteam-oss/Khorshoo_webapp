require([
  "esri/WebMap", "esri/views/MapView", "esri/widgets/Legend", "esri/widgets/Home", "esri/widgets/Expand"
], function (WebMap, MapView, Legend, Home, Expand) {

  const WEBMAP_ID = "7387a257d12a414d9b5abc4b9f0d3856";
  const SURVEY_LAYER_MATCH = "khorshoo_asuumj_last";

  const GROUPS = [
    { id: 1,  name: "Худаг, уст цэг, усан хангамж" }, { id: 2,  name: "Тэжээлийн ургамал, үйлдвэрлэл" },
    { id: 3,  name: "Мал бордох аж ахуй" }, { id: 4,  name: "Мах, сүү, цагаан идээ" },
    { id: 5,  name: "Үржлийн мал бойжуулах" }, { id: 6,  name: "Ноос, ноолуур, арьс шир" },
    { id: 7,  name: "Дотор мах боловсруулах" }, { id: 8,  name: "Агуулах, зоорь, хөргүүр" },
    { id: 9,  name: "Мал төхөөрөх цех" }, { id: 10, name: "Мал үржүүлэг, технологи" },
    { id: 11, name: "Мал эмнэлгийн үйлчилгээ" }, { id: 12, name: "Дундын техник үйлчилгээ" },
    { id: 13, name: "Гахай, шувуу, зөгий" }, { id: 14, name: "ХАА түүхий эд, тээвэр" }
  ];
  const groupName = {}; GROUPS.forEach(g => groupName[g.id] = g.name);
  // Word файл дахь бүлгүүдийн бүрэн нэр (баруун самбарын гарчигт)
  const groupFull = {
    1: "Бэлчээрт худаг, уст цэг гаргах, усан хангамж байгуулах",
    2: "Бүх төрлийн тэжээлийн ургамал тариалах, тэжээлийн үйлдвэрлэл, цех байгуулах, өргөтгөх, тоног төхөөрөмжийн шинэчлэл хийх",
    3: "Мал бордох аж ахуй байгуулах, өргөтгөх, тоног төхөөрөмжийн шинэчлэл хийх",
    4: "Мах, сүү, цагаан идээ бэлтгэх, боловсруулах үйлдвэрлэл, цех байгуулах, өргөтгөх, тоног төхөөрөмжийн шинэчлэл хийх",
    5: "Үржлийн мал худалдан бойжуулах, борлуулах",
    6: "Ноос, ноолуур, арьс шир бэлтгэх, анхан шатны тордолт хийх цэг, цех байгуулах, өргөтгөх, тоног төхөөрөмжийн шинэчлэл хийх",
    7: "Дотор мах боловсруулах үйлдвэр, цех байгуулах, өргөтгөх, тоног төхөөрөмжийн шинэчлэл хийх",
    8: "Мал, малын гаралтай түүхий эдийн агуулах, зоорь, хөргүүр байгуулах",
    9: "Мал төхөөрөх цех, үйлдвэр байгуулах, өргөтгөх, тоног төхөөрөмжийн шинэчлэл хийх",
    10: "Мал үржүүлэг, технологийн ажил, үйлчилгээ эрхлэх",
    11: "Мал эмнэлгийн ажил, үйлчилгээ",
    12: "Мал аж ахуйн үйлдвэрлэлд зориулагдсан малчдын хөдөлмөрийг хөнгөвчилсөн техник, тоног төхөөрөмжийн дундын үйлчилгээ үзүүлэх, технологи нэвтрүүлэх",
    13: "Гахай, шувуу, зөгий, цаа буга зэрэг ашиг шимийг нь тогтмол хүртдэг тэжээвэр амьтны аж ахуй байгуулах, өргөтгөх, тоног төхөөрөмжийн шинэчлэл хийх",
    14: "ХАА-н гаралтай түүхий эдийг боловсруулах, үйлдвэрлэлийн зориулалттай барилга, байгууламж барих, өргөтгөх, засварлах, тусгай зориулалтын тээврийн хэрэгсэл, (автомашин), тоног төхөөрөмж худалдан авах"
  };
  const uachShort = v => { const m = v && String(v).match(/(\d+)/); return m ? (v + " — " + (groupName[+m[1]] || "")) : v; };

  const SPECIFIC = {
    1: [["F1_8_","Мал услах зай ойртсон (км)"],["F1_9_1_",'Ус ойртсоноор "тарга хүчний өөрчлөлт" (%)'],["F1_9_2_",'Ус ойртсоноор "сүүний гарцын өөрчлөлт" (%)'],["F1_10_1_","Ундаалж буй өрхийн тоо"],["F1_10_2_","Ундаалж буй малын тоо (толгой)"],["F1_11_","Санал зөвлөмж"]],
    2: [["F2_8_","Тэжээлийн ургамал тариалсан талбай (га)"],["F2_9_","Хэрэгцээг хангаж буй (%)"],["F2_10_","Бэлэн тэжээлийн зардлын бууралт (₮/жил)"],["F2_11_","Цехийн хүчин чадал (кг/өдөр)"],["F2_12_","Тэжээл/ургамал борлуулсан орлого (₮)"],["F2_13_1_","Трактор — тоо"],["F2_13_1_1","Трактор — мөнгөн дүн (₮)"],["F2_13_2_","Хаман боогч — тоо"],["F2_13_2_1","Хаман боогч — мөнгөн дүн (₮)"],["F2_13_3_","Тармуур — тоо"],["F2_13_3_1","Тармуур — мөнгөн дүн (₮)"],["F2_13_4_","Хадуур — тоо"],["F2_13_4_1","Хадуур — мөнгөн дүн (₮)"],["F2_13_5_","Бутлуур — тоо"],["F2_13_5_1","Бутлуур — мөнгөн дүн (₮)"],["F2_13_6_","Хашаажуулалт — тоо"],["F2_13_6_1","Хашаажуулалт — мөнгөн дүн (₮)"],["F2_13_7_","Бусад — тоо"],["F2_13_7_1","Бусад — мөнгөн дүн (₮)"],["F2_13_7_2","Бусад — тайлбар"],["F2_14_","Санал зөвлөмж"]],
    3: [["F3_8_1_","Бордсон мал — Бод (толгой)"],["F3_8_2_","Бордсон мал — Бог (толгой)"],["F3_9_","Бүтээгдэхүүн нийлүүлэх гэрээ"],["F3_10_","Брэнд бүтээгдэхүүнтэй болсон эсэх"],["F3_11_","Санал зөвлөмж"]],
    4: [["F4_8_1_","Сүү боловсруулах төхөөрөмж — тоо"],["F4_8_1_1","Сүү — мөнгөн дүн (₮)"],["F4_8_2_","Мах боловсруулах төхөөрөмж — тоо"],["F4_8_2_1","Мах — мөнгөн дүн (₮)"],["F4_9_1_","Хүчин чадал — сүү (литр/хоног)"],["F4_9_2_","Хүчин чадал — мах (кг/хоног)"],["F4_10_","Бүтээгдэхүүн нийлүүлэх гэрээ"],["F4_11_","Санал зөвлөмж"]],
    5: [["F5_9_","Зээлээ зориулалтын дагуу зарцуулсан эсэх"],["F5_10_1_","Адуу — тоо"],["F5_10_1_1","Адуу — үнийн дүн (₮)"],["F5_10_2_","Үхэр — тоо"],["F5_10_2_1","Үхэр — үнийн дүн (₮)"],["F5_10_3_","Тэмээ — тоо"],["F5_10_3_1","Тэмээ — үнийн дүн (₮)"],["F5_10_4_","Хонь — тоо"],["F5_10_4_1","Хонь — үнийн дүн (₮)"],["F5_10_5_","Ямаа — тоо"],["F5_10_5_1","Ямаа — үнийн дүн (₮)"],["F5_11_","Үржлийн малаас олсон ашиг (₮)"],["F5_12_","Санал зөвлөмж"]],
    6: [["F6_8_","Цех байгуулахад зарцуулсан зардал (₮)"],["F6_9_1_","Арьс ширний төхөөрөмж — тоо"],["F6_9_1_1","Арьс шир — мөнгөн дүн (₮)"],["F6_9_2_","Ноос ноолуурын төхөөрөмж — тоо"],["F6_9_2_1","Ноос ноолуур — мөнгөн дүн (₮)"],["F6_10_","Хүчин чадал (хоногт/хэмжээ)"],["F6_11_","Бэлэн бүтээгдэхүүн борлуулж буй эсэх"],["F6_12_1_","Борлуулсан — арьс шир (ширхэг)"],["F6_12_2_","Борлуулсан — ноос (кг)"],["F6_12_3_","Борлуулсан — ноолуур (кг)"],["F6_13_","Бүтээгдэхүүн нийлүүлэх гэрээ"],["F6_14_","Санал зөвлөмж"]],
    7: [["F7_8_","Зээлээ зарцуулсан барилга байгууламж"],["F7_8_1_","Бусад (тайлбар)"],["F7_9_1_","Дайвар бүтээгдэхүүн боловсруулах төхөөрөмж — тоо"],["F7_9_1_1","Дайвар бүтээгдэхүүн боловсруулах төхөөрөмж — мөнгөн дүн (₮)"],["F7_10_","Хүчин чадал (хоногт/хэмжээ)"],["F7_11_","Бүтээгдэхүүн нийлүүлэх гэрээ"],["F7_12_","Санал зөвлөмж"]],
    8: [["F8_8_","Зээлээ зарцуулсан барилга байгууламж"],["F8_8_1_","Бусад (тайлбар)"],["F8_9_","Хүчин чадал (талбай м²)"],["F8_10_","Түрээсээс нэмэлт орлого (₮)"],["F8_11_","Санал зөвлөмж"]],
    9: [["F9_8_","Бүтээгдэхүүн нийлүүлэх гэрээ"],["F9_9_1_","Хүчин чадал — бог (толгой/өдөр)"],["F9_9_2_","Хүчин чадал — бод (толгой/өдөр)"],["F9_10_1_","Нэмэлт ашиг — 1 бод (₮)"],["F9_10_2_","Нэмэлт ашиг — 1 бог (₮)"],["F9_11_","Дайвар бүт. борлуулж буй эсэх"],["F9_12_","Санал зөвлөмж"]],
    10: [["F10_9_1_","Тоног төхөөрөмж — тоо ширхэг"],["F10_9_2_","Тоног төхөөрөмж — үнийн дүн (₮)"],["F10_10_","Санал зөвлөмж"]],
    11: [["F11_8_1_","Тоног төхөөрөмж — тоо ширхэг"],["F11_8_2_","Тоног төхөөрөмж — үнийн дүн (₮)"],["F11_9_1_","Үзүүлсэн үйлчилгээний тоо"],["F11_9_2_","Үйлчилгээнээс орлого (₮)"],["F11_10_","Санал зөвлөмж"]],
    12: [["F12_8_1_","Трактор — тоо"],["F12_8_1_1","Трактор — мөнгөн дүн (₮)"],["F12_8_2_","Хаман боогч — тоо"],["F12_8_2_1","Хаман боогч — мөнгөн дүн (₮)"],["F12_8_3_","Тармуур — тоо"],["F12_8_3_1","Тармуур — мөнгөн дүн (₮)"],["F12_8_4_","Хадуур — тоо"],["F12_8_5_","Бутлуур — тоо"],["F12_8_5_1","Бутлуур — мөнгөн дүн (₮)"],["F12_8_6_","Хөргүүртэй тээвэр — тоо"],["F12_8_6_1","— мөнгөн дүн (₮)"],["F12_8_7_","Ачаа тээврийн техник — тоо"],["F12_8_7_1","— мөнгөн дүн (₮)"],["F12_8_8_","Ковш тусгай техник — тоо"],["F12_8_8_1","— мөнгөн дүн (₮)"],["F12_8_9_","Бусад — тоо"],["F12_8_9_1","Бусад — мөнгөн дүн (₮)"],["F12_9_","Техникээ түрээслүүлж олсон орлого (₮/жил)"],["F12_10_","Санал зөвлөмж"]],
    13: [["F13_8_1_","Гахай — тоо"],["F13_8_1_1","Гахай — мөнгөн дүн (₮)"],["F13_8_2_","Шувуу — тоо"],["F13_8_2_1","Шувуу — мөнгөн дүн (₮)"],["F13_8_3_","Зөгий — бүл"],["F13_8_3_1","Зөгий — мөнгөн дүн (₮)"],["F13_8_4_","Цаа буга — тоо"],["F13_8_4_1","Цаа буга — мөнгөн дүн (₮)"],["F13_8_5_","Бусад — тоо"],["F13_8_5_1","Бусад — мөнгөн дүн (₮)"],["F13_9_","Санал зөвлөмж"]],
    14: [["F14_8_1_","Трактор — тоо"],["F14_8_1_1","Трактор — мөнгөн дүн (₮)"],["F14_8_2_","Хөргүүртэй тээвэр — тоо"],["F14_8_2_1","— мөнгөн дүн (₮)"],["F14_8_3_","Ачаа тээврийн техник — тоо"],["F14_8_3_1","— мөнгөн дүн (₮)"],["F14_8_4_","Ковш тусгай техник — тоо"],["F14_8_4_1","— мөнгөн дүн (₮)"],["F14_8_5_","Бусад — тоо"],["F14_8_5_1","Бусад — мөнгөн дүн (₮)"],["F14_8_5_2","Бусад — тайлбар"],["F14_9_","Техникээ түрээслүүлж олсон орлого (₮/жил)"],["F14_10_","Зээлээ зарцуулсан барилга"],["F14_10_1_","Бусад (тайлбар)"],["F14_11_","Санал зөвлөмж"]]
  };

  // ----- Туслахууд -----
  const isEmpty = v => v === null || v === undefined || (typeof v === "string" && v.trim() === "");
  const esc = s => String(s).replace(/'/g, "''");
  function fmtNum(v) { if (typeof v === "number") return v.toLocaleString("en-US"); const n = Number(String(v).replace(/[, ]/g, "")); if (!isNaN(n) && String(v).trim() !== "" && /^[\d., ]+$/.test(String(v))) return n.toLocaleString("en-US"); return v; }
  function fmtMoney(n) { n = Number(n) || 0; if (n >= 1e9) return (n/1e9).toFixed(1).replace(/\.0$/,"")+" тэрбум₮"; if (n >= 1e6) return (n/1e6).toFixed(1).replace(/\.0$/,"")+" сая₮"; if (n >= 1e3) return Math.round(n/1e3)+" мянга₮"; return Math.round(n)+"₮"; }
  function fmtCount(n) { return (Number(n) || 0).toLocaleString("en-US"); }
  function fmtDate(ms) { if (!ms) return ""; return new Date(ms).toLocaleDateString("mn-MN"); }
  function groupIdOf(a) { const u = a["ҮАЧ"]; if (!u) return null; const m = String(u).match(/(\d+)/); return m ? Number(m[1]) : null; }
  function row(k, v) { return `<div class="pp-row"><div class="k">${k}</div><div class="v">${v}</div></div>`; }
  // Асуумжийн шошго: "X — тоо" → "X тоогоор", "X — мөнгөн дүн" → "X мөнгөн дүнгээр" гэх мэт
  function prettyQ(s) {
    return s
      .replace(/\s*—\s*тоо ширхэг/g, " тоо ширхгээр")
      .replace(/\s*—\s*мөнгөн дүн/g, " мөнгөн дүнгээр")
      .replace(/\s*—\s*үнийн дүн/g, " үнийн дүнгээр")
      .replace(/\s*—\s*тоо(?=$| )/g, " тоогоор")
      .replace(/\s*—\s*бүл(?=$| )/g, " бүлээр")
      .replace(/\s*—\s*тайлбар/g, " тайлбар")
      .replace(/^\s+/, "").trim();
  }

  // ----- Баруун самбарын туслахууд -----
  const fieldType = {};
  const PALETTE = ["#0077B6","#0096C7","#00B4D8","#48CAE4","#90E0EF","#CAF0F8"];
  const FREETEXT = /санал зөвлөмж|тайлбар/i;
  const NUMHINT = /км|%|тоо|толгой|₮|дүн|орлого|зардал|ашиг|литр|кг|\bга\b|өрх|ширхэг|бүл|м²|хувь/i;
  function isNumericField(name) { const t = fieldType[name]; return t === "esriFieldTypeDouble" || t === "esriFieldTypeInteger" || t === "esriFieldTypeSingle" || t === "esriFieldTypeSmallInteger"; }
  function parseNum(v) { if (v === null || v === undefined) return NaN; if (typeof v === "number") return v; const m = String(v).replace(/,/g, "").match(/-?\d+(\.\d+)?/); return m ? +m[0] : NaN; }
  function cleanLabel(v) { return String(v).replace(/^\s*\d{1,2}[.\)]\s+/, "").trim(); }
  function indicatorHtml(big, unit, sub) { return `<div class="ind"><span class="big">${big}</span>${unit ? `<span class="unit">${unit}</span>` : ""}</div>${sub ? `<div class="ind-sub">${sub}</div>` : ""}`; }
  function hexA(hex, a) { const h = hex.replace("#", ""); return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`; }
  function donutSvg(segs, total) {
    const cx = 42, cy = 42, rO = 39, rI = 25; let a0 = -Math.PI / 2, paths = "";
    const pt = (r, a) => [(cx + r * Math.cos(a)).toFixed(2), (cy + r * Math.sin(a)).toFixed(2)];
    segs.forEach(s => {
      const frac = Math.min(s.value / total, 0.9999);
      const a1 = a0 + frac * 2 * Math.PI;
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      const o0 = pt(rO, a0), o1 = pt(rO, a1), i1 = pt(rI, a1), i0 = pt(rI, a0);
      paths += `<path d="M${o0[0]} ${o0[1]} A${rO} ${rO} 0 ${large} 1 ${o1[0]} ${o1[1]} L${i1[0]} ${i1[1]} A${rI} ${rI} 0 ${large} 0 ${i0[0]} ${i0[1]} Z" fill="${hexA(s.color, .3)}" stroke="${s.color}" stroke-width="0.8"/>`;
      a0 = a1;
    });
    return `<svg width="84" height="84" viewBox="0 0 84 84">${paths}<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="700" fill="#eaf2f6">${fmtCount(total)}</text></svg>`;
  }
  function donutHtml(segs, total) {
    return `<div class="donut-wrap">${donutSvg(segs, total)}<div class="dleg">${segs.map(s =>
      `<div class="r"><span class="sw" style="background:${s.color}"></span><span class="nm" title="${s.name}">${s.name}</span><span class="vv">${fmtCount(s.value)}</span></div>`).join("")}</div></div>`;
  }
  // Тоон хариултын тархалтын график (95 хувиар таслаж, илүүг "+"-д хийнэ)
  function histogramHtml(vals, isMoney) {
    const fmt = isMoney ? fmtMoney : fmtCompact;
    const sorted = [...vals].sort((a, b) => a.n - b.n);
    const totalW = sorted.reduce((a, v) => a + v.w, 0);
    const q = p => { let acc = 0, t = p * totalW; for (const v of sorted) { acc += v.w; if (acc >= t) return v.n; } return sorted[sorted.length - 1].n; };
    const min = sorted[0].n, hi = q(0.95), BINS = 6;
    if (hi <= min) return null;
    const step = (hi - min) / BINS;
    const bins = Array.from({ length: BINS }, () => 0); let overflow = 0;
    vals.forEach(v => { if (v.n > hi) { overflow += v.w; return; } let idx = Math.floor((v.n - min) / step); if (idx >= BINS) idx = BINS - 1; if (idx < 0) idx = 0; bins[idx] += v.w; });
    const cells = [];
    for (let i = 0; i < BINS; i++) cells.push({ lbl: fmtRange(min + step * i, min + step * (i + 1), isMoney), w: bins[i] });
    if (overflow > 0) cells.push({ lbl: fmt(hi) + "+", w: overflow });
    const maxW = Math.max.apply(null, cells.map(c => c.w)) || 1;
    return cells.map(c => {
      const pct = Math.max(2, c.w / maxW * 100);
      return `<div class="hbar-row"><div class="hbar-label" title="${c.lbl}">${c.lbl}</div>` +
        `<div class="hbar-plot"><div class="hbar-fill" style="width:${pct.toFixed(1)}%"></div>` +
        `<div class="hbar-val" style="left:${pct.toFixed(1)}%">${fmtCount(c.w)}</div></div></div>`;
    }).join("");
  }

  function popupContent(feature) {
    const a = feature.graphic.attributes, gid = groupIdOf(a); let html = "";
    html += `<div class="pp-section-title">Үндсэн мэдээлэл</div>`;
    const place = [a["Аймаг"] || a["Аймаг_Хот"], a["Зөв_сумын_нэр"] || a["Сум_Дүүрэг"] || a["Сум"]].filter(Boolean).join(", ");
    if (place) html += row("Байршил", place);
    if (!isEmpty(a["name"])) html += row("Бүс", a["name"]);
    if (!isEmpty(a["ҮАЧ"])) html += row("Үйл ажиллагааны чиглэл", a["ҮАЧ"]);
    if (!isEmpty(a["Зээлийн_зориулалт"])) html += row("Зээлийн зориулалт", a["Зээлийн_зориулалт"]);
    const person = [a["Овог"], a["Нэр"]].filter(Boolean).join(" ") || a["Зээл_хүсэгчийн_овог_нэр"];
    if (!isEmpty(person)) html += row("Зээлдэгч", person);
    if (!isEmpty(a["Хүйс"])) html += row("Хүйс / Нас", [a["Хүйс"], a["Нас"]].filter(v => !isEmpty(v)).join(" / "));
    html += `<div class="pp-section-title">Зээлийн мэдээлэл</div>`;
    if (!isEmpty(a["Олгосон_зээлийн_дүн"])) html += row("Олгосон зээл", fmtNum(a["Олгосон_зээлийн_дүн"]) + " ₮");
    if (!isEmpty(a["Зээлийн_үлдэгдэл"])) html += row("Зээлийн үлдэгдэл", fmtNum(a["Зээлийн_үлдэгдэл"]) + " ₮");
    if (!isEmpty(a["Банкны_нэр"])) html += row("Банк", a["Банкны_нэр"]);
    if (!isEmpty(a["Олгосон_огноо"])) html += row("Олгосон огноо", fmtDate(a["Олгосон_огноо"]));
    html += `<div class="pp-section-title">Асуумжийн хариулт</div>`;
    const fields = (gid && SPECIFIC[gid]) ? SPECIFIC[gid] : []; let any = false;
    fields.forEach(([f, label]) => { if (!isEmpty(a[f])) { any = true; const isMoney = /₮|дүн|орлого|зардал|ашиг/.test(label); html += row(label, isMoney ? fmtNum(a[f]) : a[f]); } });
    if (!any) html += `<div class="pp-empty">Энэ цэгт асуумжийн хариулт бөглөгдөөгүй байна.</div>`;
    const div = document.createElement("div"); div.innerHTML = html; return div;
  }

  // ===== Webmap =====
  const webmap = new WebMap({ portalItem: { id: WEBMAP_ID } });
  const view = new MapView({ container: "map", map: webmap, center: [103.5, 46.8], scale: 12000000 });
  view.ui.padding = { top: 14, right: 14, bottom: 18, left: 14 };
  // Баруун доод буланд масштаб (1:X)
  const scaleNode = document.createElement("div");
  scaleNode.className = "map-scale";
  view.ui.add(scaleNode, "bottom-left");
  const updateScale = () => { if (view.scale) scaleNode.textContent = "1:" + Math.round(view.scale).toLocaleString("en-US"); };
  view.watch("scale", updateScale);
  view.ui.add(new Home({ view: view }), "top-left");
  view.ui.add(new Expand({ view: view, content: new Legend({ view: view }), expanded: false }), "top-left");

  // ===== Шүүлтийн төлөв =====
  let surveyLayer = null, OID = "OBJECTID", regionLayer = null;
  const DIMS = {
    bus:   { field: "name",          label: "БҮС" },
    aimag: { field: "Аймаг",         label: "АЙМАГ" },
    sum:   { field: "Зөв_сумын_нэр", label: "СУМ" },
    uach:  { field: "ҮАЧ",           label: "ҮАЧ" }
  };
  const sel = { bus: new Set(), aimag: new Set(), sum: new Set(), uach: new Set() };
  let searchText = "";

  function inClause(field, set) {
    if (!set.size) return null;
    return field + " IN (" + [...set].map(v => "'" + esc(v) + "'").join(",") + ")";
  }
  function whereParts(skipKey) {
    const parts = [];
    for (const key in DIMS) {
      if (key === skipKey) continue;
      const c = inClause(DIMS[key].field, sel[key]);
      if (c) parts.push(c);
    }
    if (searchText) {
      const s = esc(searchText);
      parts.push("(Хоршооны_нэр LIKE '%" + s + "%' OR Зээл_хүсэгчийн_овог_нэр LIKE '%" + s + "%' OR Нэр LIKE '%" + s + "%' OR Овог LIKE '%" + s + "%')");
    }
    return parts.length ? parts.join(" AND ") : "1=1";
  }

  async function distinctWithCounts(field, skipKey) {
    const res = await surveyLayer.queryFeatures({
      where: whereParts(skipKey), returnGeometry: false,
      groupByFieldsForStatistics: [field],
      outStatistics: [{ statisticType: "count", onStatisticField: OID, outStatisticFieldName: "c" }],
      orderByFields: (field === "ҮАЧ") ? [field + " ASC"] : ["c DESC"], num: 1000
    });
    let opts = res.features.map(f => ({ value: f.attributes[field], count: f.attributes.c })).filter(o => !isEmpty(o.value));
    if (field === "ҮАЧ") {
      const numOf = v => { const m = String(v).match(/(\d+)/); return m ? +m[1] : 999; };
      opts.sort((a, b) => numOf(a.value) - numOf(b.value));
    }
    return opts;
  }

  async function statTotals() {
    const res = await surveyLayer.queryFeatures({ where: whereParts(), returnGeometry: false, outStatistics: [
      { statisticType: "count", onStatisticField: OID, outStatisticFieldName: "cnt" },
      { statisticType: "sum", onStatisticField: "Олгосон_зээлийн_дүн", outStatisticFieldName: "loan" },
      { statisticType: "avg", onStatisticField: "Олгосон_зээлийн_дүн", outStatisticFieldName: "avg" },
      { statisticType: "sum", onStatisticField: "Зээлийн_үлдэгдэл", outStatisticFieldName: "bal" } ]});
    return res.features[0].attributes;
  }
  async function statBy(field, skipKey, top) {
    const res = await surveyLayer.queryFeatures({ where: whereParts(skipKey), returnGeometry: false,
      groupByFieldsForStatistics: [field],
      outStatistics: [{ statisticType: "count", onStatisticField: OID, outStatisticFieldName: "cnt" }],
      orderByFields: ["cnt DESC"], num: top || 1000 });
    return res.features.map(f => ({ key: f.attributes[field], value: f.attributes.cnt }));
  }

  function renderBars(elId, data, opts) {
    opts = opts || {}; const el = document.getElementById(elId); el.innerHTML = "";
    if (!data.length) { el.innerHTML = `<div class="empty">Мэдээлэл алга</div>`; return; }
    const max = Math.max.apply(null, data.map(d => d.value)) || 1;
    data.forEach(d => {
      const r = document.createElement("div");
      r.className = "bar-row" + (opts.isActive && opts.isActive(d.key) ? " active" : "");
      const pct = Math.max(2, Math.round(d.value / max * 100));
      r.innerHTML = `<div class="bl" title="${d.label}">${d.label}</div><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><div class="bar-val">${fmtCount(d.value)}</div>`;
      if (opts.onClick) r.onclick = () => opts.onClick(d.key);
      el.appendChild(r);
    });
  }

  // ----- Header selector summary -----
  function updateSummary(key) {
    const elBox = document.querySelector('.sel[data-key="' + key + '"]');
    const s = sel[key];
    const sumEl = elBox.querySelector(".sel-sum");
    const badge = elBox.querySelector(".badge");
    if (s.size === 0) { sumEl.textContent = "Энд дарж ..."; elBox.classList.remove("has-val"); badge.textContent = ""; }
    else if (s.size === 1) { sumEl.textContent = [...s][0]; elBox.classList.add("has-val"); badge.textContent = "1"; }
    else { sumEl.textContent = s.size + " сонгосон"; elBox.classList.add("has-val"); badge.textContent = s.size; }
  }

  // ===== Бүгдийг шинэчлэх =====
  let refreshSeq = 0;
  async function refreshAll() {
    if (!surveyLayer) return;
    const seq = ++refreshSeq;
    const where = whereParts();
    surveyLayer.definitionExpression = (where === "1=1") ? "" : where;
    // Бүсийн полигон давхаргыг БҮС сонголтоор шүүнэ
    if (regionLayer) regionLayer.definitionExpression = inClause("name", sel.bus) || "";

    // Дашбоард зарчмаар: шүүсэн цэгүүдийн хэсэг рүү zoom in
    (async () => {
      try {
        if (where === "1=1") {
          view.goTo({ center: [103.5, 46.8], scale: 12000000 }, { duration: 600 }).catch(() => {});
          return;
        }
        const r = await surveyLayer.queryExtent({ where });
        if (seq !== refreshSeq) return;
        if (!r || !r.count || !r.extent) return;
        // Хамгийн нарийвчилсан газарзүйн шүүлтээр тогтсон масштаб
        let targetScale = null;
        if (sel.sum.size) targetScale = 700000;
        else if (sel.aimag.size) targetScale = 2500000;
        else if (sel.bus.size) targetScale = 5000000;
        if (targetScale) {
          view.goTo({ target: r.extent.center, scale: targetScale }, { duration: 700 }).catch(() => {});
        } else {
          view.goTo(r.extent.expand(1.2), { duration: 700 }).catch(() => {});
        }
      } catch (e) {}
    })();

    updateIndicators(seq).catch(()=>{});
    renderLeftPanel().catch(()=>{});
    renderRightPanel(seq).catch(()=>{});
  }

  async function updateIndicators(seq) {
    const base = whereParts();
    const aw = c => (base === "1=1") ? c : base + " AND " + c;
    try {
      const [cLoan, totals, cSurvey] = await Promise.all([
        surveyLayer.queryFeatureCount({ where: aw("Олгосон_зээлийн_дүн <> 0") }),
        surveyLayer.queryFeatures({ where: base, returnGeometry: false, outStatistics: [{ statisticType: "sum", onStatisticField: "Олгосон_зээлийн_дүн", outStatisticFieldName: "loan" }] }),
        surveyLayer.queryFeatureCount({ where: aw("ҮАЧ IS NOT NULL") })
      ]);
      if (seq !== refreshSeq) return;
      document.getElementById("ind-count").textContent = fmtCount(cLoan);
      document.getElementById("ind-loan").textContent = fmtB(totals.features[0].attributes.loan || 0);
      document.getElementById("ind-survey").textContent = fmtCount(cSurvey);
    } catch (e) {}
  }

  // ----- Зүүн самбар: аймгаар олгосон зээлийн нийлбэр (serial bar chart) -----
  function niceCeil(x) { if (x <= 0) return 1; const mag = Math.pow(10, Math.floor(Math.log10(x))); for (const k of [1, 2, 2.5, 5, 10]) { if (k * mag >= x) return k * mag; } return 10 * mag; }
  function fmtB(v) { const b = v / 1e9; if (Math.abs(b) >= 1) return b.toFixed(1).replace(/\.0$/, "") + "тэрбум"; const m = v / 1e6; if (Math.abs(m) >= 1) return Math.round(m) + "сая"; return Math.round(v).toLocaleString("en-US"); }
  // Том тоог компакт болгох (сая/мянга), жижгийг бүтнээр
  function fmtCompact(x) {
    const a = Math.abs(x);
    if (a >= 1e9) return (Math.round(x / 1e8) / 10).toString().replace(/\.0$/, "") + "тэрбум";
    if (a >= 1e6) return (Math.round(x / 1e5) / 10).toString().replace(/\.0$/, "") + "сая";
    if (a >= 1e4) return (Math.round(x / 100) / 10).toString().replace(/\.0$/, "") + "мянга";
    return fmtCount(Math.round(x));
  }
  // Бин хүрээний компакт шошго (мөнгөн дүн нэгжээ хуваалцана)
  function fmtRange(lo, hi, isMoney) {
    if (!isMoney) return fmtCompact(lo) + " - " + fmtCompact(hi);
    const a = Math.abs(hi);
    const unit = a >= 1e9 ? [1e9, "тэрбум"] : a >= 1e6 ? [1e6, "сая"] : a >= 1e3 ? [1e3, "мянга"] : [1, ""];
    const f = x => { const v = x / unit[0]; return (Math.round(v * 10) / 10).toString(); };
    return f(lo) + " - " + f(hi) + " " + unit[1] + "₮";
  }

  // Зүүн самбарт сэлгэгдэх графикуудын жагсаалт (дараа нь нэмнэ)
  const CHARTS = [
    { id: "loan-aimag", title: "Олгосон зээлийн дүн", render: s => renderSerial(s, { field: "Аймаг", skipDim: "aimag", clickDim: "aimag", labelWidth: 84, title: "Олгосон зээлийн дүн" }) },
    { id: "loan-purpose", title: "Зээл олгосон дүн, зориулалтаар", render: s => renderSerial(s, { field: "Зээлийн_зориулалт", extraWhere: "Зээлийн_зориулалт <> '-'", labelWidth: "46%", title: "Зээл олгосон дүн, зориулалтаар" }) }
  ];
  let chartIdx = 0, leftSeq = 0;

  function renderLeftPanel() {
    const s = ++leftSeq;
    const titleEl = document.getElementById("cs-title");
    if (titleEl) titleEl.textContent = CHARTS[chartIdx].title;
    const single = CHARTS.length < 2;
    const prev = document.getElementById("cs-prev"), next = document.getElementById("cs-next");
    if (prev) prev.disabled = single;
    if (next) next.disabled = single;
    return CHARTS[chartIdx].render(s);
  }

  const escAttr = v => String(v).replace(/"/g, "&quot;");
  async function renderSerial(s, opt) {
    const pl = document.getElementById("left-chart");
    const lw = opt.labelWidth || 84;
    const lwStyle = (typeof lw === "number") ? `width:${lw}px;min-width:${lw}px` : `flex:0 0 ${lw};width:${lw};min-width:0`;
    let rows;
    try {
      let where = whereParts(opt.skipDim);
      if (opt.extraWhere) where = (where === "1=1") ? opt.extraWhere : where + " AND " + opt.extraWhere;
      const res = await surveyLayer.queryFeatures({
        where: where, returnGeometry: false,
        groupByFieldsForStatistics: [opt.field],
        outStatistics: [{ statisticType: "sum", onStatisticField: "Олгосон_зээлийн_дүн", outStatisticFieldName: "s" }],
        orderByFields: ["s DESC"], num: 200
      });
      rows = res.features.map(f => ({ key: f.attributes[opt.field], value: f.attributes.s || 0 })).filter(r => !isEmpty(r.key) && r.value > 0);
    } catch (e) { rows = []; }
    if (s !== leftSeq) return;

    let html = `<div class="serial-head">${opt.title}</div>`;
    if (!rows.length) { pl.innerHTML = html + `<div class="serial-empty">Мэдээлэл алга</div>`; return; }

    const max = rows[0].value, axisMax = niceCeil(max);
    html += `<div class="serial">`;
    rows.forEach(r => {
      const pct = r.value / axisMax * 100;
      const active = (opt.clickDim && sel[opt.clickDim].has(r.key)) ? " active" : "";
      const barCursor = opt.clickDim ? "" : "cursor:default;";
      html += `<div class="s-row${active}" data-key="${escAttr(r.key)}">` +
        `<div class="s-label" style="${lwStyle}" title="${escAttr(r.key)}">${r.key}</div>` +
        `<div class="s-plot"><div class="s-bar" style="width:${pct.toFixed(2)}%;${barCursor}"></div>` +
        `<div class="s-val" style="left:${pct.toFixed(2)}%; padding-left:6px;">${fmtB(r.value)}</div></div></div>`;
    });
    html += `</div>`;
    html += `<div class="s-axis"><div class="sp" style="${lwStyle}"></div><div class="ax">` +
      `<div class="t" style="left:0">0</div>` +
      `<div class="t" style="left:50%;transform:translateX(-50%)">${fmtB(axisMax / 2)}</div>` +
      `<div class="t" style="right:0">${fmtB(axisMax)}</div>` +
      `</div></div>`;
    pl.innerHTML = html;

    if (opt.clickDim) {
      pl.querySelectorAll(".s-row").forEach(rowEl => {
        rowEl.querySelector(".s-bar").onclick = () => toggleSel(opt.clickDim, rowEl.dataset.key);
      });
    }
  }

  // ----- Баруун самбар: сонгосон ҮАЧ-ийн асуумжийн дүн -----
  async function renderRightPanel(seq) {
    const pr = document.getElementById("panel-right");
    const gids = [...sel.uach].map(v => { const m = String(v).match(/(\d+)/); return m ? +m[1] : null; }).filter(Boolean);
    const gid = gids.length ? Math.min.apply(null, gids) : 1; // сонгоогүй бол анхдагчаар ҮАЧ-1
    const fields = SPECIFIC[gid] || [];
    const base = whereParts("uach"); // бусад шүүлт (ҮАЧ-аас бусад)
    const groupWhere = (base === "1=1") ? "ҮАЧ = 'ҮАЧ-" + gid + "'" : base + " AND ҮАЧ = 'ҮАЧ-" + gid + "'";
    const total = await surveyLayer.queryFeatureCount({ where: groupWhere });
    if (seq !== refreshSeq) return;

    let html = `<div class="rp-head"><h2>ҮАЧ-${gid}. ${groupFull[gid] || groupName[gid]}</h2><div class="sub">${fmtCount(total)} өрхийн асуумж</div></div>`;
    fields.forEach(([f, label], i) => { html += `<div class="rp-card" id="rpc-${i}"><div class="rp-q">${prettyQ(label)}</div><div class="rp-body"><span class="rp-empty">…</span></div></div>`; });
    pr.innerHTML = html;

    fields.forEach(async ([f, label], i) => {
      try {
        const res = await surveyLayer.queryFeatures({ where: groupWhere, returnGeometry: false, groupByFieldsForStatistics: [f], outStatistics: [{ statisticType: "count", onStatisticField: OID, outStatisticFieldName: "cnt" }], orderByFields: ["cnt DESC"], num: 1000 });
        if (seq !== refreshSeq) return;
        const rows = res.features.map(ff => ({ key: ff.attributes[f], value: ff.attributes.cnt }));
        const card = document.getElementById("rpc-" + i); if (!card) return;
        const bodyEl = card.querySelector(".rp-body");
        const clean = rows.filter(r => !isEmpty(r.key));
        const responded = clean.reduce((a, r) => a + r.value, 0);
        if (!responded) { bodyEl.innerHTML = `<div class="rp-empty">Хариулт алга</div>`; return; }

        if (FREETEXT.test(label)) {
          if (/санал зөвлөмж/i.test(label)) {
            bodyEl.innerHTML = `<button class="rp-sgbtn">${fmtCount(responded)} санал — жагсаалт харах</button>`;
            bodyEl.querySelector("button").onclick = (ev) => { ev.stopPropagation(); openSuggestions(f, label, groupWhere); };
          } else {
            bodyEl.innerHTML = indicatorHtml(fmtCount(responded), "хариулт", "бичгээр ирүүлсэн");
          }
          return;
        }
        const numFrac = clean.filter(r => !isNaN(parseNum(cleanLabel(r.key)))).reduce((a, r) => a + r.value, 0) / responded;
        const numeric = isNumericField(f) || NUMHINT.test(label) || (numFrac >= 0.8 && clean.length >= 5);
        if (numeric) {
          const vals = [];
          clean.forEach(r => { const n = parseNum(cleanLabel(r.key)); if (!isNaN(n)) vals.push({ n: n, w: r.value }); });
          const sum = vals.reduce((a, v) => a + v.n * v.w, 0);
          const wsum = vals.reduce((a, v) => a + v.w, 0);
          const isMoney = /₮|дүн|орлого|зардал|ашиг/.test(label);
          const fmt = isMoney ? fmtMoney : (x => fmtCount(Math.round(x)));
          const subline = `<div class="ind-sub">${fmtCount(responded)} хариулсан</div>`;
          const hist = (new Set(vals.map(v => v.n)).size >= 2) ? histogramHtml(vals, isMoney) : null;
          bodyEl.innerHTML = hist ? (hist + subline) : indicatorHtml(fmt(sum), "нийт", `${fmtCount(responded)} хариулсан`);
        } else {
          const agg = {};
          clean.forEach(r => { const k = cleanLabel(r.key); agg[k] = (agg[k] || 0) + r.value; });
          let segs = Object.keys(agg).map(k => ({ name: k, value: agg[k] })).sort((a, b) => b.value - a.value);
          if (segs.length > 6) { const top = segs.slice(0, 6); const rest = segs.slice(6).reduce((a, s) => a + s.value, 0); top.push({ name: "Бусад", value: rest }); segs = top; }
          segs.forEach((s, j) => s.color = PALETTE[j % PALETTE.length]);
          bodyEl.innerHTML = donutHtml(segs, segs.reduce((a, s) => a + s.value, 0));
        }
      } catch (e) {}
    });
  }

  // ----- Санал зөвлөмжийн жагсаалт -----
  let sgOpen = false, sgSeq = 0;
  async function openSuggestions(field, label, where) {
    const panel = document.getElementById("sg-panel");
    const headEl = document.getElementById("sg-head");
    const listEl = document.getElementById("sg-list");
    headEl.innerHTML = `<span>${label}</span>`;
    listEl.innerHTML = `<div class="sg-empty">Ачааллаж байна…</div>`;
    // Газрын зургийн баруун доод буланд тулгаж байрлуулна
    const v = document.getElementById("view").getBoundingClientRect();
    panel.style.right = Math.max(0, window.innerWidth - v.right) + "px";
    panel.style.bottom = Math.max(0, window.innerHeight - v.bottom) + "px";
    panel.classList.add("show");
    sgOpen = true;
    const seq = ++sgSeq;
    try {
      const res = await surveyLayer.queryFeatures({
        where: where + " AND " + field + " IS NOT NULL", outFields: [field],
        returnGeometry: false, orderByFields: [OID + " DESC"], num: 1000
      });
      if (seq !== sgSeq) return;
      const items = res.features.map(ft => ft.attributes[field]).filter(v => !isEmpty(v));
      headEl.innerHTML = `<span>${label}</span><span class="sg-count">${fmtCount(items.length)}</span>`;
      listEl.innerHTML = items.length
        ? items.map(t => `<div class="sg-item">${String(t).replace(/</g, "&lt;")}</div>`).join("")
        : `<div class="sg-empty">Санал алга</div>`;
    } catch (e) { if (seq === sgSeq) listEl.innerHTML = `<div class="sg-empty">Алдаа гарлаа</div>`; }
  }
  function closeSg() { document.getElementById("sg-panel").classList.remove("show"); sgOpen = false; }
  document.getElementById("sg-panel").addEventListener("click", e => e.stopPropagation());
  document.addEventListener("click", () => { if (sgOpen) closeSg(); });

  // Санал зөвлөмжийн panel-ийг зүүн/дээш чирж томруулах
  (function () {
    const panel = document.getElementById("sg-panel");
    let mode = null, sx = 0, sy = 0, sw = 0, sh = 0;
    const start = m => e => { mode = m; sx = e.clientX; sy = e.clientY; const r = panel.getBoundingClientRect(); sw = r.width; sh = r.height; panel.style.height = sh + "px"; panel.style.maxHeight = "none"; document.body.style.userSelect = "none"; e.preventDefault(); e.stopPropagation(); };
    panel.querySelector(".sg-rz-l").addEventListener("mousedown", start("l"));
    panel.querySelector(".sg-rz-t").addEventListener("mousedown", start("t"));
    panel.querySelector(".sg-rz-tl").addEventListener("mousedown", start("tl"));
    window.addEventListener("mousemove", e => {
      if (!mode) return;
      if (mode === "l" || mode === "tl") { let w = sw + (sx - e.clientX); w = Math.max(280, Math.min(window.innerWidth - 30, w)); panel.style.width = w + "px"; }
      if (mode === "t" || mode === "tl") { let h = sh + (sy - e.clientY); h = Math.max(160, Math.min(window.innerHeight - 90, h)); panel.style.height = h + "px"; }
    });
    window.addEventListener("mouseup", () => { if (mode) { mode = null; document.body.style.userSelect = ""; } });
  })();

  function toggleSel(key, value) {
    if (sel[key].has(value)) sel[key].delete(value); else sel[key].add(value);
    updateSummary(key); refreshAll();
  }

  // ===== Header selectors + dropdown =====
  const ICON = `<svg class="ico" viewBox="0 0 24 24" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
  function buildSelectors() {
    const wrap = document.getElementById("selectors");
    Object.keys(DIMS).forEach(key => {
      const d = document.createElement("div");
      d.className = "sel"; d.dataset.key = key;
      d.innerHTML = ICON + `<div class="sel-txt"><div class="sel-label">${DIMS[key].label}</div><div class="sel-sum">Энд дарж ...</div></div><span class="badge"></span>`;
      d.onclick = (e) => { e.stopPropagation(); openDropdown(key, d); };
      wrap.appendChild(d);
    });
  }

  const dd = document.getElementById("dropdown");
  const ddList = document.getElementById("dd-list");
  const ddSearch = document.getElementById("dd-search");
  let ddKey = null, ddOptions = [];

  function positionDropdown(anchor) {
    const r = anchor.getBoundingClientRect();
    const W = 270;
    let left = r.left + r.width / 2 - W / 2; // товчны төвд голлуулна
    if (left + W > window.innerWidth) left = window.innerWidth - W - 4;
    dd.style.left = Math.max(4, left) + "px";
    dd.style.top = r.bottom + "px";
  }
  function renderDdList() {
    const q = ddSearch.value.trim().toLowerCase();
    const items = ddOptions.filter(o => !q || String(o.value).toLowerCase().indexOf(q) !== -1);
    if (!items.length) { ddList.innerHTML = `<div class="dd-empty">Илэрц алга</div>`; return; }
    ddList.innerHTML = "";
    items.forEach(o => {
      const it = document.createElement("label"); it.className = "dd-item";
      const checked = sel[ddKey].has(o.value) ? "checked" : "";
      const lbl = o.value;
      it.innerHTML = `<input type="checkbox" ${checked}><span class="lbl" title="${lbl}">${lbl}</span><span class="cnt">${fmtCount(o.count)}</span>`;
      it.querySelector("input").onchange = (ev) => { ev.stopPropagation();
        if (ddKey === "uach") {
          // зөвхөн 1 сонголт, сонгомогц хаана
          sel.uach.clear();
          if (ev.target.checked) sel.uach.add(o.value);
          updateSummary("uach"); refreshAll(); closeDropdown();
          return;
        }
        if (ev.target.checked) sel[ddKey].add(o.value); else sel[ddKey].delete(o.value);
        updateSummary(ddKey); refreshAll();
      };
      ddList.appendChild(it);
    });
  }
  async function openDropdown(key, anchor) {
    if (ddKey === key && dd.classList.contains("show")) { closeDropdown(); return; }
    closeDropdown();
    ddKey = key;
    document.getElementById("dd-all").style.display = (key === "uach") ? "none" : "";
    anchor.classList.add("open");
    positionDropdown(anchor);
    ddSearch.value = "";
    ddList.innerHTML = `<div class="dd-empty">Ачааллаж байна…</div>`;
    dd.classList.add("show");
    try { ddOptions = await distinctWithCounts(DIMS[key].field, key); } catch (e) { ddOptions = []; }
    if (ddKey === key) renderDdList();
  }
  function closeDropdown() {
    dd.classList.remove("show");
    document.querySelectorAll(".sel.open").forEach(s => s.classList.remove("open"));
    ddKey = null;
  }
  ddSearch.addEventListener("input", renderDdList);
  document.getElementById("dd-reset").onclick = (e) => { e.stopPropagation(); if (!ddKey) return; sel[ddKey].clear(); updateSummary(ddKey); renderDdList(); refreshAll(); };
  document.getElementById("dd-all").onclick = (e) => { e.stopPropagation(); if (!ddKey) return;
    const q = ddSearch.value.trim().toLowerCase();
    ddOptions.filter(o => !q || String(o.value).toLowerCase().indexOf(q) !== -1).forEach(o => sel[ddKey].add(o.value));
    updateSummary(ddKey); renderDdList(); refreshAll(); };
  dd.addEventListener("click", e => e.stopPropagation());
  document.addEventListener("click", closeDropdown);
  window.addEventListener("resize", closeDropdown);

  // ----- Зүүн самбарыг чирж өргөсгөх -----
  (function () {
    const resizer = document.getElementById("resizer-left");
    const leftPanel = document.getElementById("panel-left");
    let dragging = false;
    resizer.addEventListener("mousedown", e => { dragging = true; resizer.classList.add("dragging"); document.body.style.userSelect = "none"; e.preventDefault(); });
    window.addEventListener("mousemove", e => {
      if (!dragging) return;
      let w = Math.max(200, Math.min(window.innerWidth - 280, e.clientX));
      leftPanel.style.width = w + "px"; leftPanel.style.minWidth = w + "px";
    });
    window.addEventListener("mouseup", () => { if (dragging) { dragging = false; resizer.classList.remove("dragging"); document.body.style.userSelect = ""; } });
  })();

  // ----- Баруун самбарыг чирж өргөсгөх -----
  (function () {
    const resizer = document.getElementById("resizer-right");
    const rightPanel = document.getElementById("panel-right");
    let dragging = false;
    resizer.addEventListener("mousedown", e => { dragging = true; resizer.classList.add("dragging"); document.body.style.userSelect = "none"; e.preventDefault(); });
    window.addEventListener("mousemove", e => {
      if (!dragging) return;
      let w = Math.max(200, Math.min(window.innerWidth - 280, window.innerWidth - e.clientX));
      rightPanel.style.width = w + "px"; rightPanel.style.minWidth = w + "px";
    });
    window.addEventListener("mouseup", () => { if (dragging) { dragging = false; resizer.classList.remove("dragging"); document.body.style.userSelect = ""; } });
  })();

  // График сэлгэгч (◄ ►)
  document.getElementById("cs-prev").onclick = () => { chartIdx = (chartIdx - 1 + CHARTS.length) % CHARTS.length; renderLeftPanel().catch(() => {}); };
  document.getElementById("cs-next").onclick = () => { chartIdx = (chartIdx + 1) % CHARTS.length; renderLeftPanel().catch(() => {}); };

  // ===== Эхлэл =====
  buildSelectors();
  view.when(async () => {
    await webmap.when();
    webmap.layers.forEach(l => {
      if (l.url && l.url.indexOf(SURVEY_LAYER_MATCH) !== -1) surveyLayer = l;
      if (l.url && l.url.indexOf("6bvs") !== -1) regionLayer = l;
    });
    if (!surveyLayer) surveyLayer = webmap.layers.find(l => /khorshoo|asuumj/i.test(l.title || "")) || webmap.layers.getItemAt(0);
    document.getElementById("loading").style.display = "none";
    try { view.constraints.snapToZoom = false; view.scale = 12000000; } catch (e) {}
    updateScale();
    if (!surveyLayer) return;
    await surveyLayer.load();
    OID = surveyLayer.objectIdField || "OBJECTID";
    (surveyLayer.fields || []).forEach(fl => { fieldType[fl.name] = fl.type; });
    surveyLayer.outFields = ["*"];
    surveyLayer.popupTemplate = { title: "{Хоршооны_нэр}", outFields: ["*"], content: popupContent };
    window.__surveyLayer = surveyLayer; // Excel export-д ашиглана
    refreshAll();
  });

});
