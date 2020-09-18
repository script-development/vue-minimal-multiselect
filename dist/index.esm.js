var multiselectoptions = {
    name: 'multiselectoptions',
    props: {
        options: {
            type: Array,
            required: true,
        },
    },
    render(h) {
        let renderedOptions = this.options.sort().map(option =>
            h(
                'li',
                {
                    attrs: {class: 'multiselect__element', style: 'cursor: pointer'},
                    on: {click: () => this.$parent.selectOption(option)},
                },
                [
                    h(
                        'span',
                        {
                            attrs: {
                                class: 'multiselect__option',
                            },
                        },
                        option.name
                    ),
                ]
            )
        );

        if (this.$parent.dropDownEnabled && this.$parent.filteredOptions.length) {
            return h(
                'div',
                {
                    attrs: {
                        class: 'multiselect__content-wrapper',
                        style: 'max-height: 200px;',
                    },
                },
                [
                    h(
                        'ul',
                        {
                            attrs: {
                                class: 'multiselect__content',
                                style: 'display: inline-block;',
                            },
                        },
                        renderedOptions
                    ),
                ]
            );
        }

        if (this.$parent.dropDownEnabled && !this.$parent.filteredOptions.length) {
            return h(
                'div',
                {
                    attrs: {
                        class: 'multiselect__content-wrapper',
                        style: 'max-height: 200px;',
                    },
                },
                [
                    h(
                        'div',
                        {
                            attrs: {
                                class: 'multiselect__content',
                                style: 'display: inline-block;',
                            },
                        },
                        [h('span', [this.$parent.noResults])]
                    ),
                ]
            );
        }
    },
};

var multiselect_selectedoptions = {
    name: 'multiselect_selectedoptions',
    props: {
        options: {
            type: Array,
            required: false,
            default: () => [],
        },
        selected: {
            type: Array,
            required: true,
        },
    },

    render(h) {
        const allSelectedOptions = this.selected.map(selectedOption =>
            this.options.find(option => option.id == selectedOption)
        );
        const selectedOptions = allSelectedOptions.map(option => [
            h('span', {attrs: {class: 'multiselect__tag'}}, [
                h('span', option[this.$parent.label]),
                h('i', {
                    attrs: {class: 'multiselect__tag-icon'},
                    on: {click: () => this.$parent.removeOption(option)},
                }),
            ]),
        ]);

        if (this.options.length) {
            return h('div', {attrs: {class: 'multiselect__tags'}}, [
                h('div', {attrs: {class: 'multiselect__tags-wrap'}}, selectedOptions),
            ]);
        }
        return;
    },
};

var multiselect_searchfield = {
    name: 'multiselect_searchfield',
    props: {
        placeholder: '',
    },

    render(h) {
        return h('b-row', {on: {blur: () => this.$parent.toggleDropdown}}, [
            h('b-col', [
                h('div', {attrs: {class: 'multiselect__tags'}}, [
                    h(
                        'b-form-input',
                        {
                            on: {
                                input: value => {
                                    this.$parent.findOption = value;
                                },
                                click: this.$parent.toggleDropdown,
                                keypress: event => {
                                    if (event.charCode == 13) {
                                        // charCode 13 is enter key
                                        event.preventDefault();
                                        this.$parent.addOption();
                                    }
                                },
                            },
                            attrs: {
                                placeholder: this.placeholder,
                                id: 'searchField',
                                class: 'multiselect__input',
                            },
                        },
                        h('div', {attrs: {class: 'multiselect__select'}})
                    ),
                ]),
            ]),
        ]);
    },
};

var index = {
    name: 'multiselect',
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
        // TODO :: should also recieve `value`/ selected options
        options: {
            // TODO :: can also be array with objects (maybe even better that it must be an array filled with objects).
            // Like vue-multiselect can handle
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
            default: () => 'Optie niet gevonden, druk op enter om toe te voegen',
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

export default index;
