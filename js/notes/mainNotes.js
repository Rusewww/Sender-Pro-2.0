(function() {
  const chatBoxSelector = '.sf_chat_msg_holder';
  const containerId = 'custom-extension-container';
  const mainMenuId = 'main-menu';
  const settingsMenuId = 'settings-menu';
  const CHECKBOX_STORAGE_KEY = 'defaultCheckboxConfig';

  let previousChatId = null;
  let notesTextarea = null;

  // --- Функції для роботи з налаштуваннями ---

  function getExtensionSettings() {
    return JSON.parse(localStorage.getItem('extensionSettings')) || {
      removeMarkOnUnread: false,
      showTimerOnMessage: false,
      showTopicIndicator: true
    };
  }

  function saveExtensionSettings(settings) {
    localStorage.setItem('extensionSettings', JSON.stringify(settings));
  }

  // --- Створення та ініціалізація елементів інтерфейсу ---

  function createAndAppendElements() {
    let container = document.getElementById(containerId);
    
    if (container) {
      container.innerHTML = '';
    } else {
      const chatBox = document.querySelector(chatBoxSelector);
      if (!chatBox) {
        console.log('Елемент з селектором', chatBoxSelector, 'не знайдено.');
        return;
      }

      container = document.createElement('div');
      container.id = containerId;
      container.className = 'draggable-container';
      chatBox.appendChild(container);
    }

    const dragHandleContainer = document.createElement('div');
    dragHandleContainer.id = 'drag-handle-container';

    const dragHandle = document.createElement('div');
    dragHandle.id = 'drag-handle';

    const dragIndicator = document.createElement('div');
    dragIndicator.className = 'drag-indicator';

    const collapseButton = document.createElement('div');
    collapseButton.id = 'collapse-button';
    const collapseIcon = document.createElement('div');
    collapseIcon.className = 'collapse-icon';
    collapseButton.appendChild(collapseIcon);

    const mainMenuState = localStorage.getItem('mainMenuCollapsed') === 'true';
    if (mainMenuState) {
      collapseButton.classList.add('collapsed');
    }

    collapseButton.addEventListener('click', () => {
      const collapsibleElements = document.querySelectorAll('.collapsible-content');
      collapseButton.classList.toggle('collapsed');
      
      collapsibleElements.forEach(element => {
        element.classList.toggle('collapsed');
      });

      localStorage.setItem('mainMenuCollapsed', collapseButton.classList.contains('collapsed'));
    });

    dragHandle.appendChild(dragIndicator);
    dragHandleContainer.appendChild(dragHandle);
    dragHandleContainer.appendChild(collapseButton);
    container.appendChild(dragHandleContainer);

    if (!container.dataset.draggableInitialized) {
      const draggable = initDraggable(containerId, chatBoxSelector);
      draggable.initContainer();
      container.dataset.draggableInitialized = 'true';
    }

    const mainMenu = document.createElement('div');
    mainMenu.id = mainMenuId;

    const collapsibleContent = document.createElement('div');
    collapsibleContent.className = 'collapsible-content';

    if (mainMenuState) {
      collapsibleContent.classList.add('collapsed');
    }

    DEFAULT_CHECKBOX_CONFIG.forEach((config, index) => {
      const checkboxContainer = document.createElement('div');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = config.id;
      checkbox.addEventListener('change', (e) => {
        saveData();
        toggleRadioButtons(config, checkbox.checked);
      });

      const labelElement = document.createElement('label');
      labelElement.htmlFor = config.id;
      labelElement.textContent = config.label;
      labelElement.style.cursor = 'default';
      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(labelElement);

      if (config.variative) {
        const radioContainer = document.createElement('div');
        radioContainer.id = `radio-container-${index}`;
        radioContainer.className = 'radio-container';
        radioContainer.style.display = 'none';

        config.radioLabels.forEach((label, i) => {
          const radioButton = document.createElement('input');
          radioButton.type = 'radio';
          radioButton.name = `radio-${index}`;
          radioButton.value = `option${i + 1}`;
          radioButton.addEventListener('change', saveData);
          const radioLabel = document.createElement('label');
          radioLabel.textContent = label;
          radioLabel.style.cursor = 'default';
          radioContainer.appendChild(radioButton);
          radioContainer.appendChild(radioLabel);
        });

        checkbox.addEventListener('change', () => {
          radioContainer.style.display = checkbox.checked ? 'flex' : 'none';
        });

        checkboxContainer.appendChild(radioContainer);
      }

      collapsibleContent.appendChild(checkboxContainer);
    });

    const notesHeader = document.createElement('div');
    notesHeader.id = 'notes-header';

    const notesLabel = document.createElement('div');
    notesLabel.id = 'notes-label';
    notesLabel.textContent = 'Нотатка:';

    const notesCollapseButton = document.createElement('div');
    notesCollapseButton.id = 'notes-collapse-button';
    const notesCollapseIcon = document.createElement('div');
    notesCollapseIcon.className = 'collapse-icon';
    notesCollapseButton.appendChild(notesCollapseIcon);

    const notesState = localStorage.getItem('notesCollapsed') === 'true';
    if (notesState) {
      notesCollapseButton.classList.add('collapsed');
    }

    notesCollapseButton.addEventListener('click', () => {
      notesCollapseButton.classList.toggle('collapsed');
      notesContent.classList.toggle('collapsed');

      localStorage.setItem('notesCollapsed', notesCollapseButton.classList.contains('collapsed'));
    });

    notesHeader.appendChild(notesLabel);
    notesHeader.appendChild(notesCollapseButton);
    collapsibleContent.appendChild(notesHeader);

    const notesContent = document.createElement('div');
    notesContent.id = 'notes-content';

    if (notesState) {
      notesContent.classList.add('collapsed');
    }

    notesTextarea = document.createElement('textarea');
    notesTextarea.id = 'notes-textarea';
    notesTextarea.addEventListener('input', saveData);  
    notesContent.appendChild(notesTextarea);

    const saveNoteCheckboxContainer = document.createElement('div');
    saveNoteCheckboxContainer.style.display = 'flex';
    saveNoteCheckboxContainer.style.alignItems = 'center';

    const saveNoteCheckbox = document.createElement('input');
    saveNoteCheckbox.type = 'checkbox';
    saveNoteCheckbox.id = 'save-note-checkbox';
    saveNoteCheckbox.addEventListener('change', saveData); 

    const saveNoteLabel = document.createElement('label');
    saveNoteLabel.htmlFor = 'save-note-checkbox';
    saveNoteLabel.textContent = 'Зберегти нотатку';

    saveNoteCheckboxContainer.appendChild(saveNoteCheckbox);
    saveNoteCheckboxContainer.appendChild(saveNoteLabel);
    notesContent.appendChild(saveNoteCheckboxContainer);

    collapsibleContent.appendChild(notesContent);

    mainMenu.appendChild(collapsibleContent);

    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'button-container';

    const settingsIcon = document.createElement('img');
    settingsIcon.id = 'settings-icon';
    settingsIcon.src = 'https://static.sender.ftband.net/files/u/image/2024/12/16/s3_ixAHyJ/setting.jpg';
    settingsIcon.style.cursor = 'pointer';
    settingsIcon.addEventListener('click', openSettingsMenu); 
    buttonContainer.appendChild(settingsIcon);

    const openDesktopButton = document.createElement('img');
    openDesktopButton.id = 'open-desktop-button';
    openDesktopButton.src = 'https://static.sender.ftband.net/files/u/image/2024/7/14/cYS3kV6s1/fav_operatordesk.jpg';
    openDesktopButton.title = 'Відкриття РС Клієнта';
    openDesktopButton.style.cursor = 'pointer';
    openDesktopButton.addEventListener('click', () => {
        try {
            openClientDesktop();
        } catch (error) {
            console.error('Помилка відкриття робочого столу Клієнта:', error);
        }
    });
    buttonContainer.appendChild(openDesktopButton);
    
    const topicIndicator = document.createElement('div');
    topicIndicator.id = 'topic-indicator';
    topicIndicator.setAttribute('data-fixed', 'false');
    topicIndicator.style.marginLeft = 'auto'; 
    topicIndicator.addEventListener('click', toggleTopicIndicator);

    const clientIdField = document.createElement('div');
    clientIdField.id = 'client-id-field';
    clientIdField.style.marginLeft = '10px';
    clientIdField.style.marginTop = '5px';
    clientIdField.style.display = 'flex';
    clientIdField.style.alignItems = 'center';
    
    const clientIdLabel = document.createElement('span');
    clientIdLabel.textContent = 'ID: ';
    clientIdLabel.style.marginRight = '5px';
    
    const clientIdValue = document.createElement('span');
    clientIdValue.id = 'client-id-value';
    clientIdValue.textContent = 'Не знайдено';
    
    const clearCidButton = document.createElement('img');
    clearCidButton.src = 'https://static.sender.ftband.net/files/u/image/2024/12/15/m1vPFRG_e/clear.png';
    clearCidButton.alt = 'Очистити';
    clearCidButton.title = 'Очистити ID клієнта';
    clearCidButton.style.cursor = 'pointer';
    clearCidButton.style.marginLeft = '5px';
    clearCidButton.style.width = '12px';
    clearCidButton.style.height = '12px';
    clearCidButton.addEventListener('click', clearClientCid);

    clientIdField.appendChild(clientIdLabel);
    clientIdField.appendChild(clientIdValue);
    clientIdField.appendChild(clearCidButton);
    buttonContainer.appendChild(clientIdField);

    const settings = getExtensionSettings();
    topicIndicator.style.display = settings.showTopicIndicator ? 'block' : 'none';

    buttonContainer.appendChild(topicIndicator);

    mainMenu.appendChild(buttonContainer);

    const notification = document.createElement('div');
    notification.id = 'topic-fixed-notification';
    notification.textContent = 'Тематика зафіксована';
    container.appendChild(notification);

    container.appendChild(mainMenu);

    loadData();

    createSettingsMenu(container);
  }
  
  // --- Функції для роботи з меню налаштувань ---

  function createSettingsMenu(container) {
    let settingsMenu = document.getElementById(settingsMenuId);

    if (!settingsMenu) {
      console.log('Створення меню налаштувань');
      settingsMenu = document.createElement('div');
      settingsMenu.id = settingsMenuId;
      settingsMenu.style.display = 'none'; 

      const headerContainer = document.createElement('header');
      headerContainer.id = 'header-container';

      const backButton = document.createElement('img');
      backButton.src = 'https://static.sender.ftband.net/files/u/image/2024/8/31/re0tdpPTp/back.png';
      backButton.alt = 'Назад';
      backButton.className = 'back-button';
      backButton.addEventListener('click', closeSettingsMenu);
      headerContainer.appendChild(backButton);

      const title = document.createElement('h1');
      title.textContent = 'Налаштування';
      title.id = 'settings-title';
      headerContainer.appendChild(title);

      settingsMenu.appendChild(headerContainer);

      const frame = document.createElement('div');
      settingsMenu.appendChild(frame);

      const settingsButton = document.createElement('button');
      settingsButton.textContent = 'Налаштування чекбоксів';
      settingsButton.addEventListener('click', openCustomSettings);
      settingsButton.style.display = 'block';
      settingsButton.style.margin = '10px auto';
      frame.appendChild(settingsButton);

      const settings = getExtensionSettings();

      addToggleOption(frame, 'removeMarkOnUnread', 'Відмітка чату зникає', 'Якщо прийшло повідомлення', settings.removeMarkOnUnread, false);

      addToggleOption(frame, 'showTimerOnMessage', 'Показувати таймер', 'Коли прийшло повідомлення', settings.showTimerOnMessage, true);

      addToggleOption(frame, 'showTopicIndicator', 'Показувати індикатор', 'Фіксації тематики', settings.showTopicIndicator, false);
      
      const clearCidButton = document.createElement('button');
      clearCidButton.textContent = 'Очистити історію CID';
      clearCidButton.style.cssText = `
        display: block;
        margin: 10px auto;
        padding: 5px 10px;
        font-size: 12px;
        color: #666;
        background: none;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
      `;
      clearCidButton.addEventListener('click', () => {
        if (confirm('Ви впевнені, що хочете очистити історію CID?')) {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('cid_b')) {
              localStorage.removeItem(key);
            }
          });
          alert('Історію CID очищено');
        }
      });
      frame.appendChild(clearCidButton);

      const footerText = document.createElement('div');
      footerText.textContent = 'Sender Pro 2.0 by @mkhlxxxv';
      footerText.style.marginTop = '60px';
      footerText.style.cursor = 'pointer';
      footerText.addEventListener('click', function() {
        window.open('https://t.me/mkhlxxxv', '_blank');
      });
      settingsMenu.appendChild(footerText);

      container.appendChild(settingsMenu);
      console.log('Меню налаштувань створено та додано до контейнера');
    } else {
      console.log('Меню налаштувань вже існує');
    }

    createCheckboxSettingsMenu();
  }

  function createCheckboxSettingsMenu() {
    const container = document.getElementById(containerId);
    let checkboxSettingsMenu = document.getElementById('checkbox-settings-menu');

    if (!checkboxSettingsMenu) {
      checkboxSettingsMenu = document.createElement('div');
      checkboxSettingsMenu.id = 'checkbox-settings-menu';
      checkboxSettingsMenu.style.display = 'none';

      const headerContainer = document.createElement('div');
      headerContainer.className = 'settings-header';

      const backButton = document.createElement('img');
      backButton.src = 'https://static.sender.ftband.net/files/u/image/2024/8/31/re0tdpPTp/back.png';
      backButton.alt = 'Назад';
      backButton.className = 'back-button';
      backButton.addEventListener('click', () => {
        checkboxSettingsMenu.style.display = 'none';
        document.getElementById(settingsMenuId).style.display = 'block';
      });
      headerContainer.appendChild(backButton);

      const title = document.createElement('h1');
      title.textContent = 'Чекбокси';
      title.className = 'settings-title';
      headerContainer.appendChild(title);

      checkboxSettingsMenu.appendChild(headerContainer);

      const checkboxContainer = document.createElement('div');
      checkboxContainer.className = 'checkbox-settings-container';

      const savedCheckboxes = JSON.parse(localStorage.getItem('customCheckboxes')) || DEFAULT_CHECKBOX_CONFIG;

      savedCheckboxes.forEach((config, index) => {
        const checkboxWrapper = createCheckboxSettingItem(config, index);
        checkboxContainer.appendChild(checkboxWrapper);
      });

      checkboxSettingsMenu.appendChild(checkboxContainer);

      const addButton = document.createElement('button');
      addButton.textContent = 'Додати чекбокс';
      addButton.className = 'add-checkbox-button';
      addButton.addEventListener('click', () => {
        const checkboxes = checkboxContainer.children;
        if (checkboxes.length < 10) {
          const newConfig = {
            id: `checkbox-${checkboxes.length + 1}`,
            label: `Новий чекбокс ${checkboxes.length + 1}`,
            variative: false
          };
          const newCheckbox = createCheckboxSettingItem(newConfig, checkboxes.length);
          checkboxContainer.appendChild(newCheckbox);
        }
        
        if (checkboxes.length >= 9) {
          addButton.disabled = true;
        }
      });

      checkboxSettingsMenu.appendChild(addButton);

      const saveButton = document.createElement('button');
      saveButton.textContent = 'Зберегти зміни';
      saveButton.className = 'save-settings-button';
      saveButton.addEventListener('click', () => {
        saveCheckboxSettings(checkboxContainer);
      });

      checkboxSettingsMenu.appendChild(saveButton);

      const resetButton = document.createElement('button');
      resetButton.textContent = 'Відновити налаштування';
      resetButton.className = 'reset-defaults-button';
      resetButton.addEventListener('click', () => {
        resetCheckboxSettings();
      });

      checkboxSettingsMenu.appendChild(resetButton);

      container.appendChild(checkboxSettingsMenu);
    }

    function resetCheckboxSettings() {
      if (confirm('Ви впевнені, що хочете відновити налаштування за замовчуванням? Усі поточні зміни будуть втрачені та сторінку буде оновлено.')) {
        localStorage.removeItem(CHECKBOX_STORAGE_KEY);
        localStorage.removeItem('customCheckboxes');
        
        DEFAULT_CHECKBOX_CONFIG = getCheckboxConfig();
        
        document.getElementById('checkbox-settings-menu').remove();
        createCheckboxSettingsMenu();
        createAndAppendElements();
        
        alert('Налаштування успішно відновлено та сторінка буде оновлена!');
        window.location.reload();
      }
    }

    function createCheckboxSettingItem(config, index) {
      const wrapper = document.createElement('div');
      wrapper.className = 'checkbox-setting-item';

      const controls = document.createElement('div');
      controls.className = 'checkbox-controls';

      const labelInput = document.createElement('input');
      labelInput.type = 'text';
      labelInput.value = config.label;
      labelInput.className = 'checkbox-label-input';
      labelInput.maxLength = 30;

      const variativeContainer = document.createElement('div');
      variativeContainer.className = 'variative-container';

      const variativeToggle = document.createElement('input');
      variativeToggle.type = 'checkbox';
      variativeToggle.checked = config.variative;
      variativeToggle.className = 'variative-toggle';

      const deleteButton = document.createElement('button');
      deleteButton.textContent = '×';
      deleteButton.className = 'delete-checkbox-button';
      deleteButton.addEventListener('click', () => {
        wrapper.remove();
        updateCheckboxOrder();
      });

      controls.appendChild(labelInput);
      controls.appendChild(variativeContainer);
      controls.appendChild(variativeToggle);
      controls.appendChild(deleteButton);
      wrapper.appendChild(controls);

      const radioContainer = document.createElement('div');
      radioContainer.className = 'radio-options-container';

      const option1Input = document.createElement('input');
      option1Input.type = 'text';
      option1Input.className = 'radio-option-input';
      option1Input.value = config.radioLabels?.[0] || 'Так';
      option1Input.maxLength = 14;

      const option2Input = document.createElement('input');
      option2Input.type = 'text';
      option2Input.className = 'radio-option-input';
      option2Input.value = config.radioLabels?.[1] || 'Ні';
      option2Input.maxLength = 14;

      radioContainer.appendChild(option1Input);
      radioContainer.appendChild(option2Input);
      wrapper.appendChild(radioContainer);

      variativeToggle.addEventListener('change', () => {
        radioContainer.classList.toggle('visible', variativeToggle.checked);
      });

      radioContainer.classList.toggle('visible', config.variative);

      return wrapper;
    }

    function saveCheckboxSettings(container) {
      const newConfig = Array.from(container.children).map((item, index) => {
        const radioInputs = item.querySelectorAll('.radio-option-input');
        return {
          id: `checkbox-${index + 1}`,
          label: item.querySelector('.checkbox-label-input').value,
          variative: item.querySelector('.variative-toggle').checked,
          radioLabels: item.querySelector('.variative-toggle').checked ? 
            [radioInputs[0].value, radioInputs[1].value] : 
            ['Так', 'Ні']
        };
      });

      localStorage.setItem(CHECKBOX_STORAGE_KEY, JSON.stringify(newConfig));
      localStorage.setItem('customCheckboxes', JSON.stringify(newConfig));
      
      DEFAULT_CHECKBOX_CONFIG = newConfig;
      
      createAndAppendElements();
      
      document.getElementById('checkbox-settings-menu').style.display = 'none';
      document.getElementById(settingsMenuId).style.display = 'block';
      
      alert('Налаштування успішно збережено та сторінка буде оновлена!');
      window.location.reload();
    }

    function updateCheckboxOrder() {
      const items = document.querySelectorAll('.checkbox-setting-item');
      items.forEach((item, index) => {
        const labelInput = item.querySelector('.checkbox-label-input');
        if (!labelInput.value.includes('Новий чекбокс')) {
          labelInput.placeholder = `Чекбокс ${index + 1}`;
        }
      });
    }
  }

  // --- Функції для роботи з чекбоксами ---

  function getCheckboxConfig() {
    const savedConfig = localStorage.getItem(CHECKBOX_STORAGE_KEY);
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    
    const defaultConfig = [
      { id: 'checkbox-1', label: 'Картки заблоковано', variative: true, radioLabels: ['Усі', 'Одну'] },
      { id: 'checkbox-2', label: 'Передача даних', variative: true, radioLabels: ['Було', 'Не було'] },
      { id: 'checkbox-3', label: 'Транзакції/входи', variative: true, radioLabels: ['Підтверджує', 'Не підтверджує'] },
      { id: 'checkbox-4', label: 'Токени видалено', variative: false },
      { id: 'checkbox-5', label: 'Заявка в ХД', variative: false },
      { id: 'checkbox-6', label: 'Заперечення/негатив', variative: true, radioLabels: ['Опрацьовано', 'Не опрацьовано'] },
    ];
    
    localStorage.setItem(CHECKBOX_STORAGE_KEY, JSON.stringify(defaultConfig));
    return defaultConfig;
  }

  let DEFAULT_CHECKBOX_CONFIG = getCheckboxConfig();

  // --- Функції керування меню ---

  function openSettingsMenu() {
    document.getElementById(mainMenuId).style.display = 'none';
    document.getElementById(settingsMenuId).style.display = 'block';
  }

  function closeSettingsMenu() {
    document.getElementById(settingsMenuId).style.display = 'none';
    document.getElementById(mainMenuId).style.display = 'block';
  }

  function openCustomSettings() {
    const checkboxSettingsMenu = document.getElementById('checkbox-settings-menu');
    if (checkboxSettingsMenu) {
      document.getElementById(settingsMenuId).style.display = 'none';
      checkboxSettingsMenu.style.display = 'block';
    }
  }

  function addToggleOption(parent, id, titleText, subtitleText, defaultState, disabled) {
    const optionContainer = document.createElement('div');
    optionContainer.style.display = 'flex';
    optionContainer.style.justifyContent = 'space-between';
    optionContainer.style.alignItems = 'center';
    optionContainer.style.marginBottom = '10px';

    const textContainer = document.createElement('div');
    textContainer.style.display = 'flex';
    textContainer.style.flexDirection = 'column';

    const title = document.createElement('h1');
    title.textContent = titleText;
    title.style.margin = '0';
    title.style.fontSize = '18px';
    title.style.cursor = 'default';

    const subtitle = document.createElement('h2');
    subtitle.textContent = subtitleText;
    subtitle.style.margin = '0';
    subtitle.style.fontSize = '12px';
    subtitle.style.textAlign = 'left';
    subtitle.style.cursor = 'default';

    textContainer.appendChild(title);
    textContainer.appendChild(subtitle);
    optionContainer.appendChild(textContainer);

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.id = id;
    toggle.style.cursor = disabled ? 'not-allowed' : 'pointer';
    toggle.disabled = disabled;
    toggle.checked = defaultState;

    toggle.addEventListener('change', function() {
      const settings = getExtensionSettings();
      settings[id] = toggle.checked;
      saveExtensionSettings(settings);

      if (id === 'removeMarkOnUnread') {
        reinitializeChatObservers();
      }

      if (id === 'showTopicIndicator') {
        const topicIndicator = document.getElementById('topic-indicator');
        if (topicIndicator) {
          topicIndicator.style.display = toggle.checked ? 'block' : 'none';
        }
      }
    });

    optionContainer.appendChild(toggle);
    parent.appendChild(optionContainer);
  }

  function getChatKey() {
    const activeChatElement = document.querySelector('.sf_sidebar_company_chat--active');
    if (!activeChatElement) return null;
    const chatId = activeChatElement.getAttribute('data-id');
    return `chatData_${chatId}`;
  }

  // --- Функції збереження та завантаження даних ---

  function saveData() {
    const chatKey = getChatKey();
    if (!chatKey) return;

    const data = {
      checkboxes: DEFAULT_CHECKBOX_CONFIG.map(config => document.getElementById(config.id).checked),
      radios: DEFAULT_CHECKBOX_CONFIG.map((config, index) => {
        if (config.variative) {
          const radio1Checked = document.querySelector(`input[name="radio-${index}"][value="option1"]`).checked;
          const radio2Checked = document.querySelector(`input[name="radio-${index}"][value="option2"]`).checked;
          return [radio1Checked, radio2Checked];
        }
        return null;
      }),
      notes: notesTextarea.value,
      indicatorFixed: document.getElementById('topic-indicator').getAttribute('data-fixed'),
      saveNote: document.getElementById('save-note-checkbox').checked
    };

    localStorage.setItem(chatKey, JSON.stringify(data));
    // console.log(`Дані збережено для чату: ${chatKey}`, data);
  }
 
  function loadData() {
    const chatKey = getChatKey();
    if (!chatKey) return;

    const savedData = JSON.parse(localStorage.getItem(chatKey));

    resetData();

    if (savedData) {
      savedData.checkboxes.forEach((checked, index) => {
        document.getElementById(DEFAULT_CHECKBOX_CONFIG[index].id).checked = checked;
        toggleRadioButtons(DEFAULT_CHECKBOX_CONFIG[index], checked);
      });
      savedData.radios.forEach((radioStates, index) => {
        if (radioStates) {
          document.querySelector(`input[name="radio-${index}"][value="option1"]`).checked = radioStates[0];
          document.querySelector(`input[name="radio-${index}"][value="option2"]`).checked = radioStates[1];
        }
      });
      notesTextarea.value = savedData.notes;
      document.getElementById('topic-indicator').setAttribute('data-fixed', savedData.indicatorFixed);
      document.getElementById('save-note-checkbox').checked = savedData.saveNote;
    }
  }

  function resetData() {
    DEFAULT_CHECKBOX_CONFIG.forEach((config, index) => {
      document.getElementById(config.id).checked = false;
      toggleRadioButtons(config, false);
    });
    notesTextarea.value = '';
    document.getElementById('topic-indicator').setAttribute('data-fixed', 'false');
    document.getElementById('save-note-checkbox').checked = false;
  }

  function toggleRadioButtons(config, checked) {
    const radioContainer = document.getElementById(`radio-container-${DEFAULT_CHECKBOX_CONFIG.indexOf(config)}`);
    if (radioContainer) {
      radioContainer.style.display = checked ? 'flex' : 'none';
      if (!checked) {
        const radioButtons = radioContainer.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radioButton => {
          radioButton.checked = false;
        });
      }
    }
  }

  function handleMutations(mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'attributes') {
        const chatBox = document.querySelector(chatBoxSelector);
        if (chatBox && !document.getElementById(containerId)) {
          createAndAppendElements();
        }
        const activeChatId = getChatKey();
        if (activeChatId && activeChatId !== previousChatId) {
          previousChatId = activeChatId;
          loadData();
          const chatId = activeChatId.replace('chatData_', '').split('+')[0];
          updateClientIdDisplay(chatId);
        }
      }
    });
  }

  // --- Функції для роботи з індикатором тематики ---

  function toggleTopicIndicator() {
    const topicIndicator = document.getElementById('topic-indicator');
    const isFixed = topicIndicator.getAttribute('data-fixed') === 'true';
    topicIndicator.setAttribute('data-fixed', !isFixed);
    saveData();
  }

  function showNotification(message) {
    const notification = document.getElementById('topic-fixed-notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }

  function checkTopicIndicator(chatId) {
    const chatBox = document.querySelector(`.sf_chat_msg_holder[data-id="${chatId}"]`);
    if (!chatBox) return;

    const successElement = chatBox.querySelector('span.fixed-width[style*="color: green;"][style*="font-size: 18px;"]');
    const fixationElement = chatBox.querySelector('span.fixed-width[style*="font-size: 20px;"]:contains("Фіксація звернення")');

    if (successElement && fixationElement) {
      const topicIndicator = document.getElementById('topic-indicator');
      topicIndicator.setAttribute('data-fixed', 'true');
      showNotification('Тематика зафіксована');
    } else {
      const topicIndicator = document.getElementById('topic-indicator');
      topicIndicator.setAttribute('data-fixed', 'false');
    }
  }

  function triggerClick(button) {
    const events = ['mouseover', 'mousedown', 'mouseup', 'click'];
    events.forEach(event => {
        const evt = new MouseEvent(event, { bubbles: true, cancelable: true, view: window });
        button.dispatchEvent(evt);
    });
  }

  // --- Функції для відкриття РС Клієнта ---

  function openClientDesktop() {
    const activeChatElement = document.querySelector('.sf_sidebar_company_chat--active');
    if (!activeChatElement) {
        console.log("Активний чат не знайдено");
        return;
    }

    const chatId = activeChatElement.getAttribute('data-id').split('+')[0];
    if (!chatId) {
        console.log("ID чату не знайдено");
        return;
    }

    const savedCid = localStorage.getItem(`cid_${chatId}`);
    if (savedCid) {
        if (savedCid === 'unlinked') {
            window.open('https://operatordesk.ftband.net/?sgroup=104&gateway=MANUAL_SEARCH', '_blank');
        } else {
            const link = `https://operatordesk.ftband.net/?sgroup=104&gateway=MANUAL_SEARCH&cid=${savedCid}`;
            window.open(link, '_blank');
        }
        return;
    }

    const messages = Array.from(document.querySelectorAll(`.sf_chat_msg_holder [data-user-id="${chatId}"] .sf_chat_msg_text_message`));
    let cidFound = false;
    
    for (let i = messages.length - 1; i >= 0; i--) {
        const text = messages[i].textContent.trim();
        const unlinkedMatch = text.match(/\([^)]+\):/);
        const cidMatch = text.match(/\)\s(\d+):/);
        
        if (unlinkedMatch && !cidMatch) {
            localStorage.setItem(`cid_${chatId}`, 'unlinked');
            updateClientIdDisplay(chatId);
            window.open('https://operatordesk.ftband.net/?sgroup=104&gateway=MANUAL_SEARCH', '_blank');
            cidFound = true;
            break;
        } else if (cidMatch && cidMatch[1]) {
            const cid = cidMatch[1];
            localStorage.setItem(`cid_${chatId}`, cid);
            updateClientIdDisplay(chatId);
            const link = `https://operatordesk.ftband.net/?sgroup=104&gateway=MANUAL_SEARCH&cid=${cid}`;
            window.open(link, '_blank');
            cidFound = true;
            break;
        }
    }

    if (!cidFound) {
        alert(`Не вдалося знайти CID Клієнта. Зверніться до @mkhlxxxv`);
    }
  }

  function clearClientCid() {
    const activeChatElement = document.querySelector('.sf_sidebar_company_chat--active');
    if (!activeChatElement) {
      console.log("Активний чат не знайдено");
      return;
    }

    const chatId = activeChatElement.getAttribute('data-id').split('+')[0];
    if (!chatId) {
      console.log("ID чату не знайдено"); 
      return;
    }

    localStorage.removeItem(`cid_${chatId}`);
    updateClientIdDisplay(chatId);
  }

  function updateClientIdDisplay(chatId) {
    const clientIdValue = document.getElementById('client-id-value');
    if (!clientIdValue) return;

    const savedCid = localStorage.getItem(`cid_${chatId}`);
    if (!savedCid) {
        clientIdValue.textContent = 'Не знайдено';
    } else if (savedCid === 'unlinked') {
        clientIdValue.textContent = 'Непідв`яз';
    } else {
        clientIdValue.textContent = savedCid;
    }
  }

  const openDesktopButton = document.getElementById('open-desktop-button');
  if (openDesktopButton) {
    openDesktopButton.addEventListener('click', openClientDesktop);
  }

  const observer = new MutationObserver(handleMutations);

  const observerConfig = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  };

  observer.observe(document.body, observerConfig);
  
  createAndAppendElements();

  // --- Функції для роботи з чатом та відмітками ---

  function updateChatState(chatId, isChecked) {
    let chatStates = JSON.parse(localStorage.getItem('chatStates')) || {};
    if (isChecked) {
      chatStates[chatId] = true;
    } else {
      delete chatStates[chatId];
    }
    localStorage.setItem('chatStates', JSON.stringify(chatStates));
  }

  function applyChatState(chat) {
    let chatId = chat.getAttribute('data-id');
    if (!chatId) return;

    let chatStates = JSON.parse(localStorage.getItem('chatStates')) || {};
    if (chatStates[chatId]) {
      chat.classList.add('dialog-check');
    } else {
      chat.classList.remove('dialog-check');
    }
  }

  function addChatEventListener(chat) {
    if (!chat.dataset.listenerAdded) {
      chat.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.classList.toggle('dialog-check');

        let chatId = this.getAttribute('data-id');
        let isChecked = this.classList.contains('dialog-check');
        if (chatId) {
          updateChatState(chatId, isChecked);
        }
      });

      chat.dataset.listenerAdded = 'true';
    }

    addUnreadObserver(chat);
  }

  function addUnreadObserver(chat) {
    const settings = getExtensionSettings();
    if (!settings.removeMarkOnUnread) {
      return;
    }
  
    const chatId = chat.getAttribute('data-id');
    if (!chatId) return;
  
    if (chat.dataset.unreadObserverAdded) return;
  
    const unreadObserver = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {  
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.classList.contains('sf_sidebar_company_chat_unread')) {
  
                chat.classList.remove('dialog-check');
                updateChatState(chatId, false);
              } else {
                const unreadDescendant = node.querySelector('.sf_sidebar_company_chat_unread');
                if (unreadDescendant) {

                  chat.classList.remove('dialog-check');
                  updateChatState(chatId, false);
                }
              }
            }
          });
        } else if (mutation.type === 'attributes') {
          if (mutation.target.classList.contains('sf_sidebar_company_chat_unread')) {
  
            chat.classList.remove('dialog-check');
            updateChatState(chatId, false);
          }
  
          if (mutation.target === chat && chat.classList.contains('sf_sidebar_company_chat_unread')) {
  
            chat.classList.remove('dialog-check');
            updateChatState(chatId, false);
          }
        }
      }
    });
  
    unreadObserver.observe(chat, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  
    chat.dataset.unreadObserverAdded = 'true';
  }  

  function reinitializeChatObservers() {
    document.querySelectorAll('.sf_sidebar_companies_list .sf_sidebar_company_chat').forEach(chat => {
      delete chat.dataset.unreadObserverAdded;
      addUnreadObserver(chat);
    });
  }

  function initializeChats() {
    document.querySelectorAll('.sf_sidebar_companies_list .sf_sidebar_company_chat').forEach(chat => {
      applyChatState(chat);
      addChatEventListener(chat);
    });
  }

  const chatObserver = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches('.sf_sidebar_companies_list .sf_sidebar_company_chat')) {
              applyChatState(node);
              addChatEventListener(node);
            } else {
              node.querySelectorAll('.sf_sidebar_companies_list .sf_sidebar_company_chat').forEach(chat => {
                applyChatState(chat);
                addChatEventListener(chat);
              });
            }
          }
        });
      } else if (mutation.type === 'attributes' && mutation.attributeName === 'data-id') {
        const target = mutation.target;
        if (target.matches('.sf_sidebar_companies_list .sf_sidebar_company_chat')) {
          applyChatState(target);
          addChatEventListener(target);
        }
      }
    }
  });

  chatObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true, 
    attributeFilter: ['data-id']
  });

  initializeChats();
})();