import Vue from 'vue';
import MinimalMultiselect from '../dist/index.esm';
import Multiselect from 'vue-multiselect';

const options = [
    {id: 1, name: 'python'},
    {id: 2, name: 'php'},
];

new Vue({
    data: {
        minimalSelected: [],
        selected: [],
    },
    render(h) {
        const minimalMulti = h(MinimalMultiselect, {
            props: {options, value: this.minimalSelected, placeholder: 'pick an option'},
            on: {input: options => (this.minimalSelected = options)},
        });

        const multi = h(Multiselect, {
            props: {options, value: this.selected, trackBy: 'id', label: 'name', multiple: true},
            on: {input: options => (this.selected = options)},
        });
        return h('div', [minimalMulti, multi]);
    },
}).$mount('#app');
