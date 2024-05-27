function handleNodeInserted(event) {
  var insertedNode = event.target;

  if (insertedNode.classList.contains('sf_bitcoin_modal')) {
      // Удалить sf_modal_bg
      var modalBg = document.querySelector('.sf_modal_bg');
      if (modalBg) {
          modalBg.parentNode.removeChild(modalBg);
      }

      // Открыть sf_sidebar_profile
      var profileMenu = document.querySelector('.sf_sidebar_profile');
      if (profileMenu) {
          profileMenu.click();

          // Отключить шифрование, если оно включено
          var encryptionCheckbox = document.querySelector('.sf_edit_profile_prefs_check[data-el="encryptionToggle"]');
          if (encryptionCheckbox && encryptionCheckbox.classList.contains('on')) {
              encryptionCheckbox.click();
          }

          // Удаляем обработчик события
          document.removeEventListener('DOMNodeInserted', handleNodeInserted);
      }
  }
}

// Добавляем обработчик события, который будет вызываться при добавлении элемента в DOM
document.addEventListener('DOMNodeInserted', handleNodeInserted);