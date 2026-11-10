/** 伪随机，按 id 固定，便于演示数据可复现 */
function seededUnit(id, salt) {
  const x = Math.sin(id * 7919 + salt * 9973) * 10000;
  return x - Math.floor(x);
}

const BIDDER_NAMES = [
  "中建幕墙集团有限公司",
  "江河创建集团股份有限公司",
  "远大幕墙工程有限公司",
  "金螳螂建筑装饰股份有限公司",
  "亚厦装饰股份有限公司",
  "深装总建设集团股份有限公司",
  "北京港源建筑装饰工程有限公司",
  "中建七局建筑装饰工程有限公司",
  "上海建工五建集团有限公司",
  "山河建设集团幕墙分公司",
  "浙江宝业幕墙装饰有限公司",
  "广东爱得威建设集团",
  "富力建筑幕墙（北京）有限公司",
  "苏州金螳螂幕墙有限公司",
  "深圳广田方特幕墙科技有限公司",
  "深圳装总建设集团",
  "北京江河幕墙系统工程公司",
  "中铁建设集团装饰工程有限公司",
  "浙江中南建设幕墙有限公司",
  "中国建筑第二工程局装饰",
  "北装总建筑装饰工程公司",
  "广东爱得威幕墙工程公司",
  "精工钢构幕墙事业部",
  "浙江亚厦幕墙有限公司",
  "上海杰思工程实业有限公司",
];

const BREAKDOWN_TEMPLATES = [
  { label: "混凝土及钢筋混凝土工程", w: 0.28, pctSpan: 3 },
  { label: "砌筑工程", w: 0.12, pctSpan: 1.2 },
  { label: "屋面及防水工程", w: 0.11, pctSpan: 1 },
  { label: "金属结构工程", w: 0.14, pctSpan: 1.4 },
  { label: "幕墙工程（龙骨及饰面）", w: 0.22, pctSpan: 4.5 },
  { label: "措施项目及其他", w: 0.13, pctSpan: 0.9 },
];

function formatWan(n) {
  return `${Math.round(n)}万`;
}

function formatYuanWan(n) {
  return `¥${Math.round(n)}万`;
}

function buildBreakdown(id, abnormalWan) {
  const count = 3 + (id % 3);
  const start = id % BREAKDOWN_TEMPLATES.length;
  const weights = [];
  for (let i = 0; i < count; i += 1) {
    const t = BREAKDOWN_TEMPLATES[(start + i) % BREAKDOWN_TEMPLATES.length];
    weights.push(t.w * (0.88 + seededUnit(id, 10 + i) * 0.28));
  }
  const sumW = weights.reduce((a, b) => a + b, 0);
  const items = [];
  for (let i = 0; i < count; i += 1) {
    const t = BREAKDOWN_TEMPLATES[(start + i) % BREAKDOWN_TEMPLATES.length];
    const amt = (abnormalWan * weights[i]) / sumW;
    const pct = ((100 * amt) / abnormalWan).toFixed(1);
    items.push({
      label: t.label,
      amount: formatYuanWan(amt),
      pct: `${pct}%`,
    });
  }
  return items;
}

function buildIssuesLineHtml(label, count, pct) {
  const p = Number(pct).toFixed(1);
  return (
    `${escapeHtml(label)}` +
    `<strong class="issues-num">${count}</strong>条，报价占比` +
    `<strong class="issues-num">${p}%</strong>`
  );
}

/** 异常类型统计四个维度，每维度一行；按单位展示 1～4 个维度 */
const ISSUE_DIMENSIONS = [
  "异常清单",
  "主材消耗量异常清单",
  "综合单价异常清单",
  "主材消耗量&综合单价均异常清单",
];

