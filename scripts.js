document.addEventListener('DOMContentLoaded', function () {

  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showError(message) {
    alert('Ошибка ' + message);
  }

  // notify send to telegram 
  async function sendToTelegram(text) {
    try {
      const response = await fetch('/send-telegram.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!response.ok) {
        throw new Error('Ошибка сервера: ' + response.status);
      }
    } catch (err) {
      console.error('Ошибка отправки:', err);
      showError('Не удалось отправить заявку. Попробуйте позже.');
    }
  }

  const header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.background = window.scrollY > 20 ? 'rgba(251,249,247,.97)' : 'rgba(251,249,247,.85)';
      header.style.boxShadow = window.scrollY > 20 ? '0 4px 20px rgba(0,0,0,.05)' : 'none';
    });
  }

  // animations
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '200px 0px'
    });
    revealEls.forEach(el => io.observe(el));
  }

  // burger menu
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileClose = document.getElementById('mobileClose');

  function toggleMobileMenu(open) {
    const isOpen = (open !== undefined) ? open : !burger.classList.contains('active');
    burger.classList.toggle('active', isOpen);
    if (mobileNav) mobileNav.classList.toggle('open', isOpen);
    if (mobileOverlay) mobileOverlay.classList.toggle('active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  }

  if (burger && mobileNav) {
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', function () {
      toggleMobileMenu(false);
    });
  }
  if (mobileClose) {
    mobileClose.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMobileMenu(false);
    });
  }
  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggleMobileMenu(false);
      });
    });
  }
  window.addEventListener('resize', function () {
    if (window.innerWidth > 980 && mobileNav && mobileNav.classList.contains('open')) {
      toggleMobileMenu(false);
    }
  });

  // ========== Вкладки "Зоны" ==========
  const tabs = document.querySelectorAll('.zone-tab');
  const panels = document.querySelectorAll('.zone-panel');
  if (tabs.length && panels.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const targetPanel = document.querySelector(`.zone-panel[data-panel="${tab.dataset.zone}"]`);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });
  }

  // ========== Вкладки "Расписание" ==========
  const schedTabs = document.querySelectorAll('.schedule-tab');
  const schedPanels = document.querySelectorAll('.schedule-panel');
  if (schedTabs.length && schedPanels.length) {
    schedTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        schedTabs.forEach(t => t.classList.remove('active'));
        schedPanels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const targetPanel = document.querySelector(`.schedule-panel[data-sched-panel="${tab.dataset.sched}"]`);
        if (targetPanel) targetPanel.classList.add('active');

        const roomKey = tab.dataset.sched;
        const currentOffset = window._currentWeekOffset || 0;
        if (typeof renderScheduleTable === 'function') {
          renderScheduleTable(roomKey, currentOffset);
        }
        window._currentRoomKey = roomKey;
      });
    });
  }

  // filter team members
  const teamFilters = document.querySelectorAll('.team-filter');
  const teamCards = Array.from(document.querySelectorAll('.team-card'));
  const teamCount = document.getElementById('teamCount');

  function updateTeam(filter) {
    teamFilters.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));
    let visible = 0;
    teamCards.forEach((card) => {
      const show = filter === 'all' || card.dataset.cat === filter;
      card.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    const word = visible === 1 ? 'специалист' : (visible >= 2 && visible <= 4 ? 'специалиста' : 'специалистов');
    if (teamCount) teamCount.innerHTML = `<b>${visible}</b> ${word} клуба`;
  }

  if (teamFilters.length && teamCards.length) {
    teamFilters.forEach(btn => btn.addEventListener('click', () => updateTeam(btn.dataset.filter)));
  }

  // panel for staff members
  const staffOverlay = document.getElementById('staffPanelOverlay');
  const staffPhoto = document.getElementById('staffPanelPhoto');
  const staffTag = document.getElementById('staffPanelTag');
  const staffName = document.getElementById('staffPanelName');
  const staffRole = document.getElementById('staffPanelRole');
  const staffDesc = document.getElementById('staffPanelDesc');
  const staffCloseBtn = document.getElementById('staffPanelClose');

  function openStaffPanel(card) {
    const name = card.querySelector('h3')?.textContent.trim() || '';
    const role = card.querySelector('span:not(.team-tag)')?.textContent.trim() || '';
    const tag = card.querySelector('.team-tag')?.textContent.trim() || '';
    const desc = (card.dataset.desc || '').trim();
    const imgEl = card.querySelector('.team-photo img');

    staffName.textContent = name;
    staffRole.textContent = role;
    staffTag.textContent = tag;

    if (imgEl) {
      staffPhoto.src = imgEl.src;
      staffPhoto.alt = name;
      staffPhoto.style.display = 'block';
    } else {
      staffPhoto.style.display = 'none';
    }

    if (desc) {
      staffDesc.innerHTML = desc;
      staffDesc.classList.remove('empty');
    } else {
      staffDesc.textContent = 'Описание пока не добавлено.';
      staffDesc.classList.add('empty');
    }

    staffOverlay.classList.add('open');
    document.body.classList.add('modal-open');
  }

  function closeStaffPanel() {
    document.body.classList.remove('modal-open');
    staffOverlay.classList.remove('open');
  }

  if (staffOverlay && staffCloseBtn) {
    teamCards.forEach(card => card.addEventListener('click', () => openStaffPanel(card)));
    staffCloseBtn.addEventListener('click', closeStaffPanel);
    staffOverlay.addEventListener('click', (e) => {
      if (e.target === staffOverlay) closeStaffPanel();
    });
  }

  // form for massage booking
  const massageForm = document.getElementById('massageForm');
  const massageSuccess = document.getElementById('massageSuccess');
  if (massageForm) {
    massageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('mName')?.value.trim() || '';
      const phone = document.getElementById('mPhone')?.value.trim() || '';
      const type = document.getElementById('mType')?.value || '';

      const text = [
        '<b>Запись на массаж</b>',
        `<b>Имя:</b> ${name}`,
        `<b>Телефон:</b> ${phone}`,
        `<b>Вид массажа:</b> ${type}`
      ].join('\n');

      await sendToTelegram(text);

      if (massageSuccess) massageSuccess.style.display = 'block';
      massageForm.querySelector('button').disabled = true;
    });
  }

  // modal for lesson details
  const overlay = document.getElementById('modalOverlay');
  const openModalBtn = document.getElementById('openModalBtn');
  const modalClose = document.getElementById('modalClose');

  if (overlay && openModalBtn && modalClose) {
    openModalBtn.addEventListener('click', () => overlay.classList.add('open'));
    modalClose.addEventListener('click', () => overlay.classList.remove('open'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  }

  // callback form
  const callbackForm = document.getElementById('callbackForm');
  if (callbackForm) {
    callbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('cbName')?.value.trim() || '';
      const phone = document.getElementById('cbPhone')?.value.trim() || '';

      const text = [
        '<b>Заказ обратного звонка</b>',
        `<b>Имя:</b> ${name}`,
        `<b>Телефон:</b> ${phone}`
      ].join('\n');

      await sendToTelegram(text);

      const btn = callbackForm.querySelector('button[type="submit"]');
      const success = document.getElementById('callbackSuccess');
      if (btn) btn.disabled = true;
      if (success) success.style.display = 'block';
    });
  }

  function normalizeLessonTitle(title) {
    if (!title) return '';
    const t = String(title).trim().toLowerCase();

    if (['всякие', 'разные'].includes(t)) return 'Разные занятия';

    const aliases = {
      'открытый зал': 'Открытый зал',
      'силовая тренировка': 'Силовая',
      'силовая': 'Силовая',
      'функционал': 'Функциональный тренинг',
      'функциональный тренинг': 'Функциональный тренинг',
      'бокс': 'Бокс',
      'боевая тренировка': 'Боевое самбо',
      'боевое самбо': 'Боевое самбо',
      'детская': 'Детская группа',
      'детская группа': 'Детская группа',
      'йога': 'Йога и растяжка',
      'растяжка': 'Йога и растяжка',
      'йога и растяжка': 'Йога и растяжка',
      'аэробика': 'Аэробика',
      'танцы': 'Танцы'
    };

    if (t.includes('коммерческий') || t.includes('commercial')) return title.trim();

    return aliases[t] || title.trim();
  }

  
  const lessonInfoMap = {
    'Открытый зал': {
      level: 'Любой уровень',
      description: 'Открытый зал для самостоятельной работы на силовых и кардио-площадках, с возможностью выбрать комфортную нагрузку под свой темп.',
      zone: 'Тренажёрный зал'
    },
    'Силовая': {
      level: 'Продвинутый',
      description: 'Силовая тренировка с базовыми упражнениями и акцентом на технику, силу и уверенность в движении.',
      zone: 'Тренажёрный зал'
    },
    'Функциональный тренинг': {
      level: 'Средний',
      description: 'Функциональный класс для работы над общей выносливостью, балансом, стабильностью и силовой подготовкой.',
      zone: 'Тренажёрный зал'
    },
    'Бокс': {
      level: 'Начальный и средний',
      description: 'Групповой урок по боксу: техника ударов, скорость, координация и базовая работа в стойке.',
      zone: 'Единоборства'
    },
    'Боевое самбо': {
      level: 'Средний',
      description: 'Занятие по боевому самбо, ориентированное на контактную технику, защиту, стойку и развитие силы.',
      zone: 'Единоборства'
    },
    'Детская группа': {
      level: 'Дети',
      description: 'Развивающая детская программа по единоборствам, где важны дисциплина, моторика и чувство ритма.',
      zone: 'Единоборства'
    },
    'Йога и растяжка': {
      level: 'Любой уровень',
      description: 'Занятие по гибкости и восстановлению: дыхание, баланс, мягкая работа с мышцами и суставами.',
      zone: 'Танцы и Mind&Body'
    },
    'Аэробика': {
      level: 'Средний',
      description: 'Кардионагрузка в ритме с упражнениями на координацию, выносливость и общий тонус.',
      zone: 'Танцы и Mind&Body'
    },
    'Танцы': {
      level: 'Любой уровень',
      description: 'Групповое танцевальное занятие с ритмом, пластикой, поддержкой тренера и хорошим настроением.',
      zone: 'Танцы и Mind&Body'
    },
    'Пилатес': {
      level: 'Любой уровень',
      description: 'Пилатес — система упражнений для укрепления мышц кора, улучшения гибкости и осанки. Подходит для любого уровня подготовки.',
      zone: 'Танцы и Mind&Body'
    },
    'Кроссфит': {
      level: 'Средний и продвинутый',
      description: 'Высокоинтенсивный функциональный тренинг, сочетающий элементы тяжелой атлетики, гимнастики и кардио. Развивает силу, выносливость и скорость.',
      zone: 'Тренажёрный зал'
    },
    'Стретчинг': {
      level: 'Любой уровень',
      description: 'Комплекс упражнений на растяжку всех групп мышц. Улучшает гибкость, снижает мышечное напряжение, способствует восстановлению после тренировок.',
      zone: 'Танцы и Mind&Body'
    },
    'TRX': {
      level: 'Средний',
      description: 'Тренировка с использованием подвесных петель TRX. Развивает баланс, координацию и силу всего тела за счёт работы с собственным весом.',
      zone: 'Тренажёрный зал'
    },
    'Zumba': {
      level: 'Любой уровень',
      description: 'Зажигательный танцевальный фитнес на основе латиноамериканских ритмов. Отличное кардио и заряд позитива.',
      zone: 'Танцы и Mind&Body'
    },
    'Тайский бокс': {
      level: 'Начальный и средний',
      description: 'Занятия по тайскому боксу с акцентом на технику ударов руками, ногами, локтями и коленями. Развивает выносливость и координацию.',
      zone: 'Единоборства'
    },
    'Детская йога': {
      level: 'Дети',
      description: 'Адаптированная йога для детей: игровые упражнения на гибкость, внимание и расслабление. Помогает снять стресс и улучшить концентрацию.',
      zone: 'Танцы и Mind&Body'
    },
    'Кардио-тренировка': {
      level: 'Любой уровень',
      description: 'Интенсивная кардионагрузка на беговых дорожках, велотренажёрах и эллипсах. Укрепляет сердечно-сосудистую систему и сжигает калории.',
      zone: 'Тренажёрный зал'
    },
    'Групповая силовая': {
      level: 'Средний',
      description: 'Силовая тренировка в группе с использованием гантелей, штанг и собственного веса. Направлена на увеличение мышечной массы и силы.',
      zone: 'Тренажёрный зал'
    },
    'ОФП (общая физическая подготовка)': {
      level: 'Любой уровень',
      description: 'Занятия по общей физической подготовке с акцентом на развитие силы, выносливости, гибкости и координации движений.',
      zone: 'Тренажёрный зал'
    }
  };

  const trainerPhotoMap = {};

  function buildTrainerPhotoMap() {
    document.querySelectorAll('.team-card').forEach(card => {
      const nameEl = card.querySelector('h3');
      const imgEl = card.querySelector('.team-photo img');
      if (nameEl && imgEl) {
        const fullName = nameEl.textContent.trim().replace(/\s+/g, ' ');
        const photoSrc = imgEl.src;
        trainerPhotoMap[fullName] = photoSrc;

        const parts = fullName.split(' ');
        if (parts.length >= 2) {
          trainerPhotoMap[parts[0] + ' ' + parts[1]] = photoSrc;
          trainerPhotoMap[parts[0] + ' ' + parts[1][0] + '.'] = photoSrc;
          trainerPhotoMap[parts[0]] = photoSrc;
          trainerPhotoMap[parts[1] + ' ' + parts[0]] = photoSrc;
          trainerPhotoMap[parts[1] + ' ' + parts[0][0] + '.'] = photoSrc;
        }
      }
    });
    console.log('Загружено фото тренеров:', Object.keys(trainerPhotoMap).length);
  }

  function bindScheduleLessonCells() {
    const scheduleTables = document.querySelectorAll('.schedule-table');
    scheduleTables.forEach(table => {
      table.querySelectorAll('.lesson-item').forEach(item => {
        if (item.dataset.bound === 'true') return;
        item.dataset.bound = 'true';

        item.classList.add('schedule-lesson-cell');
        item.setAttribute('tabindex', '0');

        item.addEventListener('click', function (e) {
          e.stopPropagation();

          const title = this.dataset.title || 'Занятие';
          const trainer = this.dataset.trainer || 'Клуб';
          const duration = this.dataset.duration || '';
          const room = this.dataset.room || 'Клуб';
          const desc = this.dataset.desc || 'Информация о занятии пока не добавлена.';

          const td = this.closest('td');
          const row = td.closest('tr');
          const time = row.querySelector('td.time')?.textContent.trim() || '';
          const colIndex = td.cellIndex;
          const header = table.querySelector('thead tr th:nth-child(' + (colIndex + 1) + ')');
          const day = header ? header.textContent.trim() : '';
          const date = header ? header.dataset.date || '' : '';

          const panel = td.closest('[data-sched-panel]');
          const zoneMap = {
            'gym': 'Тренажёрный зал',
            'fight': 'Единоборства',
            'dance': 'Танцы и Mind&Body'
          };
          const zone = zoneMap[panel?.dataset.schedPanel] || room || 'Клуб';

          const info = lessonInfoMap[title] || {};
          const finalDesc = desc || info.description || 'Информация о занятии доступна по запросу у администратора.';

          fillLessonModal({
            zone: zone,
            title: title,
            day: day,
            date: date,
            time: time,
            trainer: trainer,
            level: info.level || 'Любой уровень',
            duration: duration || '60 мин',
            desc: finalDesc,
            photo: trainerPhotoMap[trainer] || ''
          });
        });

        item.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
          }
        });
      });
    });
  }

  let scheduleByRoom = {};

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function formatDateRange(weekStart) {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const options = { day: 'numeric', month: 'short' };
    return `${start.toLocaleDateString('ru-RU', options)} – ${end.toLocaleDateString('ru-RU', options)}`;
  }

  function updateWeekRange(weekStart, offset) {
    const el = document.getElementById('weekRange');
    if (el) {
      const range = formatDateRange(weekStart);
      const suffix = offset === 0 ? ' (текущая)' : '';
      el.textContent = range + suffix;
    }
  }

  function updateNavButtons(offset) {
    const prevBtn = document.getElementById('prevWeekBtn');
    const nextBtn = document.getElementById('nextWeekBtn');
    if (!prevBtn || !nextBtn) return;

    const allDates = Object.keys(window.scheduleByRoom[window._currentRoomKey] || {}).sort();
    if (!allDates.length) {
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }
    const today = new Date();
    const currentMonday = getMonday(today);
    const minDate = new Date(allDates[0] + 'T00:00:00');
    const maxDate = new Date(allDates[allDates.length - 1] + 'T00:00:00');
    const minMonday = getMonday(minDate);
    const maxMonday = getMonday(maxDate);

    const currentWeekStart = new Date(currentMonday);
    const currentWeekStartOffset = new Date(currentMonday);
    currentWeekStartOffset.setDate(currentWeekStartOffset.getDate() + offset * 7);

    const prevWeekStart = new Date(currentWeekStartOffset);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const nextWeekStart = new Date(currentWeekStartOffset);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);

    prevBtn.disabled = prevWeekStart < minMonday;
    const maxAllowed = new Date(Math.min(maxMonday.getTime(), currentMonday.getTime()));
    nextBtn.disabled = nextWeekStart > maxAllowed;
  }


  function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function renderScheduleTable(roomKey, weekOffset = 0) {
  const panel = document.querySelector(`.schedule-panel[data-sched-panel="${roomKey}"]`);
  if (!panel) return;
  const wrap = panel.querySelector('.schedule-table-wrap');
  if (!wrap) return;

  const data = window.scheduleByRoom[roomKey];
  if (!data) {
    wrap.innerHTML = '<p class="no-schedule">Нет занятий</p>';
    return;
  }

  const allDates = Object.keys(data).sort();
  if (!allDates.length) {
    wrap.innerHTML = '<p class="no-schedule">Нет занятий</p>';
    return;
  }

  const today = new Date();
  const currentMonday = getMonday(today);
  const weekStart = new Date(currentMonday);
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weekStartStr = formatDateLocal(weekStart);
  const weekEndStr = formatDateLocal(weekEnd);

  const weekDates = allDates.filter(dateStr => {
    return dateStr >= weekStartStr && dateStr <= weekEndStr;
  });

  if (!weekDates.length) {
    wrap.innerHTML = '<p class="no-schedule">Нет занятий на эту неделю</p>';
    updateWeekRange(weekStart, weekOffset);
    updateNavButtons(weekOffset);
    return;
  }

  // Collect all unique times across the week
  const allTimes = new Set();
  weekDates.forEach(date => {
    Object.keys(data[date]).forEach(time => allTimes.add(time));
  });
  const sortedTimes = Array.from(allTimes).sort();

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = formatDateLocal(d);
    weekDays.push({ dayName: daysOfWeek[i], date: dateStr, fullDate: d });
  }

  let tableHtml = '<table class="schedule-table"><thead><tr><th>День</th>';
  sortedTimes.forEach(time => {
    tableHtml += `<th>${escapeHtml(time)}</th>`;
  });
  tableHtml += '</tr></thead><tbody>';

  weekDays.forEach((wd) => {
    const dateStr = wd.date;
    const dayName = wd.dayName;
    const dayData = data[dateStr] || {};
    tableHtml += `<tr><td class="day-name">${dayName}</td>`;
    sortedTimes.forEach(time => {
      const lessons = dayData[time] || [];
      if (lessons.length) {
        tableHtml += `<td data-time="${escapeHtml(time)}">`;
        lessons.forEach(l => {
          const title = escapeHtml(l.title || '');
          const trainer = escapeHtml(l.trainer || 'Клуб');
          const desc = escapeHtml(l.desc || '');
          const duration = escapeHtml(l.duration || '');
          const room = escapeHtml(l.zone || '');
          tableHtml += `<span class="lesson-item" data-title="${title}" data-trainer="${trainer}" data-duration="${duration}" data-room="${room}" data-desc="${desc}">
                          <span class="lesson-title">${title}</span>
                          <span class="lesson-trainer">${trainer}</span>
                        </span>`;
        });
        tableHtml += `</td>`;
      } else {
        tableHtml += `<td data-time="${escapeHtml(time)}">—</td>`;
      }
    });
    tableHtml += '</tr>';
  });

  tableHtml += '</tbody></table>';
  wrap.innerHTML = tableHtml;

  updateWeekRange(weekStart, weekOffset);
  updateNavButtons(weekOffset);
  bindScheduleLessonCells();

  window._currentRoomKey = roomKey;
  window._currentWeekOffset = weekOffset;
}


  async function loadScheduleFromApi() {
    const apiUrl = 'https://reservi.ru/api-fit1c/json/v2/';
    const bodyParams = new URLSearchParams({
      method: 'getFitCalendar',
      'params[salonId]': '',
      'params[calendarType]': '',
      'params[getAll]': 'Y',
      'params[window_width]': window.innerWidth,
      'params[getUser]': 'false',
      'params[token_master]': '',
      'params[token]': '',
      'params[utm][referrer]': '',
      'params[utm][source]': 'https://ruseansport.ru/schedule/',
      'params[utm][_ym_uid]': '1786102426816413536',
      isLK: 'false',
      api_key: '6230cb43-441c-4dab-9563-96b3d5f2ddf8',
      lang: 'ru',
      lang_cookie: '',
      host_type: ''
    }).toString();

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: bodyParams
      });

      if (!response.ok) {
        console.warn('API ответил неуспешным статусом:', response.status);
        showError('Не удалось загрузить расписание. Попробуйте позже.');
        return;
      }

      const json = await response.json();
      if (json.isError) {
        console.warn('Ошибка API:', json.Message);
        showError('Ошибка при загрузке расписания: ' + json.Message);
        return;
      }

      const debugClasses = json._debug?.classes;
      if (!debugClasses || !debugClasses.length) {
        console.warn('Нет отладочных данных занятий');
        showError('Не удалось получить данные расписания.');
        return;
      }

      let allClasses = [];
      debugClasses.forEach(log => {
        if (log.data_resp && log.data_resp.data) {
          allClasses = allClasses.concat(log.data_resp.data);
        }
      });

      if (!allClasses.length) {
        console.warn('Нет занятий в _debug.classes');
        showError('Расписание временно недоступно.');
        return;
      }

      function parseStartDate(startDate) {
        const [datePart, timePart] = startDate.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const jsDate = new Date(year, month - 1, day);
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const dayOfWeek = days[jsDate.getDay()];
        const time = timePart.substring(0, 5);
        return { day: dayOfWeek, time, date: datePart };
      }

      window.scheduleByRoom = {};

      allClasses.forEach(item => {
        const roomTitle = item.room?.title || '';
        const serviceTitle = item.service?.title || '';
        const employeeName = item.employee?.name || '';
        const startDate = item.start_date;
        if (!startDate || !serviceTitle) return;

        const { day, time, date } = parseStartDate(startDate);
        if (!day || !time) return;

        let roomKey = roomTitle;
        if (roomTitle.includes('Зал групповых программ') || roomTitle.includes('Бассейн')) {
          roomKey = 'dance';
        } else if (roomTitle.includes('Тренажёрный зал')) {
          roomKey = 'gym';
        } else if (roomTitle.includes('Зал единоборств')) {
          roomKey = 'fight';
        } else {
          roomKey = 'other';
        }

        if (!window.scheduleByRoom[roomKey]) window.scheduleByRoom[roomKey] = {};
        if (!window.scheduleByRoom[roomKey][date]) window.scheduleByRoom[roomKey][date] = {};
        if (!window.scheduleByRoom[roomKey][date][time]) window.scheduleByRoom[roomKey][date][time] = [];

        const normalizedName = normalizeLessonTitle(serviceTitle);
        const rawDuration = item.duration || item.duration_minutes || item.service?.duration || null;
        const durationMinutes = Number(rawDuration);

        window.scheduleByRoom[roomKey][date][time].push({
          title: normalizedName,
          trainer: employeeName || 'Клуб',
          duration: Number.isFinite(durationMinutes) ? `${durationMinutes} мин` : '',
          desc: lessonInfoMap[normalizedName]?.description || 'Информация о занятии пока не добавлена.',
          zone: roomTitle || 'Клуб'
        });
      });

      document.getElementById('prevWeekBtn')?.addEventListener('click', function () {
        const newOffset = (window._currentWeekOffset || 0) - 1;
        renderScheduleTable(window._currentRoomKey || 'gym', newOffset);
      });

      document.getElementById('nextWeekBtn')?.addEventListener('click', function () {
        const newOffset = (window._currentWeekOffset || 0) + 1;
        renderScheduleTable(window._currentRoomKey || 'gym', newOffset);
      });

      const activeTab = document.querySelector('.schedule-tab.active');
      const initialRoom = activeTab ? activeTab.dataset.sched : 'gym';
      renderScheduleTable(initialRoom, 0);

    } catch (error) {
      console.error('Ошибка при загрузке расписания:', error);
      showError('Не удалось загрузить расписание. Попробуйте позже.');
    }
  }

  loadScheduleFromApi();

  function applyPhoneMask(input) {
    if (!input) return;
    input.addEventListener('input', function () {
      let value = input.value.replace(/\D/g, '');
      if (value.startsWith('8')) value = '7' + value.slice(1);
      if (!value.startsWith('7')) value = '7' + value;
      value = value.substring(0, 11);

      let formatted = '+7';
      if (value.length > 1) formatted += ' (' + value.substring(1, 4);
      if (value.length >= 4) formatted += ') ' + value.substring(4, 7);
      if (value.length >= 7) formatted += '-' + value.substring(7, 9);
      if (value.length >= 9) formatted += '-' + value.substring(9, 11);

      input.value = formatted;
    });

    input.addEventListener('focus', function () {
      if (input.value === '') input.value = '+7 (';
    });

    input.addEventListener('blur', function () {
      if (input.value === '+7 (' || input.value === '+7') input.value = '';
    });
  }

  applyPhoneMask(document.getElementById('mPhone'));
  const modalPhone = document.querySelector('#modalOverlay input[type="tel"]');
  if (modalPhone) applyPhoneMask(modalPhone);

  const serviceCards = document.querySelectorAll('.service-card[data-service]');
  const serviceModalOverlay = document.getElementById('serviceModalOverlay');
  const serviceModalTitle = document.getElementById('serviceModalTitle');
  const serviceModalDesc = document.getElementById('serviceModalDesc');
  const serviceModalImage = document.getElementById('serviceModalImage');
  const serviceModalClose = document.getElementById('serviceModalClose');

  if (serviceCards.length && serviceModalOverlay) {
    serviceCards.forEach(card => {
      card.addEventListener('click', () => {
        const title = card.dataset.title || card.querySelector('h3')?.textContent || '';
        const desc = card.dataset.desc || card.querySelector('p')?.textContent || '';
        const image = card.dataset.image || '';

        if (serviceModalTitle) serviceModalTitle.textContent = title;
        if (serviceModalDesc) serviceModalDesc.textContent = desc;
        if (serviceModalImage) {
          serviceModalImage.src = image;
          serviceModalImage.alt = title;
        }

        serviceModalOverlay.classList.add('open');
      });
    });
  }

  if (serviceModalClose) {
    serviceModalClose.addEventListener('click', () => {
      serviceModalOverlay.classList.remove('open');
    });
  }
  if (serviceModalOverlay) {
    serviceModalOverlay.addEventListener('click', (e) => {
      if (e.target === serviceModalOverlay) serviceModalOverlay.classList.remove('open');
    });
  }

  // modal for lesson details
  const lessonModalOverlay = document.getElementById('lessonModalOverlay');
  const lessonModalTitle = document.getElementById('lessonModalTitle');
  const lessonModalDate = document.getElementById('lessonModalDate');
  const lessonModalDayTime = document.getElementById('lessonModalDayTime');
  const lessonModalDuration = document.getElementById('lessonModalDuration');
  const lessonModalTrainer = document.getElementById('lessonModalTrainer');
  const lessonModalRoom = document.getElementById('lessonModalRoom');
  const lessonModalDesc = document.getElementById('lessonModalDesc');
  const lessonModalClose = document.getElementById('lessonModalClose');
  const lessonModalPhoto = document.getElementById('lessonModalPhoto');

  function fillLessonModal(data) {
    const rawTitle = data.title || 'Занятие';
    const modalTitle = rawTitle.replace(/\s*\((коммерческий\s+класс|commercial\s+class)\)/i, '').trim();
    const normalizedTrainer = (data.trainer || '').replace(/\s+/g, ' ').trim();

    lessonModalTitle.textContent = modalTitle;
    lessonModalDate.textContent = formatDateForModal(data.date) || data.day || '';
    lessonModalDayTime.textContent = data.time || '';
    lessonModalDuration.textContent = data.duration || '60 мин';
    lessonModalTrainer.textContent = data.trainer || 'Клуб';
    lessonModalRoom.textContent = data.zone || 'Клуб';
    lessonModalDesc.textContent = data.desc || 'Информация о занятии пока не добавлена.';

    const photo = trainerPhotoMap[normalizedTrainer] || '';
    if (photo) {
      lessonModalPhoto.src = photo;
      lessonModalPhoto.alt = data.trainer || modalTitle || 'Тренер';
      lessonModalPhoto.style.display = 'block';
    } else {
      lessonModalPhoto.src = '';
      lessonModalPhoto.alt = '';
      lessonModalPhoto.style.display = 'none';
    }

    lessonModalOverlay.classList.add('open');
  }

  function formatDateForModal(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return dateString;
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  if (lessonModalClose) {
    lessonModalClose.addEventListener('click', () => {
      lessonModalOverlay.classList.remove('open');
    });
  }
  if (lessonModalOverlay) {
    lessonModalOverlay.addEventListener('click', (e) => {
      if (e.target === lessonModalOverlay) lessonModalOverlay.classList.remove('open');
    });
  }

  updateTeam('all');
  buildTrainerPhotoMap();

  const galleryData = {
    gym: {
      title: 'Тренажёрный зал',
      images: [
        'https://ruseansport.ru/upload/iblock/8f6/gym1.jpg',
        'https://ruseansport.ru/upload/iblock/ed8/gym2.jpg',
        'https://ruseansport.ru/upload/iblock/d17/gym3.jpg',
        'https://ruseansport.ru/upload/iblock/d1c/gym4.jpg',
        'https://ruseansport.ru/upload/iblock/0e3/gym5.jpg',
        'https://ruseansport.ru/upload/iblock/6a1/gym6.jpg',
        'https://ruseansport.ru/upload/iblock/857/gym7.jpg',
        'https://ruseansport.ru/upload/iblock/28b/gym8.jpg'
      ]
    },
    dance: {
      title: 'Залы групповых занятий',
      images: [
        'https://ruseansport.ru/upload/iblock/80b/hall1.jpg',
        'https://ruseansport.ru/upload/iblock/232/hall2.jpg',
        'https://ruseansport.ru/upload/iblock/ce5/hall3.jpg',
        'https://ruseansport.ru/upload/iblock/9b0/hall4.jpg',
        'https://ruseansport.ru/upload/iblock/085/hall21.jpg',
        'https://ruseansport.ru/upload/iblock/681/hall22.jpg',
        'https://ruseansport.ru/upload/iblock/110/hall23.jpg',
        'https://ruseansport.ru/upload/iblock/646/hall24.jpg'
      ]
    },
    fight: {
      title: 'Зал единоборств',
      images: [
        'https://ruseansport.ru/upload/iblock/271/combat1.jpg',
        'https://ruseansport.ru/upload/iblock/016/combat2.jpg',
        'https://ruseansport.ru/upload/iblock/dac/combat3.jpg',
        'https://ruseansport.ru/upload/iblock/1c5/combat4.jpg'
      ]
    },
    reception: {
      title: 'Ресепшн',
      images: [
        'https://ruseansport.ru/upload/iblock/1e7/reception1.jpg',
        'https://ruseansport.ru/upload/iblock/3c1/reception2.jpg',
        'https://ruseansport.ru/upload/iblock/5de/reception3.jpg',
        'https://ruseansport.ru/upload/iblock/9c6/reception4.jpg'
      ]
    },
    spa: {
      title: 'СПА комплекс',
      images: [
        'https://ruseansport.ru/upload/iblock/c06/swim1.jpg',
        'https://ruseansport.ru/upload/iblock/49f/swim2.jpg',
        'https://ruseansport.ru/upload/iblock/651/swim3.jpg',
        'https://ruseansport.ru/upload/iblock/c3c/swim4.jpg'
      ]
    },
    massage: {
      title: 'Массажный кабинет',
      images: [
        'https://ruseansport.ru/upload/iblock/6b3/massage1.jpg',
        'https://ruseansport.ru/upload/iblock/f39/massage2.jpg',
        'https://ruseansport.ru/upload/iblock/732/massage3.jpg',
        'https://ruseansport.ru/upload/iblock/bd6/massage4.jpg'
      ]
    },
    hamam: {
      title: 'Турецкая баня (Хамам)',
      images: [
        'https://ruseansport.ru/upload/iblock/2b1/hamam1.jpg',
        'https://ruseansport.ru/upload/iblock/c6c/hamam2.jpg',
        'https://ruseansport.ru/upload/iblock/fef/hamam3.jpg',
        'https://ruseansport.ru/upload/iblock/310/hamam4.jpg'
      ]
    },
    sauna: {
      title: 'Финская сауна',
      images: [
        'https://ruseansport.ru/upload/iblock/1a3/sauna1.jpg',
        'https://ruseansport.ru/upload/iblock/a72/sauna2.jpg',
        'https://ruseansport.ru/upload/iblock/eac/sauna3.jpg',
        'https://ruseansport.ru/upload/iblock/2e6/sauna4.jpg'
      ]
    }
  };

// fill gallery placeholders with first images
  document.querySelectorAll('.gallery-item').forEach(item => {
    const galleryName = item.dataset.gallery;
    const gallery = galleryData[galleryName];
    if (gallery && gallery.images && gallery.images.length) {
      const firstImage = gallery.images[0];
      const ph = item.querySelector('.ph');
      if (ph) {
        ph.innerHTML = '';
        ph.style.backgroundImage = `url(${firstImage})`;
        ph.style.backgroundSize = 'cover';
        ph.style.backgroundPosition = 'center';
        ph.style.position = 'relative';
      }
    }
  });

  const galleryModal = document.getElementById('galleryModal');
  const galleryModalImage = document.getElementById('galleryModalImage');
  const galleryModalImageNext = document.getElementById('galleryModalImageNext');
  let isAnimating = false;
  const galleryModalClose = document.getElementById('galleryModalClose');
  const galleryModalPrev = document.getElementById('galleryModalPrev');
  const galleryModalNext = document.getElementById('galleryModalNext');
  const galleryModalCounter = document.getElementById('galleryModalCounter');

  if (galleryModalImage) {
    galleryModalImage.style.transition = 'opacity 0.3s ease';
    galleryModalImage.style.opacity = '0';

    galleryModalImage.addEventListener('load', function () {
      this.style.opacity = '1';
    });

    if (galleryModalImage.complete) {
      galleryModalImage.style.opacity = '1';
    }
  }

  let currentGallery = null;
  let currentGalleryIndex = 0;

  function showGalleryImage(direction) {
    if (!currentGallery) return;
    const images = currentGallery.images;
    if (!images.length) return;

    if (direction === undefined) {
      galleryModalImage.src = images[currentGalleryIndex];
      galleryModalImage.alt = `${currentGallery.title} — фото ${currentGalleryIndex + 1}`;
      galleryModalImage.style.transform = 'translate(-50%, -50%) scale(1)';
      galleryModalImage.style.opacity = '1';
      galleryModalImageNext.style.display = 'none';
      updateCounter();
      return;
    }

    const currentIndex = currentGalleryIndex;
    const nextIndex = (direction === 'next')
      ? (currentIndex + 1) % images.length
      : (currentIndex - 1 + images.length) % images.length;

    galleryModalImageNext.src = images[nextIndex];
    galleryModalImageNext.alt = `${currentGallery.title} — фото ${nextIndex + 1}`;
    galleryModalImageNext.style.display = 'block';
    galleryModalImageNext.style.opacity = '1';

    const offset = (direction === 'next') ? '100%' : '-100%';
    galleryModalImageNext.style.transform = `translate(calc(-50% + ${offset}), -50%) scale(1)`;

    galleryModalImage.style.transform = 'translate(-50%, -50%) scale(1)';
    galleryModalImage.style.opacity = '1';

    isAnimating = true;

    requestAnimationFrame(() => {
      const currentOffset = (direction === 'next') ? '-100%' : '100%';
      galleryModalImage.style.transform = `translate(calc(-50% + ${currentOffset}), -50%) scale(1)`;
      galleryModalImage.style.opacity = '0.6';

      galleryModalImageNext.style.transform = 'translate(-50%, -50%) scale(1)';
      galleryModalImageNext.style.opacity = '1';

      setTimeout(() => {
        galleryModalImage.src = images[nextIndex];
        galleryModalImage.alt = `${currentGallery.title} — фото ${nextIndex + 1}`;
        galleryModalImage.style.transform = 'translate(-50%, -50%) scale(1)';
        galleryModalImage.style.opacity = '1';
        galleryModalImageNext.style.display = 'none';
        galleryModalImageNext.style.transform = 'translate(-50%, -50%) scale(1)';

        currentGalleryIndex = nextIndex;
        updateCounter();
        isAnimating = false;
      }, 400);
    });
  }

  function updateCounter() {
    if (galleryModalCounter) {
      galleryModalCounter.textContent = `${currentGalleryIndex + 1} / ${currentGallery.images.length}`;
    }
  }

  function openGallery(galleryName, startIndex = 0) {
    const gallery = galleryData[galleryName];
    if (!gallery || !gallery.images.length) {
      console.warn('Галерея не найдена:', galleryName);
      return;
    }
    currentGallery = gallery;
    currentGalleryIndex = Math.max(0, Math.min(startIndex, gallery.images.length - 1));
    galleryModalImage.src = currentGallery.images[currentGalleryIndex];
    galleryModalImage.alt = `${currentGallery.title} — фото ${currentGalleryIndex + 1}`;
    galleryModalImage.style.opacity = '1';
    galleryModalImage.style.transform = 'translate(-50%, -50%) scale(1)';
    galleryModalImageNext.style.display = 'none';
    updateCounter();
    if (galleryModal) {
      galleryModal.classList.add('open');
      document.body.classList.add('modal-open');
    }
  }

  function closeGallery() {
    if (galleryModal) {
      galleryModal.classList.remove('open');
      document.body.classList.remove('modal-open');
    }
    setTimeout(() => {
      galleryModalImage.src = '';
      galleryModalImage.style.opacity = '0';
      galleryModalImageNext.style.display = 'none';
      galleryModalImageNext.src = '';
    }, 300);
    currentGallery = null;
    isAnimating = false;
  }

  function nextGalleryImage() {
    if (!currentGallery || isAnimating) return;
    showGalleryImage('next');
  }

  function prevGalleryImage() {
    if (!currentGallery || isAnimating) return;
    showGalleryImage('prev');
  }

  if (galleryModal) {
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', (event) => {
        event.preventDefault();
        const galleryName = item.dataset.gallery;
        openGallery(galleryName);
      });
    });

    if (galleryModalNext) {
      galleryModalNext.addEventListener('click', (event) => {
        event.stopPropagation();
        nextGalleryImage();
      });
    }
    if (galleryModalPrev) {
      galleryModalPrev.addEventListener('click', (event) => {
        event.stopPropagation();
        prevGalleryImage();
      });
    }
    if (galleryModalClose) {
      galleryModalClose.addEventListener('click', closeGallery);
    }
    galleryModal.addEventListener('click', (event) => {
      if (event.target === galleryModal) closeGallery();
    });

    document.addEventListener('keydown', (event) => {
      if (!galleryModal.classList.contains('open')) return;
      if (event.key === 'Escape') closeGallery();
      if (event.key === 'ArrowRight') nextGalleryImage();
      if (event.key === 'ArrowLeft') prevGalleryImage();
    });

    let startX = 0;
    let isDragging = false;
    const galleryModalEl = document.getElementById('galleryModal');

    if (galleryModalEl) {
      const content = galleryModalEl.querySelector('.gallery-modal-content');
      if (content) {

        content.addEventListener('pointerdown', function (e) {
          if (e.target.closest('.gallery-modal-prev, .gallery-modal-next, .gallery-modal-close')) return;
          startX = e.clientX;
          isDragging = true;
          e.preventDefault();
        });

        content.addEventListener('pointerup', function (e) {
          if (!isDragging) return;
          isDragging = false;
          const diff = startX - e.clientX;
          const threshold = 50;
          if (Math.abs(diff) > threshold) {
            if (diff > 0) {
              nextGalleryImage();
            } else {
              prevGalleryImage();
            }
          }
        });

        content.addEventListener('pointerleave', function () {
          isDragging = false;
        });

        content.addEventListener('dragstart', function (e) {
          e.preventDefault();
        });
      }
    }
  }

});