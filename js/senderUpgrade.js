class Spro {
  constructor(sender) {
    this.sender = document.querySelector(sender);

    this.W = document.createElement("div");
    this.W.classList.add("spro-main");
    this.W.classList.add("hide-spro");

    this.head = document.createElement("div");
    this.head.classList.add("spro-head");

    this.headClose = document.createElement("button");
    this.headClose.classList.add("spro-head-close");

    this.binchekerBtn = document.createElement("button");
    this.binchekerBtn.innerText = "Bincheker";
    this.binchekerBtn.setAttribute(
      "class",
      "spro-button bincheker-btn inContentClose"
    );

    this.bindKeyCloseBtn = document.createElement("button");
    this.bindKeyCloseBtn.innerText = "Close key";
    this.bindKeyCloseBtn.setAttribute(
      "class",
      "spro-button close-key-btn inContentClose"
    );

    this.themeChangeBtn = document.createElement("button");
    this.themeChangeBtn.innerText = "Night Theme";
    this.themeChangeBtn.setAttribute(
      "class",
      "spro-button themes-btn inContentClose"
    );

    this.Sproinit = async () => {
      setInterval(() => {
        if (this.sender === null) {
          this.sender = document.querySelector(sender);
          this.sender.appendChild(this.W);
        } else {
          return false;
        }
      }, 1000);
    };

    this.Sproinit()
      .then(() => {
        this.W.appendChild(this.head);
      })
      .then(() => {
        this.head.appendChild(this.headClose);
      })
      .then(() => {
        this.headClose.onclick = () => {
          this.W.classList.toggle("hide-spro");
          this.binchekerBtn.classList.toggle("inContentClose");
          this.bindKeyCloseBtn.classList.toggle("inContentClose");
          this.themeChangeBtn.classList.toggle("inContentClose");
        };
      })
      .then(() => {
        this.W.appendChild(this.binchekerBtn);
      })
      .then(() => {
        this.bincheker();
      })
      // .then(() => {
      //   this.W.appendChild(this.bindKeyCloseBtn);
      // })
      // .then(() => {
      //   this.bindKeyClose();
      // })
      .then(() => {
        this.W.appendChild(this.themeChangeBtn);
      })
      .then(() => {
        this.nightThemeSet();
      });
    // .then(() => {
    //   this.getOperators();
    // });
  }

  //   fetch("")

  bincheker() {
    this.binchekerBtn.onclick = () => {
      const propmt = prompt("Введите бин или номер карты");

      const api = "https://p2p.monobank.com.ua/bin/";
      const bin = propmt.replace(/\D+/g, "");
      const req = api + bin;

      const output = document.querySelector(".sf_chat_input");
      const helloMsgStatus = document.querySelector(
        ".sf_chat_input_placeholder"
      );

      if (bin.length === 6 || bin.length === 16) {
        fetch(req)
          .then(res => res.json())
          .then(
            result => {
              helloMsgStatus.classList.add("sf_hidden");
              output.innerHTML +=
                "Банк: " +
                result[0].bank +
                "<br>" +
                "Система: " +
                result[0].product.system +
                "<br>" +
                "Название: " +
                result[0].product.name +
                "<br>" +
                "Код страны: " +
                result[0].country +
                "<br>" +
                "МФО: " +
                result[0].mfo +
                "<br>";
            },
            error => {
              output.innerText +=
                "Что то пошло не так либо введено некорректное значение";

                console.log(error)
            }
          );
      } else {
        alert("Нужно ввести 6 цифр (БИН) либо полный номер 16 цифр");
      }
    };
  }

  bindKeyClose() {
    let exit;

    setInterval(() => {
      exit = document.querySelectorAll(".sf_chat_sendbar_oper_support");
    }, 500);

    this.bindKeyCloseBtn.onclick = () => {
      let char = prompt(
        "Нажми клавишу которую нужно забиндить для закрытия диалогов и нажми ок. Ты можешь ввести сюда большой текст, но работать будет по первой клавише. Чуствителен к языку"
      );

      window.addEventListener("keydown", e => {
        if (e.key == char[0]) {
          exit[1].children[0].click();
        }
      });

      char[0] === undefined
        ? null
        : (this.bindKeyCloseBtn.innerHTML =
            "Close Key " + "<span class='close-char'>" + char[0] + "</span>");
    };
  }

  nightThemeSet() {
    let toogler = 0;

    //need black

    let unselectable;
    let nano;
    let chatFooter;

    //need white
    let dialogTitle;
    let companyName;

    let filterTab;
    let chatinput;
    let bad_chats;

    setInterval(() => {
      unselectable = document.querySelector(".unselectable");
      nano = document.querySelector(".sf_chat_msg_holder");
      chatFooter = document.querySelector(".sf_chat_footer");

      bad_chats = document.querySelectorAll(".sf_sidebar_company_chat--bad");

      dialogTitle = document.querySelectorAll(".sf_sidebar_dialog_title");
      companyName = document.querySelectorAll(".sf_sidebar_company_name");

      filterTab = document.querySelectorAll(".sf_companies_filter_tab");
      chatinput = document.querySelectorAll(".sf_chat_input");
    }, 500);

    this.themeChangeBtn.onclick = () => {
      toogler === 0 ? (toogler = 1) : (toogler = 0);

      unselectable.classList.toggle("night-theme-background");
      nano.classList.toggle("night-theme-chat-w");
      chatFooter.classList.toggle("night-theme-background");

      setInterval(() => {
        let avatar_night;
        let operOnly;
        let companyChat;

        avatar_night = document.querySelectorAll(".sf_chat_msg_avatar");

        operOnly = document.querySelectorAll(
          ".sf_chat_msg_oper_only .sf_chat_msg_text"
        );

        companyChat = document.querySelectorAll(".sf_sidebar_company_chat");

        avatar_night.forEach(el => {
          if (toogler === 1) {
            el.classList.add("night-avatar");
          } else {
            el.classList.remove("night-avatar");
          }
        });

        operOnly.forEach(el => {
          if (toogler === 1) {
            el.classList.add("night-theme-oper-only");
          } else {
            el.classList.remove("night-theme-oper-only");
          }
        });

        companyChat.forEach(item => {
          if (toogler === 1) {
            item.classList.add("night-theme-white-dialogs");
          } else {
            item.classList.remove("night-theme-white-dialogs");
          }
        });
      }, 1000);

      bad_chats.forEach(el => {
        if (toogler === 1) {
          el.classList.add("night-theme-bad");
        } else {
          el.classList.remove("night-theme-bad");
        }
      });

      companyName.forEach(el => {
        if (toogler === 1) {
          el.classList.add("night-company-name");
        } else {
          el.classList.remove("night-company-name");
        }
      });

      dialogTitle.forEach(el => {
        if (toogler === 1) {
          el.classList.add("night-theme-company");
        } else {
          el.classList.remove("night-theme-company");
        }
      });

      companyName.forEach(item => {
        if (toogler === 1) {
          item.classList.add("night-theme-company");
        } else {
          item.classList.remove("night-theme-company");
        }
      });

      filterTab.forEach(item => {
        if (toogler === 1) {
          item.classList.add("night-theme-company");
        } else {
          item.classList.remove("night-theme-company");
        }
      });

      chatinput.forEach(item => {
        if (toogler === 1) {
          item.classList.add("night-theme-white");
        } else {
          item.classList.remove("night-theme-white");
        }
      });
    };
  }
}

if (window.location.href.includes("https://chat.sender.ftband.net") || window.location.href.includes("https://chat.sender.ftband.net")) {
  const spro = new Spro(".sf_container", ".sf_chat_sendbar_oper_support");
}
