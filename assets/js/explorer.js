(function () {
  'use strict';
  const explorer = document.getElementById('explorer');
  if (!explorer) return;
  const language = document.documentElement.dataset.language || 'ko';
  const messages = {
    ko: { skip: '본문으로 이동', supportTitle: '이 공간을 응원해 주세요', supportButton: 'Ko-fi 후원하기', emptyPosts: '아직 공개된 글이 없습니다.', search: '게시글 검색', open: '글 탐색기 열기', close: '글 탐색기 닫기', count: n => n + '개의 게시글', results: n => n + '개 검색 결과', loadError: '본문을 불러오지 못했습니다. 게시글 페이지에서 확인해 주세요.' },
    en: { skip: 'Skip to content', supportTitle: 'Support this space', supportButton: 'Support on Ko-fi', emptyPosts: 'No published posts yet.', search: 'Search posts', open: 'Open post explorer', close: 'Close post explorer', count: n => n + (n === 1 ? ' post' : ' posts'), results: n => n + (n === 1 ? ' result' : ' results'), loadError: 'The introduction could not be loaded. Open the post to read it.' },
    ja: { skip: '本文へ移動', supportTitle: 'このブログを応援する', supportButton: 'Ko-fiで応援', emptyPosts: '公開された記事はまだありません。', search: '記事を検索', open: '記事一覧を開く', close: '記事一覧を閉じる', count: n => n + '件の記事', results: n => n + '件の検索結果', loadError: '本文を読み込めませんでした。記事のページでご覧ください。' }
  };
  const words = messages[language];
  document.querySelectorAll('[data-i18n]').forEach(node => { if (typeof words[node.dataset.i18n] === 'string') node.textContent = words[node.dataset.i18n]; });
  document.querySelectorAll('[data-support-ko]').forEach(node => { node.textContent = node.getAttribute('data-support-' + language) || ''; });
  function localizedUrl(href, code) {
    try { const url = new URL(href, location.href); url.searchParams.set('lang', code); return url.href; } catch (_) { return href; }
  }
  document.querySelectorAll('a.home-link').forEach(link => { link.href = localizedUrl(link.href, language); });
  document.querySelectorAll('a[data-language]').forEach(link => { link.href = localizedUrl(link.href, link.dataset.language); });
  const all = Array.from(explorer.querySelectorAll('a.tree-post'));
  const status = document.getElementById('explorer-status');
  const search = document.getElementById('explorer-search');
  const searchButton = explorer.querySelector('.search-toggle');
  const searchBox = explorer.querySelector('.explorer-search');
  const scrim = document.querySelector('.mobile-scrim');
  const toggle = document.querySelector('.explorer-toggle');
  const root = explorer.querySelector('.tree-root');
  const normalized = value => String(value || '').trim().toLocaleLowerCase();
  const isHome = Boolean(document.querySelector('[data-home="true"]'));
  explorer.querySelectorAll('.language-folder').forEach(folder => { folder.open = folder.dataset.language === language; });
  explorer.querySelectorAll('.language-select').forEach(link => link.addEventListener('click', event => event.stopPropagation()));
  if (status) status.textContent = words.count(all.length);
  function markCurrent(link) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
    let parent = link.parentElement;
    while (parent && parent !== explorer) { if (parent.tagName === 'DETAILS') parent.open = true; parent = parent.parentElement; }
  }
  all.forEach(link => {
    try {
      const path = new URL(link.href, location.href).pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '');
      const current = location.pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '');
      if (path === current) markCurrent(link);
    } catch (_) {}
  });
  if (isHome) {
    explorer.querySelectorAll('.language-home').forEach(link => { if (link.dataset.language === language) markCurrent(link); });
  }
  let openBeforeSearch = null;
  function filterPosts() {
    const query = normalized(search.value);
    if (query && !openBeforeSearch) openBeforeSearch = new Map(Array.from(explorer.querySelectorAll('details')).map(node => [node, node.open]));
    let found = 0;
    explorer.querySelectorAll('.language-folder').forEach(folder => {
      const languageMatch = normalized(folder.querySelector('.language-select').textContent).includes(query);
      let matches = 0;
      folder.querySelectorAll('a.tree-post').forEach(link => {
        const category = link.closest('.tree-folder');
        const match = !query || languageMatch || normalized(link.textContent).includes(query) || normalized(category?.dataset.folderName).includes(query);
        link.hidden = !match;
        if (match) matches++;
      });
      folder.querySelectorAll('.tree-folder').forEach(category => {
        const hits = Array.from(category.querySelectorAll('a.tree-post')).some(link => !link.hidden);
        category.hidden = Boolean(query) && !hits;
        if (query && hits) category.open = true;
      });
      folder.hidden = Boolean(query) && matches === 0;
      if (query && matches) folder.open = true;
      found += matches;
    });
    if (query && root) root.open = true;
    if (!query && openBeforeSearch) { openBeforeSearch.forEach((open, node) => { node.open = open; }); openBeforeSearch = null; }
    if (status) status.textContent = query ? words.results(found) : words.count(all.length);
  }
  function openSearch() {
    search.hidden = false;
    searchBox.classList.add('is-open');
    searchButton.setAttribute('aria-expanded', 'true');
    search.focus();
  }
  function closeSearch() {
    search.value = '';
    filterPosts();
    search.hidden = true;
    searchBox.classList.remove('is-open');
    searchButton.setAttribute('aria-expanded', 'false');
    searchButton.focus();
  }
  if (search && searchButton) {
    search.setAttribute('aria-label', words.search);
    searchButton.setAttribute('aria-label', words.search);
    search.addEventListener('input', filterPosts);
    searchButton.addEventListener('click', () => search.hidden ? openSearch() : closeSearch());
  }
  function closeExplorer() {
    explorer.classList.remove('open');
    if (scrim) scrim.hidden = true;
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', words.open); }
  }
  function openExplorer() {
    explorer.classList.add('open');
    if (scrim) scrim.hidden = false;
    if (toggle) { toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', words.close); }
  }
  if (toggle) { toggle.setAttribute('aria-label', words.open); toggle.addEventListener('click', () => explorer.classList.contains('open') ? closeExplorer() : openExplorer()); }
  if (scrim) scrim.addEventListener('click', closeExplorer);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { if (search && !search.hidden) closeSearch(); else closeExplorer(); }
    if (event.key === '/' && search && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      if (window.matchMedia('(max-width:700px)').matches) openExplorer();
      openSearch();
    }
  });
  window.matchMedia('(min-width:701px)').addEventListener('change', event => { if (event.matches) closeExplorer(); });
  const panel = document.querySelector('[data-home-language="' + language + '"]');
  const intro = panel && panel.querySelector('.intro-post');
  const content = intro && intro.querySelector('.intro-post-text');
  if (content && !content.textContent.trim() && intro.dataset.postUrl) {
    fetch(intro.dataset.postUrl).then(response => { if (!response.ok) throw new Error('Unable to load introduction'); return response.text(); }).then(html => {
      const body = new DOMParser().parseFromString(html, 'text/html').querySelector('#post-entry');
      if (body) content.innerHTML = body.innerHTML; else content.textContent = words.loadError;
    }).catch(() => { content.textContent = words.loadError; });
  }
})();
