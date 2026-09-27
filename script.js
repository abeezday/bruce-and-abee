const weddingDate = new Date("2027-03-07T12:00:00+08:00");

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz0ov0VA4jv9hDPYwP9XEhntcKNwHRR0AjBi77Uhek1W7UK8bL_82DH6OX5gmjfJFic/exec";

const INVITATION_NONE = "不需要喜帖";

const ATTEND_YES =
  "當然，一定到! Yes, I will be there 😀";

let currentStep = 1;


/* =========================
   COUNTDOWN
========================= */

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  if (
    !daysEl ||
    !hoursEl ||
    !minutesEl ||
    !secondsEl
  ) {
    return;
  }

  const now = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) {
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    return;
  }

  const seconds = Math.floor(diff / 1000);

  const days = Math.floor(seconds / 86400);

  const hours = Math.floor(
    (seconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const secs = seconds % 60;

  daysEl.textContent = days;
  hoursEl.textContent = pad(hours);
  minutesEl.textContent = pad(minutes);
  secondsEl.textContent = pad(secs);
}


/* =========================
   RSVP FORM
========================= */

function initRsvpForm() {
  updateCountdown();
  setInterval(updateCountdown, 1000);

  const form =
    document.getElementById("rsvpForm");

  const formError =
    document.getElementById("formError");

  const prevBtn =
    document.getElementById("prevBtn");

  const nextBtn =
    document.getElementById("nextBtn");

  const submitBtn =
    document.getElementById("submitBtn");

  const stepLabel =
    document.getElementById("stepLabel");

  const progressBar =
    document.getElementById("progressBar");

  const successMessage =
    document.getElementById("successMessage");

  const emailField =
    document.getElementById("emailField");

  const addressField =
    document.getElementById("addressField");

  const attendingFields =
    document.getElementById("attendingFields");

  const step3Title =
    document.getElementById("step3Title");


  if (
    !form ||
    !formError ||
    !prevBtn ||
    !nextBtn ||
    !submitBtn ||
    !stepLabel ||
    !progressBar
  ) {
    return;
  }


  /* =========================
     NUMBER SELECTS
  ========================= */

  function fillNumberSelects() {
    [
      "adultCount",
      "childCount",
      "chairCount",
      "vegetarianCount"
    ].forEach((name) => {
      const select = form.elements[name];

      if (!select) return;

      select.innerHTML = "";

      for (let i = 0; i <= 5; i += 1) {
        const option =
          document.createElement("option");

        option.value = String(i);
        option.textContent = String(i);

        select.appendChild(option);
      }
    });

    if (form.elements.adultCount) {
      form.elements.adultCount.value = "1";
    }

    if (form.elements.childCount) {
      form.elements.childCount.value = "0";
    }

    if (form.elements.chairCount) {
      form.elements.chairCount.value = "0";
    }

    if (form.elements.vegetarianCount) {
      form.elements.vegetarianCount.value = "0";
    }
  }


  /* =========================
     HELPERS
  ========================= */

  function getRadioValue(name) {
    const selected = form.querySelector(
      `input[name="${name}"]:checked`
    );

    return selected
      ? selected.value
      : "";
  }


  function isAttending() {
    return (
      getRadioValue("attendance") ===
      ATTEND_YES
    );
  }


  function invitationNeedsEmail(value) {
    return (
      value.includes("Digital invitation") ||
      value.includes("Digital and printed")
    );
  }


  function invitationNeedsAddress(value) {
    return (
      value.includes("Printed invitation") ||
      value.includes("Digital and printed")
    );
  }


  function getInvitationLabel(value) {
    if (!value) {
      return "";
    }

    if (
      value.includes("Digital and printed")
    ) {
      return "電子＋紙本喜帖";
    }

    if (
      value.includes("Digital invitation")
    ) {
      return "電子喜帖";
    }

    if (
      value.includes("Printed invitation")
    ) {
      return "紙本喜帖";
    }

    return "不需要喜帖";
  }


  /* =========================
     CONDITIONAL FIELDS
  ========================= */

  function updateConditionalFields() {
    const attending = isAttending();

    if (attendingFields) {
      attendingFields.style.display =
        attending
          ? "block"
          : "none";
    }

    if (step3Title) {
      step3Title.textContent =
        attending
          ? "出席資訊"
          : "留下祝福";
    }

    const invitation =
      getRadioValue("invitation");

    const needsEmail =
      attending &&
      invitationNeedsEmail(invitation);

    const needsAddress =
      attending &&
      invitationNeedsAddress(invitation);

    if (emailField) {
      emailField.classList.toggle(
        "show",
        needsEmail
      );
    }

    if (addressField) {
      addressField.classList.toggle(
        "show",
        needsAddress
      );
    }
  }


  /* =========================
     STEP CONTROL
  ========================= */

  function setStep(step) {
    currentStep = step;

    document
      .querySelectorAll(".form-step")
      .forEach((el) => {
        el.classList.toggle(
          "active",
          Number(el.dataset.step) ===
            currentStep
        );
      });

    stepLabel.textContent =
      `Step ${currentStep} of 3`;

    progressBar.style.width =
      `${(currentStep / 3) * 100}%`;

    prevBtn.style.visibility =
      currentStep === 1
        ? "hidden"
        : "visible";

    nextBtn.style.display =
      currentStep === 3
        ? "none"
        : "inline-block";

    submitBtn.style.display =
      currentStep === 3
        ? "inline-block"
        : "none";

    formError.textContent = "";

    updateConditionalFields();
  }


  /* =========================
     VALIDATION
  ========================= */

  function validateStep() {
    formError.textContent = "";


    /* STEP 1 */

    if (currentStep === 1) {
      if (
        !form.elements.guestName.value.trim()
      ) {
        formError.textContent =
          "請填寫您的姓名。";

        return false;
      }

      if (
        !getRadioValue("relationship")
      ) {
        formError.textContent =
          "請選擇與新人的關係。";

        return false;
      }
    }


    /* STEP 2 */

    if (
      currentStep === 2 &&
      !getRadioValue("attendance")
    ) {
      formError.textContent =
        "請選擇是否出席。";

      return false;
    }


    /* STEP 3 */

    if (
      currentStep === 3 &&
      isAttending()
    ) {
      const invitation =
        getRadioValue("invitation");

      if (!invitation) {
        formError.textContent =
          "請選擇是否需要喜帖。";

        return false;
      }

      const needsEmail =
        invitationNeedsEmail(invitation);

      const needsAddress =
        invitationNeedsAddress(invitation);


      if (
        needsEmail &&
        !form.elements.email.value.trim()
      ) {
        formError.textContent =
          "請填寫電子喜帖寄送 Email。";

        return false;
      }


      if (
        needsAddress &&
        !form.elements.address.value.trim()
      ) {
        formError.textContent =
          "請填寫紙本喜帖寄送地址。";

        return false;
      }
    }


    return true;
  }


  /* =========================
     BUILD PAYLOAD
  ========================= */

  function buildPayload() {
    const attending = isAttending();

    const invitationRaw =
      attending
        ? getRadioValue("invitation")
        : INVITATION_NONE;

    const message =
      form.elements.message
        ? form.elements.message.value.trim()
        : "";

    return {
      name:
        form.elements.guestName.value.trim(),

      relationship:
        getRadioValue("relationship"),

      attendance:
        getRadioValue("attendance"),

      adult:
        attending
          ? form.elements.adultCount.value
          : "0",

      child:
        attending
          ? form.elements.childCount.value
          : "0",

      chair:
        attending
          ? form.elements.chairCount.value
          : "0",

      vegetarian:
        attending
          ? form.elements.vegetarianCount.value
          : "0",

      invitation:
        getInvitationLabel(
          invitationRaw
        ),

      email:
        attending &&
        form.elements.email
          ? form.elements.email.value.trim()
          : "",

      address:
        attending &&
        form.elements.address
          ? form.elements.address.value.trim()
          : "",

      message:
        message
    };
  }


  /* =========================
     POST TO GOOGLE SHEET
  ========================= */

  function postToSheet(data) {
    return fetch(
      APPS_SCRIPT_URL,
      {
        method: "POST",

        mode: "no-cors",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body:
          JSON.stringify(data)
      }
    );
  }


  /* =========================
     INITIALIZE
  ========================= */

  fillNumberSelects();

  setStep(1);


  form.addEventListener(
    "change",
    updateConditionalFields
  );


  nextBtn.addEventListener(
    "click",
    () => {
      if (!validateStep()) {
        return;
      }

      setStep(
        Math.min(
          currentStep + 1,
          3
        )
      );
    }
  );


  prevBtn.addEventListener(
    "click",
    () => {
      setStep(
        Math.max(
          currentStep - 1,
          1
        )
      );
    }
  );


  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      if (!validateStep()) {
        return;
      }

      submitBtn.disabled = true;

      submitBtn.textContent =
        "送出中...";

      try {
        await postToSheet(
          buildPayload()
        );

        setTimeout(() => {
          form.style.display =
            "none";

          const stepMeta =
            document.querySelector(
              ".step-meta"
            );

          if (stepMeta) {
            stepMeta.style.display =
              "none";
          }

          if (successMessage) {
            successMessage.style.display =
              "block";
          }

        }, 900);

      } catch (error) {
        console.error(
          "RSVP submission error:",
          error
        );

        formError.textContent =
          "送出時發生問題，請稍後再試。";

        submitBtn.disabled =
          false;

        submitBtn.textContent =
          "送出回覆";
      }
    }
  );
}