function issueDetailMetrics(id, totalItems, totalPct) {
  const nMat = 1;
  const nPrice = 1;
  const nBoth = Math.max(1, totalItems - nMat - nPrice);
  const pMat = Number(Math.max(0.3, totalPct * 0.14).toFixed(1));
  const pPrice = Number(Math.max(0.2, totalPct * 0.06).toFixed(1));
  const pBoth = Number(Math.max(0, totalPct - pMat - pPrice).toFixed(1));
  const mix = 0.18 + seededUnit(id, 41) * 0.12;
  const pMat3 = Number(Math.max(0.5, totalPct * mix).toFixed(1));
  const pPrice3 = Number(Math.max(0, totalPct - pMat3).toFixed(1));

  return {
    summary: { count: totalItems, pct: totalPct },
    mat: { count: nMat, pct: pMat },
    matShort: { count: nMat, pct: pMat3 },
    price: { count: nPrice, pct: pPrice },
    priceTail: { count: Math.max(1, totalItems - nMat), pct: pPrice3 },
    both: { count: nBoth, pct: pBoth },
    matOnly: { count: totalItems, pct: totalPct },
  };
}

function buildIssues(id, abnormalWan, totalWan) {
  const totalPct = Number(((abnormalWan / totalWan) * 100).toFixed(1));
  const totalItems = 5;
  const visibleCount = 1 + (id % 4);
  const m = issueDetailMetrics(id, totalItems, totalPct);

  const rowMetrics = [
    [m.summary],
    [m.summary, m.matOnly],
    [m.summary, m.matShort, m.priceTail],
    [m.summary, m.mat, m.price, m.both],
  ][visibleCount - 1];

  function plainLine(label, count, pct) {
    const p = Number(pct).toFixed(1);
    return `${label}${count}条，报价占比${p}%`;
  }

  const lines = rowMetrics.map((item, i) => ({
    text: plainLine(ISSUE_DIMENSIONS[i], item.count, item.pct),
    html: buildIssuesLineHtml(ISSUE_DIMENSIONS[i], item.count, item.pct),
  }));

  return {
    issuesText: lines.map((l) => l.text).join("\n"),
    issuesHtml: lines.map((l) => l.html).join("<br>"),
  };
}

function isScanFailed(id) {
  const u = seededUnit(id, 99);
  return u < 0.28;
}

function createBidder(id) {
  const u = seededUnit(id, 1);
  const totalWan = 16800 + Math.floor(u * 8800) + (id % 7) * 320;
  const abnormalWan = Math.max(
    86,
    Math.round(totalWan * (0.018 + seededUnit(id, 2) * 0.045))
  );
  const name = BIDDER_NAMES[(id - 1) % BIDDER_NAMES.length];
  const failed = isScanFailed(id);
  return {
    id,
    name: id <= BIDDER_NAMES.length ? name : `${name}（联合体${String(id).slice(-1)}）`,
    total: formatWan(totalWan),
    abnormalWan,
    abnormal: formatWan(abnormalWan),
    ...buildIssues(id, abnormalWan, totalWan),
    breakdown: buildBreakdown(id, abnormalWan),
    checked: true,
    failed,
  };
}

const BIDDER_POOL_COUNT = 50;
let bidderPool = Array.from({ length: BIDDER_POOL_COUNT }, (_, i) =>
  createBidder(i + 1)
);
let bidders = [];

/** 页面加载时建议质询单位数量（初始勾选），下方变更后仅作对比展示 */
let RECOMMENDED_INQUIRY_COUNT = 0;

const listState = {
  page: 1,
  pageSize: 20,
  /** 与智能监管一致：sortKey + sortDir */
  sortKey: "",
  /** @type {'' | 'asc' | 'desc'} */
  sortDir: "",
};

function renderBreakdownHtml(items) {
  return items
    .map(
      (item) =>
        `${escapeHtml(item.label)} <span class="amount">${escapeHtml(item.amount)}(${escapeHtml(item.pct)})</span>`
    )
    .join('<span class="breakdown-sep">；</span>');
}

