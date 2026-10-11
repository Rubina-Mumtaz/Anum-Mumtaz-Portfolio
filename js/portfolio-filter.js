(() => {
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const portfolioCards = Array.from(document.querySelectorAll(".portfolio-card[data-category]"));

  if (!filterButtons.length || !portfolioCards.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.filter;
      if (!selectedFilter) return;

      filterButtons.forEach((filterButton) => {
        const isSelected = filterButton === button;
        filterButton.classList.toggle("is-active", isSelected);
        filterButton.setAttribute("aria-pressed", String(isSelected));
      });

      portfolioCards.forEach((card) => {
        card.hidden = selectedFilter !== "all" && card.dataset.category !== selectedFilter;
      });
    });
  });
})();
