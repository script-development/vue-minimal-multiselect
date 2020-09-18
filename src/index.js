import multiselectoptions from './multiselectoptions';
import multiselect_selectedoptions from './multiselectselectedoptions';
import multiselect_searchfield from './multiselectsearchfield';

export default {
    name: 'minimal-multiselect',
    props: {
        valueField: {
            type: String,
            required: false,
            default: 'id',
        },
        customtext: {
            type: String,
            required: false,
        },
        label: {
            type: String,
            required: false,
            default: 'name',
        },
        options: {
            type: Array,
            required: true,
        },
        placeholder: {
            type: String,
            required: false,
        },
        selected: {
            type: Array,
            required: true,
        },
        noResults: {
            type: String,
            required: false,
            default: () => 'Option not found, press enter to add',
        },
    },
    data() {
        return {
            findOption: '',
            dropDownEnabled: false,
        };
    },
    computed: {
        filteredOptions() {
            return this.options.filter(option => {
                if (!option[this.label]) option = {[this.label]: option};
                return (
                    option[this.label].toLowerCase().includes(this.findOption.toLowerCase()) &&
                    !this.selected.some(selectedOption => selectedOption[this.valueField] == option[this.valueField])
                );
            });
        },
    },
    methods: {
        addOption() {
            if (this.selected.includes(this.findOption)) {
                return;
            }
            if (!this.findOption.length) {
                return;
            }
            this.$emit('create', this.findOption);
            this.findOption = '';
            document.getElementById('searchField').value = this.findOption;
        },
        selectOption(option) {
            if (this.selected.includes(option)) {
                return;
            }
            this.findOption = '';
            document.getElementById('searchField').value = this.findOption;
            this.options.splice(this.options.indexOf(option));
            this.$emit('tag', [
                ...this.selected.map(option => option[this.valueField] || option),
                option[this.valueField],
            ]);
        },
        removeOption(option) {
            if (!this.options.includes(option)) {
                this.selected.splice(this.selected.indexOf(option), 1);
                return;
            }
            this.filteredOptions.push(option);
            this.selected.splice(this.selected.indexOf(option), 1);
        },
        filterOption(event) {
            this.findOption = event.target.value;
        },
        toggleDropdown() {
            this.dropDownEnabled = !this.dropDownEnabled;
        },
    },

    render(h) {
        let selected = this.selected;
        let options = this.filteredOptions;
        return h(
            'div',
            {
                attrs: {class: 'multiselect', tabindex: '-1'},
                on: {blur: this.toggleDropdown, click: () => this.toggleDropdown},
            },
            [
                h(multiselect_selectedoptions, {
                    props: {selected: selected, options: options},
                }),
                h(multiselect_searchfield, {props: {placeholder: this.placeholder}}),
                h(multiselectoptions, {props: {options: options}}),
            ]
        );
    },
};
