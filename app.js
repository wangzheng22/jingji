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

function buildIssues(id, abnormalWan, totalWan) {
  const n1 = 3 + (id % 6);
  const n2 = 2 + (id % 5);
  const pct = ((abnormalWan / totalWan) * 100).toFixed(1);
  const p2 = ((45 + (id % 50)) / 10).toFixed(1);
  return (
    `异常清单${n1}条，报价占比${pct}% ` +
    `主材消耗量&综合单价均异常清单${n2}条，报价占比${p2}%`
  );
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
    abnormal: formatWan(abnormalWan),
    issues: buildIssues(id, abnormalWan, totalWan),
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
  pageSize: 10,
};

function renderBreakdownHtml(items) {
  return items
    .map(
      (item) =>
        `${escapeHtml(item.label)} <span class="amount">${escapeHtml(item.amount)}(${escapeHtml(item.pct)})</span>`
    )
    .join("<br>");
}

function breakdownText(items) {
  return items
    .map((item) => `${item.label} ${item.amount}(${item.pct})`)
    .join(" ");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getTotalPages() {
  return Math.max(1, Math.ceil(bidders.length / listState.pageSize));
}

function getPageRows() {
  const start = (listState.page - 1) * listState.pageSize;
  return bidders.slice(start, start + listState.pageSize);
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
  if (totalEl) totalEl.textContent = `共 ${total} 家`;

  const selectedEl = document.getElementById("summary-selected");
  if (selectedEl) selectedEl.textContent = `已选 ${selected} 家`;

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
  container.innerHTML = rows
    .map(
      (b) => `
    <article class="bid-row ${b.checked ? "is-selected" : "is-unselected"}" data-id="${b.id}">
      <div class="col col--check">
        <input type="checkbox" class="bid-row__check" ${b.checked ? "checked" : ""} aria-label="选择${escapeHtml(b.name)}" />
      </div>
      <div class="col col--name" title="${escapeHtml(b.name)}">${escapeHtml(b.name)}</div>
      <div class="col col--total">${escapeHtml(b.total)}</div>
      <div class="col col--abnormal">${escapeHtml(b.abnormal)}</div>
      <div class="col col--issues" title="${escapeHtml(b.issues)}">${escapeHtml(b.issues)}</div>
      <div class="col col--breakdown">
        <div class="col--breakdown-inner">${renderBreakdownHtml(b.breakdown)}</div>
        <span class="col--breakdown-more" hidden aria-hidden="true">更多…</span>
      </div>
    </article>
  `
    )
    .join("");

  requestAnimationFrame(() => {
    container.querySelectorAll(".col--breakdown").forEach((cell) => {
      const row = cell.closest(".bid-row");
      const id = Number(row?.dataset?.id);
      const bidder = bidders.find((x) => x.id === id);
      const inner = cell.querySelector(".col--breakdown-inner");
      const more = cell.querySelector(".col--breakdown-more");
      if (!inner || !more || !bidder) return;

      const full = breakdownText(bidder.breakdown);
      const overflow = inner.scrollHeight > inner.clientHeight + 1;
      more.hidden = !overflow;
      cell.title = full;
    });
  });

  const totalEl = document.getElementById("total-count");
  if (totalEl) totalEl.textContent = String(bidders.length);

  renderPagination();
  syncHeaderCheckbox();
  syncSelectionUI();
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

document.querySelector(".btn--primary")?.addEventListener("click", () => {
  alert(`将对已选 ${getSelectedCount()} 家投标单位发起质询（演示）`);
});

document.querySelector(".btn--outline")?.addEventListener("click", () => {
  alert("导出报告（演示）");
});

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
}
