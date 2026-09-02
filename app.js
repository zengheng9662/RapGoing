(() => {
  'use strict';

  const STORAGE_KEY = 'rapGoingSecretMissionState_v2';

  const DEFAULT_TASKS = [
    { id:'task-01', name:'妈妈', emoji:'🥣', content:'喂三个人吃东西，且需要被委员会的人看到，或者拍下照片。', enabled:true },
    { id:'task-02', name:'神偷', emoji:'🤏🏻', content:'拿走两个人的个人物品，来委员会开始计时，30分钟内不被发现即为成功。', enabled:true },
    { id:'task-03', name:'照相机', emoji:'🫰🏻', content:'完成与2个人的比耶的合照，三个人的以下犯上，4个人的比心。', enabled:true },
    { id:'task-04', name:'嘻嘻', emoji:'😜', content:'在三个不同的人手机里留下吐舌头的自拍照，完成后喊委员会验收，验收过程中不被举报。', enabled:true },
    { id:'task-05', name:'复制人', emoji:'👥', content:'学会3个人的方言，说“今天天气不错啊”，并且来委员会说出来。', enabled:true },
    { id:'task-06', name:'老大', emoji:'🎤', content:'引起全场大合唱3次，必须保证委员会在场。', enabled:true },
    { id:'task-07', name:'小丑牌', emoji:'🃏', content:'你没有隐藏任务！但你要假装你有隐藏任务，并有3次被举报，即为成功。', enabled:true },
    { id:'task-08', name:'最聪明的人', emoji:'💡', content:'你有10次举报机会，你的任务是成功检举他人任务至少3个，即为成功。', enabled:true },
    { id:'task-09', name:'双排咯', emoji:'💘', content:'你有一个游戏搭子，请在本场游戏中找到ta，并和ta拍下一张有且仅有你们两人的合照（两个人都必须蹲着比6）。', enabled:true },
    { id:'task-10', name:'双排咯', emoji:'💘', content:'你有一个游戏搭子，请在本场游戏中找到ta，并和ta拍下一张有且仅有你们两人的合照（两个人都必须蹲着比6）。', enabled:true },
    { id:'task-11', name:'贴贴', emoji:'🌠', content:'你需要在不同的5个人身上贴贴纸，贴纸找委员会领取。', enabled:true },
    { id:'task-12', name:'偷拍狂', emoji:'🍽️', content:'偷拍不少于3个人同时喝水或者吃东西的照片。', enabled:true },
    { id:'task-13', name:'警察', emoji:'👮', content:'偷拍5个人在拍照的照片。', enabled:true },
    { id:'task-14', name:'恶心人', emoji:'👅', content:'你需要3个不同的人对你说“你好恶心啊！”，并且能让委员会听到或者你有证据。', enabled:true },
    { id:'task-15', name:'神之一手', emoji:'💆', content:'给3个人进行按摩至少半分钟，并请保证委员会的人看见。', enabled:true },
    { id:'task-16', name:'侦探', emoji:'🕵️', content:'找出和你生日最近的人，明确日期。', enabled:true }
  ];

  const clone = value => JSON.parse(JSON.stringify(value));
  const freshState = () => ({ version: 2, tasks: clone(DEFAULT_TASKS), records: [] });
  const $ = id => document.getElementById(id);

  let state = loadState();
  let listMode = 'draw';
  let currentPlayerName = '';
  let currentCandidateId = null;
  let seenCandidateIds = [];
  let swapsRemaining = 3;
  let editingTaskId = null;
  let confirmAction = null;

  const views = {
    home: $('view-home'),
    draw: $('view-draw'),
    card: $('view-card'),
    list: $('view-list'),
    settings: $('view-settings')
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.records)) return freshState();
      return parsed;
    } catch {
      return freshState();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function navigate(name) {
    if (!views[name]) return;
    Object.entries(views).forEach(([key, el]) => el.classList.toggle('is-active', key === name));
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (name === 'list') renderRecords();
    if (name === 'settings') renderTasks();
    if (name === 'home') resetDrawFlow();
  }

  function setDrawStage(stage) {
    ['name', 'preview', 'reveal'].forEach(key => {
      $('draw-stage-' + key).classList.toggle('is-active', key === stage);
    });
  }

  function resetDrawFlow() {
    currentPlayerName = '';
    currentCandidateId = null;
    seenCandidateIds = [];
    swapsRemaining = 3;
    $('name-input').value = '';
    $('name-error').textContent = '';
    updateSwapButton();
    setDrawStage('name');
  }

  function assignedTaskIds() {
    return new Set(state.records.map(r => r.taskId));
  }

  function availableTasks() {
    const assigned = assignedTaskIds();
    return state.tasks.filter(task => task.enabled && !assigned.has(task.id));
  }

  function pickCandidate() {
    const available = availableTasks();
    const unseen = available.filter(task => !seenCandidateIds.includes(task.id));
    const pool = unseen.length ? unseen : available;
    if (!pool.length) return null;
    const task = pool[Math.floor(Math.random() * pool.length)];
    currentCandidateId = task.id;
    if (!seenCandidateIds.includes(task.id)) seenCandidateIds.push(task.id);
    return task;
  }

  function getTask(id) {
    return state.tasks.find(task => task.id === id) || null;
  }

  function showPreview(task) {
    const el = $('preview-emoji');
    el.textContent = task.emoji || '🎴';
    el.classList.remove('emoji-pop');
    void el.offsetWidth;
    el.classList.add('emoji-pop');
    setDrawStage('preview');
    updateSwapButton();
  }

  function updateSwapButton() {
    const btn = $('btn-swap');
    btn.textContent = `换一张（${swapsRemaining}/3）`;
    btn.disabled = swapsRemaining <= 0 || availableTasks().length <= 1;
  }

  function revealCandidate() {
    const task = getTask(currentCandidateId);
    if (!task) return;
    $('reveal-emoji-front').textContent = task.emoji || '🎴';
    $('reveal-emoji').textContent = task.emoji || '🎴';
    $('reveal-title').textContent = task.name;
    $('reveal-content').textContent = task.content;

    const card = $('flip-card');
    card.classList.remove('is-flipped');
    setDrawStage('reveal');
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('is-flipped')));
  }

  function finalizeTask() {
    const task = getTask(currentCandidateId);
    if (!task || !currentPlayerName) return;

    state.records.push({
      id: `record-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: currentPlayerName,
      taskId: task.id,
      taskName: task.name,
      drawOrder: state.records.length + 1,
      completedOrder: null
    });
    saveState();

    $('card-emoji').textContent = task.emoji || '🎴';
    $('card-title').textContent = task.name;
    $('card-content').textContent = task.content;
    $('card-name').textContent = currentPlayerName;
    navigate('card');
  }

  function medalFor(order) {
    return order === 1 ? '🥇' : order === 2 ? '🥈' : order === 3 ? '🥉' : '';
  }

  function sortedRecords() {
    const records = clone(state.records);
    if (listMode === 'draw') return records.sort((a,b) => a.drawOrder - b.drawOrder);
    return records.sort((a,b) => {
      const ad = a.completedOrder != null;
      const bd = b.completedOrder != null;
      if (ad && bd) return a.completedOrder - b.completedOrder;
      if (ad) return -1;
      if (bd) return 1;
      return a.drawOrder - b.drawOrder;
    });
  }

  function renderRecords() {
    const container = $('records-list');
    const records = sortedRecords();
    const completed = state.records.filter(r => r.completedOrder != null).length;

    $('list-summary').textContent = `${state.records.length} 人已抽卡 · ${completed} 人完成`;
    $('list-empty').classList.toggle('is-hidden', records.length > 0);
    container.innerHTML = '';
    if (!records.length) return;

    const head = document.createElement('div');
    head.className = 'record-row head';
    head.innerHTML = `<div>${listMode === 'draw' ? '顺序' : '排名'}</div><div>姓名</div><div>任务</div><div style="text-align:right">状态</div>`;
    container.appendChild(head);

    records.forEach(record => {
      const row = document.createElement('div');
      row.className = 'record-row';

      const shownOrder = listMode === 'draw'
        ? record.drawOrder
        : (record.completedOrder != null ? record.completedOrder : '—');

      const order = document.createElement('div');
      order.className = 'record-order';
      const medal = listMode === 'complete' && record.completedOrder != null ? medalFor(record.completedOrder) : '';
      order.textContent = `${medal}${medal ? ' ' : ''}${shownOrder}`;

      const name = document.createElement('div');
      name.className = 'record-name';
      name.textContent = record.name;

      const task = document.createElement('div');
      task.className = 'record-task';
      task.textContent = record.taskName;

      const status = document.createElement('button');
      status.className = 'status-btn' + (record.completedOrder != null ? ' is-complete' : '');
      status.type = 'button';
      status.textContent = record.completedOrder != null ? `✓ 第${record.completedOrder}完成` : '一键完成';
      status.addEventListener('click', () => toggleComplete(record.id));

      row.append(order, name, task, status);
      container.appendChild(row);
    });
  }

  function toggleComplete(recordId) {
    const record = state.records.find(r => r.id === recordId);
    if (!record) return;

    if (record.completedOrder == null) {
      const max = state.records.reduce((m,r) => Math.max(m, r.completedOrder || 0), 0);
      record.completedOrder = max + 1;
    } else {
      const removed = record.completedOrder;
      record.completedOrder = null;
      state.records.forEach(r => {
        if (r.completedOrder != null && r.completedOrder > removed) r.completedOrder -= 1;
      });
    }
    saveState();
    renderRecords();
  }

  function renderTasks() {
    const list = $('task-list');
    list.innerHTML = '';

    state.tasks.forEach((task, index) => {
      const row = document.createElement('div');
      row.className = 'task-row';

      const idx = document.createElement('div');
      idx.className = 'task-index';
      idx.textContent = index + 1;

      const name = document.createElement('div');
      name.className = 'task-name';
      name.textContent = task.name;

      const content = document.createElement('div');
      content.className = 'task-content-preview';
      content.textContent = task.content;

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'toggle' + (task.enabled ? ' is-on' : '');
      toggle.setAttribute('aria-label', task.enabled ? '禁用任务' : '启用任务');
      toggle.addEventListener('click', () => {
        if (state.records.some(r => r.taskId === task.id) && task.enabled) {
          openConfirm('无法关闭', '这个任务已经有人抽到，请先清空本轮名单。', null, true);
          return;
        }
        task.enabled = !task.enabled;
        saveState();
        renderTasks();
      });

      const actions = document.createElement('div');
      actions.className = 'row-actions';

      const edit = document.createElement('button');
      edit.className = 'mini-btn';
      edit.type = 'button';
      edit.textContent = '✎';
      edit.title = '编辑';
      edit.addEventListener('click', () => openTaskModal(task.id));

      const del = document.createElement('button');
      del.className = 'mini-btn delete';
      del.type = 'button';
      del.textContent = '×';
      del.title = '删除';
      del.addEventListener('click', () => deleteTask(task.id));

      actions.append(edit, del);
      row.append(idx, name, content, toggle, actions);
      list.appendChild(row);
    });
  }

  function openTaskModal(taskId = null) {
    editingTaskId = taskId;
    const task = taskId ? getTask(taskId) : null;
    $('task-modal-title').textContent = task ? '编辑任务' : '添加任务';
    $('task-name-input').value = task?.name || '';
    $('task-content-input').value = task?.content || '';
    $('task-emoji-input').value = task?.emoji || '🎴';
    $('task-modal').classList.remove('is-hidden');
    setTimeout(() => $('task-name-input').focus(), 80);
  }

  function closeTaskModal() {
    $('task-modal').classList.add('is-hidden');
    editingTaskId = null;
  }

  function saveTaskFromModal() {
    const name = $('task-name-input').value.trim();
    const content = $('task-content-input').value.trim();
    const emoji = $('task-emoji-input').value.trim() || '🎴';
    if (!name || !content) return;

    if (editingTaskId) {
      const task = getTask(editingTaskId);
      if (!task) return;
      task.name = name;
      task.content = content;
      task.emoji = emoji;
      state.records.forEach(r => { if (r.taskId === task.id) r.taskName = name; });
    } else {
      state.tasks.push({
        id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name, content, emoji, enabled: true
      });
    }
    saveState();
    closeTaskModal();
    renderTasks();
  }

  function deleteTask(taskId) {
    if (state.records.some(r => r.taskId === taskId)) {
      openConfirm('暂时不能删除', '这个任务已经有人抽到，请先清空本轮名单。', null, true);
      return;
    }
    const task = getTask(taskId);
    if (!task) return;

    openConfirm('删除这个任务？', `“${task.name}”删除后不会参与抽取。`, () => {
      state.tasks = state.tasks.filter(t => t.id !== taskId);
      saveState();
      renderTasks();
    });
  }

  function openConfirm(title, message, action, infoOnly = false) {
    $('confirm-title').textContent = title;
    $('confirm-message').textContent = message;
    confirmAction = action;
    $('btn-confirm-ok').textContent = infoOnly ? '知道了' : '确认';
    $('btn-confirm-cancel').classList.toggle('is-hidden', infoOnly);
    $('confirm-modal').classList.remove('is-hidden');
  }

  function closeConfirm() {
    $('confirm-modal').classList.add('is-hidden');
    confirmAction = null;
    $('btn-confirm-cancel').classList.remove('is-hidden');
    $('btn-confirm-ok').textContent = '确认';
  }

  function clearRecords() {
    state.records = [];
    saveState();
    renderRecords();
    renderTasks();
  }

  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });

  $('btn-enter-draw').addEventListener('click', () => {
    if (!availableTasks().length) {
      openConfirm('任务已经抽完啦', '当前没有可抽取的任务，可以在设置中调整任务。', null, true);
      return;
    }
    navigate('draw');
    setDrawStage('name');
    setTimeout(() => $('name-input').focus(), 120);
  });

  $('btn-close-name').addEventListener('click', () => navigate('home'));

  $('btn-start-draw').addEventListener('click', () => {
    const name = $('name-input').value.trim();

    if (!name) {
      $('name-error').textContent = '先输入名字，再开始抽任务。';
      return;
    }
    if (state.records.some(r => r.name.trim().toLowerCase() === name.toLowerCase())) {
      $('name-error').textContent = '这个名字已经抽过任务了。';
      return;
    }

    currentPlayerName = name;
    swapsRemaining = 3;
    seenCandidateIds = [];

    const task = pickCandidate();
    if (!task) {
      openConfirm('任务已经抽完啦', '当前没有可抽取的任务。', null, true);
      return;
    }
    showPreview(task);
  });

  $('name-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') $('btn-start-draw').click();
  });
  $('name-input').addEventListener('input', () => $('name-error').textContent = '');

  $('btn-swap').addEventListener('click', () => {
    if (swapsRemaining <= 0) return;
    swapsRemaining -= 1;
    const task = pickCandidate();
    if (task) showPreview(task);
    updateSwapButton();
  });

  $('btn-accept').addEventListener('click', revealCandidate);
  $('btn-generate-card').addEventListener('click', finalizeTask);

  $('tab-draw-order').addEventListener('click', () => {
    listMode = 'draw';
    $('tab-draw-order').classList.add('is-active');
    $('tab-complete-order').classList.remove('is-active');
    renderRecords();
  });

  $('tab-complete-order').addEventListener('click', () => {
    listMode = 'complete';
    $('tab-complete-order').classList.add('is-active');
    $('tab-draw-order').classList.remove('is-active');
    renderRecords();
  });

  $('btn-add-task').addEventListener('click', () => openTaskModal());
  $('btn-close-task-modal').addEventListener('click', closeTaskModal);
  $('btn-save-task').addEventListener('click', saveTaskFromModal);
  $('task-modal').addEventListener('click', e => {
    if (e.target === $('task-modal')) closeTaskModal();
  });

  $('btn-reset-records-shortcut').addEventListener('click', () => {
    openConfirm('清空本轮名单？', '所有姓名、抽卡顺序和完成顺序都会被清空，任务设置会保留。', () => {
      clearRecords();
      navigate('list');
    });
  });

  $('btn-reset-all').addEventListener('click', () => {
    openConfirm('重置全部数据？', '名单、完成顺序和任务修改都会恢复到初始状态。这个操作无法撤销。', () => {
      state = freshState();
      saveState();
      renderTasks();
      renderRecords();
      navigate('home');
    });
  });

  $('btn-confirm-cancel').addEventListener('click', closeConfirm);
  $('btn-confirm-ok').addEventListener('click', () => {
    const action = confirmAction;
    closeConfirm();
    if (typeof action === 'function') action();
  });
  $('confirm-modal').addEventListener('click', e => {
    if (e.target === $('confirm-modal')) closeConfirm();
  });

  renderRecords();
  renderTasks();
})();