function breakdownText(items) {
  return items
    .map((item) => `${item.label} ${item.amount}(${item.pct})`)
    .join("；");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isCellOverflowing(el) {
  if (!el) return false;
  return (
    el.scrollWidth > el.clientWidth + 1 ||
    el.scrollHeight > el.clientHeight + 1
  );
}

function syncRowOverflowTitles(row, bidder) {
  if (!row || !bidder) return;

  const nameText = row.querySelector(".bidder-name-cell__text");
  const nameCol = row.querySelector(".col--name");
  if (nameText && nameCol) {
    if (isCellOverflowing(nameText)) nameCol.title = bidder.name;
    else nameCol.removeAttribute("title");
  }

  const pairs = [[".col--issues-inner", bidder.issuesText]];
  pairs.forEach(([selector, text]) => {
    const el = row.querySelector(selector);
    if (!el) return;
    const cell = el.closest(".col--issues") || el;
    if (isCellOverflowing(el)) cell.title = text;
    else cell.removeAttribute("title");
  });

  const breakdownCell = row.querySelector(".col--breakdown");
  const breakdownInner = row.querySelector(".col--breakdown-inner");
  if (breakdownCell && breakdownInner) {
    const full = breakdownText(bidder.breakdown);
    if (isCellOverflowing(breakdownInner)) breakdownCell.title = full;
    else breakdownCell.removeAttribute("title");
  }
}

function getTotalPages() {
  return Math.max(1, Math.ceil(bidders.length / listState.pageSize));
}

function getAbnormalWan(bidder) {
  if (typeof bidder.abnormalWan === "number" && !Number.isNaN(bidder.abnormalWan)) {
    return bidder.abnormalWan;
  }
  const digits = String(bidder.abnormal || "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function getSortedBidders() {
  const list = bidders.slice();
  if (listState.sortKey === "abnormal" && listState.sortDir) {
    const dir = listState.sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => (getAbnormalWan(a) - getAbnormalWan(b)) * dir);
  }
  return list;
}

function getPageRows() {
  const start = (listState.page - 1) * listState.pageSize;
  return getSortedBidders().slice(start, start + listState.pageSize);
}

function syncAbnormalSortHeader() {
  const btn = document.getElementById("sort-abnormal");
  if (!btn) return;

  const active = listState.sortKey === "abnormal" && listState.sortDir;
  btn.classList.toggle("is-on", Boolean(active));
  const ico = btn.querySelector(".sort-ico");
  if (ico) {
    ico.classList.remove("asc", "desc");
    if (active) ico.classList.add(listState.sortDir);
  }
  btn.setAttribute(
    "aria-sort",
    active
      ? listState.sortDir === "asc"
        ? "ascending"
        : "descending"
      : "none"
  );
}

function cycleAbnormalSort() {
  const key = "abnormal";
  if (listState.sortKey !== key) {
    listState.sortKey = key;
    listState.sortDir = "desc";
  } else if (listState.sortDir === "desc") {
    listState.sortDir = "asc";
  } else {
    listState.sortKey = "";
    listState.sortDir = "";
  }
  listState.page = 1;
  syncAbnormalSortHeader();
  renderRows();
  document.getElementById("bid-table-scroll")?.scrollTo({ top: 0 });
}

function syncHeaderCheckbox() {
  const checkAll = document.getElementById("check-all");
  const pageRows = getPageRows();
  if (!checkAll) return;

  if (pageRows.length === 0) {
    checkAll.checked = false;
    checkAll.indeterminate = false;
    return;
  }

  const checkedCount = pageRows.filter((b) => b.checked).length;
  checkAll.checked = checkedCount === pageRows.length;
  checkAll.indeterminate =
    checkedCount > 0 && checkedCount < pageRows.length;
}

function setBidderChecked(id, checked) {
  const bidder = bidders.find((b) => b.id === id);
  if (bidder) bidder.checked = checked;
}

function setPageRowsChecked(checked) {
  getPageRows().forEach((b) => {
    b.checked = checked;
  });
}

function getSelectedCount() {
  return bidders.filter((b) => b.checked).length;
}

function syncSelectionUI() {
  const total = bidders.length;
  const selected = getSelectedCount();

  const totalEl = document.getElementById("summary-total");
  if (totalEl) {
    totalEl.innerHTML = `共 <strong class="summary-panel__num">${total}</strong> 家`;
  }

  const selectedEl = document.getElementById("summary-selected");
  if (selectedEl) {
    selectedEl.innerHTML = `已选 <strong class="summary-panel__num">${selected}</strong> 家`;
  }

  const labelEl = document.getElementById("btn-primary-label");
  if (labelEl) {
    labelEl.textContent =
      selected === total ? "一键质询" : `质询 ${selected}家`;
  }

  const alertCountEl = document.getElementById("alert-inquiry-count");
  if (alertCountEl) {
    alertCountEl.textContent = String(RECOMMENDED_INQUIRY_COUNT);
  }

  const suffixEl = document.getElementById("alert-selected-suffix");
  const selectedInlineEl = document.getElementById("alert-selected-inline");
  if (suffixEl && selectedInlineEl) {
    if (selected !== RECOMMENDED_INQUIRY_COUNT) {
      suffixEl.hidden = false;
      selectedInlineEl.textContent = String(selected);
    } else {
      suffixEl.hidden = true;
    }
  }
}

function applyRowChecked(row, checked) {
  const input = row.querySelector(".bid-row__check");
  if (input) input.checked = checked;

  const id = Number(row.dataset.id);
  setBidderChecked(id, checked);
  row.classList.toggle("is-selected", checked);
  row.classList.toggle("is-unselected", !checked);
  syncHeaderCheckbox();
  syncSelectionUI();
}

function renderRows() {
  const container = document.getElementById("bidder-rows");
  if (!container) return;

  const rows = getPageRows();
  const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  container.innerHTML = rows
    .map(
      (b, i) => `
    <article class="bid-row ${motionOk ? "bid-row--enter " : ""}${b.checked ? "is-selected" : "is-unselected"}" data-id="${b.id}" style="--enter-i: ${i}">
      <div class="col col--check">
        <input type="checkbox" class="bid-row__check" ${b.checked ? "checked" : ""} aria-label="选择${escapeHtml(b.name)}" />
      </div>
      <div class="col col--name">
        <span class="bidder-name-cell">
          <span class="bidder-name-cell__icon-wrap" aria-hidden="true">
            <img
              class="bidder-name-cell__icon bidder-name-cell__icon--off"
              src="assets/企业@2x.png"
              width="16"
              height="16"
              alt=""
            />
            <img
              class="bidder-name-cell__icon bidder-name-cell__icon--on"
              src="assets/企业选中@2x.png"
              width="16"
              height="16"
              alt=""
            />
          </span>
          <span class="bidder-name-cell__text">${escapeHtml(b.name)}</span>
        </span>
      </div>
      <div class="col col--total">${escapeHtml(b.total)}</div>
      <div class="col col--abnormal">${escapeHtml(b.abnormal)}</div>
      <div class="col col--issues">
        <div class="col--issues-inner">${b.issuesHtml}</div>
      </div>
      <div class="col col--breakdown">
        <div class="col--breakdown-inner">${renderBreakdownHtml(b.breakdown)}</div>
      </div>
    </article>
  `
    )
    .join("");

  requestAnimationFrame(() => {
    const rowEls = container.querySelectorAll(".bid-row");
    rowEls.forEach((row) => {
      const id = Number(row.dataset.id);
      const bidder = bidders.find((x) => x.id === id);
      syncRowOverflowTitles(row, bidder);
    });
    if (motionOk && rowEls.length > 0) {
      const stagger = 56;
      const duration = 560;
      const lastEnd =
        (rowEls.length - 1) * stagger + duration + 40;
      setTimeout(() => {
        rowEls.forEach((row) => row.classList.remove("bid-row--enter"));
      }, lastEnd);
    }
  });

  const totalEl = document.getElementById("total-count");
  if (totalEl) totalEl.textContent = String(bidders.length);

  renderPagination();
  syncHeaderCheckbox();
  syncSelectionUI();
  syncAbnormalSortHeader();
}

function renderPagination() {
  const nav = document.getElementById("pagination");
  if (!nav) return;

  const totalPages = getTotalPages();
  if (listState.page > totalPages) {
    listState.page = totalPages;
  }

  const pages = buildPageList(listState.page, totalPages);
  const parts = [
    `<button type="button" class="pagination__btn" data-page="prev" ${listState.page <= 1 ? "disabled" : ""} aria-label="上一页">‹</button>`,
  ];

  pages.forEach((p) => {
    if (p === "...") {
      parts.push('<span class="pagination__ellipsis">…</span>');
      return;
    }
    const active = p === listState.page ? " is-active" : "";
    parts.push(
      `<button type="button" class="pagination__btn${active}" data-page="${p}">${p}</button>`
    );
  });

  parts.push(
    `<button type="button" class="pagination__btn" data-page="next" ${listState.page >= totalPages ? "disabled" : ""} aria-label="下一页">›</button>`
  );

  nav.innerHTML = parts.join("");
}

function buildPageList(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

document.getElementById("pagination")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-page]");
  if (!btn || btn.disabled) return;

  const totalPages = getTotalPages();
  const action = btn.getAttribute("data-page");

  if (action === "prev") {
    listState.page = Math.max(1, listState.page - 1);
  } else if (action === "next") {
    listState.page = Math.min(totalPages, listState.page + 1);
  } else {
    listState.page = Number(action);
  }

  renderRows();
  document.getElementById("bid-table-scroll")?.scrollTo({ top: 0 });
});

