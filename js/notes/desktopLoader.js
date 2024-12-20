let attempts = 0;
const MAX_ATTEMPTS = 5;

const updateTitle = () => {
  try {
    let fioUk = document.querySelector('tr[ng-if="client.customerInfo.fioUk"] td:nth-child(2) div')?.textContent.trim();
    
    if (fioUk) {
      document.title = fioUk;
      return;
    }
  } catch (e) {}
  
  attempts++;
  if (attempts < MAX_ATTEMPTS) {
    setTimeout(updateTitle, 3000);
  }
};

updateTitle();