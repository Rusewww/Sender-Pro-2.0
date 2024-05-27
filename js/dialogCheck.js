setInterval(() => {
  class DialogsNote {
    constructor(chatsLists) {
      this.chatsLists = document.querySelectorAll(chatsLists);

      this.chatsLists.forEach(item => {
        const chatId = item.getAttribute('data-id'); // Идентификатор чата

        // Восстанавливаем состояние отметки чата из localStorage
        const isDialogChecked = localStorage.getItem(`dialog-${chatId}-checked`);
        if (isDialogChecked === 'true') {
          item.classList.add("dialog-check");
        }

        item.addEventListener("mousedown", e => {
          if (e.which == 3) {
            const isChecked = item.classList.toggle("dialog-check");
            localStorage.setItem(`dialog-${chatId}-checked`, isChecked.toString());
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
