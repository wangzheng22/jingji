const bidders = [
  {
    id: 1,
    name: "投标单位1111111",
    total: "233454万",
    abnormal: "233万",
    issues:
      "异常清单5条，报价占比9.1% 主材消耗量&综合单价均异常清单5条，报价占比9.1%",
    breakdown: [
      { label: "混凝土及钢筋混凝土工程", amount: "¥123万", pct: "5.3%" },
      { label: "砌筑工程", amount: "¥43万", pct: "1.8%" },
      { label: "屋面及防水工程", amount: "¥36万", pct: "1.5%" },
    ],
    checked: true,
  },
  {
    id: 2,
    name: "投标单位1111111",
    total: "233454万",
    abnormal: "233万",
    issues:
      "异常清单5条，报价占比9.1% 主材消耗量&综合单价均异常清单5条，报价占比9.1%",
    breakdown: [
      { label: "混凝土及钢筋混凝土工程", amount: "¥123万", pct: "5.3%" },
      { label: "砌筑工程", amount: "¥43万", pct: "1.8%" },
      { label: "屋面及防水工程", amount: "¥36万", pct: "1.5%" },
    ],
    checked: true,
  },
  {
    id: 3,
    name: "投标单位1111111",
    total: "233454万",
    abnormal: "233万",
    issues:
      "异常清单5条，报价占比9.1% 主材消耗量&综合单价均异常清单5条，报价占比9.1%",
    breakdown: [
      { label: "混凝土及钢筋混凝土工程", amount: "¥123万", pct: "5.3%" },
      { label: "砌筑工程", amount: "¥43万", pct: "1.8%" },
      { label: "屋面及防水工程", amount: "¥36万", pct: "1.5%" },
    ],
    checked: true,
  },
  {
    id: 4,
    name: "投标单位1111111",
    total: "233454万",
    abnormal: "233万",
    issues:
      "异常清单5条，报价占比9.1% 主材消耗量&综合单价均异常清单5条，报价占比9.1%",
    breakdown: [
      { label: "混凝土及钢筋混凝土工程", amount: "¥123万", pct: "5.3%" },
      { label: "砌筑工程", amount: "¥43万", pct: "1.8%" },
      { label: "屋面及防水工程", amount: "¥36万", pct: "1.5%" },
    ],
    checked: true,
  },
  {
    id: 5,
    name: "投标单位1111111",
    total: "233454万",
    abnormal: "233万",
    issues:
      "异常清单5条，报价占比9.1% 主材消耗量&综合单价均异常清单5条，报价占比9.1%",
    breakdown: [
      { label: "混凝土及钢筋混凝土工程", amount: "¥123万", pct: "5.3%" },
      { label: "砌筑工程", amount: "¥43万", pct: "1.8%" },
      { label: "屋面及防水工程", amount: "¥36万", pct: "1.5%" },
    ],
    checked: true,
  },
];

const listState = {
  page: 1,
  pageSize: 10,
};

function renderBreakdown(items) {
  return items
    .map(
      (item) =>
        `<span class="item">${item.label} <span class="amount">${item.amount}(${item.pct})</span></span>`
    )
    .join("");
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
      <div class="col col--breakdown" title="${escapeHtml(breakdownText(b.breakdown))}">${renderBreakdown(b.breakdown)}</div>
    </article>
  `
    )
    .join("");

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

renderRows();
