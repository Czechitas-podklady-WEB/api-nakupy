const fetchData = async () => {
  const resp = await fetch("/api/");
  if (!resp.ok) {
    alert("Chyba: " + resp.statusText);
    throw resp;
  }

  return await resp.json();
};

const renderItem = ({ id, product, amount, unit, done }) => {
  const icon = done ? "✓" : "—";
  return `<li class="product" id="product-${id}">
    <span>
        <span class="product__icon">${icon}</span>
        <span class="product__name">${product}</span>
    </span>
    <span class="product__amount">${amount ?? ""} ${unit ?? ""}</span>
  </li>`;
};

const dayNames = {
  mon: "pondělí",
  tue: "úterý",
  wed: "středa",
  thu: "čtvrtek",
  fri: "pátek",
  sat: "sobota",
  sun: "neděle",
};

const renderDay = ({ day, items }) => {
  return `<div class="day"><h2>${
    dayNames[day]
  }</h2><ul class="day__items">${items.map(renderItem).join("")}</ul></div>`;
};

const data = await fetchData();
document.querySelector("#app").innerHTML = `
    <h1>Nákupy</h1>
    <div class="week">
        ${data.map((dayItem) => renderDay(dayItem)).join("")}
    </div>
`;
