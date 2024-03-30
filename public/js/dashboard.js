document.addEventListener('DOMContentLoaded', () => {
    const addCategoryBtn = document.getElementById('add-category-btn');
    const newCategoryNameInput = document.getElementById('new-category-name');
    const budgetCategoriesDiv = document.getElementById('budget-categories');
    const goalCategoriesDivLeft = document.getElementById('goal-categories-left');
    const goalCategoriesDivRight = document.getElementById('goal-categories-right');

    //grabbing the myChart id from the HTML, and having it render as a '2d' since it is a chart- tb
    const chartCanvas = document.getElementById('myChart').getContext('2d');

    //added empty arrays for category and budget names. -tb
    let categoryNames = []
    let categoryBudgets = []
    //myChart will be let null -tb
    let myChart;

    //using function to prevent a another from replacing the category/budget chart
    //this is so no other chart interferes with it -tb
    function initializeChart() {
        if (myChart) {
            myChart.destroy();
        }

        //created a new chart using chart.js and making the chart a pie chart for budget/categories -tb
        myChart = new Chart(chartCanvas, {
            type: 'pie',
            data: {
                //the labels on the chart will display the category the user types in. -tb
                labels: categoryNames,
                datasets: [{
                    //taking data from the budget data -tb
                    label: 'Budget',
                    data: categoryBudgets,
                    //attributes for pie chart -tb 
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2
                }]
            },
            //added options to chart
            options: {
                //both the x and y axis will start at 0, so the user can enter a number that is >=0
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    function categoryExists(categoryName) {
        return !!document.querySelector(`[data-category="${categoryName.toLowerCase()}"]`);
    }

    function formatInputValue(inputElement) {
        if (inputElement) {
            inputElement.addEventListener('blur', () => {
                let value = parseFloat(inputElement.value);
                if (!isNaN(value)) {
                    inputElement.value = value.toFixed(2);
                }
            });
        }
    }

    //added budget = 0 when the user adds a new category so the new category is default starting off a 0. -tb
    function addNewCategory(categoryName, isDefault = false, budget = 0) {
        categoryName = capitalizeFirstLetter(categoryName);
        if (!isDefault && categoryExists(categoryName)) {
            alert('Category already exists.');
            return;
        }

        // User is expected to type in a number but if they do not, the budget will be put in as zero -tb
        // parseInt will turn a string into a whole number when the user types in the budget -tb
        budget = parseInt(budget);
        //however, if the user's entry does not end up turning into a whole number using parseInt, the budget will automatically start at 0 -tb
        if (isNaN(budget)) {
            budget = 0;
        }

        //if successful (or not), push the name as well as the budget amount -tb
        categoryNames.push(categoryName);
        categoryBudgets.push(budget);

        const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
        // added the value of the budget to be placed into the input field AND have it a fixed number using two decimal places so the user can see a whole number -tb
        const categoryHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2 category-item" data-category="${categoryId}">
                <label class="form-label">${categoryName}:</label>
                <div class="input-group">
                    <span class="input-group-text" style="color:#793842; font-weight:600;">$</span>
                    <input type="text" class="form-control money-input" placeholder="0.00" value="${budget.toFixed(2)}">
                    <button class="btn remove-category-btn" aria-label="Remove category">
                        <i class="fas fa-times" style="color:red;"></i>
                    </button>
                </div>
            </div>`;

        budgetCategoriesDiv.insertAdjacentHTML('beforeend', categoryHTML);

        //creating a budget input field from the HTML -tb
        //uses budgetCategoriesDiv HTML -tb
        //grabs classes data-category and its categoryId template, and money-input -tb
        const newBudgetInput = budgetCategoriesDiv.querySelector(`[data-category="${categoryId}"] .money-input`);
        //function for addEventListener for when the user types into the input field -tb
        newBudgetInput.addEventListener('input', () => {
             //variable for finding the category name
             //used indexOf to search for the element in the array
             //uses capitalizeFirstLetter so it matches the the same category name once it was added to the array, which also has a capital first letter- tb
            const index = categoryNames.indexOf(capitalizeFirstLetter(categoryName));
            //if NO element(category name) is found via indexOf, it returns -1. -tb
            // However, if the category name is found, the category budget will be updated with the user entry-tb
            //a parseInt is used to ensure the user entry converts to a whole number -tb
            //if it does not convert to a whole number, the entry will be 0 instead -tb
            if (index > -1) {
                categoryBudgets[index] = parseInt(newBudgetInput.value) || 0;
                //the chart function is called -tb
                initializeChart();
            }
        });
        if (goalCategoriesDivLeft.childElementCount <= goalCategoriesDivRight.childElementCount) {
            goalCategoriesDivLeft.insertAdjacentHTML('beforeend', categoryHTML);
        } else {
            goalCategoriesDivRight.insertAdjacentHTML('beforeend', categoryHTML);
        }

        document.querySelectorAll('.money-input').forEach(input => formatInputValue(input));

        attachRemoveEventListeners();
        //added the chart function to be called -tb
        initializeChart();
    }

    function attachRemoveEventListeners() {
        document.querySelectorAll('.remove-category-btn').forEach(button => {
            button.removeEventListener('click', removeCategory);
            button.addEventListener('click', removeCategory);
        });
    }

    function removeCategory(event) {
        const categoryItem = event.target.closest('.category-item');
        if (categoryItem) {
            //created variable that grabs the value of the data-category attributes from the data-category class and converts it to lowercase -tb
            //this is to make sure it matches the categoryName that was added to the array -tb
            const categoryName = capitalizeFirstLetter(categoryItem.getAttribute('data-category').toLowerCase());
            //created variable that searches for the categoryName in the categoryNames array -tb
            const index = categoryNames.indexOf(categoryName);
            //if indexOf does not find the category name, it returns -1 -tb
            //if the category name is found, it will be > -1, thus it removes the category name and then removes the budget for the category from the categoryNames array -tb 
            if (index > -1) {
                categoryNames.splice(index, 1);
                categoryBudgets.splice(index, 1);
            }
            //added toLowerCase to the categoryName in the querySelector so it matches what is in the array -tb
            document.querySelectorAll(`[data-category="${categoryName.toLowerCase()}"]`).forEach(el => el.remove());
            //calling the chart -tb
            initializeChart();
        }
    }

    addCategoryBtn.addEventListener('click', () => {
        const categoryName = newCategoryNameInput.value.trim();
        if (categoryName) {
            addNewCategory(categoryName);
            newCategoryNameInput.value = '';
        } else {
            alert('Please enter a category name.');
        }
    });


    ['Housing', 'Groceries', 'Transportation', 'Dining', 'Entertainment', 'Travels'].forEach(category => {
        addNewCategory(category, true);
    });

    attachRemoveEventListeners();
    //calling chart function
    initializeChart();
});
