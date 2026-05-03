/**
 * Guide Terrain - Main JavaScript
 */

(function () {
  'use strict';

  // --- Theme Toggle ---
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  const themeTextsLight = document.querySelectorAll('.theme-text-light');
  const themeTextsDark = document.querySelectorAll('.theme-text-dark');

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
      themeTextsLight.forEach(i => i.style.display = 'none');
      themeTextsDark.forEach(i => i.style.display = 'block');
    } else {
      themeTextsLight.forEach(i => i.style.display = 'block');
      themeTextsDark.forEach(i => i.style.display = 'none');
    }
  }

  // Init theme
  const savedTheme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(savedTheme);

  if (themeToggle) themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
  
  if (themeToggleMobile) themeToggleMobile.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // --- Tab Handling ---
  const tabLinks = document.querySelectorAll('.tab-link');

  function serializeNodeText(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    if (node.classList.contains('form-fill')) {
      const length = parseInt(node.style.getPropertyValue('--fill-ch'), 10) || 24;
      return ' ' + '_'.repeat(Math.max(12, Math.min(length, 72))) + ' ';
    }

    return Array.from(node.childNodes).map(serializeNodeText).join('');
  }

  function initTabs() {
    const path = window.location.pathname;
    const isOutils = path.includes('/outils/');
    const activeTab = isOutils ? 'outils' : 'guide';
    
    document.body.setAttribute('data-active-tab', activeTab);
    
    tabLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-tab') === activeTab);
    });
  }

  initTabs();

  function setActiveTab(tab) {
    document.body.setAttribute('data-active-tab', tab);

    tabLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-tab') === tab);
    });
  }

  // --- Mobile Menu ---
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  function toggleMenu() {
    if (!sidebar || !menuToggle || !overlay) return;
    const isOpen = sidebar.classList.toggle('is-open');
    overlay.classList.toggle('is-visible', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  const sidebarClose = document.querySelector('.sidebar-close');

  if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
  if (overlay) overlay.addEventListener('click', toggleMenu);
  if (sidebarClose) sidebarClose.addEventListener('click', toggleMenu);

  // Close menu on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (sidebar && sidebar.classList.contains('is-open')) toggleMenu();
    });
  });

  document.querySelectorAll('.sidebar-tab-link').forEach(link => {
    link.addEventListener('click', () => {
      if (sidebar && sidebar.classList.contains('is-open')) toggleMenu();
    });
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('is-open')) {
      toggleMenu();
    }
  });

  // --- ScrollSpy ---
  const headings = document.querySelectorAll('.guide-content h2[id], .guide-content h3[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (headings.length && navLinks.length) {
    const observerOptions = {
      rootMargin: '-100px 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === '#' + id;
            link.classList.toggle('active', isActive);
            
            // If scrolled into a section, ensure the correct tab is active
            if (isActive) {
              const sectionItem = link.closest('.nav-item');
              if (sectionItem) {
                const section = sectionItem.getAttribute('data-section');
                if (section && document.body.getAttribute('data-active-tab') !== section) {
                  setActiveTab(section, false);
                }
              }
            }
          });
        }
      });
    }, observerOptions);

    headings.forEach(h => observer.observe(h));
  }

  // --- Export Function ---
  const btnText = document.getElementById('btn-text');
  if (btnText) {
    btnText.addEventListener('click', () => {
      const content = document.getElementById('guide-content');
      if (!content) return;

      const isOutils = window.location.pathname.includes('/outils/');

      if (isOutils) {
        // Structured text export for outils (form-ready)
        const lines = [];
        const separator = '─'.repeat(80);
        const writeLine = () => '___________________________________________________________________________';

        content.querySelectorAll('h1, h2, h3, h4, p, table, ul, ol, blockquote, div.form-lines').forEach(el => {
          // Skip export bar
          if (el.closest('.export-bar')) return;

          const tag = el.tagName.toLowerCase();

          if (tag === 'h1') {
            lines.push('');
            lines.push('═'.repeat(80));
            lines.push(el.textContent.trim().toUpperCase());
            lines.push('═'.repeat(80));
            lines.push('');
          } else if (tag === 'h2') {
            lines.push('');
            lines.push(separator);
            lines.push(el.textContent.trim());
            lines.push(separator);
            lines.push('');
          } else if (tag === 'h3') {
            lines.push('');
            lines.push('  ' + el.textContent.trim());
            lines.push('  ' + '─'.repeat(60));
            lines.push('');
          } else if (tag === 'h4') {
            lines.push('');
            lines.push('    ' + el.textContent.trim());
            lines.push('');
          } else if (tag === 'table') {
            const rows = el.querySelectorAll('tr');
            if (!rows.length) return;

            // Calculate column widths
            const cols = rows[0].querySelectorAll('th, td').length;
            const colWidths = [];
            const maxTotal = 78;
            const baseWidth = Math.floor(maxTotal / cols);
            for (let i = 0; i < cols; i++) colWidths.push(baseWidth);

            // Render header
            const headerCells = rows[0].querySelectorAll('th, td');
            if (headerCells.length) {
              const headerLine = Array.from(headerCells)
                .map((c, i) => c.textContent.trim().substring(0, colWidths[i] - 2).padEnd(colWidths[i] - 1))
                .join('│');
              lines.push('┌' + colWidths.map(w => '─'.repeat(w - 1)).join('┬') + '┐');
              lines.push('│' + headerLine + '│');
              lines.push('├' + colWidths.map(w => '─'.repeat(w - 1)).join('┼') + '┤');
            }

            // Render body rows
            for (let r = 1; r < rows.length; r++) {
              const cells = rows[r].querySelectorAll('th, td');
              const rowLine = Array.from(cells)
                .map((c, i) => {
                  const text = c.textContent.trim();
                  const w = colWidths[i] || baseWidth;
                  // Empty writable cell
                  if (!text || text === '\u00a0') return ' '.repeat(w - 1);
                  return text.substring(0, w - 2).padEnd(w - 1);
                })
                .join('│');
              lines.push('│' + rowLine + '│');
            }
            lines.push('└' + colWidths.map(w => '─'.repeat(w - 1)).join('┴') + '┘');
            lines.push('');
          } else if (tag === 'ul' || tag === 'ol') {
            const items = el.querySelectorAll(':scope > li');
            items.forEach((li, idx) => {
              const checkbox = li.querySelector('input[type="checkbox"]');
              if (checkbox) {
                lines.push('  [ ] ' + li.textContent.trim());
              } else if (tag === 'ol') {
                lines.push('  ' + (idx + 1) + '. ' + li.textContent.trim());
              } else {
                lines.push('  • ' + li.textContent.trim());
              }
            });
            lines.push('');
          } else if (tag === 'blockquote') {
            lines.push('');
            lines.push('  ┃ ' + el.textContent.trim());
            lines.push('');
          } else if (tag === 'div' && el.classList.contains('form-lines')) {
            const lineCount = parseInt(el.style.getPropertyValue('--form-lines'), 10) || 1;
            for (let i = 0; i < lineCount; i++) {
              lines.push(writeLine());
              lines.push('');
            }
          } else if (tag === 'p') {
            const text = serializeNodeText(el).replace(/\s+/g, ' ').trim();
            if (!text) return;
            if (text.match(/^_{10,}$/)) {
              lines.push(writeLine());
              lines.push('');
            } else {
              lines.push(text);
              lines.push('');
            }
          }
        });

        const output = lines.join('\n');
        const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'outils-femmes-et-terrains.txt';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Simple text export for the guide
        const text = content.innerText;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'guide-femmes-et-terrains.txt';
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }

})();
