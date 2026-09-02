(() => {
  'use strict';

  const PEOPLE = {
    '哇哇哇': {
      file: './assets/invitations/wawawa.webp',
      aliases: ['哇哇哇', '陈铎宇', 'cdy', '教练']
    },
    '狗子': {
      file: './assets/invitations/gouzi.webp',
      aliases: ['狗子']
    },
    '咕噜': {
      file: './assets/invitations/gulu.webp',
      aliases: ['咕噜', '巫皖怡', 'wwy']
    },
    '功夫饭': {
      file: './assets/invitations/gongfufan.webp',
      aliases: ['功夫饭', '饭']
    },
    '地瓜': {
      file: './assets/invitations/digua.webp',
      aliases: ['地瓜', '刘俊豪']
    },
    '滑板鸡': {
      file: './assets/invitations/skate-chicken.webp',
      aliases: ['滑板鸡', '赵泽彬', 'zzb']
    },
    '哼哼': {
      file: './assets/invitations/hengheng.webp',
      aliases: ['哼哼', '曾珩', 'zh']
    },
    '羚羊': {
      file: './assets/invitations/antelope.webp',
      aliases: ['羚羊', '李扬', 'goat', '魅魔', 'ly'],
      greeting: '魅魔，你来啦~'
    },
    '泡泡': {
      file: './assets/invitations/bubble.webp',
      aliases: ['泡泡', '张鹏奥', 'zpa']
    },
    '伍广': {
      file: './assets/invitations/wuguang.webp',
      aliases: ['伍广', '功夫胖', '伍伯', '5g', '大伯', 'wg'],
      greeting: '大伯，你来啦~'
    },
    '小如': {
      file: './assets/invitations/xiaoru.webp',
      aliases: ['小如', '孙玉如', 'syr']
    },
    '淤青': {
      file: './assets/invitations/yuqing.webp',
      aliases: ['淤青', '齐刘海', 'yyq', '严雨晴', '老乡'],
      greeting: '老乡，你来啦~'
    },
    '穗穗': {
      file: './assets/invitations/suisui.webp',
      aliases: ['穗穗']
    },
    '章鱼': {
      file: './assets/invitations/octopus.webp',
      aliases: ['章鱼', 'ydc', '尹德驰', '章鱼哥']
    },
    '阿伦': {
      file: './assets/invitations/alun.webp',
      aliases: ['阿伦', '啊伦', '谷翌瑞', 'gyr']
    },
    '姑奶奶': {
      file: './assets/invitations/gunainai.webp',
      aliases: ['姑奶奶', '朱瑾红', '菇', 'zjh']
    },
    'KK': {
      file: './assets/invitations/kk.webp',
      aliases: ['KK', '容世强', 'rsq']
    },
    '泽北': {
      file: './assets/invitations/zebei.webp',
      aliases: ['泽北', '黄宗泽', '陈强', 'cq'],
      greeting: '哟，不是去看库里嘛？'
    }
  };

  const aliasIndex = new Map();

  function normalize(value) {
    return value.normalize('NFKC').trim().toLocaleLowerCase('zh-CN');
  }

  Object.entries(PEOPLE).forEach(([name, person]) => {
    person.aliases.forEach(alias => aliasIndex.set(normalize(alias), name));
  });

  const views = {
    home: document.getElementById('homeView'),
    lookup: document.getElementById('lookupView'),
    success: document.getElementById('successView'),
    notFound: document.getElementById('notFoundView')
  };

  const getInvitationBtn = document.getElementById('getInvitationBtn');
  const nicknameForm = document.getElementById('nicknameForm');
  const nicknameInput = document.getElementById('nicknameInput');
  const inputWrap = document.getElementById('inputWrap');
  const formHint = document.getElementById('formHint');
  const matchingPanel = document.getElementById('matchingPanel');
  const matchingLabel = document.getElementById('matchingLabel');
  const greetingText = document.getElementById('greetingText');
  const invitationImage = document.getElementById('invitationImage');
  const invitationImageButton = document.getElementById('invitationImageButton');
  const retryBtn = document.getElementById('retryBtn');
  const imageModal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const closeModalBtn = document.getElementById('closeModalBtn');

  let currentImage = '';
  let matchingToken = 0;

  function showView(name) {
    Object.values(views).forEach(view => view.classList.remove('is-active'));
    const target = views[name];
    target.classList.add('is-active');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function resetLookup({ keepInput = false } = {}) {
    matchingToken += 1;
    nicknameForm.hidden = false;
    matchingPanel.classList.remove('is-active');
    matchingPanel.setAttribute('aria-hidden', 'true');
    inputWrap.classList.remove('is-scanning');
    greetingText.classList.remove('is-visible');
    greetingText.textContent = '';
    matchingLabel.textContent = 'MATCHING...';
    formHint.textContent = '';
    if (!keepInput) nicknameInput.value = '';
  }

  function goHome() {
    closeModal();
    resetLookup();
    invitationImage.removeAttribute('src');
    invitationImage.classList.remove('is-loaded');
    invitationImageButton.classList.remove('is-loaded');
    currentImage = '';
    showView('home');
  }

  function openLookup() {
    resetLookup();
    showView('lookup');
    window.setTimeout(() => nicknameInput.focus({ preventScroll: true }), 360);
  }

  function showEmptyHint() {
    formHint.textContent = '请输入昵称哦 ✦';
    nicknameInput.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(-3px)' },
        { transform: 'translateX(0)' }
      ],
      { duration: 280, easing: 'ease-out' }
    );
    nicknameInput.focus();
  }

  function preloadImage(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async function startMatching(rawInput, personName) {
    const token = ++matchingToken;
    const person = PEOPLE[personName];
    const displayInput = rawInput.trim();
    const greeting = person.greeting || `${displayInput}，你来啦~`;

    nicknameForm.hidden = true;
    matchingPanel.classList.add('is-active');
    matchingPanel.setAttribute('aria-hidden', 'false');
    inputWrap.classList.add('is-scanning');
    greetingText.textContent = '';
    greetingText.classList.remove('is-visible');
    matchingLabel.textContent = 'MATCHING...';

    const imageReady = preloadImage(person.file);
    await wait(520);
    if (token !== matchingToken) return;

    greetingText.textContent = greeting;
    greetingText.classList.add('is-visible');
    matchingLabel.textContent = 'MATCHED ✦';

    await Promise.all([imageReady, wait(740)]);
    if (token !== matchingToken) return;

    currentImage = person.file;
    invitationImage.classList.remove('is-loaded');
    invitationImageButton.classList.remove('is-loaded');
    invitationImage.alt = `${personName}的 RAP GOING 专属邀请函`;
    invitationImage.src = person.file;
    modalImage.src = person.file;

    showView('success');

    if (invitationImage.complete) {
      invitationImage.classList.add('is-loaded');
      invitationImageButton.classList.add('is-loaded');
    }
  }

  function wait(ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
  }

  function openModal() {
    if (!currentImage) return;
    modalImage.src = currentImage;
    imageModal.classList.add('is-open');
    imageModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    closeModalBtn.focus({ preventScroll: true });
  }

  function closeModal() {
    if (!imageModal.classList.contains('is-open')) return;
    imageModal.classList.remove('is-open');
    imageModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  getInvitationBtn.addEventListener('click', openLookup);

  nicknameInput.addEventListener('input', () => {
    if (formHint.textContent) formHint.textContent = '';
  });

  nicknameForm.addEventListener('submit', event => {
    event.preventDefault();
    const rawInput = nicknameInput.value;
    const key = normalize(rawInput);

    if (!key) {
      showEmptyHint();
      return;
    }

    const personName = aliasIndex.get(key);
    if (!personName) {
      showView('notFound');
      return;
    }

    startMatching(rawInput, personName);
  });

  retryBtn.addEventListener('click', () => {
    resetLookup({ keepInput: false });
    showView('lookup');
    window.setTimeout(() => nicknameInput.focus({ preventScroll: true }), 300);
  });

  document.querySelectorAll('[data-action="home"]').forEach(button => {
    button.addEventListener('click', goHome);
  });

  invitationImage.addEventListener('load', () => {
    invitationImage.classList.add('is-loaded');
    invitationImageButton.classList.add('is-loaded');
  });

  invitationImageButton.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);

  imageModal.addEventListener('click', event => {
    if (event.target === imageModal || event.target.classList.contains('modal-scroll')) closeModal();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
  });
})();
