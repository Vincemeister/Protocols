/* @ds-bundle: {"format": 4, "namespace": "Favolist", "components": [{"name": "Button"}, {"name": "FollowButton"}, {"name": "Avatar"}, {"name": "Badge"}, {"name": "BrandChip"}, {"name": "CodeFrame"}, {"name": "UserCard"}, {"name": "ProfileHeader"}, {"name": "Tabs"}, {"name": "TopBar"}, {"name": "BottomBar"}, {"name": "SideNav"}, {"name": "AsideRail"}, {"name": "SearchField"}, {"name": "TextField"}, {"name": "TextArea"}, {"name": "Select"}, {"name": "Checkbox"}, {"name": "Toggle"}, {"name": "ImageUploader"}, {"name": "ProductCard"}, {"name": "ListCard"}, {"name": "ReferralCard"}, {"name": "NotificationRow"}, {"name": "Dialog"}, {"name": "Sheet"}, {"name": "Alert"}, {"name": "Toast"}, {"name": "EmptyState"}, {"name": "Skeleton"}, {"name": "LoadMore"}, {"name": "MarkLoader"}]} */
/* Favolist — framework-free component factories. Each returns a DOM element styled by bundle.css and tokens.css.
   The Next.js rebuild will carry the same class names and props into React components; this bundle exists so the
   previews and any consumer page can render the system without a build step. No React is required. */