document.getElementById("bid-table-scroll")?.addEventListener("click", (e) => {
  const sortBtn = e.target.closest("[data-sort]");
  if (!sortBtn) return;
  e.preventDefault();
  e.stopPropagation();
  cycleAbnormalSort();
});

document.getElementById("page-size")?.addEventListener("change", (e) => {
  listState.pageSize = Number(e.target.value);
  listState.page = 1;
  renderRows();
  document.getElementById("bid-table-scroll")?.scrollTo({ top: 0 });
});

document.getElementById("check-all")?.addEventListener("change", (e) => {
  setPageRowsChecked(e.target.checked);
  renderRows();
});

document.getElementById("bidder-rows")?.addEventListener("change", (e) => {
  const input = e.target;
  if (!input.classList.contains("bid-row__check")) return;

  const row = input.closest(".bid-row");
  if (!row) return;

  applyRowChecked(row, input.checked);
});

document.getElementById("bidder-rows")?.addEventListener("click", (e) => {
  if (e.target.closest('input[type="checkbox"]')) return;

  const row = e.target.closest(".bid-row");
  if (!row) return;

  const input = row.querySelector(".bid-row__check");
  if (!input) return;

  applyRowChecked(row, !input.checked);
});

const INQUIRY_ITEM_CATALOG = [
  { code: "011201001001", name: "墙面一般抹灰 1:3水泥砂浆18厚" },
  { code: "011201001002", name: "墙面一般抹灰 1:2.5水泥砂浆20厚" },
  { code: "011201001003", name: "天棚一般抹灰 1:3水泥砂浆15厚" },
  { code: "010503001001", name: "实心砖墙 MU10砖 M7.5水泥砂浆" },
  { code: "010401001001", name: "混凝土矩形柱 C30" },
  { code: "03B001001001", name: "幕墙龙骨 热镀锌钢立柱" },
  { code: "03B002001001", name: "玻璃幕墙面板 中空Low-E" },
  { code: "011702001001", name: "脚手架 外墙装饰用" },
];

