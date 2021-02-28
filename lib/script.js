const Modal = {
    //substituir por toggle()
    open(){
        //abrir modal
        //adiciona class active ao modal
        document.querySelector(".modal-overlay").classList.add("active");
        
    },
    close(){
        //fechar modal
        //remover class active ao modal
        document.querySelector(".modal-overlay").classList.remove("active");
    }
}

// // let transactions = [
//     {
//         id: 1,
//         description: 'Luz',
//         amount: -50000,
//         date: '23/01/2021'
//     },
//     {
//         id: 2,
//         description: 'Website',
//         amount: 500000,
//         date: '23/01/2021'
//     },
//     {
//         id: 3,
//         description: 'Internet',
//         amount: -20000,
//         date: '23/01/2021'
//     }
// ];

const Storage = {
    get(){
       return JSON.parse(localStorage.getItem("dev:finances:transactions")) || [];
    },
    set(transactions){
       localStorage.setItem("dev.finances:transactions",JSON.stringify(transactions));
    }
}

const Transaction = {
    //all: transactions,
    all: Storage.get(), 

    add(transaction){
        Transaction.all.push(transaction)
    },

    remove(index){
        Transaction.all.splice(index,1);
        App.reload();
    },

    incomes(){
        let income = 0;
        
        Transaction.all.forEach(transaction => {
            if(transaction.amount>0) income+=transaction.amount
        });

        return income
    },
    expenses(){
        let expense = 0;
        
        Transaction.all.forEach(transaction => {
            if(transaction.amount<0) expense+=transaction.amount
        });

        return expense
    },
    total(){
        return Transaction.expenses()+Transaction.incomes();
    }
}

const DOM = {
    transactionContainer: document.querySelector("#data-table tbody"),
    addTransaction(transaction,index){
        const tr = document.createElement("tr");
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        DOM.transactionContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const CSSClass = (transaction.amount>0)?"income":"expense";

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
            <td class="descripopn">${transaction.description}</td>
            <td class="${CSSClass}"> ${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt=""></td>                      
        `;

        return html;
    },

    updateBalance(){
        document.querySelector("#incomeDisplay").innerHTML= Utils.formatCurrency(Transaction.incomes());
        document.querySelector("#expenseDisplay").innerHTML= Utils.formatCurrency(Transaction.expenses());
        document.querySelector("#totalDisplay").innerHTML= Utils.formatCurrency(Transaction.total());
    },

    clearTransaction(){
        DOM.transactionContainer.innerHTML = "";
    }


} 

const Utils = {
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : "";

        //Substitui tudo oque não for numero por ""
        value = String(value).replace(/\D/g, "");

        value = (Number(value) / 100).toLocaleString(
            "pt-br",{
            style: "currency",
            currency: "BRL"
            }
        );

        return `${signal} ${value}`;
    },

    formatAmount(value){
        value = Number(value)*100;
        //console.log(value);
        return value;
    },

    formatDate(date){
        const splitedDate = date.split("-")
        console.log(splitedDate)
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
    }

}

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues(){
        return {
            description: Form.description.value, 
            amount: Form.amount.value, 
            date: Form.date.value
        }
    },

    formatValues(){
        let {description, amount, date} = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);

        return{
            description,
            amount,
            date
        }
    },

    validateFields(){
        const {description, amount, date} = Form.getValues();

        if(description.trim()==="" || amount.trim()==="" || date.trim()===""){
            throw new Error("Por favor, preencha todos os campos.");
        }
    },

    clearFields(){
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event){
        event.preventDefault();

        try{
            //verificar se os campos são válidos
           Form.validateFields();
           //resgatar dados formatados
           const transaction = Form.formatValues();
           //adicionar transação
           Transaction.add(transaction);
           //limpar os campos
           Form.clearFields();
           //fecha modal
           Modal.close();   
           //atualiza as informações da tabela
           App.reload();
        }catch(error){
           alert(error.message)
        }

    }
}


//Guardar os dados no armazenamento local do navegador
// const Storage = {
//      get(){
//         JSON.parse(localStorage.getItem("dev:finances:transactions")) || [];
//      },
//      set(transactions){
//         localStorage.setItem("dev.finances:transactions",JSON.stringify(transactions));
//      }
// }

Storage.get();




const App = {
    init() {
        Transaction.all.forEach(transaction=>{
            DOM.addTransaction(transaction)
        });

        DOM.updateBalance();

        Storage.set(Transaction.all)

        //  Transaction.add(
        //     {
        //         description: "Vendas da semana",
        //         amount     : 500000,
        //         date       : "21/02/2021"
        //     }
        //  )
    },

    reload(){
        DOM.clearTransaction();
        App.init();
    }
}

DOM.updateBalance();

App.init()

