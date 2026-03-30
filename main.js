// Theme handling
(function () {
  const body = document.body;
  const storedTheme = localStorage.getItem("ai-malnutrition-theme");
  if (storedTheme === "dark" || storedTheme === "light") {
    body.setAttribute("data-theme", storedTheme);
  } else {
    body.setAttribute("data-theme", "light");
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  // Theme toggle
  const themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = body.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      body.setAttribute("data-theme", next);
      localStorage.setItem("ai-malnutrition-theme", next);
    });
  }

  // Mobile nav toggle
  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
      });
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Scroll animations
  const animated = document.querySelectorAll("[data-animate]");
  if (animated.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    animated.forEach((el) => observer.observe(el));
  }

  // Register form validation + password strength
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    const passwordInput = registerForm.querySelector('input[name="password"]');
    const strengthIndicator = document.querySelector(".password-strength-indicator");
    const strengthLabel = document.querySelector(".password-strength-label");

    function evaluateStrength(password) {
      let score = 0;
      if (!password) return { score: 0, label: "Password strength: Too weak" };

      if (password.length >= 8) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;

      let label;
      switch (score) {
        case 0:
        case 1:
          label = "Password strength: Weak";
          break;
        case 2:
          label = "Password strength: Fair";
          break;
        case 3:
          label = "Password strength: Good";
          break;
        default:
          label = "Password strength: Strong";
      }
      return { score, label };
    }

    if (passwordInput && strengthIndicator && strengthLabel) {
      passwordInput.addEventListener("input", () => {
        const { score, label } = evaluateStrength(passwordInput.value);
        const width = (score / 4) * 100;
        strengthIndicator.style.width = width + "%";
        strengthLabel.textContent = label;
      });
    }

    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      const showError = (input, message) => {
        const group = input.closest(".form-group");
        if (!group) return;
        let error = group.querySelector(".form-error");
        if (!error) {
          error = document.createElement("div");
          error.className = "form-error";
          group.appendChild(error);
        }
        error.textContent = message;
        valid = false;
      };

      registerForm.querySelectorAll(".form-error").forEach((el) => el.remove());

      const name = registerForm.querySelector('input[name="name"]');
      const email = registerForm.querySelector('input[name="email"]');
      const phone = registerForm.querySelector('input[name="phone"]');
      const role = registerForm.querySelector('select[name="role"]');

      if (name && !name.value.trim()) showError(name, "Name is required.");

      if (email) {
        const emailValue = email.value.trim();
        if (!emailValue) {
          showError(email, "Email is required.");
        } else if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
          showError(email, "Please enter a valid email.");
        }
      }

      if (phone) {
        const phoneValue = phone.value.trim();
        if (!phoneValue) {
          showError(phone, "Phone number is required.");
        } else if (!/^\d{10}$/.test(phoneValue)) {
          showError(phone, "Please enter a valid 10-digit phone.");
        }
      }

      if (passwordInput) {
        if (passwordInput.value.length < 8) {
          showError(passwordInput, "Password must be at least 8 characters.");
        }
      }

      if (role && !role.value) {
        showError(role, "Please select a role.");
      }

      if (valid) {
        alert("Registered successfully (demo only).");
        registerForm.reset();
        if (strengthIndicator) strengthIndicator.style.width = "0%";
        if (strengthLabel) strengthLabel.textContent = "Password strength: Too weak";
      }
    });
  }

  // Login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      const showError = (input, message) => {
        const group = input.closest(".form-group");
        if (!group) return;
        let error = group.querySelector(".form-error");
        if (!error) {
          error = document.createElement("div");
          error.className = "form-error";
          group.appendChild(error);
        }
        error.textContent = message;
        valid = false;
      };

      loginForm.querySelectorAll(".form-error").forEach((el) => el.remove());

      const email = loginForm.querySelector('input[name="email"]');
      const password = loginForm.querySelector('input[name="password"]');

      if (email && !email.value.trim()) showError(email, "Email is required.");
      if (password && !password.value.trim()) showError(password, "Password is required.");

      if (valid) {
        alert("Logged in (demo only). Redirecting to dashboard...");
        window.location.href = "dashboard.html";
      }
    });
  }

  // Child data upload: image preview and drag-drop
  const uploadForm = document.getElementById("childDataForm");
  if (uploadForm) {
    const fileInput = uploadForm.querySelector('input[type="file"]');
    const dropzone = document.querySelector(".upload-dropzone");
    const preview = document.querySelector(".upload-preview");
    const previewImg = preview ? preview.querySelector("img") : null;
    const previewMeta = preview ? preview.querySelector(".upload-preview-meta") : null;

    const handleFile = (file) => {
      if (!file || !preview || !previewImg || !previewMeta) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewMeta.textContent = `${file.name} • ${(file.size / 1024).toFixed(1)} KB`;
        preview.classList.add("show");
      };
      reader.readAsDataURL(file);
    };

    if (fileInput) {
      fileInput.addEventListener("change", () => {
        const file = fileInput.files && fileInput.files[0];
        if (file) handleFile(file);
      });
    }

    if (dropzone && fileInput) {
      ["dragenter", "dragover"].forEach((eventName) => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add("drag-over");
        });
      });

      ["dragleave", "drop"].forEach((eventName) => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove("drag-over");
        });
      });

      dropzone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        if (!dt || !dt.files || !dt.files[0]) return;
        const file = dt.files[0];
        handleFile(file);
      });

      // Allow click anywhere on dropzone to open file dialog
      dropzone.addEventListener("click", () => {
        fileInput.click();
      });
    }

    uploadForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Ensure all native HTML validations run (required, min, max)
      if (!uploadForm.reportValidity()) return;

      const data = {
        childName: uploadForm.querySelector('[name="childName"]')?.value.trim() || "",
        age: Number(uploadForm.querySelector('[name="age"]')?.value || 0),
        gender: uploadForm.querySelector('[name="gender"]')?.value || "",
        height: Number(uploadForm.querySelector('[name="height"]')?.value || 0),
        weight: Number(uploadForm.querySelector('[name="weight"]')?.value || 0),
        muac: Number(uploadForm.querySelector('[name="muac"]')?.value || 0),
        createdAt: new Date().toISOString(),
      };

      // Simple demo risk logic based on MUAC + BMI
      let risk = "healthy";
      if (data.muac && data.muac < 11.5) risk = "severe";
      else if (data.muac && data.muac < 12.5) risk = "moderate";

      if (data.height && data.weight) {
        const hM = data.height / 100;
        const bmi = data.weight / (hM * hM);
        data.bmi = Number(bmi.toFixed(1));
        if (risk === "healthy" && bmi < 13.2) risk = "moderate";
        if (risk === "moderate" && bmi < 12.5) risk = "severe";
      }

      data.risk = risk;

      const score = risk === "healthy" ? 82 : risk === "moderate" ? 64 : 38;
      data.score = score;

      sessionStorage.setItem("ns_last_screening", JSON.stringify(data));

      const history = JSON.parse(localStorage.getItem("ns_screening_history") || "[]");
      history.unshift(data);
      localStorage.setItem("ns_screening_history", JSON.stringify(history.slice(0, 25)));

      window.location.href = "analysis.html";
    });
  }

  // AI Analysis page: demo risk level + progress animation
  const analysisRoot = document.querySelector("[data-analysis]");
  if (analysisRoot) {
    const stored = sessionStorage.getItem("ns_last_screening");
    let data = null;
    if (stored) {
      try {
        data = JSON.parse(stored);
      } catch {
        data = null;
      }
    }

    const risk = (data && data.risk) || analysisRoot.getAttribute("data-risk") || "moderate";
    analysisRoot.setAttribute("data-risk", risk);

    const riskPill = analysisRoot.querySelector(".risk-pill");
    if (riskPill) {
      riskPill.classList.remove("healthy", "moderate", "severe");
      riskPill.classList.add(risk);
    }

    // Update score and labels if elements exist
    const scoreEl = analysisRoot.querySelector("#scoreValue");
    const riskLabelEl = analysisRoot.querySelector("#riskLabel");
    const followupEl = analysisRoot.querySelector("#riskFollowup");
    if (data && scoreEl && riskLabelEl && followupEl) {
      scoreEl.textContent = `${data.score} / 100`;

      if (risk === "healthy") {
        riskLabelEl.textContent = "Healthy growth pattern";
        followupEl.textContent = "Routine follow-up during next visit";
      } else if (risk === "moderate") {
        riskLabelEl.textContent = "Moderate malnutrition risk";
        followupEl.textContent = "Follow-up needed within 7 days";
      } else {
        riskLabelEl.textContent = "Severe malnutrition risk";
        followupEl.textContent = "Immediate referral to nutrition centre";
      }
    }

    // Child summary
    if (data) {
      const nameOut = document.getElementById("childNameOut");
      const ageOut = document.getElementById("childAgeOut");
      const muacOut = document.getElementById("childMuacOut");
      const bmiOut = document.getElementById("childBmiOut");
      if (nameOut) nameOut.textContent = data.childName || "—";
      if (ageOut) ageOut.textContent = data.age != null ? data.age : "—";
      if (muacOut && data.muac) muacOut.textContent = data.muac.toFixed(1);
      if (bmiOut && data.bmi) bmiOut.textContent = data.bmi.toFixed(1);
    }

    // Progress bars based on risk
    const barConfigs = [
      { selector: "[data-progress='weight']", value: risk === "severe" ? 30 : risk === "moderate" ? 55 : 80 },
      { selector: "[data-progress='height']", value: risk === "severe" ? 40 : risk === "moderate" ? 65 : 85 },
      { selector: "[data-progress='muac']", value: risk === "severe" ? 25 : risk === "moderate" ? 50 : 78 },
    ];
    barConfigs.forEach(({ selector, value }) => {
      const fill = analysisRoot.querySelector(selector);
      if (fill) {
        setTimeout(() => {
          fill.style.width = value + "%";
        }, 400);
      }
    });
  }

  // Admin dashboard charts using Chart.js
  if (typeof Chart !== "undefined") {
    const trendCtx = document.getElementById("trendChart");
    if (trendCtx) {
      new Chart(trendCtx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Total Children Screened",
              data: [120, 190, 260, 310, 420, 510],
              borderColor: "#2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.2)",
              tension: 0.35,
              fill: true,
            },
            {
              label: "High-Risk Cases",
              data: [32, 28, 24, 22, 20, 18],
              borderColor: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.18)",
              tension: 0.35,
              fill: true,
              yAxisID: "y1",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          interaction: {
            mode: "index",
            intersect: false,
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(148,163,184,0.25)",
              },
            },
            y1: {
              beginAtZero: true,
              position: "right",
              grid: {
                drawOnChartArea: false,
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        },
      });
    }

    const riskCtx = document.getElementById("riskChart");
    if (riskCtx) {
      new Chart(riskCtx, {
        type: "doughnut",
        data: {
          labels: ["Healthy", "Moderate", "Severe"],
          datasets: [
            {
              data: [64, 24, 12],
              backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          cutout: "65%",
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    }
  }
});