let inquiryModalUnits = [];

function buildInquiryItemsForBidder(bidder) {
  const itemCount = 5;
  const items = [];
  for (let i = 0; i < itemCount; i += 1) {
    const cat = INQUIRY_ITEM_CATALOG[(bidder.id + i) % INQUIRY_ITEM_CATALOG.length];
    items.push({
      id: `${bidder.id}-${i}`,
      code: cat.code,
      name: cat.name,
      checked: true,
    });
  }
  return items;
}

function areAllInquiryExpanded() {
  return (
    inquiryModalUnits.length > 0 &&
    inquiryModalUnits.every((unit) => unit.expanded)
  );
}

function syncInquiryExpandToggleBtn() {
  const btn = document.getElementById("inquiry-toggle-expand");
  if (!btn) return;
  btn.textContent = areAllInquiryExpanded() ? "全部收起" : "全部展开";
}

function toggleInquiryExpandAll() {
  const expand = !areAllInquiryExpanded();
  inquiryModalUnits.forEach((unit) => {
    unit.expanded = expand;
  });
  renderInquiryDialog();
}

function syncInquiryUnitCheckState(unit) {
  const checkedItems = unit.items.filter((item) => item.checked);
  unit.unitChecked = checkedItems.length === unit.items.length;
  unit.indeterminate =
    checkedItems.length > 0 && checkedItems.length < unit.items.length;
}

