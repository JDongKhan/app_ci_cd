(function () {
  "use strict";

  function initCodeCopy() {
    document.querySelectorAll(".markdown-body pre").forEach(function (pre) {
      if (pre.closest(".mermaid")) return;

      var button = document.createElement("button");
      button.type = "button";
      button.className = "copy-btn";
      button.textContent = "复制";

      button.addEventListener("click", function () {
        var code = pre.querySelector("code") || pre;
        var text = code.innerText || code.textContent || "";

        function done(label) {
          button.textContent = label;
          window.setTimeout(function () {
            button.textContent = "复制";
          }, 1500);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            done("已复制");
          }).catch(function () {
            done("复制失败");
          });
          return;
        }

        var area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        try {
          document.execCommand("copy");
          done("已复制");
        } catch (error) {
          done("复制失败");
        }
        document.body.removeChild(area);
      });

      pre.appendChild(button);
    });
  }

  function initTocActive() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".sidebar .toc-link"));
    if (!links.length) return;

    var headings = links.map(function (link) {
      var id = decodeURIComponent(link.hash.slice(1));
      return document.getElementById(id);
    }).filter(Boolean);

    if (!headings.length) return;

    var ticking = false;

    function update() {
      ticking = false;
      var threshold = window.scrollY + 130;
      var current = headings[0];

      headings.forEach(function (heading) {
        var top = heading.getBoundingClientRect().top + window.scrollY;
        if (top <= threshold) current = heading;
      });

      links.forEach(function (link) {
        link.classList.toggle("active", link.hash === "#" + current.id);
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  function initBackToTop() {
    var button = document.querySelector(".to-top");
    if (!button) return;

    function onScroll() {
      button.classList.toggle("show", window.scrollY > 600);
    }

    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initMobileToc() {
    document.querySelectorAll(".mobile-toc a").forEach(function (link) {
      link.addEventListener("click", function () {
        var details = link.closest("details");
        if (details) details.open = false;
      });
    });
  }

  function initHighlight() {
    if (window.hljs) {
      window.hljs.highlightAll();
    }
  }

  function initMermaid() {
    if (!window.mermaid) return;

    var dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var config = {
      startOnLoad: true,
      securityLevel: "loose",
      theme: dark ? "dark" : "neutral",
      flowchart: { useMaxWidth: true, htmlLabels: true, curve: "basis" },
      sequence: { useMaxWidth: true }
    };

    if (!dark) {
      config.themeVariables = {
        primaryColor: "#eef3ff",
        primaryTextColor: "#0f172a",
        primaryBorderColor: "#2563eb",
        lineColor: "#94a3b8",
        secondaryColor: "#f1f5f9",
        tertiaryColor: "#ffffff",
        fontSize: "14px"
      };
    }

    window.mermaid.initialize(config);
  }

  initHighlight();
  initMermaid();
  initCodeCopy();
  initTocActive();
  initBackToTop();
  initMobileToc();
})();