/* =========================
   INIT RSVP
========================= */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initRsvpForm
  );
} else {
  initRsvpForm();
}


/* =========================
   WEDDING MUSIC
========================= */

function initWeddingMusic() {
  const musicWelcome =
    document.getElementById(
      "musicWelcome"
    );

  const weddingMusic =
    document.getElementById(
      "weddingMusic"
    );

  const playMusicBtn =
    document.getElementById(
      "playMusicBtn"
    );

  const skipMusicBtn =
    document.getElementById(
      "skipMusicBtn"
    );


  if (
    !musicWelcome ||
    !weddingMusic ||
    !playMusicBtn ||
    !skipMusicBtn
  ) {
    return;
  }


  function closeMusicWelcome() {
    musicWelcome.classList.add(
      "hide"
    );

    setTimeout(() => {
      musicWelcome.style.display =
        "none";
    }, 450);
  }


  playMusicBtn.addEventListener(
    "click",
    async () => {
      playMusicBtn.disabled =
        true;

      try {
        weddingMusic.volume =
          0.35;

        await weddingMusic.play();

      } catch (error) {
        console.error(
          "Unable to play wedding music:",
          error
        );
      }

      closeMusicWelcome();
    }
  );


  skipMusicBtn.addEventListener(
    "click",
    () => {
      weddingMusic.pause();

      closeMusicWelcome();
    }
  );
}


/* =========================
   INIT MUSIC
========================= */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initWeddingMusic
  );
} else {
  initWeddingMusic();
}
