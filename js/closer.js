function handleNodeInserted(mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        for (let node of mutation.addedNodes) {
          if (node.classList && node.classList.contains('sf_bitcoin_modal')) {
            var modalBg = document.querySelector('.sf_modal_bg');
            if (modalBg) {
              modalBg.parentNode.removeChild(modalBg);
            }
  
            var profileMenu = document.querySelector('.sf_sidebar_profile');
            if (profileMenu) {
              profileMenu.click();
  
              var encryptionCheckbox = document.querySelector('.sf_edit_profile_prefs_check[data-el="encryptionToggle"]');
              if (encryptionCheckbox && encryptionCheckbox.classList.contains('on')) {
                encryptionCheckbox.click();
              }
            }
          }
        }
      }
    }
  }
  
  const observer = new MutationObserver(handleNodeInserted);
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });