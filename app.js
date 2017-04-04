
var budgetController = (function(){
	var Expense = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	Expense.prototype.calc = function(totalIncome){
		if (totalIncome > 0) 
		{
			this.percentage = Math.round((this.value / totalIncome) *100);
		}
		else
		{
			this.percentage = -1;
		}
	};
	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};
	var Income = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
	};
	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(current){
			sum += current.value;
		});
		data.total[type] = sum;
	};
	var data ={
		allItems:{
			exp: [],
			inc: []
		},
		total:{
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};
	return{
		addItem : function(type,description,value){
			var newItem,ID;
			//Create a new unique ID
			if (data.allItems[type].length > 0)
			{
				ID = data.allItems[type][data.allItems[type].length -1].id + 1;
			}
			else
			{
				ID = 0;
			}
			if (type ==='exp') 
			{
				newItem = new Expense(ID, description,parseFloat(value));
			}
			else if (type ==='inc') 
			{
				newItem = new Income(ID,description,parseFloat(value));
			}

			data.allItems[type].push(newItem);
			return newItem;
		},
		deleteItem: function(type,ID){

			var ids, index;
			ids = data.allItems[type].map(function(current){
				return current.id;
			});

			index = ids.indexOf(ID);
			if(index !== -1 )
			{
				data.allItems[type].splice(index, 1);
			}
		},
		calculateBudget: function(){
			calculateTotal('exp');
			calculateTotal('inc');

			data.budget = data.total.inc - data.total.exp;

			if (data.allItems.inc.length > 0)
			{
				data.percentage = Math.round((data.total.exp / data.total.inc)*100);
			}
			else
			{
				data.percentage = -1;
			}
		},
		calculatePercentages: function(){
			data.allItems.exp.forEach(function(current){
				current.calc(data.total.inc);
			});
		},
		getPercentages: function(){
			var allPercentages;
			allPercentages = data.allItems.exp.map(function(current){
				return current.getPercentage();
			});

			return allPercentages;
		},
		getBudget: function(){
			return {
				budget: data.budget,
				totalIncome: data.total.inc,
				totalExpenses: data.total.exp,
				percentage: data.percentage

			};
		}
	};
})();



var UIController = (function(){

	var DOMStrings ={
		inputType : '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtnnAdd:'.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel:'.budget__income--value',
		expensesLabel:'.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container : '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function(type,num){
			var numSplit, int,dec,type;

			num = Math.abs(num);
			num = num.toFixed(2);

			numSplit = num.split('.');

			int = numSplit[0];

			if(int.length > 3)
			{
				int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
			}
			dec = numSplit[1];

			return (type ==='exp' ? '-':'+') + ' ' + int + '.' + dec;
	};
	var nodeListForEach = function(list,callback){
		for (var i = 0; i < list.length; i++) 
		{
			callback(list[i],i);
		}
	};
	return {
		getInput: function(){

			return {
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: document.querySelector(DOMStrings.inputValue).value, //Needs to pass to int
				type: document.querySelector(DOMStrings.inputType).value
			};
			
		},
		addListItem: function(obj,type){
			var html,newHTML,element;
			if(type === 'inc')
			{
				element = DOMStrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			else
			{
				element = DOMStrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			newHTML = html.replace('%id%',obj.id);
			newHTML = newHTML.replace('%description%',obj.description);
			newHTML = newHTML.replace('%value%', formatNumber(type,obj.value));
			
			document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);
		},
		deleteListItem: function(selectorID){
			var element;
			element = document.getElementById(selectorID);
			element.parentNode.removeChild(element);

		},
		clearFields: function(){
			var fields,fieldsArray;
			fields = document.querySelectorAll(DOMStrings.inputDescription + ', '+ DOMStrings.inputValue);
			fieldsArray = Array.prototype.slice.call(fields);

			fieldsArray.forEach(function(current,index,array){
				current.value ="";
			});
			fieldsArray[0].focus();
		},
		getDOMStrings: function(){
			return DOMStrings;
		},
		displayBudget: function(obj){
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(type,obj.budget);
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber('inc',obj.totalIncome);
			document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber('exp',obj.totalExpenses);
			if(obj.percentage <= 0)
			{
				document.querySelector(DOMStrings.percentageLabel).textContent = '';
			}
			else
			{
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
			}
			
		},
		displayPercentages: function(percentages){
			var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
			nodeListForEach(fields,function(current,index){
				if(percentages[index] > 0 )
					current.textContent = percentages[index] + '%';
				else
					current.textContent = '---';
			});
		},

		displayMonth: function(){
			var now,year,month,months;
			now = new Date ()

			months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
			month = now.getMonth();

			year= now.getFullYear();
			document.querySelector(DOMStrings.dateLabel).textContent = months[month]+ ' ' +year;
		},
		changeType: function(){
			var fields = document.querySelectorAll(
				DOMStrings.inputType + ','+
				DOMStrings.inputDescription +','+
				DOMStrings.inputValue);

			nodeListForEach(fields,function(current){
				current.classList.toggle('red-focus');
			});

			document.querySelector(DOMStrings.inputBtnnAdd).classList.toggle('red');
		}
	};
})();



var controller = (function(budgetCtrl,UICtrl){

	var updateBudget = function(){
		var budget;
		budgetCtrl.calculateBudget();
		budget = budgetCtrl.getBudget();

		UICtrl.displayBudget(budget);

	};
	var updatePercentages = function(){
		var percentages;
		//1) calcular porcentajes
		budgetCtrl.calculatePercentages();
		//2) Leer los porcentajes del budget controller
		percentages = budgetCtrl.getPercentages();
		//3) Updatear y desplegar
		UICtrl.displayPercentages(percentages);
	};
	var ctrlAddItem = function(){
		var input, newItem;
		input = UICtrl.getInput();

		if(input.description!== "" && !isNaN(input.value) && input.value > 0)
		{
			newItem = budgetCtrl.addItem(input.type,input.description,input.value);

			UICtrl.addListItem(newItem,input.type);
			UICtrl.clearFields();

			updateBudget();
			updatePercentages();
		}

	};
	var ctrlDeleteItem = function(event){
		var itemID,splidID, type,ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) 
		{
			splidID = itemID.split('-');
			type = splidID[0];
			ID = splidID [1];
			// 1) Delete from the budget
			budgetCtrl.deleteItem(type,parseInt(ID));
			// 2) Delete from de DOM

			UICtrl.deleteListItem(itemID);
			// 3) Update the & display Budget
			updateBudget();
			updatePercentages();
		}
	};

	var setUpEventListener = function(){
		var DOM = UICtrl.getDOMStrings();
		document.querySelector(DOM.inputBtnnAdd).addEventListener('click',ctrlAddItem);
		document.addEventListener('keypress',function(event){
			if (event.keyCode === 13 || event.which === 13)
			{
				ctrlAddItem();
			}
		});
		document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType);
	};

	return {
		init: function(){
			console.log('Come on');
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0.,
				totalIncome: 0,
				totalExpenses: 0,
				percentage: 0
			})
			setUpEventListener();
		}
	};
	
})(budgetController,UIController);


controller.init();



