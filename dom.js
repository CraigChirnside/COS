// Minimal keyed DOM reconciler. Stands in for the design-canvas runtime that
// rendered the mock: the view is a pure function of state, but nodes are
// patched in place so focus, caret position and scroll survive a re-render.
(function () {

  // Attributes whose value lives on the DOM property, not the markup attribute.
  const PROPS = { value: 1, checked: 1, readOnly: 1, disabled: 1 };
  // Camel-cased attribute names that need a different spelling in markup.
  const ATTR_ALIAS = { inputMode: 'inputmode', defaultValue: 'value', htmlFor: 'for' };

  function el(tag, attrs, ...children) {
    return { t: tag, a: attrs || {}, c: children };
  }

  // Raw markup escape hatch — used for the inline SVG icons, which never change.
  function raw(html) {
    return { raw: html };
  }

  function flatten(children, out) {
    for (const ch of children) {
      // '' is dropped alongside the other empties so that a falsy `cond && node`
      // never leaves a stray text node behind and shift its siblings' positions.
      if (ch === null || ch === undefined || ch === false || ch === true || ch === '') continue;
      if (Array.isArray(ch)) flatten(ch, out);
      else out.push(ch);
    }
    return out;
  }

  function create(vn) {
    if (vn.raw !== undefined) {
      const holder = document.createElement('div');
      holder.innerHTML = vn.raw;
      const node = holder.firstElementChild;
      node.__raw = vn.raw;
      return node;
    }
    const node = document.createElement(vn.t);
    node.__key = vn.a.key;
    applyAttrs(node, vn.a);
    patch(node, vn.c);
    return node;
  }

  function applyAttrs(node, attrs) {
    const prev = node.__a || {};
    for (const k in prev) {
      if (k in attrs || k === 'key') continue;
      if (k.charCodeAt(0) === 111 && k.charCodeAt(1) === 110 && k[2] >= 'A' && k[2] <= 'Z') {
        node[k.toLowerCase()] = null;
      } else if (PROPS[k]) {
        node[k] = k === 'value' ? '' : false;
      } else {
        node.removeAttribute(ATTR_ALIAS[k] || k);
      }
    }
    for (const k in attrs) {
      if (k === 'key') continue;
      const v = attrs[k];
      if (k.charCodeAt(0) === 111 && k.charCodeAt(1) === 110 && k[2] >= 'A' && k[2] <= 'Z') {
        node[k.toLowerCase()] = v || null;       // onClick -> onclick, replaces cleanly
      } else if (PROPS[k]) {
        // Assigning an unchanged value would still reset the caret in some
        // browsers, so only touch the property when it actually differs.
        const next = k === 'value' ? String(v) : !!v;
        if (node[k] !== next) node[k] = next;
      } else if (v === null || v === undefined || v === false) {
        node.removeAttribute(ATTR_ALIAS[k] || k);
      } else if (prev[k] !== v) {
        node.setAttribute(ATTR_ALIAS[k] || k, v);
      }
    }
    node.__a = attrs;
  }

  function reusable(node, vn) {
    if (!node) return false;
    if (vn.raw !== undefined) return node.nodeType === 1 && node.__raw === vn.raw;
    if (typeof vn === 'object') {
      return node.nodeType === 1
        && node.tagName.toLowerCase() === vn.t
        && node.__key === vn.a.key;
    }
    return node.nodeType === 3;
  }

  function patch(parent, children) {
    const list = flatten(children, []);
    let i = 0;
    for (const vn of list) {
      const existing = parent.childNodes[i];
      let node;
      if (typeof vn === 'string' || typeof vn === 'number') {
        const text = String(vn);
        if (reusable(existing, vn)) {
          if (existing.data !== text) existing.data = text;
          node = existing;
        } else {
          node = document.createTextNode(text);
        }
      } else if (reusable(existing, vn)) {
        node = existing;
        if (vn.raw === undefined) {
          applyAttrs(node, vn.a);
          patch(node, vn.c);
        }
      } else {
        node = create(vn);
      }
      if (node !== existing) {
        if (existing) parent.replaceChild(node, existing);
        else parent.appendChild(node);
      }
      i++;
    }
    while (parent.childNodes.length > i) parent.removeChild(parent.lastChild);
  }

  window.COSDom = { el, raw, patch };
})();
