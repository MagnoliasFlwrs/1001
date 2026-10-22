'use strict';

// Swiper поддерживает жесты, стрелки и доступную клавиатурную навигацию.
function initializeHeroSlider() {
  if (!document.querySelector('.hero')) return null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return new Swiper('.hero', {
    loop: true,
    speed: reducedMotion ? 0 : 900,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    keyboard: { enabled: true, onlyInViewport: true },
    navigation: { prevEl: '.hero__previous', nextEl: '.hero__next' },
    pagination: { el: '.hero__pagination', clickable: true },
    a11y: {
      prevSlideMessage: 'Предыдущий слайд',
      nextSlideMessage: 'Следующий слайд',
      paginationBulletMessage: 'Перейти к слайду {{index}}',
      slideLabelMessage: '{{index}} из {{slidesLength}}',
    },
  });
}

// Нативный dialog ограничивает фокус и делает фон недоступным для клавиатуры.
function initializeDialogs(slider) {
  const dialogs = [...document.querySelectorAll('dialog')];
  const openingButtons = [...document.querySelectorAll('[data-open]')];
  let returnFocusElement = null;
  let closingDialog = null;

  function openDialog(dialog, trigger) {
    returnFocusElement = trigger;
    slider?.keyboard.disable();
    document.body.classList.add('is-dialog-open');
    dialog.showModal();
    if (trigger.matches('[data-open]')) trigger.setAttribute('aria-expanded', 'true');
    // Два кадра позволяют браузеру отрисовать начальное положение выезжающей панели.
    requestAnimationFrame(() => requestAnimationFrame(() => dialog.classList.add('is-open')));
  }

  function closeDialog(dialog) {
    if (closingDialog === dialog || !dialog.open) return;
    closingDialog = dialog;
    dialog.classList.remove('is-open');
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700;
    window.setTimeout(() => {
      dialog.close();
      document.body.classList.remove('is-dialog-open');
      slider?.keyboard.enable();
      openingButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
      returnFocusElement?.focus();
      closingDialog = null;
    }, delay);
  }

  openingButtons.forEach(button => button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.open);
    if (dialog) openDialog(dialog, button);
  }));
  dialogs.forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => closeDialog(dialog));
    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      closeDialog(dialog);
    });
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      const outsidePanel = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
      if (event.target === dialog && outsidePanel) closeDialog(dialog);
    });
  });
  document.querySelectorAll('.menu__navigation a').forEach(link => {
    link.addEventListener('click', () => closeDialog(document.getElementById('menu-dialog')));
  });


}

// До подключения API форма проверяет поля, но не заявляет об успешной отправке.
function initializeRequestForm() {
  const requestForm = document.querySelector('.request__form');
  if (!requestForm) return;
  requestForm.addEventListener('submit', event => {
    event.preventDefault();
    requestForm.querySelector('.request__status').hidden = false;
    requestForm.querySelector('.request__status').textContent = 'Поля заполнены. Отправка заявки будет доступна после подключения сервера.';
  });
}

const heroSlider = initializeHeroSlider();
initializeDialogs(heroSlider);
initializeRequestForm();

// Форма консультации проверяет поля; успешная отправка требует серверного API.
function initializeConsultationForms() {
  document.querySelectorAll('[data-local-form]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      form.querySelector('[role="status"]').hidden = false;
      form.querySelector('[role="status"]').textContent = 'Отправка заявки будет доступна после подключения сервера.';
    });
  });
}

initializeConsultationForms();

// При открытии этапа закрываем остальные, включая этапы другой услуги.
function initializeServiceAccordion() {
  const serviceStages = [...document.querySelectorAll('.service-stage')];
  serviceStages.forEach(currentStage => {
    currentStage.querySelector('summary').addEventListener('click', () => {
      if (currentStage.open) return;
      serviceStages.forEach(otherStage => {
        if (otherStage !== currentStage) otherStage.open = false;
      });
    });
  });
}

initializeServiceAccordion();
