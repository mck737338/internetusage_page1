/* =============================================================
   Portfolio - script.js (모든 페이지 공통)

   1. 현재 페이지 탭 자동 활성화
   2. 푸터 연도 자동 표시
   3. 스크롤 등장 애니메이션
   4. 프로젝트 필터 (portfolio.html)
   5. 이메일 클립보드 복사 (contact.html)
   6. 문의 폼 → 메일 작성 화면 열기 (contact.html)
   ============================================================= */

(function () {
  'use strict';

  var prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 현재 페이지 탭 자동 활성화 ---------- */
  (function setActiveTab() {
    // 현재 파일 이름 추출 (예: "about.html"). 루트 접속 시 index.html로 처리
    var path = window.location.pathname.split('/').pop();
    if (!path) path = 'index.html';

    var links = document.querySelectorAll('.nav-item, .top-nav__item');

    Array.prototype.forEach.call(links, function (link) {
      var href = (link.getAttribute('href') || '').split('/').pop();
      if (href === path) {
        link.classList.add('is-active');

        // 모바일 상단 바에서 활성 탭이 화면 밖이면 보이도록 스크롤
        if (link.closest('.top-nav__list')) {
          link.scrollIntoView({ block: 'nearest', inline: 'center' });
        }
      }
    });
  })();

  /* ---------- 2. 푸터 연도 자동 표시 ---------- */
  (function setYear() {
    var year = new Date().getFullYear();
    var spans = document.querySelectorAll('.year, #year');
    Array.prototype.forEach.call(spans, function (el) {
      el.textContent = year;
    });
  })();

  /* ---------- 3. 스크롤 등장 애니메이션 ---------- */
  (function initReveal() {
    var targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      Array.prototype.forEach.call(targets, function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    Array.prototype.forEach.call(targets, function (el) {
      observer.observe(el);
    });
  })();

  /* ---------- 4. 프로젝트 필터 ---------- */
  (function initFilter() {
    var buttons = document.querySelectorAll('.filter__btn');
    var cards = document.querySelectorAll('#projectGrid .card');
    if (!buttons.length || !cards.length) return;

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.dataset.filter;

        Array.prototype.forEach.call(buttons, function (b) {
          b.classList.toggle('is-active', b === btn);
        });

        Array.prototype.forEach.call(cards, function (card) {
          var categories = (card.dataset.category || '').split(/\s+/);
          var show = filter === 'all' || categories.indexOf(filter) !== -1;
          card.classList.toggle('is-hidden', !show);
        });
      });
    });
  })();

  /* ---------- 토스트 알림 (공통 함수) ---------- */
  var toastEl = document.getElementById('toast');
  var toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 2000);
  }

  /* ---------- 5. 이메일 클립보드 복사 ---------- */
  (function initEmailCopy() {
    var btn = document.getElementById('emailCopy');
    if (!btn) return;

    var email = btn.dataset.email || '';
    var action = btn.querySelector('.contact__action');

    // navigator.clipboard를 쓸 수 없는 환경(http, 구형 브라우저)용 대체 복사
    function fallbackCopy(text) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(area);
      return ok;
    }

    function onSuccess() {
      btn.classList.add('is-copied');
      if (action) action.textContent = '복사됨';
      showToast('이메일 주소가 복사되었습니다');

      setTimeout(function () {
        btn.classList.remove('is-copied');
        if (action) action.textContent = '복사';
      }, 2000);
    }

    function onFail() {
      showToast('복사 실패: ' + email);
    }

    btn.addEventListener('click', function () {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(onSuccess).catch(function () {
          if (fallbackCopy(email)) { onSuccess(); } else { onFail(); }
        });
      } else {
        if (fallbackCopy(email)) { onSuccess(); } else { onFail(); }
      }
    });
  })();

  /* ---------- 6. 문의 폼 → 메일 작성 화면 열기 ---------- */
  (function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = form.dataset.email || '';
      var name = (form.querySelector('[name="name"]') || {}).value || '';
      var message = (form.querySelector('[name="message"]') || {}).value || '';

      if (!name.trim() || !message.trim()) {
        showToast('이름과 메시지를 모두 입력해 주세요');
        return;
      }

      var subject = '포트폴리오 문의 - ' + name.trim();
      var body = message.trim() + '\n\n보낸 사람: ' + name.trim();

      window.location.href =
        'mailto:' + email +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    });
  })();

})();
