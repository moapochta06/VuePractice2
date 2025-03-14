Vue.component('cardForm', {
     template: `
        <form class="card-form" @submit.prevent="onSubmit">
            <p v-if="error">{{ error }}</p>
            <input type="text" v-model="note" placeholder="Напишите заметку">
            <div v-for="(task,index) in tasks" :key="index">
                <input type="text" v-model="task.text" :placeholder="'Введите задачу'">
            </div>
            <button type="button" @click="addTask">Добавить задачу</button>
            <button type="submit">Сохранить</button>

        </form>
     `,
     data(){
        return{
            note:null,
            tasks: [],
            error: null,
            createTask: false
        }
     },
     methods:{
        onSubmit(){
            if(this.note ){
                let cardData = {
                    note: this.note,
                    tasks: this.tasks
                }
                this.cardSubmitted(cardData); 
            } else {
                if(!this.note) this.error = "Ввеите заметку"
            }
        },
        cardSubmitted(cardData){
            this.$emit('card-submitted', cardData)
        },
        
        addTask() {
            this.tasks.push({text:'',completed:false})
        }
        
     }
})

Vue.component('card', {
    props:{
        card:{
            type: Object,
            required: true
        }
    },
    template:`
    <div class="card">
        <h3>{{ card.note }}</h3>
        <ul>
            <li v-for="(task, index) in card.tasks" :key="index"  :class="{ 'completed': task.completed }"  class="task-item">
                <input type="checkbox" v-model="task.completed" >
                {{ task.text }}
            </li>
        </ul>
    </div>
    `,
})

Vue.component('board', {
    template: `
        <div class="columns-container">
            <div class="board" v-for="(column, key) in columns">
                <div v-if="key == 'column1'">
                    <button @click="showForm(key)">Создать заметку</button>
                    <card-form v-if="activeColumn == key" @card-submitted="addCard"></card-form>
                    <card v-for="(card, cardKey) in column" :key="cardKey" :card="card"></card>
                </div>
            </div>
        </div>
    `,
    data() {
        return{
            columns:{
                column1: [],
                column2: [],
                column3: [],
            },
            activeColumn: null,
            cardsLimit:{
                maxColumn1: 3,
                maxColumn2: 5,
                maxColumn3: Infinity
            },
            isLocked: false,
        }
    },
    methods:{ 
        showForm(columnKey) {
            this.activeColumn = columnKey;
          },
        addCard(cardData) {
            this.columns[this.activeColumn].unshift(cardData);
            this.activeColumn = null; // Скрыть форму после добавления карточки
        }
    }
    
  });
  let app = new Vue({
        el: '#app',
  })

