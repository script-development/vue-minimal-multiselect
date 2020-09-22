/**
 * @typedef {import('vue').CreateElement} CreateElement
 */

var index = {
    name: 'minimal-multiselect',
    props: {
        valueField: {
            type: String,
            required: false,
            default: 'id',
        },
        textField: {
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
        value: {
            type: Array,
            required: true,
        },
        noResults: {
            type: String,
            required: false,
            default: 'Option not found, press enter to add',
        },
        optionsLimit: {
            type: Number,
            default: 1000,
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
            const selectedAmount = this.value.length;

            if (!this.findOption && !selectedAmount) return this.options.slice(0, this.optionsLimit);

            const search = this.findOption.toLowerCase();

            return this.options.reduce((acc, option) => {
                if (acc.length >= this.optionsLimit) return acc;
                if (search && option[this.textField].toLowerCase().indexOf(search) === -1) return acc;
                if (selectedAmount && this.value.indexOf(option[this.valueField]) !== -1) return acc;
                acc.push(option);
                return acc;
            }, []);
        },
    },
    methods: {
        pickOption(option) {
            this.$emit('input', [...this.value, option[this.valueField]]);
            this.clearDropdown();
        },
        addOption() {
            // If the option is already added, don't add it again
            if (this.value.findIndex(option => option[this.textField] === this.findOption) !== -1) return;

            if (this.$listeners.create) {
                this.$emit('create', this.findOption);
            } else {
                this.$emit('input', [...this.value, {[this.textField]: this.findOption}]);
            }
            this.clearDropdown();
        },
        removeOption(optionValue) {
            this.$emit(
                'input',
                this.value.filter(value => value !== optionValue)
            );
            this.clearDropdown();
        },
        clearDropdown() {
            this.dropDownEnabled = false;
            this.findOption = '';
        },
        inputEnter() {
            const filteredOptionsLength = this.filteredOptions.length;

            if (!filteredOptionsLength) return this.addOption();
            if (filteredOptionsLength === 1) return this.pickOption(this.filteredOptions[0]);
        },
    },

    /** @param {CreateElement} h */
    render(h) {
        const select = h('div', {
            class: 'multiselect__select',
            on: {
                click: () => {
                    if (this.dropDownEnabled) return this.clearDropdown();
                    this.dropDownEnabled = true;
                },
            },
        });

        const tagsWrap = h('div', {class: 'multiselect__tags-wrap'}, [
            this.value.map(optionValue => {
                const option = this.options.find(option => option[this.valueField] === optionValue);
                const optionText = option ? option[this.textField] : optionValue[this.textField];

                // using optionText as key, big assumption that those are unique
                return h('span', {class: 'multiselect__tag', key: optionText}, [
                    h('span', [optionText]),
                    h('i', {
                        class: 'multiselect__tag-icon',
                        attrs: {'aria-hidden': 'true'},
                        on: {
                            mousedown: () => this.removeOption(optionValue),
                        },
                    }),
                ]);
            }),
        ]);

        const searchField = h('input', {
            class: 'multiselect__input',
            attrs: {
                placeholder: this.placeholder,
                value: this.findOption,
                style: this.dropDownEnabled ? 'width:100%;' : 'width: 0px; position:absolute; padding:0px;',
            },
            on: {
                input: event => (this.findOption = event.target.value),
                keypress: event => {
                    if (event.keyCode == 13) {
                        // keyCode 13 is enter key
                        event.preventDefault();
                        this.inputEnter();
                    }
                },
            },
        });

        if (this.dropDownEnabled) {
            this.$nextTick(() => {
                // TODO :: find a way to make this work gracefully
                // TODO :: make it reach the else for tests, for now
                if (!this.findOption) searchField.elm.value = '';
                // TODO :: find a way to focus only on opening
                searchField.elm.focus();
            });
        }

        const tagChildren = [tagsWrap, searchField];

        if (!this.dropDownEnabled && !this.value.length) {
            tagChildren.push(h('span', {class: 'multiselect__placeholder'}, [this.placeholder]));
        }

        const tags = h(
            'div',
            {
                class: 'multiselect__tags',
                on: {
                    click: () => (this.dropDownEnabled = true),
                    focusout: () => {
                        // TODO :: this does not work, should focus or blur somewhere else
                        setTimeout(this.clearDropdown, 200);
                    },
                },
            },
            tagChildren
        );

        const optionItems = this.filteredOptions.map(option =>
            h(
                'li',
                {
                    class: 'multiselect__element',
                    key: option[this.valueField],
                    on: {click: () => this.pickOption(option)},
                },
                [h('span', {class: 'multiselect__option'}, [option[this.textField]])]
            )
        );
        optionItems.push(
            h(
                'li',
                {
                    attrs: {
                        style: this.filteredOptions.length || !this.findOption ? 'display:none;' : 'cursor: pointer;',
                    },
                    on: {click: () => this.addOption()},
                },
                [h('span', {class: 'multiselect__option'}, [this.noResults])]
            )
        );

        const options = h('ul', {class: 'multiselect__content', attrs: {style: 'display:inline-block'}}, optionItems);

        const optionsWrapper = h(
            'div',
            {
                class: 'multiselect__content-wrapper',
                attrs: {
                    style: this.dropDownEnabled ? 'max-height: 300px;' : 'max-height: 300px; display:none;',
                },
            },
            [options]
        );

        return h(
            'div',
            {
                class: this.dropDownEnabled ? 'multiselect multiselect--active' : 'multiselect',
            },
            [select, tags, optionsWrapper]
        );
    },
};

export default index;
