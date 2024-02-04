setInterval(() => {
  class DialogsNote {
    constructor(chatsLists) {
      this.chatsLists = document.querySelectorAll(chatsLists);

      this.chatsLists.forEach(item => {
        item.addEventListener("mousedown", e => {
          if (e.which == 3) {
            item.classList.toggle("dialog-check");
          }
        });

        item.addEventListener("contextmenu", event => event.preventDefault());
      });
    }
  }

  if (window.location.href.includes("https://chat.sender.ftband.net") || window.location.href.includes("https://chat.sender.ftband.net")) {
    const dialogsNote = new DialogsNote(".sf_sidebar_company_chat");
  }
}, 1000);