(function () {
  var ICONS = {
    'home': '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'plus-square': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/>',
    'bookmark': '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'heart': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    'share': '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/>',
    'copy': '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    'image': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    'more-horizontal': '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
    'grip-horizontal': '<circle cx="12" cy="9" r="1"/><circle cx="19" cy="9" r="1"/><circle cx="5" cy="9" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="19" cy="15" r="1"/><circle cx="5" cy="15" r="1"/>',
    'pencil': '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
    'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    'link': '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    'mail': '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    'list': '<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'mic': '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
    'square': '<rect width="18" height="18" x="3" y="3" rx="2"/>',
    'wand': '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/>',
    'undo': '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
    'youtube': '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
    'instagram': '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
    'globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'
  };
  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) Object.keys(attrs).forEach(function (k) { if (attrs[k] != null) n.setAttribute(k, attrs[k]); });
    return n;
  }
  function text(tag, cls, s) { var n = el(tag, cls); n.textContent = s == null ? '' : String(s); return n; }
  function icon(name, size) {
    var cls = 'fv-icon' + (size === 'sm' ? ' fv-icon-sm' : size === 'lg' ? ' fv-icon-lg' : '');
    var wrap = el('span'); wrap.innerHTML = '<svg class="' + cls + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
    return wrap.firstChild;
  }
  function initials(name) { return String(name || '').split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join(''); }
  function tone(name) { var h = 0; for (var i = 0; i < String(name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return 1 + (h % 3); }

  function Button(p) {
    p = p || {};
    var b = el(p.href ? 'a' : 'button', 'fv-btn fv-btn-' + (p.variant || 'tertiary') + (p.size === 'sm' ? ' fv-btn-sm' : p.size === 'lg' ? ' fv-btn-lg' : '') + (p.block ? ' fv-btn-block' : ''),
      { href: p.href, type: p.href ? null : (p.type || 'button'), 'aria-label': p.ariaLabel });
    if (p.disabled) b.disabled = true;
    if (p.icon) b.appendChild(icon(p.icon));
    if (p.label) b.appendChild(document.createTextNode(p.label));
    if (p.onClick) b.addEventListener('click', p.onClick);
    return b;
  }
  function Avatar(p) {
    p = p || {};
    var size = p.size || 40;
    var a = el(p.src ? 'img' : 'span', 'fv-avatar fv-avatar-' + size + (p.bordered ? ' fv-avatar-bordered' : '') + (p.src ? '' : ' fv-avatar-tone-' + tone(p.name)),
      p.src ? { src: p.src, alt: p.name || '' } : { role: 'img', 'aria-label': p.name || '' });
    if (!p.src) a.appendChild(text('span', '', initials(p.name)));
    return a;
  }
  function Tabs(p) {
    p = p || {};
    var list = el('div', 'fv-tabs', { role: 'tablist' });
    (p.items || []).forEach(function (it) {
      var t = el('button', 'fv-tab', { role: 'tab', type: 'button', 'aria-selected': String(it.id === p.selected) });
      t.appendChild(document.createTextNode(it.label));
      if (it.count != null) t.appendChild(text('span', 'fv-tab-count', it.count));
      t.addEventListener('click', function () {
        list.querySelectorAll('.fv-tab').forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
        t.setAttribute('aria-selected', 'true');
        if (p.onChange) p.onChange(it.id);
      });
      list.appendChild(t);
    });
    return list;
  }
  function ProductCard(p) {
    p = p || {}; var c = p.creator || {}, pr = p.product || {};
    var card = el('article', 'fv-product');
    var head = el('div', 'fv-product-head');
    var who = el('div', 'fv-product-creator'); who.appendChild(Avatar({ name: c.name, src: c.avatar, size: 40 }));
    var names = el('div'); names.appendChild(text('div', 'fv-name', c.name)); if (p.listName) names.appendChild(text('div', 'fv-list', p.listName)); who.appendChild(names);
    head.appendChild(who);
    if (pr.brand) head.appendChild(BrandChip({ name: pr.brand, logo: pr.brandLogo }));
    card.appendChild(head);
    var img = el('div', 'fv-product-image'); if (pr.image) img.appendChild(el('img', '', { src: pr.image, alt: pr.name || '' })); else img.appendChild(icon('image', 'lg')); card.appendChild(img);
    card.appendChild(text('h3', 'fv-product-title', pr.name));
    card.appendChild(text('p', 'fv-product-review', p.review));
    if (p.code) card.appendChild(CodeFrame({ label: p.codeLabel || 'Code', code: p.code }));
    var acts = el('div', 'fv-product-actions');
    function act(name, label, aria) { var b = el('button', 'fv-icon-btn', { type: 'button', 'aria-label': aria }); b.appendChild(icon(name)); if (label != null) b.appendChild(document.createTextNode(label)); return b; }
    acts.appendChild(act('heart', p.likes)); acts.appendChild(act('message-circle', p.comments)); acts.appendChild(act('share', null, 'Share'));
    if (pr.url) { var go = el('a', 'fv-icon-btn fv-icon-btn-right', { href: pr.url }); go.appendChild(document.createTextNode('Go to product ')); go.appendChild(icon('external-link', 'sm')); acts.appendChild(go); }
    card.appendChild(acts);
    return card;
  }
  function ListCard(p) {
    p = p || {}; var c = p.creator || {};
    var a = el('a', 'fv-list-card' + (p.size === 'sm' ? ' fv-list-card-sm' : ''), { href: p.href || '#' });
    if (p.cover) a.appendChild(el('img', '', { src: p.cover, alt: '' }));
    var top = el('div', 'fv-list-top'); top.appendChild(Avatar({ name: c.name, src: c.avatar, size: p.size === 'sm' ? 24 : 32 }));
    var meta = el('div'); meta.appendChild(text('div', 'fv-name', c.name)); if (c.followers) meta.appendChild(text('div', 'fv-followers', c.followers)); top.appendChild(meta); a.appendChild(top);
    var bottom = el('div', 'fv-list-bottom'); bottom.appendChild(text('h3', 'fv-list-title', p.name)); bottom.appendChild(text('p', 'fv-list-count', p.count)); a.appendChild(bottom);
    return a;
  }
  function SideNav(p) {
    p = p || {}; var u = p.user || {};
    var nav = el('nav', 'fv-rail', { 'aria-label': 'Main' });
    var brand = el('a', 'fv-rail-brand', { href: p.homeHref || '/' });
    if (p.mark) brand.appendChild(el('img', '', { src: p.mark, alt: '' }));
    brand.appendChild(text('span', 'fv-wordmark', 'Favolist')); nav.appendChild(brand);
    var items = el('div', 'fv-rail-items');
    (p.items || []).forEach(function (it) { var a = el('a', 'fv-rail-item', { href: it.href || '#', 'aria-current': it.current ? 'page' : null }); a.appendChild(icon(it.icon, 'lg')); a.appendChild(document.createTextNode(it.label)); items.appendChild(a); });
    nav.appendChild(items);
    if (u.name) { var foot = el('div', 'fv-rail-foot'); foot.appendChild(Avatar({ name: u.name, src: u.avatar, size: 40 })); var m = el('div'); m.appendChild(text('div', 'fv-name', u.name)); if (u.handle) m.appendChild(text('div', 'fv-handle', u.handle)); foot.appendChild(m); nav.appendChild(foot); }
    return nav;
  }

  function Badge(p) { p = p || {}; var b = el('span', 'fv-badge' + (p.tone ? ' fv-badge-' + p.tone : '')); if (p.icon) b.appendChild(icon(p.icon)); b.appendChild(document.createTextNode(p.label || '')); return b; }
  function BrandChip(p) { p = p || {}; var chip = el('span', 'fv-brand-chip', { title: p.name }); if (p.logo) chip.appendChild(el('img', '', { src: p.logo, alt: p.name || '', style: 'height:20px' })); else chip.textContent = String(p.name || '').toUpperCase(); return chip; }
  function CodeFrame(p) {
    p = p || {};
    var f = el('div', 'fv-code-frame'); f.appendChild(text('span', 'fv-code-label', p.label || 'Code'));
    f.appendChild(text('code', '', p.code)); var cp = el('button', 'fv-icon-btn', { type: 'button', 'aria-label': 'Copy code' }); cp.appendChild(icon('copy', 'sm'));
    var back = el('div', 'fv-code-back', { 'aria-hidden': 'true' }); back.appendChild(icon('check', 'sm')); back.appendChild(document.createTextNode('Copied')); back.appendChild(text('code', '', p.code)); f.appendChild(back);
    cp.addEventListener('click', function () { try { navigator.clipboard && navigator.clipboard.writeText(p.code); } catch (e) {} f.classList.add('is-copied'); setTimeout(function () { f.classList.remove('is-copied'); }, 2000); if (p.onCopy) p.onCopy(p.code); });
    f.appendChild(cp); return f;
  }
  function UserCard(p) {
    p = p || {};
    var c = el('div', 'fv-user-card' + (p.lined ? ' fv-user-card-lined' : '')); c.appendChild(Avatar({ name: p.name, src: p.avatar, size: p.size || 48 }));
    var t = el('div', 'fv-user-text'); t.appendChild(text('div', 'fv-name', p.name)); if (p.handle) t.appendChild(text('div', 'fv-handle', p.handle)); if (p.meta) t.appendChild(text('div', 'fv-meta', p.meta)); c.appendChild(t);
    if (p.action !== false) c.appendChild(Button({ variant: p.following ? 'secondary' : 'tertiary', size: 'sm', label: p.following ? 'Following' : 'Follow', onClick: p.onFollow }));
    return c;
  }
  function ProfileHeader(p) {
    p = p || {};
    var h = el('header', 'fv-profile' + (p.large ? ' fv-profile-lg' : ''));
    var top = el('div', 'fv-profile-top'); top.appendChild(Avatar({ name: p.name, src: p.avatar, size: p.large ? 144 : 72, bordered: !!p.avatar }));
    var acts = el('div', 'fv-profile-actions');
    if (p.own) acts.appendChild(Button({ variant: 'tertiary', label: 'Edit profile', icon: 'pencil', onClick: p.onEdit }));
    else acts.appendChild(FollowButton({ following: !!p.following, onToggle: p.onFollow }));
    acts.appendChild(Button({ variant: 'tertiary', icon: 'share', ariaLabel: 'Share profile', onClick: p.onShare })); top.appendChild(acts); h.appendChild(top);
    var names = el('div'); names.appendChild(text('h1', 'fv-profile-name', p.name)); if (p.handle) names.appendChild(text('p', 'fv-profile-handle', p.handle)); h.appendChild(names);
    if (p.bio) h.appendChild(text('p', 'fv-profile-bio', p.bio));
    var links = p.links || (p.link ? [p.link] : []);
    if (links.length) { var row = el('div', 'fv-profile-links'); links.slice(0, 4).forEach(function (l) { var a = el('a', 'fv-profile-link', { href: l.href, target: '_blank', rel: 'noopener' }); a.appendChild(icon(l.icon || 'link', 'sm')); a.appendChild(document.createTextNode(l.label || l.href)); row.appendChild(a); }); h.appendChild(row); }
    if (p.counts) { var ul = el('ul', 'fv-profile-counts'); p.counts.forEach(function (c) { var li = el('li'); li.appendChild(text('b', '', c.value)); li.appendChild(document.createTextNode(c.label)); ul.appendChild(li); }); h.appendChild(ul); }
    return h;
  }
  function TopBar(p) {
    p = p || {};
    var bar = el('header', 'fv-topbar');
    if (p.brand) { var b = el('a', 'fv-topbar-brand', { href: p.homeHref || '/' }); if (p.mark) b.appendChild(el('img', '', { src: p.mark, alt: '' })); b.appendChild(text('span', '', 'Favolist')); b.style.gridColumn = '1 / 3'; bar.appendChild(b); }
    else { var back = el('button', 'fv-icon-btn', { type: 'button', 'aria-label': p.backLabel || 'Back' }); back.appendChild(icon('chevron-left')); if (p.onBack) back.addEventListener('click', p.onBack); bar.appendChild(back); bar.appendChild(text('h1', 'fv-topbar-title', p.title)); }
    if (p.action) { var act = el('button', 'fv-icon-btn', { type: 'button', 'aria-label': p.action.label }); act.appendChild(icon(p.action.icon)); if (p.action.onClick) act.addEventListener('click', p.action.onClick); act.style.position = 'relative'; if (p.action.badge) { var d = el('span', 'fv-dot'); d.style.cssText = 'position:absolute;top:10px;right:10px;width:8px;height:8px;border-radius:var(--radius-full);background:var(--accent)'; act.appendChild(d); } bar.appendChild(act); } else bar.appendChild(el('span'));
    return bar;
  }
  function BottomBar(p) {
    p = p || {};
    var bar = el('nav', 'fv-bottombar', { 'aria-label': 'Main' });
    (p.items || []).forEach(function (it) { var a = el('a', 'fv-bottombar-item', { href: it.href || '#', 'aria-current': it.current ? 'page' : null }); a.appendChild(icon(it.icon)); a.appendChild(document.createTextNode(it.label)); if (it.unread) a.appendChild(el('span', 'fv-dot')); bar.appendChild(a); });
    return bar;
  }
  function AsideRail(p) {
    p = p || {};
    var aside = el('aside', 'fv-aside', { 'aria-label': 'Suggestions' });
    if (p.user) { var me = UserCard({ name: p.user.name, handle: p.user.handle, avatar: p.user.avatar, size: 48, action: false }); aside.appendChild(me); }
    if (p.lists && p.lists.length) { var s1 = el('section', 'fv-aside-section'); s1.appendChild(text('h2', 'fv-overline', 'Suggested lists')); var g = el('div', 'fv-aside-grid'); p.lists.forEach(function (l) { l.size = 'sm'; g.appendChild(ListCard(l)); }); s1.appendChild(g); aside.appendChild(s1); }
    if (p.people && p.people.length) { var s2 = el('section', 'fv-aside-section'); s2.appendChild(text('h2', 'fv-overline', 'Suggested profiles')); p.people.forEach(function (u) { u.size = 40; s2.appendChild(UserCard(u)); }); s2.appendChild(Button({ variant: 'link', size: 'sm', label: 'See all', onClick: p.onSeeAll })); s2.lastChild.classList.add('fv-aside-more'); aside.appendChild(s2); }
    return aside;
  }
  function SearchField(p) {
    p = p || {};
    var wrap = el('div', 'fv-search' + (p.size === 'lg' ? ' fv-search-lg' : ''), { role: 'search' }); wrap.appendChild(icon('search'));
    var input = el('input', '', { type: 'search', placeholder: p.placeholder || 'Search creators, lists and products', 'aria-label': p.placeholder || 'Search' }); if (p.value) input.value = p.value; wrap.appendChild(input);
    var clear = el('button', 'fv-icon-btn', { type: 'button', 'aria-label': 'Clear search' }); clear.appendChild(icon('x-circle', 'sm')); clear.style.display = p.value ? '' : 'none'; wrap.appendChild(clear);
    input.addEventListener('input', function () { clear.style.display = input.value ? '' : 'none'; if (p.onChange) p.onChange(input.value); });
    clear.addEventListener('click', function () { input.value = ''; clear.style.display = 'none'; input.focus(); if (p.onChange) p.onChange(''); });
    return wrap;
  }
  function field(p, control) {
    var f = el('div', 'fv-field' + (p.error ? ' is-error' : '')); var id = p.id || ('fv-' + Math.random().toString(36).slice(2, 8)); control.id = id;
    if (p.label) { var l = el('label', 'fv-label', { 'for': id }); l.appendChild(document.createTextNode(p.label)); if (p.optional) l.appendChild(text('span', 'fv-optional', 'Optional')); f.appendChild(l); }
    f.appendChild(control);
    if (p.error || p.help || p.maxLength) { var h = el('div', 'fv-help'); var msg = el('span'); if (p.error) { msg.appendChild(icon('alert-triangle', 'sm')); msg.appendChild(document.createTextNode(p.error)); } else msg.textContent = p.help || ''; h.appendChild(msg); if (p.maxLength) { var cnt = text('span', 'fv-count', (control.value || '').length + ' / ' + p.maxLength); control.addEventListener('input', function () { cnt.textContent = control.value.length + ' / ' + p.maxLength; }); h.appendChild(cnt); } f.appendChild(h); }
    return f;
  }
  function TextField(p) { p = p || {}; var i = el('input', 'fv-input', { type: p.type || 'text', placeholder: p.placeholder, maxlength: p.maxLength, autocomplete: p.autocomplete }); if (p.value) i.value = p.value; if (p.disabled) i.disabled = true; return field(p, i); }
  function TextArea(p) {
    p = p || {}; var t = el('textarea', 'fv-textarea', { placeholder: p.placeholder, maxlength: p.maxLength, rows: p.rows || 4 }); if (p.value) t.value = p.value; if (p.disabled) t.disabled = true;
    if (!p.voice) return field(p, t);
    var f = field(p, t); var wrap = el('div', 'fv-voice-wrap'); f.replaceChild(wrap, t); wrap.appendChild(t);
    var mic = el('button', 'fv-mic' + (p.recording ? ' is-recording' : ''), { type: 'button', 'aria-label': p.recording ? 'Stop recording' : 'Record your review', 'aria-pressed': String(!!p.recording) });
    mic.appendChild(icon(p.recording ? 'square' : 'mic', 'sm')); mic.appendChild(document.createTextNode(p.recording ? 'Stop' : 'Speak'));
    mic.addEventListener('click', function () { var on = !mic.classList.contains('is-recording'); mic.classList.toggle('is-recording', on); mic.setAttribute('aria-pressed', String(on)); mic.setAttribute('aria-label', on ? 'Stop recording' : 'Record your review'); mic.replaceChild(icon(on ? 'square' : 'mic', 'sm'), mic.firstChild); mic.lastChild.textContent = on ? 'Stop' : 'Speak'; if (p.onRecord) p.onRecord(on); });
    wrap.appendChild(mic);
    if (p.recording) { var bar = el('div', 'fv-rec-bar', { role: 'status', 'aria-live': 'polite' }); bar.appendChild(el('span', 'fv-rec-dot')); bar.appendChild(document.createTextNode('Listening')); var wave = el('span', 'fv-rec-wave', { 'aria-hidden': 'true' }); [6,10,14,8,16,12,6,10,18,8,12,6,14,10,8,16,6,12,10,8,14,6,10,16,8,12].forEach(function (h) { var i = el('i'); i.style.height = h + 'px'; wave.appendChild(i); }); bar.appendChild(wave); bar.appendChild(text('span', 'fv-rec-time', p.recordingTime || '0:00')); f.insertBefore(bar, wrap); }
    if (p.tidied) { var tb = el('div', 'fv-tidy-bar'); var left = el('span', '', {}); left.style.display = 'inline-flex'; left.style.alignItems = 'center'; left.style.gap = '8px'; left.appendChild(Badge({ label: 'Tidied from your recording', tone: 'accent', icon: 'wand' })); tb.appendChild(left); var back = Button({ variant: 'link', size: 'sm', label: 'Use my words as spoken', icon: 'undo', onClick: p.onRevert }); tb.appendChild(back); f.appendChild(tb); }
    return f;
  }
  function Select(p) { p = p || {}; var w = el('div', 'fv-select-wrap'); var s = el('select', 'fv-select'); (p.options || []).forEach(function (o) { var op = el('option', '', { value: o.value }); op.textContent = o.label; if (o.value === p.value) op.selected = true; s.appendChild(op); }); if (p.disabled) s.disabled = true; w.appendChild(s); w.appendChild(icon('chevron-down')); var f = field(p, s); f.replaceChild(w, s); w.insertBefore(s, w.firstChild); return f; }
  function choice(cls, p) { var l = el('label', 'fv-choice'); var i = el('input', cls, { type: 'checkbox', role: cls === 'fv-toggle' ? 'switch' : null }); i.checked = !!p.checked; if (p.disabled) i.disabled = true; if (p.onChange) i.addEventListener('change', function () { p.onChange(i.checked); }); var t = el('span', 'fv-choice-text'); t.appendChild(document.createTextNode(p.label || '')); if (p.help) t.appendChild(text('span', 'fv-choice-help', p.help)); if (cls === 'fv-toggle') { l.appendChild(t); l.appendChild(i); } else { l.appendChild(i); l.appendChild(t); } return l; }
  function Checkbox(p) { return choice('fv-checkbox', p || {}); }
  function Toggle(p) { return choice('fv-toggle', p || {}); }
  function ImageUploader(p) {
    p = p || {};
    var u = el('button', 'fv-uploader' + (p.src ? ' has-image' : '') + (p.wide ? ' fv-uploader-wide' : ''), { type: 'button', 'aria-label': p.src ? 'Replace image' : (p.label || 'Add an image') });
    if (p.src) u.appendChild(el('img', '', { src: p.src, alt: '' })); else { u.appendChild(icon('upload')); u.appendChild(text('span', '', p.label || 'Add an image')); u.appendChild(text('span', '', p.hint || 'Square, at least 600px')); }
    if (p.onPick) u.addEventListener('click', p.onPick);
    if (!p.src) return u;
    var wrap = el('div'); wrap.appendChild(u); var acts = el('div', 'fv-uploader-actions'); acts.appendChild(Button({ variant: 'tertiary', size: 'sm', label: 'Replace', onClick: p.onPick })); acts.appendChild(Button({ variant: 'link', size: 'sm', label: 'Remove', onClick: p.onRemove })); wrap.appendChild(acts); return wrap;
  }
  function ReferralCard(p) {
    p = p || {}; var pr = p.product || {};
    var r = el('div', 'fv-referral'); var th = el('div', 'fv-referral-thumb'); if (pr.image) th.appendChild(el('img', '', { src: pr.image, alt: '' })); else th.appendChild(icon('image')); r.appendChild(th);
    var t = el('div', 'fv-referral-text'); t.appendChild(text('div', 'fv-name', pr.name)); if (p.listName) t.appendChild(text('div', 'fv-meta', p.listName)); if (p.code) t.appendChild(CodeFrame({ label: p.codeLabel || 'Code', code: p.code })); else t.appendChild(text('div', 'fv-meta', 'No code yet')); r.appendChild(t);
    var acts = el('div', 'fv-referral-actions'); var e = el('button', 'fv-icon-btn', { type: 'button', 'aria-label': 'Edit code' }); e.appendChild(icon('pencil')); if (p.onEdit) e.addEventListener('click', p.onEdit); acts.appendChild(e); if (p.sortable) { var g = el('span', 'fv-icon-btn fv-grip', { 'aria-hidden': 'true' }); g.appendChild(icon('grip-horizontal')); acts.appendChild(g); } r.appendChild(acts);
    return r;
  }
  function NotificationRow(p) {
    p = p || {}; var a = p.actor || {};
    var row = el('a', 'fv-notification' + (p.read ? ' is-read' : ''), { href: p.href || '#' }); row.appendChild(Avatar({ name: a.name, src: a.avatar, size: 40 }));
    var t = el('div'); var s = el('div', 'fv-text'); s.appendChild(text('b', '', a.name)); s.appendChild(document.createTextNode(' ' + (p.message || ''))); t.appendChild(s); t.appendChild(text('div', 'fv-time', p.time)); row.appendChild(t); row.appendChild(el('span', 'fv-dot')); return row;
  }
  function Dialog(p) {
    p = p || {};
    var d = el('div', 'fv-dialog' + (p.sheet ? ' fv-sheet' : ''), { role: p.alert ? 'alertdialog' : 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'fv-dlg-title' });
    if (p.sheet) d.appendChild(el('div', 'fv-sheet-handle'));
    var head = el('div', 'fv-dialog-head'); head.appendChild(text('h2', 'fv-dialog-title', p.title)); head.firstChild.id = 'fv-dlg-title'; if (!p.sheet) { var x = el('button', 'fv-icon-btn', { type: 'button', 'aria-label': 'Close' }); x.appendChild(icon('x')); if (p.onClose) x.addEventListener('click', p.onClose); head.appendChild(x); } d.appendChild(head);
    var body = el('div', 'fv-dialog-body'); if (typeof p.body === 'string') body.appendChild(text('p', '', p.body)); else if (p.body) body.appendChild(p.body); d.appendChild(body);
    var foot = el('div', 'fv-dialog-foot'); (p.actions || []).forEach(function (a) { foot.appendChild(Button(a)); }); d.appendChild(foot);
    return d;
  }
  function Sheet(p) { p = p || {}; p.sheet = true; return Dialog(p); }
  function Alert(p) {
    p = p || {}; var ic = { success: 'check-circle', warning: 'alert-triangle', danger: 'x-circle' }[p.tone] || 'info';
    var a = el('div', 'fv-alert' + (p.tone ? ' fv-alert-' + p.tone : ''), { role: p.tone === 'danger' ? 'alert' : 'status' }); a.appendChild(icon(ic));
    var t = el('div', 'fv-alert-text'); if (p.title) { t.appendChild(text('b', '', p.title)); t.appendChild(document.createTextNode(' ')); } t.appendChild(document.createTextNode(p.message || '')); a.appendChild(t);
    if (p.dismissible) { var x = el('button', 'fv-icon-btn', { type: 'button', 'aria-label': 'Dismiss' }); x.appendChild(icon('x', 'sm')); x.addEventListener('click', function () { a.remove(); if (p.onDismiss) p.onDismiss(); }); a.appendChild(x); }
    return a;
  }
  function Toast(p) {
    p = p || {}; var ic = { success: 'check-circle', danger: 'x-circle' }[p.tone] || 'info';
    var t = el('div', 'fv-toast' + (p.tone ? ' fv-toast-' + p.tone : ''), { role: 'status' }); t.appendChild(icon(ic)); t.appendChild(text('span', 'fv-toast-text', p.message));
    if (p.action) t.appendChild(Button({ variant: 'link', size: 'sm', label: p.action.label, onClick: p.action.onClick }));
    var x = el('button', 'fv-icon-btn', { type: 'button', 'aria-label': 'Dismiss' }); x.appendChild(icon('x', 'sm')); x.addEventListener('click', function () { t.remove(); }); t.appendChild(x);
    if (p.duration !== 0) setTimeout(function () { t.remove(); }, p.duration || 4000);
    return t;
  }
  function EmptyState(p) {
    p = p || {}; var e = el('div', 'fv-empty'); e.appendChild(icon(p.icon || 'list')); e.appendChild(text('h3', '', p.title)); if (p.message) e.appendChild(text('p', '', p.message)); if (p.action) e.appendChild(Button(Object.assign({ variant: 'primary' }, p.action))); return e;
  }
  function Skeleton(p) { p = p || {}; var s = el('div', 'fv-skeleton' + (p.text ? ' fv-skeleton-text' : '') + (p.round ? ' fv-skeleton-round' : ''), { 'aria-hidden': 'true' }); s.style.width = typeof p.width === 'number' ? p.width + 'px' : (p.width || '100%'); if (p.height) s.style.height = typeof p.height === 'number' ? p.height + 'px' : p.height; return s; }
  function LoadMore(p) { p = p || {}; var l = el('div', 'fv-loadmore', { role: 'status', 'aria-live': 'polite' }); l.appendChild(el('span', 'fv-spinner')); l.appendChild(document.createTextNode(p.label || 'Loading more')); return l; }

  function FollowButton(p) {
    p = p || {};
    var b = el('button', 'fv-btn fv-btn-follow' + (p.size === 'sm' ? ' fv-btn-sm' : p.size === 'lg' ? ' fv-btn-lg' : '') + (p.following ? ' is-following' : ''), { type: 'button', 'aria-pressed': String(!!p.following) });
    b.appendChild(text('span', 'fv-lbl fv-lbl-main', 'Follow')); b.appendChild(text('span', 'fv-lbl fv-lbl-alt', 'Following'));
    b.addEventListener('click', function () { var on = !b.classList.contains('is-following'); b.classList.toggle('is-following', on); b.setAttribute('aria-pressed', String(on)); if (p.onToggle) p.onToggle(on); });
    return b;
  }
  function MarkLoader(p) {
    p = p || {};
    var m = el('div', 'fv-mark-loader' + (p.size === 'lg' ? ' fv-mark-loader-lg' : p.size === 'sm' ? ' fv-mark-loader-sm' : ''), { role: 'status', 'aria-label': p.label || 'Loading' });
    ['fv-mq fv-mq-a', 'fv-mq fv-mq-b', 'fv-mq fv-mq-c', 'fv-mq fv-mq-d', 'fv-ms fv-ms-1', 'fv-ms fv-ms-2', 'fv-ms fv-ms-3', 'fv-ms fv-ms-4'].forEach(function (c) { m.appendChild(el('i', c)); });
    return m;
  }
  var w = window; w.Favolist = w.Favolist || {};
  Object.assign(w.Favolist, { Button: Button, FollowButton: FollowButton, MarkLoader: MarkLoader, Avatar: Avatar, Badge: Badge, BrandChip: BrandChip, CodeFrame: CodeFrame, UserCard: UserCard, ProfileHeader: ProfileHeader, Tabs: Tabs, TopBar: TopBar, BottomBar: BottomBar, SideNav: SideNav, AsideRail: AsideRail, SearchField: SearchField, TextField: TextField, TextArea: TextArea, Select: Select, Checkbox: Checkbox, Toggle: Toggle, ImageUploader: ImageUploader, ProductCard: ProductCard, ListCard: ListCard, ReferralCard: ReferralCard, NotificationRow: NotificationRow, Dialog: Dialog, Sheet: Sheet, Alert: Alert, Toast: Toast, EmptyState: EmptyState, Skeleton: Skeleton, LoadMore: LoadMore, icon: icon });
})();