function getInquiryCounts() {
  let units = 0;
  let items = 0;
  inquiryModalUnits.forEach((unit) => {
    const picked = unit.items.filter((item) => item.checked);
    if (picked.length > 0) {
      units += 1;
      items += picked.length;
    }
  });
  return { units, items };
}

function findInquiryUnit(bidderId) {
  return inquiryModalUnits.find((unit) => unit.bidderId === bidderId);
}

function renderInquiryDialog() {
  const list = document.getElementById("inquiry-dialog-list");
  const summary = document.getElementById("inquiry-dialog-summary");
  if (!list) return;

  list.innerHTML = inquiryModalUnits
    .map(
      (unit) => `
      <div class="inquiry-unit ${unit.expanded ? "is-open" : ""}" data-bidder-id="${unit.bidderId}">
        <div class="inquiry-unit__head">
          <input type="checkbox" class="inquiry-unit__check" ${unit.unitChecked ? "checked" : ""} aria-label="选择${escapeHtml(unit.name)}" />
          <button type="button" class="inquiry-unit__toggle" aria-label="${unit.expanded ? "收起" : "展开"}清单">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M4 2 8 6 4 10V2z"/></svg>
          </button>
          <span class="inquiry-unit__name">${escapeHtml(unit.name)}</span>
          <span class="inquiry-unit__count">${unit.items.filter((i) => i.checked).length}/${unit.items.length}</span>
        </div>
        <div class="inquiry-unit__items">
          ${unit.items
            .map(
              (item) => `
            <div class="inquiry-item">
              <input type="checkbox" class="inquiry-item__check" data-item-id="${escapeHtml(item.id)}" ${item.checked ? "checked" : ""} aria-label="选择清单 ${escapeHtml(item.code)}" />
              <span class="inquiry-item__main"><span class="inquiry-item__code">${escapeHtml(item.code)}</span>${escapeHtml(item.name)}</span>
            </div>`
            )
            .join("")}
        </div>
      </div>`
    )
    .join("");

  list.querySelectorAll(".inquiry-unit").forEach((el) => {
    const unit = findInquiryUnit(Number(el.dataset.bidderId));
    const check = el.querySelector(".inquiry-unit__check");
    if (unit && check) {
      check.checked = unit.unitChecked;
      check.indeterminate = unit.indeterminate;
    }
  });

  const { units, items } = getInquiryCounts();
  if (summary) {
    summary.innerHTML = `已选 <strong>${units}</strong> 家投标单位，共 <strong>${items}</strong> 条清单`;
  }
  syncInquiryExpandToggleBtn();
}

