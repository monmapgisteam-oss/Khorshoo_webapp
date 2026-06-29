// Тайлан icon — docx + FileSaver-ээр жинхэнэ .docx татна (үндсэн кодоос тусдаа)
(function () {
  var b = document.getElementById("report-btn");
  if (!b) return;
  var txt = function (id) {
    var el = document.getElementById(id);
    return el ? el.innerText.trim() : "";
  };

  var tEl = function (el) {
    return el ? el.innerText.trim() : "";
  };

  b.addEventListener("click", async function () {
    if (typeof docx === "undefined" || typeof saveAs === "undefined") {
      alert("docx сан ачаалагдаагүй байна.");
      return;
    }
    b.disabled = true;
    try {
      var d = docx;
      var B = { style: d.BorderStyle.SINGLE, size: 1, color: "AAAAAA" };
      var BORD = { top: B, bottom: B, left: B, right: B };
      function cell(text, o) {
        o = o || {};
        return new d.TableCell({
          borders: BORD,
          margins: { top: 30, bottom: 30, left: 90, right: 90 },
          shading: o.fill
            ? { type: d.ShadingType.CLEAR, color: "auto", fill: o.fill }
            : undefined,
          width: o.w ? { size: o.w, type: d.WidthType.PERCENTAGE } : undefined,
          children: [
            new d.Paragraph({
              children: [
                new d.TextRun({
                  text: String(text == null ? "" : text),
                  bold: !!o.bold,
                  color: o.color || "000000",
                  size: 20,
                }),
              ],
            }),
          ],
        });
      }
      function hrow(arr) {
        return new d.TableRow({
          tableHeader: true,
          children: arr.map(function (t) {
            return cell(t, { bold: true, fill: "0B1A2B", color: "FFFFFF" });
          }),
        });
      }
      function drow(arr) {
        return new d.TableRow({
          children: arr.map(function (t) {
            return cell(t);
          }),
        });
      }
      function tbl(rows) {
        return new d.Table({
          width: { size: 100, type: d.WidthType.PERCENTAGE },
          rows: rows,
        });
      }
      function heading(t) {
        return new d.Paragraph({
          spacing: { before: 220, after: 90 },
          children: [
            new d.TextRun({ text: t, bold: true, size: 24, color: "0F3D14" }),
          ],
        });
      }
      function para(t, o) {
        o = o || {};
        return new d.Paragraph({
          spacing: o.sp ? { before: 120 } : undefined,
          children: [
            new d.TextRun({
              text: String(t == null ? "" : t),
              bold: !!o.bold,
              size: o.size || 20,
            }),
          ],
        });
      }
      var gap = function () {
        return new d.Paragraph("");
      };

      // --- DOM-оос өгөгдөл цуглуулах ---
      var fils = [].slice
        .call(document.querySelectorAll(".sel"))
        .filter(function (s) {
          return s.classList.contains("has-val");
        })
        .map(function (s) {
          return (
            tEl(s.querySelector(".sel-label")) +
            ": " +
            tEl(s.querySelector(".sel-sum"))
          );
        });
      var filText = fils.length ? fils.join("; ") : "Бүх өгөгдөл (шүүлтгүй)";
      var layer = window.__surveyLayer;
      function fmtMoney(n) {
        n = Number(n) || 0;
        var a = Math.abs(n);
        if (a >= 1e9)
          return (n / 1e9).toFixed(1).replace(/\.0$/, "") + " тэрбум₮";
        if (a >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + " сая₮";
        return Math.round(n).toLocaleString("en-US") + "₮";
      }
      async function sumBy(field, extra) {
        var w =
          layer &&
          layer.definitionExpression &&
          layer.definitionExpression.trim()
            ? layer.definitionExpression
            : "1=1";
        if (extra) w = w === "1=1" ? extra : w + " AND " + extra;
        var res = await layer.queryFeatures({
          where: w,
          returnGeometry: false,
          groupByFieldsForStatistics: [field],
          outStatistics: [
            {
              statisticType: "sum",
              onStatisticField: "Олгосон_зээлийн_дүн",
              outStatisticFieldName: "s",
            },
          ],
          orderByFields: ["s DESC"],
          num: 300,
        });
        return res.features
          .map(function (f) {
            return [f.attributes[field], f.attributes.s];
          })
          .filter(function (r) {
            return r[0] != null && r[1] > 0;
          });
      }
      function curWhere() {
        return layer &&
          layer.definitionExpression &&
          layer.definitionExpression.trim()
          ? layer.definitionExpression
          : "1=1";
      }
      async function countBy(field) {
        var oid = (layer && layer.objectIdField) || "OBJECTID";
        var res = await layer.queryFeatures({
          where: curWhere(),
          returnGeometry: false,
          groupByFieldsForStatistics: [field],
          outStatistics: [
            {
              statisticType: "count",
              onStatisticField: oid,
              outStatisticFieldName: "c",
            },
          ],
          orderByFields: ["c DESC"],
          num: 60,
        });
        return res.features
          .map(function (f) {
            return [f.attributes[field], f.attributes.c];
          })
          .filter(function (r) {
            return r[0] != null && String(r[0]).trim() !== "";
          });
      }
      async function numStat(field) {
        var res = await layer.queryFeatures({
          where: curWhere(),
          returnGeometry: false,
          outStatistics: [
            {
              statisticType: "sum",
              onStatisticField: field,
              outStatisticFieldName: "s",
            },
            {
              statisticType: "avg",
              onStatisticField: field,
              outStatisticFieldName: "a",
            },
            {
              statisticType: "count",
              onStatisticField: field,
              outStatisticFieldName: "c",
            },
          ],
        });
        var a = res.features[0].attributes;
        return { sum: a.s || 0, avg: a.a || 0, count: a.c || 0 };
      }
      function cleanLbl(v) {
        return String(v)
          .replace(/^\s*\d+[.\)]\s+/, "")
          .trim();
      }
      var rpHead = tEl(document.querySelector("#panel-right .rp-head h2"));
      var rpSub = tEl(document.querySelector("#panel-right .rp-head .sub"));
      var cards = [].slice
        .call(document.querySelectorAll("#panel-right .rp-card"))
        .map(function (c) {
          return {
            q: tEl(c.querySelector(".rp-q")),
            sub: tEl(c.querySelector(".ind-sub")),
            hbars: [].slice
              .call(c.querySelectorAll(".hbar-row"))
              .map(function (r) {
                return [
                  tEl(r.querySelector(".hbar-label")),
                  tEl(r.querySelector(".hbar-val")),
                ];
              }),
            donut: [].slice
              .call(c.querySelectorAll(".dleg .r"))
              .map(function (r) {
                return [
                  tEl(r.querySelector(".nm")),
                  tEl(r.querySelector(".vv")),
                ];
              }),
            ind: c.querySelector(".ind")
              ? (
                  tEl(c.querySelector(".ind .big")) +
                  " " +
                  tEl(c.querySelector(".ind .unit"))
                ).trim()
              : null,
            sg: c.querySelector(".rp-sgbtn")
              ? tEl(c.querySelector(".rp-sgbtn"))
              : null,
          };
        });

      var kids = [];
      kids.push(
        new d.Paragraph({
          alignment: d.AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new d.TextRun({
              text: "ШИНЭ ХОРШОО ХӨДӨЛГӨӨН СУДАЛГААНЫ ТАЙЛАН",
              bold: true,
              size: 28,
              color: "0F3D14",
            }),
          ],
        }),
      );
      kids.push(
        new d.Paragraph({
          alignment: d.AlignmentType.CENTER,
          children: [
            new d.TextRun({
              text: "Огноо: " + new Date().toLocaleString("mn-MN"),
              size: 20,
              color: "666666",
            }),
          ],
        }),
      );
      if (fils.length)
        kids.push(para("Шүүлтийн нөхцөл: " + fils.join("; "), { sp: true }));
      kids.push(gap());

      kids.push(heading("1. Үндсэн үзүүлэлт"));
      kids.push(
        para(
          "Сонгогдсон нөхцөлд нийт " +
            tEl(document.getElementById("ind-count")) +
            " зээлдэгч хамрагдсан бөгөөд олгосон нийт зээл " +
            tEl(document.getElementById("ind-loan")) +
            ", судалгаанд " +
            tEl(document.getElementById("ind-survey")) +
            " өрх хамрагдсан байна.",
        ),
      );
      kids.push(
        tbl([
          hrow(["Үзүүлэлт", "Утга"]),
          drow(["Зээлийн тоо", tEl(document.getElementById("ind-count"))]),
          drow(["Олгосон зээл", tEl(document.getElementById("ind-loan"))]),
          drow([
            "Судалгаанд хамрагдсан",
            tEl(document.getElementById("ind-survey")),
          ]),
        ]),
      );
      kids.push(gap());

      var aimagRows = layer ? await sumBy("Аймаг", null) : [];
      var purposeRows = layer
        ? await sumBy("Зээлийн_зориулалт", "Зээлийн_зориулалт <> '-'")
        : [];
      kids.push(heading("2. Олгосон зээлийн дүн"));
      kids.push(
        para(
          "Доорх хүснэгтэд аймаг тус бүрд олгосон зээлийн нийт дүнг буурах эрэмбээр харуулав.",
        ),
      );
      kids.push(
        tbl(
          [hrow(["Аймаг", "Дүн"])].concat(
            aimagRows.map(function (r) {
              return drow([r[0], fmtMoney(r[1])]);
            }),
          ),
        ),
      );
      kids.push(gap());
      kids.push(heading("3. Зээл олгосон дүн, зориулалтаар"));
      kids.push(
        para(
          "Доорх хүснэгтэд зээлийн зориулалт тус бүрд олгосон нийт дүнг буурах эрэмбээр харуулав.",
        ),
      );
      kids.push(
        tbl(
          [hrow(["Зориулалт", "Дүн"])].concat(
            purposeRows.map(function (r) {
              return drow([r[0], fmtMoney(r[1])]);
            }),
          ),
        ),
      );
      kids.push(gap());

      kids.push(heading("4. " + (rpHead || "Асуумжийн дүн")));

      // --- Нийтлэг асуумж 4.1–4.7 (бүх чиглэлд адил, дашбоардад харагдахгүй) ---
      var COMMON = [
        {
          label: "Зээлийн үр дүнг хэрхэн үнэлдэг вэ?",
          field: "F1",
          type: "cat",
        },
        {
          label: "Хоршоонд нэгдсэнээр гарсан өөрчлөлт",
          field: "F2",
          type: "cat",
        },
        {
          label: "Хоршооны гишүүн болсноор өрхийн орлогын өөрчлөлт",
          field: "F3",
          type: "cat",
        },
        {
          label: "Гэр бүлийн чухал асуудлыг шийдвэрлэхэд тусалсан нь",
          field: "F4",
          type: "text",
        },
        {
          label: "Өрхийн жилийн орлого (₮)",
          fields: ["F5_1", "F5_2"],
          names: ["Зээлд хамрагдахаас өмнө", "Зээлд хамрагдсанаас хойш"],
          money: true,
          type: "num2",
        },
        {
          label: "Шинээр бий болсон ажлын байр",
          fields: ["F6_1", "F6_2"],
          names: ["Байнгын", "Түр"],
          money: false,
          type: "num2",
        },
        {
          label: "Зээлийн эргэн төлөлтөд санхүүгийн хүндрэл гарч буй эсэх",
          field: "F7",
          type: "cat",
        },
      ];
      for (var ci = 0; ci < COMMON.length; ci++) {
        var cq = COMMON[ci];
        kids.push(
          para("4." + (ci + 1) + ". " + cq.label, { bold: true, sp: true }),
        );
        if (cq.type === "cat") {
          var crows = await countBy(cq.field);
          if (crows.length) {
            var agg = {};
            crows.forEach(function (r) {
              var k = cleanLbl(r[0]);
              agg[k] = (agg[k] || 0) + r[1];
            });
            var arr = Object.keys(agg)
              .map(function (k) {
                return [k, agg[k]];
              })
              .sort(function (a, b) {
                return b[1] - a[1];
              });
            kids.push(
              para(
                "Доорх хүснэгтэд хариултыг ангилал тус бүрээр, хэдэн хариулт өгсөнтэй нь хамт харуулав.",
              ),
            );
            kids.push(tbl([hrow(["Хариулт", "Тоо"])].concat(arr.map(drow))));
          } else kids.push(para("Хариулт алга."));
        } else if (cq.type === "text") {
          var tres = await layer.queryFeatures({
            where: curWhere(),
            returnGeometry: false,
            outStatistics: [
              {
                statisticType: "count",
                onStatisticField: cq.field,
                outStatisticFieldName: "c",
              },
            ],
          });
          var tn = (tres.features[0] && tres.features[0].attributes.c) || 0;
          if (curWhere() === "1=1") {
            kids.push(
              para(
                tn.toLocaleString("en-US") +
                  " хариулт бичгээр ирүүлсэн. (Бичгэн саналуудыг харахын тулд бүс эсвэл аймгаар шүүнэ үү.)",
              ),
            );
          } else {
            kids.push(
              para(
                tn.toLocaleString("en-US") +
                  " хариулт бичгээр ирүүлсэн. Ирүүлсэн саналууд:",
              ),
            );
            var ar = await layer.queryFeatures({
              where: curWhere() + " AND " + cq.field + " IS NOT NULL",
              outFields: [cq.field],
              returnGeometry: false,
              num: 1000,
            });
            var answers = ar.features
              .map(function (f) {
                return f.attributes[cq.field];
              })
              .filter(function (v) {
                return v != null && String(v).trim() !== "";
              });
            answers.forEach(function (ans) {
              kids.push(
                new d.Paragraph({
                  indent: { left: 220 },
                  spacing: { after: 20 },
                  children: [
                    new d.TextRun({ text: "• ", size: 16 }),
                    new d.TextRun({ text: String(ans).trim(), size: 20 }),
                  ],
                }),
              );
            });
            if (tn > answers.length)
              kids.push(
                para(
                  "… (нийт " +
                    tn.toLocaleString("en-US") +
                    " саналаас эхний " +
                    answers.length +
                    " нь харагдаж байна)",
                ),
              );
          }
        } else if (cq.type === "num2") {
          var s1 = await numStat(cq.fields[0]);
          var s2 = await numStat(cq.fields[1]);
          var money = cq.money;
          var fmtN = function (v) {
            return money ? fmtMoney(v) : Math.round(v).toLocaleString("en-US");
          };
          kids.push(para("Доорх хүснэгтэд нийт болон дунджийг харуулав."));
          kids.push(
            tbl([
              hrow(["Үзүүлэлт", "Нийт", "Дундаж", "Хариулсан"]),
              drow([cq.names[0], fmtN(s1.sum), fmtN(s1.avg), String(s1.count)]),
              drow([cq.names[1], fmtN(s2.sum), fmtN(s2.avg), String(s2.count)]),
            ]),
          );
        }
        kids.push(gap());
      }

      // --- Тухайн чиглэлийн тусгай асуултууд 4.8+ ---
      kids.push(
        para("Тухайн чиглэлийн тусгай асуултууд:", { bold: true, sp: true }),
      );
      var qcards = cards.filter(function (c) {
        return c.hbars.length || c.donut.length || c.ind;
      });
      qcards.forEach(function (c, i) {
        kids.push(
          para("4." + (COMMON.length + i + 1) + ". " + c.q, {
            bold: true,
            sp: true,
          }),
        );
        if (c.hbars.length) {
          kids.push(
            para(
              "Доорх хүснэгтэд уг үзүүлэлтийн хариултын утгыг бүлэг (хязгаар) тус бүрээр ангилж, тус бүрт хэдэн хариулт ноогдсоныг харуулав" +
                (c.sub ? " (" + c.sub + ")" : "") +
                ".",
            ),
          );
          kids.push(tbl([hrow(["Хязгаар", "Тоо"])].concat(c.hbars.map(drow))));
        } else if (c.donut.length) {
          kids.push(
            para(
              "Доорх хүснэгтэд уг асуултын хариултыг ангилал тус бүрээр, хэдэн хариулт өгсөнтэй нь хамт харуулав.",
            ),
          );
          kids.push(tbl([hrow(["Ангилал", "Тоо"])].concat(c.donut.map(drow))));
        } else if (c.ind) {
          kids.push(
            para("Үзүүлэлт: " + c.ind + (c.sub ? " (" + c.sub + ")" : "")),
          );
        }
        kids.push(gap());
      });

      var doc = new d.Document({ sections: [{ children: kids }] });
      var blob = await d.Packer.toBlob(doc);
      var dt = new Date();
      var ymd =
        dt.getFullYear() +
        String(dt.getMonth() + 1).padStart(2, "0") +
        String(dt.getDate()).padStart(2, "0");
      saveAs(blob, "Khorshoo_tailan_" + ymd + ".docx");
    } catch (e) {
      alert("Алдаа: " + (e.message || e));
    } finally {
      b.disabled = false;
    }
  });
})();
