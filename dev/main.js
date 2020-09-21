import Vue from 'vue';
import MinimalMultiselect from '../dist/index.esm';
import Multiselect from 'vue-multiselect';

const dec2hex = dec => (dec < 10 ? '0' + String(dec) : dec.toString(16));
const generateRandomString = len => Array.from(crypto.getRandomValues(new Uint8Array(len)), dec2hex).join('');

new Vue({
    data: {
        minimalSelected: [],
        selected: [],
        options: [],
        optionsAmount: 10000,
    },
    methods: {
        setOptions() {
            if (this.optionsAmount > this.options.length) {
                for (let id = this.options.length; id < this.optionsAmount; id++) {
                    this.options.push({id, name: generateRandomString(20)});
                }
                return;
            }
            this.options.splice(this.optionsAmount, this.options.length - this.optionsAmount);
        },
    },
    mounted() {
        this.setOptions();
    },
    render(h) {
        const minimalMulti = h(MinimalMultiselect, {
            props: {options: this.options, value: this.minimalSelected, placeholder: 'pick an option'},
            on: {input: options => (this.minimalSelected = options)},
        });

        const multi = h(Multiselect, {
            props: {options: this.options, value: this.selected, trackBy: 'id', label: 'name', multiple: true},
            on: {input: options => (this.selected = options)},
        });

        const inputBlock = h('div', [
            h('input', {
                attrs: {type: 'number', value: this.optionsAmount},
                on: {
                    input: event => {
                        this.optionsAmount = event.target.value;
                        this.setOptions();
                    },
                },
            }),
        ]);
        return h('div', [minimalMulti, multi, inputBlock]);
    },
}).$mount('#app');
