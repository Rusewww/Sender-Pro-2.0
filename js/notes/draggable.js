function initDraggable(containerId, chatBoxSelector) {
  function makeDraggable(container) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    let saveTimeout;
    let lastSavedPosition = { x: 0, y: 0 };

    const dragHandle = container.querySelector('#drag-handle');
    if (!dragHandle) {
      console.error('Елемент перетягування не знайдено');
      return;
    }

    const chatBox = document.querySelector(chatBoxSelector);
    if (!chatBox) {
      console.error('Чат бокс не знайдено');
      return;
    }

    function savePosition() {
      if (lastSavedPosition.x !== xOffset || lastSavedPosition.y !== yOffset) {
        lastSavedPosition = { x: xOffset, y: yOffset };
        localStorage.setItem(`${containerId}_position`, JSON.stringify(lastSavedPosition));
      }
    }

    function debounceSave() {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(savePosition, 5000);
    }

    function dragStart(e) {
      if (e.type === "mousedown" && e.button !== 0) return;

      if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }

      if (e.target.closest('#drag-handle')) {
        isDragging = true;
      }
    }

    function drag(e) {
      if (isDragging) {
        e.preventDefault();

        if (e.type === "touchmove") {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        } else {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }

        const chatBoxRect = chatBox.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const maxX = chatBoxRect.width - containerRect.width - 30;
        currentX = Math.min(Math.max(currentX, 0), maxX);

        const maxY = chatBoxRect.height - containerRect.height - 20;
        currentY = Math.min(Math.max(currentY, 0), maxY);

        xOffset = currentX;
        yOffset = currentY;

        container.style.transform = `translate(${currentX}px, ${currentY}px)`;
        debounceSave();
      }
    }

    function dragEnd() {
      isDragging = false;
    }

    function restorePosition() {
      const savedPosition = localStorage.getItem(`${containerId}_position`);
      if (savedPosition) {
        try {
          const { x, y } = JSON.parse(savedPosition);
          const chatBoxRect = chatBox.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          const maxX = chatBoxRect.width - containerRect.width - 30;
          const maxY = chatBoxRect.height - containerRect.height - 20;

          if (x >= 0 && x <= maxX && y >= 0 && y <= maxY) {
            xOffset = x;
            yOffset = y;
            lastSavedPosition = { x, y };
            container.style.transform = `translate(${x}px, ${y}px)`;
          } else {
            xOffset = 0;
            yOffset = 0;
            lastSavedPosition = { x: 0, y: 0 };
            container.style.transform = 'translate(0px, 0px)';
          }
        } catch (e) {
          console.error('Помилка при відновленні позиції:', e);
        }
      }
    }

    dragHandle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    dragHandle.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd, { passive: true });

    restorePosition();
  }

  function initContainer() {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Контейнер не знайдено');
      return null;
    }

    makeDraggable(container);
    return container;
  }

  return {
    initContainer
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = initDraggable;
} else {
  window.initDraggable = initDraggable;
} 