

const sampleOrders = [
    { id: 1001, date: "2026-01-05", product: "Laptop", category: "Electronics", region: "East", quantity: 2, price: 50000, cost: 38000, expense: 2000 },
    { id: 1002, date: "2026-01-12", product: "Office Chair", category: "Furniture", region: "North", quantity: 5, price: 5000, cost: 3000, expense: 1500 },
    { id: 1003, date: "2026-02-03", product: "Smartphone", category: "Electronics", region: "West", quantity: 4, price: 20000, cost: 15000, expense: 1000 },
    { id: 1004, date: "2026-02-18", product: "Desk", category: "Furniture", region: "South", quantity: 3, price: 8000, cost: 5000, expense: 1200 },
    { id: 1005, date: "2026-03-07", product: "Headphones", category: "Accessories", region: "East", quantity: 10, price: 2000, cost: 1000, expense: 800 },
    { id: 1006, date: "2026-03-20", product: "Monitor", category: "Electronics", region: "North", quantity: 3, price: 12000, cost: 9000, expense: 900 },
    { id: 1007, date: "2026-04-02", product: "Bookshelf", category: "Furniture", region: "West", quantity: 2, price: 7000, cost: 4500, expense: 700 },
    { id: 1008, date: "2026-04-15", product: "Keyboard", category: "Accessories", region: "South", quantity: 8, price: 1500, cost: 700, expense: 400 }
];

let orders = [];

try {
    const savedOrders = localStorage.getItem("businessDashboardOrders");
    orders = savedOrders ? JSON.parse(savedOrders) : sampleOrders;
    if (!Array.isArray(orders)) orders = sampleOrders;
} catch (error) {
    orders = sampleOrders;
}

let salesChart = null;
let categoryChart = null;

const money = value =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value);

function saveOrders() {
    localStorage.setItem("businessDashboardOrders", JSON.stringify(orders));
}

function getRevenue(order) {
    return Number(order.quantity) * Number(order.price);
}

function getExpenses(order) {
    return Number(order.quantity) * Number(order.cost) + Number(order.expense);
}

function getProfit(order) {
    return getRevenue(order) - getExpenses(order);
}

function updateSummary() {
    const revenue = orders.reduce((sum, order) => sum + getRevenue(order), 0);
    const expenses = orders.reduce((sum, order) => sum + getExpenses(order), 0);
    const profit = revenue - expenses;

    document.getElementById("revenue").textContent = money(revenue);
    document.getElementById("expenses").textContent = money(expenses);
    document.getElementById("profit").textContent = money(profit);
    document.getElementById("orders").textContent = orders.length;
}

function renderTable() {
    const tableBody = document.getElementById("orderTable");
    const searchInput = document.getElementById("searchInput");
    const searchText = searchInput.value.trim().toLowerCase();

    const filteredOrders = orders.filter(order =>
        [order.product, order.region, order.category, order.date, order.id]
            .some(value => String(value).toLowerCase().includes(searchText))
    );

    tableBody.innerHTML = "";

    if (filteredOrders.length === 0) {
        tableBody.innerHTML =
            '<tr><td colspan="5">No matching orders found.</td></tr>';
        return;
    }

    filteredOrders.forEach(order => {
        const row = document.createElement("tr");

        const values = [
            order.product,
            order.region,
            money(getRevenue(order)),
            money(getExpenses(order)),
            money(getProfit(order))
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}

function renderCharts() {
    if (typeof Chart === "undefined") return;

    const monthlySales = {};
    const categorySales = {};

    orders.forEach(order => {
        const month = String(order.date).slice(0, 7);
        monthlySales[month] = (monthlySales[month] || 0) + getRevenue(order);
        categorySales[order.category] =
            (categorySales[order.category] || 0) + getRevenue(order);
    });

    const salesCanvas = document.getElementById("salesChart");
    const categoryCanvas = document.getElementById("categoryChart");

    if (!salesCanvas || !categoryCanvas) return;

    if (salesChart) salesChart.destroy();
    if (categoryChart) categoryChart.destroy();

    salesChart = new Chart(salesCanvas, {
        type: "bar",
        data: {
            labels: Object.keys(monthlySales),
            datasets: [{
                label: "Sales Revenue (₹)",
                data: Object.values(monthlySales),
                backgroundColor: "#4776e6",
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => money(context.raw)
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value =>
                            "₹" + Number(value).toLocaleString("en-IN")
                    }
                }
            }
        }
    });

    categoryChart = new Chart(categoryCanvas, {
        type: "doughnut",
        data: {
            labels: Object.keys(categorySales),
            datasets: [{
                label: "Sales by Category",
                data: Object.values(categorySales),
                backgroundColor: ["#4776e6", "#12b886", "#ffb020", "#e64980", "#7950f2"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false
        }
    });
}

function renderDashboard() {
    updateSummary();
    renderTable();
    renderCharts();
}

function addOrder() {
    const product = prompt("Enter product name:");
    if (product === null) return;

    if (!product.trim()) {
        alert("Product name cannot be empty.");
        return;
    }

    const quantity = Number(prompt("Enter quantity:"));
    if (!Number.isInteger(quantity) || quantity <= 0) {
        alert("Quantity must be a positive whole number.");
        return;
    }

    const price = Number(prompt("Enter selling price per item (₹):"));
    if (!Number.isFinite(price) || price <= 0) {
        alert("Selling price must be greater than zero.");
        return;
    }

    const cost = Number(prompt("Enter product cost per item (₹):"));
    if (!Number.isFinite(cost) || cost < 0) {
        alert("Product cost cannot be negative.");
        return;
    }

    const expense = Number(prompt("Enter additional order expenses (₹):"));
    if (!Number.isFinite(expense) || expense < 0) {
        alert("Additional expenses cannot be negative.");
        return;
    }

    const category = prompt("Enter category (Electronics/Furniture/Accessories):");
    if (category === null || !category.trim()) {
        alert("Please enter a category.");
        return;
    }

    const region = prompt("Enter region (East/West/North/South):");
    if (region === null || !region.trim()) {
        alert("Please enter a region.");
        return;
    }

    orders.push({
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        product: product.trim(),
        category: category.trim(),
        region: region.trim(),
        quantity,
        price,
        cost,
        expense
    });

    saveOrders();
    renderDashboard();
    alert("Order added successfully!");
}

document.getElementById("addOrderBtn").addEventListener("click", addOrder);
document.getElementById("searchInput").addEventListener("input", renderTable);

renderDashboard();