function openInquiryDialog() {
  const dialog = document.getElementById("inquiry-dialog");
  if (!dialog) return;

  const selected = bidders.filter((b) => b.checked);
  if (selected.length === 0) {
    alert("请先在表格中勾选至少一家投标单位");
    return;
  }

  inquiryModalUnits = selected.map((b) => ({
    bidderId: b.id,
    name: b.name,
    expanded: true,
    unitChecked: true,
    indeterminate: false,
    items: buildInquiryItemsForBidder(b),
  }));

  renderInquiryDialog();
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function closeInquiryDialog() {
  const dialog = document.getElementById("inquiry-dialog");
  if (!dialog) return;
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

document.getElementById("inquiry-dialog-list")?.addEventListener("click", (e) => {
  const toggle = e.target.closest(".inquiry-unit__toggle");
  if (!toggle) return;
  const unitEl = toggle.closest(".inquiry-unit");
  const unit = findInquiryUnit(Number(unitEl?.dataset.bidderId));
  if (!unit || !unitEl) return;
  unit.expanded = !unit.expanded;
  unitEl.classList.toggle("is-open", unit.expanded);
  toggle.setAttribute("aria-label", unit.expanded ? "收起清单" : "展开清单");
  syncInquiryExpandToggleBtn();
});

document.getElementById("inquiry-toggle-expand")?.addEventListener("click", () => {
  toggleInquiryExpandAll();
});

document.getElementById("inquiry-dialog-list")?.addEventListener("change", (e) => {
  const input = e.target;
  if (input.type !== "checkbox") return;

  const unitEl = input.closest(".inquiry-unit");
  if (!unitEl) return;
  const unit = findInquiryUnit(Number(unitEl.dataset.bidderId));
  if (!unit) return;

  if (input.classList.contains("inquiry-unit__check")) {
    unit.items.forEach((item) => {
      item.checked = input.checked;
    });
    syncInquiryUnitCheckState(unit);
    renderInquiryDialog();
    return;
  }

  if (input.classList.contains("inquiry-item__check")) {
    const item = unit.items.find((i) => i.id === input.dataset.itemId);
    if (item) item.checked = input.checked;
    syncInquiryUnitCheckState(unit);
    renderInquiryDialog();
  }
});

document.querySelector(".btn--primary")?.addEventListener("click", () => {
  openInquiryDialog();
});

document.getElementById("inquiry-dialog-close")?.addEventListener("click", closeInquiryDialog);
document.getElementById("inquiry-dialog-cancel")?.addEventListener("click", closeInquiryDialog);
document.getElementById("inquiry-dialog-submit")?.addEventListener("click", () => {
  const { units, items } = getInquiryCounts();
  alert(`将生成质询函：${units} 家单位，${items} 条清单（演示）`);
  closeInquiryDialog();
});

document.querySelector(".btn--outline")?.addEventListener("click", () => {
  alert("异常清单明细（演示）");
});

let reasonTypewriterTimer = null;

function runReasonTypewriter() {
  const el = document.getElementById("alert-reason-body");
  if (!el) return;

  const full =
    el.getAttribute("data-full-text") ||
    el.dataset.fullText ||
    el.textContent.trim();
  if (!full) return;

  if (reasonTypewriterTimer) {
    clearTimeout(reasonTypewriterTimer);
    reasonTypewriterTimer = null;
  }

  el.classList.remove("is-typing", "is-empty");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = full;
    return;
  }

  el.textContent = "";
  el.classList.add("is-typing", "is-empty");

  let i = 0;
  const step = () => {
    i += 1;
    el.textContent = full.slice(0, i);
    if (i === 1) el.classList.remove("is-empty");
    if (i < full.length) {
      reasonTypewriterTimer = setTimeout(step, 42);
    } else {
      el.classList.remove("is-typing");
      reasonTypewriterTimer = null;
    }
  };
  reasonTypewriterTimer = setTimeout(step, 80);
}

function finishScanAndShow(pool) {
  bidders = pool
    .filter((b) => b.failed)
    .map((b, idx) => {
      const { failed: _f, ...rest } = b;
      return { ...rest, id: idx + 1, checked: true };
    });
  RECOMMENDED_INQUIRY_COUNT = bidders.filter((b) => b.checked).length;
  listState.page = 1;
  renderRows();
  setTimeout(() => runReasonTypewriter(), 200);
}

function runEntryScan() {
  const overlay = document.getElementById("scan-overlay");
  const listEl = document.getElementById("scan-list");
  const curEl = document.getElementById("scan-progress-curr");
  const totalEl = document.getElementById("scan-progress-total");
  if (!overlay || !listEl) {
    bidders = bidderPool.map((b, idx) => {
      const { failed: _f, ...rest } = b;
      return { ...rest, id: idx + 1, checked: true };
    });
    RECOMMENDED_INQUIRY_COUNT = bidders.filter((b) => b.checked).length;
    renderRows();
    return;
  }

  document.body.classList.add("is-scanning-main");
  overlay.hidden = false;
  if (totalEl) totalEl.textContent = String(bidderPool.length);
  if (curEl) curEl.textContent = "0";

  listEl.innerHTML = bidderPool
    .map(
      (b, i) => `
    <div class="scan-row" data-scan-id="${b.id}" id="scan-row-${b.id}">
      <span class="scan-row__idx">${String(i + 1).padStart(2, "0")}</span>
      <span class="scan-row__name">${escapeHtml(b.name)}</span>
      <span class="scan-row__badge" id="scan-badge-${b.id}" aria-hidden="true"></span>
    </div>`
    )
    .join("");

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const stepMs = prefersReduced ? 0 : 52;

  let i = 0;

  function step() {
    if (i > 0) {
      const prev = bidderPool[i - 1];
      const prevRow = document.getElementById(`scan-row-${prev.id}`);
      if (prevRow) prevRow.classList.remove("is-active");
      if (!prev.failed && prevRow) {
        prevRow.classList.remove("is-pass", "is-fail");
        const prevBadge = document.getElementById(`scan-badge-${prev.id}`);
        if (prevBadge) {
          prevBadge.textContent = "";
          prevBadge.classList.remove("is-pass", "is-fail");
        }
        prevRow.classList.add("is-done-pass");
      }
    }

    if (i >= bidderPool.length) {
      setTimeout(() => finishScanUI(), prefersReduced ? 0 : 380);
      return;
    }

    const b = bidderPool[i];
    if (curEl) curEl.textContent = String(i + 1);

    const row = document.getElementById(`scan-row-${b.id}`);
    const badge = document.getElementById(`scan-badge-${b.id}`);
    if (row) row.classList.add("is-active");
    if (badge && row) {
      if (b.failed) {
        row.classList.add("is-fail");
        badge.textContent = "未通过";
        badge.classList.add("is-fail");
      } else {
        row.classList.add("is-pass");
        badge.textContent = "通过";
        badge.classList.add("is-pass");
      }
    }

    i += 1;
    setTimeout(step, stepMs);
  }

  function finishScanUI() {
    overlay.classList.add("is-leaving");
    setTimeout(() => {
      overlay.hidden = true;
      overlay.classList.remove("is-leaving");
      document.body.classList.remove("is-scanning-main");
      finishScanAndShow(bidderPool);
    }, prefersReduced ? 0 : 440);
  }

  requestAnimationFrame(() => step());
}

if (document.getElementById("scan-overlay")) {
  runEntryScan();
} else {
  bidders = bidderPool.map((b, idx) => {
    const { failed: _f, ...rest } = b;
    return { ...rest, id: idx + 1, checked: true };
  });
  RECOMMENDED_INQUIRY_COUNT = bidders.filter((b) => b.checked).length;
  renderRows();
  setTimeout(() => runReasonTypewriter(), 120);
}
