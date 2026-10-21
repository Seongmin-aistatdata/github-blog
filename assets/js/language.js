(function () {
  'use strict';
  var root = document.documentElement;
  var valid = function (value) { return /^(ko|en|ja)$/.test(value || '') ? value : ''; };
  var query = '';
  var saved = '';
  try { query = valid(new URLSearchParams(location.search).get('lang')); } catch (_) {}
  try { saved = valid(localStorage.getItem('orangeexplorer.language')); } catch (_) {}
  var preferred = '';
  (navigator.languages || [navigator.language || '']).some(function (value) {
    preferred = valid(String(value).toLowerCase().split('-')[0]);
    return Boolean(preferred);
  });
  var code = valid(root.dataset.contentLanguage) || query || saved || preferred || valid(root.lang) || 'ko';
  root.dataset.language = code;
  root.lang = code;
  try { localStorage.setItem('orangeexplorer.language', code); } catch (_) {}
})();
