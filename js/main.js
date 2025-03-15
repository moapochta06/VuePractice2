Vue.component('cardForm', {
    template: `
        <form class="card-form" @submit.prevent="onSubmit">
            <div class="errors" v-for="error in errors">{{ error }}</div>
            <input type="text" v-model="note" placeholder="Напишите заметку">
            <div v-for="(task, index) in tasks" :key="index">
                <input type="text" v-model="task.text" :placeholder="'Введите задачу'">
            </div>
            <button type="button" @click="addTask">Добавить задачу +</button>
            <button type="submit" class="btn-save">Сохранить</button>
        </form>
    `,
    data() {
        return {
            note: null,
            tasks: [
                { text:''},
                { text:''},
                { text:''}
            ],
            errors: []
        }
    },
    computed: {
        emptyTasks() {
            return this.tasks.filter(task => task.text.trim() == '');
        }
    },
    methods: {
        onSubmit() {
            this.errors = [];
            if (this.note && this.tasks.length >= 3 && this.emptyTasks.length == 0) {
                let cardData = {
                    note: this.note,
                    tasks: this.tasks
                }
                this.$emit('card-submitted', cardData);
            } else {
                if (this.emptyTasks.length > 0) this.errors.push("Задачи не могут быть пустыми!");
                if (!this.note) this.errors.push("Введите заметку!");
                if (this.tasks.length < 3) this.errors.push("Введите хотя бы 3 задачи!");
            }
        },
        addTask() {
            this.errors = [];
            if (this.tasks.length < 5) {

                const newTask = {text:''};

                if (this.emptyTasks.length == 0) {
                    this.tasks.push(newTask);
                } else {
                    this.errors.push("Задачи не могут быть пустыми!");
                }
            } else {
                this.errors.push("Задач должно быть не больше 5!");
            }
        }
    }
});

Vue.component('card', {
    props: {
        card: {
            type: Object,
            required: true
        }
    },
    template: `
        <div class="card">
            <h3>{{ card.note }}</h3>
            <ul>
                <li v-for="(task, index) in card.tasks" :key="index" :class="{ 'completed': task.completed }" class="task-item">
                    <input type="checkbox" v-model="task.completed" @change="checkProgress">
                    {{ task.text }}
                </li>
            </ul>
        </div>
    `,
    methods: {
        checkProgress() {
            const completedTasks = this.card.tasks.filter(task => task.completed).length;
            const allTasks = this.card.tasks.length;
            const progress = (completedTasks / allTasks) * 100;

            if (progress >= 50 && progress < 100) {
                this.$emit('move-card', { card: this.card, targetColumn: 'column2' }); // переместить в колонку 2
            } else if (progress === 100) {
                this.$emit('move-card', { card: this.card, targetColumn: 'column3' }); // переместить в колонку 3
            }
        }
    }
});

Vue.component('column', {
    props: {
        title: {
            type: String,
            required: true
        },
        maxCards: {
            type: Number,
            required: true
        },
        cards: {
            type: Array,
            required: true
        }
    },
    template: `
        <div class="column">
            <h2>{{ title }}</h2>
            <button v-if="title == ''" @click="showForm">Создать заметку +</button>
            <card-form v-if="isFormVisible" @card-submitted="addCard"></card-form>
            <card v-for="(card, index) in cards" :key="index" :card="card" @move-card="moveCard"></card>
        </div>
    `,
    data() {
        return {
            isFormVisible: false
        }
    },
    methods: {
        showForm() {
            this.isFormVisible = true;
        },
        addCard(cardData) {
            if (this.cards.length < this.maxCards) {
                this.$emit('added-card', cardData); // сообщение родителю о новой карточке
                this.isFormVisible = false;
            } else {
                alert(`Максимальное количество карточек в этой колонке: ${this.maxCards}`);
            }
        },
        moveCard(moveData) {
            this.$emit('move-card', moveData); // сообщение нужно переместить карточку
        }
    }
});

Vue.component('board', {
    template: `
        <div class="columns-container">
            <column 
                title="" 
                :maxCards="3" 
                :cards="column1Cards" 
                @added-card="addCardToColumn1"
                @move-card="moveCard"
            ></column>
            <column 
                title="В работе" 
                :maxCards="5" 
                :cards="column2Cards" 
                @move-card="moveCard"
            ></column>
            <column 
                title="Завершено" 
                :cards="column3Cards"
            ></column>
        </div>
    `,
    data() {
        return {
            column1Cards: [],
            column2Cards: [],
            column3Cards: []
        }
    },
    methods: {
        addCardToColumn1(cardData) {
            this.column1Cards.unshift(cardData); // добавление карточки в первую колонку
        },
        moveCard({ card, targetColumn }) {
            // удаление карточки из текущей колонки
            this.column1Cards = this.column1Cards.filter(c => c !== card);
            this.column2Cards = this.column2Cards.filter(c => c !== card);
            this.column3Cards = this.column3Cards.filter(c => c !== card);

            // добавление в целевую колонку
            if (targetColumn === 'column2') {
                this.column2Cards.push(card);
            } else if (targetColumn === 'column3') {
                this.column3Cards.push(card);
            }
        }
    }
});

let app = new Vue({
    el: '#app'
});
