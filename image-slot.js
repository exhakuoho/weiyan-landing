/* image-slot.js — 靜態佔位版（微研 WEIYAN 正式站用）
 * 原始檔為 designcode 編輯器元件（會叫出檔案上傳視窗），已備份為
 * image-slot.editor-original.js.bak。此版本只顯示乾淨的深色佔位框，
 * 完全不含 <input type="file">，不會跳出檔案總管。
 *
 * 之後要放真實圖片：在對應的 <image-slot> 標籤加上 src 屬性即可，例如
 *   <image-slot src="images/mtc-v2.jpg" placeholder="MTC V2 產品照" ...>
 * 有 src 就顯示圖片（object-fit:cover），沒有就顯示佔位框。
 */
(function () {
  var STYLE =
    ':host{display:block;position:relative;overflow:hidden;background:#101114;}' +
    '.ph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
    'background:radial-gradient(circle at 50% 42%, #17181d 0%, #0d0e11 78%);text-align:center;padding:16px;box-sizing:border-box;}' +
    '.dot{width:9px;height:9px;border-radius:50%;background:#7868FF;opacity:.55;' +
    'box-shadow:0 0 0 5px rgba(120,104,255,.10);margin-bottom:12px;}' +
    '.txt{font:500 11px/1.5 "Space Grotesk","Noto Sans TC",system-ui,sans-serif;' +
    'letter-spacing:.14em;color:#5a5d66;opacity:.85;max-width:80%;}' +
    'img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}' +
    ':host([shape="circle"]) .ph,:host([shape="circle"]) img{border-radius:50%;}';

  function esc(s) { return String(s == null ? '' : s).replace(/[<>&"]/g, function (c) {
    return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c];
  }); }

  var ImageSlot = function () {};
  ImageSlot = class extends HTMLElement {
    static get observedAttributes() { return ['src', 'placeholder', 'shape']; }
    connectedCallback() {
      if (!this._root) this._root = this.attachShadow({ mode: 'open' });
      this._render();
    }
    attributeChangedCallback() { if (this._root) this._render(); }
    _render() {
      var src = this.getAttribute('src');
      var ph = esc(this.getAttribute('placeholder'));
      if (src) {
        this._root.innerHTML = '<style>' + STYLE + '</style>' +
          '<img alt="' + ph + '" src="' + esc(src) + '">';
      } else {
        this._root.innerHTML = '<style>' + STYLE + '</style>' +
          '<div class="ph"><span class="dot"></span>' +
          (ph ? '<span class="txt">' + ph + '</span>' : '') + '</div>';
      }
    }
  };

  if (!customElements.get('image-slot')) customElements.define('image-slot', ImageSlot);
})();
