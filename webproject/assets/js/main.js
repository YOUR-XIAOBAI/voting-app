// assets/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  let user, event, votes = {}, chart;

  // 切换显示面板
  const show = id =>
    document.querySelectorAll('section')
      .forEach(s => s.id === id
        ? s.classList.remove('hidden')
        : s.classList.add('hidden'));

  // 导航按钮逻辑
  document.querySelectorAll('nav button').forEach(btn => {
    btn.onclick = () => {
      const sec = btn.dataset.sec;
      if (sec === 'create' && !user) {
        alert('Please register first');
        return;
      }
      if ((sec === 'vote' || sec === 'results') && !event) {
        alert('Please create an event first');
        return;
      }
      show(sec);
      if (sec === 'vote') renderVote();
      if (sec === 'results') renderResults();
    };
  });

  // 注册
  document.getElementById('f-register').onsubmit = e => {
    e.preventDefault();
    user = document.getElementById('user').value.trim();
    if (!user) return alert('Username cannot be empty');
    alert(`Hello, ${user}`);
    show('create');
  };

  // 增加时间槽
  document.getElementById('add-slot').onclick = () => {
    const input = document.createElement('input');
    input.type = 'datetime-local';
    input.name = 'slot';
    input.required = true;
    document.getElementById('slots').appendChild(input);
  };

  // 创建事件
  document.getElementById('f-create').onsubmit = e => {
    e.preventDefault();
    const slots = Array.from(document.querySelectorAll('#slots input[name="slot"]'))
      .map(i => i.value)
      .filter(v => v);
    if (slots.length === 0) {
      alert('Add at least one slot');
      return;
    }
    event = {
      title: document.getElementById('title').value.trim(),
      slots,
      max: parseInt(document.getElementById('max').value, 10)
    };
    votes = {};
    show('vote');
    renderVote();
  };

  // 渲染投票表单
  function renderVote() {
    const area = document.getElementById('vote-area');
    area.innerHTML = `
      <h3>${event.title}</h3>
      <form id="f-vote">
        ${event.slots.map(s => `
          <label>
            <input type="checkbox" name="slot" value="${s}" />
            ${new Date(s).toLocaleString()}
          </label>`).join('')}
        <button type="submit">Submit (max ${event.max})</button>
      </form>`;
    document.getElementById('f-vote').onsubmit = e => {
      e.preventDefault();
      const sel = Array.from(e.target.querySelectorAll('input[name="slot"]:checked'))
        .map(cb => cb.value);
      if (sel.length > event.max) {
        alert(`You can select up to ${event.max}`);
        return;
      }
      votes[user] = sel;
      alert('Your vote has been recorded');
    };
  }

  // 渲染结果图表
  function renderResults() {
    const ctx = document.getElementById('chart').getContext('2d');
    // 销毁旧实例
    if (chart) chart.destroy();

    // 计算票数
    const counts = Object.fromEntries(event.slots.map(s => [s, 0]));
    Object.values(votes).flat().forEach(s => {
      if (counts[s] !== undefined) counts[s]++;
    });

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: event.slots.map(s => new Date(s).toLocaleString()),
        datasets: [{
          label: 'Votes',
          data: Object.values(counts)
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
});
